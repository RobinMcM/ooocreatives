"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionContext } from "supertokens-auth-react/recipe/session";

export default function MyAcademyPage() {
  const router = useRouter();
  const session = useSessionContext();

  useEffect(() => {
    if (!session.loading && !session.doesSessionExist) {
      router.replace("/auth");
    }
  }, [session.loading, session.doesSessionExist, router]);

  if (session.loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-ooo-slate/40 rounded w-1/3" />
          <div className="h-4 bg-ooo-slate/30 rounded w-1/4" />
        </div>
      </div>
    );
  }

  if (!session.doesSessionExist) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-ooo-cream mb-2">My Academy</h1>
      <p className="text-sm text-ooo-muted mb-10">Your personal dashboard for courses, schedules, and scripts.</p>

      <div className="space-y-8">
        <section>
          <h2 className="font-display text-xl font-semibold text-ooo-cream border-b border-ooo-slate/50 pb-3 mb-4">
            Pending Courses
          </h2>
          <p className="text-sm text-ooo-muted italic">Coming soon.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ooo-cream border-b border-ooo-slate/50 pb-3 mb-4">
            Booked Courses
          </h2>
          <p className="text-sm text-ooo-muted italic">Coming soon.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ooo-cream border-b border-ooo-slate/50 pb-3 mb-4">
            Rehearsal Schedules
          </h2>
          <p className="text-sm text-ooo-muted italic">Coming soon.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ooo-cream border-b border-ooo-slate/50 pb-3 mb-4">
            Scripts
          </h2>
          <p className="text-sm text-ooo-muted italic">Coming soon.</p>
        </section>
      </div>
    </div>
  );
}
