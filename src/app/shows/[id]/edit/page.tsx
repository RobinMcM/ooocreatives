import { notFound } from "next/navigation";
import { getShow } from "@/lib/shows-db";
import { ShowForm } from "@/components/ShowForm";

export default async function EditShowPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ back?: string }>;
}) {
  const [{ id }, { back }] = await Promise.all([params, searchParams]);
  const show = await getShow(id);

  if (!show) notFound();

  const redirectTo = back === "my-shows" ? "/my-shows" : "/shows";
  return <ShowForm show={show} redirectTo={redirectTo} />;
}
