"use client";

import * as React from "react";
import Image from "next/image";
import { Plus, Trash2, Save, Upload } from "lucide-react";
import { updateProfile } from "@/server/actions/profile";
import { updatePageAction } from "@/server/actions/pages";
import { uploadAvatar } from "@/server/actions/uploads";
import { SUPPORTED_PLATFORMS, getPlatformLabel, type SocialPlatform } from "@/lib/social-icons";
import type { SocialLink } from "@/server/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface ProfileFormProps {
  profile: {
    displayName: string;
    bio: string;
    badgeText: string;
    avatarUrl: string;
    socialLinks: SocialLink[];
  } | null;
  pageId?: number;
}

export function ProfileForm({ profile, pageId }: ProfileFormProps) {
  const [socialLinks, setSocialLinks] = React.useState<SocialLink[]>(
    profile?.socialLinks ?? [],
  );
  const [pending, startTransition] = React.useTransition();
  const [saved, setSaved] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState(profile?.avatarUrl ?? "");
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadAvatar(fd);
      if (res.success) {
        setAvatarUrl(res.url);
      } else {
        setUploadError(res.error);
      }
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const addSocial = () => {
    setSocialLinks((prev) => [...prev, { platform: "instagram", url: "" }]);
  };

  const updateSocial = (index: number, field: keyof SocialLink, value: string) => {
    setSocialLinks((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  const removeSocial = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (formData: FormData) => {
    const cleaned = socialLinks.filter((s) => s.url.trim().length > 0);
    formData.set("socialLinks", JSON.stringify(cleaned));

    // Multi-page: route through the page action.
    if (pageId) {
      formData.set("pageId", String(pageId));
      // Map profile field names to page field names.
      formData.set("title", formData.get("displayName") as string);
      startTransition(async () => {
        await updatePageAction(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      });
      return;
    }

    startTransition(async () => {
      await updateProfile(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          This information appears on your public page.
        </p>
      </div>

      <form action={handleSubmit} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Your public identity</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt=""
                  width={64}
                  height={64}
                  unoptimized
                  className="size-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-full bg-muted text-xl font-semibold">
                  {(profile?.displayName || "?").charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <FormField label="Avatar URL" htmlFor="avatarUrl">
                  <Input
                    id="avatarUrl"
                    name="avatarUrl"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://…/avatar.png"
                  />
                </FormField>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted">
                    <Upload className="size-4" />
                    {uploading ? "Uploading…" : "Upload image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUpload}
                      disabled={uploading}
                    />
                  </label>
                  {uploadError ? (
                    <span className="text-xs text-destructive">{uploadError}</span>
                  ) : null}
                </div>
              </div>
            </div>

            <FormField label="Display name" htmlFor="displayName" required>
              <Input
                id="displayName"
                name="displayName"
                defaultValue={profile?.displayName ?? ""}
                required
                maxLength={80}
                placeholder="Jane Doe"
              />
            </FormField>

            <FormField label="Bio" htmlFor="bio">
              <Input
                id="bio"
                name="bio"
                defaultValue={profile?.bio ?? ""}
                maxLength={300}
                placeholder="A short description"
              />
            </FormField>

            <FormField label="Badge text (optional)" htmlFor="badgeText">
              <Input
                id="badgeText"
                name="badgeText"
                defaultValue={profile?.badgeText ?? ""}
                maxLength={40}
                placeholder="✨ Available for work"
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social links</CardTitle>
            <CardDescription>
              Icons appear above your link cards. Add the platforms you use.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {socialLinks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No social links added yet.</p>
            ) : (
              socialLinks.map((item, i) => (
                <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Select
                    value={item.platform}
                    onValueChange={(v) => updateSocial(i, "platform", v ?? "instagram")}
                  >
                    <SelectTrigger className="w-full sm:w-40 sm:shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_PLATFORMS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {getPlatformLabel(p as SocialPlatform)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 sm:flex-1">
                    <Input
                      value={item.url}
                      onChange={(e) => updateSocial(i, "url", e.target.value)}
                      placeholder="https://…"
                      className="min-w-0 flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      type="button"
                      onClick={() => removeSocial(i)}
                      className="text-destructive"
                      aria-label="Remove social link"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
            <Separator className="my-1" />
            <Button variant="outline" type="button" onClick={addSocial} className="w-fit">
              <Plus className="size-4" />
              Add social link
            </Button>
          </CardContent>
          <CardFooter className="gap-3">
            <Button type="submit" disabled={pending}>
              <Save className="size-4" />
              {pending ? "Saving…" : "Save profile"}
            </Button>
            {saved ? (
              <span className="text-sm text-muted-foreground">Saved!</span>
            ) : null}
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
