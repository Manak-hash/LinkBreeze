import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { generateQrSvg, generateQrPng } from "@/lib/qr";
import {
  parseQrStyle,
  serializeQrStyle,
  defaultQrStyle,
  eccLevelFor,
} from "@/lib/qr-style";

describe("generateQrSvg", () => {
  it("returns valid SVG markup", async () => {
    const svg = await generateQrSvg("https://example.com");
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  it("includes the URL data as QR modules", async () => {
    const svg = await generateQrSvg("https://linkbreeze.dev");
    expect(svg.length).toBeGreaterThan(100);
  });

  it("applies custom colors", async () => {
    const svg = await generateQrSvg("https://example.com", {
      ...defaultQrStyle(),
      fg: "#123456",
      bg: "#fedcba",
    });
    // qrcode emits colors lowercase without alpha in SVG path fill
    expect(svg.toLowerCase()).toContain("#123456");
  });

  it("embeds a data-URI logo when style has one (SVG)", async () => {
    const tinyPng =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const svg = await generateQrSvg(
      "https://example.com",
      { ...defaultQrStyle(), logo: "avatar" },
      tinyPng,
    );
    expect(svg).toContain("data:image/png;base64,");
    expect(svg).toContain("clip-path");
  });
});

describe("generateQrPng", () => {
  it("returns a PNG buffer", async () => {
    const buf = await generateQrPng("https://example.com", {
      ...defaultQrStyle(),
      size: 128,
    });
    expect(buf).toBeInstanceOf(Buffer);
    // PNG magic bytes
    expect(buf[0]).toBe(0x89);
    expect(buf[1]).toBe(0x50);
    expect(buf[2]).toBe(0x4e);
    expect(buf[3]).toBe(0x47);
  });

  it("uses default size of 256 when not specified", async () => {
    const buf = await generateQrPng("https://example.com");
    expect(buf.length).toBeGreaterThan(500);
  });

  it("composites a circular logo when one is provided (sharp path)", async () => {
    const tinyPng =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const buf = await generateQrPng(
      "https://example.com",
      { ...defaultQrStyle(), logo: "favicon", size: 256 },
      tinyPng,
    );
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf[0]).toBe(0x89);
    // Composite output should differ from a plain QR render.
    const plain = await generateQrPng("https://example.com", {
      ...defaultQrStyle(),
      size: 256,
    });
    expect(buf.length).not.toBe(plain.length);
  });
});

describe("parseQrStyle", () => {
  it("returns defaults for null/undefined/garbage", () => {
    expect(parseQrStyle(null)).toEqual(defaultQrStyle());
    expect(parseQrStyle(undefined)).toEqual(defaultQrStyle());
    expect(parseQrStyle("not json")).toEqual(defaultQrStyle());
    expect(parseQrStyle('{"fg":"red!!!"}')).toEqual(defaultQrStyle());
  });

  it("keeps valid explicit values and repairs bad fields", () => {
    const s = parseQrStyle('{"fg":"#aabbcc","bg":"#112233","logo":"avatar","size":512}');
    expect(s).toEqual({ fg: "#aabbcc", bg: "#112233", logo: "avatar", size: 512 });
    // size out of range → default
    expect(parseQrStyle('{"fg":"#aabbcc","bg":"#112233","logo":"none","size":5000}').size).toBe(256);
    // unknown logo value → none
    expect(parseQrStyle('{"fg":"#aabbcc","bg":"#112233","logo":"remote","size":256}').logo).toBe("none");
  });

  it("roundtrips through serialize", () => {
    const s = { fg: "#AABBCC", bg: "#001122", logo: "avatar" as const, size: 512 };
    const parsed = parseQrStyle(serializeQrStyle(s));
    expect(parsed).toEqual({ fg: "#aabbcc", bg: "#001122", logo: "avatar", size: 512 });
  });
});

describe("eccLevelFor", () => {
  it("is M without a logo and H with one", () => {
    expect(eccLevelFor(defaultQrStyle())).toBe("M");
    expect(eccLevelFor({ ...defaultQrStyle(), logo: "avatar" })).toBe("H");
    expect(eccLevelFor({ ...defaultQrStyle(), logo: "favicon" })).toBe("H");
  });
});
