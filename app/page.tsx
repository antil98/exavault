import Link from 'next/link';
import Image from 'next/image';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight, Folder } from 'lucide-react';

export default async function Home() {
  return (
    <main className="flex h-screen flex-col md:flex-row bg-primary">
      <section className="w-full md:w-[60%] bg-primary text-primary-foreground flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl font-bold text-secondary mb-6">Exavault</h1>
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              File management
              <br />
              without the clutter.
            </h2>
            <p className="mt-5 text-lg text-primary-foreground/80">
              A modern file manager built with Next.js, React, Tailwind CSS,
              PostgreSQL and Vercel Blob. Deployed to Vercel and secured by
              Clerk.
            </p>
          </div>
          <div className="mt-10 hidden md:block overflow-hidden">
            <Image
              src="/preview.png"
              alt="App preview"
              width={1200}
              height={800}
              className="rounded-2xl border border-primary-foreground/10 shadow-2xl"
            />
          </div>
        </div>
      </section>
      <section className="w-full h-full  md:w-[40%] flex items-center justify-center p-6 md:p-12 rounded-t-xl md:rounded-none bg-background">
        <div className="w-full  max-w-sm">
          <div className="flex flex-col gap-4 items-center justify-center">
            <div className="p-4 rounded-lg bg-primary">
              <Folder className="fill-foreground text-foreground" />
            </div>
            <h2 className="text-3xl font-semibold">Welcome</h2>
            <p className="text-muted-foreground">Sign in to get started.</p>
            <Link
              href="/sign-in"
              className="w-full h-13 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-center text-white font-medium hover:opacity-90 transition"
            >
              Get started
              <ArrowRight />
            </Link>
            <div className="w-full flex items-center gap-4">
              <hr className="w-[45%] my-6 border-t border-secondary" />
              <p>or</p>
              <hr className="w-[45%] my-6 border-t border-secondary" />
            </div>
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full',
                'h-13',
                'text-md',
              )}
            >
              Sign up
            </Link>
            <p className="text-center">
              Already have an account?{' '}
              <Link href="/sign-in" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
