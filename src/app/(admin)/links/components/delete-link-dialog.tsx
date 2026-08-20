"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { deleteLink } from "@/server/actions/links";
import type { LinkRow } from "@/server/queries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface DeleteLinkDialogProps {
  link: LinkRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteLinkDialog({
  link,
  open,
  onOpenChange,
}: DeleteLinkDialogProps) {
  const t = useTranslations("linksPage");
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
          <DialogTitle>{t("deleteLinkTitle")}</DialogTitle>
          <DialogDescription>
            {t("willBeRemoved", { title: link?.title ?? "" })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending ? t("deleting") : t("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
