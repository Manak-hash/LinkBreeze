import { describe, it, expect } from "vitest";
import { PRESETS, PRESET_NAMES, presetAsThemeInput, base } from "@/lib/theme-presets";

describe("PRESETS", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(PRESETS)).toBe(true);
    expect(PRESETS.length).toBeGreaterThan(0);
  });

  it("each preset has required meta fields", () => {
    for (const p of PRESETS) {
      expect(p.name).toBeTruthy();
      expect(p.isPreset).toBe(true);
      expect(["light", "dark"]).toContain(p.mode);
    }
  });

  it("each preset has theme token fields (via base spread)", () => {
    for (const p of PRESETS) {
      expect(p.primaryColor).toBeDefined();
      expect(p.backgroundType).toBeDefined();
      expect(p.textColor).toBeDefined();
    }
  });

  it("exactly one preset is active by default", () => {
    const active = PRESETS.filter((p) => p.isActive);
    expect(active.length).toBe(1);
  });
});

describe("PRESET_NAMES", () => {
  it("contains the name of every preset", () => {
    expect(PRESET_NAMES.length).toBe(PRESETS.length);
    for (const p of PRESETS) {
      expect(PRESET_NAMES).toContain(p.name);
    }
  });
});

describe("base", () => {
  it("has shared default fields as strings", () => {
    expect(typeof base.backgroundAngle).toBe("string");
    expect(typeof base.overlayColor).toBe("string");
    expect(typeof base.fontScale).toBe("string");
    expect(typeof base.fontWeight).toBe("string");
  });

  it("has isPreset=true and isActive=false", () => {
    expect(base.isPreset).toBe(true);
    expect(base.isActive).toBe(false);
  });
});

describe("presetAsThemeInput", () => {
  it("converts a preset to a ThemeInput (preserves theme fields)", () => {
    const preset = PRESETS[0];
    const input = presetAsThemeInput(preset);
    expect(input.primaryColor).toBe(preset.primaryColor);
    expect(input.backgroundType).toBe(preset.backgroundType);
    expect(input.textColor).toBe(preset.textColor);
  });
});
