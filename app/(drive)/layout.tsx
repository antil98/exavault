import { getUserRootFolder } from '@/lib/data';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import requireAuth from '@/lib/auth';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await requireAuth();
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