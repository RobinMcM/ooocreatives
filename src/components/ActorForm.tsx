"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Session from "supertokens-auth-react/recipe/session";
import type { Actor } from "@/lib/actors-db";

async function authHeaders(): Promise<HeadersInit> {
  const token = await Session.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function ActorForm({ showId, actor }: { showId: string; actor?: Actor }) {
  const router = useRouter();
  const isEditing = !!actor;

  const [name, setName] = useState(actor?.name ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) { setError("Name is required"); return; }
    if (!isEditing && !photo) { setError("Photo is required"); return; }

    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("name", name);
      if (photo) fd.append("photo", photo);

      const url = isEditing
        ? `/api/shows/${showId}/actors/${actor.id}`
        : `/api/shows/${showId}/actors`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        body: fd,
        headers: await authHeaders(),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(response.status === 401 ? "Unauthorized" : (body.error ?? "Failed to save actor"));
      }

      router.push(`/shows/${showId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-ooo-cream mb-8">
        {isEditing ? "Edit Actor" : "Add Actor"}
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-ooo-muted text-sm font-medium mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Actor name"
            className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream placeholder-ooo-muted focus:outline-none focus:border-ooo-accent"
            required
          />
        </div>

        <div>
          <label className="block text-ooo-muted text-sm font-medium mb-2">
            Photo {!isEditing && <span className="text-red-400">*</span>}
            {isEditing && <span className="text-ooo-muted/50 font-normal"> (leave blank to keep current)</span>}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-muted focus:outline-none focus:border-ooo-accent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-ooo-accent file:text-ooo-black hover:file:bg-ooo-accent/80"
          />
          {photo && <p className="mt-2 text-sm text-ooo-muted">Selected: {photo.name}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-ooo-accent text-ooo-black rounded-lg font-semibold hover:bg-ooo-accent/80 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : isEditing ? "Update Actor" : "Add Actor"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/shows/${showId}`)}
            className="px-6 py-2 bg-ooo-ink text-ooo-cream rounded-lg font-semibold hover:bg-ooo-ink/80 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
