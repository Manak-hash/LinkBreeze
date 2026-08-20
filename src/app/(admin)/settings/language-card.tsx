"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { setLocaleAction } from "@/server/actions/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AVAILABLE_LOCALES, LOCALE_NAMES } from "@/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Language picker — top of the General tab, always visible (never
 * hover-only, per UI rules). Switching calls the server action (cookie +
 * settings row) then refreshes so the whole admin re-renders translated.
 */
export function LanguageCard() {
  const t = useTranslations("settings.language");
  const active = useLocale();
  const [pending, startTransition] = React.useTransition();

  const pick = (locale: string) => {
    startTransition(async () => {
      await setLocaleAction(locale);
      // Full refresh: the locale is resolved server-side from the cookie.
      window.location.reload();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="size-4" />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          role="radiogroup"
          aria-label={t("title")}
          className="flex flex-wrap gap-2"
        >
          {AVAILABLE_LOCALES.map((locale) => (
            <button
              key={locale}
              type="button"
              role="radio"
              aria-checked={locale === active}
              disabled={pending}
              onClick={() => pick(locale)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                locale === active
                  ? "border-violet/50 bg-violet/15 text-lavender"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {LOCALE_NAMES[locale]}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
