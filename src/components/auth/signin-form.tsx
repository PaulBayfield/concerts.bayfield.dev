"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { IconBrandGoogle } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { cn } from "@/utils/utils";

/** Page to return to after sign-in, set by the proxy when redirecting from a protected page. */
function getCallbackUrl() {
  const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
  // Only same-site paths (reject "//host" protocol-relative URLs)
  return callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/";
}

export function SignInForm({
  className,
  buttonClassName,
}: {
  className?: string;
  buttonClassName?: string;
}) {
  const t = useTranslations("Auth");

  return (
    <div className={cn("flex flex-col gap-2 w-full max-w-sm mx-auto", className)}>
      <Button
        variant="outline"
        size="lg"
        className={cn(
          "w-full h-12 flex items-center justify-center gap-3 text-base font-medium transition-all hover:bg-muted/50 border-input/50",
          buttonClassName
        )}
        onClick={() => signIn("google", { callbackUrl: getCallbackUrl() })}
      >
        <IconBrandGoogle className="size-5" />
        <span>{t("signInWithGoogle")}</span>
      </Button>
    </div>
  );
}
