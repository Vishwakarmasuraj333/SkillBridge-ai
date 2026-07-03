export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateCoverLetterAI } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId, jobTitle, company, jobDescriptionText } = await req.json();

    if (!resumeId || !jobDescriptionText) {
      return NextResponse.json(
        { error: "Resume ID and job description text are required." },
        { status: 400 }
      );
    }

    // 1. Fetch resume
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: user.id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    // 2. Save job description to database
    const title = jobTitle || "Target Job Description";
    const jobDescription = await prisma.jobDescription.create({
      data: {
        userId: user.id,
        title,
        text: jobDescriptionText,
      },
    });

    // 3. Call AI Cover Letter Coordinator
    const coverLetterData = await generateCoverLetterAI(resume.text, {
      jobTitle: title,
      company: company || "",
      jobDescriptionText,
    });

    // 4. Save cover letter to database
    const coverLetter = await prisma.coverLetter.create({
      data: {
        userId: user.id,
        resumeId: resume.id,
        jobDescriptionId: jobDescription.id,
        jobTitle: title,
        company: company || null,
        title: coverLetterData.title || `Cover Letter for ${title}`,
        content: coverLetterData.content || "",
      },
    });

    // 5. Create ActivityLog with action and message keys
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "GENERATE_COVER_LETTER",
        message: `Generated cover letter for job: ${title}`,
        details: `Generated cover letter titled "${coverLetter.title}" based on resume "${resume.fileName || resume.title}".`,
      },
    });

    return NextResponse.json({
      message: "Cover letter generated successfully.",
      coverLetter: {
        id: coverLetter.id,
        title: coverLetter.title,
        content: coverLetter.content,
        createdAt: coverLetter.createdAt,
        isMock: !!coverLetterData.isMock,
      },
    });
  } catch (error: any) {
    console.error("Cover letter generate API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during cover letter generation." },
      { status: 500 }
    );
  }
}
