"use client";

import * as React from "react";

/**
 * FocalPointPicker — Squarespace-style draggable dot on a thumbnail of the
 * actual background media. Stores "x% y%" (CSS background-position /
 * object-position). The thumbnail renders with the chosen fit so the drag
 * surface matches what the public page shows.
 *
 * Pointer Events only (works for mouse + touch), clamped 0–100%, and
 * keyboard-accessible via arrow keys on the handle (1% steps, 10% with Shift).
 */
export function FocalPointPicker({
  imageUrl,
  isVideo = false,
  fit,
  value,
  onChange,
}: {
  imageUrl: string;
  isVideo?: boolean;
  fit: "cover" | "contain" | "tile";
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = React.useState(false);

  const { x, y } = parsePosition(value);

  const applyFromEvent = React.useCallback(
    (clientX: number, clientY: number) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const nx = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
      const ny = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);
      onChange(`${Math.round(nx)}% ${Math.round(ny)}%`);
    },
    [onChange],
  );

  // Global listeners while dragging so the dot keeps following outside bounds.
  React.useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => applyFromEvent(e.clientX, e.clientY);
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging, applyFromEvent]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 1;
    let nx = x;
    let ny = y;
    switch (e.key) {
      case "ArrowLeft": nx = clamp(x - step, 0, 100); break;
      case "ArrowRight": nx = clamp(x + step, 0, 100); break;
      case "ArrowUp": ny = clamp(y - step, 0, 100); break;
      case "ArrowDown": ny = clamp(y + step, 0, 100); break;
      default: return;
    }
    e.preventDefault();
    onChange(`${Math.round(nx)}% ${Math.round(ny)}%`);
  };

  // Thumbnail renders EXACTLY like the page will: same fit + position.
  const mediaStyle = React.useMemo(() => {
    if (fit === "tile") {
      return {
        backgroundImage: `url('${imageUrl}')`,
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
        backgroundPosition: value,
      } as React.CSSProperties;
    }
    if (isVideo) {
      return {
        objectFit: fit,
        objectPosition: value,
      } as React.CSSProperties;
    }
    return {
      backgroundImage: `url('${imageUrl}')`,
      backgroundRepeat: "no-repeat",
      backgroundSize: fit,
      backgroundPosition: value,
    } as React.CSSProperties;
  }, [imageUrl, isVideo, fit, value]);

  return (
    <div
      ref={ref}
      role="application"
      aria-label="Focal point — drag or use arrow keys"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => {
        e.preventDefault();
        setDragging(true);
        applyFromEvent(e.clientX, e.clientY);
      }}
      className={`relative h-36 w-full cursor-crosshair overflow-hidden rounded-xl border border-border bg-background select-none ${
        dragging ? "ring-2 ring-primary" : ""
      }`}
    >
      {isVideo ? (
        <video
          aria-hidden
          src={imageUrl}
          autoPlay
          muted
          loop
          playsInline
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={mediaStyle}
        />
      ) : (
        <div aria-hidden className="pointer-events-none absolute inset-0" style={mediaStyle} />
      )}

      {/* Draggable focal dot */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-10"
        style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
      >
        <span
          className={`block size-5 rounded-full border-[2.5px] border-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.55),0_2px_8px_rgba(0,0,0,0.45)] transition-transform ${
            dragging ? "scale-110 bg-white/40" : "bg-white/15"
          }`}
        />
      </div>

      {/* Center-cross reset affordance */}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onChange("50% 50%")}
        title="Recenter"
        aria-label="Recenter focal point"
        className="absolute bottom-2 right-2 z-10 inline-flex items-center gap-1 rounded-lg bg-background/80 px-2 py-1 text-[11px] font-medium text-foreground backdrop-blur transition-colors hover:bg-background"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v8M8 12h8" />
        </svg>
        Center
      </button>
    </div>
  );
}

/** "x% y%" → {x, y} numbers (defaults 50/50). */
export function parsePosition(v: string | null | undefined): { x: number; y: number } {
  const m = v?.match(/(-?\d+(?:\.\d+)?)%\s*(-?\d+(?:\.\d+)?)%/);
  if (!m) return { x: 50, y: 50 };
  return { x: clamp(parseFloat(m[1]), 0, 100), y: clamp(parseFloat(m[2]), 0, 100) };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * FitPicker — segmented Cover / Contain / Tile control with mini glyphs.
 */
export function FitPicker({
  value,
  onChange,
  allowTile = true,
}: {
  value: "cover" | "contain" | "tile";
  onChange: (v: "cover" | "contain" | "tile") => void;
  allowTile?: boolean;
}) {
  const opts: { value: "cover" | "contain" | "tile"; label: string; title: string; glyph: React.ReactNode }[] = [
    {
      value: "cover",
      label: "Cover",
      title: "Fill the page, cropping edges if needed",
      glyph: (
        <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden>
          <rect x="0.5" y="0.5" width="15" height="11" rx="2" className="fill-none stroke-current" strokeWidth="1" />
          <rect x="3.5" y="-1" width="9" height="14" className="fill-current opacity-40" rx="1" />
        </svg>
      ),
    },
    {
      value: "contain",
      label: "Contain",
      title: "Show the whole image, letterboxed if needed",
      glyph: (
        <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden>
          <rect x="0.5" y="0.5" width="15" height="11" rx="2" className="fill-none stroke-current" strokeWidth="1" />
          <rect x="3.5" y="2.5" width="9" height="7" className="fill-current opacity-40" rx="1" />
        </svg>
      ),
    },
  ];
  if (allowTile) {
    opts.push({
      value: "tile",
      label: "Tile",
      title: "Repeat at natural size — for patterns and textures",
      glyph: (
        <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden>
          <rect x="0.5" y="0.5" width="15" height="11" rx="2" className="fill-none stroke-current" strokeWidth="1" />
          {[3, 7, 11].map((cx) =>
            [3, 7].map((cy) => <rect key={`${cx}-${cy}`} x={cx} y={cy} width="2.5" height="2" className="fill-current opacity-40" rx="0.5" />),
          )}
        </svg>
      ),
    });
  }

  return (
    <div role="radiogroup" aria-label="Image fit" className="grid grid-cols-3 gap-1.5">
      {opts.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          title={o.title}
          onClick={() => onChange(o.value)}
          className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-[11px] font-medium transition-all ${
            value === o.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
          }`}
        >
          {o.glyph}
          {o.label}
        </button>
      ))}
    </div>
  );
}
