"use client";

import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

import { ThemeProvider } from "@/providers/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";

export function Providers({
  children,
  defaultOpen,
  session,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
  session?: Session | null;
}) {
  return (
    <>
      <SessionProvider session={session}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider
            defaultOpen={defaultOpen}
            style={
              {
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
              } as React.CSSProperties
            }
          >
            {children}
            <Toaster position="bottom-center" />
          </SidebarProvider>
        </ThemeProvider>
      </SessionProvider>
    </>
  );
}
