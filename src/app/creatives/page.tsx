"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Creative {
  userId: string;
  name: string | null;
  title: string | null;
  bio: string | null;
  photoUrl: string | null;
  websiteUrl: string | null;
}

export default function CreativesPage() {
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/creatives")
      .then((r) => r.json())
      .then((data) => { setCreatives(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? creatives.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.name?.toLowerCase().includes(q) ||
          c.bio?.toLowerCase().includes(q) ||
          c.title?.toLowerCase().includes(q)
        );
      })
    : creatives;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h1 className="font-display text-4xl font-bold text-ooo-cream">Creatives</h1>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or skill…"
          className="w-full sm:w-64 px-3 py-2 rounded bg-ooo-slate/30 border border-ooo-slate text-ooo-cream placeholder:text-ooo-muted focus:outline-none focus:ring-2 focus:ring-ooo-accent text-sm"
        />
      </div>
      <p className="text-ooo-muted mb-8">The creatives behind our shows.</p>

      {loading && <p className="text-ooo-muted">Loading creatives...</p>}

      {!loading && filtered.length === 0 && (
        <div className="bg-ooo-slate border border-ooo-ink rounded-lg p-12 text-center">
          <p className="text-ooo-muted">
            {search ? "No creatives match your search." : "No creatives yet — check back soon."}
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filtered.map((creative) => (
            <div key={creative.userId}>
              {creative.title && (
                <p className="text-xs font-medium text-ooo-accent uppercase tracking-wide mb-1">
                  {creative.title}
                </p>
              )}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-ooo-slate mb-2">
                {creative.photoUrl ? (
                  creative.websiteUrl ? (
                    <a href={creative.websiteUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0" aria-label={`${creative.name} portfolio`}>
                      <Image src={creative.photoUrl} alt={creative.name ?? "Creative"} fill className="object-cover hover:opacity-80 transition-opacity" />
                    </a>
                  ) : (
                    <Image src={creative.photoUrl} alt={creative.name ?? "Creative"} fill className="object-cover" />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-ooo-muted text-3xl font-display">
                    {creative.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-ooo-cream">{creative.name ?? "—"}</p>
              {creative.bio && (
                <p className="text-xs text-ooo-muted mt-1 line-clamp-3">{creative.bio}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
