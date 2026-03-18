"use client"

import { AlertTriangle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ErrorBase } from "@/components/error-base"
import { Inter } from "next/font/google"
import { cn } from "@/utils/utils"

// Needs to be imported here as this file replaces the root layout
const inter = Inter({ subsets: ["latin"] })

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "antialiased")}>
        <ErrorBase
          icon={<AlertTriangle className="h-12 w-12 text-destructive animate-pulse" />}
          title="Critical Error"
          subtitle="System Failure"
          description="A critical error occurred that prevents the application from loading. We apologize for the inconvenience."
          action={
            <div className="flex gap-4 justify-center">
              <Button onClick={() => reset()} className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Try again
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </div>
          }
        />
      </body>
    </html>
  )
}
