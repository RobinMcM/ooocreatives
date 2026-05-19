"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Session from "supertokens-auth-react/recipe/session";
import type { Character } from "@/lib/characters-db";

async function authHeaders(): Promise<HeadersInit> {
  const token = await Session.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function CharacterForm({ showId, character }: { showId: string; character?: Character }) {
  const router = useRouter();
  const isEditing = !!character;

  const [characterName, setCharacterName] = useState(character?.characterName ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterName.trim()) { setError("Character name is required"); return; }

    setSaving(true);
    setError(null);
    try {
      const url = isEditing
        ? `/api/shows/${showId}/characters/${character.id}`
        : `/api/shows/${showId}/characters`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { ...(await authHeaders()), "Content-Type": "application/json" },
        body: JSON.stringify({ characterName: characterName.trim() }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(response.status === 401 ? "Unauthorized" : (body.error ?? "Failed to save"));
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
        {isEditing ? "Edit Character" : "Add Character"}
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-ooo-muted text-sm font-medium mb-2">Character Name</label>
          <input
            type="text"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="e.g. Hamlet"
            className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream placeholder-ooo-muted focus:outline-none focus:border-ooo-accent"
            required
            autoFocus
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-ooo-accent text-ooo-black rounded-lg font-semibold hover:bg-ooo-accent/80 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : isEditing ? "Update Character" : "Add Character"}
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
