import FileUpload from '@/components/FileUpload';
import FileView from '@/components/FileView';
import CreateFolder from '@/components/CreateFolder';
import { getFilesByParent } from '@/lib/data';

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

  const storedFiles = getFilesByParent(currentFolderId, userId, false);
  const trashedFiles = getFilesByParent(currentFolderId, userId, true);

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="max-w-4xl mx-auto p-6 space-y-6">

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">My Drive</h1>
          <p className="text-sm text-muted-foreground">{currentFolderId}</p>
        </div>

        <div className="flex items-center gap-4 justify-center">
          <FileUpload currentFolderId={currentFolderId} />
          <CreateFolder currentFolderId={currentFolderId} />
        </div>

        <FileView filesPromise={storedFiles} fileViewPage='default'/>
        <FileView filesPromise={trashedFiles} fileViewPage='trashed'/>
      </div>
    </div>
  );
}
