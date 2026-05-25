"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserRoles } from "@/lib/useUserRoles";

const ADMIN_ROLES = ["admin", "Admin"];

interface User {
  userId: string;
  name: string | null;
  communicationEmail: string | null;
  username: string | null;
  company: string | null;
  initiated: string;
  role: string | null;
}

const ASSIGNABLE_ROLES = ["User", "Creative", "Super User"];

export default function UsersPage() {
  const router = useRouter();
  const { roles, loading: rolesLoading } = useUserRoles();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingRole, setSavingRole] = useState<string | null>(null);

  const isAdmin = !rolesLoading && roles.some((r) => ADMIN_ROLES.includes(r));

  const handleRoleChange = async (userId: string, newRole: string) => {
    setSavingRole(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error();
      setUsers((prev) =>
        prev.map((u) => (u.userId === userId ? { ...u, role: newRole } : u))
      );
    } catch {
      setError("Failed to update role.");
    } finally {
      setSavingRole(null);
    }
  };

  useEffect(() => {
    if (rolesLoading) return;
    if (!isAdmin) {
      router.replace("/");
      return;
    }

    fetch("/api/admin/users")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load users");
        const data = await res.json();
        setUsers(data.users ?? []);
      })
      .catch(() => setError("Failed to load users."))
      .finally(() => setLoading(false));
  }, [isAdmin, rolesLoading, router]);

  if (rolesLoading || (loading && isAdmin)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-ooo-slate/40 rounded w-1/3" />
          <div className="h-4 bg-ooo-slate/30 rounded w-1/4" />
          <div className="h-64 bg-ooo-slate/20 rounded" />
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-semibold text-ooo-cream mb-1">oooCreatives Users</h1>
      <p className="text-sm text-ooo-muted mb-8">{users.length} registered user{users.length !== 1 ? "s" : ""}</p>

      {error && (
        <p className="text-sm text-red-400 bg-red-900/20 border border-red-700/40 rounded px-3 py-2 mb-6">{error}</p>
      )}

      {!error && users.length === 0 && (
        <p className="text-ooo-muted text-sm">No users registered yet.</p>
      )}

      {users.length > 0 && (
        <div className="rounded-xl border border-ooo-slate overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ooo-slate bg-ooo-slate/20">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-ooo-muted font-medium">Name</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-ooo-muted font-medium hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-ooo-muted font-medium hidden md:table-cell">Company</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-ooo-muted font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr
                  key={user.userId}
                  className={`border-b border-ooo-slate/50 last:border-0 ${i % 2 === 0 ? "" : "bg-ooo-slate/10"}`}
                >
                  <td className="px-4 py-3 text-ooo-cream">
                    {user.name ?? <span className="text-ooo-muted italic">—</span>}
                    {user.username && (
                      <span className="block text-xs text-ooo-muted">@{user.username}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ooo-muted hidden sm:table-cell">
                    {user.communicationEmail ?? <span className="italic">—</span>}
                  </td>
                  <td className="px-4 py-3 text-ooo-muted hidden md:table-cell">
                    {user.company ?? <span className="italic">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role ?? "User"}
                      disabled={savingRole === user.userId}
                      onChange={(e) => handleRoleChange(user.userId, e.target.value)}
                      className="text-xs px-2 py-1 rounded bg-ooo-slate border border-ooo-slate text-ooo-cream focus:outline-none focus:ring-2 focus:ring-ooo-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {ASSIGNABLE_ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
