/* QR output pixel verification (run with vitest to get @/ aliases + mocks) */
import { describe, it, expect, vi } from "vitest";
vi.mock("server-only", () => ({}));

import { generateQrPng } from "@/lib/qr";
import { defaultQrStyle } from "@/lib/qr-style";

async function solidRedPngDataUri(): Promise<string> {
  const { default: sharp } = await import("sharp");
  const buf = await sharp({
    create: { width: 64, height: 64, channels: 3, background: { r: 255, g: 0, b: 0 } },
  })
    .png()
    .toBuffer();
  return `data:image/png;base64,${buf.toString("base64")}`;
}

async function pixels(buf: Buffer) {
  const { default: sharp } = await import("sharp");
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  return { data, info };
}

function px(
  data: Buffer,
  info: { width: number; height: number; channels: number },
  x: number,
  y: number,
) {
  const i = (y * info.width + x) * info.channels;
  return [data[i], data[i + 1], data[i + 2]];
}

describe("QR pixel verification", () => {
  it("logo QR: center disc is the red logo, ring is bg, finder corner is dark", async () => {
    const logo = await solidRedPngDataUri();
    const buf = await generateQrPng(
      "https://linkbreeze.dev/u",
      { ...defaultQrStyle(), logo: "avatar", size: 512 },
      logo,
    );
    const { data, info } = await pixels(buf);
    expect(info.width).toBe(512);

    // Center: solid red logo disc (255, 0, 0)
    const center = px(data, info, 256, 256);
    expect(center[0]).toBeGreaterThan(220);
    expect(center[1]).toBeLessThan(60);
    expect(center[2]).toBeLessThan(60);

    // Ring just outside the disc: walk right from center while still red,
    // then expect the white ring annulus before any dark module.
    let x = 256;
    while (x < 512) {
      const p = px(data, info, x, 256);
      if (!(p[0] > 200 && p[1] < 60 && p[2] < 60)) break;
      x++;
    }
    const ring = px(data, info, x + 2, 256);
    expect(ring[0]).toBeGreaterThan(200);
    expect(ring[1]).toBeGreaterThan(200);
    expect(ring[2]).toBeGreaterThan(200);

    // Top-left finder pattern — outer border (module 0) is dark
    const corner = px(data, info, 40, 40);
    expect(corner[0]).toBeLessThan(80);
  });

  it("plain QR: dark finder + white quiet zone at the top edge", async () => {
    const buf = await generateQrPng("https://linkbreeze.dev/u", { ...defaultQrStyle(), size: 512 });
    const { data, info } = await pixels(buf);
    expect(px(data, info, 60, 60)[0]).toBeLessThan(80);
    // Quiet zone (margin) at the very top is always light
    expect(px(data, info, 256, 5)[0]).toBeGreaterThan(240);
  });

  it("custom colors reach the pixels", async () => {
    const buf = await generateQrPng("https://linkbreeze.dev/u", {
      ...defaultQrStyle(),
      fg: "#3366cc",
      bg: "#fffbe8",
      size: 512,
    });
    const { data, info } = await pixels(buf);
    const dark = px(data, info, 60, 60);
    expect(dark[0]).toBeLessThan(120);
    expect(dark[2]).toBeGreaterThan(140); // blue-ish
    const quiet = px(data, info, 256, 5);
    expect(quiet[0]).toBeGreaterThan(240);
    expect(quiet[2]).toBeLessThan(240); // warm bg, not pure white
  });
});
