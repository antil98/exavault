'use client';

import { Toaster } from 'sonner';
import { useTheme } from 'next-themes';
import { useIsMobile } from '@/hooks/use-mobile';

export default function SonnerProvider() {
  const { resolvedTheme } = useTheme();
  const isMobile = useIsMobile();

  return (
    <Toaster
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      richColors
      position={isMobile ? 'top-center' : 'bottom-right'}
    />
  );
}