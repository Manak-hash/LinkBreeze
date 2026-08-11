"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  DownloadCloud,
  Sparkles,
  User,
  Palette,
  Link2,
} from "lucide-react";
import type { ThemeRow } from "@/server/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SetupWizardProps {
  defaultUsername: string;
  themes: ThemeRow[];
  activeThemeId: number | null;
}

type Step = "credentials" | "profile" | "theme" | "done";

const STEPS: { id: Step; label: string; icon: typeof User }[] = [
  { id: "credentials", label: "Account", icon: User },
  { id: "profile", label: "Profile", icon: Sparkles },
  { id: "theme", label: "Theme", icon: Palette },
];

export function SetupWizard({
  defaultUsername,
  themes,
  activeThemeId,
}: SetupWizardProps) {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>("credentials");
  const [selectedTheme, setSelectedTheme] = React.useState<number | null>(
    activeThemeId ?? themes[0]?.id ?? null,
  );

  // ── Step 1: credentials ──────────────────────────────────────────────
  // Uses fetch (not a server action) to avoid triggering Next.js RSC
  // revalidation, which would see userCount > 0 and redirect away before
  // the wizard can advance to step 2.
  const [credPending, setCredPending] = React.useState(false);
  const [credError, setCredError] = React.useState<string | null>(null);

  const handleCredSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCredPending(true);
    setCredError(null);
    try {
      const form = e.currentTarget;
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: (form.username as HTMLInputElement).value,
          password: (form.password as HTMLInputElement).value,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStep("profile");
      } else {
        setCredError(data.error);
      }
    } catch {
      setCredError("Network error. Please try again.");
    } finally {
      setCredPending(false);
    }
  };

  // ── Step 2: profile ──────────────────────────────────────────────────
  const [profilePending, setProfilePending] = React.useState(false);
  const [profileError, setProfileError] = React.useState<string | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfilePending(true);
    setProfileError(null);
    try {
      const form = e.currentTarget;
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: (form.displayName as HTMLInputElement).value,
          bio: (form.bio as HTMLInputElement).value,
          slug: (form.slug as HTMLInputElement).value,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStep("theme");
      } else {
        setProfileError(data.error);
      }
    } catch {
      setProfileError("Network error. Please try again.");
    } finally {
      setProfilePending(false);
    }
  };

  // ── Step 3: theme ────────────────────────────────────────────────────
  const [themePending, setThemePending] = React.useState(false);
  const [themeError, setThemeError] = React.useState<string | null>(null);

  const handleThemeSubmit = async () => {
    if (!selectedTheme) {
      setStep("done");
      return;
    }
    setThemePending(true);
    setThemeError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId: selectedTheme }),
      });
      const data = await res.json();
      if (data.success) {
        setStep("done");
      } else {
        setThemeError(data.error);
      }
    } catch {
      setThemeError("Network error. Please try again.");
    } finally {
      setThemePending(false);
    }
  };

  // ── Step 4: done ─────────────────────────────────────────────────────
  const finishOnboarding = () => {
    router.push("/dashboard");
    router.refresh();
  };

  const currentIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-5 py-10">
      <div className="w-full max-w-md aurora-rise">
        {/* Header */}
        <header className="mb-6 flex flex-col items-center text-center">
          <Image
            src="/logo-mark.svg"
            alt=""
            aria-hidden
            width={48}
            height={48}
            unoptimized
            className="mb-4 size-12"
            style={{ filter: "drop-shadow(0 0 24px rgba(124,58,237,0.45))" }}
          />
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Welcome to LinkBreeze
          </h1>
        </header>

        {/* Step indicator (hidden on credentials + done steps) */}
        {step !== "credentials" && step !== "done" && (
          <div className="mb-6 flex items-center justify-center gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isDone = i < currentIndex;
              const isActive = i === currentIndex;
              return (
                <React.Fragment key={s.id}>
                  {i > 0 && (
                    <div
                      className={`h-px w-6 ${isDone || isActive ? "bg-violet" : "bg-border"}`}
                    />
                  )}
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-violet/15 text-violet"
                        : isDone
                          ? "text-violet"
                          : "text-muted-foreground"
                    }`}
                  >
                    {isDone ? (
                      <Check className="size-3" />
                    ) : (
                      <Icon className="size-3" />
                    )}
                    {s.label}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* ── Step 1: Credentials ─────────────────────────────────────── */}
        {step === "credentials" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Create your admin account</CardTitle>
              <p className="text-sm text-muted-foreground">
                This is the only account. You&apos;ll use it to manage everything.
              </p>
            </CardHeader>
            <form onSubmit={handleCredSubmit}>
              <CardContent className="flex flex-col gap-4">
                <FormField label="Username" htmlFor="username" required>
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
                </FormField>
                <FormField
                  label="Password"
                  htmlFor="password"
                  required
                  hint="At least 8 characters with one uppercase letter and one number."
                  className="mb-4"
                >
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                </FormField>
                {credError ? (
                  <p className="text-sm text-destructive">{credError}</p>
                ) : null}
              </CardContent>
              <CardFooter className="flex-col gap-3">
                <Button type="submit" className="w-full" disabled={credPending}>
                  {credPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Creating account…
                    </>
                  ) : (
                    <>
                      Create account <ChevronRight className="size-4" />
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Takes 30 seconds. No email required.
                </p>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* ── Step 2: Profile ─────────────────────────────────────────── */}
        {step === "profile" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Set up your page</CardTitle>
              <p className="text-sm text-muted-foreground">
                This is what visitors see. You can change everything later.
              </p>
            </CardHeader>
            <form onSubmit={handleProfileSubmit}>
              <CardContent className="flex flex-col gap-4">
                <FormField label="Display name" htmlFor="displayName" required>
                  <Input
                    id="displayName"
                    name="displayName"
                    type="text"
                    placeholder="Jane Doe"
                    required
                    maxLength={80}
                    autoFocus
                  />
                </FormField>
                <FormField label="Bio" htmlFor="bio" hint="One line about you (optional)">
                  <Input
                    id="bio"
                    name="bio"
                    type="text"
                    placeholder="Designer, developer, creator"
                    maxLength={300}
                  />
                </FormField>
                <FormField
                  label="Page URL"
                  htmlFor="slug"
                  required
                  hint="Your page will be at /your-slug"
                >
                  <Input
                    id="slug"
                    name="slug"
                    type="text"
                    placeholder="jane-doe"
                    required
                    pattern="[a-zA-Z0-9_-]+"
                    maxLength={64}
                  />
                </FormField>
                {profileError ? (
                  <p className="text-sm text-destructive">{profileError}</p>
                ) : null}
              </CardContent>
              <CardFooter className="gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("credentials")}
                >
                  <ChevronLeft className="size-4" /> Back
                </Button>
                <Button type="submit" className="flex-1" disabled={profilePending}>
                  {profilePending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      Continue <ChevronRight className="size-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* ── Step 3: Theme ───────────────────────────────────────────── */}
        {step === "theme" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pick a theme</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose a starting point. Customize everything later.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`group relative overflow-hidden rounded-lg border-2 p-3 text-left transition-all ${
                      selectedTheme === theme.id
                        ? "border-violet ring-1 ring-violet"
                        : "border-border hover:border-muted-foreground/40"
                    }`}
                  >
                    {/* Mini preview */}
                    <div
                      className="mb-2 flex h-16 flex-col items-center justify-center rounded"
                      style={{
                        background:
                          theme.backgroundType === "solid" ||
                          theme.backgroundType === "aurora"
                            ? theme.backgroundValue ?? "#0a0820"
                            : `linear-gradient(135deg, ${theme.backgroundValue ?? "#0a0820"})`,
                      }}
                    >
                      <div
                        className="mb-1 size-4 rounded-full"
                        style={{ background: theme.primaryColor ?? "#7c5ff0" }}
                      />
                      <div className="flex w-full flex-col gap-0.5 px-2">
                        <div
                          className="h-0.5 w-full rounded-full"
                          style={{
                            background: theme.cardBackground ?? "rgba(255,255,255,0.15)",
                          }}
                        />
                        <div
                          className="h-0.5 w-3/4 rounded-full"
                          style={{
                            background: theme.cardBackground ?? "rgba(255,255,255,0.15)",
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-foreground">
                      {theme.name}
                    </span>
                    {selectedTheme === theme.id && (
                      <div className="absolute right-2 top-2 rounded-full bg-violet p-0.5">
                        <Check className="size-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {themeError ? (
                <p className="mt-3 text-sm text-destructive">{themeError}</p>
              ) : null}
            </CardContent>
            <CardFooter className="gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep("profile")}
              >
                <ChevronLeft className="size-4" /> Back
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={themePending}
                onClick={handleThemeSubmit}
              >
                {themePending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    Finish setup <Check className="size-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* ── Step 4: Done ────────────────────────────────────────────── */}
        {step === "done" && (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-violet/15">
                <Check className="size-8 text-violet" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold">
                  You&apos;re all set!
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your page is live. Add your first link to get started.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2">
                <Button onClick={finishOnboarding} className="w-full">
                  <Link2 className="size-4" /> Go to dashboard
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push("/settings?tab=data")}
                >
                  <DownloadCloud className="size-4" /> Import from Linktree
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
