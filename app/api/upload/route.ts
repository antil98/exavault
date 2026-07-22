// Storage provider integration point.
// This route implements the upload flow for Vercel Blob.
// Replace `handleUpload` and its callbacks if migrating to another storage provider.
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
          // Vercel Blob must call back to a publicly reachable endpoint after the upload
          // completes. This URL should point to your deployed application.
          callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/upload`,
          tokenPayload: JSON.stringify({
            ...parsedPayload,
            ownerId: userId,
          }),
        };
      },
      // Vercel Blob requires metadata persistence to happen in this callback after
      // the upload completes. Other storage providers may not require this flow.
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
