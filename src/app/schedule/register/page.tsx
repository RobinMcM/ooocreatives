import Image from "next/image";
import Link from "next/link";
import { getCourseTemplate } from "@/lib/course-templates-db";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string; date?: string; time?: string }>;
}) {
  const { courseId, date, time } = await searchParams;
  const course = courseId ? await getCourseTemplate(courseId) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-ooo-cream mb-2">Registration</h1>
      <p className="text-ooo-muted mb-8">Secure your place on a course.</p>

      {course && (
        <div className="max-w-sm mb-10">
          <div className="bg-ooo-slate border border-ooo-ink rounded-lg overflow-hidden">
            <Link href={`/schedule/courses/${course.id}`} className="block">
              <div className="relative aspect-[16/9] bg-ooo-black">
                <Image
                  src={course.photoUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </Link>
            <div className="p-4">
              <Link href={`/schedule/courses/${course.id}`}>
                <h2 className="font-display text-xl font-semibold text-ooo-cream hover:text-ooo-accent transition-colors">
                  {course.title}
                </h2>
              </Link>
              {(date || time) && (
                <p className="text-xs text-ooo-accent mt-1 flex gap-3">
                  {date && <span>{formatDate(date)}</span>}
                  {time && <span>{time}</span>}
                </p>
              )}
              {(course.duration || course.durationMinutes) && (
                <p className="text-xs text-ooo-muted mt-0.5">{course.duration ?? `${course.durationMinutes} mins`}</p>
              )}
              {course.location && (
                <p className="text-xs text-ooo-muted mt-0.5">{course.location}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-ooo-slate border border-ooo-ink rounded-xl p-10 max-w-md flex flex-col items-center text-center">
        <svg className="w-10 h-10 text-ooo-accent mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-ooo-muted text-lg">This will be activated soon.</p>
      </div>
    </div>
  );
}
