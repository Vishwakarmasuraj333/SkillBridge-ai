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

    // 1. Fetch Resume Analyses (both standalone and job-matching ones)
    const analyses = await prisma.resumeAnalysis.findMany({
      where: { userId: user.id },
      include: {
        resume: {
          select: { fileName: true, title: true },
        },
        jobDescription: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Fetch Interview Coaching sessions
    const interviews = await prisma.interviewQuestion.findMany({
      where: { userId: user.id },
      include: {
        resume: {
          select: { fileName: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Fetch Cover Letters
    const coverLetters = await prisma.coverLetter.findMany({
      where: { userId: user.id },
      include: {
        resume: {
          select: { fileName: true, title: true },
        },
        jobDescription: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 4. Fetch Activity Logs
    const activityLogs = await prisma.activityLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100, // Keep to recent logs for dashboard display
    });

    // Parse stringified JSON fields in return payload for cleaner frontend consumption
    const parsedAnalyses = analyses.map((a) => ({
      id: a.id,
      score: a.score,
      summary: a.summary,
      resumeFilename: a.resume?.fileName || a.resume?.title || "Unnamed Resume",
      jobTitle: a.jobDescription?.title || null,
      isJobMatch: !!a.jobDescriptionId,
      strengths: (a.strengths as any) || [],
      weaknesses: (a.weaknesses as any) || [],
      missingKeywords: (a.missingKeywords as any) || [],
      suggestions: (a.suggestions as any) || [],
      skillsFound: (a.skillsFound as any) || [],
      skillsToAdd: (a.skillsToAdd as any) || [],
      matchPercentage: a.matchPercentage,
      matchingSkills: (a.matchingSkills as any) || [],
      missingSkills: (a.missingSkills as any) || [],
      recommendedKeywords: (a.recommendedKeywords as any) || [],
      experienceGap: a.experienceGap,
      improvementPoints: (a.improvementPoints as any) || [],
      createdAt: a.createdAt,
    }));

    const parsedInterviews = interviews.map((i) => ({
      id: i.id,
      role: i.role,
      level: i.level,
      resumeFilename: i.resume?.fileName || i.resume?.title || "Unnamed Resume",
      questions: (i.questions as any) || [],
      createdAt: i.createdAt,
    }));

    const parsedCoverLetters = coverLetters.map((c) => ({
      id: c.id,
      title: c.title,
      content: c.content,
      resumeFilename: c.resume?.fileName || c.resume?.title || "Unnamed Resume",
      jobTitle: c.jobDescription?.title || null,
      createdAt: c.createdAt,
    }));

    return NextResponse.json({
      analyses: parsedAnalyses,
      interviews: parsedInterviews,
      coverLetters: parsedCoverLetters,
      activityLogs,
    });
  } catch (error) {
    console.error("Fetch history error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve history items." },
      { status: 500 }
    );
  }
}
