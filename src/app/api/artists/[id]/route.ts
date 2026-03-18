import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();
  const artistId = parseInt(id);

  // Check the user owns at least one concert with this artist
  const owned = db.prepare(
    'SELECT 1 FROM concerts WHERE artist_id = ? AND user_email = ? LIMIT 1'
  ).get(artistId, session.user.email);
  if (!owned) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { name, country } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 });

  db.prepare('UPDATE artists SET name = ?, country = ? WHERE id = ?').run(name.trim(), country || null, artistId);

  return NextResponse.json({ id: artistId, name: name.trim(), country: country || null });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();
  const artistId = parseInt(id);

  // Only delete concerts owned by this user for this artist
  const owned = db.prepare(
    'SELECT 1 FROM concerts WHERE artist_id = ? AND user_email = ? LIMIT 1'
  ).get(artistId, session.user.email);
  if (!owned) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  db.prepare('DELETE FROM concerts WHERE artist_id = ? AND user_email = ?').run(artistId, session.user.email);

  // Only delete the artist record if no other user has concerts with them
  const otherConcerts = db.prepare('SELECT 1 FROM concerts WHERE artist_id = ? LIMIT 1').get(artistId);
  if (!otherConcerts) {
    db.prepare('DELETE FROM artists WHERE id = ?').run(artistId);
  }

  return NextResponse.json({ success: true });
}
