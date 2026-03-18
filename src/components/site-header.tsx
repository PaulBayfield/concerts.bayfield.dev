"use client"

import { ReactNode } from "react"

import { ModeToggle } from "@/components/mode-toggle"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

import { useTranslations } from "next-intl"
import { LanguageSwitcher } from "@/components/language-switcher"
import { UserNav } from "@/components/user-nav"

export function SiteHeader({ pageTitle, children }: { pageTitle?: string; children?: ReactNode }) {
  const t = useTranslations("SiteHeader")

  return (
    <header
      className="
        sticky top-0 z-50
        flex h-(--header-height) shrink-0
        items-center gap-2
        border-b bg-background/70 dark:bg-background/0 backdrop-blur-md
        transition-[width,height] ease-linear
        group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)
        rounded-t-2xl
      "
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-full"
        />
        <h1 className="text-base font-medium -ml-5 md:-ml-0">{pageTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          {children}
          <UserNav />
          <LanguageSwitcher />
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
