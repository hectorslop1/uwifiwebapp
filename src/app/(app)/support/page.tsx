import Link from "next/link";
import {
  CreditCard,
  LifeBuoy,
  Mail,
  Phone,
  Router,
  Shield,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";

import { PageIntro } from "@/src/components/ui/page-intro";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import { getAuthenticatedPortalContext } from "@/src/server/auth/session";
import { getCustomerSupportTickets } from "@/src/server/support/api";

import { getSupportStatusMeta } from "./support-ui";

const faqCards = [
  {
    title: "Account & Security",
    description: "Sign-in help, password recovery, and account access questions.",
    icon: Shield,
  },
  {
    title: "Connection & Devices",
    description: "Gateway behavior, coverage issues, and device connectivity.",
    icon: Router,
  },
  {
    title: "Payments & Plans",
    description: "Billing updates, saved cards, invoices, and plan questions.",
    icon: CreditCard,
  },
  {
    title: "Points & Affiliates",
    description: "U-Wallet balance, points usage, and household affiliate help.",
    icon: Users,
  },
] as const;

export default async function SupportPage() {
  const context = await getAuthenticatedPortalContext();

  if (!context) {
    return null;
  }

  const tickets = await getCustomerSupportTickets(
    context.user.customerId,
    context.accessToken,
  );
  const recentTickets = tickets.slice(0, 3);

  return (
    <div className="space-y-4 lg:flex lg:min-h-0 lg:flex-col">
      <PageIntro
        eyebrow="Support"
        title="Help Center"
        description="Find the right support path, review common help topics, and keep track of your latest tickets."
        actions={
          <>
            <Link
              href="/support/new"
              className="theme-control inline-flex items-center gap-2 rounded-pill border border-[#d9eddc] bg-[#f6fff5] px-4 py-2.5 text-body-sm font-medium text-[#3ba745] transition-colors duration-200 hover:bg-[#effceb]"
            >
              <Ticket size={15} strokeWidth={1.8} />
              Submit ticket
            </Link>
            <Link
              href="/support/tickets"
              className="theme-control inline-flex items-center gap-2 rounded-pill border border-white/80 bg-white/65 px-4 py-2.5 text-body-sm text-ink-soft shadow-[0_12px_28px_rgba(196,199,208,0.08)] transition-colors duration-200 hover:text-ink"
            >
              View tickets
            </Link>
          </>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {faqCards.map((card) => (
          <SurfacePanel key={card.title} className="p-4">
            <div className="theme-icon-surface flex h-11 w-11 items-center justify-center rounded-[0.95rem] bg-white/90 text-ink-soft">
              <card.icon size={18} strokeWidth={1.8} />
            </div>
            <div className="mt-4 text-title-md text-ink">{card.title}</div>
            <div className="mt-2 text-body-sm text-ink-muted">{card.description}</div>
          </SurfacePanel>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_18rem]">
        <SurfacePanel className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-title-md text-ink">Recent tickets</div>
            <StatusPill label={`${tickets.length} total`} tone="brand" />
          </div>

          <div className="mt-4 space-y-3">
            {recentTickets.length ? (
              recentTickets.map((ticket) => {
                const status = getSupportStatusMeta(ticket.status);

                return (
                  <Link
                    key={ticket.id}
                    href={`/support/tickets/${ticket.id}`}
                    className="block"
                  >
                    <div className="theme-inline-surface rounded-[1.2rem] border border-white/80 bg-white/55 px-4 py-4 transition-transform duration-200 hover:-translate-y-0.5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-body-md font-medium text-ink">
                            {ticket.title?.trim() || ticket.category}
                          </div>
                          <div className="mt-1 text-body-sm text-ink-muted">
                            {ticket.description}
                          </div>
                        </div>
                        <StatusPill label={status.label} tone={status.tone} />
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="theme-inline-surface rounded-[1.2rem] border border-white/80 bg-white/55 px-4 py-4 text-body-sm text-ink-muted">
                You don&apos;t have any tickets yet. Start one whenever you need help.
              </div>
            )}
          </div>
        </SurfacePanel>

        <div className="space-y-4">
          <SurfacePanel subtle className="p-4">
            <div className="flex items-center gap-2 text-title-md text-ink">
              <LifeBuoy size={16} strokeWidth={1.8} />
              Contact options
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <a
                href="tel:+1234567890"
                className="theme-control inline-flex items-center gap-3 rounded-[1rem] border border-white/80 bg-white/65 px-4 py-3 text-body-sm text-ink-soft transition-colors duration-200 hover:text-ink"
              >
                <Phone size={16} strokeWidth={1.8} />
                Call support
              </a>
              <a
                href="mailto:support@uwifi.com?subject=Support%20Request"
                className="theme-control inline-flex items-center gap-3 rounded-[1rem] border border-white/80 bg-white/65 px-4 py-3 text-body-sm text-ink-soft transition-colors duration-200 hover:text-ink"
              >
                <Mail size={16} strokeWidth={1.8} />
                Email support
              </a>
              <Link
                href="/support/tickets"
                className="theme-control inline-flex items-center gap-3 rounded-[1rem] border border-white/80 bg-white/65 px-4 py-3 text-body-sm text-ink-soft transition-colors duration-200 hover:text-ink"
              >
                <Ticket size={16} strokeWidth={1.8} />
                Open tickets
              </Link>
            </div>
          </SurfacePanel>

          <SurfacePanel subtle className="p-4">
            <div className="flex items-center gap-2 text-title-md text-ink">
              <Sparkles size={16} strokeWidth={1.8} />
              Fastest path
            </div>
            <div className="mt-3 text-body-sm text-ink-muted">
              A clear ticket with the right category and a screenshot usually gets routed faster than a generic request.
            </div>
          </SurfacePanel>
        </div>
      </div>
    </div>
  );
}
