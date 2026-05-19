"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import Session from "supertokens-auth-react/recipe/session";
import { useUserRoles } from "@/lib/useUserRoles";

const ADMIN_ROLES = ["admin", "super_user", "super user", "Admin", "Super User"];

interface Character {
  id: string;
  characterName: string;
  actorId?: string;
}

interface Actor {
  id: string;
  name: string;
  bio?: string;
  photoUrl: string;
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await Session.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function CharacterSection({ showId }: { showId: string }) {
  const session = useSessionContext();
  const isLoggedIn = !session.loading && session.doesSessionExist;
  const { roles, loading: rolesLoading } = useUserRoles();
  const isAdmin = isLoggedIn && !rolesLoading && roles.some((r) => ADMIN_ROLES.includes(r));

  const [characters, setCharacters] = useState<Character[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);
  const [linkingCharId, setLinkingCharId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/shows/${showId}/characters`)
      .then((r) => r.json())
      .then(setCharacters)
      .catch(() => {});

    fetch("/api/actors")
      .then((r) => r.json())
      .then(setActors)
      .catch(() => {});
  }, [showId]);

  useEffect(() => {
    if (!linkingCharId) return;
    const handleClick = (e: MouseEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) setLinkingCharId(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [linkingCharId]);

  const handleDelete = async (charId: string) => {
    if (!confirm("Remove this character from the show?")) return;
    try {
      const res = await fetch(`/api/shows/${showId}/characters/${charId}`, {
        method: "DELETE",
        headers: await authHeaders(),
      });
      if (!res.ok) throw new Error();
      setCharacters((prev) => prev.filter((c) => c.id !== charId));
    } catch {
      setError("Failed to delete character.");
    }
  };

  const handleLinkActor = async (charId: string, actorId: string | null) => {
    try {
      const res = await fetch(`/api/shows/${showId}/characters/${charId}`, {
        method: "PUT",
        headers: { ...(await authHeaders()), "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: actorId ?? "" }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setCharacters((prev) => prev.map((c) => (c.id === charId ? updated : c)));
      setLinkingCharId(null);
    } catch {
      setError("Failed to link actor.");
    }
  };

  const actorMap = Object.fromEntries(actors.map((a) => [a.id, a]));

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-ooo-cream">Cast</h2>
        {isAdmin && (
          <Link
            href={`/shows/${showId}/characters/new`}
            className="px-4 py-2 bg-ooo-accent text-ooo-black rounded-lg text-sm font-semibold hover:bg-ooo-accent/80 transition-colors"
          >
            + Add Character
          </Link>
        )}
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {characters.length === 0 && (
        <p className="text-ooo-muted text-sm">No cast members added yet.</p>
      )}

      {characters.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {characters.map((char) => {
            const actor = char.actorId ? actorMap[char.actorId] : undefined;
            const isPickerOpen = linkingCharId === char.id;

            return (
              <div key={char.id} className="relative group">
                {/* Character name header */}
                <p className="font-display text-sm font-semibold text-ooo-accent mb-1 truncate">
                  {char.characterName}
                </p>

                {/* Photo */}
                <div className="relative aspect-square rounded-lg overflow-hidden bg-ooo-slate mb-2">
                  {actor ? (
                    <Image src={actor.photoUrl} alt={actor.name} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-12 h-12 text-ooo-muted/40" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                      </svg>
                    </div>
                  )}

                  {/* Admin hover controls */}
                  {isAdmin && (
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/shows/${showId}/characters/${char.id}/edit`}
                        className="p-1.5 rounded bg-ooo-black/70 hover:bg-ooo-accent text-ooo-cream transition-colors"
                        aria-label="Edit character"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6.586-6.586a2 2 0 112.828 2.828L11.828 13.828A2 2 0 0110 14.414l-3.414.586.586-3.414A2 2 0 018.172 9.828L9 11z" />
                        </svg>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(char.id)}
                        className="p-1.5 rounded bg-ooo-black/70 hover:bg-red-700 text-ooo-cream transition-colors"
                        aria-label="Delete character"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Actor name / uncast */}
                {actor ? (
                  <>
                    <p className="text-sm font-medium text-ooo-cream">{actor.name}</p>
                    {actor.bio && <p className="text-xs text-ooo-muted mt-1 line-clamp-3">{actor.bio}</p>}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleLinkActor(char.id, null)}
                        className="mt-2 text-xs text-ooo-muted hover:text-red-400 transition-colors"
                      >
                        Unlink actor
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-xs text-ooo-muted italic">Uncast</p>
                    {isAdmin && (
                      <div className="relative mt-1" ref={isPickerOpen ? pickerRef : undefined}>
                        <button
                          type="button"
                          onClick={() => setLinkingCharId(isPickerOpen ? null : char.id)}
                          className="text-xs text-ooo-accent hover:text-ooo-accent/80 transition-colors font-medium"
                        >
                          {isPickerOpen ? "Cancel" : "Link Actor"}
                        </button>
                        {isPickerOpen && (
                          <div className="absolute left-0 top-6 z-20 w-48 max-h-48 overflow-y-auto rounded-lg border border-ooo-slate bg-ooo-ink shadow-xl">
                            {actors.length === 0 ? (
                              <p className="px-3 py-2 text-xs text-ooo-muted">No actors registered yet.</p>
                            ) : (
                              actors.map((a) => (
                                <button
                                  key={a.id}
                                  type="button"
                                  onClick={() => handleLinkActor(char.id, a.id)}
                                  className="w-full text-left px-3 py-2 text-sm text-ooo-cream hover:bg-ooo-slate transition-colors flex items-center gap-2"
                                >
                                  <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 bg-ooo-slate">
                                    <Image src={a.photoUrl} alt={a.name} fill className="object-cover" />
                                  </div>
                                  {a.name}
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
