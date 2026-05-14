import { getFoldersByParent, ROOT_FOLDER_ID } from '@/lib/data';

export async function GET(req: Request) {
  const userId = '0';
  const { searchParams } = new URL(req.url);
  const parentId = searchParams.get('parentId') || ROOT_FOLDER_ID;

  try {
    // The move picker asks for one folder level at a time to match the existing
    // parent_id based navigation model.
    const folders = await getFoldersByParent(parentId, userId);

    return Response.json({ folders, parentId });
  } catch (err) {
    console.error('Folder list error:', err);
    return new Response('Server error', { status: 500 });
  }
}
