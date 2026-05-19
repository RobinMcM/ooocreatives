import Image from "next/image";
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
      <div className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-1 mb-6 pt-8">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-ooo-cream text-center">
          {course.title}
        </h1>
        {(course.date || course.time || course.durationMinutes) && (
          <p className="text-ooo-muted flex flex-wrap gap-x-3">
            {course.date && (
              <span>{new Date(course.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
            )}
            {course.time && <span>{course.time}</span>}
            {course.durationMinutes && <span>{course.durationMinutes} mins</span>}
          </p>
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
