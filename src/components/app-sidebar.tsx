"use client";

import { Link, usePathname } from "@/i18n/routing";
import * as React from "react";
import { useTranslations } from "next-intl";

import {
  IconMap2,
  IconMicrophone2,
  IconCalendar,
  IconShield,
} from "@tabler/icons-react";
import { Music } from "lucide-react";

import { NavSecondary } from "@/components/nav-secondary";
import { SidebarProgressTracker } from "@/components/sidebar-progress-tracker";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({ isAdmin, ...props }: React.ComponentProps<typeof Sidebar> & { isAdmin?: boolean }) {
  const pathname = usePathname();
  const t = useTranslations('Navigation');

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <Music className="h-5 w-5" />
                <span className="text-base font-semibold">
                  Concerts
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="flex flex-col mt-2">
          <SidebarGroupLabel>{t("main")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-1">
              <Link href="/">
                <SidebarMenuButton tooltip={t("map")} isActive={pathname === "/"}>
                  <IconMap2 />
                  <span>{t("map")}</span>
                </SidebarMenuButton>
              </Link>
              <Link href="/artists">
                <SidebarMenuButton tooltip={t("artists")} isActive={pathname === "/artists"}>
                  <IconMicrophone2 />
                  <span>{t("artists")}</span>
                </SidebarMenuButton>
              </Link>
              <Link href="/concerts">
                <SidebarMenuButton tooltip={t("concerts")} isActive={pathname === "/concerts"}>
                  <IconCalendar />
                  <span>{t("concerts")}</span>
                </SidebarMenuButton>
              </Link>
              {isAdmin && (
                <Link href="/admin">
                  <SidebarMenuButton tooltip={t("admin")} isActive={pathname === "/admin"}>
                    <IconShield />
                    <span>{t("admin")}</span>
                  </SidebarMenuButton>
                </Link>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <NavSecondary className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <SidebarProgressTracker />
      </SidebarFooter>
    </Sidebar>
  );
}
