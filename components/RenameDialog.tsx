'use client';

import { useEffect, useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { renameFile } from '@/lib/file-actions';
import { LoaderCircle } from 'lucide-react';

export default function RenameDialog({
  open,
  onOpenChange,
  id,
  currentName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: string | null;
  currentName: string;
}) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputId = useId();
  const errorId = useId();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    // Reset every time the modal opens so a previous conflict does not leak
    // into the next rename attempt.
    setName(currentName);
    setError('');
  }, [currentName, open]);

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();

    if (!id || loading) return;

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await renameFile(id, trimmedName);
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      // Server conflict messages land here and drive aria-invalid on the input.
      setError(err instanceof Error ? err.message : 'Rename failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleRename}>
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
          </DialogHeader>

          <FieldGroup className="my-5">
            <Field>
              <Label htmlFor={inputId}>New name</Label>
              <Input
                id={inputId}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
                autoFocus
              />
              <FieldError id={errorId}>{error}</FieldError>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button
              type="submit"
              disabled={loading || !name.trim() || name.trim() === currentName}
              className="relative"
            >
              <span className={loading ? 'opacity-0' : 'opacity-100'}>
                Rename
              </span>

              {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <LoaderCircle className="mr-1 animate-spin" />
                  Renaming...
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
