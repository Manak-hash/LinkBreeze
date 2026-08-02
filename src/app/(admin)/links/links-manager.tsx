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
import { Plus } from "lucide-react";
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

    // Compute the reordered array from prev inside setItems so we read the
    // current (non-stale) state. Use the same array for both state update and
    // persistence — previously `items.map(...)` below read the stale closure
    // value, sending the OLD order to the server. The result is captured in a
    // holder object because TS control-flow narrowing keeps a `let` pinned to
    // its initial value across a callback assignment.
    const result: { value: LinkRow[] | null } = { value: null };
    setItems((prev) => {
      const oldIndex = prev.findIndex((l) => l.id === active.id);
      const newIndex = prev.findIndex((l) => l.id === over.id);
      if (oldIndex < 0 || newIndex < 0) {
        result.value = null;
        return prev;
      }
      result.value = arrayMove(prev, oldIndex, newIndex);
      return result.value;
    });

    if (result.value) {
      await reorderLinks(result.value.map((l) => l.id));
      reloadPreview();
    }
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
            <p className="text-sm text-muted-foreground">
              No links yet. Add your first link to get started.
            </p>
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              Add link
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
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
