"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { SiteHeader } from "@/components/site-header"
import { EditArtistDialog } from "@/components/edit-artist-dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { Music, Search, MapPin, ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import ReactCountryFlag from "react-country-flag"
import type { ArtistWithConcerts } from "@/app/api/artists/route"

function ArtistRow({
  artist,
  session,
  onUpdated,
  onDeleted,
}: {
  artist: ArtistWithConcerts
  session: boolean
  onUpdated: () => void
  onDeleted: (id: number) => void
}) {
  const t = useTranslations("Artists")
  const [expanded, setExpanded] = useState(false)
  const venueList = artist.venues ? artist.venues.split(",") : []
  const dateList = artist.dates ? artist.dates.split(",") : []

  return (
    <div className="rounded-lg border bg-card p-4 transition-colors">
      <div
        className="flex items-center justify-between gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          {artist.country && (
            <ReactCountryFlag
              countryCode={artist.country}
              svg
              style={{ width: "1.4em", height: "1.4em" }}
              title={artist.country}
            />
          )}
          <span className="font-semibold truncate">{artist.name}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant="secondary" className="gap-1">
            <Music className="h-3 w-3" />
            {artist.concertCount}
          </Badge>
          {session && (
            <>
              <EditArtistDialog artist={artist} onUpdated={onUpdated} />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={e => e.stopPropagation()}
                  >
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
                      onClick={() => onDeleted(artist.id)}
                    >
                      {t("deleteConfirmButton")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>
      {expanded && venueList.length > 0 && (
        <div className="mt-3 space-y-1.5 border-t pt-3">
          {venueList.map((venue, i) => (
            <div key={i} className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{venue.trim()}</span>
              </div>
              {dateList[i] && (
                <span className="shrink-0 ml-3 tabular-nums text-xs">
                  {new Date(dateList[i]).toLocaleDateString("fr-FR")}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ArtistsPage() {
  const t = useTranslations("Artists")
  const { data: session } = useSession()
  const [artists, setArtists] = useState<ArtistWithConcerts[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const fetchArtists = useCallback(async () => {
    fetch("/api/artists")
      .then((r) => r.json())
      .then(setArtists)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchArtists() }, [fetchArtists])

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/artists/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success(t("deleteSuccess"))
      fetchArtists()
    } catch {
      toast.error(t("deleteError"))
    }
  }

  const filtered = artists.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.reduce<Record<string, ArtistWithConcerts[]>>((acc, a) => {
    const letter = a.name[0].toUpperCase()
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(a)
    return acc
  }, {})
  const letters = Object.keys(grouped).sort()

  return (
    <>
      <SiteHeader pageTitle={t("title")} />
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
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : letters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
            <Music className="h-12 w-12" />
            <p>{t("noResults")}</p>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="space-y-6">
              {letters.map((letter) => (
                <div key={letter}>
                  <div className="text-xs font-bold text-muted-foreground tracking-widest mb-2 px-1">{letter}</div>
                  <div className="space-y-2">
                    {grouped[letter].map((artist) => (
                      <ArtistRow
                        key={artist.id}
                        artist={artist}
                        session={!!session}
                        onUpdated={fetchArtists}
                        onDeleted={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </>
  )
}
