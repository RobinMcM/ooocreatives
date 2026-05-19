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

interface Course {
  id: string;
  title: string;
  photoUrl: string;
  description: string;
  durationMinutes?: number;
  location?: string;
  locationUrl?: string;
}


export default function Courses() {
  const { roles, loading: rolesLoading } = useUserRoles();
  const isAdmin = !rolesLoading && roles.some((r) => ADMIN_ROLES.includes(r));

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => { setCourses(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE", headers: await authHeaders() });
      if (!res.ok) throw new Error();
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError("Failed to delete course.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-4xl font-bold text-ooo-cream">Courses</h1>
        {isAdmin && (
          <Link
            href="/courses/new"
            className="px-4 py-2 bg-ooo-accent text-ooo-black rounded-lg text-sm font-semibold hover:bg-ooo-accent/80 transition-colors shrink-0"
          >
            + New Course
          </Link>
        )}
      </div>
      <p className="text-ooo-muted mb-8">Courses and workshops to develop your craft.</p>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300">{error}</div>
      )}

      {loading && <p className="text-ooo-muted">Loading courses...</p>}

      {!loading && courses.length === 0 && (
        <div className="bg-ooo-slate border border-ooo-ink rounded-lg p-12 text-center">
          <p className="text-ooo-muted">
            {isAdmin ? "No courses yet. Create one to get started!" : "No courses yet — check back soon."}
          </p>
        </div>
      )}

      {!loading && courses.length > 0 && (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="relative bg-ooo-slate border border-ooo-ink rounded-lg overflow-hidden group hover:border-ooo-accent/50 transition-colors">
              <Link href={`/courses/${course.id}`} className="block">
                <div className="relative aspect-[16/9] bg-ooo-black">
                  <Image
                    src={course.photoUrl}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:opacity-90 transition-opacity"
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-display text-xl font-semibold text-ooo-cream group-hover:text-ooo-accent transition-colors">
                    {course.title}
                  </h2>
                  {course.durationMinutes && (
                    <p className="text-xs text-ooo-muted mt-1">{course.durationMinutes} mins</p>
                  )}
                  {course.location && (
                    <p className="text-xs text-ooo-muted mt-0.5">{course.location}</p>
                  )}
                </div>
              </Link>

              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <Link
                    href={`/courses/${course.id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg bg-ooo-black/70 hover:bg-ooo-accent text-ooo-cream transition-colors"
                    aria-label="Edit course"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6.586-6.586a2 2 0 112.828 2.828L11.828 13.828A2 2 0 0110 14.414l-3.414.586.586-3.414A2 2 0 018.172 9.828L9 11z" />
                    </svg>
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(course.id); }}
                    className="p-2 rounded-lg bg-ooo-black/70 hover:bg-red-700 text-ooo-cream transition-colors"
                    aria-label="Delete course"
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
