import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/get-user-id';

export const runtime = 'nodejs';

// Client uploads go straight from the browser to Vercel Blob, so they are not
// bound by the 4.5 MB serverless request-body limit that breaks Server Action
// file uploads on production. This route only mints short-lived, auth-gated
// upload tokens.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Only an authenticated admin may obtain an upload token.
        await getUserId();

        return {
          addRandomSuffix: true,
          maximumSizeInBytes: 100 * 1024 * 1024,
        };
      },
      // The token client saves the returned blob URL to the database via a
      // Server Action, so no server-side completion callback is required.
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 },
    );
  }
}
