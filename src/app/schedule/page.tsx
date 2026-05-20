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

interface ScheduleCard {
  id: string;
  courseId: string;
  title: string;
  photoUrl: string;
  date?: string;
  time?: string;
  durationMinutes?: number;
  location?: string;
}

interface CourseTemplate {
  id: string;
  title: string;
  photoUrl: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}

function AddScheduleForm({
  templates,
  onSave,
  onCancel,
}: {
  templates: CourseTemplate[];
  onSave: (card: ScheduleCard) => void;
  onCancel: () => void;
}) {
  const [courseId, setCourseId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) { setError("Please select a course"); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/courses/${courseId}/dates`, {
        method: "POST",
        body: JSON.stringify({ date: date || undefined, time: time || undefined }),
        headers: { ...(await authHeaders()), "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      const instance = await res.json();
      const template = templates.find((t) => t.id === courseId)!;
      onSave({ ...instance, courseId, title: template.title, photoUrl: template.photoUrl });
    } catch {
      setError("Failed to schedule course.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-ooo-slate border border-ooo-ink rounded-lg mb-8">
      <h2 className="font-display text-2xl font-bold text-ooo-cream mb-4">Schedule a Course</h2>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-ooo-accent text-ooo-black rounded-lg font-semibold hover:bg-ooo-accent/80 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Add to Schedule"}
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

export default function SchedulePage() {
  const { roles, loading: rolesLoading } = useUserRoles();
  const isAdmin = !rolesLoading && roles.some((r) => ADMIN_ROLES.includes(r));

  const [cards, setCards] = useState<ScheduleCard[]>([]);
  const [templates, setTemplates] = useState<CourseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/training").then((r) => r.json()),
      fetch("/api/training/templates").then((r) => r.json()),
    ])
      .then(([instances, tmps]) => { setCards(instances); setTemplates(tmps); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (card: ScheduleCard) => {
    if (!confirm("Remove this from the schedule?")) return;
    try {
      const res = await fetch(`/api/courses/${card.courseId}/dates`, {
        method: "DELETE",
        body: JSON.stringify({ instanceId: card.id }),
        headers: { ...(await authHeaders()), "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      setCards((prev) => prev.filter((c) => c.id !== card.id));
    } catch {
      setError("Failed to remove from schedule.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-4xl font-bold text-ooo-cream">Schedule</h1>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/schedule/courses"
            className="flex items-center gap-2 px-4 py-2 bg-ooo-ink border border-ooo-slate text-ooo-cream rounded-lg text-sm font-semibold hover:bg-ooo-slate transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            Our Classes
          </Link>
          {isAdmin && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              disabled={templates.length === 0}
              className="px-4 py-2 bg-ooo-accent text-ooo-black rounded-lg text-sm font-semibold hover:bg-ooo-accent/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title={templates.length === 0 ? "Create a course first" : undefined}
            >
              + Schedule Course
            </button>
          )}
        </div>
      </div>
      <p className="text-ooo-muted mb-8">Upcoming courses and workshops.</p>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300">{error}</div>
      )}

      {showForm && (
        <AddScheduleForm
          templates={templates}
          onSave={(card) => { setCards((prev) => [...prev, card]); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading && <p className="text-ooo-muted">Loading schedule...</p>}

      {!loading && cards.length === 0 && !showForm && (
        <div className="bg-ooo-slate border border-ooo-ink rounded-lg p-12 text-center">
          <p className="text-ooo-muted">
            {isAdmin ? "Nothing scheduled yet. Use the button above to add a course." : "Nothing scheduled yet — check back soon."}
          </p>
        </div>
      )}

      {!loading && cards.length > 0 && (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.id} className="relative bg-ooo-slate border border-ooo-ink rounded-lg overflow-hidden group hover:border-ooo-accent/50 transition-colors">
              <Link href={`/schedule/courses/${card.courseId}`} className="block">
                <div className="relative aspect-[16/9] bg-ooo-black">
                  <Image
                    src={card.photoUrl}
                    alt={card.title}
                    fill
                    className="object-cover group-hover:opacity-90 transition-opacity"
                  />
                </div>
              </Link>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/schedule/courses/${card.courseId}`}>
                    <h2 className="font-display text-xl font-semibold text-ooo-cream hover:text-ooo-accent transition-colors">
                      {card.title}
                    </h2>
                  </Link>
                  <Link
                    href={`/schedule/register?courseId=${card.courseId}${card.date ? `&date=${card.date}` : ""}${card.time ? `&time=${encodeURIComponent(card.time)}` : ""}`}
                    className="shrink-0 px-3 py-1 bg-ooo-accent text-ooo-black rounded-md text-xs font-semibold hover:bg-ooo-accent/80 transition-colors"
                  >
                    Register
                  </Link>
                </div>
                {(card.date || card.time) && (
                  <p className="text-xs text-ooo-accent mt-1 flex gap-3">
                    {card.date && <span>{formatDate(card.date)}</span>}
                    {card.time && <span>{card.time}</span>}
                  </p>
                )}
                {card.durationMinutes && (
                  <p className="text-xs text-ooo-muted mt-0.5">{card.durationMinutes} mins</p>
                )}
                {card.location && (
                  <p className="text-xs text-ooo-muted mt-0.5">{card.location}</p>
                )}
              </div>

              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(card); }}
                    className="p-2 rounded-lg bg-ooo-black/70 hover:bg-red-700 text-ooo-cream transition-colors"
                    aria-label="Remove from schedule"
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
