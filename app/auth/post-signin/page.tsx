import requireAuth from '@/lib/auth';
import { getOrCreateUserRootFolder } from '@/lib/data';
import { redirect } from 'next/navigation';

export default async function PostSignIn() {
  const userId = await requireAuth();
  const rootFolder = await getOrCreateUserRootFolder(userId);

  redirect(`/files/${rootFolder.id}`);
}
