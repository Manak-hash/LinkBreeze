import { QrCode } from "lucide-react";
import {
  getAllPages,
  getDefaultPage,
  getAllThemes,
  getActiveTheme,
  getAnalyticsRetentionDays,
  getSetting,
  getAllSubscribers,
} from "@/server/queries";
import { isUpdateCheckEnabled } from "@/lib/update-check";
import { parseQrStyle } from "@/lib/qr-style";
import { QrCard } from "./qr-card";
import { GeneralTab, IntegrationTab, AppearanceTab } from "./settings-tab-forms";
import { ChangePasswordForm } from "./change-password-form";
import { DataManager } from "./data-manager";
import { SubscribersCard } from "./subscribers-card";
import { MigrationWizard } from "@/components/admin/MigrationWizard";
import { SettingsTabs } from "./settings-tabs";
import { getTranslations } from "next-intl/server";
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

  const [themes, active, updateCheckEnabled, retentionDays, consentText, subscribers, searchEngineHidden] = await Promise.all([
    getAllThemes(),
    getActiveTheme(),
    isUpdateCheckEnabled(),
    getAnalyticsRetentionDays(),
    getSetting("consentText"),
    getAllSubscribers(),
    getSetting("searchEngineHidden"),
  ]);

  const slug = activePage?.slug || "u";
  const t = await getTranslations("settings");

  // Theme accent swatches offered as one-click QR colors (valid hex only).
  const qrThemePresets = Array.from(
    new Set(
      [active?.primaryColor, active?.secondaryColor]
        .filter((c): c is string => !!c && /^#[0-9a-fA-F]{6}$/.test(c))
        .map((c) => c.toLowerCase()),
    ),
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("subtitle", { slug })}
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
              privacyPolicy={activePage?.privacyPolicy || ""}
              searchEngineHidden={searchEngineHidden === "true"}
            />
          ),
          integration: (
            <IntegrationTab
              pageId={activePage?.id}
              slug={slug}
              analyticsScript={activePage?.analyticsScript || ""}
              consentText={consentText}
              emailCapture={activePage?.emailCapture ?? false}
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
              {/* QR Code customizer in appearance tab */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="size-5" />{t("qrTitle")}</CardTitle>
                  <CardDescription>
                    {t("qrCardDesc", { slug })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <QrCard
                    pageId={activePage?.id}
                    slug={slug}
                    initialStyle={parseQrStyle(activePage?.qrSettings)}
                    avatarAvailable={Boolean(activePage?.avatarUrl)}
                    faviconAvailable={Boolean(activePage?.faviconUrl)}
                    themePresets={qrThemePresets}
                  />
                </CardContent>
              </Card>
            </div>
          ),
          security: <ChangePasswordForm />,
          data: (
            <div className="flex flex-col gap-4">
              <MigrationWizard pageId={activePage?.id ?? 0} />
              <SubscribersCard
                subscribers={subscribers}
                emailCaptureEnabled={activePage?.emailCapture ?? false}
              />
              <DataManager
                retentionDays={String(retentionDays)}
                updateCheckEnabled={updateCheckEnabled}
              />
            </div>
          ),
        }}
      />
    </div>
  );
}
