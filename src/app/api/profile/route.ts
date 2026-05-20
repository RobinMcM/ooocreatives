import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getUserProfile, upsertUserProfile } from "@/lib/movieshaker-db";
import { getGlobalActors, updateGlobalActor } from "@/lib/global-actors-db";

export async function GET() {
  const session = await getSessionForValidation();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [profile, actors] = await Promise.all([
      getUserProfile(session.userId),
      getGlobalActors(),
    ]);

    return NextResponse.json({ profile, actors });
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
    const body = await request.json();
    const { name, company, communicationEmail, username, phone, address, actorId, bio, websiteUrl, showAsCreative } = body;

    await upsertUserProfile(session.userId, {
      name: name ?? null,
      company: company ?? null,
      communicationEmail: communicationEmail ?? null,
      username: username ?? null,
      phone: phone ?? null,
      address: address ?? null,
      actorId: actorId ?? null,
      showAsCreative: showAsCreative === true,
    });

    if (actorId) {
      await updateGlobalActor(actorId, {
        ...(name ? { name } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(websiteUrl !== undefined ? { bioUrl: websiteUrl } : {}),
      });
    }

    const profile = await getUserProfile(session.userId);
    return NextResponse.json({ profile });
  } catch (err) {
    console.error("[profile] PUT error:", err);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
