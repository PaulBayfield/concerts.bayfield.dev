"use client"

import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { AddConcertDialog } from "@/components/add-concert-dialog"
import type { Venue } from "@/app/api/venues/route"
import type { ArtistWithConcerts } from "@/app/api/artists/route"

const CONCERTS_CHANGED = "concerts:changed"

/** Notify every listening page that concerts (and related venues/artists) changed. */
export function notifyConcertsChanged() {
  window.dispatchEvent(new Event(CONCERTS_CHANGED))
}

/** Run `callback` whenever a concert is added from anywhere in the app. */
export function useConcertsChanged(callback: () => void) {
  const ref = useRef(callback)
  useEffect(() => { ref.current = callback })

  useEffect(() => {
    const handler = () => ref.current()
    window.addEventListener(CONCERTS_CHANGED, handler)
    return () => window.removeEventListener(CONCERTS_CHANGED, handler)
  }, [])
}

/**
 * Add-concert button usable from any page: loads its own venues/artists
 * and broadcasts a change event after a concert is added.
 */
export function QuickAddConcert({
  iconOnly,
  triggerClassName,
}: {
  iconOnly?: boolean
  triggerClassName?: string
}) {
  const { data: session } = useSession()
  const [venues, setVenues] = useState<Venue[]>([])
  const [artists, setArtists] = useState<ArtistWithConcerts[]>([])

  // Bumped after each add so the venue/artist suggestions include new entries
  const [version, setVersion] = useState(0)
  useConcertsChanged(() => setVersion((v) => v + 1))

  useEffect(() => {
    if (!session) return
    let cancelled = false
    Promise.all([
      fetch("/api/venues").then((r) => r.json()),
      fetch("/api/artists").then((r) => r.json()),
    ])
      .then(([v, a]) => {
        if (cancelled) return
        setVenues(v)
        setArtists(a)
      })
      .catch(console.error)
    return () => { cancelled = true }
  }, [session, version])

  if (!session) return null

  return (
    <AddConcertDialog
      venues={venues}
      artists={artists}
      onConcertAdded={notifyConcertsChanged}
      iconOnly={iconOnly}
      triggerClassName={triggerClassName}
    />
  )
}
