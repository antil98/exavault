import { sql } from '@/lib/db';
import { getUniqueName } from '@/lib/utils';

export async function POST(req: Request) {
  const userId = '0'; // Default userId for testing

  const body = await req.json();
  const { name, parentId } = body;

  if (!name || !name.trim()) {
    return new Response('Invalid folder name', { status: 400 });
  }

  try {
    const existing = await sql`
      SELECT name
      FROM files
      WHERE parent_id = ${parentId ?? null}
      AND owner_id = ${userId}
      AND is_dir = true
    `;

    const existingNames = existing.map((file) => file.name);
    const finalName = getUniqueName(name, existingNames);

    await sql`
      INSERT INTO files (
        name,
        parent_id,
        owner_id,
        is_dir
      )
      VALUES (
        ${finalName},
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
