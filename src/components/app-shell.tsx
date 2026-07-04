"use client"

import { usePathname } from "@/i18n/routing"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"

export function AppShell({
  children,
  isAdmin,
}: {
  children: React.ReactNode
  isAdmin?: boolean
}) {
  const pathname = usePathname()

  if (pathname === "/") {
    return <main className="flex w-full flex-1 flex-col min-w-0">{children}</main>
  }

  return (
    <>
      <AppSidebar variant="inset" isAdmin={isAdmin} />
      <SidebarInset className="flex flex-1 flex-col">{children}</SidebarInset>
    </>
  )
}
