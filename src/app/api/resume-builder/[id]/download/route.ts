export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateResumePdfBuffer } from "@/lib/pdf-generator";
import { renderResumeHtml } from "@/lib/resume-html";
import { templatesList } from "@/components/resume-templates/templates";
import { normalizeResumeData } from "@/lib/resume-normalizer";
import { generateReactPdfBuffer } from "@/lib/pdf/react-pdf-fallback";

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

    const builderDoc = await prisma.resumeBuilderDocument.findFirst({
      where: { id: id, userId: user.id },
    });

    if (!builderDoc) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const isPremiumUser = true;

    // Find template info
    const templateInfo = templatesList.find(t => t.id === builderDoc.templateId);
    const templateType = templateInfo?.type || "FREE";

    const structuredData = builderDoc.structuredData as any;

    // Build filename
    const fullName = structuredData?.personalInfo?.fullName || "Candidate";
    const templateName = templateInfo?.name || "Standard";
    const safeName = fullName.replace(/\s+/g, "_");
    const safeTemplate = templateName.replace(/\s+/g, "_");
    const fileName = `${safeName}_Resume_${safeTemplate}.pdf`;

    let pdfBuffer: Buffer;

    try {
      // 1. Try Puppeteer/Chromium PDF generation first
      const html = renderResumeHtml(builderDoc.templateId, structuredData, isPremiumUser);
      pdfBuffer = await generateResumePdfBuffer({ html, fileName });
    } catch (error: any) {
      // Log the exact error as requested
      console.error("[PDF_DOWNLOAD_ERROR]", {
        name: error.name || "Error",
        message: error.message || "Puppeteer PDF generation failed",
        stack: error.stack
      });

      // 2. Fallback to @react-pdf/renderer
      try {
        const normalizedData = normalizeResumeData(structuredData);
        pdfBuffer = await generateReactPdfBuffer(normalizedData);
        console.log("[PDF_DOWNLOAD_FALLBACK_SUCCESS] Rendered with react-pdf fallback.");
      } catch (fallbackError: any) {
        console.error("[PDF_DOWNLOAD_FALLBACK_ERROR] Fallback React PDF failed:", {
          name: fallbackError.name || "Error",
          message: fallbackError.message || "React PDF generation failed",
          stack: fallbackError.stack
        });
        return NextResponse.json({ error: "PDF generation failed. Please try again." }, { status: 500 });
      }
    }

    // Add ActivityLog
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "DOWNLOAD_RESUME_PDF",
        message: `Downloaded resume PDF for document: ${builderDoc.title}`,
        details: `Template used: "${templateName}" (${templateType}). Filename: "${fileName}".`,
      },
    });

    // Return binary stream
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error("Auth or DB retrieval failure during PDF route invocation:", error);
    return NextResponse.json({ error: "PDF generation failed. Please try again." }, { status: 500 });
  }
}
