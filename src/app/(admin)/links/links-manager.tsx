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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import {
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  ExternalLink,
  BarChart3,
  Clock,
} from "lucide-react";
import {
  createLink,
  updateLink,
  deleteLink,
  toggleLink,
  reorderLinks,
} from "@/server/actions/links";
import { useRouter } from "next/navigation";
import type { LinkRow } from "@/server/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LINK_TYPES = [
  { value: "url", label: "URL" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "sms", label: "SMS" },
  { value: "embed", label: "Embed (YouTube, Spotify, etc.)" },
] as const;

interface SortableLinkProps {
  link: LinkRow;
  onEdit: (link: LinkRow) => void;
  onDelete: (link: LinkRow) => void;
}

function SortableLink({ link, onEdit, onDelete }: SortableLinkProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: link.id });
  const router = useRouter();

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [toggling, setToggling] = React.useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await toggleLink(link.id);
      router.refresh();
    } finally {
      setToggling(false);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-stretch gap-1">
      <button
        className="flex cursor-grab items-center px-1 text-muted-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        type="button"
      >
        <GripVertical className="size-4" />
      </button>

      <Card className="flex-1">
        <CardContent className="flex items-center gap-3 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium">{link.title}</span>
              {link.isHighlighted ? (
                <Badge className="shrink-0 border-transparent bg-[var(--aurora-grad)] text-white">
                  Star
                </Badge>
              ) : null}
              {!link.isActive ? (
                <Badge variant="outline" className="shrink-0">
                  Hidden
                </Badge>
              ) : null}
              {link.scheduleStart || link.scheduleEnd ? (
                <Badge variant="outline" className="shrink-0 gap-1">
                  <Clock className="size-3" />
                  Scheduled
                </Badge>
              ) : null}
            </div>
            <p className="truncate text-xs text-muted-foreground">{link.url}</p>
          </div>

          <span className="hidden shrink-0 text-xs tabular-nums text-muted-foreground sm:inline">
            {link.clicksCount} clicks
          </span>

          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden shrink-0 text-muted-foreground hover:text-foreground sm:inline-flex"
            aria-label="Open link"
          >
            <ExternalLink className="size-4" />
          </a>

          <Link
            href={`/links/${link.id}`}
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Link analytics"
          >
            <BarChart3 className="size-4" />
          </Link>

          <Switch
            checked={link.isActive}
            onCheckedChange={handleToggle}
            disabled={toggling}
            aria-label="Toggle link visibility"
          />

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(link)}
            aria-label="Edit link"
          >
            <Pencil className="size-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(link)}
            aria-label="Delete link"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: LinkRow | null;
}

