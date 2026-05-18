import Link from "next/link";
import Image from "next/image";
import { getCarouselItems } from "@/lib/carousel-db";

export default async function OurShows() {
  const shows = await getCarouselItems();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-ooo-cream mb-2">Our Shows</h1>
      <p className="text-ooo-muted mb-12">
        Dark humour, sharp writing, and the kind of catharsis only theatre can provide.
      </p>

      {shows.length === 0 ? (
        <div className="bg-ooo-slate border border-ooo-ink rounded-lg p-12 text-center">
          <p className="text-ooo-muted">No shows yet — check back soon.</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {shows.map((show) => (
            <Link
              key={show.id}
              href={`/shows/${show.id}`}
              className="bg-ooo-slate border border-ooo-ink rounded-lg overflow-hidden hover:border-ooo-accent/50 transition-colors group"
            >
              <div className="relative aspect-[16/9] bg-ooo-black">
                <Image
                  src={show.imageUrl}
                  alt={show.title}
                  fill
                  className="object-cover group-hover:opacity-90 transition-opacity"
                />
              </div>
              <div className="p-6">
                <h2 className="font-display text-xl font-semibold text-ooo-cream group-hover:text-ooo-accent transition-colors">
                  {show.title}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
