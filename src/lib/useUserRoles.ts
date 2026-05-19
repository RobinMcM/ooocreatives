"use client";

import { useEffect, useState } from "react";
import { useSessionContext } from "supertokens-auth-react/recipe/session";

export function useUserRoles() {
  const sessionContext = useSessionContext();
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const sessionExists = !sessionContext.loading && sessionContext.doesSessionExist;

  useEffect(() => {
    if (sessionContext.loading) return;

    if (!sessionExists) {
      setRoles([]);
      setLoading(false);
      return;
    }

    fetch("/api/auth/user-roles")
      .then((r) => r.json())
      .then((data) => setRoles(data.roles ?? []))
      .catch(() => setRoles([]))
      .finally(() => setLoading(false));
  }, [sessionExists, sessionContext.loading]);

  return { roles, loading };
}
