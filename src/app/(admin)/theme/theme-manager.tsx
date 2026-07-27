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
import { DuplicateTheme } from "./components/duplicate-theme";

interface ThemeManagerProps {
  themes: ThemeRow[];
  activeId: number | null;
  active: ThemeRow | null;
  pageId?: number;
  pageThemeId?: number | null;
}

export function ThemeManager({ themes, activeId, active, pageId, pageThemeId }: ThemeManagerProps) {
  const [selecting, setSelecting] = React.useState<number | null>(null);
  const [customPending, setCustomPending] = React.useState(false);
  const [customError, setCustomError] = React.useState<string | null>(null);
  const [dupName, setDupName] = React.useState("");
  const [dupPending, setDupPending] = React.useState(false);
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
      }
    } catch {
      setCustomError("Failed to save theme. Please try again.");
    } finally {
      setCustomPending(false);
    }
  };

  const handleDuplicate = async () => {
    const name = dupName.trim().slice(0, 100);
    if (!name) return;
    setDupPending(true);
    try {
      const res = await duplicateActiveTheme(name);
      if (res.success) {
        setDupName("");
        router.refresh();
      }
    } finally {
      setDupPending(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDelPending(id);
    setDeleteTarget(null);
    try {
      await deleteCustomTheme(id);
      router.refresh();
    } finally {
      setDelPending(null);
    }
  };

  const isCustom = active ? !active.isPreset : false;

  // In page mode, highlight the page's selected theme instead of the global active.
  const effectiveActiveId = pageId ? (pageThemeId ?? activeId) : activeId;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Theme</h1>
        <p className="text-sm text-muted-foreground">
          Choose a preset or fully customise your page.
        </p>
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
        <>
          <ThemeCustomizer
            active={active}
            onCustomize={handleCustom}
            customPending={customPending}
            customError={customError}
            isCustom={isCustom}
          />
          <DuplicateTheme
            activeName={active.name}
            onDuplicate={handleDuplicate}
            dupName={dupName}
            setDupName={setDupName}
            dupPending={dupPending}
          />
        </>
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
