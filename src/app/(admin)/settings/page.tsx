import Image from "next/image";
import { QrCode, Download } from "lucide-react";
import {
  getAllPages,
  getDefaultPage,
  getAllThemes,
  getActiveTheme,
  getSetting,
} from "@/server/queries";
import { isUpdateCheckEnabled } from "@/lib/update-check";
import { GeneralTab, AppearanceTab } from "./settings-tab-forms";
import { ChangePasswordForm } from "./change-password-form";
import { DataManager } from "./data-manager";
import { MigrationWizard } from "@/components/admin/MigrationWizard";
import { SettingsTabs } from "./settings-tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;

  const [allPages, defaultPage] = await Promise.all([
    getAllPages(),
    getDefaultPage(),
  ]);
  let activePage;
  if (pageParam) {
    activePage = allPages.find((p) => p.id === Number(pageParam));
  }
  if (!activePage) {
    activePage = defaultPage ?? allPages[0];
  }

  const [themes, active, updateCheckEnabled, retentionDays] = await Promise.all([
    getAllThemes(),
    getActiveTheme(),
    isUpdateCheckEnabled(),
    getSetting("analyticsRetentionDays"),
  ]);

  const slug = activePage?.slug || "u";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Page configuration, appearance and account security for{" "}
          <span className="font-medium text-foreground">/{slug}</span>
        </p>
      </div>

      <SettingsTabs
        tabs={{
          general: (
            <GeneralTab
              pageId={activePage?.id}
              slug={slug}
              title={activePage?.seoTitle || ""}
              description={activePage?.seoDescription || ""}
              footerText={activePage?.footerText || ""}
              analyticsScript={activePage?.analyticsScript || ""}
            />
          ),
          appearance: (
            <div className="flex flex-col gap-4">
              <AppearanceTab
                pageId={activePage?.id}
                customCss={activePage?.customCss || ""}
                faviconUrl={activePage?.faviconUrl || ""}
                themes={themes}
                activeThemeId={activePage?.themeId ?? active?.id ?? null}
              />
              {/* QR Code in appearance tab */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="size-5" />
                    QR Code
                  </CardTitle>
                  <CardDescription>
                    Scan to open /{slug}. Download for print or digital use.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="rounded-xl border border-border bg-white p-4">
                    <Image
                      src={`/api/qr?slug=${encodeURIComponent(slug)}&format=svg`}
                      alt="QR code"
                      width={200}
                      height={200}
                      unoptimized
                    />
                  </div>
                  <div className="flex gap-3">
                    <a
                      href={`/api/qr?slug=${encodeURIComponent(slug)}&format=svg&download=1`}
                      className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                      <Download className="size-4" />
                      SVG
                    </a>
                    <a
                      href={`/api/qr?slug=${encodeURIComponent(slug)}&format=png&download=1`}
                      className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                      <Download className="size-4" />
                      PNG
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          ),
          security: <ChangePasswordForm />,
          data: (
            <div className="flex flex-col gap-4">
              <MigrationWizard pageId={activePage?.id ?? 0} />
              <DataManager
                retentionDays={retentionDays ?? ""}
                updateCheckEnabled={updateCheckEnabled}
              />
            </div>
          ),
        }}
      />
    </div>
  );
}
