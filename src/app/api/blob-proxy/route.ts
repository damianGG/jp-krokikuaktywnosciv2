import { NextResponse, type NextRequest } from 'next/server';
import { get } from '@vercel/blob';

export const runtime = 'nodejs';

// The project's Vercel Blob store is private, so its URLs are not publicly
// fetchable on their own — reading them requires the store's token. This
// route fetches a blob server-side (using the project's Blob token via
// `get()`) and streams it back, acting as a public gateway for content that
// is meant to be visible on the public site (images, downloadable documents).
// Only URLs that already point at our own blob store are allowed.
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  const download = request.nextUrl.searchParams.get('download') === '1';
  const filename = request.nextUrl.searchParams.get('filename');

  if (!url) {
    return NextResponse.json({ error: 'Brak parametru url.' }, { status: 400 });
  }

  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy adres url.' }, { status: 400 });
  }

  if (!hostname.endsWith('.blob.vercel-storage.com')) {
    return NextResponse.json({ error: 'Ten adres nie jest obsługiwany.' }, { status: 400 });
  }

  try {
    const result = await get(url, { access: 'private' });

    if (!result) {
      return NextResponse.json({ error: 'Plik nie został znaleziony.' }, { status: 404 });
    }

    const headers = new Headers({
      'Content-Type': result.blob.contentType || 'application/octet-stream',
      'Cache-Control': 'private, max-age=3600',
    });

    if (download) {
      const safeName = filename || result.blob.pathname.split('/').pop() || 'plik';
      headers.set(
        'Content-Disposition',
        `attachment; filename*=UTF-8''${encodeURIComponent(safeName)}`,
      );
    }

    return new NextResponse(result.stream, { headers });
  } catch (error) {
    console.error('[v0] blob-proxy: failed to fetch blob', error);
    return NextResponse.json({ error: 'Nie udało się pobrać pliku.' }, { status: 502 });
  }
}
