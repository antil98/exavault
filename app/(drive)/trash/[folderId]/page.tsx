import FileView from '@/components/FileView';
import { getFilesByParent } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Trash2 } from 'lucide-react';
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

  const trashedFiles = getFilesByParent(currentFolderId, userId, true, searchQuery, page);

  return (
    <div className="w-full min-h-screen p-2">
      <div className="flex items-center justify-between">
        <SidebarTrigger className="md:hidden" />
        <Breadcrumbs
          currentFolderId={currentFolderId}
          userId={userId}
          fileViewPage="trash"
        />
      </div>
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

        <FileView filesPromise={trashedFiles} fileViewPage="trash" />
      </div>
    </div>
  );
}
