import FileUpload from '@/components/FileUpload';
import FileView from '@/components/FileView';
import CreateFolder from '@/components/CreateFolder';
import { getFilesByParent } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { FolderOpen } from 'lucide-react';

export default async function Page({
  params,
}: {
  params: {
    folderId: string;
  };
}) {
  const awaitedParams = await params;

  const currentFolderId = awaitedParams.folderId;
  const userId = '0'; // For simplicity, using a fixed userId. In a real app, you'd get this from the session.

  const storedFiles = getFilesByParent(currentFolderId, userId);

  return (
    <div className="w-full min-h-screen bg-muted/40">
      <SidebarTrigger />
      <div className="max-w-4xl space-y-6 p-4 md:p-6">
        <div className="space-y-5">
          <div className="flex flex-row gap-2 items-center">
            <FolderOpen />
            <h2 className="text-2xl font-semibold">My files</h2>
          </div>
          <div>
            <Breadcrumbs
              currentFolderId={currentFolderId}
              userId={userId}
              fileViewPage="files"
            />
          </div>
        </div>

        {/* <div className="flex items-center gap-4 justify-center flex-wrap">
          <FileUpload currentFolderId={currentFolderId} />
          <CreateFolder currentFolderId={currentFolderId} />
        </div> */}

        <FileView filesPromise={storedFiles} fileViewPage="files" />
      </div>
    </div>
  );
}
