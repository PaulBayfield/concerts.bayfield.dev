"use client"

import { usePathname } from "@/i18n/routing"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import {
  RightSidebarProvider,
  RightSidebarSlot,
  useRightSidebar,
} from "@/components/right-sidebar"
import { ConcertsPanelRail } from "@/components/concerts-panel"
import { QuickAddConcert } from "@/components/quick-add-concert"

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
    <RightSidebarProvider>
      <AppSidebar variant="inset" isAdmin={isAdmin} />
      {/* Right sidebar provides its own gutter, mirroring the left one */}
      <SidebarInset className="flex flex-1 flex-col md:peer-data-[variant=inset]:mr-0">
        {children}
      </SidebarInset>
      <ShellRightSidebar />
    </RightSidebarProvider>
  )
}

function ShellRightSidebar() {
  const { hasContent, setOpen } = useRightSidebar()

  return (
    <>
      <RightSidebarSlot
        collapsedContent={
          <ConcertsPanelRail
            onExpand={hasContent ? () => setOpen(true) : undefined}
            footer={<QuickAddConcert iconOnly />}
          />
        }
      />

      {/* Mobile: no right sidebar, so pages without their own panel get a floating add button */}
      {!hasContent && (
        <div className="md:hidden fixed bottom-4 right-4 z-40">
          <QuickAddConcert iconOnly triggerClassName="size-11 rounded-full shadow-lg" />
        </div>
      )}
    </>
  )
}
