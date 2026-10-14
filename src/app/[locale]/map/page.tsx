"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { useSession } from "next-auth/react"
import { SiteHeader } from "@/components/site-header"
import { ConcertsPanel } from "@/components/concerts-panel"
import { QuickAddConcert, useConcertsChanged } from "@/components/quick-add-concert"
import { RightSidebar, useRightSidebar } from "@/components/right-sidebar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ListMusic, X } from "lucide-react"
import type { Venue } from "@/app/api/venues/route"
import type { Concert } from "@/app/api/concerts/route"
import { useTranslations } from "next-intl"

const ConcertMap = dynamic(
  () => import("@/components/concert-map").then((m) => m.ConcertMap),
  { ssr: false, loading: () => <Skeleton className="h-full w-full rounded-lg" /> }
)

export default function Page() {
  const t = useTranslations("MapPage")
  const { data: session } = useSession()
  const { isMobile, openMobile: panelOpen, setOpenMobile: setPanelOpen } = useRightSidebar()
  const [venues, setVenues] = useState<Venue[]>([])
  const [concerts, setConcerts] = useState<Concert[]>([])
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [venuesData, concertsData] = await Promise.all([
        fetch("/api/venues").then((r) => r.json()),
        fetch("/api/concerts").then((r) => r.json()),
      ])
      setVenues(venuesData)
      setConcerts(concertsData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useConcertsChanged(fetchData)

  const panelContent = (variant: "default" | "sidebar") =>
    loading ? (
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-full" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    ) : (
      <ConcertsPanel
        variant={variant}
        footer={session ? <QuickAddConcert triggerClassName="w-full" /> : undefined}
        concerts={concerts}
        selectedVenueId={selectedVenueId}
        onVenueSelect={(id) => setSelectedVenueId(id === selectedVenueId ? null : id)}
      />
    )

  return (
    <>
      <SiteHeader pageTitle={t("title")} showRightSidebarTrigger />

      {/* Desktop: expanded content of the right sidebar (the shell renders the collapsed rail) */}
      <RightSidebar>{!isMobile && panelContent("sidebar")}</RightSidebar>

      <div className="relative flex flex-1 h-[calc(100vh-var(--header-height))] max-h-screen min-h-0 overflow-hidden">

        {/* Map — always fills the container */}
        <div className="flex-1 min-w-0 p-3 h-full">
          {loading ? (
            <Skeleton className="h-full w-full rounded-lg" />
          ) : (
            <ConcertMap
              venues={venues}
              selectedVenueId={selectedVenueId}
              onVenueSelect={(v) => setSelectedVenueId(v.id === selectedVenueId ? null : v.id)}
            />
          )}
        </div>

        {/* Mobile: fixed bottom sheet, slides up/down */}
        <aside
          className={[
            "md:hidden bg-background flex flex-col min-h-0 overflow-hidden transition-all duration-300",
            "fixed inset-x-0 bottom-0 z-40 rounded-t-2xl border-t h-[72vh]",
            panelOpen ? "translate-y-0" : "translate-y-full",
          ].join(" ")}
        >
          {/* Drag handle + close button */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0 border-b relative">
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-muted-foreground/30" />
            <span className="text-sm font-semibold">{t("concerts")}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPanelOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {isMobile && panelContent("default")}
        </aside>

        {/* Overlay backdrop on mobile when panel open */}
        {panelOpen && (
          <div
            className="md:hidden fixed inset-0 z-30 bg-black/20"
            onClick={() => setPanelOpen(false)}
          />
        )}

        {/* Bottom FABs */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-50 pointer-events-none">
          {/* Mobile panel toggle */}
          <Button
            className="pointer-events-auto shadow-lg gap-2 md:hidden"
            variant={panelOpen ? "secondary" : "default"}
            onClick={() => setPanelOpen(!panelOpen)}
          >
            {panelOpen ? <X className="h-4 w-4" /> : <ListMusic className="h-4 w-4" />}
            <span>{panelOpen ? t("hidePanel") : t("showPanel")}</span>
            {!panelOpen && concerts.length > 0 && (
              <span className="ml-0.5 text-xs opacity-80">({concerts.length})</span>
            )}
          </Button>
        </div>

      </div>
    </>
  )
}
