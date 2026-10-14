import { getTranslations } from "next-intl/server"
import { Music, MapPin, Mic2, CalendarDays, Github } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SignInForm } from "@/components/auth/signin-form"
import { DemoPreview } from "@/components/demo-preview"

const GITHUB_URL = "https://github.com/PaulBayfield/concerts.bayfield.dev"

// Shared by both CTAs so they always have the exact same size
const CTA_CLASS = "w-full h-11 gap-2 rounded-lg text-sm font-medium"

export default async function HomePage() {
  const t = await getTranslations("Home")

  const features = [
    { icon: MapPin, label: t("featureMap") },
    { icon: Mic2, label: t("featureArtists") },
    { icon: CalendarDays, label: t("featureConcerts") },
  ]

  return (
    <>
      <SiteHeader showSidebarTrigger={false} />

      <div className="flex-1 relative flex items-center overflow-x-hidden overflow-y-auto">
        {/* Background */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

        <div className="relative z-10 mx-auto grid w-full max-w-5xl items-center gap-12 px-6 py-12 lg:grid-cols-2 lg:gap-16 lg:py-20">
          {/* Hero */}
          <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-border/50 bg-background shadow-lg">
              <Music className="size-7 text-primary" />
            </div>

            <div className="space-y-3">
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {t("title")}
              </h1>
              <p className="text-pretty text-base text-muted-foreground sm:text-lg">
                {t("description")}
              </p>
            </div>

            <div className="grid w-full max-w-md gap-3 sm:grid-cols-2">
              <SignInForm
                className="max-w-none mx-0"
                buttonClassName={`${CTA_CLASS} border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground dark:border-primary dark:bg-primary dark:hover:bg-primary/90 [&_svg]:size-4`}
              />
              <DemoPreview className={`${CTA_CLASS} bg-background/60 backdrop-blur-sm`} />
            </div>

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="size-4" />
              {t("openSource")}
            </a>
          </div>

          {/* Features */}
          <ul className="grid gap-3">
            {features.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-4 rounded-xl border bg-card/60 p-4 text-left text-sm shadow-sm backdrop-blur-sm"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="font-medium">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
