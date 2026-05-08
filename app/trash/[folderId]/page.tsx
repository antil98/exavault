import FileView from '@/components/FileView';
import { getTrashedFiles } from '@/lib/data';

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

  const trashedFiles = getTrashedFiles(currentFolderId, userId);

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Recycle bin</h2>
          <p className="text-sm text-muted-foreground">{currentFolderId}</p>
        </div>

        <FileView filesPromise={trashedFiles} fileViewPage="trashed" />
      </div>
    </div>
  );
}
