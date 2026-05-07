import FileUpload from '@/components/FileUpload';
import FileList from '@/components/FileList';
import CreateFolder from '@/components/CreateFolder';
import { getFilesByParent } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';

export default async function Page({
  params,
}: {
  params: { 
    userId: string; 
    folderId: string 
  };
}) {
  const awaitedParams = await params;

  const currentFolderId = awaitedParams.folderId;
  const currentUserId = awaitedParams.userId;

  const filesPromise = getFilesByParent({
    parentId: currentFolderId,
    ownerId: currentUserId,
  });

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* HEADER */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">My Drive</h1>
          <p className="text-sm text-muted-foreground">{currentFolderId}</p>
        </div>

        {/* ACTIONS */}
        <FileUpload currentFolderId={currentFolderId} userId={currentUserId} />

        <CreateFolder currentFolderId={currentFolderId} userId={currentUserId} />

        {/* FILE LIST */}
        <Card>
          <CardContent className="p-0">
            <FileList filesPromise={filesPromise} userId={currentUserId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
