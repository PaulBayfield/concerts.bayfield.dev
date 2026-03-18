import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export interface Venue {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  concertCount: number;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json([]);
    }
    const db = getDb();
    const venues = db.prepare(`
      SELECT
        v.*,
        COUNT(c.id) as concertCount
      FROM venues v
      INNER JOIN concerts c ON c.venue_id = v.id
      WHERE c.user_email = ?
      GROUP BY v.id
      ORDER BY v.name ASC
    `).all(session.user.email) as Venue[];

    return NextResponse.json(venues);
  } catch (error) {
    console.error('Failed to fetch venues:', error);
    return NextResponse.json({ error: 'Failed to fetch venues' }, { status: 500 });
  }
}
