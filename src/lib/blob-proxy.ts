// The project's Vercel Blob store is permanently private (this cannot be
// changed after creation), so blob URLs are not publicly fetchable on their
// own — they require a token. Any URL that points at our blob store must be
// routed through `/api/blob-proxy`, which fetches the blob server-side with
// the project's token and streams it back. URLs that don't belong to our
// blob store (external images, local `/img/...` assets, etc.) are returned
// unchanged.

function isPrivateBlobUrl(value: string): boolean {
  try {
    const { hostname } = new URL(value);
    return hostname.endsWith('.blob.vercel-storage.com');
  } catch {
    return false;
  }
}

export function blobProxyUrl(
  url: string | null | undefined,
  options?: { download?: boolean; filename?: string },
): string | null {
  if (!url) return null;
  if (!isPrivateBlobUrl(url)) return url;

  const params = new URLSearchParams({ url });
  if (options?.download) params.set('download', '1');
  if (options?.filename) params.set('filename', options.filename);

  return `/api/blob-proxy?${params.toString()}`;
}
