import type { LinkRow } from "@/server/queries";
import { buildDividerHtml } from "@/components/public/build-divider";
import type { ThemeInput } from "@/lib/theme-tokens";

interface DividerElementProps {
  link: LinkRow;
  index: number;
  theme: ThemeInput;
  /** Extra entrance delay (ms) — used to continue the stagger across sections. */
  baseDelayMs?: number;
}

/**
 * Pure Server Component — zero client JavaScript. Same raw-HTML pattern as
 * LinkCard so the reveal animation's inline style survives SSR untouched.
 */
export function DividerElement({ link, index, theme, baseDelayMs = 0 }: DividerElementProps) {
  const html = buildDividerHtml({ link, theme, index, baseDelayMs });

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
