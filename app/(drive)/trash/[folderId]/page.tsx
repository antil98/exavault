import FileView from '@/components/FileView';
import { getFilesByParent, getTotalPages, getUserRootFolder } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';
import { FileSearch } from '@/components/FileSearch';
import FilePagination from '@/components/FilePagination';
import requireAuth from '@/lib/auth';
import { Suspense } from 'react';
import FileViewSkeleton from '@/components/FileViewSkeleton';

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

  const userRootFolder = await getUserRootFolder(userId);

  return (
    <div className="w-full min-h-screen">
      <div className="space-y-6 p-4 md:p-6">
        <div className="space-y-5">
          <div className="flex flex-wrap justify-between gap-3">
            <h2 className="text-3xl font-semibold">Recycle bin</h2>
            <FileSearch />
          </div>
        </div>
        <Breadcrumbs
          currentFolderId={currentFolderId}
          userId={userId}
          fileViewPage="trash"
        />
        <Suspense fallback={<FileViewSkeleton />}>
          <FileView
            filesPromise={trashedFiles}
            fileViewPage="trash"
            userRootFolder={userRootFolder[0].id}
          />
          <FilePagination currentPage={page} totalPages={totalPages} />
        </Suspense>
      </div>
    </div>
  );
}
