"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Session from "supertokens-auth-react/recipe/session";
import { useUserRoles } from "@/lib/useUserRoles";

const ADMIN_ROLES = ["admin", "super_user", "super user", "Admin", "Super User"];

async function authHeaders(): Promise<HeadersInit> {
  const token = await Session.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface Actor {
  id: string;
  name: string;
  bio?: string;
  photoUrl: string;
}

export default function ActorsPage() {
  const { roles, loading: rolesLoading } = useUserRoles();
  const isAdmin = !rolesLoading && roles.some((r) => ADMIN_ROLES.includes(r));

  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/actors")
      .then((r) => r.json())
      .then((data) => { setActors(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this actor?")) return;
    try {
      const res = await fetch(`/api/actors/${id}`, {
        method: "DELETE",
        headers: await authHeaders(),
      });
      if (!res.ok) throw new Error();
      setActors((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setError("Failed to delete actor.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-4xl font-bold text-ooo-cream">Actors</h1>
        {isAdmin && (
          <Link
            href="/actors/new"
            className="px-4 py-2 bg-ooo-accent text-ooo-black rounded-lg text-sm font-semibold hover:bg-ooo-accent/80 transition-colors shrink-0"
          >
            + Add Actor
          </Link>
        )}
      </div>
      <p className="text-ooo-muted mb-8">The talent behind our shows.</p>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300">{error}</div>
      )}

      {loading && <p className="text-ooo-muted">Loading actors...</p>}

      {!loading && actors.length === 0 && (
        <div className="bg-ooo-slate border border-ooo-ink rounded-lg p-12 text-center">
          <p className="text-ooo-muted">
            {isAdmin ? "No actors yet. Add one to get started!" : "No actors yet — check back soon."}
          </p>
        </div>
      )}

      {!loading && actors.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {actors.map((actor) => (
            <div key={actor.id} className="relative group">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-ooo-slate mb-2">
                <Image src={actor.photoUrl} alt={actor.name} fill className="object-cover" />
                {isAdmin && (
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/actors/${actor.id}/edit`}
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
              {actor.bio && <p className="text-xs text-ooo-muted mt-1 line-clamp-3">{actor.bio}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
