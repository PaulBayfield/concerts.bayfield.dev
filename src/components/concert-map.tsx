"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Venue } from "@/app/api/venues/route"
import { MapPin, Music } from "lucide-react"
import { useTranslations } from "next-intl"

function FitBounds({ venues }: { venues: Venue[] }) {
  const map = useMap()

  useEffect(() => {
    const valid = venues.filter(v => v.latitude && v.longitude)
    if (valid.length === 0) return
    if (valid.length === 1) {
      map.setView([valid[0].latitude!, valid[0].longitude!], 13)
      return
    }
    const bounds = L.latLngBounds(valid.map(v => [v.latitude!, v.longitude!] as [number, number]))
    map.fitBounds(bounds, { padding: [40, 40] })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once on mount only

  return null
}

function FlyToVenue({ venues, focusedVenueId }: { venues: Venue[]; focusedVenueId: number | null }) {
  const map = useMap()

  useEffect(() => {
    if (!focusedVenueId) return
    const venue = venues.find(v => v.id === focusedVenueId)
    if (!venue?.latitude || !venue?.longitude) return
    map.flyTo([venue.latitude, venue.longitude], Math.max(map.getZoom(), 13), { duration: 0.6 })
  }, [focusedVenueId, map, venues])

  return null
}

interface ConcertMapProps {
  venues: Venue[]
  selectedVenueId?: number | null
  focusedVenueId?: number | null
  onVenueSelect?: (venue: Venue) => void
}

export function ConcertMap({ venues, selectedVenueId, focusedVenueId, onVenueSelect }: ConcertMapProps) {
  const t = useTranslations("Map")
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/30 rounded-lg">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <MapPin className="h-8 w-8 animate-pulse" />
          <p className="text-sm">{t("loading")}</p>
        </div>
      </div>
    )
  }

  const validVenues = venues.filter(v => v.latitude !== null && v.longitude !== null)
  const activeFocusId = focusedVenueId ?? selectedVenueId

  return (
    <>
      <style>{`
        .concert-marker { color: hsl(var(--primary)); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4)); transition: transform 0.15s; }
        .concert-marker:hover { transform: scale(1.25); }
        .concert-marker-active { color: hsl(var(--destructive)); transform: scale(1.3); }
        .leaflet-popup-content-wrapper { border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
        .leaflet-popup-tip { background: white; }
      `}</style>
      <MapContainer center={[47.5, 4]} zoom={5} className="h-full w-full rounded-lg z-0" style={{ minHeight: "400px" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds venues={validVenues} />
        <FlyToVenue venues={validVenues} focusedVenueId={activeFocusId ?? null} />
        {validVenues.map((venue) => {
          const isActive = activeFocusId === venue.id
          const icon = L.divIcon({
            html: `<div class="concert-marker${isActive ? " concert-marker-active" : ""}">
              <svg xmlns="http://www.w3.org/2000/svg" width="${isActive ? 32 : 28}" height="${isActive ? 32 : 28}" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>`,
            className: "",
            iconSize: [isActive ? 36 : 32, isActive ? 36 : 32],
            iconAnchor: [isActive ? 18 : 16, isActive ? 36 : 32],
            popupAnchor: [0, -34],
          })
          return (
            <Marker
              key={venue.id}
              position={[venue.latitude!, venue.longitude!]}
              icon={icon}
              eventHandlers={{ click: () => onVenueSelect?.(venue) }}
            >
              <Popup>
                <div className="p-1 min-w-[160px]">
                  <p className="font-semibold text-sm">{venue.name}</p>
                  {venue.city && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {venue.city}{venue.country ? `, ${venue.country}` : ""}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                    <Music className="h-3 w-3" />
                    <span>{venue.concertCount} {t("concerts", { count: venue.concertCount })}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </>
  )
}
