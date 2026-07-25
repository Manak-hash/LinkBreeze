import { getAllLinks } from "@/server/queries";
import { LinksManager } from "./links-manager";

export const dynamic = "force-dynamic";

export default async function LinksPage() {
  const links = await getAllLinks();
  return <LinksManager initialLinks={links} />;
}
