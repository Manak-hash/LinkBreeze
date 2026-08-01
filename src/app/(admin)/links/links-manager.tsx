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
import { SortableLink } from "./components/sortable-link";
import { DeleteLinkDialog } from "./components/delete-link-dialog";
import { LinkDialog } from "./components/link-dialog";
import { GroupDialog } from "./components/group-dialog";
import { DeleteGroupDialog } from "./components/delete-group-dialog";
import { Settings, Trash2 } from "lucide-react";
import type { LinkGroupRow } from "@/server/queries";

export function LinksManager({
  initialLinks,
  initialGroups,
  pageId,
}: {
  initialLinks: LinkRow[];
  initialGroups: LinkGroupRow[];
  pageId?: number;
}) {
  const [items, setItems] = React.useState<LinkRow[]>(initialLinks);
  const [groups, setGroups] = React.useState<LinkGroupRow[]>(initialGroups);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<LinkRow | null>(null);
  const [deleting, setDeleting] = React.useState<LinkRow | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  // Group dialogs
  const [groupDialogOpen, setGroupDialogOpen] = React.useState(false);
  const [editingGroup, setEditingGroup] = React.useState<LinkGroupRow | null>(null);
  const [deleteGroupOpen, setDeleteGroupOpen] = React.useState(false);
  const [deletingGroup, setDeletingGroup] = React.useState<LinkGroupRow | null>(null);

  // Sync local state when the server passes fresh data (after router.refresh()).
  const [lastInitial, setLastInitial] = React.useState(initialLinks);
  if (initialLinks !== lastInitial) {
    setLastInitial(initialLinks);
    setItems(initialLinks);
  }
  const [lastInitialGroups, setLastInitialGroups] = React.useState(initialGroups);
  if (initialGroups !== lastInitialGroups) {
    setLastInitialGroups(initialGroups);
    setGroups(initialGroups);
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

  const openEditGroup = (group: LinkGroupRow) => {
    setEditingGroup(group);
    setGroupDialogOpen(true);
  };

  const openDeleteGroup = (group: LinkGroupRow) => {
    setDeletingGroup(group);
    setDeleteGroupOpen(true);
  };

  const openCreateGroup = () => {
    setEditingGroup(null);
    setGroupDialogOpen(true);
  };

  const ungroupedLinks = items.filter((l) => l.groupId === null);

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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={openCreateGroup}>
            <Plus className="size-4" />
            Add group
          </Button>
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Add link
          </Button>
        </div>
      </div>

      {items.length === 0 && groups.length === 0 ? (
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
        <div className="flex flex-col gap-8">
          {/* Ungrouped Links */}
          {ungroupedLinks.length > 0 && (
            <div className="flex flex-col gap-2 mb-2">
              <DndContext id="dnd-ungrouped" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={ungroupedLinks.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-2">
                    {ungroupedLinks.map((link) => (
                      <SortableLink key={link.id} link={link} onEdit={openEdit} onDelete={openDelete} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* Grouped Links */}
          {groups.map((group) => {
            const groupLinks = items.filter((l) => l.groupId === group.id);
            return (
              <div key={group.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{group.title}</h3>
                    {group.linkSearch && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                        Search enabled
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => openEditGroup(group)}>
                      <Settings className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => openDeleteGroup(group)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                <DndContext id={`dnd-group-${group.id}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={groupLinks.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-2 mt-4">
                      {groupLinks.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">No links in this group.</p>
                      ) : (
                        groupLinks.map((link) => (
                          <SortableLink key={link.id} link={link} onEdit={openEdit} onDelete={openDelete} />
                        ))
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            );
          })}
        </div>
      )}

      <LinkDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} pageId={pageId} groups={groups} />
      <DeleteLinkDialog
        link={deleting}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
      <GroupDialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen} editing={editingGroup} pageId={pageId} />
      <DeleteGroupDialog open={deleteGroupOpen} onOpenChange={setDeleteGroupOpen} group={deletingGroup} />
    </div>
  );
}
