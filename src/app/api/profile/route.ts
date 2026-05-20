import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getUserProfile, upsertUserProfile } from "@/lib/movieshaker-db";
import { getGlobalActor, createGlobalActor, updateGlobalActor } from "@/lib/global-actors-db";
import { uploadGlobalActorPhoto } from "@/lib/do-spaces";

export async function GET() {
  const session = await getSessionForValidation();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await getUserProfile(session.userId);
    const actorCard = profile?.actorId ? await getGlobalActor(profile.actorId) : null;
    return NextResponse.json({ profile, actorCard });
  } catch (err) {
    console.error("[profile] GET error:", err);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSessionForValidation();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    const name = (formData.get("name") as string) || null;
    const company = (formData.get("company") as string) || null;
    const communicationEmail = (formData.get("communicationEmail") as string) || null;
    const username = (formData.get("username") as string) || null;
    const phone = (formData.get("phone") as string) || null;
    const address = (formData.get("address") as string) || null;
    const showAsCreative = formData.get("showAsCreative") === "true";

    const title = (formData.get("title") as string) || undefined;
    const bio = (formData.get("bio") as string) || undefined;
    const websiteUrl = (formData.get("websiteUrl") as string) || undefined;
    const photoFile = formData.get("photo") as File | null;

    const currentProfile = await getUserProfile(session.userId);
    let actorId = currentProfile?.actorId ?? null;

    const hasCreativeContent = title || bio || websiteUrl || (photoFile && photoFile.size > 0);

    if (hasCreativeContent) {
      if (photoFile && photoFile.size > 0) {
        const buffer = Buffer.from(await photoFile.arrayBuffer());
        const photoUrl = await uploadGlobalActorPhoto(buffer, photoFile.name, photoFile.type);

        if (actorId) {
          await updateGlobalActor(actorId, {
            ...(name ? { name } : {}),
            title,
            bio,
            bioUrl: websiteUrl,
            photoUrl,
          });
        } else {
          const actor = await createGlobalActor(
            name ?? "Creative",
            photoUrl,
            bio,
            title,
            websiteUrl
          );
          actorId = actor.id;
        }
      } else if (actorId) {
        await updateGlobalActor(actorId, {
          ...(name ? { name } : {}),
          title,
          bio,
          bioUrl: websiteUrl,
        });
      }
    }

    await upsertUserProfile(session.userId, {
      name,
      company,
      communicationEmail,
      username,
      phone,
      address,
      actorId,
      showAsCreative,
    });

    const profile = await getUserProfile(session.userId);
    const actorCard = actorId ? await getGlobalActor(actorId) : null;
    return NextResponse.json({ profile, actorCard });
  } catch (err) {
    console.error("[profile] PUT error:", err);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
