import { ClerkProvider } from '@clerk/nextjs';
import { shadcn } from '@clerk/ui/themes';
import type { Metadata } from 'next';
import { Poppins, Lora, Fira_Code } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import SonnerProvider from '@/components/SonnerProvider';

const fontSans = Poppins({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

const fontSerif = Lora({
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
        'h-full antialiased',
        fontSans.variable,
        fontSerif.variable,
        fontMono.variable,
        'font-sans',
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col select-none">
        <ClerkProvider appearance={{ theme: shadcn }}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main className="flex-1">{children}</main>
            <SonnerProvider />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
