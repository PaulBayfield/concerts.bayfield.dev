"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useTranslations } from "next-intl"

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
    map.setView([lat, lng], map.getZoom())
  }, [lat, lng, map])
  return null
}

interface VenueMapPickerProps {
  lat: number | null
  lng: number | null
  onChange: (lat: number, lng: number) => void
}

export function VenueMapPicker({ lat, lng, onChange }: VenueMapPickerProps) {
  const t = useTranslations("AddConcert")

  return (
    <div className="space-y-1.5">
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
