import { redirect } from "next/navigation";

import { getAuthenticatedPortalUser } from "@/src/server/auth/session";

import { AppShell } from "../../components/layout/app-shell";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthenticatedPortalUser();

  if (!user) {
    redirect("/login");
  }

  return <AppShell user={user}>{children}</AppShell>;
}
