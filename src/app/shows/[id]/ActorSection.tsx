"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import Session from "supertokens-auth-react/recipe/session";

interface Actor {
  id: string;
  name: string;
  photoUrl: string;
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await Session.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function ActorSection({ showId }: { showId: string }) {
  const session = useSessionContext();
  const isLoggedIn = !session.loading && session.doesSessionExist;

  const [actors, setActors] = useState<Actor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/shows/${showId}/actors`)
      .then((r) => r.json())
      .then(setActors)
      .catch(() => {});
  }, [showId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !photo) { setError("Name and photo are required"); return; }

    setSaving(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("name", name);
      form.append("photo", photo);

      const res = await fetch(`/api/shows/${showId}/actors`, {
        method: "POST",
        body: form,
        headers: await authHeaders(),
      });

      if (!res.ok) throw new Error("Failed to add actor");

      const newActor = await res.json();
      setActors((prev) => [...prev, newActor]);
      setName("");
      setPhoto(null);
      setShowForm(false);
    } catch {
      setError("Failed to add actor. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-ooo-cream">Cast</h2>
        {isLoggedIn && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-ooo-accent text-ooo-black rounded-lg text-sm font-semibold hover:bg-ooo-accent/80 transition-colors"
          >
            + Add Actor
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 bg-ooo-slate border border-ooo-ink rounded-lg"
        >
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <div className="mb-4">
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
          <div className="mb-6">
            <label className="block text-ooo-muted text-sm font-medium mb-2">Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-muted focus:outline-none focus:border-ooo-accent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-ooo-accent file:text-ooo-black hover:file:bg-ooo-accent/80"
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-ooo-accent text-ooo-black rounded-lg font-semibold hover:bg-ooo-accent/80 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : "Add"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(null); }}
              className="px-6 py-2 bg-ooo-ink text-ooo-cream rounded-lg font-semibold hover:bg-ooo-ink/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {actors.length === 0 && !showForm && (
        <p className="text-ooo-muted text-sm">No cast members added yet.</p>
      )}

      {actors.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {actors.map((actor) => (
            <div key={actor.id} className="text-center">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-ooo-slate mb-2">
                <Image
                  src={actor.photoUrl}
                  alt={actor.name}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm font-medium text-ooo-cream">{actor.name}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
