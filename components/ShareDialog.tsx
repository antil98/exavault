'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CopyButton from './CopyToClipboardButton';
import { useState, useEffect } from 'react';
import { shareFilesAction } from '@/app/actions/files';
import { LoaderCircle, TriangleAlert } from 'lucide-react';

export default function ShareDialog({
  open,
  onOpenChange,
  id,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: string;
}) {
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState('');

  useEffect(() => {
    if (!open) return;

    async function loadLink() {
      setLoading(true);

      const result = await shareFilesAction([id]);

      if (result.ok) {
        setLink(result.links[0]);
      }

      setLoading(false);
    }

    loadLink();
  }, [open, id]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
        </DialogHeader>
        <Label>File link:</Label>
        <FieldGroup>
          <Field>
            {loading ? (
              <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                Preparing link...
              </div>
            ) : (
              <div className="flex items-center rounded-md border border-input bg-background shadow-sm">
                <Input
                  value={link}
                  readOnly
                  className="border-0 shadow-none focus-visible:ring-0"
                />
                <CopyButton text={link} />
              </div>
            )}
          </Field>
        </FieldGroup>
        <DialogFooter className="sm:justify-start gap-2 text-sm text-amber-600 dark:text-amber-400">
          <TriangleAlert className="size-4 shrink-0" />
          <p>Anyone with the link can view or download the file.</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
