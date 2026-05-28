import Link from 'next/link';
import { Show, SignOutButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { getUserRootFolder } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default async function Home() {
  const { userId } = await auth();

  const userRootFolder = await getUserRootFolder(userId!);

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      <section className="w-full md:w-[60%] bg-primary text-white flex items-center justify-center p-10">
        <div className="max-w-xl">
          <h1 className="text-5xl font-bold">Exavault</h1>
          <p className="mt-6 text-lg text-white/80">
            A modern file manager built with Next.js, React and Tailwind CSS.
          </p>
        </div>
      </section>
      <section className="w-full md:w-[40%] flex items-center justify-center p-10">
        <div className="w-full max-w-sm">
          <Show when="signed-out">
            <div className="flex flex-col gap-4">
              <h2 className="text-3xl font-semibold">Welcome</h2>
              <p className="text-muted-foreground">Sign in to get started.</p>
              <Link
                href="/sign-in"
                className="rounded-lg bg-primary px-4 py-3 text-center text-white font-medium hover:opacity-90 transition"
              >
                Sign In
              </Link>
            </div>
          </Show>
          {userId && (
            <Show when="signed-in">
              <div className="flex flex-col items-center gap-3 text-center">
                <div>
                  <h2 className="text-3xl font-semibold">Welcome back</h2>
                  <p className="text-muted-foreground mt-2">
                    You&apos;re signed in as {userId}
                  </p>
                </div>
                <Button variant="default" className="w-full h-12">
                  <Link href={`/files/${userRootFolder[0].id}`}>
                    Go to your files
                  </Link>
                </Button>
                <SignOutButton>
                  <button
                    className={cn(buttonVariants({ variant: 'ghost' }), 'w-full', 'h-12')}
                  >
                    Sign out
                  </button>
                </SignOutButton>
              </div>
            </Show>
          )}
        </div>
      </section>
    </main>
  );
}
