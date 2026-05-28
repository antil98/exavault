import { getFoldersByParent, getUserRootFolder } from '@/lib/data';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

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
