import requireAuth from '@/lib/auth';
import { getFoldersByParent, getUserRootFolder } from '@/lib/data';

export async function GET(req: Request) {
  const userId = await requireAuth();

  const rootFolderId = await getUserRootFolder(userId);

  const { searchParams } = new URL(req.url);
  const parentId = searchParams.get('parentId') || rootFolderId[0].id;

  try {
    const folders = await getFoldersByParent(parentId, userId);

    return Response.json({ folders, parentId });
  } catch (err) {
    console.error('Folder list error:', err);
    return new Response('Server error', { status: 500 });
  }
}
