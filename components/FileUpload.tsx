'use client';

import { type ChangeEvent, useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LoaderCircle, Upload } from 'lucide-react';
import { SidebarMenuButton } from './ui/sidebar';

export default function FileUpload({
  currentFolderId,
  buttonLabel = 'Select files',
  successMessage = 'Files uploaded successfully!',
}: {
  currentFolderId: string;
  buttonLabel?: string;
  successMessage?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleClick() {
    if (uploading) return;

    inputRef.current?.click();
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    await handleUpload(Array.from(e.currentTarget.files || []));
  }

  async function handleUpload(selectedFiles: File[]) {
    if (selectedFiles.length === 0 || uploading) return;

    setUploading(true);

    const uploadToast = toast.loading('Uploading files...');

    try {
      await Promise.all(
        selectedFiles.map((file) => {
          const pathname = `${currentFolderId}/${file.name}`;
          return upload(pathname, file, {
            access: 'public',
            handleUploadUrl: '/api/upload',
            clientPayload: JSON.stringify({
              parentId: currentFolderId,
              size: file.size,
              originalName: file.name,
              fileType: file.type,
            }),
          });
        }),
      );

      toast.success(successMessage, {
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
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }

  return (
    <>
      <SidebarMenuButton
        tooltip={uploading ? 'Uploading...' : buttonLabel}
        onClick={handleClick}
        disabled={uploading}
        className="
          h-10 gap-2.5 rounded-lg border border-sidebar-border/80 bg-background/80 px-3 font-medium shadow-xs 
          hover:bg-background hover:shadow-sm 
        "
      >
        {uploading ? <LoaderCircle className="animate-spin" /> : <Upload />}
        <span className="group-data-[collapsible=icon]:hidden">
          {uploading ? 'Uploading...' : buttonLabel}
        </span>
      </SidebarMenuButton>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="sr-only"
        onChange={handleFileChange}
      />
    </>
  );
}
