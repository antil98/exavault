import FileView from '@/components/FileView';
import { getFilesByParent, getTotalPages } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Trash2 } from 'lucide-react';
import { FileSearch } from '@/components/FileSearch';
import FilePagination from '@/components/FilePagination';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Page(props: {
  params: { folderId: string };
  searchParams?: { search?: string; page?: string };
}) {
  const pageParams = await props.params;
  const searchParams = await props.searchParams;

  const currentFolderId = pageParams.folderId;
  
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const searchQuery = searchParams?.search || '';
  const page = Number(searchParams?.page) || 1;

  const trashedFiles = getFilesByParent(
    currentFolderId,
    userId,
    true,
    searchQuery,
    page,
  );
  const totalPages = await getTotalPages(
    currentFolderId,
    userId,
    true,
    searchQuery,
  );

  return (
    <div className="w-full min-h-screen p-2">
      <SidebarTrigger className="md:hidden" />
      <div className="space-y-6 p-4 md:p-6">
        <div className="space-y-5">
          <div className="flex flex-wrap justify-between">
            <div className="flex gap-2 items-center">
              <Trash2 />
              <h2 className="text-2xl font-semibold">Recycle bin</h2>
            </div>
            <FileSearch />
          </div>
        </div>
        <Breadcrumbs
          currentFolderId={currentFolderId}
          userId={userId}
          fileViewPage="trash"
        />
        <FileView filesPromise={trashedFiles} fileViewPage="trash" />
        <FilePagination currentPage={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
