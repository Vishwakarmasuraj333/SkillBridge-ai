export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Await dynamic route params for Next.js 16 App Router compliance
    const { id } = await params;
    const itemId = id;

    if (!itemId) {
      return NextResponse.json({ error: "Missing ID parameter." }, { status: 400 });
    }

    // 3. Parse query type
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // Expected values: "analysis", "interview", "cover-letter"

    if (!type) {
      return NextResponse.json(
        { error: "Query parameter 'type' is required (analysis, interview, cover-letter)." },
        { status: 400 }
      );
    }

    // 4. Perform deletion depending on type and ownership check
    if (type === "analysis") {
      const item = await prisma.resumeAnalysis.findFirst({
        where: { id: itemId, userId: user.id },
      });
      if (!item) {
        return NextResponse.json({ error: "Analysis history item not found." }, { status: 404 });
      }
      await prisma.resumeAnalysis.delete({ where: { id: itemId } });
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "DELETE_ANALYSIS",
          details: `Deleted analysis history item #${itemId}.`,
        },
      });
    } else if (type === "interview") {
      const item = await prisma.interviewQuestion.findFirst({
        where: { id: itemId, userId: user.id },
      });
      if (!item) {
        return NextResponse.json({ error: "Interview coaching item not found." }, { status: 404 });
      }
      await prisma.interviewQuestion.delete({ where: { id: itemId } });
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "DELETE_INTERVIEW",
          details: `Deleted interview set #${itemId}.`,
        },
      });
    } else if (type === "cover-letter") {
      const item = await prisma.coverLetter.findFirst({
        where: { id: itemId, userId: user.id },
      });
      if (!item) {
        return NextResponse.json({ error: "Cover letter not found." }, { status: 404 });
      }
      await prisma.coverLetter.delete({ where: { id: itemId } });
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "DELETE_COVER_LETTER",
          details: `Deleted cover letter #${itemId}.`,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid type. Must be 'analysis', 'interview', or 'cover-letter'." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Item deleted successfully from history.",
      deletedId: itemId,
      type,
    });
  } catch (error) {
    console.error("Delete history item error:", error);
    return NextResponse.json(
      { error: "Failed to delete history item." },
      { status: 500 }
    );
  }
}
