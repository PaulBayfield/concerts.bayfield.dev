"use client";

import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import ReactCountryFlag from "react-country-flag"


export function LanguageSwitcher() {
  const t = useTranslations("LanguageSwitcher")
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(locale: string) {
    startTransition(() => {
      router.replace({ pathname }, { locale: locale });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Languages className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          <span className="sr-only">{t("switchLanguage")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-0 w-fit flex flex-col gap-1">
        <DropdownMenuItem
          disabled={useLocale() === "fr" || isPending}
          className={useLocale() === "fr" ? "bg-accent" : ""}
          onClick={() => {
            handleChange("fr");
          }}
        >
          <ReactCountryFlag
            countryCode="FR"
            title="Français"
            aria-label="Français"
            svg
          />
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={useLocale() === "en" || isPending}
          className={useLocale() === "en" ? "bg-accent" : ""}
          onClick={() => {
            handleChange("en");
          }}
        >
          <ReactCountryFlag
            countryCode="GB"
            title="English"
            aria-label="English"
            svg
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
