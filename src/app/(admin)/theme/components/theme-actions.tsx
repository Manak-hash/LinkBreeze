"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownUp,
  Copy,
  Download,
  Upload,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SuccessToast } from "@/components/ui/success-toast";
import { duplicateActiveTheme, deleteCustomTheme } from "@/server/actions/theme";
import type { ThemeRow } from "@/server/queries";

/**
 * Top-right header actions for /theme: Duplicate theme + Import & export.
 * Each opens a dialog. Fully self-contained state so the manager stays lean.
 */
export function ThemeActions({
  themes,
  active,
}: {
  themes: ThemeRow[];
  active: ThemeRow | null;
}) {
  const router = useRouter();

  // ── Duplicate ─────────────────────────────────────────────────────────
  const [dupOpen, setDupOpen] = React.useState(false);
  const [dupName, setDupName] = React.useState("");
  const [dupPending, setDupPending] = React.useState(false);
  const [dupError, setDupError] = React.useState<string | null>(null);

  const openDuplicate = () => {
    setDupError(null);
    setDupName(active ? `${active.name} (copy)` : "");
    setDupOpen(true);
  };

  const handleDuplicate = async () => {
    const name = dupName.trim().slice(0, 100);
    if (!name || !active) return;
    setDupPending(true);
    setDupError(null);
    try {
      const res = await duplicateActiveTheme(name, active.id);
      if (!res.success) {
        setDupError(res.error);
        return;
      }
      setDupOpen(false);
      setToast(`Theme "${name}" created`);
      router.refresh();
    } catch {
      setDupError("Failed to duplicate theme. Please try again.");
    } finally {
      setDupPending(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────
  const [delOpen, setDelOpen] = React.useState(false);
  const [delPending, setDelPending] = React.useState(false);
  const [delError, setDelError] = React.useState<string | null>(null);
  const [delTarget, setDelTarget] = React.useState<ThemeRow | null>(null);

  const canDeleteActive = active !== null && !active.isPreset;

  const openDelete = () => {
    if (!canDeleteActive) return;
    setDelError(null);
    setDelTarget(active);
    setDelOpen(true);
  };

  const handleDelete = async () => {
    if (!delTarget) return;
    setDelPending(true);
    setDelError(null);
    try {
      const res = await deleteCustomTheme(delTarget.id);
      if (!res.success) {
        setDelError(res.error);
        return;
      }
      setDelOpen(false);
      setToast(`Theme "${delTarget.name}" deleted`);
      router.refresh();
    } catch {
      setDelError("Failed to delete theme. Please try again.");
    } finally {
      setDelPending(false);
    }
  };

  // ── Import & export ───────────────────────────────────────────────────
  const [toolsOpen, setToolsOpen] = React.useState(false);
  const [impBusy, setImpBusy] = React.useState(false);
  const [impError, setImpError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = (id: number) => {
    // Anchor click so the browser honors the API route's filename header.
    const a = document.createElement("a");
    a.href = `/api/themes/export?id=${id}`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportClick = () => {
    setImpError(null);
    inputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so picking the same file twice still fires onChange.
    e.target.value = "";
    if (!file) return;

    setImpBusy(true);
    setImpError(null);
    try {
      const text = await file.text();
      const res = await fetch("/api/themes/import", {
        method: "POST",
        body: text,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Import failed (HTTP ${res.status})`);
      }
      setToast("Theme imported");
      router.refresh();
    } catch (err) {
      setImpError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImpBusy(false);
    }
  };

  // ── Toast ─────────────────────────────────────────────────────────────
  const [toast, setToast] = React.useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={openDelete}
        disabled={!canDeleteActive}
        title={
          canDeleteActive
            ? `Delete "${active?.name}"`
            : "Built-in themes cannot be deleted"
        }
        aria-label="Delete theme"
        className={!canDeleteActive ? "text-muted-foreground" : undefined}
      >
        <Trash2 className="size-3.5" />
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={openDuplicate}
        disabled={!active}
        title={active ? `Duplicate "${active.name}"` : undefined}
      >
        <Copy className="size-3.5" />
        Duplicate theme
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setImpError(null);
          setToolsOpen(true);
        }}
      >
        <ArrowDownUp className="size-3.5" />
        Import &amp; export
      </Button>

      {/* Duplicate dialog */}
      <Dialog open={dupOpen} onOpenChange={setDupOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Duplicate theme</DialogTitle>
            <DialogDescription>
              Creates an editable copy of{" "}
              <span className="font-medium text-foreground">
                {active?.name}
              </span>
              . The original stays untouched.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleDuplicate();
            }}
            className="flex flex-col gap-1.5"
          >
            <label
              htmlFor="dup-theme-name"
              className="text-xs font-medium text-muted-foreground"
            >
              Name of the copy
            </label>
            <Input
              id="dup-theme-name"
              value={dupName}
              onChange={(e) => setDupName(e.target.value)}
              maxLength={100}
              placeholder="My theme (copy)"
              autoFocus
              disabled={dupPending}
            />
            {dupError ? (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="size-3.5" />
                {dupError}
              </p>
            ) : null}
          </form>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDupOpen(false)}
              disabled={dupPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDuplicate}
              disabled={dupPending || !dupName.trim()}
            >
              <Copy className="size-3.5" />
              {dupPending ? "Duplicating…" : "Duplicate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete theme</DialogTitle>
            <DialogDescription>
              {delTarget
                ? `This permanently removes "${delTarget.name}" from your themes.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          {delError ? (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="size-3.5" />
              {delError}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDelOpen(false)}
              disabled={delPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={delPending}
            >
              <Trash2 className="size-3.5" />
              {delPending ? "Deleting…" : "Delete theme"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import & export dialog */}
      <Dialog open={toolsOpen} onOpenChange={setToolsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import &amp; export</DialogTitle>
            <DialogDescription>
              Download a theme as a .json file to back it up or share it, then
              re-import on any LinkBreeze instance. Imports are added as
              inactive copies.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium text-muted-foreground">
              Export
            </span>
            <div className="max-h-52 overflow-y-auto rounded-lg border border-border">
              {themes.map((t, i) => (
                <React.Fragment key={t.id}>
                  {i > 0 ? <Separator className="!h-px" /> : null}
                  <button
                    type="button"
                    onClick={() => handleExport(t.id)}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-muted/60"
                  >
                    <span
                      aria-hidden
                      className="size-3.5 shrink-0 rounded-full ring-1 ring-foreground/10"
                      style={{
                        background:
                          t.backgroundValue?.split(",")[0]?.trim() ||
                          t.primaryColor ||
                          "#7c5ff0",
                      }}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {t.name}
                      {active && t.id === active.id ? (
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          (current)
                        </span>
                      ) : null}
                    </span>
                    <Download className="size-3.5 shrink-0 text-muted-foreground" />
                  </button>
                  {!t.isPreset && t.id !== active?.id ? (
                    <button
                      type="button"
                      onClick={() => {
                        setDelError(null);
                        setDelTarget(t);
                        setDelOpen(true);
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-destructive/10"
                      aria-label={`Delete theme ${t.name}`}
                    >
                      <span
                        aria-hidden
                        className="size-3.5 shrink-0 rounded-full ring-1 ring-foreground/10 opacity-40"
                        style={{
                          background:
                            t.backgroundValue?.split(",")[0]?.trim() ||
                            t.primaryColor ||
                            "#7c5ff0",
                        }}
                      />
                      <span className="min-w-0 flex-1 truncate text-sm text-destructive">
                        Delete {t.name}
                      </span>
                      <Trash2 className="size-3.5 shrink-0 text-destructive" />
                    </button>
                  ) : null}
                </React.Fragment>
              ))}
            </div>

            <span className="mt-1 text-xs font-medium text-muted-foreground">
              Import
            </span>
            <input
              ref={inputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleFile}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleImportClick}
              disabled={impBusy}
            >
              <Upload className="size-3.5" />
              {impBusy ? "Importing…" : "Choose JSON file…"}
            </Button>
            {impError ? (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="size-3.5" />
                {impError}
              </p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {toast ? (
        <SuccessToast message={toast} onDismiss={() => setToast(null)} />
      ) : null}
    </div>
  );
}
