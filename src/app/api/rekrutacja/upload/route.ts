import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/get-user-id';

export const runtime = 'nodejs';

// Client uploads go straight from the browser to Vercel Blob, so they are not
// bound by the 4.5 MB serverless request-body limit that breaks Server Action
// file uploads on production. This route only mints short-lived, auth-gated
// upload tokens.
export async function POST(request: Request): Promise<NextResponse> {
  console.log('[v0] rekrutacja upload route: request received');

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch (error) {
    console.error('[v0] rekrutacja upload route: failed to parse body', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        console.log('[v0] rekrutacja upload route: checking auth');
        // Only an authenticated admin may obtain an upload token.
        await getUserId();
        console.log('[v0] rekrutacja upload route: auth ok, minting token');

        return {
          addRandomSuffix: true,
          maximumSizeInBytes: 100 * 1024 * 1024,
        };
      },
      // The token client saves the returned blob URL to the database via a
      // Server Action, so no server-side completion callback is required.
      onUploadCompleted: async () => {
        console.log('[v0] rekrutacja upload route: upload completed callback');
      },
    });

    console.log('[v0] rekrutacja upload route: success', jsonResponse.type);
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('[v0] rekrutacja upload route: handleUpload failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 },
    );
  }
}
