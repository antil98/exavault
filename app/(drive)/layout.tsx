import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserRootFolder } from '@/lib/data';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const rootFolderId = await getUserRootFolder(userId);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar rootFolderId={rootFolderId[0].id} />

        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}