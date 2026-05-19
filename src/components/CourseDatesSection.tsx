"use client";

import { useState, useEffect } from "react";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import Session from "supertokens-auth-react/recipe/session";

interface CourseInstance {
  id: string;
  courseId: string;
  date?: string;
  time?: string;
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await Session.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function CourseDatesSection({ courseId }: { courseId: string }) {
  const session = useSessionContext();
  const isLoggedIn = !session.loading && session.doesSessionExist;

  const [instances, setInstances] = useState<CourseInstance[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/courses/${courseId}/dates`)
      .then((r) => r.json())
      .then(setInstances)
      .catch(() => {});
  }, [courseId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date && !time) { setError("Enter at least a date or time"); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/courses/${courseId}/dates`, {
        method: "POST",
        body: JSON.stringify({ date: date || undefined, time: time || undefined }),
        headers: { ...(await authHeaders()), "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setInstances((prev) => [...prev, created]);
      setDate("");
      setTime("");
      setShowForm(false);
    } catch {
      setError("Failed to add date.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (instanceId: string) => {
    if (!confirm("Remove this date?")) return;
    try {
      const res = await fetch(`/api/courses/${courseId}/dates`, {
        method: "DELETE",
        body: JSON.stringify({ instanceId }),
        headers: { ...(await authHeaders()), "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      setInstances((prev) => prev.filter((i) => i.id !== instanceId));
    } catch {
      setError("Failed to remove date.");
    }
  };

  if (!isLoggedIn && instances.length === 0) return null;

  return (
    <div className="mt-8 border-t border-ooo-slate pt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold text-ooo-cream">Dates</h2>
        {isLoggedIn && !showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-ooo-accent text-ooo-black hover:bg-ooo-accent/80 transition-colors font-bold text-lg leading-none"
            aria-label="Add date"
          >
            +
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 mb-6 p-4 bg-ooo-slate rounded-lg">
          <div>
            <label className="block text-ooo-muted text-xs font-medium mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream focus:outline-none focus:border-ooo-accent text-sm"
            />
          </div>
          <div>
            <label className="block text-ooo-muted text-xs font-medium mb-1">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="px-3 py-2 bg-ooo-black border border-ooo-ink rounded-lg text-ooo-cream focus:outline-none focus:border-ooo-accent text-sm"
            />
          </div>
          {error && <p className="text-red-400 text-xs w-full">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-ooo-accent text-ooo-black rounded-lg text-sm font-semibold hover:bg-ooo-accent/80 transition-colors disabled:opacity-50"
            >
              {saving ? "Adding…" : "Add"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(null); setDate(""); setTime(""); }}
              className="px-4 py-2 bg-ooo-ink text-ooo-cream rounded-lg text-sm font-semibold hover:bg-ooo-ink/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {instances.length === 0 && !showForm && (
        <p className="text-ooo-muted text-sm">No dates scheduled yet.</p>
      )}

      {instances.length > 0 && (
        <ul className="flex flex-col gap-2">
          {instances.map((inst) => (
            <li key={inst.id} className="flex items-center justify-between px-4 py-3 bg-ooo-slate rounded-lg">
              <span className="text-ooo-cream text-sm flex gap-4">
                {inst.date && (
                  <span>{new Date(inst.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</span>
                )}
                {inst.time && <span>{inst.time}</span>}
              </span>
              {isLoggedIn && (
                <button
                  type="button"
                  onClick={() => handleDelete(inst.id)}
                  className="p-1.5 rounded bg-ooo-black/50 hover:bg-red-700 text-ooo-cream transition-colors"
                  aria-label="Remove date"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M4 7h16" />
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
