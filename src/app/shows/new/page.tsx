import { ShowForm } from "@/components/ShowForm";

export default async function NewShowPage({
  searchParams,
}: {
  searchParams: Promise<{ back?: string }>;
}) {
  const { back } = await searchParams;
  const redirectTo = back === "my-shows" ? "/my-shows" : "/shows";
  return <ShowForm redirectTo={redirectTo} />;
}
