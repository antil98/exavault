'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function FileUpload({
  currentFolderId,
  userId,
}: {
  currentFolderId: string;
  userId: string;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  async function handleUpload() {
    if (files.length === 0) return;
    setUploading(true);

    try {
      await Promise.all(
        files.map((file) => {
          const pathname = `${userId}/${currentFolderId}/${file.name}`;

          return upload(pathname, file, {
            access: 'public',
            handleUploadUrl: `/api/upload?userId=${userId}`,
            clientPayload: JSON.stringify({
              parentId: currentFolderId,
              size: file.size,
              originalName: file.name,
            }),
          });
        }),
      );

      await new Promise((res) => setTimeout(res, 800));
      router.refresh();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="text-sky-300">CurrentDir: {currentFolderId}</div>
      <div className="text-red-300">User: {userId}</div>

      <div className="flex items-center gap-3">
        <Input
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />

        <Button onClick={handleUpload} disabled={uploading || files.length === 0} variant={'outline'}>
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
    </div>
  );
}
