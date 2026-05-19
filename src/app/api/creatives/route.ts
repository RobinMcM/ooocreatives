import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getGlobalActors, createGlobalActor } from "@/lib/global-actors-db";
import { uploadGlobalActorPhoto } from "@/lib/do-spaces";

export async function GET() {
  try {
    const creatives = await getGlobalActors();
    return NextResponse.json(creatives);
  } catch (error) {
    console.error("Error fetching creatives:", error);
    return NextResponse.json({ error: "Failed to fetch creatives" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSessionForValidation();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const file = formData.get("photo") as File;
    const bio = (formData.get("bio") as string) || undefined;

    if (!name || !file) {
      return NextResponse.json({ error: "Name and photo are required" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const photoUrl = await uploadGlobalActorPhoto(Buffer.from(buffer), file.name, file.type);
    const creative = await createGlobalActor(name, photoUrl, bio);

    return NextResponse.json(creative, { status: 201 });
  } catch (error) {
    console.error("Error creating creative:", error);
    return NextResponse.json({ error: "Failed to create creative" }, { status: 500 });
  }
}
