"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, DownloadCloud } from "lucide-react";
import { reorderLinks } from "@/server/actions/links";
import type { LinkRow } from "@/server/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePreview } from "@/components/admin/PreviewPane";
import { SortableLink } from "./components/sortable-link";
import { LinkDialog } from "./components/link-dialog";
import { DeleteLinkDialog } from "./components/delete-link-dialog";

export function LinksManager({
  initialLinks,
  pageId,
}: {
  initialLinks: LinkRow[];
  pageId?: number;
}) {
  const { reload: reloadPreview } = usePreview();
  const [items, setItems] = React.useState<LinkRow[]>(initialLinks);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<LinkRow | null>(null);
  const [deleting, setDeleting] = React.useState<LinkRow | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  // Sync local state when the server passes fresh data (after router.refresh()).
  // Adjusting state during render avoids the setState-in-effect anti-pattern.
  const [lastInitial, setLastInitial] = React.useState(initialLinks);
  if (initialLinks !== lastInitial) {
    setLastInitial(initialLinks);
    setItems(initialLinks);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Compute the reordered array from the current `items` closure value,
    // outside the setState updater. React may double-invoke updater functions
    // (Strict Mode), so side effects must not live inside setItems().
    const oldIndex = items.findIndex((l) => l.id === active.id);
    const newIndex = items.findIndex((l) => l.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    await reorderLinks(reordered.map((l) => l.id));
    reloadPreview();
  };

  const openEdit = (link: LinkRow) => {
    setEditing(link);
    setDialogOpen(true);
  };

  const openDelete = (link: LinkRow) => {
    setDeleting(link);
    setDeleteOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Links
          </h1>
          <p className="text-sm text-muted-foreground">
            Add, edit, and reorder the links on your page.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add link
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-violet/15">
              <Plus className="size-5 text-violet" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                No links yet
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Add a link or import from an existing page.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                Add your first link
              </Button>
              <a
                href="/settings?tab=data"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                <DownloadCloud className="size-4" />
                Import from Linktree
              </a>
            </div>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          id="links-dnd"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {items.map((link) => (
                <SortableLink
                  key={link.id}
                  link={link}
                  onEdit={openEdit}
                  onDelete={openDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <LinkDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) reloadPreview();
        }}
        editing={editing}
        pageId={pageId}
      />
      <DeleteLinkDialog
        link={deleting}
        open={deleteOpen}
        onOpenChange={(v) => {
          setDeleteOpen(v);
          if (!v) reloadPreview();
        }}
      />
    </div>
  );
}
