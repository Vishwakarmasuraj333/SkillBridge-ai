import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Resumes count
    const totalResumes = await db.resume.count({
      where: { userId: user.id },
    });

    // 2. Average ATS score of analyzed resumes (excluding job matches)
    const avgScoreResult = await db.resumeAnalysis.aggregate({
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
    const totalInterviews = await db.interviewQuestion.count({
      where: { userId: user.id },
    });

    // 4. Cover letters count
    const totalCoverLetters = await db.coverLetter.count({
      where: { userId: user.id },
    });

    // 5. Job matches count
    const totalJobMatches = await db.resumeAnalysis.count({
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
