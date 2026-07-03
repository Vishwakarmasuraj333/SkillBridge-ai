import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { title, content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content cannot be empty." }, { status: 400 });
    }

    const coverLetter = await db.coverLetter.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!coverLetter) {
      return NextResponse.json({ error: "Cover letter not found." }, { status: 404 });
    }

    const updated = await db.coverLetter.update({
      where: {
        id,
      },
      data: {
        title: title ? title.trim() : coverLetter.title,
        content: content.trim(),
      },
    });

    await db.activityLog.create({
      data: {
        userId: user.id,
        action: "UPDATE_COVER_LETTER",
        details: `Updated cover letter: ${updated.title}`,
      },
    });

    return NextResponse.json({
      success: true,
      coverLetter: updated,
    });
  } catch (error) {
    console.error("Update cover letter error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while updating cover letter." },
      { status: 500 }
    );
  }
}
