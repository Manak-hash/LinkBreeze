import { redirect } from "next/navigation";
import { getUserCount } from "@/server/queries";
import { SetupForm } from "./setup-form";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const count = await getUserCount();

  // If an admin already exists, setup is no longer available.
  if (count > 0) {
    redirect("/login");
  }

  return (
    <SetupForm defaultUsername={process.env.ADMIN_USERNAME || ""} />
  );
}
