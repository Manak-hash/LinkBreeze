"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { setLocaleAction } from "@/server/actions/locale";
import { AVAILABLE_LOCALES, LOCALE_NAMES } from "@/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Pre-auth language selector for /login and /setup. Same mechanics as the
 * Settings card (cookie via server action + full reload) but visually bare:
 * a single row of pill buttons above the card, no Card chrome.
 */
export function LocalePicker({
  className,
}: {
  className?: string;
}) {
  const t = useTranslations("localePicker");
  const active = useLocale();
  const [pending, startTransition] = React.useTransition();

  const pick = (locale: string) => {
    if (locale === active) return;
    startTransition(async () => {
      await setLocaleAction(locale);
      window.location.reload();
    });
  };

  return (
    <div
      className={cn("flex items-center justify-center gap-1.5", className)}
      role="radiogroup"
      aria-label={t("label")}
    >
      <Languages className="size-4 text-muted-foreground" aria-hidden />
      {AVAILABLE_LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          role="radio"
          aria-checked={locale === active}
          disabled={pending}
          onClick={() => pick(locale)}
          className={cn(
            "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
            locale === active
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground",
            pending && "opacity-60",
          )}
        >
          {LOCALE_NAMES[locale]}
        </button>
      ))}
    </div>
  );
}
