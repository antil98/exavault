import { deleteForever, getTrashedFiles } from '@/lib/data';
import { del } from '@vercel/blob';

export async function POST() {
  const userId = '0';

  try {
    const items = await getTrashedFiles(userId);
    const ids = items.map((item) => item.id);

    if (!ids.length) {
      return Response.json({ success: true, deletedCount: 0 });
    }

    await Promise.all(
      items.map((item) => {
        if (item.is_dir || !item.url) return Promise.resolve();
        return del(item.url);
      }),
    );

    await deleteForever(ids, userId);

    return Response.json({ success: true, deletedCount: ids.length });
  } catch (err) {
    console.error('Empty trash error:', err);
    return new Response('Server error', { status: 500 });
  }
}
