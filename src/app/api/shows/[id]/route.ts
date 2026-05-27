import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getUserRole } from "@/lib/movieshaker-db";
import { getShow, updateShow, deleteShow } from "@/lib/shows-db";
import { deleteShowImage, uploadShowImage } from "@/lib/do-spaces";

const ADMIN_ROLES = ["admin", "Admin"];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionForValidation();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const item = await getShow(id);

    if (!item) {
      return NextResponse.json({ error: "Show not found" }, { status: 404 });
    }

    const role = await getUserRole(session.userId);
    const isAdmin = ADMIN_ROLES.includes(role ?? "");
    const isSuperUser = role === "Super User";
    const isCreative = role === "Creative";
    const isOwner = item.createdByUserId === session.userId;
    // Legacy shows (no createdByUserId) are manageable by any privileged role
    const canManage = !item.createdByUserId
      ? (isAdmin || isSuperUser || isCreative)
      : (isAdmin || isSuperUser || isOwner);
    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const file = formData.get("image") as File | null;
    const orderStr = formData.get("order") as string;
    const linkUrl = formData.get("linkUrl") as string | null;
    const linkLabel = formData.get("linkLabel") as string | null;
    const featuredOnHomepageStr = formData.get("featuredOnHomepage") as string | null;
    const startDate = formData.get("startDate") as string | null;
    const endDate = formData.get("endDate") as string | null;
    const publishedToOurShowsStr = formData.get("publishedToOurShows") as string | null;

    const updates: any = {};
    if (title) updates.title = title;
    if (orderStr) updates.order = parseInt(orderStr);
    if (linkUrl !== null) updates.linkUrl = linkUrl || undefined;
    if (linkLabel !== null) updates.linkLabel = linkLabel || undefined;
    if (featuredOnHomepageStr !== null) updates.featuredOnHomepage = featuredOnHomepageStr === "true";
    if (startDate !== null) updates.startDate = startDate || undefined;
    if (endDate !== null) updates.endDate = endDate || undefined;
    if (publishedToOurShowsStr !== null) updates.publishedToOurShows = publishedToOurShowsStr === "true";

    if (file && file.size > 0) {
      try {
        await deleteShowImage(item.imageUrl);
      } catch (error) {
        console.warn("Failed to delete old image:", error);
      }

      const buffer = await file.arrayBuffer();
      const imageUrl = await uploadShowImage(Buffer.from(buffer), file.name, file.type);
      updates.imageUrl = imageUrl;
    }

    const updated = await updateShow(id, updates);

    if (!updated) {
      return NextResponse.json({ error: "Failed to update show" }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating show:", error);
    return NextResponse.json({ error: "Failed to update show" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionForValidation();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const item = await getShow(id);

    if (!item) {
      return NextResponse.json({ error: "Show not found" }, { status: 404 });
    }

    const role = await getUserRole(session.userId);
    const isAdmin = ADMIN_ROLES.includes(role ?? "");
    const isSuperUser = role === "Super User";
    const isCreative = role === "Creative";
    const isOwner = item.createdByUserId === session.userId;
    // Legacy shows (no createdByUserId) are manageable by any privileged role
    const canManage = !item.createdByUserId
      ? (isAdmin || isSuperUser || isCreative)
      : (isAdmin || isSuperUser || isOwner);
    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      await deleteShowImage(item.imageUrl);
    } catch (error) {
      console.warn("Failed to delete image from DO Spaces:", error);
    }

    const deleted = await deleteShow(id);

    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete show" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting show:", error);
    return NextResponse.json({ error: "Failed to delete show" }, { status: 500 });
  }
}
