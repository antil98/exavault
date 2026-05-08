import { getFilesById, trashFiles } from '@/lib/data';

export async function POST(req: Request) {
  const userId = '0';
  const { ids }: { ids: string[] } = await req.json();

  const items = await getFilesById(ids, userId);
  const allIds = items.map(i => i.id);

  try {
    await trashFiles(allIds, userId);

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return new Response('Server error', { status: 500 });
  }
}
