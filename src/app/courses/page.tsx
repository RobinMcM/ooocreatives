"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import Session from "supertokens-auth-react/recipe/session";

interface Lesson {
  id: string;
  title: string;
  photoUrl: string;
  description: string;
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await Session.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Minimal rich-text editor ──────────────────────────────────────────────────

function RichTextEditor({
  initialValue,
  onChange,
}: {
  initialValue: string;
  onChange: (html: string) => void;
}) {
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

  const toolbarBtn = (label: string, title: string, onClick: () => void) => (
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
        {toolbarBtn("B", "Bold", () => exec("bold"))}
        {toolbarBtn("I", "Italic", () => exec("italic"))}
        {toolbarBtn("U", "Underline", () => exec("underline"))}
        {toolbarBtn("H2", "Heading", () => exec("formatBlock", "h2"))}
        {toolbarBtn("¶", "Paragraph", () => exec("formatBlock", "p"))}
        {toolbarBtn("• List", "Bullet list", () => exec("insertUnorderedList"))}
        {toolbarBtn("1. List", "Numbered list", () => exec("insertOrderedList"))}
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

// ── Lesson form (add / edit) ───────────────────────────────────────────────────

function LessonForm({
  lesson,
  onSave,
  onCancel,
}: {
  lesson?: Lesson;
  onSave: (updated: Lesson) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [description, setDescription] = useState(lesson?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) { setError("Title is required"); return; }
    if (!lesson && !photo) { setError("Photo is required"); return; }

    setSaving(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("description", description);
      if (photo) form.append("photo", photo);

      const url = lesson ? `/api/training/${lesson.id}` : "/api/training";
      const method = lesson ? "PUT" : "POST";

      const res = await fetch(url, { method, body: form, headers: await authHeaders() });
      if (!res.ok) throw new Error("Failed to save lesson");

      onSave(await res.json());
    } catch {
      setError("Failed to save lesson. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-ooo-slate border border-ooo-ink rounded-lg mb-8">
      <h2 className="font-display text-2xl font-bold text-ooo-cream mb-4">
        {lesson ? "Edit Lesson" : "Add Lesson"}
      </h2>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="mb-4">
        <label className="block text-ooo-muted text-sm font-medium mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Lesson title"
          className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream placeholder-ooo-muted focus:outline-none focus:border-ooo-accent"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-ooo-muted text-sm font-medium mb-2">
          Photo {!lesson && <span className="text-red-400">*</span>}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-muted focus:outline-none focus:border-ooo-accent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-ooo-accent file:text-ooo-black hover:file:bg-ooo-accent/80"
        />
      </div>

      <div className="mb-6">
        <label className="block text-ooo-muted text-sm font-medium mb-2">Description</label>
        <RichTextEditor initialValue={lesson?.description ?? ""} onChange={setDescription} />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-ooo-accent text-ooo-black rounded-lg font-semibold hover:bg-ooo-accent/80 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : lesson ? "Update" : "Add"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-ooo-ink text-ooo-cream rounded-lg font-semibold hover:bg-ooo-ink/80 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ActorTraining() {
  const session = useSessionContext();
  const isLoggedIn = !session.loading && session.doesSessionExist;

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    fetch("/api/training")
      .then((r) => r.json())
      .then(setLessons)
      .catch(() => {});
  }, []);

  const handleSaved = (saved: Lesson) => {
    setLessons((prev) => {
      const idx = prev.findIndex((l) => l.id === saved.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
      return [...prev, saved];
    });
    setShowForm(false);
    setEditingLesson(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lesson?")) return;
    const res = await fetch(`/api/training/${id}`, { method: "DELETE", headers: await authHeaders() });
    if (res.ok) setLessons((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-ooo-cream">Actor Training</h1>
          <p className="text-ooo-muted mt-2">Courses and workshops to develop your craft.</p>
        </div>
        {isLoggedIn && !showForm && !editingLesson && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-ooo-accent text-ooo-black rounded-lg text-sm font-semibold hover:bg-ooo-accent/80 transition-colors shrink-0"
          >
            + Add Lesson
          </button>
        )}
      </div>

      {showForm && (
        <LessonForm onSave={handleSaved} onCancel={() => setShowForm(false)} />
      )}

      {editingLesson && (
        <LessonForm
          lesson={editingLesson}
          onSave={handleSaved}
          onCancel={() => setEditingLesson(null)}
        />
      )}

      {lessons.length === 0 && !showForm && (
        <div className="bg-ooo-slate border border-ooo-ink rounded-lg p-12 text-center">
          <p className="text-ooo-muted">No lessons yet.</p>
        </div>
      )}

      <div className="flex flex-col gap-8">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="bg-ooo-slate border border-ooo-ink rounded-lg overflow-hidden">
            <div className="md:flex">
              <div className="relative aspect-square md:w-56 md:shrink-0 bg-ooo-black">
                <Image src={lesson.photoUrl} alt={lesson.title} fill className="object-cover" />
              </div>
              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <h2 className="font-display text-2xl font-bold text-ooo-cream mb-3">{lesson.title}</h2>
                  <div
                    className="text-ooo-muted text-sm leading-relaxed [&_h2]:text-ooo-cream [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_strong]:text-ooo-cream [&_em]:italic"
                    dangerouslySetInnerHTML={{ __html: lesson.description }}
                  />
                </div>
                {isLoggedIn && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => { setEditingLesson(lesson); setShowForm(false); }}
                      className="px-4 py-2 bg-ooo-ink text-ooo-cream rounded font-semibold hover:bg-ooo-ink/80 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(lesson.id)}
                      className="px-4 py-2 bg-red-900/30 text-red-300 rounded font-semibold hover:bg-red-900/50 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
