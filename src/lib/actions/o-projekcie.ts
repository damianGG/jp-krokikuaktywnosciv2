'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq, asc, sql } from 'drizzle-orm';
import { put, del } from '@vercel/blob';
import { db } from '@/lib/db';
import { oProjekcieContent, oProjekcieBloki } from '@/lib/db/schema';
import { getUserId } from '@/lib/get-user-id';

function revalidateOProjekcie() {
  revalidatePath('/o-projekcie');
  revalidatePath('/admin/o-projekcie');
}

/** Uploads an image to Blob storage. Returns null when no file was selected. */
async function uploadImage(file: File | null) {
  if (!file || file.size === 0) return null;

  const blob = await put(`o-projekcie/${file.name}`, file, {
    access: 'private',
    addRandomSuffix: true,
  });

  return blob.url;
}

/** Removes a previously uploaded Blob image. Local /projekt/* files are left alone. */
async function removeBlobImage(url: string | null) {
  if (!url || !url.startsWith('http')) return;
  await del(url).catch(() => {});
}

/* ------------------------------- Intro ------------------------------- */

export async function getOProjekcieContent() {
  try {
    const [content] = await db.select().from(oProjekcieContent).limit(1);
    return content ?? null;
  } catch {
    return null;
  }
}

export async function updateOProjekcieContent(formData: FormData) {
  const userId = await getUserId();

  const heroTitle = String(formData.get('heroTitle') ?? '').trim();
  const projectValue = String(formData.get('projectValue') ?? '').trim();
  const euContribution = String(formData.get('euContribution') ?? '').trim();
  const intro = String(formData.get('intro') ?? '').trim();

  const existing = await getOProjekcieContent();

  if (existing) {
    await db
      .update(oProjekcieContent)
      .set({ heroTitle, projectValue, euContribution, intro, userId, updatedAt: new Date() })
      .where(eq(oProjekcieContent.id, existing.id));
  } else {
    await db
      .insert(oProjekcieContent)
      .values({ userId, heroTitle, projectValue, euContribution, intro });
  }

  revalidateOProjekcie();
}

/* ------------------------------- Blocks ------------------------------ */

export async function getOProjekcieBloki() {
  try {
    return await db.select().from(oProjekcieBloki).orderBy(asc(oProjekcieBloki.position));
  } catch {
    return [];
  }
}

export async function getOProjekcieBlok(id: number) {
  const [blok] = await db
    .select()
    .from(oProjekcieBloki)
    .where(eq(oProjekcieBloki.id, id))
    .limit(1);

  return blok ?? null;
}

export async function createOProjekcieBlok(formData: FormData) {
  const userId = await getUserId();

  const title = String(formData.get('title') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();

  if (!title) throw new Error('Podaj tytuł bloku.');
  if (!content) throw new Error('Treść bloku nie może być pusta.');

  const imageUrl = await uploadImage(formData.get('image') as File | null);

  const [{ max } = { max: null }] = await db
    .select({ max: sql<number | null>`max(${oProjekcieBloki.position})` })
    .from(oProjekcieBloki);

  await db.insert(oProjekcieBloki).values({
    userId,
    title,
    content,
    imageUrl,
    position: (max ?? -1) + 1,
  });

  revalidateOProjekcie();
  redirect('/admin/o-projekcie');
}

export async function updateOProjekcieBlok(id: number, formData: FormData) {
  const userId = await getUserId();

  const title = String(formData.get('title') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();

  if (!title) throw new Error('Podaj tytuł bloku.');
  if (!content) throw new Error('Treść bloku nie może być pusta.');

  const existing = await getOProjekcieBlok(id);
  if (!existing) throw new Error('Blok nie istnieje.');

  const uploaded = await uploadImage(formData.get('image') as File | null);

  if (uploaded && existing.imageUrl !== uploaded) {
    await removeBlobImage(existing.imageUrl);
  }

  await db
    .update(oProjekcieBloki)
    .set({
      title,
      content,
      imageUrl: uploaded ?? existing.imageUrl,
      userId,
      updatedAt: new Date(),
    })
    .where(eq(oProjekcieBloki.id, id));

  revalidateOProjekcie();
}

export async function deleteOProjekcieBlok(id: number) {
  await getUserId();

  const existing = await getOProjekcieBlok(id);

  if (existing) {
    await removeBlobImage(existing.imageUrl);
    await db.delete(oProjekcieBloki).where(eq(oProjekcieBloki.id, id));
  }

  revalidateOProjekcie();
  redirect('/admin/o-projekcie');
}

/** Swaps a block with its neighbour so admins can reorder the page. */
export async function moveOProjekcieBlok(id: number, direction: 'up' | 'down') {
  await getUserId();

  const bloki = await getOProjekcieBloki();
  const index = bloki.findIndex((b) => b.id === id);
  if (index === -1) return;

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= bloki.length) return;

  const current = bloki[index];
  const target = bloki[targetIndex];

  await db
    .update(oProjekcieBloki)
    .set({ position: target.position })
    .where(eq(oProjekcieBloki.id, current.id));

  await db
    .update(oProjekcieBloki)
    .set({ position: current.position })
    .where(eq(oProjekcieBloki.id, target.id));

  revalidateOProjekcie();
}
