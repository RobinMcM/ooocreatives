import { notFound } from "next/navigation";
import { getCourseTemplate } from "@/lib/course-templates-db";
import { CourseForm } from "@/components/CourseForm";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourseTemplate(id);

  if (!course) notFound();

  return <CourseForm course={course} />;
}
