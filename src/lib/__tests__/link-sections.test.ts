import { describe, expect, it } from "vitest";
import { groupLinksBySection, sectionStaggerDelays } from "../link-sections";

const sec = (id: number, orderIndex: number, title = `S${id}`) => ({
  id,
  title,
  icon: null,
  orderIndex,
});

const lnk = (id: number, sectionId: number | null, orderIndex = 0) => ({
  id,
  sectionId,
  orderIndex,
});

describe("groupLinksBySection", () => {
  it("returns no groups when there are no links or sections", () => {
    const groups = groupLinksBySection([], []);
    expect(groups).toEqual([]);
  });

  it("keeps an uncategorized-only page flat (pre-1.3 layout)", () => {
    const groups = groupLinksBySection(
      [lnk(1, null), lnk(2, null)],
      [],
    );
    expect(groups).toHaveLength(1);
    expect(groups[0].section).toBeNull();
    expect(groups[0].links.map((l) => l.id)).toEqual([1, 2]);
  });

  it("groups links under their sections in orderIndex order", () => {
    const groups = groupLinksBySection(
      [lnk(1, 10), lnk(2, 20), lnk(3, null), lnk(4, 10)],
      [sec(20, 1), sec(10, 0)], // intentionally unordered input
    );
    // uncategorized first, then section 10, then section 20
    expect(groups.map((g) => g.section?.id ?? null)).toEqual([null, 10, 20]);
    expect(groups[0].links.map((l) => l.id)).toEqual([3]);
    expect(groups[1].links.map((l) => l.id)).toEqual([1, 4]);
    expect(groups[2].links.map((l) => l.id)).toEqual([2]);
  });

  it("drops empty sections", () => {
    const groups = groupLinksBySection(
      [lnk(1, null)],
      [sec(10, 0), sec(20, 1)],
    );
    expect(groups).toHaveLength(1);
    expect(groups[0].section).toBeNull();
  });

  it("drops links pointing at an unknown section into uncategorized", () => {
    const groups = groupLinksBySection(
      [lnk(1, 999), lnk(2, null)],
      [],
    );
    expect(groups[0].links.map((l) => l.id)).toEqual([1, 2]);
  });

  it("keeps the uncategorized group (empty) only when dropEmpty=false", () => {
    const dropped = groupLinksBySection(
      [lnk(1, 10)],
      [sec(10, 0)],
    );
    expect(dropped.map((g) => g.section?.id ?? null)).toEqual([10]);

    const kept = groupLinksBySection(
      [lnk(1, 10)],
      [sec(10, 0)],
      false,
    );
    expect(kept.map((g) => g.section?.id ?? null)).toEqual([null, 10]);
  });
});

describe("sectionStaggerDelays", () => {
  it("produces one 60ms step per rendered element", () => {
    const groups = groupLinksBySection(
      [lnk(1, null), lnk(2, 10), lnk(3, 10)],
      [sec(10, 0)],
    );
    const delays = sectionStaggerDelays(groups);
    // uncategorized: no header, links [0ms, ?] — link2 & link3 belong to section
    expect(delays[0]).toEqual({ header: null, links: [0] });
    // section header at 60ms, its links at 120ms, 180ms
    expect(delays[1]).toEqual({ header: 60, links: [120, 180] });
  });

  it("returns no delays for empty input", () => {
    expect(sectionStaggerDelays([])).toEqual([]);
  });
});
