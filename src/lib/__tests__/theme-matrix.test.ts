import { describe, it, expect } from "vitest";
import { resolveThemeTokens, resolveBackground } from "@/lib/theme-tokens";
import { customSchema } from "@/lib/theme-schema";
import { PRESETS, PRESET_NAMES, base } from "@/lib/theme-presets";

/**
 * Theme system regression matrix.
 *
 * Locks the contract between the 4 layers that must agree:
 *   1. DB schema defaults (hardcoded here from schema.ts)
 *   2. Zod validator (customSchema) — what the save action accepts
 *   3. Token resolver (resolveThemeTokens) — what produces CSS vars
 *   4. Presets (PRESETS) — the 9 built-in themes shipped to every fresh deploy
 *
 * Every past theme bug (v1.1.2 density, v1.1.3 soft-shadow, v1.1.3 fontScale)
 * was a drift between these layers. These tests would have caught all three.
 */

// ─── Dimension 1: Enum conformance ─────────────────────────────────────────
// For every enum field, assert: schema default ∈ Zod enum ∩ resolver handles it.

/** Schema column defaults, transcribed from src/db/schema.ts. */
const SCHEMA_DEFAULTS = {
  backgroundType: "gradient",
  backgroundValue: "#1a1a2e,#16213e",
  backgroundAngle: "160deg",
  backgroundImageUrl: "",
  overlayColor: "#000000",
  overlayOpacity: "0",
  primaryColor: "#0f3460",
  secondaryColor: "#a78bfa",
  cardBackground: "rgba(255,255,255,0.06)",
  cardBorderColor: "rgba(167,139,250,0.16)",
  textColor: "#eaeaea",
  mutedTextColor: "rgba(234,234,234,0.7)",
  mode: "dark",
  fontFamily: "inter",
  fontScale: "md",
  fontWeight: "600",
  letterSpacing: "0",
  linkStyle: "glass",
  animationType: "lift",
  radius: "auto",
  buttonSize: "md",
  borderWidth: "1px",
  shadowStrength: "medium",
  hoverEffect: "lift",
  containerWidth: "standard",
  alignment: "center",
  density: "normal",
  glow: "false",
  glowColor: "#a78bfa",
  blur: "8px",
  noise: "false",
} as const;

/**
 * Enum members declared in the schema comments (the documented contract).
 * Resolver must handle all of these OR fall back to a documented default.
 */
const DOCUMENTED_ENUMS = {
  backgroundType: [
    "solid", "gradient", "radial", "mesh", "image",
    "pattern", "aurora", "animatedGradient",
  ],
  linkStyle: ["rounded", "sharp", "glass", "pill", "outline", "neon"],
  animationType: ["lift", "scale", "none"],
  buttonSize: ["sm", "md", "lg"],
  shadowStrength: ["none", "subtle", "medium", "strong"],
  hoverEffect: ["lift", "scale", "glow", "none"],
  density: ["compact", "normal", "relaxed"],
  alignment: ["left", "center", "right"],
  mode: ["dark", "light"],
} as const;

/** Extract accepted values from a Zod optional enum field (via behavior, not internals). */
function zodEnumValues(field: string): string[] {
  // Probe the schema by parsing every documented value + a sentinel garbage
  // value. Accepted values pass safeParse; rejected ones fail. This avoids
  // reaching into Zod internals (_def.shape) which changed in zod v4.
  const candidateValues: Record<string, string[]> = {
    backgroundType: ["solid", "gradient", "radial", "mesh", "image", "pattern", "aurora", "animatedGradient", "__garbage__"],
    linkStyle: ["rounded", "sharp", "glass", "pill", "outline", "neon", "__garbage__"],
    animationType: ["lift", "scale", "none", "__garbage__"],
    buttonSize: ["sm", "md", "lg", "__garbage__"],
    shadowStrength: ["none", "subtle", "soft", "medium", "strong", "__garbage__"],
    hoverEffect: ["lift", "scale", "glow", "none", "__garbage__"],
    density: ["compact", "normal", "relaxed", "__garbage__"],
    alignment: ["left", "center", "right", "__garbage__"],
    mode: ["dark", "light", "__garbage__"],
  };
  const candidates = candidateValues[field];
  if (!candidates) throw new Error(`No candidate list for field ${field}`);
  return candidates.filter((v) => {
    const result = customSchema.safeParse({ [field]: v });
    return result.success;
  });
}

describe("Dimension 1 — schema defaults are valid Zod enum members", () => {
  for (const field of Object.keys(DOCUMENTED_ENUMS) as (keyof typeof DOCUMENTED_ENUMS)[]) {
    it(`schema default for ${field} passes Zod validation`, () => {
      const defaultValue = SCHEMA_DEFAULTS[field];
      const result = customSchema.safeParse({ [field]: defaultValue });
      expect(result.success, `${field}="${defaultValue}" should be accepted by Zod`).toBe(true);
    });
  }
});

