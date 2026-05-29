import { ClerkProvider } from '@clerk/nextjs';
import { shadcn } from '@clerk/ui/themes';
import type { Metadata } from 'next';
import { Roboto, Playfair_Display, Fira_Code } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';

const fontSans = Roboto({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontSerif = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

const fontMono = Fira_Code({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Exavault',
  description: 'A file manager built with Next.js, React, and Tailwind CSS.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        'dark',
        'h-full',
        'antialiased',
        fontSans.variable,
        fontSerif.variable,
        fontMono.variable,
        'font-sans',
        'scrollbar-gutter-stable',
      )}
    >
      <body className="min-h-full flex flex-col select-none">
        <ClerkProvider appearance={{ theme: shadcn }}>
          <main>{children}</main>
          <Toaster theme="dark" richColors position="bottom-right" />
        </ClerkProvider>
      </body>
    </html>
  );
}
