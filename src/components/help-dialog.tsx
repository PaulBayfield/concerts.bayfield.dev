"use client"

import { HelpCircle } from "lucide-react"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useTranslations } from "next-intl"

export default function HelpDialog() {
  const t = useTranslations("Help")

  return (
    <Dialog>
      <DialogTrigger asChild>
        <SidebarMenuButton tooltip={t("title")}>
          <HelpCircle />
          <span>{t("title")}</span>
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
