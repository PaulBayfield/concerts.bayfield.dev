"use client"

import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useTranslations } from "next-intl"
import { Search, Loader2 } from "lucide-react"

const pinIcon = L.divIcon({
  html: `<div style="color:#e11d48;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  </div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
})

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(parseFloat(e.latlng.lat.toFixed(6)), parseFloat(e.latlng.lng.toFixed(6)))
    },
  })
  return null
}

function RecenterOnPin({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], Math.max(map.getZoom(), 13))
  }, [lat, lng, map])
  return null
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] } // [lng, lat]
  properties: {
    name?: string
    city?: string
    state?: string
    country?: string
    countrycode?: string
    street?: string
    housenumber?: string
  }
}

interface VenueMapPickerProps {
  lat: number | null
  lng: number | null
  onChange: (lat: number, lng: number) => void
  searchHint?: string
}


export function VenueMapPicker({ lat, lng, onChange, searchHint }: VenueMapPickerProps) {
  const t = useTranslations("AddConcert")
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<PhotonFeature[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync searchHint on open (when dialog resets)
  useEffect(() => {
    setQuery(searchHint ?? "")
    setResults([])
    setShowResults(false)
  }, [searchHint])

  // Close dropdown on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [])

  const search = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!q.trim()) { setResults([]); setShowResults(false); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        const features: PhotonFeature[] = data.features ?? []
        setResults(features)
        setShowResults(features.length > 0)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)
  }

  const handleSelect = (feature: PhotonFeature) => {
    const [lng, lat] = feature.geometry.coordinates
    onChange(parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6)))
    const label = formatLabel(feature)
    setQuery(label)
    setShowResults(false)
    setResults([])
  }

  const formatLabel = (f: PhotonFeature) => {
    const p = f.properties
    return [p.name, p.city ?? p.state, p.country]
      .filter(Boolean)
      .join(", ")
  }

  return (
    <div className="space-y-1.5">
      {/* Geocoding search */}
      {(
        <div ref={containerRef} className="relative">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            {loading && (
              <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
            )}
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); search(e.target.value) }}
              onFocus={() => results.length > 0 && setShowResults(true)}
              placeholder={t("geocodeSearch")}
              className="w-full pl-8 pr-8 py-1.5 text-sm rounded-md border bg-background placeholder:text-muted-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          {showResults && (
            <div className="absolute top-full mt-1 w-full z-50 rounded-md border bg-popover shadow-md overflow-hidden">
              {results.map((f, i) => (
                <button
                  key={i}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
                  onMouseDown={() => handleSelect(f)}
                >
                  {formatLabel(f)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">{t("mapPickerHint")}</p>

      <div className="rounded-md overflow-hidden border" style={{ height: 220 }}>
        <MapContainer
          center={lat && lng ? [lat, lng] : [47.5, 4]}
          zoom={lat && lng ? 13 : 4}
          style={{ height: "100%", width: "100%" }}
          className="cursor-crosshair"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onChange={onChange} />
          {lat !== null && lng !== null && (
            <>
              <Marker position={[lat, lng]} icon={pinIcon} />
              <RecenterOnPin lat={lat} lng={lng} />
            </>
          )}
        </MapContainer>
      </div>

      {lat !== null && lng !== null && (
        <p className="text-xs text-muted-foreground tabular-nums">
          {lat}, {lng}
        </p>
      )}
    </div>
  )
}
