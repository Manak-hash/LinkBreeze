"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Link as LinkIcon,
  User,
  Palette,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { PreviewButton } from "@/components/admin/PreviewPane";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/links", label: "Links", icon: LinkIcon },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/theme", label: "Theme", icon: Palette },
  { href: "/settings", label: "Settings", icon: Settings },
];

/** Sidebar nav that preserves the ?page= param across admin sections. */
export function AdminNav() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const query = pageParam ? `?page=${pageParam}` : "";

  return (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={`${item.href}${query}`}
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-[color,background-color,transform] hover:translate-x-0.5 hover:bg-violet/15 hover:text-lavender"
        >
          <item.icon className="size-4" />
          {item.label}
        </Link>
      ))}
      <div className="mt-1 border-t border-border pt-1">
        <PreviewButton />
      </div>
    </nav>
  );
}
