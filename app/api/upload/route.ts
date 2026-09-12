// Storage provider integration point.
// This route implements the upload flow for Vercel Blob.
// Replace `handleUpload` if migrating to another storage provider.
import { handleUpload } from '@vercel/blob/client';
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
          tokenPayload: JSON.stringify({
            ...parsedPayload,
            ownerId: userId,
          }),
        };
      },
    });

    return Response.json(jsonResponse);
  } catch (err) {
    console.error('Upload route failed:', err);
    return new Response('Upload failed', { status: 500 });
  }
}
