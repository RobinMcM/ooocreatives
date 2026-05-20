import { NextResponse } from "next/server";
import { getOptedInCreatives } from "@/lib/movieshaker-db";
import { getGlobalActor } from "@/lib/global-actors-db";

export async function GET() {
  try {
    const optedIn = await getOptedInCreatives();

    const creatives = (
      await Promise.all(
        optedIn.map(async (user) => {
          if (!user.actorId) return null;
          const actor = await getGlobalActor(user.actorId);
          if (!actor) return null;
          return {
            id: user.actorId,
            userId: user.userId,
            name: user.name ?? actor.name ?? null,
            title: actor.title ?? null,
            bio: actor.bio ?? null,
            photoUrl: actor.photoUrl ?? null,
            websiteUrl: actor.bioUrl ?? null,
          };
        })
      )
    ).filter(Boolean);

    return NextResponse.json(creatives);
  } catch (error) {
    console.error("Error fetching creatives:", error);
    return NextResponse.json({ error: "Failed to fetch creatives" }, { status: 500 });
  }
}
