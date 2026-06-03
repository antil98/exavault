import requireAuth from '@/lib/auth';
import { getUserRootFolder } from '@/lib/data';
import { redirect } from 'next/navigation';

export default async function PostSignIn() {
  const userId = await requireAuth();
  const rootFolderId = await getUserRootFolder(userId);

  redirect(`/files/${rootFolderId[0].id}`);
}
