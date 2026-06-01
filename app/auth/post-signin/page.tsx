import { getUserRootFolder } from '@/lib/data';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function PostSignIn() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const rootFolderId = await getUserRootFolder(userId);

  redirect(`/files/${rootFolderId[0].id}`);
}
