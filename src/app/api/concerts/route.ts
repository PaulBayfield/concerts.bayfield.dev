import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export interface Concert {
  id: number;
  date: string;
  artist_id: number;
  artist_name: string;
  venue_id: number;
  venue_name: string;
  venue_city: string | null;
  venue_country: string | null;
}

export interface CreateConcertBody {
  date: string;
  // Artist — pick existing id OR provide name (+ optional country)
  artist_id?: number;
  artist_name?: string;
  artist_country?: string;
  // Venue — pick existing id OR provide name (+ optional details)
  venue_id?: number;
  venue_name?: string;
  venue_city?: string;
  venue_country?: string;
  venue_latitude?: number;
  venue_longitude?: number;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json([]);
    }
    const db = getDb();
    const concerts = db.prepare(`
      SELECT
        c.id,
        c.date,
        c.artist_id,
        a.name as artist_name,
        c.venue_id,
        v.name as venue_name,
        v.city as venue_city,
        v.country as venue_country
      FROM concerts c
      JOIN artists a ON a.id = c.artist_id
      JOIN venues v ON v.id = c.venue_id
      WHERE c.user_email = ?
      ORDER BY c.date DESC
    `).all(session.user.email) as Concert[];

    return NextResponse.json(concerts);
  } catch (error) {
    console.error('Failed to fetch concerts:', error);
    return NextResponse.json({ error: 'Failed to fetch concerts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateConcertBody = await req.json();
    const db = getDb();

    // Resolve or create artist
    let artistId = body.artist_id;
    if (!artistId) {
      if (!body.artist_name?.trim()) {
        return NextResponse.json({ error: 'artist_name is required' }, { status: 400 });
      }
      const existing = db.prepare('SELECT id FROM artists WHERE LOWER(name) = LOWER(?)').get(body.artist_name.trim()) as { id: number } | undefined;
      if (existing) {
        artistId = existing.id;
      } else {
        const res = db.prepare('INSERT INTO artists (name, country) VALUES (?, ?)').run(
          body.artist_name.trim(),
          body.artist_country?.trim() || null
        );
        artistId = res.lastInsertRowid as number;
      }
    }

    // Resolve or create venue
    let venueId = body.venue_id;
    if (!venueId) {
      if (!body.venue_name?.trim()) {
        return NextResponse.json({ error: 'venue_name is required' }, { status: 400 });
      }
      const existing = db.prepare('SELECT id FROM venues WHERE LOWER(name) = LOWER(?)').get(body.venue_name.trim()) as { id: number } | undefined;
      if (existing) {
        venueId = existing.id;
      } else {
        const res = db.prepare(
          'INSERT INTO venues (name, city, country, latitude, longitude) VALUES (?, ?, ?, ?, ?)'
        ).run(
          body.venue_name.trim(),
          body.venue_city?.trim() || null,
          body.venue_country?.trim() || null,
          body.venue_latitude ?? null,
          body.venue_longitude ?? null
        );
        venueId = res.lastInsertRowid as number;
      }
    }

    if (!body.date) {
      return NextResponse.json({ error: 'date is required' }, { status: 400 });
    }

    const result = db.prepare(
      'INSERT INTO concerts (venue_id, artist_id, date, user_email) VALUES (?, ?, ?, ?)'
    ).run(venueId, artistId, body.date, session.user.email);

    const concert = db.prepare(`
      SELECT c.id, c.date, c.artist_id, a.name as artist_name,
             c.venue_id, v.name as venue_name, v.city as venue_city, v.country as venue_country
      FROM concerts c
      JOIN artists a ON a.id = c.artist_id
      JOIN venues v ON v.id = c.venue_id
      WHERE c.id = ?
    `).get(result.lastInsertRowid) as Concert;

    return NextResponse.json(concert, { status: 201 });
  } catch (error) {
    console.error('Failed to create concert:', error);
    return NextResponse.json({ error: 'Failed to create concert' }, { status: 500 });
  }
}
