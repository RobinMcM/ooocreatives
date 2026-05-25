import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getUserRole } from "@/lib/movieshaker-db";
import { getShows, createShow } from "@/lib/shows-db";
import { getUserProfile } from "@/lib/movieshaker-db";
import { uploadShowImage } from "@/lib/do-spaces";

const ALLOWED_CREATE_ROLES = ["Creative", "admin", "Admin"];

export async function GET() {
  try {
    const items = await getShows();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching shows:", error);
    return NextResponse.json(
      { error: "Failed to fetch shows" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[POST /api/shows] incoming Authorization header:", request.headers.get("Authorization") ?? "missing");
    const session = await getSessionForValidation();
    console.log("[POST /api/shows] session result:", session ? "valid" : "null → 401");
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(session.userId);
    if (!role || !ALLOWED_CREATE_ROLES.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const file = formData.get("image") as File;
    const linkUrl = (formData.get("linkUrl") as string) || undefined;
    const linkLabel = (formData.get("linkLabel") as string) || undefined;
    const featuredOnHomepage = formData.get("featuredOnHomepage") === "true";
    const startDate = (formData.get("startDate") as string) || undefined;
    const endDate = (formData.get("endDate") as string) || undefined;
    const publishedToOurShows = formData.get("publishedToOurShows") !== "false";

    if (!title || !file) {
      return NextResponse.json(
        { error: "Title and image are required" },
        { status: 400 }
      );
    }

    const profile = await getUserProfile(session.userId);
    const creatorName = profile?.name ?? undefined;

    const buffer = await file.arrayBuffer();
    const imageUrl = await uploadShowImage(Buffer.from(buffer), file.name, file.type);
    const item = await createShow(title, imageUrl, session.userId, featuredOnHomepage, linkUrl, linkLabel, startDate, endDate, publishedToOurShows, creatorName);

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating show:", error);
    return NextResponse.json({ error: "Failed to create show" }, { status: 500 });
  }
}
