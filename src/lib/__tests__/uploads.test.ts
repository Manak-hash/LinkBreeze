import { describe, it, expect } from "vitest";
import { contentTypeFor, safeUploadPath, sniffFontFormat } from "@/lib/uploads";

describe("contentTypeFor", () => {
  it("returns image/png for .png", () => {
    expect(contentTypeFor("avatar.png")).toBe("image/png");
  });

  it("returns image/jpeg for .jpg and .jpeg", () => {
    expect(contentTypeFor("photo.jpg")).toBe("image/jpeg");
    expect(contentTypeFor("photo.jpeg")).toBe("image/jpeg");
  });

  it("returns image/gif for .gif", () => {
    expect(contentTypeFor("anim.gif")).toBe("image/gif");
  });

  it("returns image/webp for .webp", () => {
    expect(contentTypeFor("pic.webp")).toBe("image/webp");
  });

  it("returns image/avif for .avif", () => {
    expect(contentTypeFor("next-gen.avif")).toBe("image/avif");
  });

  it("returns octet-stream for unknown extensions", () => {
    expect(contentTypeFor("file.exe")).toBe("application/octet-stream");
  });

  it("returns octet-stream for files with no extension", () => {
    expect(contentTypeFor("README")).toBe("application/octet-stream");
  });

  it("handles uppercase extensions", () => {
    expect(contentTypeFor("PHOTO.PNG")).toBe("image/png");
    expect(contentTypeFor("Image.JPEG")).toBe("image/jpeg");
  });

  it("returns font/woff2 for .woff2 and font/woff for .woff", () => {
    expect(contentTypeFor("brand.woff2")).toBe("font/woff2");
    expect(contentTypeFor("brand.woff")).toBe("font/woff");
    expect(contentTypeFor("BRAND.WOFF2")).toBe("font/woff2");
  });
});

describe("sniffFontFormat (#82)", () => {
  it("detects woff2 by its wOF2 magic bytes", () => {
    const buf = Buffer.from([0x77, 0x4f, 0x46, 0x32, 0x00, 0x00]);
    expect(sniffFontFormat(buf)).toBe("woff2");
  });

  it("detects woff1 by its wOFF magic bytes", () => {
    const buf = Buffer.from([0x77, 0x4f, 0x46, 0x46, 0x00, 0x00]);
    expect(sniffFontFormat(buf)).toBe("woff");
  });

  it("rejects non-font bytes (PNG renamed to .woff2)", () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
    expect(sniffFontFormat(png)).toBeNull();
  });

  it("rejects empty and truncated buffers", () => {
    expect(sniffFontFormat(Buffer.alloc(0))).toBeNull();
    expect(sniffFontFormat(Buffer.from([0x77, 0x4f]))).toBeNull();
  });
});

describe("safeUploadPath", () => {
  it("returns a resolved path for a simple filename", () => {
    const p = safeUploadPath("avatar.png");
    expect(p).not.toBeNull();
    expect(p).toContain("avatar.png");
  });

  it("returns null for empty string", () => {
    expect(safeUploadPath("")).toBeNull();
  });

  it("returns null for '.'", () => {
    expect(safeUploadPath(".")).toBeNull();
  });

  it("returns null for '..'", () => {
    expect(safeUploadPath("..")).toBeNull();
  });

  it("strips directory traversal with basename", () => {
    const p = safeUploadPath("../../etc/passwd");
    // path.basename strips the traversal, so it should resolve to just passwd
    expect(p).not.toBeNull();
    expect(p).toContain("passwd");
    expect(p).not.toContain("..");
  });

  it("handles filenames with spaces", () => {
    const p = safeUploadPath("my avatar.png");
    expect(p).not.toBeNull();
    expect(p).toContain("my avatar.png");
  });
});
