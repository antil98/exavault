'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Check, Clipboard } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button variant="secondary" onClick={copy}>
            {copied ? <Check className="text-green-500" /> : <Clipboard />}
          </Button>
        }
      />
      <TooltipContent>
        <p>Copy link to clipboard</p>
      </TooltipContent>
    </Tooltip>
  );
}
