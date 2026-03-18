import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export interface ArtistWithConcerts {
  id: number;
  name: string;
  country: string | null;
  concertCount: number;
  venues: string;
  dates: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json([]);
    }
    const db = getDb();
    const artists = db.prepare(`
      SELECT
        a.id,
        a.name,
        a.country,
        COUNT(c.id) as concertCount,
        GROUP_CONCAT(DISTINCT v.name) as venues,
        GROUP_CONCAT(c.date ORDER BY c.date ASC) as dates
      FROM artists a
      INNER JOIN concerts c ON c.artist_id = a.id
      INNER JOIN venues v ON v.id = c.venue_id
      WHERE c.user_email = ?
      GROUP BY a.id
      ORDER BY a.name ASC
    `).all(session.user.email) as ArtistWithConcerts[];

    return NextResponse.json(artists);
  } catch (error) {
    console.error('Failed to fetch artists:', error);
    return NextResponse.json({ error: 'Failed to fetch artists' }, { status: 500 });
  }
}
