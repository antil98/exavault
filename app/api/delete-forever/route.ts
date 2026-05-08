import { getFilesById, deleteForever } from '@/lib/data';
import { del } from '@vercel/blob';

export async function POST(req: Request) {
  const userId = '0'; // same as your other routes
  const { ids } = await req.json();

  if (!ids || !Array.isArray(ids)) {
    return new Response('Invalid ids', { status: 400 });
  }

  const items = await getFilesById(ids, userId);
  const allIds = items.map((i) => i.id);

  try {
    await Promise.all(
      items.map((file) => {
        if (!file.url) return Promise.resolve();
        return del(file.url);
      }),
    );

    await deleteForever(allIds, userId);

    return Response.json({ success: true });
  } catch (err) {
    console.error('❌ Delete forever error:', err);
    return new Response('Server error', { status: 500 });
  }
}
