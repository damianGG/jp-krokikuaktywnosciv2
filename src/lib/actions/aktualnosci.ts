'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq, desc, sql } from 'drizzle-orm';
import { put, del } from '@vercel/blob';
import { db } from '@/lib/db';
import { aktualnosci, aktualnosciPliki } from '@/lib/db/schema';
import { getUserId } from '@/lib/get-user-id';
import { slugify } from '@/lib/slugify';
import {
  attachmentMimeType,
  MAX_NEWS_TEXT_SIZE,
  NewsFormState,
  NewsValidationError,
  validateAttachmentSelection,
} from '@/lib/aktualnosci-attachments';

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
    throw new NewsValidationError('Data publikacji jest wymagana.');
  }

  const publicationDate = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12)
  );

  if (
    publicationDate.getUTCFullYear() !== Number(match[1]) ||
    publicationDate.getUTCMonth() !== Number(match[2]) - 1 ||
    publicationDate.getUTCDate() !== Number(match[3])
  ) {
    throw new NewsValidationError('Podaj poprawną datę publikacji.');
  }

  return publicationDate;
}

function parsePost(formData: FormData) {
  const textSize = Array.from(formData.values()).reduce(
    (sum, value) => sum + (typeof value === 'string' ? Buffer.byteLength(value) : 0),
    0
  );
  if (textSize > MAX_NEWS_TEXT_SIZE) {
    throw new NewsValidationError('Treść formularza przekracza limit 1 MB.');
  }
  const title = String(formData.get('title') ?? '').trim();
  const excerpt = String(formData.get('excerpt') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();
  const published = formData.get('published') === 'on';
  const publicationDate = parsePublicationDate(formData.get('publicationDate'));
  const coverImageUrl = String(formData.get('coverImageUrl') ?? '').trim() || null;

  if (!title || !content) {
    throw new NewsValidationError('Tytuł i treść są wymagane.');
  }
  return { title, excerpt: excerpt || null, content, published, createdAt: publicationDate, coverImageUrl };
}

async function validateAttachments(formData: FormData, field = 'attachments') {
  const files: File[] = [];
  for (const entry of formData.getAll(field)) {
    if (typeof entry === 'string') throw new NewsValidationError('Nieprawidłowy załącznik.');
    if (!entry.name && entry.size === 0) continue;
    files.push(entry);
  }
  const error = validateAttachmentSelection(files);
  if (error) throw new NewsValidationError(error);

  for (const file of files) {
    const header = Buffer.from(await file.slice(0, 8).arrayBuffer());
    const mime = attachmentMimeType(file.name);
    const valid = mime === 'application/pdf'
      ? header.subarray(0, 5).equals(Buffer.from('%PDF-'))
      : mime === 'image/png'
        ? header.equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : header.subarray(0, 3).equals(Buffer.from([255, 216, 255]));
    if (!valid) {
      throw new NewsValidationError(`Zawartość pliku „${file.name}” nie odpowiada jego formatowi.`);
    }
  }
  return files;
}

type UploadedAttachment = { name: string; url: string; pathname: string };

async function uploadAttachments(files: File[], uploaded: UploadedAttachment[]) {
  for (const file of files) {
    const extension = file.name.split('.').pop()!.toLowerCase();
    const blob = await put(`aktualnosci/pliki/${crypto.randomUUID()}.${extension}`, file, {
      access: 'private',
      addRandomSuffix: true,
      contentType: attachmentMimeType(file.name),
    });
    uploaded.push({ name: file.name, url: blob.url, pathname: blob.pathname });
  }
}

async function cleanupAttachments(uploaded: UploadedAttachment[]) {
  await Promise.all(uploaded.map((file) => del(file.url).catch(() => {})));
}

function saveError(error: unknown): NewsFormState {
  return {
    error: error instanceof NewsValidationError
      ? error.message
      : 'Nie udało się zapisać wpisu i załączników. Spróbuj ponownie.',
  };
}

export async function createAktualnosc(formData: FormData): Promise<NewsFormState> {
  const userId = await getUserId();
  const uploaded: UploadedAttachment[] = [];
  let id: number;
  try {
    const post = parsePost(formData);
    const files = await validateAttachments(formData);
    const slug = await ensureUniqueSlug(slugify(post.title));
    if (files.length) await ensureAktualnosciPlikiTable();
    await uploadAttachments(files, uploaded);
    id = await db.transaction(async (tx) => {
      const [created] = await tx.insert(aktualnosci).values({ ...post, userId, slug })
        .returning({ id: aktualnosci.id });
      if (uploaded.length) {
        await tx.insert(aktualnosciPliki).values(
          uploaded.map((file) => ({ ...file, userId, aktualnoscId: created.id }))
        );
      }
      return created.id;
    });
  } catch (error) {
    await cleanupAttachments(uploaded);
    return saveError(error);
  }

  revalidatePath('/aktualnosci');
  revalidatePath('/admin/aktualnosci');
  redirect(`/admin/aktualnosci/${id}`);
}

export async function updateAktualnosc(id: number, formData: FormData): Promise<NewsFormState> {
  const userId = await getUserId();
  const uploaded: UploadedAttachment[] = [];
  let slug: string;
  let oldSlug: string;
  let oldCoverToDelete: string | null = null;
  try {
    const post = parsePost(formData);
    const files = await validateAttachments(formData);
    const [current] = await db.select().from(aktualnosci)
      .where(eq(aktualnosci.id, id)).limit(1);
    if (!current) throw new NewsValidationError('Nie znaleziono wpisu.');
    oldSlug = current.slug;
    slug = await ensureUniqueSlug(slugify(post.title), id);
    if (files.length) await ensureAktualnosciPlikiTable();
    await uploadAttachments(files, uploaded);
    await db.transaction(async (tx) => {
      const updated = await tx.update(aktualnosci).set({
        ...post,
        slug,
        coverImageUrl: post.coverImageUrl || current.coverImageUrl,
        updatedAt: new Date(),
      }).where(eq(aktualnosci.id, id)).returning({ id: aktualnosci.id });
      if (!updated.length) throw new NewsValidationError('Nie znaleziono wpisu.');
      if (uploaded.length) {
        await tx.insert(aktualnosciPliki).values(
          uploaded.map((file) => ({ ...file, userId, aktualnoscId: id }))
        );
      }
    });
    if (post.coverImageUrl && post.coverImageUrl !== current.coverImageUrl) {
      oldCoverToDelete = current.coverImageUrl;
    }
  } catch (error) {
    await cleanupAttachments(uploaded);
    return saveError(error);
  }
  if (oldCoverToDelete) await del(oldCoverToDelete).catch(() => {});
  revalidatePath('/aktualnosci');
  revalidatePath(`/aktualnosci/${oldSlug}`);
  revalidatePath(`/aktualnosci/${slug}`);
  revalidatePath('/admin/aktualnosci');
  revalidatePath(`/admin/aktualnosci/${id}`);
  return { success: 'Zapisano wpis i załączniki.' };
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
  const files = await validateAttachments(formData, 'file');
  if (!files.length) throw new NewsValidationError('Wybierz plik do wgrania.');
  const [article] = await db.select({ slug: aktualnosci.slug }).from(aktualnosci)
    .where(eq(aktualnosci.id, aktualnoscId)).limit(1);
  if (!article) throw new NewsValidationError('Nie znaleziono wpisu.');
  const uploaded: UploadedAttachment[] = [];
  try {
    await ensureAktualnosciPlikiTable();
    await uploadAttachments(files, uploaded);
    await db.insert(aktualnosciPliki).values(
      uploaded.map((file) => ({ ...file, userId, aktualnoscId }))
    );
  } catch (error) {
    await cleanupAttachments(uploaded);
    throw error;
  }
  revalidatePath(`/aktualnosci/${article.slug}`);
  revalidatePath(`/admin/aktualnosci/${aktualnoscId}`);
  revalidatePath('/aktualnosci');
}

export async function deleteAktualnoscFile(fileId: number, aktualnoscId: number) {
  await getUserId();

  const [file] = await db
    .select()
    .from(aktualnosciPliki)
    .where(and(eq(aktualnosciPliki.id, fileId), eq(aktualnosciPliki.aktualnoscId, aktualnoscId)))
    .limit(1);

  if (file) {
    await db.delete(aktualnosciPliki).where(eq(aktualnosciPliki.id, fileId));
    await del(file.url).catch(() => {});
  }

  const [article] = await db.select({ slug: aktualnosci.slug }).from(aktualnosci)
    .where(eq(aktualnosci.id, aktualnoscId)).limit(1);
  if (article) revalidatePath(`/aktualnosci/${article.slug}`);
  revalidatePath(`/admin/aktualnosci/${aktualnoscId}`);
  revalidatePath('/aktualnosci');
}
