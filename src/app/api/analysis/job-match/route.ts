import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { matchJob } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId, jobTitle, jobDescriptionText } = await req.json();

    if (!resumeId || !jobDescriptionText) {
      return NextResponse.json(
        { error: "Resume ID and job description text are required." },
        { status: 400 }
      );
    }

    // 1. Fetch resume
    const resume = await db.resume.findFirst({
      where: { id: resumeId, userId: user.id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    // 2. Save job description to database
    const title = jobTitle || "Target Job Description";
    const jobDescription = await db.jobDescription.create({
      data: {
        userId: user.id,
        title,
        text: jobDescriptionText,
      },
    });

    // 3. Call AI Job Matcher
    const match = await matchJob(resume.text, jobDescriptionText);

    // 4. Save analysis record to database (using our unified schema)
    const savedAnalysis = await db.resumeAnalysis.create({
      data: {
        userId: user.id,
        resumeId: resume.id,
        jobDescriptionId: jobDescription.id,
        type: "JOB_MATCH",
        score: Number(match.matchPercentage || 0),
        summary: match.experienceGap || "",
        // Populate standard analysis fields for unified history structure
        strengths: match.matchingSkills || [],
        weaknesses: match.missingSkills || [],
        missingKeywords: match.recommendedKeywords || [],
        suggestions: match.improvementPoints || [],
        skillsFound: match.matchingSkills || [],
        skillsToAdd: match.missingSkills || [],
        // Populate matching-specific fields
        matchPercentage: Number(match.matchPercentage || 0),
        matchingSkills: match.matchingSkills || [],
        missingSkills: match.missingSkills || [],
        recommendedKeywords: match.recommendedKeywords || [],
        experienceGap: match.experienceGap || "",
        improvementPoints: match.improvementPoints || [],
      },
    });

    // 5. Log activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: "JOB_MATCH",
        message: `Ran Job Matcher for resume: ${resume.fileName || resume.title} with job ${title}`,
        details: `Matched resume "${resume.fileName || resume.title}" with job "${title}". Match rate: ${match.matchPercentage}%`,
      },
    });

    return NextResponse.json({
      message: "Job match analysis complete",
      analysis: {
        id: savedAnalysis.id,
        matchPercentage: match.matchPercentage,
        matchingSkills: match.matchingSkills,
        missingSkills: match.missingSkills,
        recommendedKeywords: match.recommendedKeywords,
        experienceGap: match.experienceGap,
        improvementPoints: match.improvementPoints,
        createdAt: savedAnalysis.createdAt,
        isMock: !!match.isMock,
      },
    });
  } catch (error: any) {
    console.error("Job match API route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during job matching." },
      { status: 500 }
    );
  }
}
