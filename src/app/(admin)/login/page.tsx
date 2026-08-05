import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // If already logged in, skip the login screen entirely. Without this,
  // the admin layout wraps /login in the full sidebar chrome.
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
