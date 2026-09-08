import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { TotpForm } from "./totp-form";

export const dynamic = "force-dynamic";

/** #5: step 2 of the login — TOTP code entry. */
export default async function TotpPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={null}>
      <TotpForm />
    </Suspense>
  );
}
