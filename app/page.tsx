import { redirect } from "next/navigation";

import { getAuthenticatedPortalUser } from "@/src/server/auth/session";

export default async function Home() {
  const user = await getAuthenticatedPortalUser();

  redirect(user ? "/overview" : "/login");
}
