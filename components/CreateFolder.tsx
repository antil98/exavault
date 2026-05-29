'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircle } from 'lucide-react';
import { Plus } from 'lucide-react';
import { SidebarMenuButton } from './ui/sidebar';
import { createFolderAction } from '@/app/actions/files';

export default function CreateFolder({
  currentFolderId,
  buttonLabel = 'New folder',
}: {
  currentFolderId: string;
  buttonLabel?: string;
}) {
  const [name, setName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const parentId = currentFolderId;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || loading) return;

    setLoading(true);

    try {
      const result = await createFolderAction(name, parentId);

      if (!result.ok) throw new Error(result.message);

      setName('');
      setDialogOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(isOpen) => {
        setDialogOpen(isOpen);
        if (isOpen) {
          setName('');
        }
      }}
    >
      <DialogTrigger
        render={
          <SidebarMenuButton
            tooltip={buttonLabel}
            className="h-10"
          >
            <Plus />
            <span className="group-data-[collapsible=icon]:hidden">
              {buttonLabel}
            </span>
          </SidebarMenuButton>
        }
      />

      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleCreate}>
          <DialogHeader>
            <DialogTitle>Create Folder</DialogTitle>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <Label htmlFor="folder-name" className="mt-5 mb-2">
                Folder name
              </Label>
              <Input
                id="folder-name"
                className="mb-5"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My folder..."
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="relative"
            >
              <span className={loading ? 'opacity-0' : 'opacity-100'}>
                Create Folder
              </span>

              {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <LoaderCircle className="animate-spin mr-1" />
                  Creating...
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