function LinkDialog({ open, onOpenChange, editing }: LinkDialogProps) {
  const [pending, startTransition] = React.useTransition();
  const [type, setType] = React.useState(editing?.type ?? "url");
  const [highlighted, setHighlighted] = React.useState(editing?.isHighlighted ?? false);
  const [active, setActive] = React.useState(editing?.isActive ?? true);
  const [scheduled, setScheduled] = React.useState(!!editing?.scheduleStart || !!editing?.scheduleEnd);
  const router = useRouter();

  // Reset local form state whenever the dialog opens (or switches target).
  // Adjusting state during render — instead of in an effect — avoids the
  // cascading-render anti-pattern.
  const sessionKey = open ? `open:${editing?.id ?? "new"}` : "closed";
  const [lastSession, setLastSession] = React.useState(sessionKey);
  if (sessionKey !== lastSession) {
    setLastSession(sessionKey);
    if (open) {
      setType(editing?.type ?? "url");
      setHighlighted(editing?.isHighlighted ?? false);
      setActive(editing?.isActive ?? true);
      setScheduled(!!editing?.scheduleStart || !!editing?.scheduleEnd);
    }
  }

  const urlLabel =
    type === "email" ? "Email address"
    : type === "phone" ? "Phone number"
    : type === "whatsapp" ? "WhatsApp number"
    : type === "sms" ? "Phone number"
    : "URL";

  const urlPlaceholder =
    type === "email" ? "you@example.com"
    : type === "phone" ? "+212600000000"
    : type === "whatsapp" ? "+212600000000"
    : type === "sms" ? "+212600000000"
    : "https://example.com";

  const handleSubmit = (formData: FormData) => {
    // Prepend the correct prefix for non-URL types
    const rawUrl = (formData.get("url") as string) || "";
    if (type === "email" && !rawUrl.startsWith("mailto:")) {
      formData.set("url", `mailto:${rawUrl}`);
    } else if (type === "phone" && !rawUrl.startsWith("tel:")) {
      formData.set("url", `tel:${rawUrl}`);
    } else if (type === "whatsapp" && !rawUrl.startsWith("https://wa.me/")) {
      formData.set("url", `https://wa.me/${rawUrl.replace(/[^0-9]/g, "")}`);
    } else if (type === "sms" && !rawUrl.startsWith("sms:")) {
      formData.set("url", `sms:${rawUrl}`);
    }
    formData.set("type", type);
    formData.set("isHighlighted", highlighted ? "on" : "off");
    formData.set("isActive", active ? "on" : "off");

    // If scheduling is toggled off, clear any stale schedule values.
    if (!scheduled) {
      formData.delete("scheduleStart");
      formData.delete("scheduleEnd");
    }

    startTransition(async () => {
      if (editing) {
        await updateLink(formData);
      } else {
        await createLink(formData);
      }
      router.refresh();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit link" : "Add link"}</DialogTitle>
          <DialogDescription>
            {editing ? "Update the details of this link." : "Create a new link for your page."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={editing?.title ?? ""}
              required
              maxLength={120}
              placeholder="My website"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="url">{urlLabel}</Label>
            <Input
              id="url"
              name="url"
              defaultValue={editing?.url ?? ""}
              required
              maxLength={2048}
              placeholder={urlPlaceholder}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              name="description"
              defaultValue={editing?.description ?? ""}
              maxLength={300}
              placeholder="A short subtitle"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="imageUrl">Thumbnail image URL (optional)</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              defaultValue={editing?.imageUrl ?? ""}
              maxLength={2048}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v ?? "url")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LINK_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={highlighted} onCheckedChange={setHighlighted} />
              Highlight
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={active} onCheckedChange={setActive} />
              Active
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={scheduled} onCheckedChange={setScheduled} />
              Schedule
            </label>
            {scheduled ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <div className="flex flex-1 flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Show from</span>
                  <Input
                    type="datetime-local"
                    name="scheduleStart"
                    defaultValue={
                      editing?.scheduleStart
                        ? editing.scheduleStart.replace(" ", "T").slice(0, 16)
                        : ""
                    }
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Hide after</span>
                  <Input
                    type="datetime-local"
                    name="scheduleEnd"
                    defaultValue={
                      editing?.scheduleEnd
                        ? editing.scheduleEnd.replace(" ", "T").slice(0, 16)
                        : ""
                    }
                  />
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  link,
  open,
  onOpenChange,
}: {
  link: LinkRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [pending, startTransition] = React.useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!link) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", String(link.id));
      await deleteLink(fd);
      router.refresh();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete link?</DialogTitle>
          <DialogDescription>
            “{link?.title}” will be permanently removed. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function LinksManager({ initialLinks }: { initialLinks: LinkRow[] }) {
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

    setItems((prev) => {
      const oldIndex = prev.findIndex((l) => l.id === active.id);
      const newIndex = prev.findIndex((l) => l.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });

    // Persist the new order to the server.
    const newOrder = items.map((l) => l.id);
    const activeIdx = newOrder.indexOf(Number(active.id));
    const overIdx = newOrder.indexOf(Number(over.id));
    if (activeIdx >= 0 && overIdx >= 0) {
      const reordered = arrayMove(newOrder, activeIdx, overIdx);
      await reorderLinks(reordered);
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

      <LinkDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />
      <DeleteDialog
        link={deleting}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
}
