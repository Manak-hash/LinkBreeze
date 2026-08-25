/**
 * English — MASTER SOURCE OF TRUTH for all UI strings.
 *
 * RULES (read before editing):
 *  1. NO `as const` on the export. `typeof en` must stay a widened object
 *     type so translated files can satisfy it with their own strings.
 *     Adding `as const` freezes literal types and breaks every locale file.
 *  2. Every other locale file annotates `const xx: Messages = {...}` —
 *     missing keys, extra keys, and shape mismatches fail `tsc --noEmit`.
 *  3. After changing any value here, run `npm run i18n:check` — it flags
 *     locale files whose `lastSyncedHash` no longer matches this file.
 *  4. Plurals use ICU syntax: '{count, plural, one {# link} other {# links}}'.
 *     zh has no plural forms; ar needs all six (zero/one/two/few/many/other).
 *  5. Interpolation placeholders live in braces: {name}, {count}.
 */

const en = {
  meta: {
    adminTitle: "LinkBreeze — Admin",
    // `machine` until a native reviewer signs off; picker shows a beta marker.
    status: "reviewed" as const,
  },

  localePicker: {
    label: "Language",
  },

  common: {
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
    delete: "Delete",
    close: "Close",
    retry: "Try again",
    back: "Back",
    next: "Next",
    viewPage: "View public page",
    saved: "Saved!",
  },

  nav: {
    dashboard: "Dashboard",
    links: "Links",
    theme: "Theme",
    settings: "Settings",
    profile: "Profile",
    primary: "Primary",
  },

  shell: {
    signedInAs: "Signed in as <b>{name}</b>",
    signOut: "Sign out",
    pagesSection: "Pages",
    demoBannerLead: "Live demo.",
    demoBannerVisit: "Visit LinkBreeze",
    demoBannerDeploy: "Deploy your own instance",
    livePreview: "Live preview",
  },

  login: {
    title: "Sign in",
    subtitle: "Sign in to manage your LinkBreeze page",
    username: "Username",
    password: "Password",
    submit: "Sign in",
    submitPending: "Signing in…",
    invalidCredentials: "Invalid username or password.",
    backToPage: "Back to page",
    welcomeBack: "Welcome back",
  },

  setup: {

    saving: "Saving…",

    thisIsTheOnlyAccount: "This is the only account. You'll use it to manage everything.",

    chooseStartingPoint: "Choose a starting point. Customize everything later.",

    importYourExistingPage: "Import your existing page",
    welcomeTitle: "Welcome to LinkBreeze",
    createAdminTitle: "Create your admin account",
    createAccount: "Create account",
    creatingAccount: "Creating account…",
    noEmailNote: "Takes 30 seconds. No email required.",
    networkError: "Network error. Please try again.",
    setUpPage: "Set up your page",
    profileStepNote: "This is what visitors see. You can change everything later.",
    pickTheme: "Pick a theme",
    username: "Username",
    password: "Password",
    passwordHint: "At least 8 characters with one uppercase letter and one number.",
    displayName: "Display name",
    displayNamePlaceholder: "Jane Doe",
    bio: "Bio",
    bioHint: "One line about you (optional)",
    bioPlaceholder: "Designer, developer, creator",
    pageUrl: "Page URL",
    pageUrlHint: "Your page will be at /your-slug",
    finishSetup: "Finish setup",
    allSet: "You're all set!",
    pageLiveDesc: "Your page is live. Add your first link to get started.",
    goToDashboard: "Go to dashboard",
  },

  dashboard: {

    new: "New",

    topLinks: "Top links",

    referrers: "Referrers",

    devices: "Devices",

    countries: "Countries",
    title: "Dashboard",
    subtitle: "Analytics for the last {range} days",
    subtitleRetention: "Analytics for the last {range} days (data kept {retention} days)",
    welcomeTitle: "Welcome to your dashboard",
    welcomeBody: "Your page is live at /{slug}. Add your first link to start collecting analytics.",
    addFirstLink: "Add your first link",
    importExisting: "Import your existing page",
    subscribersLink: "{count, plural, one {# subscriber} other {# subscribers}}",
    subscribersTitle: "Email subscribers — opens Settings → Data",
    exportCsv: "Export CSV",
    viewsLabel: "Views",
    clicksLabel: "Clicks",
    uniqueVisitors: "{count} unique visitors",
    linkClicksInRange: "Link clicks in range",
    ctrLabel: "Click-through rate",
    ctrHint: "Clicks / views",
    activeLinks: "Active links",
    totalLinks: "{count} total",
    viewsOverTime: "Views over time",
    topReferrers: "Top referrers",
    referrersDesc: "Where views came from",
    devicesTitle: "Devices",
    devicesDesc: "Browser types",
    countriesTitle: "Countries",
    countriesDesc: "Visitor locations",
    noDataYet: "No data yet.",
    noClicksYet: "No clicks yet.",
    dailyViewsClicks: "Daily views and clicks",
    topLinksDesc: "{count, plural, one {# link with clicks} other {# links with clicks}}",
  },

  linksPage: {
    deleting: "Deleting…",
    delete: "Delete",

    showMore: "Show more ({count} remaining)",

    noIconsMatch: "No icons match \"{query}\".",

    chooseIcon: "Choose an icon…",

    clicksCount: "{count} clicks",

    deleteSection: "Delete section",

    willBeRemoved: "“{title}” will be permanently removed. This cannot be undone.",

    cancel: "Cancel",

    compact: "Compact",


    richPreview: "Rich preview",


    featured: "Featured",

    active: "Active",

    iconSection: "Icon",
    iconAutoHint: "Fetches the site's favicon automatically.",
    iconModeAuto: "Auto",
    iconModeLucide: "Pick",
    iconModeCustom: "Upload",
    iconUploadSelected: "Selected: {name}",

    utmParameters: "UTM parameters",

    schedule: "Schedule",

    showFrom: "Show from",

    hideAfter: "Hide after",

    star: "Star",

    hidden: "Hidden",

    scheduled: "Scheduled",

    dropLinksHere: "Drop links here",

    links: "Links",

    addEditAndReorder: "Add, edit, and reorder the links on your page. Group them under section headers.",

    addSection: "Add section",

    addLink: "Add link",

    noLinksYet: "No links yet",

    addALinkOrImport: "Add a link or import from an existing page.",

    addYourFirstLink: "Add your first link",

    importYourExistingPage: "Import your existing page",
    ltUrl: "URL",
    ltEmail: "Email",
    ltPhone: "Phone",
    ltWhatsapp: "WhatsApp",
    ltSms: "SMS",
    ltVcard: "vCard (contact card)",
    ltFile: "File download",
    ltEmbed: "Embed (YouTube, Spotify, etc.)",
    ltText: "Text popup",
    ltLocation: "Location",
    ltLocationLabel: "Address, place, or Google Maps link",
    phLocation: "Koutoubia Mosque, Marrakech",
    phPopupText: "Longer text shown inside the popup when the card is tapped.\nSupports **bold**, *italic*, `code`, lists and headings.",
    phCtaUrl: "https://example.com/cta (empty = no button)",
    popupTextLabel: "Popup text",
    ctaLabel: "CTA button label (optional)",
    ctaUrlLabel: "CTA URL",
    phCtaLabel: "Book now (empty = no button)",
    phCtaLabelLocation: "Open in Google Maps",
    ltEmailLabel: "Email address",
    ltPhoneLabel: "Phone number",
    ltWhatsappLabel: "WhatsApp number",
    phEmail: "you@example.com",
    phPhone: "+1 (555) 000-0000",
    phUrl: "https://example.com",
    title: "Links",
    subtitle: "Add, reorder and organize the links on your page",
    editLink: "Edit link",
    createDescription: "Create a new link for your page.",
    updateDescription: "Update the details of this link.",
    typeLabel: "Type",
    cardStyle: "Card style",
    richHint: "Thumbnail + auto preview from the link's Open Graph data. Falls back to compact if no image is found.",
    sectionPlaceholder: "My projects",
    iconLabel: "Icon (optional)",
    iconShownHint: "Shown before the section title on your public page.",
    editSection: "Edit section",
    createSectionDesc: "Group links under a titled header on your public page.",
    updateSectionDesc: "Update this section's header.",
    dragReorder: "Drag to reorder",
    dragReorderSection: "Drag to reorder section",
    editSectionAria: "Edit section",
    deleteSectionAria: "Delete section",
    openLinkAria: "Open link",
    linkAnalyticsAria: "Link analytics",
    toggleVisibilityAria: "Toggle link visibility",
    editLinkAria: "Edit link",
    deleteLinkAria: "Delete link",
    noSection: "No section",
    removeIcon: "Remove icon",
    searchIcons: "Search icons…",
    deleteLinkTitle: "Delete link?",
    deleteSectionTitle: "Delete section?",
    utmSource: "Source",
    utmMedium: "Medium",
    utmCampaign: "Campaign",
    utmTerm: "Term (optional)",
    utmContent: "Content (optional)",
    url: "URL",
    title_field: "Title",
    titlePlaceholder: "My website",
    description: "Description (optional)",
    descriptionPlaceholder: "All my links in one place",
    animatedGif: "Animated GIF URL",
    thumbnail: "Thumbnail URL (optional)",
    icon: "Icon + title",
    iconHint: "Icon + title. Clean and simple.",
    customUrl: "Custom URL",
    imageUrl: "Image URL",
    section: "Section",
    duplicate: "Duplicate",
  },

  profile: {

    uploadImage: "Upload image",

    thisInformationAppearsOnYourPublicPage: "This information appears on your public page.",

    addAPlatform: "Add a platform",

    uploading: "Uploading…",

    uploadBanner: "Upload banner",

    uploadedCheck: "Uploaded ✓",

    customUrl: "Custom URL",
    availableForWork: "✨ Available for work",
    title: "Profile",
    details: "Details",
    identityDesc: "Your public identity",
    subtitle: "Your public identity — name, bio, avatar and social links",
    displayName: "Display name",
    displayNamePlaceholder: "Jane Doe",
    bio: "Bio",
    bioPlaceholder: "A short description",
    avatar: "Avatar URL",
    avatarHint: "Max 2 MB. JPG, PNG, WebP.",
    banner: "Banner image (optional)",
    badge: "Badge text (optional)",
    socialLinks: "Social links",
    socialLinksHint:
      "Icons appear above your link cards. Tap a platform to add it.",
    removeSocial: "Remove social link",
    saveProfile: "Save profile",
    savedToast: "Saved!",
  },

  pages: {

    thePageRsquoSLinksAreDeletedWithItInclud: "The page's links are deleted with it, including their click history.",

    linksMoveToYourDefaultPageUncategorizedN: "Links move to your default page, uncategorized. Nothing is lost.",

    backToLinks: "Back to links",

    newPage: "New page",

    slugHint: "The slug is the URL path. You can change it later.",

    slugCharsHint: "Letters, numbers, and hyphens. This becomes your URL: /music",

    keepTheLinks: "Keep the links",


    deleteEverything: "Delete everything",


    cancel: "Cancel",
    title: "Pages",
    newPageDesc: "Create a new page with its own links, profile, and theme.",
    detailsTitle: "Page details",
    titleOptional: "Title (optional)",
    titlePagePlaceholder: "My Music Page",
    bioOptional: "Bio (optional)",
    bioPlaceholder: "A short description",
    creating: "Creating…",
    createDescription: "Each page is a full mini-profile with its own links.",
    slug: "Page slug",
    deletePageTitle: "Delete page?",
    create: "Create page",
  },

  theme: {
    customiseTitle: "Customise {name}",
    editingCustom: "Editing a custom theme",
    presetCopyNote: "Preset — saving creates your own copy",
    saving: "Saving…",
    saveChanges: "Save changes",
    saved: "Saved",
    sharedPresetWarning: "{name} is a shared preset — changing it would restyle every page using that preset. Save your customisations as a new theme instead.",
    creating: "Creating…",
    createSave: "Create & save",
    delete: "Delete",
    themesUseIt: "{count} theme(s) use it ({names}) and will fall back to Inter.",
    deleteFont: "Delete font",
    deleteNamedTheme: "Delete \"{name}\"",
    builtinNoDelete: "Built-in themes cannot be deleted",
    createsCopyOf: "Creates an editable copy of",
    duplicating: "Duplicating…",
    duplicate: "Duplicate",
    uploading: "Uploading…",
    uploadMedia: "Upload",
    uploadFont: "Upload font",
    usedByThemes: "used by {count} themes",
    cancel: "Cancel",
    import: "Import",
    export: "Export",

    thisActionCannotBeUndoneTheThemeWillBePe: "This action cannot be undone. The theme will be permanently deleted.",

    chooseAPresetOrFullyCustomiseYourPage: "Choose a preset or fully customise your page",

    everyChangePreviewsLiveChangesApplyOnSav: "Every change previews live. Changes apply on save.",

    colorsCommaSeparated: "Colors (comma-separated)",

    setTheBannerImageOnTheProfilePageBannerI: "Set the banner image on the Profile page (Banner image field). Hero and Banner layouts use it as the cover.",

    auroraIsDrivenByYourColorsAccentPrimaryA: "Aurora is driven by your colors: accent (primary) and secondary tint the moving blobs, and the first background color sets the base.",

    uploadMediaOrPasteAUrlToUnlockDisplayCon: "Upload media or paste a URL to unlock display controls (fit and focal point).",

    howTheMediaFillsThePage: "How the media fills the page",

    downloadAThemeAsAJsonFileToBackItUpOrSha: "Download a theme as a .json file to back it up or share it, then import it on another instance.",

    nameOfTheCopy: "Name of the copy",

    theOriginalStaysUntouched: "The original stays untouched.",

    importAmpExport: "Import & export",

    noThemesUseThisFont: "No themes use this font.",

    onlyUploadFontsYouHaveTheLicenseToUseUpl: "Only upload fonts you have the license to use. Upload happens once; you can then pick it for any theme.",

    auto: "Auto",



    focalHint: "Drag the dot to set the focal point — the part that stays visible when screens crop it.",






    deleteFontTitle: "Delete \"{name}\"?",



    kb: "KB",

    center: "Center",
    // option labels (values are i18n keys; see theme-constants.ts)
    tabBackground: "Background",
    tabTypography: "Typography",
    tabLinks: "Links",
    tabProfile: "Profile",
    tabEffects: "Effects",
    bgSolid: "Solid",
    bgGradient: "Gradient",
    bgRadial: "Radial",
    bgMesh: "Mesh",
    bgAurora: "Aurora",
    bgAnimatedGradient: "Animated gradient",
    bgImage: "Image",
    bgVideo: "Video",
    bgGif: "Animated GIF",
    lsPill: "Pill",
    lsRounded: "Rounded",
    lsSharp: "Sharp",
    lsGlass: "Glass",
    lsOutline: "Outline",
    lsNeon: "Neon",
    lsPixel: "Pixel",
    lsGel: "Gel",
    shadowNone: "None",
    shadowSubtle: "Subtle",
    shadowSoft: "Soft",
    shadowMedium: "Medium",
    shadowStrong: "Strong",
    hoverLift: "Lift",
    hoverScale: "Scale",
    hoverGlow: "Glow",
    hoverNone: "None",
    angle90: "90° (horizontal)",
    angle135: "135° (diagonal)",
    angle160: "160° (steep)",
    angle180: "180° (vertical)",
    weightLight: "Light",
    weightRegular: "Regular",
    weightMedium: "Medium",
    weightSemibold: "Semibold",
    weightBold: "Bold",
    sizeSm: "Small",
    sizeMd: "Medium",
    sizeLg: "Large",
    alignLeft: "Left",
    alignCenter: "Center",
    alignRight: "Right",
    densityCompact: "Compact",
    densityNormal: "Normal",
    densityRelaxed: "Relaxed",
    revealLift: "Lift (rise up)",
    revealScale: "Scale (grow in)",
    revealFadeUp: "Fade up",
    revealSlideIn: "Slide in",
    revealZoomIn: "Zoom in",
    revealBlurIn: "Blur in",
    revealNone: "None",
    avCircle: "Circle",
    avSquircle: "Squircle",
    avRounded: "Rounded square",
    avSquare: "Square",
    borderSolid: "Solid accent",
    borderGradient: "Gradient",
    borderGlow: "Glow",
    borderRing: "Ring (offset)",
    borderNone: "None",
    layoutClassic: "Classic (avatar + name + bio)",
    layoutHero: "Hero (image banner, name overlaid)",
    layoutBanner: "Banner (wide image above classic)",
    textAnimNone: "None",
    textAnimTypewriter: "Typewriter (display name)",
    textAnimGradientFlow: "Gradient flow (display name)",
    focalCover: "Cover",
    focalCoverTitle: "Fill the page, cropping edges if needed",
    focalContain: "Contain",
    focalContainTitle: "Show the whole image, letterboxed if needed",
    focalTile: "Tile",
    focalTileTitle: "Repeat at natural size — for patterns and textures",
    mockWebsite: "My website",
    demoAvatarInitial: "A",
    demoName: "Your Name",
    demoBio: "Designer & creator",
    mockVideo: "Latest video",
    title: "Theme",
    subtitle: "Design the look of your public page",
    activeTheme: "Active theme",
    layout: "Layout",
    profileLayout: "Profile layout",
    colors: "Colors",
    accent: "Accent (primary)",
    secondary: "Secondary",
    text: "Text",
    background: "Background",
    cardBackground: "Card background",
    cardBorder: "Card border",
    cardStyle: "Card style",
    linkStyle: "Link style",
    buttonSize: "Button size",
    cornerRadius: "Corner radius",
    containerWidth: "Container width",
    borderWidth: "Border width",
    effects: "Effects",
    hoverEffect: "Hover effect",
    revealAnimation: "Reveal animation",
    noiseTexture: "Noise texture",
    glassBlur: "Glass blur",
    glow: "Glow",
    glowColor: "Glow color",
    overlayColor: "Overlay color",
    overlayOpacity: "Overlay opacity",
    opacity: "Opacity",
    typography: "Typography",
    fontScale: "Font scale",
    letterSpacing: "Letter spacing",
    cardFontToggle: "Use a different font for cards",
    cardFontLabel: "Card font",
    displayNameAnimation: "Display name animation",
    avatarShape: "Avatar shape",
    avatarBorder: "Avatar border",
    avatarSize: "Avatar size",
    floatingAvatar: "Floating avatar",
    badge: "Badge",
    deleteTheme: "Delete theme",
    duplicateTheme: "Duplicate theme",
    importExport: "Import & export",
    previewImport: "Preview import",
    pickTheme: "Pick a theme",
    mutedText: "Muted text",
    hideAfter: "Hide after",
    showFrom: "Show from",
    alignment: "Alignment",
    angle: "Angle",
    density: "Density",
    shadow: "Shadow",
    weight: "Weight",
    typeLabel: "Type",
    imageFit: "Image fit",
    imageUrl: "Image URL",
    videoUrl: "Video URL (.mp4 / .webm)",
    animatedGif: "Animated GIF URL",
    displayNameOptional: "Display name (optional)",
    newThemeName: "New theme name",
    themeCopyPlaceholder: "My theme (copy)",
    selectPlaceholder: "Select…",
    dupFailed: "Failed to duplicate theme. Please try again.",
    delFailed: "Failed to delete theme. Please try again.",
    deleting: "Deleting…",
    importFailed: "Import failed",
    importing: "Importing…",
    chooseJsonFile: "Choose JSON file…",
    saveAsOwn: "Save as your own theme?",
    focalPoint: "Focal point — drag or use arrow keys",
    recenter: "Recenter",
    recenterFocal: "Recenter focal point",
    customizerSections: "Customizer sections",
    applying: "Applying…",
    deleteCustomConfirm: "Delete this custom theme?",
    avatarHint: "Max 2 MB. JPG, PNG, WebP.",
    gifHint: "Max 2 MB. Keep loops short — big GIFs are heavy for mobile visitors.",
    videoHint: "Max 5 MB, muted autoplay loop. Fallback: your background colors paint the page when the video can't load.",
    profileSectionLabel: "Profile",
  },

  settings: {
    title: "Settings",
    qrTitle: "QR Code",
    qrCardDesc: "Customize and download the QR for /{slug}. Scan to open your public page — use it on print or screens.",
    subtitle:
      "Page configuration, appearance and account security for /{slug}",

    tabs: {
      general: "General",
      integration: "Integration",
      appearance: "Appearance",
      security: "Security",
      data: "Data",
    },

    language: {
      title: "Language",
      description:
        "Interface language for the admin panel. Your public page is not affected.",
    },

    visibility: {
      title: "Search engine visibility",
      description:
        "Control whether search engines may list your public page.",
      visibleLabel: "Visible",
      visibleHint: "Your page can appear in search results and the sitemap.",
      hiddenLabel: "Hidden",
      hiddenHint:
        "Page stays reachable, but asks search engines not to index it and drops it from the sitemap.",
      footnote:
        "Hiding relies on search engines honoring the request; already-indexed pages can take weeks to drop.",
    },

    general: {
      privacyPlaceholder: "# Privacy Policy\\n\\nThis page uses privacy-respecting analytics...",
      saving: "Saving…",
      saveGeneral: "Save general settings",
    footerPlaceholder: "© 2026 Jane Doe",
      title: "General",
      description: "Page slug, title, SEO metadata, footer and privacy policy.",
      pageSlug: "Page slug",
      slugHintRich: "Your public page lives at <code>/{slug}</code>",
      viewPublicPage: "View public page",
      pageTitle: "Page title (SEO)",
      pageTitlePlaceholder: "Jane Doe — Links",
      seoDescription: "SEO description",
      seoPlaceholder: "All my links in one place",
      footerText: "Footer text (optional)",
      privacyPolicy: "Privacy policy (optional)",
      privacyHintRich: "Leave empty to auto-generate from your page settings. Visitors can always access it at <code>/{slug}/privacy</code>. Supports Markdown (headings, lists, <strong>bold</strong>, <em>italic</em>, <code>code</code>).",
      save: "Save general settings",
    },

    integration: {
      saving: "Saving…",
      saveIntegration: "Save integration settings",
      title: "Integration",
      description: "Analytics, custom CSS and email capture.",
      analyticsScript: "Analytics script (optional)",
      analyticsHintRich: "Paste a script snippet for Plausible, Umami, Matomo, Google Analytics, etc. Add the provider domain to <code>EXTRA_SCRIPT_SRC</code> in your .env so CSP allows it to load.",
      customCss: "Custom CSS (optional)",
      customCssHintRich: "Raw CSS injected into a <code>&lt;style&gt;</code> tag on your public page.",
      emailCapture: "Email subscription",
      emailCaptureHintRich: "Show an email signup form at the bottom of your public page. Subscribers are stored in your database and can be exported as CSV.",
      consentText: "Email consent text",
      consentHintRich: "Shown next to the consent checkbox on your email signup form. Leave empty for the default: <em>I agree to receive emails and understand I can unsubscribe at any time.</em>",
      consentPlaceholder:
        "I agree to receive emails and understand I can unsubscribe at any time.",
      enabled: "Enabled",
      disabled: "Disabled",
      save: "Save integration settings",
    },

    appearance: {
      saving: "Saving…",
      saveAppearance: "Save appearance",
      title: "Appearance",
      description: "Favicon and per-page visual defaults.",
      activeTheme: "Active theme",
      favicon: "Favicon",
      faviconHint: "Upload .ico, .png, .svg, .gif or .webp (max 1 MB).",
      currentFavicon: "Current favicon",
      uploadFavicon: "Upload favicon",
      uploading: "Uploading…",
      save: "Save appearance",
    },

    security: {

      updatePassword: "Update password",

      updating: "Updating…",

      changePassword: "Change password",


      description: "Change your admin password.",
      desc: "Update your admin password.",
      currentPassword: "Current password",
      newPassword: "New password",
      passwordHint: "At least 8 characters with one uppercase letter and one number.",
      updated: "Password updated.",
    },

    data: {
      noSubscribers: "No subscribers yet. Your signup form is live on your public page.",
      clearAll: "Clear all",
      subscriberCount: "{count, plural, =1 {# subscriber.} other {# subscribers.}}",
      deleteConfirmIcu: "Permanently delete all {count} subscribers? This cannot be undone.",
      restoring: "Restoring…",
      clearing: "Clearing…",

      clearAllAnalytics: "Clear all analytics",

      restoreBackup: "Restore backup",

      data: "Data",

      retentionHint2: "Back up or restore your content and control analytics retention.",

      emailSubscribers: "Email subscribers",

      subscribersDesc: "Email addresses appear here when visitors subscribe on your public page.",

      exportBackup: "Export backup",

      retentionHint: "Older analytics are pruned automatically. Defaults to 90 days — set 0 to keep everything.",

      checkReleases: "Check for new releases on the dashboard.",

      restoreWarning: "This will REPLACE all current links, profile, settings and themes. This cannot be undone.",

      restore: "Restore",

      clearWarning: "Permanently delete ALL analytics (views + clicks) and reset click counters. This cannot be undone.",

      clear: "Clear",

      cancel: "Cancel",
      backupRestored: "Backup restored.",
      restoreFailed: "Restore failed.",
      keepForeverHint: "0 = keep forever",
      analyticsCleared: "Analytics cleared.",
      consentYes: "Yes",
      notAvailable: "N/A",
      title: "Data",
      description: "Export, backup and manage your data.",
      exportCsv: "Export CSV",
      retentionLabel: "Analytics retention (days)",
      updateNotifications: "Update notifications",
      restoreTitle: "Restore backup?",
      clearAnalyticsTitle: "Clear all analytics?",
      clearTitle: "Clear all subscribers?",
      colEmail: "Email",
      colSubscribed: "Subscribed",
      colConsent: "Consent",
    },

    qr: {
      saving: "Saving…",

      saveStyle: "Save style",

      savedBang: "Saved!",

      codeColor: "Code color",

      backgroundColor: "Background",

      themeColors: "Theme colors",

      logoHint: "With a logo, error correction is raised to High so the code keeps scanning.",

      exportSize: "PNG export size",

      px: "px",

      svg: "SVG",

      png: "PNG",

      reset: "Reset",





      styleLabel: "QR code style",
      colorLabel: "QR code color",
      bgLabel: "QR background color",
      centerLogo: "Center logo",
      previewAlt: "QR code preview",
    },
  },

  pageSwitcher: {
    newPage: "New page",
    deletePage: "Delete page {name}",
    viewPage: "View public page /{slug}",
    makeDefault: "Set {name} as the default page",
    nowDefault: "\"{name}\" is now your default page",
  },

  linkDetail: {
    backToLinks: "Back to links",
    clicksOverTime: "Clicks over time",
    dailyClicks: "Daily clicks for this link",
    topReferrers: "Top referrers",
    referrersDesc: "Where these clicks came from",
    noReferrerData: "No referrer data yet.",
  },

  migration: {

    socialProfilesInstagramYoutubeEtcAreAuto: "Social profiles (Instagram, YouTube, etc.) are auto-detected and added as social icons.",


    reviewTheExtractedLinksBelowUncheckAnyYo: "Review the extracted links below. Uncheck any you don't want to import.",

    noLinksFoundOnThisPageTryADifferentUrl: "No links found on this page. Try a different URL.",

    linktreeBentoLnkBioTapLinkHoppLittlelink: "Linktree, Bento, Lnk.bio, Tap.link, Hopp, LittleLink, Beacons, Solo.to, and more.",

    importLinksFromLinktreeBentoLnkBioLittle: "Import links from Linktree, Bento, Lnk.bio, LittleLink, or any other link-in-bio page.",


    importComplete: "Import Complete",

    importedCounts: "Imported {links} links",

    andSocial: "and {count} social profiles",

    intoThisPage: "into this page.",

    iconFallbackWarning: "{count, plural, one {# imported link did not get its site icon and will show a letter placeholder.} other {# imported links did not get their site icons and will show letter placeholders.}}",

    iconFallbackHint: "Edit and re-save those links to retry the icon fetch.",

    importAnother: "Import Another",

    viewLinks: "View Links",



    back: "Back",

    importing: "Importing...",

    migrationWizard: "Migration Wizard",


    url: "URL",

    file: "File",

    fetchingLinks: "Fetching links...",

    fetchLinks: "Fetch Links",

    parsingFile: "Parsing file...",

    uploadExtract: "Upload & Extract",

    supportedPlatforms: "Supported platforms:",



    linksCount: "Links ({count})",

    socialProfilesCount: "Social Profiles ({count})",
    extractFailed: "Failed to extract links",
    importFailed: "Import failed",
    pageUrlLabel: "Page URL",
    previewImport: "Preview Import",
    fileLabel: "HTML or JSON file",
    fileHint: "Save a competitor page as HTML, or upload a JSON export.",
  },

  onboarding: {
    heading: "Getting started",
    subtitleStart: "A few steps to get your page ready.",
    subtitleProgress: "{done} of {total} done — keep going!",
    setProfile: "Set your name and bio",
    setTheme: "Pick a theme",
    setLinks: "Add your first link",
    dismiss: "Dismiss",
  },

  preview: {
    refresh: "Refresh preview",
    openNewTab: "Open in new tab",
    close: "Close preview",
    livePreview: "Live preview",
  },

  errors: {
    errorBoundary: {
      title: "Something went wrong",
      description:
        "An unexpected error occurred while loading this page. Try again, and if the problem persists, check the server logs or restart the container.",
      errorId: "Error ID",
      retry: "Try again",
      backToDashboard: "Back to dashboard",
    },
    somethingWentWrong: "Something went wrong. Please try again.",
    uploadFailed: "Upload failed. Please try again.",
    invalidCredentials: "Invalid username or password.",
    unauthorized: "Unauthorized",
    invalidInput: "Invalid input",
    invalidJson: "Invalid JSON",
    notFound: "Not found",
    usernameRequired: "Username is required",
    usernameTooShort: "Username must be at least 3 characters",
    usernameChars: "Username may only contain letters, numbers, dots, hyphens and underscores",
    passwordRequired: "Password is required",
    invalidEmail: "Please enter a valid email",
    slugRequired: "Slug is required",
    slugCharsUnderscore: "Slug may only contain letters, numbers, hyphens and underscores",
    slugTooLong: "Slug must be 80 characters or less",
    titleRequired: "Title is required",
    invalidIconName: "Invalid icon name",
    invalidPosition: "Invalid position",
    rateLimited: "Too many requests. Try again in {seconds}s.",
    demoReadOnly: "This is a read-only demo. Deploy your own instance to make changes.",
    setupCompleted: "Setup has already been completed",
    setupFailed: "Something went wrong during setup. Please try again.",
    usernameTaken: "Username already taken",
    pageDeleteFailed: "Something went wrong while deleting the page. Please try again.",
    slugExists: "A page with this slug already exists",
    defaultPageProtected: "The default page cannot be deleted",
    pageNotFound: "Page not found",
    invalidPageId: "Invalid page id",
    missingPageId: "Missing page id",
    linkNotFound: "Link not found",
    invalidLinkId: "Invalid link id",
    missingLinkId: "Missing link id",
    invalidSectionId: "Invalid section id",
    missingSectionId: "Missing section id",
    invalidOrderPayload: "Invalid order payload",
    urlRequired: "URL is required",
    urlSchemeNotAllowed: "URL scheme is not allowed for this link type",
    themeNameExists: "A theme with this name already exists",
    themeNotFound: "Theme not found",
    invalidThemeId: "Invalid theme id",
    builtinThemeProtected: "Built-in themes cannot be deleted",
    activeThemeProtected: "Cannot delete the active theme",
    noActiveTheme: "No active theme",
    noThemeToCustomize: "No theme to customise",
    noThemeToDuplicate: "No theme to duplicate",
    noFile: "No file provided",
    fileRequired: "File is required",
    fileEmpty: "File is empty",
    fileNotImage: "File must be an image",
    fileNotVideo: "File must be a video",
    fileTooLarge1: "File too large (max 1 MB)",
    fileTooLarge2: "File too large (max 2 MB)",
    fileTooLargeMb: "File too large (max {mb} MB)",
    fileTooLarge5: "File too large (max 5 MB)",
    unsupportedFileType: "Unsupported file type",
    unsupportedMedia: "Unsupported file type. Use an image or .mp4/.webm video",
    unsupportedFavicon: "Unsupported file type. Use .ico, .png, .svg, .gif, or .webp",
    unsupportedFont: "Unsupported file type. Use .woff2 or .woff",
    fontNotFound: "Font not found",
    invalidFontId: "Invalid font id",
    fontGone: "That custom font no longer exists",
    invalidFontFile: "Not a valid font file (expected woff2 or woff)",
    fontTooLarge: "Embedded font is too large (max 2 MB)",
    fontStoreFailed: "Could not store the font file. Check disk space and permissions.",
    fontRestoreFailed: "Could not restore the embedded font file",
    noBackupFile: "No backup file provided",
    invalidBackup: "Not a valid LinkBreeze backup",
    backupMalformedData: "Backup contains malformed data — rows do not match the expected schema",
    backupMalformedSections: "Backup contains malformed sections",
    backupMalformedFonts: "Backup contains malformed custom fonts",
    restoreIncompatible: "Restore failed — backup may be incompatible",
    invalidImportData: "Invalid import data",
    invalidJsonFile: "Invalid JSON file",
    unsupportedImportFile: "Only HTML and JSON files are supported",
    importCooldown: "Please wait 30 seconds between imports",
    fetchFailed: "Failed to fetch the page",
    parseFailed: "Failed to parse the file",
    targetPageNotFound: "Target page not found",
    wrongCurrentPassword: "Current password is incorrect",
    passwordTooShort: "Password must be at least 8 characters",
    passwordNeedsUpper: "Password must contain at least one uppercase letter",
    passwordNeedsLower: "Password must contain at least one lowercase letter",
    passwordNeedsNumber: "Password must contain at least one number",
    displayNameRequired: "Display name is required",
    slugChars: "Slug can only contain letters, numbers, and hyphens",
    nameRequired: "Name is required",
    invalidDeleteMode: "Invalid delete mode",
    invalidSubmission: "Invalid submission",
    customFont: "Custom font",
  },

  update: {
    available: "LinkBreeze v{version} is available",
    running: "You're running v{version}",
    viewReleaseNotes: "View release notes",
    checkAgain: "Check again",
    dismiss: "Dismiss update notification",
  },
};

export type Messages = typeof en;
export default en;
