import { getFilesById } from '@/lib/data';
import { buildFullPath } from '@/lib/utils';
import archiver from 'archiver';
import { Readable } from 'stream';
import { ReadableStream } from 'stream/web';

export async function POST(req: Request) {
  const { ids }: { ids: string[] } = await req.json();
  const userId = '0'; // For simplicity, using a fixed ownerId. In a real app, you'd get this from the session.

  if (!ids || !Array.isArray(ids)) {
    return new Response('Invalid ids', { status: 400 });
  }
  const items = await getFilesById(ids, userId);

  const files = items.filter((i) => !i.is_dir);
  const folders = items.filter((i) => i.is_dir);

  const isSingleFile = files.length === 1 && folders.length === 0;

  if (isSingleFile) {
    const file = files[0];

    const res = await fetch(file.url);

    return new Response(res.body, {
      headers: {
        'Content-Disposition': `attachment; filename="${file.name}"`,
      },
    });
  }

  const archive = archiver('zip', { zlib: { level: 9 } });
  const byId = new Map(items.map((i) => [i.id, i]));
  const stream = new ReadableStream({
    start(controller) {
      archive.on('data', (chunk) => controller.enqueue(chunk));
      archive.on('end', () => controller.close());
      archive.on('error', (err) => controller.error(err));
    },
  });

  for (const file of files) {
    const res = await fetch(file.url);

    if (!res.body) {
      throw new Error(`Missing body for file ${file.name}`);
    }

    archive.append(Readable.fromWeb(res.body as ReadableStream<Uint8Array>), {
      name: buildFullPath(file, byId),
    });
  }

  for (const folder of folders) {
    archive.append('', {
      name: buildFullPath(folder, byId) + '/',
    });
  }

  archive.finalize();

  return new Response(stream as BodyInit, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="files.zip"',
    },
  });
}
