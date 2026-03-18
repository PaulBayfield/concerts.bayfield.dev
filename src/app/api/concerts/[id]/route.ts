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
  const concertId = parseInt(id);

  const existing = db.prepare('SELECT user_email FROM concerts WHERE id = ?').get(concertId) as { user_email: string } | undefined;
  if (!existing || existing.user_email !== session.user.email) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json();
  const { date, artist_id, artist_name, artist_country, venue_id, venue_name, venue_city, venue_country, venue_latitude, venue_longitude } = body;

  if (!date) return NextResponse.json({ error: 'date is required' }, { status: 400 });

  // Resolve artist
  let finalArtistId = artist_id;
  if (!finalArtistId) {
    if (!artist_name?.trim()) return NextResponse.json({ error: 'artist_name is required' }, { status: 400 });
    const found = db.prepare('SELECT id FROM artists WHERE LOWER(name) = LOWER(?)').get(artist_name.trim()) as { id: number } | undefined;
    if (found) {
      finalArtistId = found.id;
    } else {
      const res = db.prepare('INSERT INTO artists (name, country) VALUES (?, ?)').run(artist_name.trim(), artist_country || null);
      finalArtistId = res.lastInsertRowid;
    }
  }

  // Resolve venue
  let finalVenueId = venue_id;
  if (!finalVenueId) {
    if (!venue_name?.trim()) return NextResponse.json({ error: 'venue_name is required' }, { status: 400 });
    const found = db.prepare('SELECT id FROM venues WHERE LOWER(name) = LOWER(?)').get(venue_name.trim()) as { id: number } | undefined;
    if (found) {
      finalVenueId = found.id;
    } else {
      const res = db.prepare('INSERT INTO venues (name, city, country, latitude, longitude) VALUES (?, ?, ?, ?, ?)').run(
        venue_name.trim(), venue_city || null, venue_country || null, venue_latitude ?? null, venue_longitude ?? null
      );
      finalVenueId = res.lastInsertRowid;
    }
  }

  // Update venue details if provided (allows editing coordinates of existing venues)
  const venueUpdates: string[] = [];
  const venueUpdateValues: unknown[] = [];
  if (venue_city !== undefined) { venueUpdates.push('city = ?'); venueUpdateValues.push(venue_city || null); }
  if (venue_country !== undefined) { venueUpdates.push('country = ?'); venueUpdateValues.push(venue_country || null); }
  if (venue_latitude !== undefined) { venueUpdates.push('latitude = ?'); venueUpdateValues.push(venue_latitude); }
  if (venue_longitude !== undefined) { venueUpdates.push('longitude = ?'); venueUpdateValues.push(venue_longitude); }
  if (venueUpdates.length > 0) {
    venueUpdateValues.push(finalVenueId);
    db.prepare(`UPDATE venues SET ${venueUpdates.join(', ')} WHERE id = ?`).run(...venueUpdateValues);
  }

  db.prepare('UPDATE concerts SET date = ?, artist_id = ?, venue_id = ? WHERE id = ?').run(date, finalArtistId, finalVenueId, concertId);

  const updated = db.prepare(`
    SELECT c.id, c.date, c.artist_id, a.name as artist_name,
           c.venue_id, v.name as venue_name, v.city as venue_city, v.country as venue_country
    FROM concerts c
    JOIN artists a ON a.id = c.artist_id
    JOIN venues v ON v.id = c.venue_id
    WHERE c.id = ?
  `).get(concertId);

  return NextResponse.json(updated);
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
  const concertId = parseInt(id);

  const existing = db.prepare('SELECT user_email FROM concerts WHERE id = ?').get(concertId) as { user_email: string } | undefined;
  if (!existing || existing.user_email !== session.user.email) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  db.prepare('DELETE FROM concerts WHERE id = ?').run(concertId);
  return NextResponse.json({ success: true });
}
