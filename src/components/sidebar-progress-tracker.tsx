"use client"

import { Music } from "lucide-react"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useTranslations } from "next-intl"

export function SidebarProgressTracker() {
  const t = useTranslations("Sidebar")

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="sm" className="text-muted-foreground cursor-default">
          <Music className="h-4 w-4" />
          <span className="text-xs">{t("footer")}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
