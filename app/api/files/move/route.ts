import { moveFiles } from '@/lib/data';

export async function POST(req: Request) {
  const userId = '0';
  const { ids, targetFolderId }: { ids?: string[]; targetFolderId?: string } =
    await req.json();

  if (!ids || !Array.isArray(ids) || !ids.length || !targetFolderId) {
    return new Response('Invalid move payload', { status: 400 });
  }

  try {
    const result = await moveFiles({ ids, targetFolderId, ownerId: userId });

    if (!result.ok) {
      return Response.json(
        { success: false, message: result.message },
        { status: result.status },
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('Move error:', err);
    return new Response('Server error', { status: 500 });
  }
}
