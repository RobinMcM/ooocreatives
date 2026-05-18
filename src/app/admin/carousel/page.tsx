"use client";

import { useState, useEffect } from "react";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import Session from "supertokens-auth-react/recipe/session";
import Image from "next/image";

async function authHeaders(): Promise<HeadersInit> {
  const token = await Session.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface CarouselItem {
  id: string;
  title: string;
  imageUrl: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCarousel() {
  const session = useSessionContext();
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", image: null as File | null });

  // Fetch carousel items
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/carousel");
      if (!response.ok) throw new Error("Failed to fetch carousel items");
      const data = await response.json();
      setItems(data.sort((a: CarouselItem, b: CarouselItem) => a.order - b.order));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      setError("Title is required");
      return;
    }

    if (isAddingNew && !formData.image) {
      setError("Image is required for new items");
      return;
    }

    try {
      const submitFormData = new FormData();
      submitFormData.append("title", formData.title);
      if (formData.image) {
        submitFormData.append("image", formData.image);
      }

      const url = editingId ? `/api/carousel/${editingId}` : "/api/carousel";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: submitFormData,
        headers: await authHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401 ? "Unauthorized" : "Failed to save carousel item"
        );
      }

      setFormData({ title: "", image: null });
      setIsAddingNew(false);
      setEditingId(null);
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this carousel item?")) {
      return;
    }

    try {
      const response = await fetch(`/api/carousel/${id}`, {
        method: "DELETE",
        headers: await authHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401 ? "Unauthorized" : "Failed to delete carousel item"
        );
      }

      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleEdit = (item: CarouselItem) => {
    setEditingId(item.id);
    setFormData({ title: item.title, image: null });
    setIsAddingNew(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAddingNew(false);
    setFormData({ title: "", image: null });
    setError(null);
  };

  // Check if user is logged in
  if (session.loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <p className="text-ooo-muted">Loading...</p>
      </div>
    );
  }

  if (!session.doesSessionExist) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="font-display text-4xl font-bold text-ooo-cream mb-4">Access Denied</h1>
        <p className="text-ooo-muted">Please sign in to access the carousel editor.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="font-display text-4xl font-bold text-ooo-cream mb-2">Manage Carousel</h1>
      <p className="text-ooo-muted mb-8">Add, edit, or remove carousel items.</p>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAddingNew || editingId) && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 bg-ooo-slate border border-ooo-ink rounded-lg"
        >
          <h2 className="font-display text-2xl font-bold text-ooo-cream mb-4">
            {editingId ? "Edit Item" : "Add New Item"}
          </h2>

          <div className="mb-4">
            <label className="block text-ooo-muted text-sm font-medium mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream placeholder-ooo-muted focus:outline-none focus:border-ooo-accent"
              placeholder="Carousel item title"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-ooo-muted text-sm font-medium mb-2">
              Image {!editingId && <span className="text-red-400">*</span>}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-muted focus:outline-none focus:border-ooo-accent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-ooo-accent file:text-ooo-black hover:file:bg-ooo-accent/80"
            />
            {formData.image && (
              <p className="mt-2 text-sm text-ooo-muted">
                Selected: {formData.image.name}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-2 bg-ooo-accent text-ooo-black rounded-lg font-semibold hover:bg-ooo-accent/80 transition-colors"
            >
              {editingId ? "Update" : "Add"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-ooo-ink text-ooo-cream rounded-lg font-semibold hover:bg-ooo-ink/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Add New Button */}
      {!isAddingNew && !editingId && (
        <button
          onClick={() => setIsAddingNew(true)}
          className="mb-8 px-6 py-3 bg-ooo-accent text-ooo-black rounded-lg font-semibold hover:bg-ooo-accent/80 transition-colors"
        >
          + Add New Item
        </button>
      )}

      {/* Loading State */}
      {loading && <p className="text-ooo-muted">Loading carousel items...</p>}

      {/* Items Grid */}
      {!loading && items.length === 0 && (
        <div className="bg-ooo-slate border border-ooo-ink rounded-lg p-12 text-center">
          <p className="text-ooo-muted">No carousel items yet. Create one to get started!</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="bg-ooo-slate border border-ooo-ink rounded-lg overflow-hidden">
              <div className="relative aspect-[16/9] bg-ooo-black">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-display text-lg font-bold text-ooo-cream mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-ooo-muted mb-4">
                  Order: {item.order}
                </p>
                <div className="flex gap-2">
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
