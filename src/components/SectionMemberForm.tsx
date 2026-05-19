"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Session from "supertokens-auth-react/recipe/session";
import type { SectionMember } from "@/lib/show-sections-db";

async function authHeaders(): Promise<HeadersInit> {
  const token = await Session.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface SectionMemberFormProps {
  showId: string;
  section: "crew" | "team";
  member?: SectionMember;
  roleLabel: string;
}

export function SectionMemberForm({ showId, section, member, roleLabel }: SectionMemberFormProps) {
  const router = useRouter();
  const isEditing = !!member;
  const [roleName, setRoleName] = useState(member?.roleName ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;
    setSaving(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/shows/${showId}/sections/${section}/${member!.id}`
        : `/api/shows/${showId}/sections/${section}`;
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { ...(await authHeaders()), "Content-Type": "application/json" },
        body: JSON.stringify({ roleName: roleName.trim() }),
      });
      if (!res.ok) throw new Error();
      router.push(`/shows/${showId}`);
    } catch {
      setError("Failed to save. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-ooo-cream mb-8">
        {isEditing ? `Edit ${roleLabel}` : `New ${roleLabel}`}
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-ooo-cream mb-2">
            {roleLabel} name <span className="text-ooo-accent">*</span>
          </label>
          <input
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder={`e.g. ${section === "crew" ? "Director" : "Producer"}`}
            required
            className="w-full px-4 py-2.5 bg-ooo-slate border border-ooo-ink rounded-lg text-ooo-cream placeholder-ooo-muted focus:outline-none focus:ring-2 focus:ring-ooo-accent"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-ooo-accent text-ooo-black rounded-lg font-semibold hover:bg-ooo-accent/80 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : isEditing ? "Save changes" : "Add"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/shows/${showId}`)}
            className="px-6 py-2.5 border border-ooo-slate text-ooo-muted rounded-lg hover:text-ooo-cream hover:border-ooo-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
