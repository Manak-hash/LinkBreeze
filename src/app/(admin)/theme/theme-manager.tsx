"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  activateTheme,
  customizeActiveTheme,
  duplicateActiveTheme,
  deleteCustomTheme,
} from "@/server/actions/theme";
import { setPageThemeAction } from "@/server/actions/pages";
import type { ThemeRow } from "@/server/queries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PresetGallery } from "./components/preset-gallery";
import { ThemeCustomizer } from "./components/theme-customizer";
import { ThemeActions } from "./components/theme-actions";
import { usePreview } from "@/components/admin/PreviewPane";
import type { CustomFontMeta } from "@/lib/custom-fonts";

interface ThemeManagerProps {
  themes: ThemeRow[];
  activeId: number | null;
  active: ThemeRow | null;
  pageId?: number;
  pageThemeId?: number | null;
  customFonts?: CustomFontMeta[];
}

export function ThemeManager({
  themes,
  activeId,
  active,
  pageId,
  pageThemeId,
  customFonts = [],
}: ThemeManagerProps) {
  const { reload: reloadPreview } = usePreview();
  const [selecting, setSelecting] = React.useState<number | null>(null);
  const [customPending, setCustomPending] = React.useState(false);
  const [customError, setCustomError] = React.useState<string | null>(null);
  const [forkPending, setForkPending] = React.useState(false);
  const [delPending, setDelPending] = React.useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<number | null>(null);
  const router = useRouter();

  const handleSelect = async (id: number) => {
    setSelecting(id);
    try {
      if (pageId) {
        await setPageThemeAction(pageId, id);
      } else {
        await activateTheme(id);
      }
      router.refresh();
      reloadPreview();
    } finally {
      setSelecting(null);
    }
  };

  const handleCustom = async (formData: FormData) => {
    setCustomPending(true);
    setCustomError(null);
    try {
      const res = await customizeActiveTheme(formData);
      if (!res.success) {
        setCustomError(res.error);
      } else {
        router.refresh();
        reloadPreview();
      }
    } catch {
      setCustomError("Failed to save theme. Please try again.");
    } finally {
      setCustomPending(false);
    }
  };

  // Saving a preset forks it: duplicate → apply the pending customizations →
  // point the page at the new copy (or activate it globally).
  const handleFork = async (name: string, formData: FormData) => {
    setForkPending(true);
    setCustomError(null);
    try {
      const dup = await duplicateActiveTheme(name, active?.id);
      if (!dup.success) {
        setCustomError(dup.error);
        return;
      }
      const fd = new FormData();
      for (const [k, v] of formData.entries()) fd.append(k, v);
      fd.set("themeId", String(dup.themeId));
      const res = await customizeActiveTheme(fd);
      if (!res.success) {
        setCustomError(res.error);
        return;
      }
      // Point this page (or the global default) at the new theme.
      if (pageId) {
        await setPageThemeAction(pageId, dup.themeId);
      } else {
        await activateTheme(dup.themeId);
      }
      router.refresh();
      reloadPreview();
    } catch {
      setCustomError("Failed to save theme. Please try again.");
    } finally {
      setForkPending(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDelPending(id);
    setDeleteTarget(null);
    try {
      await deleteCustomTheme(id);
      router.refresh();
      reloadPreview();
    } finally {
      setDelPending(null);
    }
  };

  // Uploaded fonts (#82): after upload/delete the server revalidated /theme,
  // but the client tree needs a refresh for the new chips + usage counts.
  const refreshAfterFontChange = React.useCallback(() => {
    router.refresh();
    reloadPreview();
  }, [router, reloadPreview]);

  const isCustom = active ? !active.isPreset : false;

  const effectiveActiveId = pageId ? (pageThemeId ?? activeId) : activeId;

  return (
    <div className="flex flex-col gap-8">
      {/* Header row: title left, actions top-right */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Theme</h1>
          <p className="text-sm text-muted-foreground">
            Choose a preset or fully customise your page.
          </p>
        </div>
        <ThemeActions themes={themes} active={active} />
      </div>

      <PresetGallery
        themes={themes}
        activeId={effectiveActiveId}
        selecting={selecting}
        delPending={delPending}
        onSelect={handleSelect}
        onDeleteClick={setDeleteTarget}
      />

      {active ? (
        <ThemeCustomizer
          active={active}
          onCustomize={handleCustom}
          customPending={customPending}
          customError={customError}
          isCustom={isCustom}
          onFork={handleFork}
          forkPending={forkPending}
          customFonts={customFonts}
          themes={themes}
          onFontUploaded={refreshAfterFontChange}
          onFontDeleted={refreshAfterFontChange}
        />
      ) : null}

      {/* Delete confirmation dialog — replaces native confirm() */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete this custom theme?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The theme will be permanently removed.
            </DialogDescription>
      </DialogHeader>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              type="button"
              disabled={delPending !== null}
              onClick={() => { if (deleteTarget !== null) handleDelete(deleteTarget); }}
            >
              {delPending !== null ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
