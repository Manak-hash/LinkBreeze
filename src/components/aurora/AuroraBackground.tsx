
/**
 * CSS-only animated aurora background. Server component — zero client JS.
 * Shared by the admin shell and the public "aurora" theme preset.
 */
export function AuroraBackground() {
  return (
    <div aria-hidden className="aurora-root">
      <div className="aurora-base" />
      <div className="aurora-blob aurora-blob--1" />
      <div className="aurora-blob aurora-blob--2" />
      <div className="aurora-grain" />
      <div className="aurora-vignette" />
    </div>
  );
}
