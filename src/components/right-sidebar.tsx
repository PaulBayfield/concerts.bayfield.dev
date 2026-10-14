"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { PanelRightIcon } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/utils/utils"
import { Button } from "@/components/ui/button"

type RightSidebarContextProps = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  openMobile: boolean
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>
  isMobile: boolean
  toggleSidebar: () => void
  hasContent: boolean
  setHasContent: (value: boolean) => void
  container: HTMLElement | null
  setContainer: (el: HTMLElement | null) => void
}

const RightSidebarContext = React.createContext<RightSidebarContextProps | null>(null)

export function useRightSidebar() {
  const context = React.useContext(RightSidebarContext)
  if (!context) {
    throw new Error("useRightSidebar must be used within a RightSidebarProvider.")
  }
  return context
}

export function RightSidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(true)
  const [openMobile, setOpenMobile] = React.useState(true)
  const [hasContent, setHasContent] = React.useState(false)
  const [container, setContainer] = React.useState<HTMLElement | null>(null)

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((o) => !o) : setOpen((o) => !o)
  }, [isMobile])

  const value = React.useMemo<RightSidebarContextProps>(
    () => ({
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
      hasContent,
      setHasContent,
      container,
      setContainer,
    }),
    [open, openMobile, isMobile, toggleSidebar, hasContent, container]
  )

  return <RightSidebarContext.Provider value={value}>{children}</RightSidebarContext.Provider>
}

/**
 * Desktop slot rendered next to SidebarInset — mirror of the left inset sidebar.
 * Always present: shows `collapsedContent` (icon rail) when collapsed, or the
 * page's <RightSidebar> content when expanded. Only pages that provide
 * content can expand it.
 */
export function RightSidebarSlot({ collapsedContent }: { collapsedContent: React.ReactNode }) {
  const { open, hasContent, setContainer } = useRightSidebar()
  const expanded = open && hasContent

  return (
    <div
      data-slot="right-sidebar"
      data-state={expanded ? "expanded" : "collapsed"}
      className={cn(
        "hidden md:block shrink-0 overflow-hidden transition-[width] duration-200 ease-linear",
        expanded
          ? "w-(--sidebar-width)"
          : // Same width as the left inset sidebar in icon mode
            "w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
      )}
    >
      <div className="sticky top-0 h-svh w-full p-2">
        <div
          data-sidebar="sidebar"
          className="bg-sidebar text-sidebar-foreground flex size-full flex-col min-h-0"
        >
          {/* Kept mounted while collapsed so the panel keeps its state */}
          <div
            ref={setContainer}
            className={cn("flex-col size-full min-h-0", expanded ? "flex" : "hidden")}
          />
          {!expanded && collapsedContent}
        </div>
      </div>
    </div>
  )
}

/** Renders its children into the right sidebar slot (desktop only). */
export function RightSidebar({ children }: { children: React.ReactNode }) {
  const { container, setHasContent } = useRightSidebar()

  React.useEffect(() => {
    setHasContent(true)
    return () => setHasContent(false)
  }, [setHasContent])

  if (!container) return null
  return createPortal(children, container)
}

export function RightSidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useRightSidebar()

  return (
    <Button
      data-sidebar="trigger"
      data-slot="right-sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      className={cn(className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelRightIcon />
      <span className="sr-only">Toggle Right Sidebar</span>
    </Button>
  )
}
