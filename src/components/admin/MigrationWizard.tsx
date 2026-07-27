"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DownloadCloud, Link2, FileUp, Check, Loader2, AlertCircle } from "lucide-react";
import {
  importPreviewUrl,
  importPreviewFile,
  confirmImport,
  type ImportPreviewResult,
} from "@/server/actions/migration-wizard";
import type { ImportedLink } from "@/lib/migration-wizard";
import { getPlatformLabel } from "@/lib/social-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

interface MigrationWizardProps {
  pageId: number;
}

type Step = "input" | "preview" | "done";
type Source = "url" | "file";

export function MigrationWizard({ pageId }: MigrationWizardProps) {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>("input");
  const [source, setSource] = React.useState<Source>("url");
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ImportPreviewResult | null>(null);
  const [links, setLinks] = React.useState<ImportedLink[]>([]);
  const [socialLinks, setSocialLinks] = React.useState<ImportedLink[]>([]);
  const [importResult, setImportResult] = React.useState<{
    imported: number;
    social: number;
  } | null>(null);

  const handlePreview = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    const action = source === "url" ? importPreviewUrl : importPreviewFile;
    const res = await action(null, formData);

    if (!res.success || !res.links) {
      setError(res.error || "Failed to extract links");
      setLoading(false);
      return;
    }

    setResult(res);
    setLinks(res.links);
    setSocialLinks(res.socialLinks || []);
    setStep("preview");
    setLoading(false);
  };

  const toggleLink = (idx: number, isSocial: boolean) => {
    const setter = isSocial ? setSocialLinks : setLinks;
    const list = isSocial ? [...socialLinks] : [...links];
    list[idx].selected = !list[idx].selected;
    setter(list);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("pageId", String(pageId));
    formData.set("links", JSON.stringify(links));
    formData.set("socialLinks", JSON.stringify(socialLinks));

    const res = await confirmImport(null, formData);

    if (!res.success) {
      setError(res.error || "Import failed");
      setLoading(false);
      return;
    }

    setImportResult({
      imported: res.importedCount || 0,
      social: res.socialCount || 0,
    });
    setStep("done");
    setLoading(false);
    router.refresh();
  };

  const reset = () => {
    setStep("input");
    setUrl("");
    setError(null);
    setResult(null);
    setLinks([]);
    setSocialLinks([]);
    setImportResult(null);
  };

  // ── STEP: DONE ──────────────────────────────────────────────────
  if (step === "done" && importResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="size-5 text-success" />
            Import Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Imported <span className="font-bold text-foreground">{importResult.imported}</span> links
            {importResult.social > 0 && (
              <>
                {" "}and <span className="font-bold text-foreground">{importResult.social}</span> social profiles
              </>
            )}{" "}
            into this page.
          </p>
          <div className="flex gap-3">
            <Button onClick={reset} variant="outline" size="sm">
              Import Another
            </Button>
            <Button onClick={() => router.push("/links")} size="sm">
              View Links
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── STEP: PREVIEW ───────────────────────────────────────────────
  if (step === "preview" && result) {
    const totalSelected = links.filter((l) => l.selected).length + socialLinks.filter((l) => l.selected).length;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Preview Import</span>
            <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
              {result.platform}
            </span>
          </CardTitle>
          <CardDescription>
            Review the extracted links below. Uncheck any you don&apos;t want to import.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          {links.length === 0 && socialLinks.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No links found on this page. Try a different URL.
            </p>
          )}

          {/* Page links */}
          {links.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-medium">Links ({links.filter((l) => l.selected).length}/{links.length})</h4>
              <div className="max-h-[300px] space-y-1 overflow-y-auto">
                {links.map((link, i) => (
                  <label
                    key={i}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-2 hover:bg-muted/50"
                  >
                    <input
                      type="checkbox"
                      checked={link.selected}
                      onChange={() => toggleLink(i, false)}
                      className="size-4 accent-primary"
                    />
                    {link.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={link.imageUrl}
                        alt=""
                        className="size-8 shrink-0 rounded object-cover"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                      />
                    ) : (
                      <div className="flex size-8 shrink-0 items-center justify-center rounded bg-muted">
                        <Link2 className="size-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{link.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{link.url}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-medium">
                Social Profiles ({socialLinks.filter((l) => l.selected).length}/{socialLinks.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((link, i) => (
                  <label
                    key={i}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      link.selected
                        ? "border-primary bg-primary/10"
                        : "border-border opacity-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={link.selected}
                      onChange={() => toggleLink(i, true)}
                      className="size-4 accent-primary"
                    />
                    {link.platform ? getPlatformLabel(link.platform) : "Social"}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <Button variant="outline" size="sm" onClick={reset} disabled={loading}>
              Back
            </Button>
            <Button size="sm" onClick={handleConfirm} disabled={loading || totalSelected === 0}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Importing...
                </>
              ) : (
                `Import ${totalSelected} ${totalSelected === 1 ? "item" : "items"}`
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── STEP: INPUT ─────────────────────────────────────────────────
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DownloadCloud className="size-5" />
          Migration Wizard
        </CardTitle>
        <CardDescription>
          Import links from Linktree, Bento, Lnk.bio, LittleLink, or any other link-in-bio page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Source toggle */}
        <div className="mb-4 inline-flex rounded-lg border border-border p-1">
          <button
            type="button"
            onClick={() => setSource("url")}
            className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              source === "url" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Link2 className="size-4" />
            URL
          </button>
          <button
            type="button"
            onClick={() => setSource("file")}
            className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              source === "file" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileUp className="size-4" />
            File
          </button>
        </div>

        {source === "url" ? (
          <form action={handlePreview} className="flex flex-col gap-3">
            <FormField label="Page URL" htmlFor="import-url" className="mb-2">
              <Input
                id="import-url"
                name="url"
                type="url"
                placeholder="https://linktr.ee/yourpage"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </FormField>
            <Button type="submit" disabled={loading} size="sm">
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Fetching links...
                </>
              ) : (
                <>
                  <DownloadCloud className="mr-2 size-4" />
                  Fetch Links
                </>
              )}
            </Button>
          </form>
        ) : (
          <form action={handlePreview} className="flex flex-col gap-3">
            <FormField
              label="HTML or JSON file"
              htmlFor="import-file"
              className="mb-2"
              hint="Save a competitor page as HTML, or upload a JSON export."
            >
              <Input
                id="import-file"
                name="file"
                type="file"
                accept=".html,.htm,.json,.txt"
                required
              />
            </FormField>
            <Button type="submit" disabled={loading} size="sm">
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Parsing file...
                </>
              ) : (
                <>
                  <FileUp className="mr-2 size-4" />
                  Upload & Extract
                </>
              )}
            </Button>
          </form>
        )}

        <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          <p className="mb-1 font-medium text-foreground">Supported platforms:</p>
          <p>Linktree, Bento, Lnk.bio, Tap.link, Hopp, LittleLink, Beacons, Solo.to, and more.</p>
          <p className="mt-2">Social profiles (Instagram, YouTube, etc.) are auto-detected and added as social icons.</p>
        </div>
      </CardContent>
    </Card>
  );
}
