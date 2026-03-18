import { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { SignInForm } from "@/components/auth/signin-form";
import { IconArrowLeft } from "@tabler/icons-react";
import { SiteHeader } from "@/components/site-header";
import { Music } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In - Concerts",
  description: "Sign in to your account.",
};

export default async function SignInPage() {
  const t = await getTranslations("Auth");

  return (
    <>
      <SiteHeader pageTitle={t('signIn')} />

      <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex-1 flex flex-col justify-center z-10 w-full max-w-[420px] px-6">
          <div className="flex flex-col items-center text-center space-y-6 w-full">
            <Link href="/" className="group transition-transform hover:scale-105 active:scale-95">
              <div className="relative w-20 h-20 bg-background rounded-2xl shadow-xl flex items-center justify-center p-4 border border-border/50">
                <Music className="h-10 w-10 text-primary" />
              </div>
            </Link>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {t("signIn")}
              </h1>
            </div>

            <div className="w-full pt-4">
              <div className="relative pb-8">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-border/60"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground font-medium">
                    Authentication
                  </span>
                </div>
              </div>

              <SignInForm />
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group pt-4"
            >
              <IconArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
              {t("backToHome")}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
