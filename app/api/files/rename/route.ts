import { renameFile } from '@/lib/data';

export async function POST(req: Request) {
  const userId = '0';
  const { id, newName }: { id?: string; newName?: string } = await req.json();

  if (!id || !newName || !newName.trim()) {
    return new Response('Invalid rename payload', { status: 400 });
  }

  try {
    // The helper owns name-conflict validation so API and UI stay in sync.
    const result = await renameFile({ id, newName, ownerId: userId });

    if (!result.ok) {
      return Response.json(
        { success: false, message: result.message },
        { status: result.status },
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('Rename error:', err);
    return new Response('Server error', { status: 500 });
  }
}
