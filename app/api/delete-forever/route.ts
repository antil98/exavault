import { deleteForever } from '@/lib/data';

export async function POST(req: Request) {
  const userId = '0'; // same as your other routes
  const { ids } = await req.json();

  try {
    await deleteForever(ids, userId);

    return Response.json({ success: true });
  } catch (err) {
    console.error('❌ Delete forever error:', err);
    return new Response('Server error', { status: 500 });
  }
}