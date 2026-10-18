import { QrCode } from "lucide-react";
import { createHash } from "node:crypto";
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
import { getSession } from "@/lib/auth";
import { getUserById } from "@/server/queries";
import { QrCard } from "./qr-card";
import { GeneralTab, IntegrationTab, AppearanceTab, CustomCssCard } from "./settings-tab-forms";
import { OgImageCard } from "./og-image-card";
import { ChangePasswordForm } from "./change-password-form";
import { TwoFactorCard } from "./two-factor-card";
import { DataManager } from "./data-manager";
import { SubscribersCard } from "./subscribers-card";
import { MigrationWizard } from "@/components/admin/MigrationWizard";
import { SettingsTabs } from "./settings-tabs";
import { WalletStatusCard } from "./wallet-status-card";
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
  const session = await getSession();
  const currentUser = session ? await getUserById(session.userId) : null;
  async function getTotpEnabled(): Promise<boolean> {
    return Boolean(currentUser?.totpEnabled);
  }

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

  // Cache-buster for the OG preview: a hash of every page input the rendered
  // card consumes (theme, display name/title, bio, avatar). ANY change to any
  // of them — theme pick, profile edits, avatar upload — yields a new version,
  // so the preview in the Appearance tab re-fetches without a manual reload.
  const ogPreviewVersion = createHash("sha1")
    .update(
      [
        activePage?.id ?? 0,
        activePage?.themeId ?? 0,
        activePage?.title ?? "",
        activePage?.bio ?? "",
        activePage?.avatarUrl ?? "",
        activePage?.ogImageUrl ?? "",
        activePage?.ogImagePosX ?? 0,
      ].join("|"),
    )
    .digest("hex")
    .slice(0, 12);

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
            <div className="flex flex-col gap-4">
              <WalletStatusCard />
              <IntegrationTab
                pageId={activePage?.id}
                slug={slug}
                analyticsScript={activePage?.analyticsScript || ""}
                consentText={consentText}
                emailCapture={activePage?.emailCapture ?? false}
                shareEnabled={activePage?.shareEnabled ?? false}
              />
            </div>
          ),
          appearance: (
            <div className="flex flex-col gap-4">
              <AppearanceTab
                pageId={activePage?.id}
                slug={slug}
                customCss={activePage?.customCss || ""}
                faviconUrl={activePage?.faviconUrl || ""}
                themes={themes}
                activeThemeId={activePage?.themeId ?? active?.id ?? null}
              />
              {/* Social preview (OG) image — lives in the appearance tab */}
              {activePage ? (
                <OgImageCard
                  pageId={activePage.id}
                  slug={slug}
                  initialMode={activePage.ogImageMode ?? null}
                  initialUrl={activePage.ogImageUrl ?? null}
                  initialFit={activePage.ogImageFit ?? null}
                  initialPosX={activePage.ogImagePosX ?? null}
                  initialPosY={activePage.ogImagePosY ?? null}
                  initialZoom={activePage.ogImageZoom ?? null}
                  previewVersion={ogPreviewVersion}
                />
              ) : null}
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
              {/* Custom CSS — own container, bottom of the tab */}
              <CustomCssCard
                pageId={activePage?.id}
                slug={slug}
                customCss={activePage?.customCss || ""}
              />
            </div>
          ),
          security: (
            <div className="flex flex-col gap-4">
              <ChangePasswordForm />
              <TwoFactorCard enabled={await getTotpEnabled()} />
            </div>
          ),
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
