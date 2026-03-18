import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"

export type AdminUser = {
  email: string
  concert_count: number
  artist_count: number
  venue_count: number
}

export type AdminConcert = {
  id: number
  date: string | null
  user_email: string
  artist_name: string
  venue_name: string
  city: string | null
  country: string | null
}

export type AdminData = {
  users: AdminUser[]
  concerts: AdminConcert[]
  totals: {
    artists: number
    venues: number
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const adminEmail = process.env.ADMIN_EMAIL

  if (!session?.user?.email || !adminEmail || session.user.email !== adminEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const db = getDb()

  const users = db.prepare(`
    SELECT
      c.user_email as email,
      COUNT(c.id) as concert_count,
      COUNT(DISTINCT c.artist_id) as artist_count,
      COUNT(DISTINCT c.venue_id) as venue_count
    FROM concerts c
    WHERE c.user_email IS NOT NULL
    GROUP BY c.user_email
    ORDER BY concert_count DESC
  `).all() as AdminUser[]

  const concerts = db.prepare(`
    SELECT c.id, c.date, c.user_email, a.name as artist_name, v.name as venue_name, v.city, v.country
    FROM concerts c
    JOIN artists a ON a.id = c.artist_id
    JOIN venues v ON v.id = c.venue_id
    WHERE c.user_email IS NOT NULL
    ORDER BY c.user_email, c.date DESC
  `).all() as AdminConcert[]

  const totalArtists = (db.prepare("SELECT COUNT(*) as count FROM artists").get() as { count: number }).count
  const totalVenues = (db.prepare("SELECT COUNT(*) as count FROM venues").get() as { count: number }).count

  return NextResponse.json({ users, concerts, totals: { artists: totalArtists, venues: totalVenues } } satisfies AdminData)
}
