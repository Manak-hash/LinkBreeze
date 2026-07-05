"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Download, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ThemeRow } from "@/server/queries";

interface ThemeToolsProps {
  themes: ThemeRow[];
}

/**
 * Export (download .json) and import (upload .json) themes. Pure client-side:
 * export hits the auth-gated API route, import reads the file and POSTs it.
 */
export function ThemeTools({ themes }: ThemeToolsProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const router = useRouter();

  const handleExport = (id: number) => {
    setError(null);
    // Trigger a download via a temporary anchor so the browser uses the
    // Content-Disposition filename set by the API route.
    const a = document.createElement("a");
    a.href = `/api/themes/export?id=${id}`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportClick = () => {
    setError(null);
    inputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Always reset so picking the same file twice still fires onChange.
    e.target.value = "";
    if (!file) return;

    setBusy(true);
    setError(null);
    try {
      const text = await file.text();
      const res = await fetch("/api/themes/import", {
        method: "POST",
        body: text,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Import failed (HTTP ${res.status})`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader>
        <CardTitle>Import &amp; export</CardTitle>
        <CardDescription>
          Download a theme to back it up or share it, then re-import on any
          LinkBreeze instance. Imported themes are added as inactive copies.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Export a theme</span>
          <div className="flex flex-wrap gap-2">
            {themes.map((t) => (
              <Button
                key={t.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleExport(t.id)}
              >
                <Download className="size-4" />
                {t.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Import a theme</span>
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFile}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleImportClick}
            disabled={busy}
          >
            <Upload className="size-4" />
            {busy ? "Importing…" : "Choose JSON file…"}
          </Button>
        </div>

        {error ? (
          <p className="flex items-center gap-1.5 text-sm text-destructive">
            <AlertCircle className="size-4" />
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
