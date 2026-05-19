import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getShow } from "@/lib/shows-db";
import { CharacterSection } from "@/components/CharacterSection";
import { ShowSection } from "@/components/ShowSection";

export default async function ShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const show = await getShow(id);

  if (!show) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/"
        className="inline-block text-sm text-ooo-muted hover:text-ooo-cream transition-colors mb-8"
      >
        ← Back to home
      </Link>

      <h1 className="font-display text-4xl md:text-5xl font-bold text-ooo-cream text-center mb-3">
        {show.title}
      </h1>

      {show.startDate && show.endDate && (
        <p className="text-center text-ooo-muted mb-6">
          {new Date(show.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          {" – "}
          {new Date(show.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          {" · "}
          {Math.max(1, Math.round((new Date(show.endDate).getTime() - new Date(show.startDate).getTime()) / 86400000) + 1)} days
        </p>
      )}

      {show.linkUrl && (
        <div className="flex justify-center mb-6">
          <a
            href={show.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-ooo-accent text-ooo-black rounded-lg font-semibold hover:bg-ooo-accent/80 transition-colors"
          >
            {show.linkLabel || "Find out more"}
          </a>
        </div>
      )}

      <div className="relative aspect-[2/1] w-full rounded-lg overflow-hidden bg-ooo-slate mb-8">
        <Image
          src={show.imageUrl}
          alt={show.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      <CharacterSection showId={id} />
      <ShowSection
        showId={id}
        section="crew"
        title="Crew"
        addLabel="+ Add Crew Member"
        emptyLabel="No crew members added yet."
      />
      <ShowSection
        showId={id}
        section="team"
        title="Team"
        addLabel="+ Add Team Member"
        emptyLabel="No team members added yet."
      />
    </div>
  );
}
