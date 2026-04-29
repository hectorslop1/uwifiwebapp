import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ActionCapsule, ActionCapsules } from "@/src/components/layout/action-capsules";

import { FeedbackState } from "./feedback-state";
import { PageIntro } from "./page-intro";
import { SurfacePanel } from "./surface-panel";

type ComingSoonPageProps = {
  title: string;
  description: string;
  focus: string[];
};

export function ComingSoonPage({
  title,
  description,
  focus,
}: Readonly<ComingSoonPageProps>) {
  return (
    <div className="space-y-5">
      <PageIntro
        eyebrow="Implementation track"
        title={title}
        description={description}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_18rem]">
        <SurfacePanel className="p-5 sm:p-6">
          <FeedbackState
            title="This surface is staged next"
            description="The route is live and aligned to the new shell. The next iteration will replace this placeholder with the full premium workflow, using the same primitives as Overview, Gateway and Billing."
            action={
              <Link
                href="/overview"
                className="theme-control inline-flex items-center gap-2 rounded-pill border border-white/80 bg-white/75 px-4 py-2.5 text-body-sm text-ink-soft shadow-[0_12px_28px_rgba(196,199,208,0.1)] transition-colors duration-200 hover:text-ink"
              >
                Back to overview
                <ArrowRight size={16} strokeWidth={1.8} />
              </Link>
            }
          />
        </SurfacePanel>

        <SurfacePanel subtle className="p-5">
          <div className="text-title-md text-ink">Queued in this track</div>
          <ActionCapsules className="mt-4">
            {focus.map((item) => (
              <ActionCapsule
                key={item}
                href="#"
                label={item}
                className="pointer-events-none"
              />
            ))}
          </ActionCapsules>
        </SurfacePanel>
      </div>
    </div>
  );
}
