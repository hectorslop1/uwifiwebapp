"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Paperclip, Send } from "lucide-react";

import { PageIntro } from "@/src/components/ui/page-intro";
import { SurfacePanel } from "@/src/components/ui/surface-panel";
import type { SupportTicketCategory } from "@/src/server/support/types";

import { createSupportTicketAction } from "./actions";
import { initialCreateSupportTicketActionState } from "./support-action-state";
import { SupportFlash } from "./support-ui";

const fieldClassName =
  "theme-input w-full rounded-[1rem] border border-white/80 bg-white/65 px-4 py-3 text-body-sm text-ink outline-none placeholder:text-ink-faint shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]";

function SubmitTicketButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="theme-cta inline-flex min-h-[2.85rem] items-center justify-center gap-2 rounded-[1rem] px-5 text-body-sm text-white disabled:cursor-not-allowed disabled:opacity-70"
    >
      <Send size={16} strokeWidth={1.8} />
      {pending ? "Submitting..." : "Submit ticket"}
    </button>
  );
}

export function NewTicketForm({
  categories,
}: Readonly<{
  categories: SupportTicketCategory[];
}>) {
  const [state, formAction] = useActionState(
    createSupportTicketAction,
    initialCreateSupportTicketActionState,
  );
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);
  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: String(category.id),
        label: category.issueName,
      })),
    [categories],
  );

  return (
    <div className="space-y-4 lg:flex lg:min-h-0 lg:flex-col">
      <PageIntro
        eyebrow="Support"
        title="Submit a ticket"
        description="Share the issue, choose the closest category, and attach any screenshots that could help our team."
        actions={
          <Link
            href="/support/tickets"
            className="theme-control inline-flex items-center gap-2 rounded-pill border border-white/80 bg-white/65 px-4 py-2.5 text-body-sm text-ink-soft shadow-[0_12px_28px_rgba(196,199,208,0.08)] transition-colors duration-200 hover:text-ink"
          >
            View tickets
          </Link>
        }
      />

      {state.status === "error" && state.message ? (
        <SupportFlash tone="error">{state.message}</SupportFlash>
      ) : null}

      <form action={formAction} className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_18rem]">
        <SurfacePanel className="p-4 sm:p-5">
          <div className="grid gap-3">
            <input
              name="title"
              placeholder="Ticket title"
              className={fieldClassName}
              aria-label="Ticket title"
            />

            <select
              name="categoryId"
              defaultValue=""
              className={fieldClassName}
              aria-label="Issue type"
            >
              <option value="" disabled>
                Choose an issue type
              </option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <textarea
              name="description"
              rows={8}
              placeholder="Tell us what happened, what you expected, and anything you've already tried."
              className={`${fieldClassName} resize-none py-4`}
              aria-label="Description"
            />
          </div>
        </SurfacePanel>

        <div className="space-y-4">
          <SurfacePanel subtle className="p-4">
            <div className="text-title-md text-ink">Attachments</div>
            <label className="theme-inline-surface mt-4 flex cursor-pointer items-center gap-3 rounded-[1.15rem] border border-white/80 bg-white/60 px-4 py-4 text-body-sm text-ink-soft">
              <Paperclip size={16} strokeWidth={1.8} />
              <span>Add screenshots or photos</span>
              <input
                type="file"
                name="attachments"
                multiple
                accept="image/*,.pdf"
                className="hidden"
                onChange={(event) =>
                  setAttachmentNames(
                    Array.from(event.target.files ?? []).map((file) => file.name),
                  )
                }
              />
            </label>

            {attachmentNames.length ? (
              <div className="mt-3 rounded-[1rem] border border-[#e8ede8] bg-[#f8fbf8] px-4 py-3 text-body-sm text-ink-muted">
                {attachmentNames.join(", ")}
              </div>
            ) : (
              <div className="mt-3 text-body-sm text-ink-muted">
                Attachments are optional.
              </div>
            )}
          </SurfacePanel>

          <SurfacePanel subtle className="p-4">
            <div className="text-title-md text-ink">Before you send</div>
            <div className="mt-3 space-y-2 text-body-sm text-ink-muted">
              <div>Include the issue details that matter most.</div>
              <div>Add screenshots when the problem is visual.</div>
              <div>Use the closest category so the right team picks it up sooner.</div>
            </div>
            <div className="mt-5">
              <SubmitTicketButton />
            </div>
          </SurfacePanel>
        </div>
      </form>
    </div>
  );
}
