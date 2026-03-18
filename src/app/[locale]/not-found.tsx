import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { MapPin, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ErrorBase } from "@/components/error-base"

export default function NotFoundPage() {
  const t = useTranslations("Errors.NotFound")
  return (
    <ErrorBase
      icon={<MapPin className="h-12 w-12 text-primary animate-pulse" />}
      title={t("title")}
      subtitle={t("subtitle")}
      description={t("description")}
      action={
        <Button asChild className="gap-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            {t("returnHome")}
          </Link>
        </Button>
      }
    />
  )
}
