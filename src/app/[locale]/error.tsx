"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ErrorBase } from "@/components/error-base"

import { useTranslations } from "next-intl"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations("Errors.General")

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <ErrorBase
      icon={<AlertTriangle className="h-12 w-12 text-destructive animate-pulse" />}
      title={t("title")}
      subtitle={t("subtitle")}
      description={t("description")}
      action={
        <div className="flex gap-4 justify-center">
          <Button onClick={() => reset()} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            {t("tryAgain")}
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            {t("returnHome")}
          </Button>
        </div>
      }
    />
  )
}

