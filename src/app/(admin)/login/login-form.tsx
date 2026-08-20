"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { login } from "@/server/actions/auth";
import { LocalePicker } from "@/components/admin/LocalePicker";
import type { ActionResult } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";

export function LoginForm() {
  const t = useTranslations("login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await login(formData);
      if (result.success) {
        router.push(from);
        router.refresh();
      }
      return result;
    },
    null as ActionResult | null,
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <LocalePicker className="mb-4" />
        <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Image src="/logo-mark.svg" alt="LinkBreeze" width={48} height={48} unoptimized className="mx-auto mb-2" />
          <CardTitle className="text-xl">{t("welcomeBack")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">{t("username")}</Label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2 mb-4">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            {state && !state.success ? (
              <p className="text-sm text-destructive">
                {state.errorCode === "unauthorized"
                  ? t("invalidCredentials")
                  : state.error}
              </p>
            ) : null}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? t("submitPending") : t("submit")}
            </Button>
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              ← {t("backToPage")}
            </Link>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  );
}
