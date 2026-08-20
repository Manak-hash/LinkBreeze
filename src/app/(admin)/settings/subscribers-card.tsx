"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { chartLocaleTag } from "@/app/(admin)/dashboard/views-chart-inner";
import { useRouter } from "next/navigation";
import { Mail, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SubscriberRow } from "@/server/queries";

export function SubscribersCard({
  subscribers,
  emailCaptureEnabled,
}: {
  subscribers: SubscriberRow[];
  emailCaptureEnabled: boolean;
}) {
  const t = useTranslations("settings.data");
  const locale = useLocale();
  const router = useRouter();
  const [clearOpen, setClearOpen] = React.useState(false);
  const [clearPending, setClearPending] = React.useState(false);
  const [clearMsg, setClearMsg] = React.useState<string | null>(null);

  if (!emailCaptureEnabled) return null;

  const handleClear = async () => {
    setClearOpen(false);
    setClearPending(true);
    setClearMsg(null);
    try {
      const res = await fetch("/api/subscribers/clear", { method: "DELETE" });
      if (res.ok) {
        setClearMsg("All subscribers cleared.");
        router.refresh();
      } else {
        setClearMsg("Failed to clear subscribers.");
      }
    } catch {
      setClearMsg("Failed to clear subscribers.");
    } finally {
      setClearPending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="size-5" />{t("emailSubscribers")}</CardTitle>
        <CardDescription>
          {subscribers.length === 0
            ? t("noSubscribers")
            : t("subscriberCount", { count: subscribers.length })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {subscribers.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">{t("colEmail")}</th>
                  <th className="px-3 py-2 text-left font-medium">{t("colSubscribed")}</th>
                  <th className="px-3 py-2 text-left font-medium">{t("colConsent")}</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="px-3 py-2">{s.email}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString(chartLocaleTag(locale), {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {s.consentAt ? t("consentYes") : t("notAvailable")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("subscribersDesc")}</p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download, not page navigation */}
          <a
            href="/api/subscribers/export"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Download className="size-4" />{t("exportCsv")}</a>
          {subscribers.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setClearOpen(true)}
              disabled={clearPending}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" />
              {clearPending ? t("clearing") : t("clearAll")}
            </Button>
          ) : null}
        </div>
        {clearMsg ? (
          <p className={clearMsg.includes("cleared") ? "text-sm text-success" : "text-sm text-destructive"}>
            {clearMsg}
          </p>
        ) : null}
      </CardContent>

      <Dialog open={clearOpen} onOpenChange={setClearOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t("clearTitle")}</DialogTitle>
            <DialogDescription>
              {t("deleteConfirmIcu", { count: subscribers.length })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setClearOpen(false)}>{t("cancel")}</Button>
            <Button variant="destructive" type="button" onClick={handleClear}>{t("clear")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
