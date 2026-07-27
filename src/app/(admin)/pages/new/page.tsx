"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { createPageAction } from "@/server/actions/pages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function NewPageForm() {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = await createPageAction(formData);
      if (res.success) {
        router.push(`/links?page=${res.pageId}`);
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/links"
          className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to links
        </Link>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          New page
        </h1>
        <p className="text-sm text-muted-foreground">
          Create a new page with its own links, profile, and theme.
        </p>
      </div>

      <form action={handleSubmit} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Page details</CardTitle>
            <CardDescription>
              The slug is the URL path. You can customize everything else later.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                required
                maxLength={80}
                placeholder="music"
                className="max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                Letters, numbers, and hyphens. This becomes your URL: /music
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                name="title"
                maxLength={80}
                placeholder="My Music Page"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="bio">Bio (optional)</Label>
              <Input
                id="bio"
                name="bio"
                maxLength={300}
                placeholder="A short description"
              />
            </div>
          </CardContent>
          <CardFooter className="gap-3">
            <Button type="submit" disabled={pending}>
              <Plus className="size-4" />
              {pending ? "Creating…" : "Create page"}
            </Button>
            {error ? (
              <span className="text-sm text-destructive">{error}</span>
            ) : null}
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
