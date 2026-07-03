export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        fileName: true,
        mimeType: true,
        extractionMethod: true,
        createdAt: true,
        updatedAt: true,
        text: true, // We select text to calculate textLength
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const mappedResumes = resumes.map((r) => ({
      id: r.id,
      title: r.title,
      fileName: r.fileName || r.title || "Unnamed Resume",
      filename: r.fileName || r.title || "Unnamed Resume", // support both spellings
      mimeType: r.mimeType || "text/plain",
      extractionMethod: r.extractionMethod || "unknown",
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      textLength: r.text.length,
    }));

    return NextResponse.json({ resumes: mappedResumes });
  } catch (error) {
    console.error("Fetch resumes error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve resumes." },
      { status: 500 }
    );
  }
}
