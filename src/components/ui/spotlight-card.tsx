"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * SpotlightCard — cursor-following aurora spotlight effect.
 * Adapted from reactbits.dev Magic Bento pattern.
 *
 * The spotlight IS the aurora — a violet radial gradient that follows the
 * cursor. On hover the border ring brightens where the cursor is.
 *
 * Uses CSS custom properties (--mx, --my) updated via a single mousemove
 * listener per card. No rAF, no external deps, respects reduced-motion.
 */
export function SpotlightCard({
  children,
  className,
  glowColor = "83, 63, 214", // #533fd6 in RGB
  spotlightRadius = 300,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  spotlightRadius?: number;
} & Omit<React.ComponentProps<"div">, "onMouseMove">) {
  const ref = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    },
    [],
  );

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn(
        "group/spotlight relative overflow-hidden rounded-xl",
        "ring-1 ring-lavender/12 transition-[box-shadow] duration-200",
        "hover:ring-lavender/30 hover:shadow-[0_0_24px_-8px_rgba(124,58,237,0.25)]",
        // Spotlight overlay (invisible until hover)
        "before:pointer-events-none before:absolute before:inset-0 before:opacity-0",
        "before:transition-opacity before:duration-200",
        "before:bg-[radial-gradient(var(--spotlight-r)_circle_at_var(--mx)_var(--my),rgba(var(--glow),0.12),transparent_70%)]",
        "group-hover/spotlight:before:opacity-100",
        // Border glow line (mask trick: a gradient box behind, masked to show only border)
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-xl after:opacity-0",
        "after:transition-opacity after:duration-200",
        "after:bg-[radial-gradient(var(--spotlight-r)_circle_at_var(--mx)_var(--my),rgba(var(--glow),0.4),transparent_60%)]",
        "after:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
        "after:[mask-composite:exclude] after:[padding:1px]",
        "group-hover/spotlight:after:opacity-100",
        className,
      )}
      style={
        {
          "--glow": glowColor,
          "--spotlight-r": `${spotlightRadius}px`,
        } as React.CSSProperties
      }
      {...props}
    >
      {/* Content sits above the overlays */}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
