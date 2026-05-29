import { Webhook } from 'svix';
import { headers } from 'next/headers';
import type { WebhookEvent } from '@clerk/nextjs/server';
import {
  createUserRootFolder,
  deleteForever,
  getAllUserFiles,
} from '@/lib/data';
import { del } from '@vercel/blob';
import { redirect } from 'next/navigation';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const payload = await req.text();
  const headerList = await headers();

  const svix_id = headerList.get('svix-id');
  const svix_timestamp = headerList.get('svix-timestamp');
  const svix_signature = headerList.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing headers', { status: 400 });
  }

  const wh = new Webhook(webhookSecret);

  let event: WebhookEvent;

  try {
    event = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  switch (event.type) {
    case 'user.created': {
      const userId = event.data.id;

      if (!userId) {
        redirect('/sign-in');
      }

      await createUserRootFolder(userId);

      break;
    }

    case 'user.deleted': {
      const userId = event.data.id;

      if (!userId) {
        redirect('/sign-in');
      }

      const items = await getAllUserFiles(userId);
      const ids = items.map((item) => item.id);

      await Promise.allSettled(
        items.map((item) => {
          if (item.is_dir || !item.url) return Promise.resolve();

          return del(item.url);
        }),
      );

      await deleteForever(ids, userId);

      return Response.json({
        ok: true,
        deletedCount: ids.length,
      });
    }
  }

  return new Response(JSON.stringify({ ok: true, deletedCount: 0 }), {
    status: 200,
  });
}
