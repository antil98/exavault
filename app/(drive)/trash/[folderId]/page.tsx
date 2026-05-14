import FileView from '@/components/FileView';
import { getFilesByParent } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Trash2 } from 'lucide-react';

export default async function Trash({
  params,
}: {
  params: {
    folderId: string;
  };
}) {
  const awaitedParams = await params;

  const currentFolderId = awaitedParams.folderId;
  const userId = '0'; // For simplicity, using a fixed userId. In a real app, you'd get this from the session.

  const trashedFiles = getFilesByParent(currentFolderId, userId, true);

  return (
    <div className="w-full min-h-screen bg-muted/40">
      <SidebarTrigger />
      <div className="max-w-4xl space-y-6 p-4 md:p-6">
        <div className="space-y-5">
          <div className="flex flex-row gap-2 items-center">
            <Trash2 />
            <h2 className="text-2xl font-semibold">Recycle bin</h2>
          </div>
          <div>
            <Breadcrumbs
              currentFolderId={currentFolderId}
              userId={userId}
              fileViewPage="trash"
            />
          </div>
        </div>

        <FileView
          filesPromise={trashedFiles}
          fileViewPage="trash"
        />
      </div>
    </div>
  );
}
