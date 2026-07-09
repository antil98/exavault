import FileView from '@/components/FileView';
import { getFilesByParent, getTotalPages, getUserRootFolder } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { FolderOpen } from 'lucide-react';
import { FileSearch } from '@/components/FileSearch';
import FilePagination from '@/components/FilePagination';
import requireAuth from '@/lib/auth';

export default async function Page(props: {
  params: { folderId: string };
  searchParams?: { search?: string; page?: string };
}) {
  const pageParams = await props.params;
  const searchParams = await props.searchParams;

  const currentFolderId = pageParams.folderId;

  const userId = await requireAuth();
  const searchQuery = searchParams?.search || '';
  const page = Number(searchParams?.page) || 1;

  const storedFiles = getFilesByParent(
    currentFolderId,
    userId,
    false,
    searchQuery,
    page,
  );
  const totalPages = await getTotalPages(
    currentFolderId,
    userId,
    false,
    searchQuery,
  );

  const userRootFolder = await getUserRootFolder(userId);

  return (
    <div className="w-full min-h-screen">
      <div className="space-y-6 p-4 md:p-6">
        <div className="space-y-5">
          <div className="flex flex-wrap justify-between gap-3">
            <div className="flex gap-2 items-center mx-auto lg:mx-0">
              <FolderOpen className="w-8 h-8" />
              <h2 className="text-3xl font-semibold">My files</h2>
            </div>
            <FileSearch />
          </div>
        </div>
        <Breadcrumbs
          currentFolderId={currentFolderId}
          userId={userId}
          fileViewPage="files"
        />
        <FileView
          filesPromise={storedFiles}
          fileViewPage="files"
          userRootFolder={userRootFolder[0].id}
        />
        <FilePagination currentPage={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
