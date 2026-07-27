import * as React from "react";
import {
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { isDemoMode } from "@/lib/demo";
import { logout } from "@/server/actions/auth";
import { getAllPages } from "@/server/queries";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/aurora/AuroraBackground";
import { MobileTabBar } from "@/components/admin/MobileTabBar";
import { PageSwitcher } from "@/components/admin/PageSwitcher";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Route protection is handled by middleware. Here we only decide whether to
  // render the admin chrome (authed) or a bare shell (login / setup).
  if (!session) {
    return (
      <div className="min-h-dvh w-full dark">
        <AuroraBackground />
        {children}
      </div>
    );
  }

  // Load pages for the page switcher (only when authed).
  const allPages = await getAllPages();
  const pageList = allPages.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    isDefault: p.isDefault,
    isPublished: p.isPublished,
  }));

  return (
    <div className="dark relative min-h-dvh bg-background text-foreground">
      <AuroraBackground />
      {/* Full-bleed row: sidebar anchors to the left edge instead of floating
          in a centered box, so the layout stays grounded at every resolution. */}
      <div className="flex w-full">
        {/* Sidebar — pinned left, full viewport height, sticky while scrolling */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar p-4 md:flex md:sticky md:top-0 md:h-dvh md:self-start">
          <div className="mb-8 flex items-center gap-2 px-2">
            <Image src="/logo-mark.svg" alt="LinkBreeze" width={24} height={24} />
            <span className="font-heading text-lg font-semibold">
              LinkBreeze
            </span>
          </div>

          <AdminNav />

          <div className="border-t border-border pt-3 mb-3">
            <p className="mb-1.5 px-2.5 text-xs font-medium text-muted-foreground">
              Pages
            </p>
            <PageSwitcher pages={pageList} />
          </div>

          <div className="mt-auto flex flex-col gap-2 border-t border-border pt-3">
            <span className="px-2.5 text-xs text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{session.username}</span>
            </span>
            <form action={logout}>
              <Button
                variant="ghost"
                size="sm"
                type="submit"
                className="w-full justify-start gap-2"
              >
                <LogOut className="size-4" />
                Sign out
              </Button>
            </form>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-h-dvh flex-1 flex-col min-w-0">
          {/* Mobile top bar */}
          <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 md:hidden">
            <div className="flex items-center gap-2">
              <Image src="/logo-mark.svg" alt="LinkBreeze" width={24} height={24} />
              <span className="font-heading font-semibold">LinkBreeze</span>
            </div>
            <div className="flex items-center gap-2">
              <PageSwitcher pages={pageList} variant="compact" />
              <form action={logout}>
                <Button variant="ghost" size="icon-sm" type="submit">
                  <LogOut className="size-4" />
                </Button>
              </form>
            </div>
          </header>

          {/* pb-24 reserves space for the fixed mobile tab bar so content is
              never hidden behind it; md:pb-8 restores desktop padding. */}
          <main className="flex-1 p-4 pb-24 md:p-8 md:pb-8">
            {/* Left-aligned cap so content grounds beside the sidebar on wide
                screens instead of floating in the center. */}
            <div className="w-full max-w-screen-2xl">
              {isDemoMode && (
                <div className="mb-4 rounded-lg border border-violet/30 bg-violet/10 px-4 py-3 text-sm text-lavender">
                  <strong>Read-only demo.</strong> Deploy your own instance to make changes.{" "}
                  <a href="https://github.com/Manak-hash/LinkBreeze" className="underline hover:text-foreground" target="_blank" rel="noopener noreferrer">
                    View on GitHub →
                  </a>
                </div>
              )}
              {children}
            </div>
          </main>
          <MobileTabBar />
        </div>
      </div>
    </div>
  );
}
