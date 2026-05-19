"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/shows/${showId}/actors`)
      .then((r) => r.json())
      .then(setActors)
      .catch(() => {});
  }, [showId]);

  const handleDelete = async (actorId: string) => {
    if (!confirm("Are you sure you want to remove this actor?")) return;
    try {
      const response = await fetch(`/api/shows/${showId}/actors/${actorId}`, {
        method: "DELETE",
        headers: await authHeaders(),
      });
      if (!response.ok) throw new Error("Failed to delete actor");
      setActors((prev) => prev.filter((a) => a.id !== actorId));
    } catch {
      setError("Failed to delete actor. Please try again.");
    }
  };

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-ooo-cream">Cast</h2>
        {isLoggedIn && (
          <Link
            href={`/shows/${showId}/actors/new`}
            className="px-4 py-2 bg-ooo-accent text-ooo-black rounded-lg text-sm font-semibold hover:bg-ooo-accent/80 transition-colors"
          >
            + Add Actor
          </Link>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      {actors.length === 0 && (
        <p className="text-ooo-muted text-sm">No cast members added yet.</p>
      )}

      {actors.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {actors.map((actor) => (
            <div key={actor.id} className="relative text-center group">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-ooo-slate mb-2">
                <Image
                  src={actor.photoUrl}
                  alt={actor.name}
                  fill
                  className="object-cover"
                />
                {isLoggedIn && (
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/shows/${showId}/actors/${actor.id}/edit`}
                      className="p-1.5 rounded bg-ooo-black/70 hover:bg-ooo-accent text-ooo-cream transition-colors"
                      aria-label="Edit actor"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6.586-6.586a2 2 0 112.828 2.828L11.828 13.828A2 2 0 0110 14.414l-3.414.586.586-3.414A2 2 0 018.172 9.828L9 11z" />
                      </svg>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(actor.id)}
                      className="p-1.5 rounded bg-ooo-black/70 hover:bg-red-700 text-ooo-cream transition-colors"
                      aria-label="Delete actor"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-ooo-cream">{actor.name}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
