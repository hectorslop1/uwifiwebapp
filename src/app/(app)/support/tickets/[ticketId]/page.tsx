import Link from "next/link";
import { notFound } from "next/navigation";
import { Bell, Paperclip, UserRound } from "lucide-react";

import { PageIntro } from "@/src/components/ui/page-intro";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import { getCustomerSupportTickets } from "@/src/server/support/api";

import {
  formatSupportDate,
  getSupportStatusMeta,
} from "../../support-ui";

export default async function SupportTicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    return null;
  }

  const { ticketId } = await params;
  const tickets = await getCustomerSupportTickets(
    context.user.customerId,
    context.accessToken,
  );
  const ticket = tickets.find((entry) => String(entry.id) === ticketId);

  if (!ticket) {
    notFound();
  }

  const status = getSupportStatusMeta(ticket.status);

  return (
    <div className="space-y-4 lg:flex lg:min-h-0 lg:flex-col">
      <PageIntro
        eyebrow="Support"
        title={ticket.title?.trim() || "Ticket details"}
        description="Follow the current status, review the description, and open any attachments shared with the ticket."
        actions={<StatusPill label={status.label} tone={status.tone} />}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <SurfacePanel className="p-4 sm:p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="theme-inline-surface rounded-[1.2rem] border border-white/80 bg-white/55 px-4 py-4">
              <div className="text-body-sm text-ink-muted">Ticket ID</div>
              <div className="mt-2 text-title-md text-ink">#{ticket.id}</div>
            </div>
            <div className="theme-inline-surface rounded-[1.2rem] border border-white/80 bg-white/55 px-4 py-4">
              <div className="text-body-sm text-ink-muted">Created</div>
              <div className="mt-2 text-title-md text-ink">
                {formatSupportDate(ticket.createdAt)}
              </div>
            </div>
            <div className="theme-inline-surface rounded-[1.2rem] border border-white/80 bg-white/55 px-4 py-4">
              <div className="text-body-sm text-ink-muted">Category</div>
              <div className="mt-2 text-title-md text-ink">{ticket.category}</div>
            </div>
            <div className="theme-inline-surface rounded-[1.2rem] border border-white/80 bg-white/55 px-4 py-4">
              <div className="text-body-sm text-ink-muted">Assigned to</div>
              <div className="mt-2 text-title-md text-ink">
                {ticket.assignedTo?.trim() || "Pending assignment"}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-[1.35rem] border border-[#edf0ef] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,249,0.9))] px-4 py-4">
            <div className="text-title-md text-ink">Description</div>
            <div className="mt-3 whitespace-pre-wrap text-body-sm text-ink-muted">
              {ticket.description}
            </div>
          </div>

          {ticket.files.length ? (
            <div className="mt-4 rounded-[1.35rem] border border-[#edf0ef] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,249,0.9))] px-4 py-4">
              <div className="text-title-md text-ink">Attachments</div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {ticket.files.map((fileUrl, index) => (
                  <a
                    key={fileUrl}
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="theme-inline-surface flex items-center gap-3 rounded-[1.15rem] border border-white/80 bg-white/60 px-4 py-4 text-body-sm text-ink-soft transition-colors duration-200 hover:text-ink"
                  >
                    <Paperclip size={16} strokeWidth={1.8} />
                    Attachment {index + 1}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </SurfacePanel>

        <div className="space-y-4">
          <SurfacePanel subtle className="p-4">
            <div className="flex items-center gap-2 text-title-md text-ink">
              <Bell size={16} strokeWidth={1.8} />
              What happens next
            </div>
            <div className="mt-3 space-y-2 text-body-sm text-ink-muted">
              <div>You will see status changes here as the ticket moves forward.</div>
              <div>Support can review your description and any attachments you included.</div>
              <div>Your account email remains tied to this request for follow-up.</div>
            </div>
          </SurfacePanel>

          <SurfacePanel subtle className="p-4">
            <div className="flex items-center gap-2 text-title-md text-ink">
              <UserRound size={16} strokeWidth={1.8} />
              Quick actions
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <Link
                href="/support/tickets"
                className="theme-control rounded-pill border border-white/80 bg-white/65 px-4 py-2.5 text-body-sm text-ink-soft transition-colors duration-200 hover:text-ink"
              >
                Back to tickets
              </Link>
              <Link
                href="/support/new"
                className="theme-control rounded-pill border border-[#d9eddc] bg-[#f6fff5] px-4 py-2.5 text-body-sm font-medium text-[#3ba745] transition-colors duration-200 hover:bg-[#effceb]"
              >
                Create another ticket
              </Link>
            </div>
          </SurfacePanel>
        </div>
      </div>
    </div>
  );
}
