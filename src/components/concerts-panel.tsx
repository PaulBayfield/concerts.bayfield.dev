"use client"

import { useState } from "react"
import { Music, MapPin, Search, CalendarDays } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { Concert } from "@/app/api/concerts/route"
import { useTranslations } from "next-intl"

interface ConcertsPanelProps {
  concerts: Concert[]
  selectedVenueId?: number | null
  onVenueSelect?: (venueId: number) => void
}

export function ConcertsPanel({ concerts, selectedVenueId, onVenueSelect }: ConcertsPanelProps) {
  const t = useTranslations("Concerts")
  const [search, setSearch] = useState("")

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
    <div className="flex flex-col h-full min-h-0">
      {/* Fixed header */}
      <div className="px-4 pt-4 pb-3 shrink-0 border-b">
        <h2 className="font-semibold text-base mb-3">{t("title")}</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {t("count", { count: filtered.length })}
        </p>
      </div>

      {/* Scrollable list */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-4 py-3">
          {years.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
              <Music className="h-8 w-8" />
              <p className="text-sm">{t("noResults")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {years.map((year) => (
                <div key={year}>
                  <div className="sticky top-0 bg-background/90 backdrop-blur-sm py-1 mb-1 z-10">
                    <span className="text-xs font-bold text-muted-foreground tracking-widest">{year}</span>
                  </div>
                  <div className="space-y-1">
                    {grouped[year].map((concert) => (
                      <button
                        key={concert.id}
                        onClick={() => onVenueSelect?.(concert.venue_id)}
                        className={`w-full text-left rounded-lg border p-3 transition-colors cursor-pointer ${
                          selectedVenueId === concert.venue_id
                            ? "border-primary bg-primary/5"
                            : "bg-card hover:bg-accent/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{concert.artist_name}</p>
                            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{concert.venue_name}</span>
                            </div>
                          </div>
                          {concert.date && (
                            <Badge variant="outline" className="text-xs shrink-0 gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {new Date(concert.date).toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
