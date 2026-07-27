"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Link as LinkIcon,
  User,
  Palette,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/links", label: "Links", icon: LinkIcon },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/theme", label: "Theme", icon: Palette },
  { href: "/settings", label: "Settings", icon: Settings },
];

/** Fixed opaque bottom tab bar (mobile only). Thumb-reachable, always visible. */
export function MobileTabBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const query = pageParam ? `?page=${pageParam}` : "";

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-lavender/12 bg-background px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_30px_-12px_rgba(5,3,20,0.85)] md:hidden"
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={`${href}${query}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
              active ? "text-lavender" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active ? (
              <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[var(--aurora-grad)]" />
            ) : null}
            <Icon className="size-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
