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
  createdAt: string;
  updatedAt: string;
}

function calcDays(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(ms / 86400000) + 1);
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

const emptyForm = {
  title: "",
  image: null as File | null,
  linkUrl: "",
  linkLabel: "",
  featuredOnHomepage: true,
  startDate: "",
  endDate: "",
};

export default function OurShows() {
  const { roles, loading: rolesLoading } = useUserRoles();
  const isAdmin = !rolesLoading && roles.some((r) => ADMIN_ROLES.includes(r));

  const [items, setItems] = useState<ShowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/shows");
      if (!response.ok) throw new Error("Failed to fetch shows");
      const data = await response.json();
      setItems(data.sort((a: ShowItem, b: ShowItem) => a.order - b.order));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) { setError("Title is required"); return; }
    if (isAddingNew && !formData.image) { setError("Image is required for new shows"); return; }

    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      if (formData.image) fd.append("image", formData.image);
      fd.append("linkUrl", formData.linkUrl);
      fd.append("linkLabel", formData.linkLabel);
      fd.append("featuredOnHomepage", String(formData.featuredOnHomepage));
      fd.append("startDate", formData.startDate);
      fd.append("endDate", formData.endDate);

      const url = editingId ? `/api/shows/${editingId}` : "/api/shows";
      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        body: fd,
        headers: await authHeaders(),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(response.status === 401 ? "Unauthorized" : (body.error ?? "Failed to save show"));
      }

      setFormData(emptyForm);
      setIsAddingNew(false);
      setEditingId(null);
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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

  const handleEdit = (item: ShowItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      image: null,
      linkUrl: item.linkUrl ?? "",
      linkLabel: item.linkLabel ?? "",
      featuredOnHomepage: item.featuredOnHomepage !== false,
      startDate: item.startDate ?? "",
      endDate: item.endDate ?? "",
    });
    setIsAddingNew(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAddingNew(false);
    setFormData(emptyForm);
    setError(null);
  };

  const previewDays =
    formData.startDate && formData.endDate
      ? calcDays(formData.startDate, formData.endDate)
      : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-ooo-cream mb-2">Our Shows</h1>
      <p className="text-ooo-muted mb-8">
        Dark humour, sharp writing, and the kind of catharsis only theatre can provide.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {/* Admin: add/edit form */}
      {isAdmin && (isAddingNew || editingId) && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-ooo-slate border border-ooo-ink rounded-lg">
          <h2 className="font-display text-2xl font-bold text-ooo-cream mb-4">
            {editingId ? "Edit Show" : "Add New Show"}
          </h2>

          <div className="mb-4">
            <label className="block text-ooo-muted text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream placeholder-ooo-muted focus:outline-none focus:border-ooo-accent"
              placeholder="Show title"
              required
            />
          </div>

          <div className="mb-4">
            <label className="inline-flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featuredOnHomepage}
                onChange={(e) => setFormData((p) => ({ ...p, featuredOnHomepage: e.target.checked }))}
                className="w-4 h-4 rounded border-ooo-ink accent-ooo-accent"
              />
              <span className="text-sm font-medium text-ooo-cream">Display on homepage</span>
            </label>
            <p className="mt-1 ml-7 text-xs text-ooo-muted">Show this in the featured carousel on the homepage.</p>
          </div>

          {/* Show dates */}
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-ooo-muted text-sm font-medium mb-2">
                Running From <span className="text-ooo-muted/50 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
                className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream focus:outline-none focus:border-ooo-accent"
              />
            </div>
            <div>
              <label className="block text-ooo-muted text-sm font-medium mb-2">
                Running To <span className="text-ooo-muted/50 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                min={formData.startDate || undefined}
                onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))}
                className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream focus:outline-none focus:border-ooo-accent"
              />
            </div>
          </div>
          {previewDays !== null && (
            <p className="text-xs text-ooo-accent mb-4 -mt-2">
              {previewDays} day{previewDays === 1 ? "" : "s"}
            </p>
          )}

          <div className="mb-4">
            <label className="block text-ooo-muted text-sm font-medium mb-2">
              Image {!editingId && <span className="text-red-400">*</span>}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && setFormData((p) => ({ ...p, image: e.target.files![0] }))}
              className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-muted focus:outline-none focus:border-ooo-accent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-ooo-accent file:text-ooo-black hover:file:bg-ooo-accent/80"
            />
            {formData.image && <p className="mt-2 text-sm text-ooo-muted">Selected: {formData.image.name}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-ooo-muted text-sm font-medium mb-2">
              Link URL <span className="text-ooo-muted/50 font-normal">(optional)</span>
            </label>
            <input
              type="url"
              value={formData.linkUrl}
              onChange={(e) => setFormData((p) => ({ ...p, linkUrl: e.target.value }))}
              className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream placeholder-ooo-muted focus:outline-none focus:border-ooo-accent"
              placeholder="https://example.com/book-tickets"
            />
          </div>

          <div className="mb-6">
            <label className="block text-ooo-muted text-sm font-medium mb-2">
              Link Label <span className="text-ooo-muted/50 font-normal">(optional — defaults to &ldquo;Find out more&rdquo;)</span>
            </label>
            <input
              type="text"
              value={formData.linkLabel}
              onChange={(e) => setFormData((p) => ({ ...p, linkLabel: e.target.value }))}
              className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream placeholder-ooo-muted focus:outline-none focus:border-ooo-accent"
              placeholder="Book tickets"
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2 bg-ooo-accent text-ooo-black rounded-lg font-semibold hover:bg-ooo-accent/80 transition-colors">
              {editingId ? "Update" : "Add"}
            </button>
            <button type="button" onClick={handleCancel} className="px-6 py-2 bg-ooo-ink text-ooo-cream rounded-lg font-semibold hover:bg-ooo-ink/80 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Admin: add button */}
      {isAdmin && !isAddingNew && !editingId && (
        <button
          onClick={() => setIsAddingNew(true)}
          className="mb-8 px-6 py-3 bg-ooo-accent text-ooo-black rounded-lg font-semibold hover:bg-ooo-accent/80 transition-colors"
        >
          + Add New Show
        </button>
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
            <div key={item.id} className="bg-ooo-slate border border-ooo-ink rounded-lg overflow-hidden group hover:border-ooo-accent/50 transition-colors">
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
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 px-3 py-2 bg-ooo-ink text-ooo-cream rounded font-semibold hover:bg-ooo-ink/80 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 px-3 py-2 bg-red-900/30 text-red-300 rounded font-semibold hover:bg-red-900/50 transition-colors text-sm"
                  >
                    Delete
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
