import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateInterviewQuestionsAI } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId, role, level, type } = await req.json();

    if (!resumeId || !role || !level) {
      return NextResponse.json(
        { error: "Resume ID, target role, and difficulty level are required." },
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

    // 2. Call AI Coach Question Generator
    const interviewData = await generateInterviewQuestionsAI(
      resume.text,
      role,
      level,
      type || "Mixed"
    );

    // 3. Save to database
    const savedInterview = await db.interviewQuestion.create({
      data: {
        userId: user.id,
        resumeId: resume.id,
        role: interviewData.role || role,
        level: interviewData.level || level,
        questions: interviewData.questions || [],
      },
    });

    // 4. Log activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: "GENERATE_INTERVIEW",
        message: `Generated ${level} interview questions for ${role}`,
        details: `Generated ${interviewData.questions?.length || 0} questions (${type || "Mixed"} focus) for resume "${resume.fileName || resume.title}".`,
      },
    });

    return NextResponse.json({
      message: "Interview questions generated successfully.",
      interview: {
        id: savedInterview.id,
        role: savedInterview.role,
        level: savedInterview.level,
        questions: interviewData.questions || [],
        isMock: !!interviewData.isMock,
        createdAt: savedInterview.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Interview generate API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during interview question generation." },
      { status: 500 }
    );
  }
}
