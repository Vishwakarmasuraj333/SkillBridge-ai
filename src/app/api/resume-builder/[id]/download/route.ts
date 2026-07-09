export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateResumePdfBuffer } from "@/lib/pdf/generate-resume-pdf";
import { normalizeResumeData } from "@/lib/resume-normalizer";
import { templatesList } from "@/components/resume-templates/templates";

// Core shared handler that supports both GET and POST
async function handlePdfDownload(req: Request, id: string) {
  try {
    console.error("[PDF_ROUTE_START]", { route: `/api/resume-builder/${id}/download`, id });

    // 1. Authenticate user
    const user = await getAuthenticatedUser(req);
    if (!user) {
      console.error("[PDF_ROUTE_ERROR]", { name: "AuthError", message: "Unauthorized access attempt" });
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch resume builder document from Prisma
    const builderDoc = await prisma.resumeBuilderDocument.findFirst({
      where: { id: id, userId: user.id },
    });

    if (!builderDoc) {
      console.error("[PDF_ROUTE_ERROR]", { name: "NotFoundError", message: `Document ${id} not found` });
      return NextResponse.json({ success: false, message: "Document not found." }, { status: 404 });
    }

    let structuredData = builderDoc.structuredData as any;
    const templateId = builderDoc.templateId || "classic-clean";

    // 3. Robust Check: If structuredData is empty, build a fallback structure from available document fields
    if (!structuredData || typeof structuredData !== "object" || Object.keys(structuredData).length === 0) {
      console.warn("[PDF_DOWNLOAD_WARNING] structuredData is empty. Creating fallback dataset.");
      structuredData = {
        personalInfo: {
          fullName: user.name || "Candidate Name",
          jobTitle: builderDoc.title || "Resume Profile",
          email: user.email || "",
          phone: "",
          location: ""
        },
        summary: "Professional resume profile generated from SkillBridge AI.",
        skills: { frontend: [], backend: [], database: [], tools: [], other: [] },
        experience: [],
        projects: [],
        education: []
      };
    }

    // 4. Normalize resume dataset safely
    const normalizedData = normalizeResumeData(structuredData);

    let pdfBuffer: Uint8Array;

    try {
      // 5. Generate PDF using pdf-lib generator
      pdfBuffer = await generateResumePdfBuffer({
        data: normalizedData,
        templateId,
      });
    } catch (renderError: any) {
      console.error("[PDF_RENDER_RENDER_ERROR] pdf-lib drawer failed, running basic fallback:", renderError);
      
      // Basic fallback generation using plain classic template
      const fallbackData = normalizeResumeData({
        personalInfo: {
          fullName: normalizedData?.personalInfo?.fullName || "Candidate Name",
          jobTitle: normalizedData?.personalInfo?.jobTitle || "Resume Profile",
          email: normalizedData?.personalInfo?.email || "",
          phone: normalizedData?.personalInfo?.phone || "",
          location: normalizedData?.personalInfo?.location || ""
        },
        summary: normalizedData?.summary || ""
      });
      
      pdfBuffer = await generateResumePdfBuffer({
        data: fallbackData,
        templateId: "classic-clean"
      });
    }

    // 6. Build filename
    const fullName = normalizedData?.personalInfo?.fullName || "Candidate";
    const templateInfo = templatesList.find(t => t.id === templateId);
    const templateName = templateInfo?.name || "Standard";
    const safeName = fullName.replace(/\s+/g, "_");
    const safeTemplate = templateName.replace(/\s+/g, "_");
    const fileName = `${safeName}_Resume_${safeTemplate}_${Date.now()}.pdf`;

    // 7. Log Activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "DOWNLOAD_RESUME_PDF",
          message: `Downloaded resume PDF for document: ${builderDoc.title}`,
          details: `Template: "${templateName}" (Free). Filename: "${fileName}". Engine: pdf-lib`,
        },
      });
    } catch (logErr) {
      console.warn("Could not write activity log:", logErr);
    }

    // 8. Return binary response
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });

  } catch (error: any) {
    console.error("[PDF_DOWNLOAD_ERROR]", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
    });
    
    return NextResponse.json({
      success: false,
      message: "Unable to download PDF. Please refresh and try again."
    }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handlePdfDownload(req, id);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handlePdfDownload(req, id);
}
