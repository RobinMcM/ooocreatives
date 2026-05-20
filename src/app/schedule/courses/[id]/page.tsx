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
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 mb-6 pt-8">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-ooo-cream text-center">
          {course.title}
        </h1>
        <Link
          href="/schedule/register"
          className="px-4 py-2 bg-ooo-accent text-ooo-black rounded-lg text-sm font-semibold hover:bg-ooo-accent/80 transition-colors"
        >
          Register
        </Link>
        {course.durationMinutes && (
          <p className="text-ooo-muted">{course.durationMinutes} mins</p>
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
