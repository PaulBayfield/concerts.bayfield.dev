import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { getTranslations } from "next-intl/server"
import { SiteHeader } from "@/components/site-header"
import { Users, Music2, MapPin, CalendarDays, ChevronDown } from "lucide-react"

type UserStats = {
  email: string
  concert_count: number
  artist_count: number
  venue_count: number
}

type ConcertRow = {
  id: number
  date: string | null
  user_email: string | null
  artist_name: string
  venue_name: string
  city: string | null
  country: string | null
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  const adminEmail = process.env.ADMIN_EMAIL

  if (!session?.user?.email || !adminEmail || session.user.email !== adminEmail) {
    redirect("/")
  }

  const t = await getTranslations("Admin")
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
  `).all() as UserStats[]

  const concerts = db.prepare(`
    SELECT c.id, c.date, c.user_email, a.name as artist_name, v.name as venue_name, v.city, v.country
    FROM concerts c
    JOIN artists a ON a.id = c.artist_id
    JOIN venues v ON v.id = c.venue_id
    ORDER BY c.user_email, c.date DESC
  `).all() as ConcertRow[]

  const totalArtists = (db.prepare("SELECT COUNT(*) as count FROM artists").get() as { count: number }).count
  const totalVenues = (db.prepare("SELECT COUNT(*) as count FROM venues").get() as { count: number }).count
  const totalConcerts = (db.prepare("SELECT COUNT(*) as count FROM concerts").get() as { count: number }).count
  const unattributedCount = (db.prepare("SELECT COUNT(*) as count FROM concerts WHERE user_email IS NULL").get() as { count: number }).count

  const concertsByUser = concerts.reduce<Record<string, ConcertRow[]>>((acc, c) => {
    const key = c.user_email ?? "__unattributed__"
    if (!acc[key]) acc[key] = []
    acc[key].push(c)
    return acc
  }, {})

  const unattributedConcerts = concertsByUser["__unattributed__"] ?? []

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <SiteHeader pageTitle={t("title")} />

      <main className="flex-1 overflow-auto p-6 space-y-6 max-w-5xl mx-auto w-full">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={<Users className="h-4 w-4" />} label={t("totalUsers")} value={users.length} />
          <StatCard icon={<CalendarDays className="h-4 w-4" />} label={t("totalConcerts")} value={totalConcerts} />
          <StatCard icon={<Music2 className="h-4 w-4" />} label={t("totalArtists")} value={totalArtists} />
          <StatCard icon={<MapPin className="h-4 w-4" />} label={t("totalVenues")} value={totalVenues} />
        </div>

        {/* Users list */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
            {t("usersSection")}
          </h2>

          {users.length === 0 && unattributedCount === 0 ? (
            <p className="text-muted-foreground text-sm py-4">{t("noUsers")}</p>
          ) : (
            <div className="space-y-2">
              {users.map(user => (
                <UserRow
                  key={user.email}
                  label={user.email}
                  concertCount={user.concert_count}
                  artistCount={user.artist_count}
                  venueCount={user.venue_count}
                  concerts={concertsByUser[user.email] ?? []}
                  t={t}
                />
              ))}

              {unattributedConcerts.length > 0 && (
                <UserRow
                  label={t("unattributed")}
                  concertCount={unattributedConcerts.length}
                  artistCount={new Set(unattributedConcerts.map(c => c.artist_name)).size}
                  venueCount={new Set(unattributedConcerts.map(c => c.venue_name)).size}
                  concerts={unattributedConcerts}
                  t={t}
                  muted
                />
              )}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}

function UserRow({
  label,
  concertCount,
  artistCount,
  venueCount,
  concerts,
  t,
  muted,
}: {
  label: string
  concertCount: number
  artistCount: number
  venueCount: number
  concerts: { id: number; date: string | null; artist_name: string; venue_name: string; city: string | null }[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string) => string
  muted?: boolean
}) {
  return (
    <details className="group border rounded-lg overflow-hidden bg-card">
      <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors list-none select-none">
        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
        <span className={`font-medium text-sm truncate flex-1 ${muted ? "text-muted-foreground italic" : ""}`}>
          {label}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <Pill>{concertCount} {t("concerts")}</Pill>
          <Pill>{artistCount} {t("artists")}</Pill>
          <Pill className="hidden sm:flex">{venueCount} {t("venues")}</Pill>
        </div>
      </summary>

      <div className="border-t">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30">
              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground w-28">{t("date")}</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">{t("artist")}</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">{t("venue")}</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground hidden md:table-cell">{t("city")}</th>
            </tr>
          </thead>
          <tbody>
            {concerts.map((c, i) => (
              <tr key={c.id} className={i > 0 ? "border-t border-border/40" : ""}>
                <td className="px-4 py-2 tabular-nums text-muted-foreground text-xs">{c.date ?? "—"}</td>
                <td className="px-4 py-2">{c.artist_name}</td>
                <td className="px-4 py-2 text-muted-foreground">{c.venue_name}</td>
                <td className="px-4 py-2 text-muted-foreground hidden md:table-cell">{c.city ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="border rounded-lg px-4 py-3 bg-card space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  )
}

function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground ${className ?? ""}`}>
      {children}
    </span>
  )
}
