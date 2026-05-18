import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCarouselItem } from "@/lib/carousel-db";
import { ActorSection } from "./ActorSection";

export default async function ShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const show = await getCarouselItem(id);

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

      <h1 className="font-display text-4xl md:text-5xl font-bold text-ooo-cream text-center mb-6">
        {show.title}
      </h1>

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

      <ActorSection showId={id} />
    </div>
  );
}
