import requireAuth from '@/lib/auth';
import { uploadFile } from '@/lib/data';

export async function POST(req: Request) {
  try {
    const ownerId = await requireAuth();
    const body = await req.json();

    if (
      typeof body.url !== 'string' ||
      typeof body.pathname !== 'string' ||
      typeof body.name !== 'string' ||
      typeof body.size !== 'number' ||
      typeof body.fileType !== 'string'
    ) {
      return new Response('Invalid upload completion payload', { status: 400 });
    }

    await uploadFile({
      url: body.url,
      pathname: body.pathname,
      parentId: typeof body.parentId === 'string' ? body.parentId : null,
      size: body.size,
      name: body.name,
      ownerId,
      fileType: body.fileType,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error('Upload completion failed:', err);
    return new Response('Upload completion failed', { status: 500 });
  }
}
