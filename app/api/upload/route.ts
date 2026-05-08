import { handleUpload } from '@vercel/blob/client';
import { uploadFile } from '../../../lib/data';

export async function POST(req: Request) {
  const body = await req.json();
  const userId = '0'; // Default userId for testing

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        return {
          allowedContentTypes: [
            // Multimedia
            'image/*',
            'video/*',
            'audio/*',

            // Text and Documents
            'text/plain',
            'text/markdown',
            'application/json',
            'text/csv',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',

            // Archives
            'application/zip',
            'application/x-rar-compressed',
            'application/x-7z-compressed',
            'application/x-tar',
            'application/gzip',
          ],
          addRandomSuffix: true,
          callbackUrl: 'https://exavault.vercel.app/api/upload',
          tokenPayload: clientPayload,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          const parsed = JSON.parse(tokenPayload ?? '{}');

          await uploadFile({
            url: blob.url,
            pathname: blob.pathname,
            parentId: parsed.parentId ?? null,
            size: parsed.size,
            name: parsed.originalName,
            ownerId: userId,
          });

          console.log('✅ DB INSERT SUCCESS');
        } catch (err) {
          console.error('❌ CALLBACK ERROR:', err);
        }
      },
    });

    return Response.json(jsonResponse);
  } catch {
    return new Response('Upload failed', { status: 500 });
  }
}
