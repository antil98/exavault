import { sql } from '@/lib/db';

export async function POST(req: Request) {
  console.log('API folder reached');

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') ?? 'dev-user';

  const body = await req.json();
  const { name, parentId } = body;

  if (!name || !name.trim()) {
    return new Response('Invalid folder name', { status: 400 });
  }

  try {
    await sql`
      INSERT INTO files (
        name,
        parent_id,
        owner_id,
        is_dir
      )
      VALUES (
        ${name},
        ${parentId ?? null},
        ${userId},
        true
      )
    `;

    console.log('✅ Folder created');

    return Response.json({ success: true });
  } catch (err) {
    console.error('❌ Folder creation error:', err);
    return new Response('Server error', { status: 500 });
  }
}
