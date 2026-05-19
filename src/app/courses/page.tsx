"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import Session from "supertokens-auth-react/recipe/session";

interface CourseTemplate {
  id: string;
  title: string;
  photoUrl: string;
  description: string;
  location?: string;
  locationUrl?: string;
}

interface CourseCard {
  id: string;
  courseId: string;
  title: string;
  photoUrl: string;
  description: string;
  location?: string;
  locationUrl?: string;
  date?: string;
  time?: string;
  durationMinutes?: number;
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await Session.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Minimal rich-text editor ──────────────────────────────────────────────────

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

// ── Create Course form (template) ─────────────────────────────────────────────

function CreateCourseForm({
  template,
  onSave,
  onCancel,
}: {
  template?: CourseTemplate;
  onSave: (t: CourseTemplate) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(template?.title ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [description, setDescription] = useState(template?.description ?? "");
  const [location, setLocation] = useState(template?.location ?? "");
  const [locationUrl, setLocationUrl] = useState(template?.locationUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) { setError("Title is required"); return; }
    if (!template && !photo) { setError("Photo is required"); return; }

    setSaving(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("description", description);
      form.append("location", location);
      form.append("locationUrl", locationUrl);
      if (photo) form.append("photo", photo);

      const url = template ? `/api/training/templates/${template.id}` : "/api/training/templates";
      const method = template ? "PUT" : "POST";
      const res = await fetch(url, { method, body: form, headers: await authHeaders() });
      if (!res.ok) throw new Error();
      onSave(await res.json());
    } catch {
      setError("Failed to save course. Please try again.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-ooo-slate border border-ooo-ink rounded-lg mb-8">
      <h2 className="font-display text-2xl font-bold text-ooo-cream mb-4">
        {template ? "Edit Course" : "Create Course"}
      </h2>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="mb-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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

      <div className="mb-4">
        <label className="block text-ooo-muted text-sm font-medium mb-2">
          Photo {!template && <span className="text-red-400">*</span>}
          {template && <span className="text-ooo-muted/50 font-normal"> (leave blank to keep current)</span>}
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
        <RichTextEditor initialValue={template?.description ?? ""} onChange={setDescription} />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-ooo-accent text-ooo-black rounded-lg font-semibold hover:bg-ooo-accent/80 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : template ? "Update Course" : "Create Course"}
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-2 bg-ooo-ink text-ooo-cream rounded-lg font-semibold hover:bg-ooo-ink/80 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Add Course form (instance) ────────────────────────────────────────────────

function AddCourseForm({
  templates,
  instance,
  onSave,
  onCancel,
}: {
  templates: CourseTemplate[];
  instance?: CourseCard;
  onSave: (card: CourseCard) => void;
  onCancel: () => void;
}) {
  const [courseId, setCourseId] = useState(instance?.courseId ?? "");
  const [date, setDate] = useState(instance?.date ?? "");
  const [time, setTime] = useState(instance?.time ?? "");
  const [durationMinutes, setDurationMinutes] = useState(instance?.durationMinutes?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) { setError("Please select a course"); return; }

    setSaving(true);
    setError(null);
    try {
      const body = { courseId, date: date || undefined, time: time || undefined, durationMinutes: durationMinutes ? Number(durationMinutes) : undefined };

      const url = instance ? `/api/training/${instance.id}` : "/api/training";
      const method = instance ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        body: JSON.stringify(instance ? { date: body.date, time: body.time, durationMinutes: body.durationMinutes } : body),
        headers: { ...(await authHeaders()), "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();

      const saved = await res.json();
      const template = templates.find((t) => t.id === (instance ? instance.courseId : courseId))!;
      onSave({ ...template, ...saved, id: saved.id, courseId: instance ? instance.courseId : courseId });
    } catch {
      setError("Failed to save. Please try again.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-ooo-slate border border-ooo-ink rounded-lg mb-8">
      <h2 className="font-display text-2xl font-bold text-ooo-cream mb-4">
        {instance ? "Edit Schedule" : "Add Course"}
      </h2>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {!instance && (
        <div className="mb-4">
          <label className="block text-ooo-muted text-sm font-medium mb-2">Course</label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream focus:outline-none focus:border-ooo-accent"
            required
          >
            <option value="">Select a course…</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-ooo-muted text-sm font-medium mb-2">Date <span className="text-ooo-muted/50 font-normal">(optional)</span></label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream focus:outline-none focus:border-ooo-accent"
          />
        </div>
        <div>
          <label className="block text-ooo-muted text-sm font-medium mb-2">Time <span className="text-ooo-muted/50 font-normal">(optional)</span></label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream focus:outline-none focus:border-ooo-accent"
          />
        </div>
        <div>
          <label className="block text-ooo-muted text-sm font-medium mb-2">Duration <span className="text-ooo-muted/50 font-normal">(minutes)</span></label>
          <input
            type="number"
            min="1"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            placeholder="e.g. 90"
            className="w-full px-4 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream placeholder-ooo-muted focus:outline-none focus:border-ooo-accent"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-ooo-accent text-ooo-black rounded-lg font-semibold hover:bg-ooo-accent/80 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : instance ? "Update Schedule" : "Add Course"}
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-2 bg-ooo-ink text-ooo-cream rounded-lg font-semibold hover:bg-ooo-ink/80 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Courses() {
  const session = useSessionContext();
  const isLoggedIn = !session.loading && session.doesSessionExist;

  const [cards, setCards] = useState<CourseCard[]>([]);
  const [templates, setTemplates] = useState<CourseTemplate[]>([]);
  const [mode, setMode] = useState<"idle" | "create" | "add" | "editSchedule" | "editCourse">("idle");
  const [editingCard, setEditingCard] = useState<CourseCard | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<CourseTemplate | null>(null);

  useEffect(() => {
    fetch("/api/training").then((r) => r.json()).then(setCards).catch(() => {});
    fetch("/api/training/templates").then((r) => r.json()).then(setTemplates).catch(() => {});
  }, []);

  const handleTemplateSaved = (t: CourseTemplate) => {
    setTemplates((prev) => {
      const idx = prev.findIndex((x) => x.id === t.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = t; return next; }
      return [...prev, t];
    });
    // If editing a template, update all cards that use it
    if (editingTemplate) {
      setCards((prev) => prev.map((c) => c.courseId === t.id ? { ...c, ...t, id: c.id, courseId: c.courseId } : c));
    }
    setMode("idle");
    setEditingTemplate(null);
  };

  const handleCardSaved = (card: CourseCard) => {
    setCards((prev) => {
      const idx = prev.findIndex((c) => c.id === card.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = card; return next; }
      return [...prev, card];
    });
    setMode("idle");
    setEditingCard(null);
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm("Remove this scheduled course?")) return;
    const res = await fetch(`/api/training/${id}`, { method: "DELETE", headers: await authHeaders() });
    if (res.ok) setCards((prev) => prev.filter((c) => c.id !== id));
  };

  const cancel = () => { setMode("idle"); setEditingCard(null); setEditingTemplate(null); };

  const showButtons = isLoggedIn && mode === "idle";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-ooo-cream">Courses</h1>
          <p className="text-ooo-muted mt-2">Courses and workshops to develop your craft.</p>
        </div>
        {showButtons && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setMode("create")}
              className="px-4 py-2 bg-ooo-ink border border-ooo-slate text-ooo-cream rounded-lg text-sm font-semibold hover:bg-ooo-slate transition-colors"
            >
              Create Course
            </button>
            <button
              onClick={() => setMode("add")}
              disabled={templates.length === 0}
              className="px-4 py-2 bg-ooo-accent text-ooo-black rounded-lg text-sm font-semibold hover:bg-ooo-accent/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title={templates.length === 0 ? "Create a course template first" : undefined}
            >
              Add Course
            </button>
          </div>
        )}
      </div>

      {mode === "create" && (
        <CreateCourseForm onSave={handleTemplateSaved} onCancel={cancel} />
      )}
      {mode === "editCourse" && editingTemplate && (
        <CreateCourseForm template={editingTemplate} onSave={handleTemplateSaved} onCancel={cancel} />
      )}
      {mode === "add" && (
        <AddCourseForm templates={templates} onSave={handleCardSaved} onCancel={cancel} />
      )}
      {mode === "editSchedule" && editingCard && (
        <AddCourseForm templates={templates} instance={editingCard} onSave={handleCardSaved} onCancel={cancel} />
      )}

      {cards.length === 0 && mode === "idle" && (
        <div className="bg-ooo-slate border border-ooo-ink rounded-lg p-12 text-center">
          <p className="text-ooo-muted">
            {isLoggedIn ? "No courses scheduled yet. Create a course template then use Add Course." : "No courses yet — check back soon."}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-8">
        {cards.map((card) => (
          <div key={card.id} className="bg-ooo-slate border border-ooo-ink rounded-lg overflow-hidden">
            <div className="md:flex">
              <div className="relative aspect-square md:w-56 md:shrink-0 bg-ooo-black">
                <Image src={card.photoUrl} alt={card.title} fill className="object-cover" />
              </div>
              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <h2 className="font-display text-2xl font-bold text-ooo-cream mb-2">{card.title}</h2>
                  {(card.date || card.time || card.durationMinutes) && (
                    <p className="text-sm text-ooo-accent mb-1 flex flex-wrap gap-x-3 gap-y-1">
                      {card.date && <span>{new Date(card.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>}
                      {card.time && <span>{card.time}</span>}
                      {card.durationMinutes && <span>{card.durationMinutes} mins</span>}
                    </p>
                  )}
                  {card.location && (
                    <p className="text-sm text-ooo-muted mb-3">
                      {card.locationUrl ? (
                        <a href={card.locationUrl} target="_blank" rel="noopener noreferrer" className="hover:text-ooo-cream transition-colors underline underline-offset-2">
                          {card.location}
                        </a>
                      ) : card.location}
                    </p>
                  )}
                  <div
                    className="text-ooo-muted text-sm leading-relaxed [&_h2]:text-ooo-cream [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_strong]:text-ooo-cream [&_em]:italic"
                    dangerouslySetInnerHTML={{ __html: card.description }}
                  />
                </div>
                {isLoggedIn && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      onClick={() => { setEditingCard(card); setMode("editSchedule"); }}
                      className="px-4 py-2 bg-ooo-ink text-ooo-cream rounded font-semibold hover:bg-ooo-ink/80 transition-colors text-sm"
                    >
                      Edit Schedule
                    </button>
                    <button
                      onClick={() => {
                        const t = templates.find((x) => x.id === card.courseId);
                        if (t) { setEditingTemplate(t); setMode("editCourse"); }
                      }}
                      className="px-4 py-2 bg-ooo-ink text-ooo-cream rounded font-semibold hover:bg-ooo-ink/80 transition-colors text-sm"
                    >
                      Edit Course
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
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
