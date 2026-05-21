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
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <div className="pt-6 mb-6">
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

      <h1 className="font-display text-4xl md:text-5xl font-bold text-ooo-cream mb-8">
        {course.title}
      </h1>

      {/* Two-column layout: image + pricing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Image */}
        <div className="relative w-full rounded-xl overflow-hidden bg-ooo-slate" style={{ aspectRatio: "1024/1792" }}>
          <Image src={course.photoUrl} alt={course.title} fill className="object-contain" priority />
        </div>

        {/* Pricing & registration */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-ooo-slate bg-ooo-ink p-6 flex flex-col gap-4">
            <h2 className="font-display text-2xl font-semibold text-ooo-cream">Pricing & Registration</h2>

            <p className="text-ooo-muted text-sm leading-relaxed">
              Online registration coming soon. To secure your place please get in touch directly.
            </p>

            {(course.duration || course.durationMinutes) && (
              <div className="flex items-center gap-2 text-sm text-ooo-muted">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{course.duration ?? `${course.durationMinutes} mins`}</span>
              </div>
            )}

            {course.location && (
              <div className="flex items-center gap-2 text-sm text-ooo-muted">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {course.locationUrl ? (
                  <a href={course.locationUrl} target="_blank" rel="noopener noreferrer" className="hover:text-ooo-cream transition-colors underline underline-offset-2">
                    {course.location}
                  </a>
                ) : (
                  <span>{course.location}</span>
                )}
              </div>
            )}

            <Link
              href={`/schedule/register?courseId=${id}`}
              className="mt-auto inline-flex items-center justify-center px-5 py-2.5 bg-ooo-accent text-ooo-black rounded-lg text-sm font-semibold hover:bg-ooo-accent/80 transition-colors"
            >
              Register Interest
            </Link>
          </div>
        </div>
      </div>

      {/* Description */}
      {course.description && (
        <div
          className="text-ooo-muted leading-relaxed [&_h2]:text-ooo-cream [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:text-ooo-cream [&_em]:italic [&_p]:mb-3"
          dangerouslySetInnerHTML={{ __html: course.description }}
        />
      )}
    </div>
  );
}
