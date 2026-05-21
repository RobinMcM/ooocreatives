import { NextRequest, NextResponse } from "next/server";
import { getOptedInCreatives, getUserRole } from "@/lib/movieshaker-db";
import { getGlobalActor, createGlobalActor } from "@/lib/global-actors-db";
import { uploadGlobalActorPhoto } from "@/lib/do-spaces";
import { getSessionForValidation } from "@/lib/supertokens/server";

const ADMIN_ROLES = ["admin", "super_user", "super user", "Admin", "Super User"];

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

export async function POST(request: NextRequest) {
  const session = await getSessionForValidation();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getUserRole(session.userId);
  if (!role || !ADMIN_ROLES.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const name = (formData.get("name") as string)?.trim();
    const photoFile = formData.get("photo") as File | null;
    const title = (formData.get("title") as string)?.trim() || undefined;
    const bio = (formData.get("bio") as string)?.trim() || undefined;
    const bioUrl = (formData.get("bioUrl") as string)?.trim() || undefined;

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!photoFile || photoFile.size === 0) return NextResponse.json({ error: "Photo is required" }, { status: 400 });

    const buffer = Buffer.from(await photoFile.arrayBuffer());
    const photoUrl = await uploadGlobalActorPhoto(buffer, photoFile.name, photoFile.type);
    const actor = await createGlobalActor(name, photoUrl, bio, title, bioUrl);

    return NextResponse.json({ id: actor.id, name: actor.name, photoUrl: actor.photoUrl, bio: actor.bio, title: actor.title });
  } catch (error) {
    console.error("Error creating actor:", error);
    return NextResponse.json({ error: "Failed to create actor" }, { status: 500 });
  }
}
