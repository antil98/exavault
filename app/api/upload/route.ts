import { handleUpload } from '@vercel/blob/client';
import { uploadFile } from '../../../lib/data';
import requireAuth from '@/lib/auth';

const allowedContentTypes = [
  'image/*',
  'video/*',
  'audio/*',
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
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/x-tar',
  'application/gzip',
];

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const userId = await requireAuth();

        const parsedPayload = JSON.parse(clientPayload ?? '{}');

        return {
          allowedContentTypes,
          addRandomSuffix: true,
          callbackUrl: 'https://exavault.vercel.app/api/upload',
          tokenPayload: JSON.stringify({
            ...parsedPayload,
            ownerId: userId,
          }),
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
            ownerId: parsed.ownerId,
            fileType: parsed.fileType,
          });
        } catch (err) {
          console.error('Upload callback failed:', err);
        }
      },
    });

    return Response.json(jsonResponse);
  } catch {
    return new Response('Upload failed', { status: 500 });
  }
}
