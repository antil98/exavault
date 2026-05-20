import FileUpload from '@/components/FileUpload';
import FileView from '@/components/FileView';
import CreateFolder from '@/components/CreateFolder';
import { getFilesByParent } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { FolderOpen } from 'lucide-react';
import { FileSearch } from '@/components/FileSearch';

export default async function Page(props: {
  params: { folderId: string };
  searchParams?: { search?: string; page?: string };
}) {
  const pageParams = await props.params;
  const searchParams = await props.searchParams;

  const currentFolderId = pageParams.folderId;
  const userId = '0';

  const searchQuery = searchParams?.search || '';
  const page = Number(searchParams?.page) || 1;

  const storedFiles = getFilesByParent(
    currentFolderId,
    userId,
    false,
    searchQuery,
    page,
  );

  return (
    <div className="w-full min-h-screen bg-muted/40 p-2">
      <div className="flex items-center justify-between">
        <SidebarTrigger className="md:hidden" />
        <Breadcrumbs
          currentFolderId={currentFolderId}
          userId={userId}
          fileViewPage="files"
        />
      </div>
      <div className=" space-y-6 p-4 md:p-6">
        <div className="space-y-5">
          <div className="flex flex-wrap justify-between">
            <div className="flex gap-2 items-center">
              <FolderOpen />
              <h2 className="text-2xl font-semibold">My files</h2>
            </div>
            <FileSearch />
          </div>
        </div>

        <div className="flex items-center gap-4 justify-center flex-wrap">
          <FileUpload currentFolderId={currentFolderId} />
          <CreateFolder currentFolderId={currentFolderId} />
        </div>

        <FileView filesPromise={storedFiles} fileViewPage="files" />
      </div>
    </div>
  );
}
