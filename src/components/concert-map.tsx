"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Map, MapClusterLayer, MapControls, MapPopup, useMap } from "@/components/ui/map"
import type { Venue } from "@/app/api/venues/route"
import { Music } from "lucide-react"
import { useTranslations } from "next-intl"

// Site palette (approximated from oklch variables)
// --primary light: oklch(0.852 0.199 91.936) ≈ #c8bb28 (golden yellow)
// --chart-3:       oklch(0.681 0.162 75.834) ≈ #a88a20 (amber)
// --destructive:   oklch(0.577 0.245 27.325) ≈ #c84030 (red)
const CLUSTER_COLORS: [string, string, string] = ["#c8bb28", "#d47820", "#c84030"]
const CLUSTER_THRESHOLDS: [number, number] = [5, 15]
const POINT_COLOR = "#c8bb28"

type VenueProperties = {
  id: number
  name: string
  city: string | null
  country: string | null
  concertCount: number
}

function venuesToGeoJSON(venues: Venue[]): GeoJSON.FeatureCollection<GeoJSON.Point, VenueProperties> {
  return {
    type: "FeatureCollection",
    features: venues.map((v) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [v.longitude!, v.latitude!] },
      properties: {
        id: v.id,
        name: v.name,
        city: v.city ?? null,
        country: v.country ?? null,
        concertCount: v.concertCount,
      },
    })),
  }
}

function FitBounds({ venues }: { venues: Venue[] }) {
  const { map, isLoaded } = useMap()
  const didFit = useRef(false)

  useEffect(() => {
    if (!map || !isLoaded || didFit.current) return
    const valid = venues.filter((v) => v.latitude && v.longitude)
    if (!valid.length) return
    didFit.current = true
    if (valid.length === 1) {
      map.flyTo({ center: [valid[0].longitude!, valid[0].latitude!], zoom: 13 })
      return
    }
    const lngs = valid.map((v) => v.longitude!)
    const lats = valid.map((v) => v.latitude!)
    map.fitBounds(
      [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)],
      { padding: 40 },
    )
  }, [map, isLoaded, venues])

  return null
}

function FlyToVenue({ venues, focusedVenueId }: { venues: Venue[]; focusedVenueId: number | null }) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!map || !isLoaded || !focusedVenueId) return
    const venue = venues.find((v) => v.id === focusedVenueId)
    if (!venue?.latitude || !venue?.longitude) return
    map.flyTo({ center: [venue.longitude, venue.latitude], zoom: Math.max(map.getZoom(), 13), duration: 600 })
  }, [focusedVenueId, map, isLoaded, venues])

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
  const [selectedPoint, setSelectedPoint] = useState<{
    coordinates: [number, number]
    properties: VenueProperties
  } | null>(null)

  const validVenues = venues.filter((v) => v.latitude !== null && v.longitude !== null)
  const activeFocusId = focusedVenueId ?? selectedVenueId
  const geojson = venuesToGeoJSON(validVenues)

  const handlePointClick = useCallback(
    (feature: GeoJSON.Feature<GeoJSON.Point, VenueProperties>, coordinates: [number, number]) => {
      const venue = validVenues.find((v) => v.id === feature.properties.id)
      if (venue) onVenueSelect?.(venue)
      setSelectedPoint({ coordinates, properties: feature.properties })
    },
    [validVenues, onVenueSelect],
  )

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <Map center={[4, 47.5]} zoom={5} className="rounded-lg" projection={{type: "globe"}}>
        <FitBounds venues={validVenues} />
        <FlyToVenue venues={validVenues} focusedVenueId={activeFocusId ?? null} />

        <MapClusterLayer<VenueProperties>
          data={geojson}
          clusterRadius={50}
          clusterMaxZoom={14}
          clusterColors={CLUSTER_COLORS}
          clusterThresholds={CLUSTER_THRESHOLDS}
          pointColor={POINT_COLOR}
          onPointClick={handlePointClick}
        />

        {selectedPoint && (
          <MapPopup
            key={`${selectedPoint.coordinates[0]}-${selectedPoint.coordinates[1]}`}
            longitude={selectedPoint.coordinates[0]}
            latitude={selectedPoint.coordinates[1]}
            onClose={() => setSelectedPoint(null)}
            closeButton
            closeOnClick={false}
            focusAfterOpen={false}
          >
            <div className="min-w-[160px] space-y-1.5">
              <p className="font-semibold text-sm leading-tight">{selectedPoint.properties.name}</p>
              {selectedPoint.properties.city && (
                <p className="text-xs text-muted-foreground">
                  {selectedPoint.properties.city}
                  {selectedPoint.properties.country ? `, ${selectedPoint.properties.country}` : ""}
                </p>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Music className="h-3 w-3 shrink-0" />
                <span>
                  {selectedPoint.properties.concertCount}{" "}
                  {t("concerts", { count: selectedPoint.properties.concertCount })}
                </span>
              </div>
            </div>
          </MapPopup>
        )}

        <MapControls
          position="bottom-right"
          showZoom
          showCompass
          showLocate
          showFullscreen
        />
      </Map>
    </div>
  )
}
