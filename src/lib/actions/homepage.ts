'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { put, del } from '@vercel/blob';
import { db } from '@/lib/db';
import { homepageContent } from '@/lib/db/schema';
import { getUserId } from '@/lib/get-user-id';
import {
  DEFAULT_HERO_TITLE,
  DEFAULT_HERO_IMAGE,
  DEFAULT_ABOUT_CONTENT,
} from '@/lib/homepage-defaults';

export async function getHomepageContent() {
  const [content] = await db.select().from(homepageContent).limit(1);
  console.log('[v0] getHomepageContent row:', content);

  return {
    heroTitle: content?.heroTitle || DEFAULT_HERO_TITLE,
    heroImageUrl: content?.heroImageUrl || DEFAULT_HERO_IMAGE,
    aboutContent: content?.aboutContent || DEFAULT_ABOUT_CONTENT,
  };
}

export async function updateHomepageContent(formData: FormData) {
  const userId = await getUserId();

  const heroTitle = String(formData.get('heroTitle') ?? '').trim();
  const aboutContent = String(formData.get('aboutContent') ?? '').trim();
  const heroImageFile = formData.get('heroImage') as File | null;

  const [existing] = await db.select().from(homepageContent).limit(1);

  let heroImageUrl = existing?.heroImageUrl ?? null;
  if (heroImageFile && heroImageFile.size > 0) {
    if (existing?.heroImageUrl && existing.heroImageUrl.includes('blob.vercel-storage.com')) {
      await del(existing.heroImageUrl).catch(() => {});
    }
    const blob = await put(`strona-glowna/${heroImageFile.name}`, heroImageFile, {
      access: 'public',
      addRandomSuffix: true,
    });
    heroImageUrl = blob.url;
  }

  if (existing) {
    await db
      .update(homepageContent)
      .set({ heroTitle, aboutContent, heroImageUrl, userId, updatedAt: new Date() })
      .where(eq(homepageContent.id, existing.id));
  } else {
    await db.insert(homepageContent).values({ userId, heroTitle, aboutContent, heroImageUrl });
  }

  revalidatePath('/');
  revalidatePath('/admin/strona-glowna');
}
