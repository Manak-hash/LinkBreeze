import { getAllLinks, getAllLinkGroups, getAllPages, getDefaultPage } from "@/server/queries";
import { LinksManager } from "./links-manager";

export const dynamic = "force-dynamic";

export default async function LinksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;

  // Resolve active page from ?page= query param, default page, or first page.
  const allPages = await getAllPages();
  let activePageId: number;
  if (pageParam) {
    const found = allPages.find((p) => p.id === Number(pageParam));
    activePageId = found ? found.id : (await getDefaultPage()).id;
  } else {
    activePageId = (await getDefaultPage()).id;
  }

  const [links, groups] = await Promise.all([
    getAllLinks(activePageId),
    getAllLinkGroups(activePageId),
  ]);
  return <LinksManager initialLinks={links} initialGroups={groups} pageId={activePageId} />;
}
