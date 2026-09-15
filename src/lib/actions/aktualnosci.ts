'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq, desc, sql } from 'drizzle-orm';
import { put, del } from '@vercel/blob';
import { db } from '@/lib/db';
import { aktualnosci, aktualnosciPliki } from '@/lib/db/schema';
import { getUserId } from '@/lib/get-user-id';
import { slugify } from '@/lib/slugify';

export async function getAllAktualnosciAdmin() {
  return db.select().from(aktualnosci).orderBy(desc(aktualnosci.createdAt));
}

export async function getPublishedAktualnosci() {
  return db
    .select()
    .from(aktualnosci)
    .where(eq(aktualnosci.published, true))
    .orderBy(desc(aktualnosci.createdAt));
}

function hasPostgresCode(error: unknown, code: string): boolean {
  if (typeof error !== 'object' || error === null) return false;

  if ('code' in error && error.code === code) return true;
  return 'cause' in error && hasPostgresCode(error.cause, code);
}

async function getAktualnoscFiles(aktualnoscId: number) {
  try {
    return await db
      .select()
      .from(aktualnosciPliki)
      .where(eq(aktualnosciPliki.aktualnoscId, aktualnoscId));
  } catch (error) {
    if (hasPostgresCode(error, '42P01')) return [];
    throw error;
  }
}

async function ensureAktualnosciPlikiTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS aktualnosci_pliki (
      id serial PRIMARY KEY,
      "userId" text NOT NULL,
      "aktualnoscId" integer NOT NULL REFERENCES aktualnosci(id) ON DELETE CASCADE,
      name text NOT NULL,
      url text NOT NULL,
      pathname text NOT NULL,
      "createdAt" timestamp NOT NULL DEFAULT now()
    )
  `);
}

export async function getAktualnoscBySlug(slug: string) {
  const [item] = await db
    .select()
    .from(aktualnosci)
    .where(eq(aktualnosci.slug, slug))
    .limit(1);

  if (!item) return null;

  const files = await getAktualnoscFiles(item.id);

  return { ...item, files };
}

export async function getAktualnoscById(id: number) {
  const [item] = await db
    .select()
    .from(aktualnosci)
    .where(eq(aktualnosci.id, id))
    .limit(1);

  if (!item) return null;

  const files = await getAktualnoscFiles(item.id);

  return { ...item, files };
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: number) {
  let slug = baseSlug || 'wpis';
  let suffix = 1;

  while (true) {
    const existing = await db
      .select({ id: aktualnosci.id })
      .from(aktualnosci)
      .where(eq(aktualnosci.slug, slug))
      .limit(1);

    if (existing.length === 0 || existing[0].id === excludeId) {
      return slug;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

function parsePublicationDate(value: FormDataEntryValue | null) {
  const date = String(value ?? '');
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (!match) {
    throw new Error('Data publikacji jest wymagana.');
  }

  const publicationDate = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12)
  );

  if (
    publicationDate.getUTCFullYear() !== Number(match[1]) ||
    publicationDate.getUTCMonth() !== Number(match[2]) - 1 ||
    publicationDate.getUTCDate() !== Number(match[3])
  ) {
    throw new Error('Podaj poprawną datę publikacji.');
  }

  return publicationDate;
}

export async function createAktualnosc(formData: FormData) {
  const userId = await getUserId();

  const title = String(formData.get('title') ?? '').trim();
  const excerpt = String(formData.get('excerpt') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();
  const published = formData.get('published') === 'on';
  const publicationDate = parsePublicationDate(formData.get('publicationDate'));
  const coverImageUrl = String(formData.get('coverImageUrl') ?? '').trim() || null;

  if (!title || !content) {
    throw new Error('Tytuł i treść są wymagane.');
  }

  const slug = await ensureUniqueSlug(slugify(title));

  const [created] = await db
    .insert(aktualnosci)
    .values({
      userId,
      slug,
      title,
      excerpt: excerpt || null,
      content,
      coverImageUrl,
      published,
      createdAt: publicationDate,
    })
    .returning({ id: aktualnosci.id });

  revalidatePath('/aktualnosci');
  revalidatePath('/admin/aktualnosci');
  redirect(`/admin/aktualnosci/${created.id}`);
}

export async function updateAktualnosc(id: number, formData: FormData) {
  await getUserId();

  const title = String(formData.get('title') ?? '').trim();
  const excerpt = String(formData.get('excerpt') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();
  const published = formData.get('published') === 'on';
  const publicationDate = parsePublicationDate(formData.get('publicationDate'));
  const uploadedCoverImageUrl = String(formData.get('coverImageUrl') ?? '').trim();

  if (!title || !content) {
    throw new Error('Tytuł i treść są wymagane.');
  }

  const [current] = await db
    .select()
    .from(aktualnosci)
    .where(eq(aktualnosci.id, id))
    .limit(1);

  if (!current) {
    throw new Error('Nie znaleziono wpisu.');
  }

  let slug = current.slug;
  if (slugify(title) !== current.slug) {
    slug = await ensureUniqueSlug(slugify(title), id);
  }

  let coverImageUrl = current.coverImageUrl;
  if (uploadedCoverImageUrl) {
    if (current.coverImageUrl) {
      await del(current.coverImageUrl).catch(() => {});
    }
    coverImageUrl = uploadedCoverImageUrl;
  }

  await db
    .update(aktualnosci)
    .set({
      title,
      slug,
      excerpt: excerpt || null,
      content,
      coverImageUrl,
      published,
      createdAt: publicationDate,
      updatedAt: new Date(),
    })
    .where(eq(aktualnosci.id, id));

  revalidatePath('/aktualnosci');
  revalidatePath(`/aktualnosci/${slug}`);
  revalidatePath('/admin/aktualnosci');
  revalidatePath(`/admin/aktualnosci/${id}`);
}

export async function deleteAktualnosc(id: number) {
  await getUserId();

  const files = await getAktualnoscFiles(id);

  const [item] = await db
    .select()
    .from(aktualnosci)
    .where(eq(aktualnosci.id, id))
    .limit(1);

  await Promise.all(
    files.map((file) => del(file.url).catch(() => {}))
  );

  if (item?.coverImageUrl) {
    await del(item.coverImageUrl).catch(() => {});
  }

  await db.delete(aktualnosci).where(eq(aktualnosci.id, id));

  revalidatePath('/aktualnosci');
  revalidatePath('/admin/aktualnosci');
  redirect('/admin/aktualnosci');
}

export async function addAktualnoscFile(aktualnoscId: number, formData: FormData) {
  const userId = await getUserId();
  await ensureAktualnosciPlikiTable();

  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) {
    throw new Error('Wybierz plik do wgrania.');
  }

  const blob = await put(`aktualnosci/pliki/${aktualnoscId}-${file.name}`, file, {
    access: 'private',
    addRandomSuffix: true,
  });

  await db.insert(aktualnosciPliki).values({
    userId,
    aktualnoscId,
    name: file.name,
    url: blob.url,
    pathname: blob.pathname,
  });

  revalidatePath(`/admin/aktualnosci/${aktualnoscId}`);
  revalidatePath('/aktualnosci');
}

export async function deleteAktualnoscFile(fileId: number, aktualnoscId: number) {
  await getUserId();

  const [file] = await db
    .select()
    .from(aktualnosciPliki)
    .where(eq(aktualnosciPliki.id, fileId))
    .limit(1);

  if (file) {
    await del(file.url).catch(() => {});
    await db.delete(aktualnosciPliki).where(eq(aktualnosciPliki.id, fileId));
  }

  revalidatePath(`/admin/aktualnosci/${aktualnoscId}`);
  revalidatePath('/aktualnosci');
}
