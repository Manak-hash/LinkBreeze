import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { generateQrSvg, generateQrPng } from "@/lib/qr";

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
});

describe("generateQrPng", () => {
  it("returns a PNG buffer", async () => {
    const buf = await generateQrPng("https://example.com", 128);
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
});
