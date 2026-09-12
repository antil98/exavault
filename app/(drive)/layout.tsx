import { getOrCreateUserRootFolder } from '@/lib/data';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import requireAuth from '@/lib/auth';
import Link from 'next/link';
import FileDropProvider from '@/components/FileDropProvider';
import { GlobalProvider } from '../../context/global.context';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await requireAuth();
  const rootFolder = await getOrCreateUserRootFolder(userId);

  return (
    <SidebarProvider>
      <GlobalProvider>
        <FileDropProvider>
          <div className="flex min-h-screen w-full flex-col md:flex-row">
            <AppSidebar rootFolderId={rootFolder.id} />
            <div className="relative flex items-center border-b px-4 py-3 md:hidden">
              <SidebarTrigger size="lg" />
              <Link
                href="/"
                className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2 text-xl font-semibold"
              >
                <img src="/icon.png" alt="Exavault logo" width="30" />
                Exavault
              </Link>
            </div>
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </FileDropProvider>
      </GlobalProvider>
    </SidebarProvider>
  );
}
