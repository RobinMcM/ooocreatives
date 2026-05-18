import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import {
  getCarouselItems,
  createCarouselItem,
} from "@/lib/carousel-db";
import { uploadCarouselImage } from "@/lib/do-spaces";

export async function GET() {
  try {
    const items = await getCarouselItems();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching carousel items:", error);
    return NextResponse.json(
      { error: "Failed to fetch carousel items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[POST /api/carousel] incoming Authorization header:", request.headers.get("Authorization") ?? "missing");
    // Verify user is authenticated
    const session = await getSessionForValidation();
    console.log("[POST /api/carousel] session result:", session ? "valid" : "null → 401");
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
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

    // Upload image to DO Spaces
    const buffer = await file.arrayBuffer();
    const imageUrl = await uploadCarouselImage(
      Buffer.from(buffer),
      file.name,
      file.type
    );

    // Create carousel item
    const item = await createCarouselItem(title, imageUrl, linkUrl, linkLabel);

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating carousel item:", error);
    return NextResponse.json(
      { error: "Failed to create carousel item" },
      { status: 500 }
    );
  }
}
