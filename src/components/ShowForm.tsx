"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Session from "supertokens-auth-react/recipe/session";
import type { ShowItem } from "@/lib/do-spaces";

async function authHeaders(): Promise<HeadersInit> {
  const token = await Session.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function calcDays(start: string, end: string): number {
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1);
}

export function ShowForm({ show, redirectTo = "/shows" }: { show?: ShowItem; redirectTo?: string }) {
  const router = useRouter();
  const isEditing = !!show;

  const [title, setTitle] = useState(show?.title ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState(show?.linkUrl ?? "");
  const [linkLabel, setLinkLabel] = useState(show?.linkLabel ?? "");
  const [featuredOnHomepage, setFeaturedOnHomepage] = useState(show?.featuredOnHomepage !== false);
  const [publishedToOurShows, setPublishedToOurShows] = useState(show?.publishedToOurShows !== false);
  const [startDate, setStartDate] = useState(show?.startDate ?? "");
  const [endDate, setEndDate] = useState(show?.endDate ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewDays = startDate && endDate ? calcDays(startDate, endDate) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) { setError("Title is required"); return; }
    if (!isEditing && !image) { setError("Image is required for new shows"); return; }

    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("title", title);
      if (image) fd.append("image", image);
      fd.append("linkUrl", linkUrl);
      fd.append("linkLabel", linkLabel);
      fd.append("featuredOnHomepage", String(featuredOnHomepage));
      fd.append("publishedToOurShows", String(publishedToOurShows));
      fd.append("startDate", startDate);
      fd.append("endDate", endDate);

      const url = isEditing ? `/api/shows/${show.id}` : "/api/shows";
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        body: fd,
        headers: await authHeaders(),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(response.status === 401 ? "Unauthorized" : (body.error ?? "Failed to save show"));
      }

      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-ooo-cream mb-8">
        {isEditing ? "Edit Show" : "New Show"}
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-ooo-muted text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream placeholder-ooo-muted focus:outline-none focus:border-ooo-accent"
            placeholder="Show title"
            required
          />
        </div>

        <div>
          <label className="inline-flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={featuredOnHomepage}
              onChange={(e) => setFeaturedOnHomepage(e.target.checked)}
              className="w-4 h-4 rounded border-ooo-ink accent-ooo-accent"
            />
            <span className="text-sm font-medium text-ooo-cream">Display on homepage</span>
          </label>
          <p className="mt-1 ml-7 text-xs text-ooo-muted">Show this in the featured carousel on the homepage.</p>
        </div>

        <div>
          <label className="inline-flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={publishedToOurShows}
              onChange={(e) => setPublishedToOurShows(e.target.checked)}
              className="w-4 h-4 rounded border-ooo-ink accent-ooo-accent"
            />
            <span className="text-sm font-medium text-ooo-cream">Display on Our Shows</span>
          </label>
          <p className="mt-1 ml-7 text-xs text-ooo-muted">List this show on the public Our Shows page.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-ooo-muted text-sm font-medium mb-2">
              Running From <span className="text-ooo-muted/50 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream focus:outline-none focus:border-ooo-accent"
            />
          </div>
          <div>
            <label className="block text-ooo-muted text-sm font-medium mb-2">
              Running To <span className="text-ooo-muted/50 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream focus:outline-none focus:border-ooo-accent"
            />
          </div>
        </div>
        {previewDays !== null && (
          <p className="text-xs text-ooo-accent -mt-4">
            {previewDays} day{previewDays === 1 ? "" : "s"}
          </p>
        )}

        <div>
          <label className="block text-ooo-muted text-sm font-medium mb-2">
            Image {!isEditing && <span className="text-red-400">*</span>}
            {isEditing && <span className="text-ooo-muted/50 font-normal"> (leave blank to keep current)</span>}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-muted focus:outline-none focus:border-ooo-accent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-ooo-accent file:text-ooo-black hover:file:bg-ooo-accent/80"
          />
          {image && <p className="mt-2 text-sm text-ooo-muted">Selected: {image.name}</p>}
        </div>

        <div>
          <label className="block text-ooo-muted text-sm font-medium mb-2">
            Link URL <span className="text-ooo-muted/50 font-normal">(optional)</span>
          </label>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream placeholder-ooo-muted focus:outline-none focus:border-ooo-accent"
            placeholder="https://example.com/book-tickets"
          />
        </div>

        <div>
          <label className="block text-ooo-muted text-sm font-medium mb-2">
            Link Label <span className="text-ooo-muted/50 font-normal">(optional — defaults to &ldquo;Find out more&rdquo;)</span>
          </label>
          <input
            type="text"
            value={linkLabel}
            onChange={(e) => setLinkLabel(e.target.value)}
            className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream placeholder-ooo-muted focus:outline-none focus:border-ooo-accent"
            placeholder="Book tickets"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-ooo-accent text-ooo-black rounded-lg font-semibold hover:bg-ooo-accent/80 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : isEditing ? "Update Show" : "Create Show"}
          </button>
          <button
            type="button"
            onClick={() => router.push(redirectTo)}
            className="px-6 py-2 bg-ooo-ink text-ooo-cream rounded-lg font-semibold hover:bg-ooo-ink/80 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
