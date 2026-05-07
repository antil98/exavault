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

export default function CreateFolder({
  currentFolderId,
  userId,
}: {
  currentFolderId: string;
  userId: string;
}) {
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const parentId = currentFolderId;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) return;

    await fetch(`/api/folder?userId=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        parentId,
      }),
    });

    setName('');
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="secondary">+ New Folder</Button>}
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
                className='mb-5'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My folder..."
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
