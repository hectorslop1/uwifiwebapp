import { redirect } from "next/navigation";

import { getAuthenticatedPortalUser } from "@/src/server/auth/session";

import { LoginShell } from "./login-shell";

export default async function LoginPage() {
  const user = await getAuthenticatedPortalUser();

  if (user) {
    redirect("/overview");
  }

  return <LoginShell />;
}
