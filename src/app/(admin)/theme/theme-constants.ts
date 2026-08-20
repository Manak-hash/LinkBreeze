// ─── Constant option arrays ───────────────────────────────────────────────
// `label` holds a translation key (resolved via useTranslations("theme") at
// the render site), except FONT_OPTIONS where labels are font brand names.

export const FONT_OPTIONS = [
  { id: "inter", label: "Inter", sample: "Aa" },
  { id: "poppins", label: "Poppins", sample: "Aa" },
  { id: "playfair", label: "Playfair Display", sample: "Aa" },
  { id: "jetbrains", label: "JetBrains Mono", sample: "Aa" },
  { id: "space-grotesk", label: "Space Grotesk", sample: "Aa" },
  { id: "dm-sans", label: "DM Sans", sample: "Aa" },
  { id: "lora", label: "Lora", sample: "Aa" },
  { id: "bebas", label: "Bebas Neue", sample: "Aa" },
  { id: "sora", label: "Sora", sample: "Aa" },
  { id: "outfit", label: "Outfit", sample: "Aa" },
  { id: "nunito", label: "Nunito", sample: "Aa" },
  { id: "press-start", label: "Press Start 2P", sample: "8b" },
  { id: "montserrat", label: "Montserrat", sample: "Aa" },
  { id: "caveat", label: "Caveat", sample: "Aa" },
  { id: "pacifico", label: "Pacifico", sample: "Aa" },
  { id: "abril", label: "Abril Fatface", sample: "Aa" },
];

export const BG_TYPES = [
  { value: "solid", label: "bgSolid" },
  { value: "gradient", label: "bgGradient" },
  { value: "radial", label: "bgRadial" },
  { value: "mesh", label: "bgMesh" },
  { value: "aurora", label: "bgAurora" },
  { value: "animatedGradient", label: "bgAnimatedGradient" },
  { value: "image", label: "bgImage" },
  { value: "video", label: "bgVideo" },
  { value: "gif", label: "bgGif" },
] as const;

export const LINK_STYLES = [
  { value: "pill", label: "lsPill" },
  { value: "rounded", label: "lsRounded" },
  { value: "sharp", label: "lsSharp" },
  { value: "glass", label: "lsGlass" },
  { value: "outline", label: "lsOutline" },
  { value: "neon", label: "lsNeon" },
  { value: "pixel", label: "lsPixel" },
  { value: "gel", label: "lsGel" },
] as const;

export const SHADOW_STRENGTHS = [
  { value: "none", label: "shadowNone" },
  { value: "subtle", label: "shadowSubtle" },
  { value: "soft", label: "shadowSoft" },
  { value: "medium", label: "shadowMedium" },
  { value: "strong", label: "shadowStrong" },
] as const;

export const HOVER_EFFECTS = [
  { value: "lift", label: "hoverLift" },
  { value: "scale", label: "hoverScale" },
  { value: "glow", label: "hoverGlow" },
  { value: "none", label: "hoverNone" },
] as const;

export const BACKGROUND_ANGLES = [
  { value: "90deg", label: "angle90" },
  { value: "135deg", label: "angle135" },
  { value: "160deg", label: "angle160" },
  { value: "180deg", label: "angle180" },
] as const;

export const FONT_WEIGHTS = [
  { value: "300", label: "weightLight" },
  { value: "400", label: "weightRegular" },
  { value: "500", label: "weightMedium" },
  { value: "600", label: "weightSemibold" },
  { value: "700", label: "weightBold" },
] as const;

export const BUTTON_SIZES = [
  { value: "sm", label: "sizeSm" },
  { value: "md", label: "sizeMd" },
  { value: "lg", label: "sizeLg" },
] as const;

export const ALIGNMENTS = [
  { value: "left", label: "alignLeft" },
  { value: "center", label: "alignCenter" },
  { value: "right", label: "alignRight" },
] as const;

export const DENSITIES = [
  { value: "compact", label: "densityCompact" },
  { value: "normal", label: "densityNormal" },
  { value: "relaxed", label: "densityRelaxed" },
] as const;

export const REVEAL_ANIMATIONS = [
  { value: "lift", label: "revealLift" },
  { value: "scale", label: "revealScale" },
  { value: "fade-up", label: "revealFadeUp" },
  { value: "slide-in", label: "revealSlideIn" },
  { value: "zoom-in", label: "revealZoomIn" },
  { value: "blur-in", label: "revealBlurIn" },
  { value: "none", label: "revealNone" },
] as const;

export const AVATAR_SHAPES = [
  { value: "circle", label: "avCircle" },
  { value: "squircle", label: "avSquircle" },
  { value: "rounded", label: "avRounded" },
  { value: "square", label: "avSquare" },
] as const;

export const AVATAR_BORDERS = [
  { value: "solid", label: "borderSolid" },
  { value: "gradient", label: "borderGradient" },
  { value: "glow", label: "borderGlow" },
  { value: "ring", label: "borderRing" },
  { value: "none", label: "borderNone" },
] as const;

export const PROFILE_LAYOUTS = [
  { value: "classic", label: "layoutClassic" },
  { value: "hero", label: "layoutHero" },
  { value: "banner", label: "layoutBanner" },
] as const;

export const TEXT_ANIMATIONS = [
  { value: "none", label: "textAnimNone" },
  { value: "typewriter", label: "textAnimTypewriter" },
  { value: "gradient-flow", label: "textAnimGradientFlow" },
] as const;

// ─── Helpers ───────────────────────────────────────────────────────────────
