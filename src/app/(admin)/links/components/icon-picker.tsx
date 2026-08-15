"use client";

import * as React from "react";
import { icons } from "lucide-react";
import { ICON_CATEGORIES, keyToIconName, resolveIcon } from "@/lib/icon-registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

export interface IconPickerProps {
  /** Current value: dashed lucide name ("rocket") or empty. */
  value: string;
  /** Called with the dashed icon name, or "" when cleared. */
  onChange: (name: string) => void;
  /** Field label shown above the trigger (optional). */
  label?: string;
  /** Hint text under the field (optional). */
  hint?: string;
}

/** PascalCase key → dashed name. Acronym-aware (shared with public render). */
function keyToName(key: string) {
  return keyToIconName(key);
}

const ALL_KEYS = Object.keys(icons) as (keyof typeof icons)[];

/** name → category via longest-prefix match against curated seeds. */
const CATEGORY_SEEDS: Array<[string, string]> = [
  ["mail", "Communication"], ["message", "Communication"], ["phone", "Communication"],
  ["at-sign", "Communication"], ["send", "Communication"], ["inbox", "Communication"],
  ["megaphone", "Communication"], ["bell", "Communication"], ["rss", "Communication"],
  ["podcast", "Media"], ["radio", "Media"],
  ["play", "Media"], ["pause", "Media"], ["skip-back", "Media"], ["skip-forward", "Media"],
  ["volume", "Media"], ["headphones", "Media"], ["mic", "Media"], ["music", "Media"],
  ["camera", "Media"], ["image", "Media"], ["film", "Media"], ["clapperboard", "Media"],
  ["tv", "Media"], ["disc", "Media"], ["disc-2", "Media"], ["disc-3", "Media"],
  ["shopping", "Commerce"], ["store", "Commerce"], ["shop", "Commerce"],
  ["credit-card", "Commerce"], ["banknote", "Commerce"], ["coins", "Commerce"],
  ["wallet", "Commerce"], ["receipt", "Commerce"], ["tag", "Commerce"], ["ticket", "Commerce"],
  ["percent", "Commerce"], ["gift", "Commerce"], ["package", "Commerce"], ["box", "Commerce"],
  ["truck", "Commerce"], ["scale", "Commerce"], ["calculator", "Commerce"],
  ["landmark", "Commerce"], ["piggy-bank", "Commerce"], ["hand-coins", "Commerce"],
  ["dollar-sign", "Commerce"], ["euro", "Commerce"], ["pound-sterling", "Commerce"],
  ["bitcoin", "Commerce"], ["chart", "Commerce"], ["trending", "Commerce"],
  ["briefcase", "Commerce"], ["building", "Commerce"], ["handshake", "Commerce"],
  ["code", "Technology"], ["terminal", "Technology"], ["git-", "Technology"],
  ["bug", "Technology"], ["laptop", "Technology"], ["monitor", "Technology"],
  ["smartphone", "Technology"], ["tablet", "Technology"], ["keyboard", "Technology"],
  ["mouse", "Technology"], ["cpu", "Technology"], ["hard-drive", "Technology"],
  ["database", "Technology"], ["server", "Technology"], ["cloud", "Technology"],
  ["wifi", "Technology"], ["bluetooth", "Technology"], ["usb", "Technology"],
  ["plug", "Technology"], ["cable", "Technology"], ["battery", "Technology"],
  ["bot", "Technology"], ["brain", "Technology"], ["circuit", "Technology"],
  ["binary", "Technology"], ["braces", "Technology"], ["hash", "Technology"],
  ["rocket", "Technology"], ["satellite", "Technology"], ["radar", "Technology"],
  ["signal", "Technology"], ["antenna", "Technology"], ["layers", "Technology"],
  ["blocks", "Technology"], ["component", "Technology"], ["puzzle", "Technology"],
  ["shield", "Technology"], ["key", "Technology"], ["lock", "Technology"],
  ["unlock", "Technology"], ["fingerprint", "Technology"], ["scan", "Technology"],
  ["qr", "Technology"], ["router", "Technology"], ["network", "Technology"],
  ["share-2", "Technology"], ["globe", "Technology"], ["language", "Technology"],
  ["sun", "Nature & Food"], ["moon", "Nature & Food"], ["rainbow", "Nature & Food"],
  ["umbrella", "Nature & Food"], ["snowflake", "Nature & Food"], ["thermometer", "Nature & Food"],
  ["droplet", "Nature & Food"], ["waves", "Nature & Food"], ["wind", "Nature & Food"],
  ["flame", "Nature & Food"], ["mountain", "Nature & Food"], ["tree", "Nature & Food"],
  ["leaf", "Nature & Food"], ["sprout", "Nature & Food"], ["flower", "Nature & Food"],
  ["cactus", "Nature & Food"], ["tent", "Nature & Food"], ["bird", "Nature & Food"],
  ["butterfly", "Nature & Food"], ["cat", "Nature & Food"], ["dog", "Nature & Food"],
  ["rabbit", "Nature & Food"], ["turtle", "Nature & Food"], ["fish", "Nature & Food"],
  ["apple", "Nature & Food"], ["banana", "Nature & Food"], ["cherry", "Nature & Food"],
  ["grape", "Nature & Food"], ["citrus", "Nature & Food"], ["croissant", "Nature & Food"],
  ["cake", "Nature & Food"], ["cup-soda", "Nature & Food"], ["coffee", "Nature & Food"],
  ["beer", "Nature & Food"], ["wine", "Nature & Food"], ["martini", "Nature & Food"],
  ["utensils", "Nature & Food"], ["chef-hat", "Nature & Food"], ["cooking-pot", "Nature & Food"],
  ["egg", "Nature & Food"], ["sandwich", "Nature & Food"], ["pizza", "Nature & Food"],
  ["hamburger", "Nature & Food"], ["popcorn", "Nature & Food"], ["candy", "Nature & Food"],
  ["cookie", "Nature & Food"], ["ice-cream", "Nature & Food"], ["lollipop", "Nature & Food"],
  ["donut", "Nature & Food"], ["salad", "Nature & Food"], ["soup", "Nature & Food"],
  ["wheat", "Nature & Food"], ["carrot", "Nature & Food"], ["chili", "Nature & Food"],
  ["vegan", "Nature & Food"], ["milk", "Nature & Food"], ["juice", "Nature & Food"],
  ["check", "Status & Shapes"], ["x-", "Status & Shapes"], ["plus", "Status & Shapes"],
  ["minus", "Status & Shapes"], ["divide", "Status & Shapes"], ["equals", "Status & Shapes"],
  ["asterisk", "Status & Shapes"], ["dot", "Status & Shapes"], ["circle", "Status & Shapes"],
  ["square", "Status & Shapes"], ["triangle", "Status & Shapes"], ["diamond", "Status & Shapes"],
  ["hexagon", "Status & Shapes"], ["pentagon", "Status & Shapes"], ["octagon", "Status & Shapes"],
  ["star", "Status & Shapes"], ["heart", "Status & Shapes"], ["thumbs", "Status & Shapes"],
  ["hand", "Status & Shapes"], ["pointer", "Status & Shapes"], ["grab", "Status & Shapes"],
  ["loader", "Status & Shapes"], ["hourglass", "Status & Shapes"], ["timer", "Status & Shapes"],
  ["power", "Status & Shapes"], ["ban", "Status & Shapes"], ["slash", "Status & Shapes"],
  ["info", "Status & Shapes"], ["zap", "Status & Shapes"], ["magnet", "Status & Shapes"],
  ["atom", "Status & Shapes"], ["infinity", "Status & Shapes"], ["sigma", "Status & Shapes"],
  ["sparkle", "Status & Shapes"], ["wand", "Status & Shapes"], ["party-popper", "Status & Shapes"],
  ["award", "Status & Shapes"], ["medal", "Status & Shapes"], ["trophy", "Status & Shapes"],
  ["crown", "Status & Shapes"], ["flag", "Status & Shapes"], ["milestone", "Status & Shapes"],
  ["pin", "Status & Shapes"], ["map-pin", "Status & Shapes"], ["navigation", "Status & Shapes"],
  ["compass", "Status & Shapes"], ["anchor", "Status & Shapes"], ["route", "Status & Shapes"],
  ["signpost", "Status & Shapes"], ["waypoints", "Status & Shapes"],
];

