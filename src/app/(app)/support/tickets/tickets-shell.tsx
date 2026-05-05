"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FileText, Plus, Ticket, Wrench } from "lucide-react";

import { PageIntro } from "@/src/components/ui/page-intro";
import { SegmentedControl } from "@/src/components/ui/segmented-control";
import { StatusPill } from "@/src/components/ui/status-pill";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import type { SupportTicket } from "@/src/server/support/types";

import {
  formatSupportDate,
  getSupportStatusMeta,
  SupportFlash,
} from "../support-ui";

type TicketFilter = "all" | "active" | "progress" | "resolved";

function matchesFilter(ticket: SupportTicket, filter: TicketFilter) {
  const normalized = ticket.status?.trim().toLowerCase() ?? "active";

  switch (filter) {
    case "active":
      return normalized === "active";
    case "progress":
      return normalized === "in progress";
    case "resolved":
      return normalized === "resolved";
    case "all":
    default:
      return true;
  }
}

export function TicketsShell({
  tickets,
  flash,
}: Readonly<{
  tickets: SupportTicket[];
  flash: { status: "success" | "error"; message: string } | null;
}>) {
  const [filter, setFilter] = useState<TicketFilter>("all");
  const [newestFirst, setNewestFirst] = useState(true);

  const filteredTickets = useMemo(() => {
    const entries = tickets.filter((ticket) => matchesFilter(ticket, filter));

    return entries.sort((left, right) => {
      const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
      const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
      return newestFirst ? rightTime - leftTime : leftTime - rightTime;
    });
  }, [filter, newestFirst, tickets]);

  const activeCount = tickets.filter(
    (ticket) => (ticket.status?.trim().toLowerCase() ?? "active") === "active",
  ).length;
  const progressCount = tickets.filter(
    (ticket) => ticket.status?.trim().toLowerCase() === "in progress",
  ).length;
  const resolvedCount = tickets.filter(
    (ticket) => ticket.status?.trim().toLowerCase() === "resolved",
  ).length;

  return (
    <div className="space-y-4 lg:flex lg:min-h-0 lg:flex-col">
      <PageIntro
        eyebrow="Support"
        title="Tickets"
        description="Track open issues, follow progress, and start a new request whenever you need help."
        actions={
          <Link
            href="/support/new"
            className="theme-control inline-flex items-center gap-2 rounded-pill border border-[#d9eddc] bg-[#f6fff5] px-4 py-2.5 text-body-sm font-medium text-[#3ba745] transition-colors duration-200 hover:bg-[#effceb]"
          >
            <Plus size={15} strokeWidth={1.8} />
            New ticket
          </Link>
        }
      />

      {flash ? <SupportFlash tone={flash.status}>{flash.message}</SupportFlash> : null}

      <div className="grid gap-3 md:grid-cols-3">
        <SurfacePanel className="p-4">
          <div className="text-body-sm text-ink-muted">Active</div>
          <div className="mt-2 text-[1.9rem] font-medium tracking-[-0.06em] text-ink">
            {activeCount}
          </div>
        </SurfacePanel>
        <SurfacePanel className="p-4">
          <div className="text-body-sm text-ink-muted">In progress</div>
          <div className="mt-2 text-[1.9rem] font-medium tracking-[-0.06em] text-ink">
            {progressCount}
          </div>
        </SurfacePanel>
        <SurfacePanel className="p-4">
          <div className="text-body-sm text-ink-muted">Resolved</div>
          <div className="mt-2 text-[1.9rem] font-medium tracking-[-0.06em] text-ink">
            {resolvedCount}
          </div>
        </SurfacePanel>
      </div>

      <SurfacePanel className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SegmentedControl
            value={filter}
            onChange={(value) => setFilter(value as TicketFilter)}
            options={[
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "progress", label: "In progress" },
              { value: "resolved", label: "Resolved" },
            ]}
          />

          <button
            type="button"
            onClick={() => setNewestFirst((current) => !current)}
            className="theme-control rounded-pill border border-white/80 bg-white/65 px-4 py-2.5 text-body-sm text-ink-soft transition-colors duration-200 hover:text-ink"
          >
            {newestFirst ? "Newest first" : "Oldest first"}
          </button>
        </div>
      </SurfacePanel>

      <div className="space-y-3 lg:min-h-0 lg:flex-1 lg:overflow-auto lg:pr-1">
        {filteredTickets.length ? (
          filteredTickets.map((ticket) => {
            const status = getSupportStatusMeta(ticket.status);

            return (
              <Link
                key={ticket.id}
                href={`/support/tickets/${ticket.id}`}
                className="block"
              >
                <SurfacePanel className="p-4 transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-title-md text-ink">
                          {ticket.title?.trim() || ticket.category}
                        </div>
                        <StatusPill label={status.label} tone={status.tone} />
                      </div>
                      <div className="text-body-sm text-ink-muted">
                        {ticket.description}
                      </div>
                      <div className="flex flex-wrap gap-2 text-[0.84rem] text-ink-faint">
                        <span>Ticket #{ticket.id}</span>
                        <span>•</span>
                        <span>{ticket.category}</span>
                        <span>•</span>
                        <span>{formatSupportDate(ticket.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {ticket.files.length ? (
                        <StatusPill
                          label={`${ticket.files.length} attachment${ticket.files.length === 1 ? "" : "s"}`}
                          tone="muted"
                        />
                      ) : null}
                      {ticket.assignedTo ? (
                        <StatusPill label={ticket.assignedTo} tone="warning" />
                      ) : null}
                    </div>
                  </div>
                </SurfacePanel>
              </Link>
            );
          })
        ) : (
          <SurfacePanel className="p-5">
            <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
              <span className="theme-icon-surface flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white/85 text-ink-soft">
                <Ticket size={20} strokeWidth={1.8} />
              </span>
              <div>
                <div className="text-title-md text-ink">No tickets found</div>
                <div className="mt-2 text-body-sm text-ink-muted">
                  Try another filter or create a new ticket.
                </div>
              </div>
            </div>
          </SurfacePanel>
        )}
      </div>

      <SurfacePanel subtle className="p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="theme-inline-surface rounded-[1.15rem] border border-white/80 bg-white/55 px-4 py-4">
            <div className="flex items-center gap-2 text-body-md font-medium text-ink">
              <FileText size={16} strokeWidth={1.8} />
              Keep details clear
            </div>
            <div className="mt-2 text-body-sm text-ink-muted">
              A short title and a specific description help the right team move faster.
            </div>
          </div>
          <div className="theme-inline-surface rounded-[1.15rem] border border-white/80 bg-white/55 px-4 py-4">
            <div className="flex items-center gap-2 text-body-md font-medium text-ink">
              <Wrench size={16} strokeWidth={1.8} />
              Track progress
            </div>
            <div className="mt-2 text-body-sm text-ink-muted">
              Ticket details show status, assignment, and any files attached to the issue.
            </div>
          </div>
          <div className="theme-inline-surface rounded-[1.15rem] border border-white/80 bg-white/55 px-4 py-4">
            <div className="flex items-center gap-2 text-body-md font-medium text-ink">
              <Plus size={16} strokeWidth={1.8} />
              Start a new request
            </div>
            <div className="mt-2 text-body-sm text-ink-muted">
              Create a fresh ticket whenever you need support on billing, devices, or connectivity.
            </div>
          </div>
        </div>
      </SurfacePanel>
    </div>
  );
}
