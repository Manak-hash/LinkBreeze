/**
 * Maps server-action error strings to i18n keys.
 *
 * Server actions return English literals as their stable wire contract
 * (asserted in unit tests). Render sites that show `res.error` to the user
 * pass it through `localizeActionError(t, res.error)`: known messages map to
 * translated keys; unknown/future strings fall back to the raw server text
 * (English) so nothing is ever swallowed.
 *
 * Keys live under the `errors` namespace in src/locales/{en,fr}.ts.
 */

/** English server-action message → errors-namespace key. */
const MESSAGE_KEYS: Record<string, string> = {
  // auth / session
  "Unauthorized": "unauthorized",
  "Invalid username or password.": "invalidCredentials",
  "Setup has already been completed": "setupCompleted",
  "Username already taken": "usernameTaken",
  "Something went wrong during setup. Please try again.": "setupFailed",
  "Something went wrong. Please try again.": "somethingWentWrong",
  "Something went wrong while deleting the page. Please try again.": "pageDeleteFailed",

  // generic
  "Invalid input": "invalidInput",
  "Invalid JSON": "invalidJson",
  "Not found": "notFound",

  // zod schema messages (first-issue surfaced to the user)
  "Username is required": "usernameRequired",
  "Username must be at least 3 characters": "usernameTooShort",
  "Username may only contain letters, numbers, dots, hyphens and underscores": "usernameChars",
  "Password is required": "passwordRequired",
  "Please enter a valid email": "invalidEmail",
  "Slug is required": "slugRequired",
  "Slug may only contain letters, numbers, hyphens and underscores": "slugCharsUnderscore",
  "Slug must be 80 characters or less": "slugTooLong",
  "Title is required": "titleRequired",
  "Invalid icon name": "invalidIconName",
  "Invalid position": "invalidPosition",

  // rate limit
  // "Too many requests. Try again in Xs." is templated — handled below.

  // demo
  "This is a read-only demo. Deploy your own instance to make changes.": "demoReadOnly",

  // pages
  "A page with this slug already exists": "slugExists",
  "The default page cannot be deleted": "defaultPageProtected",
  "Page not found": "pageNotFound",
  "Invalid page id": "invalidPageId",
  "Missing page id": "missingPageId",

  // links / sections
  "Link not found": "linkNotFound",
  "Invalid link id": "invalidLinkId",
  "Missing link id": "missingLinkId",
  "Invalid section id": "invalidSectionId",
  "Missing section id": "missingSectionId",
  "Invalid order payload": "invalidOrderPayload",
  "URL is required": "urlRequired",
  "URL scheme is not allowed for this link type": "urlSchemeNotAllowed",

  // themes
  "A theme with this name already exists": "themeNameExists",
  "Theme not found": "themeNotFound",
  "Invalid theme id": "invalidThemeId",
  "Built-in themes cannot be deleted": "builtinThemeProtected",
  "Cannot delete the active theme": "activeThemeProtected",
  "No active theme": "noActiveTheme",
  "No theme to customise": "noThemeToCustomize",
  "No theme to duplicate": "noThemeToDuplicate",

  // files / uploads
  "No file provided": "noFile",
  "File is required": "fileRequired",
  "File is empty": "fileEmpty",
  "File must be an image": "fileNotImage",
  "File must be a video": "fileNotVideo",
  "File too large (max 1 MB)": "fileTooLarge1",
  "File too large (max 2 MB)": "fileTooLarge2",
  "File too large (max 5 MB)": "fileTooLarge5",
  "Unsupported file type": "unsupportedFileType",
  "Unsupported file type. Use an image or .mp4/.webm video": "unsupportedMedia",
  "Unsupported file type. Use .ico, .png, .svg, .gif, or .webp": "unsupportedFavicon",
  "Unsupported file type. Use .woff2 or .woff": "unsupportedFont",

  // fonts
  "Font not found": "fontNotFound",
  "Invalid font id": "invalidFontId",
  "That custom font no longer exists": "fontGone",
  "Not a valid font file (expected woff2 or woff)": "invalidFontFile",
  "Embedded font is too large (max 2 MB)": "fontTooLarge",
  "Could not store the font file. Check disk space and permissions.": "fontStoreFailed",
  "Could not restore the embedded font file": "fontRestoreFailed",

  // data / backup
  "No backup file provided": "noBackupFile",
  "Not a valid LinkBreeze backup": "invalidBackup",
  "Backup contains malformed data — rows do not match the expected schema": "backupMalformedData",
  "Backup contains malformed sections": "backupMalformedSections",
  "Backup contains malformed custom fonts": "backupMalformedFonts",
  "Restore failed — backup may be incompatible": "restoreIncompatible",

  // migration wizard
  "Invalid import data": "invalidImportData",
  "Invalid JSON file": "invalidJsonFile",
  "Only HTML and JSON files are supported": "unsupportedImportFile",
  "Please wait 30 seconds between imports": "importCooldown",
  "Failed to fetch the page": "fetchFailed",
  "Failed to parse the file": "parseFailed",
  "Target page not found": "targetPageNotFound",

  // password change
  "Current password is incorrect": "wrongCurrentPassword",
  "New password must be at least 8 characters": "passwordTooShort",
  "Password must be at least 8 characters": "passwordTooShort",
  "Password must contain at least one uppercase letter": "passwordNeedsUpper",
  "Password must contain at least one lowercase letter": "passwordNeedsLower",
  "Password must contain at least one number": "passwordNeedsNumber",
  "Display name is required": "displayNameRequired",
  "Slug can only contain letters, numbers, and hyphens": "slugChars",
  "Name is required": "nameRequired",
  "Invalid delete mode": "invalidDeleteMode",
  "Invalid submission": "invalidSubmission",
  "Custom font": "customFont",
};

const RATE_LIMIT_RE = /^Too many requests\. Try again in (\d+)s\.$/;

/**
 * Translate a server-action error message using the `errors` translator.
 * Unknown messages return the original string untouched.
 */
/** Accepts a next-intl translator from the `errors` namespace (any keys). */
type ErrTranslator = (key: never) => string;

export function localizeActionError(
  t: ErrTranslator,
  message: string | undefined | null,
): string {
  if (!message) return "";
  const key = MESSAGE_KEYS[message];
  if (key) return t(key as never);
  const rl = RATE_LIMIT_RE.exec(message);
  if (rl) {
    // Typed translators reject a values object for non-ICU keys; the errors
    // dictionary's rateLimited IS an ICU message, so this cast is sound.
    const withValues = t as unknown as (k: string, v: Record<string, string | number>) => string;
    return withValues("rateLimited", { seconds: rl[1] });
  }
  return message;
}