/** Precomputed once per module load (admin picker chunk only). */
const CATALOG: Array<{ name: string; key: keyof typeof icons; category: string }> = (() => {
  const seeds = [...CATEGORY_SEEDS].sort((a, b) => b[0].length - a[0].length);
  return ALL_KEYS.map((key) => {
    const name = keyToName(key);
    let category = "General";
    for (const [prefix, cat] of seeds) {
      if (name.startsWith(prefix)) {
        category = cat;
        break;
      }
    }
    return { name, key, category };
  }).sort((a, b) => a.name.localeCompare(b.name));
})();

const PAGE_SIZE = 120;

/** Renders a resolved lucide component at trigger size (lint-stable wrapper). */
function IconPreview({ Comp }: { Comp: React.ComponentType<{ size?: number; className?: string }> }) {
  return <Comp size={16} className="shrink-0 text-muted-foreground" />;
}

/**
 * Searchable, category-filtered lucide icon picker.
 *
 * ~1700 icons render from the `icons` map; the grid windows the list (render
 * first PAGE_SIZE matches, "show more" grows it) so the DOM stays light.
 * Client component — admin only, never imported by the public page.
 */
export function IconPicker({ value, onChange, label, hint }: IconPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>("All");
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);

  const Selected = value ? resolveIcon(value) : undefined;

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG.filter((e) => {
      if (category !== "All" && e.category !== category) return false;
      if (q && !e.name.includes(q)) return false;
      return true;
    });
  }, [query, category]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <span className="text-sm font-medium leading-none">{label}</span>
      ) : null}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          type="button"
          className="h-9 flex-1 justify-start gap-2 font-normal"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {Selected ? (
            <>
              <IconPreview Comp={Selected} />
              <span className="truncate">{value}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Choose an icon…</span>
          )}
        </Button>
        {value ? (
          <Button
            variant="outline"
            size="icon"
            type="button"
            className="size-9 shrink-0"
            aria-label="Remove icon"
            onClick={() => { onChange(""); setOpen(false); }}
          >
            <X size={15} />
          </Button>
        ) : null}
      </div>
      {open ? (
        <div className="flex flex-col gap-2 rounded-lg border border-border p-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => { setQuery(e.target.value); setVisibleCount(PAGE_SIZE); }}
              placeholder="Search icons…"
              className="h-8 pl-8 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {["All", ...ICON_CATEGORIES].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { setCategory(c); setVisibleCount(PAGE_SIZE); }}
                className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                  category === c
                    ? "border-violet bg-violet/10 text-violet"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="max-h-[240px] overflow-y-auto px-0.5 py-1">
            <div className="grid grid-cols-8 gap-1">
              {visible.map(({ name, key }) => {
                const Ico = icons[key];
                return (
                  <button
                    key={name}
                    type="button"
                    title={name}
                    aria-label={name}
                    onClick={() => { onChange(name); setOpen(false); }}
                    className={`flex aspect-square items-center justify-center rounded-md transition-colors ${
                      value === name
                        ? "bg-violet/15 text-violet ring-1 ring-violet/40"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Ico size={17} strokeWidth={2} />
                  </button>
                );
              })}
              {filtered.length === 0 ? (
                <p className="col-span-8 py-6 text-center text-sm text-muted-foreground">
                  No icons match &quot;{query}&quot;.
                </p>
              ) : null}
            </div>
            {filtered.length > visibleCount ? (
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="mt-2 w-full rounded-md border border-border py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Show more ({filtered.length - visibleCount} remaining)
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
