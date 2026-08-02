"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Eye, X, RefreshCw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageMeta {
  id: number;
  slug: string;
  title: string;
  isDefault: boolean;
  isPublished: boolean;
}

// ── Context ─────────────────────────────────────────────────────────────

const PreviewContext = React.createContext<{
  reload: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  previewUrl: string | null;
}>({
  reload: () => {},
  open: false,
  setOpen: () => {},
  previewUrl: null,
});

export function usePreview() {
  return React.useContext(PreviewContext);
}

// ── Provider (wraps the entire admin shell) ─────────────────────────────

export function PreviewProvider({
  pages,
  children,
}: {
  pages: PageMeta[];
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const pageId = searchParams.get("page");

  const activePage = React.useMemo(() => {
    if (pageId) {
      const found = pages.find((p) => p.id === Number(pageId));
      if (found) return found;
    }
    return pages.find((p) => p.isDefault) ?? pages[0];
  }, [pageId, pages]);

  const [open, setOpen] = React.useState(false);
  const [manualReload, setManualReload] = React.useState(0);
  const reload = React.useCallback(() => setManualReload((k) => k + 1), []);

  // Reload key combines page id with manual reload count so changing
  // pages OR clicking refresh both re-render the iframe.
  const reloadKey = `${activePage?.id ?? 0}-${manualReload}`;

  const previewUrl = activePage ? `/${activePage.slug}` : null;

  return (
    <PreviewContext.Provider value={{ reload, open, setOpen, previewUrl }}>
      {children}
      {previewUrl && open && (
        <PreviewOverlay
          src={previewUrl}
          reloadKey={reloadKey}
          reload={reload}
          onClose={() => setOpen(false)}
        />
      )}
    </PreviewContext.Provider>
  );
}

// ── Preview Button (for sidebar + mobile tab bar) ───────────────────────

export function PreviewButton({ className }: { className?: string }) {
  const { open, setOpen } = React.useContext(PreviewContext);
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      aria-pressed={open}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all hover:translate-x-0.5 hover:bg-violet/15 hover:text-lavender",
        open && "bg-violet/15 text-lavender",
        className,
      )}
    >
      <Eye className="size-4" />
      <span className="hidden lg:inline">Preview</span>
      <span className="lg:hidden">Preview</span>
    </button>
  );
}

// ── Overlay Panel ───────────────────────────────────────────────────────

function PreviewOverlay({
  src,
  reloadKey,
  reload,
  onClose,
}: {
  src: string;
  reloadKey: string;
  reload: () => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* Desktop: floating panel anchored to right edge, full viewport height */}
      <div className="fixed right-0 top-0 z-30 hidden h-dvh w-[360px] flex-col border-l border-border bg-sidebar/80 backdrop-blur-xl lg:flex xl:w-[400px]">
        <PreviewHeader src={src} reload={reload} onClose={onClose} />
        <div className="flex-1 overflow-hidden">
          <PhoneFrame key={reloadKey} src={src} />
        </div>
      </div>

      {/* Mobile: full-screen overlay */}
      <div className="fixed inset-0 z-50 flex flex-col bg-background lg:hidden">
        <PreviewHeader src={src} reload={reload} onClose={onClose} />
        <div className="flex-1 overflow-hidden">
          <PhoneFrame key={reloadKey} src={src} />
        </div>
      </div>
    </>
  );
}

// ── Header ──────────────────────────────────────────────────────────────

function PreviewHeader({
  src,
  reload,
  onClose,
}: {
  src: string;
  reload: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <div className="flex items-center gap-2">
        <Eye className="size-4 text-lavender" />
        <span className="text-sm font-medium">Live Preview</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={reload}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Refresh preview"
        >
          <RefreshCw className="size-4" />
        </button>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Open in new tab"
        >
          <ExternalLink className="size-4" />
        </a>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close preview"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

// ── Phone Frame ─────────────────────────────────────────────────────────

function PhoneFrame({ src }: { src: string }) {
  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="relative flex h-full max-h-[720px] aspect-[9/19.5] w-auto overflow-hidden rounded-[2.5rem] border-[8px] border-night-900 bg-night-950 shadow-[0_0_60px_-12px_rgba(124,58,237,0.3)]">
        <div className="absolute left-1/2 top-0 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-night-900" />
        <iframe
          src={src}
          title="Live preview"
          className="h-full w-full border-0"
          loading="lazy"
        />
      </div>
    </div>
  );
}
