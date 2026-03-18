"use client"

import { useState } from "react"
import { Pencil, Loader2 } from "lucide-react"
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
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { CountrySelect } from "@/components/country-select"
import type { ArtistWithConcerts } from "@/app/api/artists/route"

interface EditArtistDialogProps {
  artist: ArtistWithConcerts
  onUpdated: () => void
}

export function EditArtistDialog({ artist, onUpdated }: EditArtistDialogProps) {
  const t = useTranslations("Artists")
  const tA = useTranslations("AddConcert")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(artist.name)
  const [country, setCountry] = useState(artist.country ?? "")

  const handleOpen = (v: boolean) => {
    if (v) {
      setName(artist.name)
      setCountry(artist.country ?? "")
    }
    setOpen(v)
  }

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/artists/${artist.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), country: country || null }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || t("editError"))
      }
      toast.success(t("editSuccess"))
      setOpen(false)
      onUpdated()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("editError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={e => e.stopPropagation()}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t("editTitle")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>{t("nameLabel")}</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>{tA("artistNationality")}</Label>
            <CountrySelect value={country} onChange={setCountry} placeholder={tA("selectCountry")} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {tA("cancel")}
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("editSave")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
