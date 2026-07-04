"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ConcertsPanel } from "@/components/concerts-panel"
import { demoVenues, demoConcerts } from "@/lib/demo-data"

const ConcertMap = dynamic(
  () => import("@/components/concert-map").then((m) => m.ConcertMap),
  { ssr: false, loading: () => <Skeleton className="h-full w-full rounded-lg" /> }
)

export function DemoPreview() {
  const t = useTranslations("Home")
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="w-full h-11 gap-2">
          <Eye className="h-4 w-4" />
          {t("demoCta")}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[calc(100%-1.5rem)] sm:max-w-5xl h-[85vh] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-4 py-3 border-b shrink-0">
          <DialogTitle>{t("demoCta")}</DialogTitle>
          <p className="text-xs text-muted-foreground">{t("demoBanner")}</p>
        </DialogHeader>

        <div className="flex flex-1 min-h-0 flex-col sm:flex-row">
          <div className="flex-1 min-w-0 p-3 h-64 sm:h-full">
            <ConcertMap
              venues={demoVenues}
              selectedVenueId={selectedVenueId}
              onVenueSelect={(v) => setSelectedVenueId(v.id === selectedVenueId ? null : v.id)}
            />
          </div>
          <div className="sm:w-80 shrink-0 border-t sm:border-t-0 sm:border-l min-h-0 flex-1 sm:flex-none">
            <ConcertsPanel
              concerts={demoConcerts}
              selectedVenueId={selectedVenueId}
              onVenueSelect={(id) => setSelectedVenueId(id === selectedVenueId ? null : id)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
