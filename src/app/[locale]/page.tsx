import { getTranslations } from "next-intl/server"
import { Music, MapPin, Mic2, CalendarDays } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SignInForm } from "@/components/auth/signin-form"

export default async function HomePage() {
  const t = await getTranslations("Home")

  return (
    <>
      <SiteHeader pageTitle={t("title")} showSidebarTrigger={false} />

      <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden px-6 py-12">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center gap-6 w-full max-w-md">
          <div className="w-20 h-20 bg-background rounded-2xl shadow-xl flex items-center justify-center p-4 border border-border/50">
            <Music className="h-10 w-10 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {t("title")}
            </h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>

          <ul className="w-full space-y-3 text-left text-sm">
            <li className="flex items-center gap-3">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span>{t("featureMap")}</span>
            </li>
            <li className="flex items-center gap-3">
              <Mic2 className="h-4 w-4 shrink-0 text-primary" />
              <span>{t("featureArtists")}</span>
            </li>
            <li className="flex items-center gap-3">
              <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
              <span>{t("featureConcerts")}</span>
            </li>
          </ul>

          <div className="w-full pt-2">
            <SignInForm />
          </div>
        </div>
      </div>
    </>
  )
}