describe("Dimension 1b — every documented enum value is accepted by Zod", () => {
  for (const [field, values] of Object.entries(DOCUMENTED_ENUMS)) {
    it(`Zod accepts all documented ${field} values`, () => {
      const accepted = zodEnumValues(field);
      for (const v of values) {
        expect(accepted, `Zod enum for ${field} is missing documented value "${v}"`).toContain(v);
      }
    });
  }
});

describe("Dimension 1c — documented enum values are a subset of the Zod enum (no silent rejects)", () => {
  // This is the v1.1.2 density bug pattern: a documented value that the
  // Zod enum silently rejects. We assert documented ⊆ accepted.
  for (const [field, values] of Object.entries(DOCUMENTED_ENUMS)) {
    it(`${field}: documented values ⊆ Zod-accepted values`, () => {
      const accepted = new Set(zodEnumValues(field));
      for (const v of values) {
        expect(accepted.has(v), `Zod rejects documented ${field}="${v}" — save would fail silently`).toBe(true);
      }
    });
  }
});

// ─── Dimension 2: Preset coverage ──────────────────────────────────────────
// Every preset must (a) pass Zod, (b) produce non-default CSS vars where it
// declares overrides, (c) resolve fontScale to the intended px.

describe("Dimension 2 — every preset passes Zod validation", () => {
  // The v1.1.2 density bug: a preset shipped with a value Zod rejects,
  // making every save silently fail. This loop catches that for all 9.
  for (const preset of PRESETS) {
    it(`preset "${preset.name}" is accepted by customSchema.safeParse`, () => {
      // Strip non-schema fields before parsing (Zod would reject unknown keys
      // if we passed the full preset object — it's strict by default in zod v4).
      const { isPreset: _isPreset, isActive: _isActive, name: _name, ...themeFields } = preset;
      void _isPreset; void _isActive; void _name;
      const result = customSchema.safeParse(themeFields);
      expect(result.success, `preset "${preset.name}" failed Zod: ${result.success ? "" : JSON.stringify(result.error.issues)}`).toBe(true);
    });
  }
});

