export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cleanExtractedText } from "@/lib/pdf";

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, text } = await req.json();

    // Validations: title minimum 2 characters
    if (!title || title.trim().length < 2) {
      return NextResponse.json(
        { error: "Resume title must be at least 2 characters long." },
        { status: 400 }
      );
    }

    // Validations: text minimum 80 characters (Lowered from 100 for testing/flexibility)
    if (!text || text.trim().length < 80) {
      return NextResponse.json(
        { error: "Resume text must be at least 80 characters long." },
        { status: 400 }
      );
    }

    const cleanedText = cleanExtractedText(text);

    // 2. Save in database
    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        title: title.trim(),
        fileName: "Pasted Resume Text",
        text: cleanedText,
        mimeType: "text/plain",
        extractionMethod: "manual",
      },
    });

    // 3. Add ActivityLog
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "UPLOAD_RESUME",
        message: `Saved manually pasted resume: ${title.trim()}`,
        details: `Created resume record manually titled "${title.trim()}". Length: ${cleanedText.length} characters.`,
      },
    });

    return NextResponse.json({
      success: true,
      resume: {
        id: resume.id,
        title: resume.title,
        fileName: resume.fileName,
        mimeType: resume.mimeType,
        extractionMethod: resume.extractionMethod,
        createdAt: resume.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Manual resume save API failure:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while saving resume." },
      { status: 500 }
    );
  }
}
