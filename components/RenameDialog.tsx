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
import { renameFileAction } from '@/app/actions/files';
import { LoaderCircle } from 'lucide-react';
import { useGlobalContext } from '@/context/global.context';

export default function RenameDialog({
  open,
  onOpenChange,
  id,
  currentName,
  isDir,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: string | null;
  currentName: string;
  isDir: boolean;
}) {
  const extensionStart = !isDir ? currentName.lastIndexOf('.') : -1;
  const extension = extensionStart > 0 ? currentName.slice(extensionStart) : '';
  const displayName =
    extensionStart > 0 ? currentName.slice(0, extensionStart) : currentName;
  const [name, setName] = useState(displayName);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputId = useId();
  const errorId = useId();
  const router = useRouter();
  const { setRenamedFile } = useGlobalContext();

  useEffect(() => {
    if (!open) return;

    setName(displayName);
    setError('');
  }, [displayName, open]);

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
      const nextName = isDir ? trimmedName : `${trimmedName}${extension}`;
      const result = await renameFileAction(id, nextName);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      onOpenChange(false);
      setRenamedFile({ id, name: nextName });
      router.refresh();
    } catch (err) {
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
              <div className="flex items-center">
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
                  className={extension ? 'rounded-r-none' : undefined}
                />
                {extension && (
                  <span className="flex h-9 items-center rounded-r-md border border-l-0 bg-muted px-3 text-sm text-muted-foreground">
                    {extension}
                  </span>
                )}
              </div>
              <FieldError id={errorId}>{error}</FieldError>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button
              type="submit"
              disabled={loading || !name.trim() || name.trim() === displayName}
              className="relative min-w-[8rem] overflow-hidden"
            >
              <span className={loading ? 'opacity-0' : 'opacity-100'}>
                Rename
              </span>

              {loading && (
                <span className="absolute inset-0 flex items-center justify-center gap-1.5 px-2">
                  <LoaderCircle className="size-4 shrink-0 animate-spin" />
                  <span className="truncate">Renaming...</span>
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
