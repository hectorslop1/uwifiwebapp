import { getAuthenticatedPortalUser } from "@/src/server/auth/session";

import { AppShell } from "../../components/layout/app-shell";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthenticatedPortalUser();

  // Temporarily bypass auth for store testing
  if (!user) {
    return <AppShell user={{ 
      customerId: 1, 
      authId: "test", 
      firstName: "Test", 
      lastName: "User", 
      email: "test@example.com",
      fullName: "Test User",
      customerAffiliateId: null,
      sharedLinkId: null,
      customerCategoryId: null
    }}>{children}</AppShell>;
  }

  return <AppShell user={user}>{children}</AppShell>;
}
