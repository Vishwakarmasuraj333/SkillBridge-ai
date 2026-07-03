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

    // 1. Resumes count
    const totalResumes = await prisma.resume.count({
      where: { userId: user.id },
    });

    // 2. Average ATS score of analyzed resumes (excluding job matches)
    const avgScoreResult = await prisma.resumeAnalysis.aggregate({
      where: {
        userId: user.id,
        type: "RESUME_ANALYSIS",
        score: { not: null },
      },
      _avg: {
        score: true,
      },
    });

    const averageScore = Math.round(avgScoreResult._avg.score || 0);

    // 3. Interview coach sets count
    const totalInterviews = await prisma.interviewQuestion.count({
      where: { userId: user.id },
    });

    // 4. Cover letters count
    const totalCoverLetters = await prisma.coverLetter.count({
      where: { userId: user.id },
    });

    // 5. Job matches count
    const totalJobMatches = await prisma.resumeAnalysis.count({
      where: {
        userId: user.id,
        type: "JOB_MATCH",
      },
    });

    return NextResponse.json({
      stats: {
        totalResumes,
        averageScore,
        totalInterviews,
        totalCoverLetters,
        totalJobMatches,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching dashboard stats." },
      { status: 500 }
    );
  }
}
