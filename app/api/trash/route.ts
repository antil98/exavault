import { getFileTree, trashFiles } from '@/lib/data';

export async function POST(req: Request) {
  const userId = '0';
  const { ids }: { ids: string[] } = await req.json();

  if (!ids || !Array.isArray(ids)) {
    return new Response('Invalid ids', { status: 400 });
  }

  try {
    const items = await getFileTree(ids, userId);
    const allIds = items.map((i) => i.id);
    
    await trashFiles(allIds, userId);

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return new Response('Server error', { status: 500 });
  }
}
