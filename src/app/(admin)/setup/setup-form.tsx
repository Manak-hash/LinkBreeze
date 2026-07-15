"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { setup } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SetupForm({ defaultUsername }: { defaultUsername: string }) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await setup(formData);
      if (result.success) {
        router.push("/dashboard");
        router.refresh();
      }
      return result;
    },
    null as { success: false; error: string } | null,
  );

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-5 py-10">
      <div className="w-full max-w-md aurora-rise">
        <header className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/logo-mark.svg"
            alt=""
            aria-hidden
            width={56}
            height={56}
            unoptimized
            className="mb-5 size-14"
            style={{ filter: "drop-shadow(0 0 24px rgba(124,58,237,0.45))" }}
          />
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Welcome to LinkBreeze
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your admin account to get started.
          </p>
        </header>
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Admin credentials</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              defaultValue={defaultUsername}
              required
              minLength={3}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
            <p className="text-xs text-muted-foreground">At least 8 characters with one uppercase letter and one number.</p>
          </div>
          {state && !state.success ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating account…" : "Create account"}
          </Button>
        </CardFooter>
      </form>
        </Card>
      </div>
    </div>
  );
}
