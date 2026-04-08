"use client";

import { useEffect, useState } from "react";
import { AuthPage } from "supertokens-auth-react/ui";
import { EmailPasswordPreBuiltUI } from "supertokens-auth-react/recipe/emailpassword/prebuiltui";

export default function Auth() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <h1 className="font-display text-4xl font-bold text-ooo-cream mb-2">Account Access</h1>
      <p className="text-ooo-muted mb-10">
        Sign in or create your account to hear about new shows, early tickets, and the occasional
        passive-aggressive newsletter.
      </p>
      <div className="bg-ooo-slate border border-ooo-ink rounded-lg p-8">
        {mounted ? (
          <AuthPage preBuiltUIList={[EmailPasswordPreBuiltUI]} redirectOnSessionExists={false} />
        ) : (
          <p className="text-ooo-muted text-center py-8">Loading...</p>
        )}
      </div>
    </div>
  );
}
