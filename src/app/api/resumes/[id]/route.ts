import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const resume = await db.resume.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    return NextResponse.json({ resume });
  } catch (error) {
    console.error("Fetch resume details error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching resume details." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if resume exists and belongs to the user
    const resume = await db.resume.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    // Delete the resume (foreign keys will be handled by SetNull onDelete rules)
    await db.resume.delete({
      where: {
        id,
      },
    });

    // Create ActivityLog entry
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: "DELETE_RESUME",
        message: `Deleted resume: ${resume.title || resume.fileName}`,
        details: `Removed resume titled "${resume.title || resume.fileName}" (formerly using extraction method "${resume.extractionMethod || "unknown"}").`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Resume deleted successfully.",
    });
  } catch (error) {
    console.error("Delete resume error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while deleting resume." },
      { status: 500 }
    );
  }
}
