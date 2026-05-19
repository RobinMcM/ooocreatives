import Image from "next/image";
import { getAllActors } from "@/lib/actors-db";

export default async function ActorsPage() {
  const actors = await getAllActors();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-ooo-cream mb-2">Actors</h1>
      <p className="text-ooo-muted mb-8">The talent behind our shows.</p>

      {actors.length === 0 && (
        <div className="bg-ooo-slate border border-ooo-ink rounded-lg p-12 text-center">
          <p className="text-ooo-muted">No actors yet — check back soon.</p>
        </div>
      )}

      {actors.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {actors.map((actor) => (
            <div key={actor.id}>
              {actor.characterName && (
                <p className="font-display text-sm font-semibold text-ooo-accent mb-1 truncate">
                  {actor.characterName}
                </p>
              )}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-ooo-slate mb-2">
                <Image
                  src={actor.photoUrl}
                  alt={actor.name}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm font-medium text-ooo-cream">{actor.name}</p>
              {actor.bio && (
                <p className="text-xs text-ooo-muted mt-1 line-clamp-3">{actor.bio}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
