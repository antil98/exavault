'use client';

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { upload } from '@vercel/blob/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LoaderCircle, Upload } from 'lucide-react';
import { SidebarMenuButton } from './ui/sidebar';
import { useGlobalContext } from '@/context/global.context';

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
  const { droppedFiles, setDroppedFiles } = useGlobalContext();

  function handleClick() {
    if (uploading) return;

    inputRef.current?.click();
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    await handleUpload(Array.from(e.currentTarget.files || []));
  }

  const handleUpload = useCallback(
    async (selectedFiles: File[]) => {
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

        window.dispatchEvent(new Event('exavault:upload-complete'));
        await new Promise((res) => setTimeout(res, 800));
        router.refresh();
      } catch (err: unknown) {
        console.error('Upload failed:', err);

        const message = err instanceof Error ? err.message : '';
        const status =
          typeof err === 'object' && err !== null && 'status' in err
            ? err.status
            : undefined;
        console.log('Error message:', message);

        if (message.includes('Content type mismatch')) {
          toast.error("File type isn't allowed.", {
            id: uploadToast,
          });
          return;
        }

        if (message.includes('Content Too Large') || status === 413) {
          toast.error('File is too large to upload.', {
            id: uploadToast,
          });
          return;
        }
      } finally {
        setDroppedFiles([]);

        setUploading(false);

        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
    },
    [currentFolderId, router, setDroppedFiles, successMessage, uploading],
  );

  useEffect(() => {
    if (droppedFiles.length === 0 || uploading) return;

    void handleUpload(droppedFiles);
  }, [droppedFiles, handleUpload, uploading]);

  return (
    <>
      <SidebarMenuButton
        tooltip={uploading ? 'Uploading...' : buttonLabel}
        onClick={handleClick}
        disabled={uploading}
        className="
          h-10 text-[16px] gap-2.5 rounded-lg border border-sidebar-border/80 bg-background/80 px-3 shadow-xs 
          hover:bg-background hover:text-foreground hover:shadow-sm 
        "
      >
        {uploading ? <LoaderCircle className="animate-spin" /> : <Upload className="size-5" />}
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
