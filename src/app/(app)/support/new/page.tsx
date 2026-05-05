import { FeedbackState } from "@/src/components/ui/feedback-state";
import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import { getSupportTicketCategories } from "@/src/server/support/api";

import { NewTicketForm } from "../new-ticket-form";

export default async function SupportNewTicketPage() {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    return null;
  }

  let categories = null;
  let loadError: string | null = null;

  try {
    categories = await getSupportTicketCategories(context.accessToken);
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "We couldn't load the ticket categories right now.";
  }

  if (!categories) {
    return (
      <FeedbackState
        title="Support categories are unavailable"
        description={loadError ?? "We couldn't load the ticket categories right now."}
      />
    );
  }

  return <NewTicketForm categories={categories} />;
}
