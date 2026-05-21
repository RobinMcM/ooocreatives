import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseTemplate } from "@/lib/course-templates-db";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourseTemplate(id);

  if (!course) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 pb-12">
      <div className="pt-6 mb-2">
        <Link
          href="/schedule/courses"
          className="inline-flex items-center gap-1.5 text-sm text-ooo-muted hover:text-ooo-cream transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Courses
        </Link>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 mb-6 pt-8">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-ooo-cream text-center">
          {course.title}
        </h1>
        <Link
          href={`/schedule/register?courseId=${id}`}
          className="px-4 py-2 bg-ooo-accent text-ooo-black rounded-lg text-sm font-semibold hover:bg-ooo-accent/80 transition-colors"
        >
          Register
        </Link>
        {(course.duration || course.durationMinutes) && (
          <p className="text-ooo-muted">{course.duration ?? `${course.durationMinutes} mins`}</p>
        )}
      </div>

      {course.location && (
        <p className="text-center text-ooo-muted mb-6">
          {course.locationUrl ? (
            <a href={course.locationUrl} target="_blank" rel="noopener noreferrer" className="hover:text-ooo-cream transition-colors underline underline-offset-2">
              {course.location}
            </a>
          ) : course.location}
        </p>
      )}

      <div className="relative aspect-[2/1] w-full rounded-lg overflow-hidden bg-ooo-slate mb-8">
        <Image src={course.photoUrl} alt={course.title} fill className="object-cover" priority />
      </div>

      {course.description && (
        <div
          className="text-ooo-muted leading-relaxed [&_h2]:text-ooo-cream [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:text-ooo-cream [&_em]:italic [&_p]:mb-3"
          dangerouslySetInnerHTML={{ __html: course.description }}
        />
      )}
    </div>
  );
}
