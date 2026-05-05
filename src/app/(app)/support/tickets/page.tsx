import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import { getCustomerSupportTickets } from "@/src/server/support/api";

import { TicketsShell } from "./tickets-shell";
import { getSupportFlashMessage } from "../support-ui";

export default async function SupportTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    return null;
  }

  const [query, tickets] = await Promise.all([
    searchParams,
    getCustomerSupportTickets(context.user.customerId, context.accessToken),
  ]);

  return <TicketsShell tickets={tickets} flash={getSupportFlashMessage(query)} />;
}
