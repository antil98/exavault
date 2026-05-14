'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function FileUpload({
  currentFolderId,
}: {
  currentFolderId: string;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  async function handleUpload() {
    if (files.length === 0) return;

    setUploading(true);

    const uploadToast = toast.loading('Uploading files...');

    try {
      await Promise.all(
        files.map((file) => {
          const pathname = `${currentFolderId}/${file.name}`;

          return upload(pathname, file, {
            access: 'public',
            handleUploadUrl: '/api/upload',
            clientPayload: JSON.stringify({
              parentId: currentFolderId,
              size: file.size,
              originalName: file.name,
            }),
          });
        }),
      );

      toast.success('Files uploaded successfully!', {
        id: uploadToast,
      });

      await new Promise((res) => setTimeout(res, 800));
      router.refresh();
    } catch (err) {
      console.error('Upload failed:', err);

      toast.error('Upload failed. Please try again.', {
        id: uploadToast,
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <Input
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="min-w-50"
        />

        <Button
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
        >
          Upload
        </Button>
      </div>
    </div>
  );
}
