"use client";

import { useEffect, useState } from "react";
import { useSessionContext } from "supertokens-auth-react/recipe/session";

export function useUserDisplayName() {
  const sessionContext = useSessionContext();
  const sessionExists = !sessionContext.loading && sessionContext.doesSessionExist;
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionExists) {
      setDisplayName(null);
      return;
    }

    fetch("/api/profile")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const name = data?.profile?.name?.trim();
        const email = data?.profile?.communicationEmail?.trim();
        setDisplayName(name || email || null);
      })
      .catch(() => setDisplayName(null));
  }, [sessionExists]);

  return displayName;
}
