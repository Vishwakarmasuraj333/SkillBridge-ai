export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { analyzeResume } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId } = await req.json();
    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID is required." }, { status: 400 });
    }

    // 1. Fetch resume
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: user.id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    // 2. Perform AI Analysis
    const analysis = await analyzeResume(resume.text);

    // 3. Save analysis to database (Prisma Json fields accept raw JS arrays/objects)
    const savedAnalysis = await prisma.resumeAnalysis.create({
      data: {
        userId: user.id,
        resumeId: resume.id,
        type: "RESUME_ANALYSIS",
        score: Number(analysis.score || 0),
        summary: analysis.summary || "",
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        missingKeywords: analysis.missingKeywords || [],
        suggestions: analysis.suggestions || [],
        skillsFound: analysis.skillsFound || [],
        skillsToAdd: analysis.skillsToAdd || [],
        fullResult: {
          checklist: analysis.checklist || []
        }
      },
    });

    // 4. Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "ANALYZE_RESUME",
        message: `Ran ATS scan for resume: ${resume.fileName || resume.title}`,
        details: `Analyzed resume "${resume.fileName || resume.title}". ATS Score: ${analysis.score}/100`,
      },
    });

    return NextResponse.json({
      message: "Resume analysis complete",
      analysis: {
        id: savedAnalysis.id,
        score: savedAnalysis.score,
        summary: savedAnalysis.summary,
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        missingKeywords: analysis.missingKeywords || [],
        suggestions: analysis.suggestions || [],
        skillsFound: analysis.skillsFound || [],
        skillsToAdd: analysis.skillsToAdd || [],
        checklist: analysis.checklist || [],
        isMock: !!analysis.isMock,
      },
    });
  } catch (error: any) {
    console.error("Resume analysis handler error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during resume analysis." },
      { status: 500 }
    );
  }
}
