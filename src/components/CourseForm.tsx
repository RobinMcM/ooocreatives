"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Session from "supertokens-auth-react/recipe/session";
import type { CourseTemplate } from "@/lib/do-spaces";

async function authHeaders(): Promise<HeadersInit> {
  const token = await Session.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function RichTextEditor({ initialValue, onChange }: { initialValue: string; onChange: (html: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = initialValue;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = (cmd: string, value?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, value);
    onChange(ref.current?.innerHTML ?? "");
  };

  const btn = (label: string, title: string, onClick: () => void) => (
    <button
      key={label}
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className="px-2 py-1 text-sm font-medium text-ooo-cream bg-ooo-ink border border-ooo-slate rounded hover:bg-ooo-slate transition-colors"
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-2">
        {btn("B", "Bold", () => exec("bold"))}
        {btn("I", "Italic", () => exec("italic"))}
        {btn("U", "Underline", () => exec("underline"))}
        {btn("H2", "Heading", () => exec("formatBlock", "h2"))}
        {btn("¶", "Paragraph", () => exec("formatBlock", "p"))}
        {btn("• List", "Bullet list", () => exec("insertUnorderedList"))}
        {btn("1. List", "Numbered list", () => exec("insertOrderedList"))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML ?? "")}
        className="min-h-[160px] px-4 py-3 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream focus:outline-none focus:border-ooo-accent prose prose-invert max-w-none"
        style={{ lineHeight: 1.6 }}
      />
    </div>
  );
}

export function CourseForm({ course }: { course?: CourseTemplate }) {
  const router = useRouter();
  const isEditing = !!course;

  const [title, setTitle] = useState(course?.title ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [description, setDescription] = useState(course?.description ?? "");
  const [durationMinutes, setDurationMinutes] = useState(course?.durationMinutes?.toString() ?? "");
  const [location, setLocation] = useState(course?.location ?? "");
  const [locationUrl, setLocationUrl] = useState(course?.locationUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) { setError("Title is required"); return; }
    if (!isEditing && !photo) { setError("Photo is required"); return; }

    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("durationMinutes", durationMinutes);
      fd.append("location", location);
      fd.append("locationUrl", locationUrl);
      if (photo) fd.append("photo", photo);

      const url = isEditing ? `/api/courses/${course.id}` : "/api/courses";
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        body: fd,
        headers: await authHeaders(),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(response.status === 401 ? "Unauthorized" : (body.error ?? "Failed to save course"));
      }

      router.push("/courses");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-ooo-cream mb-8">
        {isEditing ? "Edit Course" : "New Course"}
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-ooo-muted text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Course title"
            className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream placeholder-ooo-muted focus:outline-none focus:border-ooo-accent"
            required
          />
        </div>

        <div className="w-full sm:w-48">
          <label className="block text-ooo-muted text-sm font-medium mb-2">Duration <span className="text-ooo-muted/50 font-normal">(mins, optional)</span></label>
          <input
            type="number"
            min="1"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            placeholder="e.g. 90"
            className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream placeholder-ooo-muted focus:outline-none focus:border-ooo-accent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-ooo-muted text-sm font-medium mb-2">Location <span className="text-ooo-muted/50 font-normal">(optional)</span></label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. The Studio, London"
              className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream placeholder-ooo-muted focus:outline-none focus:border-ooo-accent"
            />
          </div>
          <div>
            <label className="block text-ooo-muted text-sm font-medium mb-2">Location URL <span className="text-ooo-muted/50 font-normal">(optional)</span></label>
            <input
              type="url"
              value={locationUrl}
              onChange={(e) => setLocationUrl(e.target.value)}
              placeholder="https://maps.google.com/…"
              className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream placeholder-ooo-muted focus:outline-none focus:border-ooo-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-ooo-muted text-sm font-medium mb-2">
            Photo {!isEditing && <span className="text-red-400">*</span>}
            {isEditing && <span className="text-ooo-muted/50 font-normal"> (leave blank to keep current)</span>}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-muted focus:outline-none focus:border-ooo-accent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-ooo-accent file:text-ooo-black hover:file:bg-ooo-accent/80"
          />
          {photo && <p className="mt-2 text-sm text-ooo-muted">Selected: {photo.name}</p>}
        </div>

        <div>
          <label className="block text-ooo-muted text-sm font-medium mb-2">Description</label>
          <RichTextEditor initialValue={course?.description ?? ""} onChange={setDescription} />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-ooo-accent text-ooo-black rounded-lg font-semibold hover:bg-ooo-accent/80 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : isEditing ? "Update Course" : "Create Course"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/courses")}
            className="px-6 py-2 bg-ooo-ink text-ooo-cream rounded-lg font-semibold hover:bg-ooo-ink/80 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
