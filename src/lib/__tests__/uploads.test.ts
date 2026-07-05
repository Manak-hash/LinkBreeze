import { describe, it, expect } from "vitest";
import { contentTypeFor, safeUploadPath } from "@/lib/uploads";

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
