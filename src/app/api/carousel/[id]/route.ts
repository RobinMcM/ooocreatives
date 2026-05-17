import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import {
  getCarouselItem,
  updateCarouselItem,
  deleteCarouselItem,
} from "@/lib/carousel-db";
import { deleteCarouselImage, uploadCarouselImage } from "@/lib/do-spaces";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify user is authenticated
    const session = await getSessionForValidation();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const item = await getCarouselItem(id);

    if (!item) {
      return NextResponse.json(
        { error: "Carousel item not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const file = formData.get("image") as File | null;
    const orderStr = formData.get("order") as string;

    const updates: any = {};
    if (title) updates.title = title;
    if (orderStr) updates.order = parseInt(orderStr);

    // Handle image upload if a new file is provided
    if (file && file.size > 0) {
      // Delete old image from DO Spaces
      try {
        await deleteCarouselImage(item.imageUrl);
      } catch (error) {
        console.warn("Failed to delete old image:", error);
      }

      // Upload new image
      const buffer = await file.arrayBuffer();
      const imageUrl = await uploadCarouselImage(
        Buffer.from(buffer),
        file.name,
        file.type
      );
      updates.imageUrl = imageUrl;
    }

    const updated = await updateCarouselItem(id, updates);

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update carousel item" },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating carousel item:", error);
    return NextResponse.json(
      { error: "Failed to update carousel item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify user is authenticated
    const session = await getSessionForValidation();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const item = await getCarouselItem(id);

    if (!item) {
      return NextResponse.json(
        { error: "Carousel item not found" },
        { status: 404 }
      );
    }

    // Delete image from DO Spaces
    try {
      await deleteCarouselImage(item.imageUrl);
    } catch (error) {
      console.warn("Failed to delete image from DO Spaces:", error);
    }

    const deleted = await deleteCarouselItem(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Failed to delete carousel item" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting carousel item:", error);
    return NextResponse.json(
      { error: "Failed to delete carousel item" },
      { status: 500 }
    );
  }
}
