"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { IconBrandGoogle, IconBrandDiscord, IconBrandGithub } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

export function SignInForm() {
  const t = useTranslations("Auth");

  return (
    <div className="flex flex-col gap-2 w-full max-w-sm mx-auto">
      <Button
        variant="outline"
        size="lg"
        className="w-full h-12 flex items-center justify-center gap-3 text-base font-medium transition-all hover:bg-muted/50 border-input/50"
        onClick={() => signIn("google", { callbackUrl: "/" })}
      >
        <IconBrandGoogle className="size-5" />
        <span>{t("signInWithGoogle")}</span>
      </Button>
    </div>
  );
}
