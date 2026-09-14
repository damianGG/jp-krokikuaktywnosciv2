'use server';

import { revalidatePath } from 'next/cache';
import { eq, asc, sql } from 'drizzle-orm';
import { del } from '@vercel/blob';
import { db } from '@/lib/db';
import { rekrutacjaContent, rekrutacjaPliki } from '@/lib/db/schema';
import { getUserId } from '@/lib/get-user-id';

async function ensureRekrutacjaContentFields() {
  await db.execute(sql`
    ALTER TABLE IF EXISTS rekrutacja_content
      ADD COLUMN IF NOT EXISTS "eligibilityTitle" text,
      ADD COLUMN IF NOT EXISTS "eligibilityItems" text,
      ADD COLUMN IF NOT EXISTS "priorityContent" text,
      ADD COLUMN IF NOT EXISTS "equalOpportunities" text,
      ADD COLUMN IF NOT EXISTS "applicationTitle" text,
      ADD COLUMN IF NOT EXISTS "applicationIntro" text,
      ADD COLUMN IF NOT EXISTS "applicationSteps" text,
      ADD COLUMN IF NOT EXISTS "applicationHelp" text,
      ADD COLUMN IF NOT EXISTS "documentsTitle" text,
      ADD COLUMN IF NOT EXISTS "documentsIntro" text,
      ADD COLUMN IF NOT EXISTS "documentsFooter" text
  `);
}

export async function getRekrutacjaContent() {
  await ensureRekrutacjaContentFields();
  const [content] = await db.select().from(rekrutacjaContent).limit(1);
  return content ?? null;
}

async function ensureRekrutacjaFileVariants() {
  await db.execute(sql`
    ALTER TABLE IF EXISTS rekrutacja_pliki
      ADD COLUMN IF NOT EXISTS "blackWhiteUrl" text,
      ADD COLUMN IF NOT EXISTS "blackWhitePathname" text
  `);
}

export async function getRekrutacjaPliki() {
  try {
    return await db.select().from(rekrutacjaPliki).orderBy(asc(rekrutacjaPliki.position));
  } catch (error) {
    const cause = typeof error === 'object' && error !== null && 'cause' in error
      ? error.cause
      : error;
    const isMissingColumn = typeof cause === 'object'
      && cause !== null
      && 'code' in cause
      && cause.code === '42703';

    if (!isMissingColumn) throw error;

    const legacyFiles = await db
      .select({
        id: rekrutacjaPliki.id,
        userId: rekrutacjaPliki.userId,
        name: rekrutacjaPliki.name,
        description: rekrutacjaPliki.description,
        url: rekrutacjaPliki.url,
        pathname: rekrutacjaPliki.pathname,
        position: rekrutacjaPliki.position,
        createdAt: rekrutacjaPliki.createdAt,
      })
      .from(rekrutacjaPliki)
      .orderBy(asc(rekrutacjaPliki.position));

    return legacyFiles.map((file) => ({
      ...file,
      blackWhiteUrl: null,
      blackWhitePathname: null,
    }));
  }
}

export async function updateRekrutacjaContent(formData: FormData) {
  const userId = await getUserId();

  const getText = (name: string) => String(formData.get(name) ?? '').trim();
  const values = {
    title: getText('title'),
    intro: getText('intro'),
    content: getText('content'),
    eligibilityTitle: getText('eligibilityTitle'),
    eligibilityItems: getText('eligibilityItems'),
    priorityContent: getText('priorityContent'),
    equalOpportunities: getText('equalOpportunities'),
    applicationTitle: getText('applicationTitle'),
    applicationIntro: getText('applicationIntro'),
    applicationSteps: getText('applicationSteps'),
    applicationHelp: getText('applicationHelp'),
    documentsTitle: getText('documentsTitle'),
    documentsIntro: getText('documentsIntro'),
    documentsFooter: getText('documentsFooter'),
  };

  const existing = await getRekrutacjaContent();

  if (existing) {
    await db
      .update(rekrutacjaContent)
      .set({ ...values, userId, updatedAt: new Date() })
      .where(eq(rekrutacjaContent.id, existing.id));
  } else {
    await db.insert(rekrutacjaContent).values({ userId, ...values });
  }

  revalidatePath('/rekrutacja');
  revalidatePath('/admin/rekrutacja');
}

// Files are uploaded straight from the browser to Vercel Blob (see
// /api/rekrutacja/upload). This action only persists the resulting blob
// metadata, so it never carries the file bytes through the serverless
// request body and is not affected by the 4.5 MB platform limit.
export async function saveRekrutacjaFile(input: {
  description: string;
  name: string;
  url: string;
  pathname: string;
  blackWhiteUrl?: string | null;
  blackWhitePathname?: string | null;
}) {
  const userId = await getUserId();
  await ensureRekrutacjaFileVariants();

  if (!input.url || !input.pathname) {
    throw new Error('Brak wgranego pliku do zapisania.');
  }

  const files = await getRekrutacjaPliki();
  const nextPosition = files.length > 0 ? files[files.length - 1].position + 1 : 0;

  await db.insert(rekrutacjaPliki).values({
    userId,
    name: input.name,
    description: input.description || null,
    url: input.url,
    pathname: input.pathname,
    blackWhiteUrl: input.blackWhiteUrl ?? null,
    blackWhitePathname: input.blackWhitePathname ?? null,
    position: nextPosition,
  });

  revalidatePath('/rekrutacja');
  revalidatePath('/admin/rekrutacja');
}

export async function deleteRekrutacjaFile(fileId: number) {
  await getUserId();
  await ensureRekrutacjaFileVariants();

  const [file] = await db
    .select()
    .from(rekrutacjaPliki)
    .where(eq(rekrutacjaPliki.id, fileId))
    .limit(1);

  if (file) {
    await Promise.all([
      del(file.url).catch(() => {}),
      file.blackWhiteUrl ? del(file.blackWhiteUrl).catch(() => {}) : Promise.resolve(),
    ]);
    await db.delete(rekrutacjaPliki).where(eq(rekrutacjaPliki.id, fileId));
  }

  revalidatePath('/rekrutacja');
  revalidatePath('/admin/rekrutacja');
}
