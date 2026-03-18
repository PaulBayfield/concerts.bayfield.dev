"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { SiteHeader } from "@/components/site-header"
import { AddConcertDialog } from "@/components/add-concert-dialog"
import { EditConcertDialog } from "@/components/edit-concert-dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Music, Search, MapPin, CalendarDays, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import type { Concert } from "@/app/api/concerts/route"
import type { Venue } from "@/app/api/venues/route"
import type { ArtistWithConcerts } from "@/app/api/artists/route"

export default function ConcertsPage() {
  const t = useTranslations("Concerts")
  const { data: session } = useSession()
  const [concerts, setConcerts] = useState<Concert[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [artists, setArtists] = useState<ArtistWithConcerts[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const fetchAll = useCallback(async () => {
    try {
      const [c, v, a] = await Promise.all([
        fetch("/api/concerts").then((r) => r.json()),
        fetch("/api/venues").then((r) => r.json()),
        fetch("/api/artists").then((r) => r.json()),
      ])
      setConcerts(c)
      setVenues(v)
      setArtists(a)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/concerts/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success(t("deleteSuccess"))
      fetchAll()
    } catch {
      toast.error(t("deleteError"))
    }
  }

  const filtered = concerts.filter(
    (c) =>
      c.artist_name.toLowerCase().includes(search.toLowerCase()) ||
      c.venue_name.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.reduce<Record<string, Concert[]>>((acc, concert) => {
    const year = concert.date ? new Date(concert.date).getFullYear().toString() : t("unknownYear")
    if (!acc[year]) acc[year] = []
    acc[year].push(concert)
    return acc
  }, {})
  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a))

  return (
    <>
      <SiteHeader pageTitle={t("title")}>
        {session && !loading && (
          <AddConcertDialog venues={venues} artists={artists} onConcertAdded={fetchAll} />
        )}
      </SiteHeader>
      <div className="flex flex-1 flex-col p-6 gap-4 max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {!loading && (
            <span className="text-sm text-muted-foreground shrink-0">
              {t("count", { count: filtered.length })}
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : years.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
            <Music className="h-12 w-12" />
            <p>{t("noResults")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {years.map((year) => (
              <div key={year}>
                <div className="text-xs font-bold text-muted-foreground tracking-widest mb-2 px-1">{year}</div>
                <div className="space-y-2">
                  {grouped[year].map((concert) => (
                    <div key={concert.id} className="rounded-lg border bg-card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold truncate">{concert.artist_name}</p>
                          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{concert.venue_name}</span>
                            {concert.venue_city && (
                              <span className="text-muted-foreground/60">— {concert.venue_city}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {concert.date && (
                            <Badge variant="outline" className="gap-1 text-xs">
                              <CalendarDays className="h-3 w-3" />
                              {new Date(concert.date).toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </Badge>
                          )}
                          {session && (
                            <>
                              <EditConcertDialog concert={concert} venues={venues} artists={artists} onUpdated={fetchAll} />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t("deleteConfirm")}</AlertDialogTitle>
                                    <AlertDialogDescription>{t("deleteDescription")}</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t("deleteCancel")}</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => handleDelete(concert.id)}
                                    >
                                      {t("deleteConfirmButton")}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
