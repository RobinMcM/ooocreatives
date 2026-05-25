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

interface ShowItem {
  id: string;
  title: string;
  imageUrl: string;
  order: number;
  featuredOnHomepage?: boolean;
  linkUrl?: string;
  linkLabel?: string;
  startDate?: string;
  endDate?: string;
  createdByUserId?: string;
  publishedToOurShows?: boolean;
  createdAt: string;
  updatedAt: string;
}

function calcDays(start: string, end: string): number {
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function ShowDates({ startDate, endDate }: { startDate?: string; endDate?: string }) {
  if (!startDate && !endDate) return null;
  const days = startDate && endDate ? calcDays(startDate, endDate) : null;
  return (
    <p className="text-xs text-ooo-muted mt-1">
      {startDate && endDate
        ? `Running ${formatDate(startDate)} – ${formatDate(endDate)} · ${days} day${days === 1 ? "" : "s"}`
        : startDate
        ? `From ${formatDate(startDate)}`
        : `Until ${formatDate(endDate!)}`}
    </p>
  );
}

export default function OurShows() {
  const { roles, loading: rolesLoading } = useUserRoles();
  const isAdmin = !rolesLoading && roles.some((r) => ADMIN_ROLES.includes(r));

  const [items, setItems] = useState<ShowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/shows");
      if (!response.ok) throw new Error("Failed to fetch shows");
      const data = await response.json();
      const published = data.filter((s: ShowItem) => s.publishedToOurShows !== false);
      setItems(published.sort((a: ShowItem, b: ShowItem) => a.order - b.order));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this show?")) return;
    try {
      const response = await fetch(`/api/shows/${id}`, {
        method: "DELETE",
        headers: await authHeaders(),
      });
      if (!response.ok) throw new Error(response.status === 401 ? "Unauthorized" : "Failed to delete show");
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-4xl font-bold text-ooo-cream">Our Shows</h1>
        {isAdmin && (
          <Link
            href="/shows/new"
            className="px-4 py-2 bg-ooo-accent text-ooo-black rounded-lg text-sm font-semibold hover:bg-ooo-accent/80 transition-colors shrink-0"
          >
            + New Show
          </Link>
        )}
      </div>
      <p className="text-ooo-muted mb-8">
        Dark humour, sharp writing, and the kind of catharsis only theatre can provide.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {loading && <p className="text-ooo-muted">Loading shows...</p>}

      {!loading && items.length === 0 && (
        <div className="bg-ooo-slate border border-ooo-ink rounded-lg p-12 text-center">
          <p className="text-ooo-muted">
            {isAdmin ? "No shows yet. Create one to get started!" : "No shows yet — check back soon."}
          </p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="relative bg-ooo-slate border border-ooo-ink rounded-lg overflow-hidden group hover:border-ooo-accent/50 transition-colors">
              <Link href={`/shows/${item.id}`} className="block">
                <div className="relative aspect-[16/9] bg-ooo-black">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:opacity-90 transition-opacity"
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-display text-xl font-semibold text-ooo-cream group-hover:text-ooo-accent transition-colors">
                    {item.title}
                  </h2>
                  <ShowDates startDate={item.startDate} endDate={item.endDate} />
                </div>
              </Link>

              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <Link
                    href={`/shows/${item.id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg bg-ooo-black/70 hover:bg-ooo-accent text-ooo-cream transition-colors"
                    aria-label="Edit show"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6.586-6.586a2 2 0 112.828 2.828L11.828 13.828A2 2 0 0110 14.414l-3.414.586.586-3.414A2 2 0 018.172 9.828L9 11z" />
                    </svg>
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(item.id); }}
                    className="p-2 rounded-lg bg-ooo-black/70 hover:bg-red-700 text-ooo-cream transition-colors"
                    aria-label="Delete show"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