describe("Dimension 2b — preset count and names are stable", () => {
  it("ships exactly 11 presets", () => {
    expect(PRESETS).toHaveLength(11);
  });

  it("includes the canonical preset names", () => {
    expect(PRESET_NAMES).toEqual([
      "Aurora",
      "Glassmorphism",
      "Neon Cyberpunk",
      "Editorial Paper",
      "Terminal Mono",
      "Pastel Soft",
      "Brutalist",
      "Retro Sunset",
      "Minimal Light",
      "8-Bit Retro",
      "Frutiger Aero",
    ]);
  });

  it("has exactly one active preset (Aurora, the flagship)", () => {
    const active = PRESETS.filter((p) => p.isActive);
    expect(active).toHaveLength(1);
    expect(active[0].name).toBe("Aurora");
  });

  it("has unique names (no silent duplicates)", () => {
    const names = PRESETS.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("Dimension 2c — preset fontScale resolves to intended px (not default fallthrough)", () => {
  // The v1.1.3 bug: presets stored "110"/"120" but resolver only knew sm/md/lg,
  // so numeric scales fell through to the 15px default. This locks each value.
  const FALLBACK_FONT_SIZE = "15px"; // from FALLBACKS.fontSize

  for (const preset of PRESETS) {
    const scale = preset.fontScale ?? base.fontScale ?? "100";
    it(`preset "${preset.name}" fontScale="${scale}" produces a non-default size`, () => {
      const { cssVars } = resolveThemeTokens(preset);
      const resolved = cssVars["--lb-font-size"];
      // Every preset should resolve to SOMETHING — never empty.
      expect(resolved).toBeTruthy();
      // If a preset declares a scale > 100, the result must be > 15px.
      const num = parseFloat(scale);
      if (!Number.isNaN(num) && num > 100) {
        const resolvedNum = parseFloat(resolved);
        expect(resolvedNum, `fontScale ${num} should produce > 15px, got ${resolved}`).toBeGreaterThan(15);
      }
      // A scale of exactly "100" must produce exactly 15px (base).
      if (scale === "100") {
        expect(resolved).toBe(FALLBACK_FONT_SIZE);
      }
    });
  }
});

describe("Dimension 2d — preset shadowStrength hits its resolver case (not default)", () => {
  // The v1.1.3 bug: Pastel Soft used "soft" but resolver had no case for it,
  // falling through to the medium default. This locks each non-default shadow.
  const DEFAULT_SHADOW = "0 8px 30px rgba(0,0,0,0.35)"; // FALLBACKS.shadow

  for (const preset of PRESETS) {
    const strength = preset.shadowStrength ?? base.shadowStrength;
    it(`preset "${preset.name}" shadowStrength="${strength}" resolves distinctly`, () => {
      const { cssVars } = resolveThemeTokens(preset);
      const resolved = cssVars["--lb-shadow"];
      expect(resolved).toBeTruthy();
      // If preset declares a non-default strength, the output must differ from default.
      if (strength !== "medium") {
        expect(resolved, `"${strength}" should not fall through to the medium default`).not.toBe(DEFAULT_SHADOW);
      }
      // "none" must be literally "none".
      if (strength === "none") {
        expect(resolved).toBe("none");
      }
    });
  }
});

// ─── Dimension 3: Resolver edge cases ──────────────────────────────────────

describe("Dimension 3 — resolveFontSize handles every input shape", () => {
  function fontSizeFor(scale: string | null | undefined): string {
    return resolveThemeTokens({ fontScale: scale }).cssVars["--lb-font-size"];
  }

  it("numeric percentages scale linearly from 15px base", () => {
    expect(fontSizeFor("100")).toBe("15px");
    expect(fontSizeFor("110")).toBe("16.5px");
    expect(fontSizeFor("120")).toBe("18px");
    expect(fontSizeFor("200")).toBe("30px");
  });

  it("keyword aliases resolve to documented px", () => {
    expect(fontSizeFor("sm")).toBe("14px");
    expect(fontSizeFor("md")).toBe("15px");
    expect(fontSizeFor("lg")).toBe("16px");
  });

  it("null/undefined/empty fall back to 15px", () => {
    expect(fontSizeFor(null)).toBe("15px");
    expect(fontSizeFor(undefined)).toBe("15px");
    expect(fontSizeFor("")).toBe("15px");
  });

  it("garbage input falls back safely (no NaN, no crash)", () => {
    const out = fontSizeFor("garbage");
    expect(out).toBe("15px");
    expect(out).not.toContain("NaN");
  });
});

describe("Dimension 3b — resolveSpacing density coverage (the v1.1.2 bug)", () => {
  function spacingFor(density: string | null | undefined): string {
    return resolveThemeTokens({ density }).cssVars["--lb-spacing"];
  }

  it("compact = 8px, normal = 12px, relaxed = 16px", () => {
    expect(spacingFor("compact")).toBe("8px");
    expect(spacingFor("normal")).toBe("12px");
    expect(spacingFor("relaxed")).toBe("16px");
  });

  it("legacy 'comfortable' and unknown values fall back to 12px (not crash)", () => {
    // The v1.1.2 bug shipped "comfortable" as the schema default, which the
    // resolver didn't know. After the fix it falls to default. Lock that.
    expect(spacingFor("comfortable")).toBe("12px");
    expect(spacingFor("unknown")).toBe("12px");
    expect(spacingFor(null)).toBe("12px");
  });
});

describe("Dimension 3c — shadowStrength covers every Zod-accepted value", () => {
  function shadowFor(strength: string | undefined): string {
    return resolveThemeTokens({ shadowStrength: strength }).cssVars["--lb-shadow"];
  }

  it("none/subtle/soft/medium/strong all resolve distinctly", () => {
    const none = shadowFor("none");
    const subtle = shadowFor("subtle");
    const soft = shadowFor("soft");
    const medium = shadowFor("medium");
    const strong = shadowFor("strong");
    // All five must be distinct (no two falling through to the same value).
    const values = [none, subtle, soft, medium, strong];
    expect(new Set(values).size).toBe(5);
  });

  it("'soft' does NOT fall through to the medium default (the v1.1.3 bug)", () => {
    expect(shadowFor("soft")).not.toBe("0 8px 30px rgba(0,0,0,0.35)");
  });
});

// ─── Dimension 4: Schema ↔ Zod ↔ Resolver drift guard ──────────────────────
// The catch-all. If anyone adds a schema default or enum value that the
// resolver doesn't handle, this test fires.

describe("Dimension 4 — resolver produces a value for every schema default", () => {
  // Run the FULL set of schema defaults through the resolver and assert no
  // CSS var comes back empty/undefined. If a new field is added to the schema
  // without a resolver path, this catches it.
  it("resolving the schema-default theme produces a complete token set", () => {
    const { cssVars } = resolveThemeTokens(SCHEMA_DEFAULTS);
    const requiredVars = [
      "--lb-accent", "--lb-secondary", "--lb-text", "--lb-text-muted",
      "--lb-card-bg", "--lb-card-border", "--lb-card-radius", "--lb-font",
      "--lb-font-size", "--lb-font-weight", "--lb-letter-spacing",
      "--lb-btn-padding-y", "--lb-btn-padding-x", "--lb-spacing",
      "--lb-shadow", "--lb-glow", "--lb-blur", "--lb-border-width",
      "--lb-container-width", "--lb-alignment", "--lb-noise",
    ];
    for (const v of requiredVars) {
      expect(cssVars[v], `missing CSS var ${v}`).toBeTruthy();
      expect(cssVars[v]).not.toContain("undefined");
      expect(cssVars[v]).not.toContain("NaN");
    }
  });

  it("schema-default theme passes Zod validation", () => {
    const result = customSchema.safeParse(SCHEMA_DEFAULTS);
    expect(result.success).toBe(true);
  });

  it("schema-default background resolves without crashing", () => {
    const bg = resolveBackground({
      backgroundType: SCHEMA_DEFAULTS.backgroundType,
      backgroundValue: SCHEMA_DEFAULTS.backgroundValue,
      backgroundAngle: SCHEMA_DEFAULTS.backgroundAngle,
    });
    expect(bg).toBeTruthy();
    expect(bg).not.toBe("");
  });
});
