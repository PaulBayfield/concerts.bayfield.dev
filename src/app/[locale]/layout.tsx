import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";

import { Providers } from "./providers";

import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Concerts",
  description: "Track your concert venues and artists.",
};

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;


  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true" || true;
  const session = await getServerSession(authOptions);

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning={true}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}>
        <NextIntlClientProvider messages={messages}>
          <Providers defaultOpen={defaultOpen} session={session}>
            <AppSidebar variant="inset" />
            <SidebarInset className="flex flex-1 flex-col">
              {children}
            </SidebarInset>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
