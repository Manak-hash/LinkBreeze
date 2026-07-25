import { redirect } from "next/navigation";
import Image from "next/image";
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/logo-mark.svg" alt="LinkBreeze" width={48} height={48} className="mb-3" />
          <h1 className="font-heading text-xl font-semibold">Create your admin account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set up LinkBreeze in seconds. You only need to do this once.
          </p>
        </div>
        <SetupForm defaultUsername={process.env.ADMIN_USERNAME || ""} />
      </div>
    </div>
  );
}
