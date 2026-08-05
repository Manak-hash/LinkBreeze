import { getAllLinks, getAllPages, getDefaultPage } from "@/server/queries";
import { LinksManager } from "./links-manager";

export const dynamic = "force-dynamic";

export default async function LinksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;

  // Resolve active page from ?page= query param, default page, or first page.
  const [allPages, defaultPage] = await Promise.all([
    getAllPages(),
    getDefaultPage(),
  ]);
  let activePageId: number;
  if (pageParam) {
    const found = allPages.find((p) => p.id === Number(pageParam));
    activePageId = found ? found.id : defaultPage.id;
  } else {
    activePageId = defaultPage.id;
  }

  const links = await getAllLinks(activePageId);
  return <LinksManager initialLinks={links} pageId={activePageId} />;
}
