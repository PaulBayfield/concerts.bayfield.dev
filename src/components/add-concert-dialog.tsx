"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { CountrySelect } from "@/components/country-select"
import type { Venue } from "@/app/api/venues/route"
import type { ArtistWithConcerts } from "@/app/api/artists/route"

const VenueMapPicker = dynamic(
  () => import("@/components/venue-map-picker").then(m => m.VenueMapPicker),
  { ssr: false, loading: () => <div className="h-[220px] rounded-md border bg-muted animate-pulse" /> }
)

interface AddConcertDialogProps {
  venues: Venue[]
  artists: ArtistWithConcerts[]
  onConcertAdded: () => void
}

export function AddConcertDialog({ venues, artists, onConcertAdded }: AddConcertDialogProps) {
  const t = useTranslations("AddConcert")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Artist
  const [artistQuery, setArtistQuery] = useState("")
  const [artistCountry, setArtistCountry] = useState("")
  const [showArtistSuggestions, setShowArtistSuggestions] = useState(false)

  // Venue
  const [venueQuery, setVenueQuery] = useState("")
  const [venueCity, setVenueCity] = useState("")
  const [venueCountry, setVenueCountry] = useState("")
  const [venueLat, setVenueLat] = useState<number | null>(null)
  const [venueLng, setVenueLng] = useState<number | null>(null)
  const [showVenueSuggestions, setShowVenueSuggestions] = useState(false)

  // Date
  const [date, setDate] = useState("")

  const matchedArtist = artists.find(a => a.name.toLowerCase() === artistQuery.toLowerCase())
  const matchedVenue = venues.find(v => v.name.toLowerCase() === venueQuery.toLowerCase())

  const artistSuggestions = artistQuery.length > 0 && !matchedArtist
    ? artists.filter(a => a.name.toLowerCase().includes(artistQuery.toLowerCase())).slice(0, 5)
    : []

  const venueSuggestions = venueQuery.length > 0 && !matchedVenue
    ? venues.filter(v => v.name.toLowerCase().includes(venueQuery.toLowerCase())).slice(0, 5)
    : []

  const isNewVenue = !matchedVenue && venueQuery.trim().length > 0

  const reset = () => {
    setArtistQuery(""); setArtistCountry("")
    setVenueQuery(""); setVenueCity(""); setVenueCountry(""); setVenueLat(null); setVenueLng(null)
    setDate("")
  }

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!artistQuery.trim() || !venueQuery.trim() || !date) return
    setLoading(true)
    try {
      const body: Record<string, unknown> = { date }

      if (matchedArtist) {
        body.artist_id = matchedArtist.id
      } else {
        body.artist_name = artistQuery.trim()
        if (artistCountry) body.artist_country = artistCountry
      }

      if (matchedVenue) {
        body.venue_id = matchedVenue.id
      } else {
        body.venue_name = venueQuery.trim()
        if (venueCity) body.venue_city = venueCity.trim()
        if (venueCountry) body.venue_country = venueCountry
        if (venueLat !== null) body.venue_latitude = venueLat
        if (venueLng !== null) body.venue_longitude = venueLng
      }

      const res = await fetch("/api/concerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to add concert")
      }
      toast.success(t("success"))
      reset()
      setOpen(false)
      onConcertAdded()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          {t("trigger")}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

            {/* ── Artist ── */}
            <div className="space-y-2">
              <Label>{t("artist")}</Label>
              <div className="relative">
                <Input
                  placeholder={t("artistPlaceholder")}
                  value={artistQuery}
                  onChange={e => { setArtistQuery(e.target.value); setShowArtistSuggestions(true) }}
                  onFocus={() => setShowArtistSuggestions(true)}
                  required
                />
                {showArtistSuggestions && artistSuggestions.length > 0 && (
                  <div className="absolute top-full mt-1 w-full z-50 rounded-md border bg-popover shadow-md">
                    {artistSuggestions.map(a => (
                      <button
                        key={a.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
                        onMouseDown={() => { setArtistQuery(a.name); setShowArtistSuggestions(false) }}
                      >
                        {a.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {matchedArtist ? (
                <p className="text-xs text-emerald-600">{t("existingArtist")}</p>
              ) : artistQuery.trim() ? (
                <div className="pl-3 border-l-2 border-muted space-y-2">
                  <p className="text-xs text-muted-foreground">{t("newArtist")}</p>
                  <CountrySelect
                    value={artistCountry}
                    onChange={setArtistCountry}
                    placeholder={t("artistNationality")}
                  />
                </div>
              ) : null}
            </div>

            {/* ── Venue ── */}
            <div className="space-y-2">
              <Label>{t("venue")}</Label>
              <div className="relative">
                <Input
                  placeholder={t("venuePlaceholder")}
                  value={venueQuery}
                  onChange={e => { setVenueQuery(e.target.value); setShowVenueSuggestions(true) }}
                  onFocus={() => setShowVenueSuggestions(true)}
                  required
                />
                {showVenueSuggestions && venueSuggestions.length > 0 && (
                  <div className="absolute top-full mt-1 w-full z-50 rounded-md border bg-popover shadow-md">
                    {venueSuggestions.map(v => (
                      <button
                        key={v.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
                        onMouseDown={() => { setVenueQuery(v.name); setShowVenueSuggestions(false) }}
                      >
                        <span>{v.name}</span>
                        {v.city && <span className="text-muted-foreground ml-1">— {v.city}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {matchedVenue ? (
                <p className="text-xs text-emerald-600">{t("existingVenue")}</p>
              ) : isNewVenue ? (
                <div className="pl-3 border-l-2 border-muted space-y-3">
                  <p className="text-xs text-muted-foreground">{t("newVenue")}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t("venueCityLabel")}</Label>
                      <Input
                        placeholder={t("venueCityPlaceholder")}
                        value={venueCity}
                        onChange={e => setVenueCity(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t("venueCountryLabel")}</Label>
                      <CountrySelect
                        value={venueCountry}
                        onChange={setVenueCountry}
                        placeholder={t("selectCountry")}
                        className="h-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("venueCoordinates")}</Label>
                    <VenueMapPicker lat={venueLat} lng={venueLng} onChange={(lat, lng) => { setVenueLat(lat); setVenueLng(lng) }} searchHint={[venueQuery, venueCity].filter(Boolean).join(" ")} />
                  </div>
                </div>
              ) : null}
            </div>

            {/* ── Date ── */}
            <div className="space-y-2">
              <Label>{t("date")}</Label>
              <Input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={loading || !artistQuery.trim() || !venueQuery.trim() || !date}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t("submit")}
              </Button>
            </div>

          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
