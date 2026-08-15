/**
 * Link section grouping — pure helper shared by the public page renderer
 * and the admin links manager.
 *
 * A page's links are split into ordered groups: uncategorized links first
 * (preserving the pre-1.3 flat stack), then one group per section in
 * orderIndex order. Sections with no visible links are dropped so the
 * public page never renders an empty header.
 */

export interface SectionLike {
  id: number;
  title: string;
  icon: string | null;
  orderIndex: number;
}

export interface LinkLike {
  id: number;
  sectionId: number | null;
  orderIndex: number;
}

export interface LinkGroup<L, S extends SectionLike> {
  /** null = uncategorized group rendered above all sections. */
  section: S | null;
  links: L[];
}

/**
 * Group links by their section, returning ordered groups.
 *
 * @param links   Links already filtered for display (active + scheduled).
 * @param sections All sections of the page (any order — sorted here).
 * @param dropEmpty When true (default, public page), groups with no links are
 *                  omitted so no orphan headers render. The admin manager
 *                  passes false to keep empty sections as drop targets.
 */
export function groupLinksBySection<L extends LinkLike, S extends SectionLike>(
  links: L[],
  sections: S[],
  dropEmpty = true,
): Array<LinkGroup<L, S>> {
  const sortedSections = [...sections].sort((a, b) => a.orderIndex - b.orderIndex);

  const groups: Array<LinkGroup<L, S>> = [{ section: null, links: [] }];
  const bySection = new Map<number, LinkGroup<L, S>>();
  for (const s of sortedSections) {
    const g: LinkGroup<L, S> = { section: s, links: [] };
    bySection.set(s.id, g);
    groups.push(g);
  }

  for (const link of links) {
    const g = link.sectionId != null ? bySection.get(link.sectionId) : undefined;
    (g ?? groups[0]).links.push(link);
  }

  if (!dropEmpty) return groups;
  return groups.filter((g) => g.links.length > 0);
}

/**
 * Compute the entrance-animation delay for each element, continuing one
 * page-wide stagger sequence across section boundaries.
 *
 * Delay model: every rendered element (section header, link) takes the next
 * 60ms step in order. The uncategorized group has no header.
 */
export function sectionStaggerDelays(
  groups: Array<LinkGroup<unknown, SectionLike>>,
  staggerMs = 60,
): Array<{ header: number | null; links: number[] }> {
  let step = 0;
  return groups.map((g) => {
    const header = g.section ? step++ * staggerMs : null;
    const links = g.links.map(() => step++ * staggerMs);
    return { header, links };
  });
}
