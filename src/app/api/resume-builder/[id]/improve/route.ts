export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateJSONWithAI } from "@/lib/ai";
import { normalizeResumeData } from "@/lib/resume-normalizer";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { targetRole, style, onePage } = await req.json();

    const builderDoc = await prisma.resumeBuilderDocument.findFirst({
      where: { id: id, userId: user.id },
    });

    if (!builderDoc) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const existingData = builderDoc.structuredData as any;

    const systemInstruction = `You are a professional ATS-friendly resume reviewer and writer.
You are given a structured resume in JSON format.
Your task is to improve the resume content specifically for the target role "${targetRole || "Software Developer"}" and styling focus "${style || "Standard"}".
${onePage ? "Additionally, make the resume content compact and optimized to fit on a single page." : ""}
Do not invent false companies, fake experience, or fake degrees.
Improve wording, make descriptions more impactful using strong action verbs, fix grammar, and add relevant industry keywords.
Return the updated structured resume JSON matching this schema exactly:
{
  "personalInfo": {
    "fullName": "",
    "jobTitle": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "github": "",
    "portfolio": ""
  },
  "summary": "",
  "skills": {
    "frontend": [],
    "backend": [],
    "database": [],
    "tools": [],
    "other": []
  },
  "experience": [
    {
      "role": "",
      "company": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "bullets": []
    }
  ],
  "projects": [
    {
      "name": "",
      "techStack": [],
      "description": "",
      "bullets": []
    }
  ],
  "education": [
    {
      "degree": "",
      "institution": "",
      "year": "",
      "score": ""
    }
  ],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "year": ""
    }
  ],
  "achievements": [],
  "languages": [],
  "keywords": []
}`;

    const prompt = `EXISTING RESUME DATA:\n${JSON.stringify(existingData, null, 2)}`;
    const { text, isMock } = await generateJSONWithAI(prompt, systemInstruction);

    let updatedData;
    if (isMock || !text) {
      updatedData = existingData; // Fallback to current state
    } else {
      try {
        let cleaned = text.trim();
        if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }
        cleaned = cleaned.trim();
        updatedData = JSON.parse(cleaned);
      } catch (parseErr) {
        console.error("Failed to parse Gemini improved JSON:", parseErr);
        updatedData = existingData;
      }
    }

    const updatedDoc = await prisma.resumeBuilderDocument.update({
      where: { id: id },
      data: {
        structuredData: normalizeResumeData(updatedData),
      },
    });

    // Create ActivityLog entry
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "UPDATE_RESUME_BUILDER",
        message: `Improved resume builder document using AI: ${updatedDoc.title}`,
        details: `Applied AI rewrite for role: "${targetRole || "unspecified"}", style: "${style || "unspecified"}".`,
      },
    });

    return NextResponse.json({ success: true, document: updatedDoc });
  } catch (error: any) {
    console.error("Failed to improve resume with AI:", error);
    return NextResponse.json({ error: error.message || "Failed to rewrite resume with AI." }, { status: 500 });
  }
}
