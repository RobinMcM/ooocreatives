import { notFound } from "next/navigation";
import { getShow } from "@/lib/shows-db";
import { ShowForm } from "@/components/ShowForm";

export default async function EditShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const show = await getShow(id);

  if (!show) notFound();

  return <ShowForm show={show} />;
}
