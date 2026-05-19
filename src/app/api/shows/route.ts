import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getShows, createShow } from "@/lib/shows-db";
import { uploadShowImage } from "@/lib/do-spaces";

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
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const file = formData.get("image") as File;
    const linkUrl = (formData.get("linkUrl") as string) || undefined;
    const linkLabel = (formData.get("linkLabel") as string) || undefined;

    if (!title || !file) {
      return NextResponse.json(
        { error: "Title and image are required" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const imageUrl = await uploadShowImage(Buffer.from(buffer), file.name, file.type);
    const item = await createShow(title, imageUrl, linkUrl, linkLabel);

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating show:", error);
    return NextResponse.json({ error: "Failed to create show" }, { status: 500 });
  }
}
