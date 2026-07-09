export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { renderToBuffer } from "@react-pdf/renderer";
import { ResumePdfDocument } from "@/lib/pdf/resume-pdf-document";
import { normalizeResumeData } from "@/lib/resume-normalizer";
import { templatesList } from "@/components/resume-templates/templates";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate User
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // 2. Fetch Document
    const builderDoc = await prisma.resumeBuilderDocument.findFirst({
      where: { id: id, userId: user.id },
    });

    if (!builderDoc) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const structuredData = builderDoc.structuredData as any;
    const templateId = builderDoc.templateId;

    // 3. Normalize Structured Data
    const normalizedData = normalizeResumeData(structuredData);

    // 4. Generate PDF buffer via @react-pdf/renderer
    const pdfBuffer = await renderToBuffer(
      <ResumePdfDocument data={normalizedData} templateId={templateId} />
    );

    // 5. Build safe filename
    const fullName = normalizedData?.personalInfo?.fullName || "Candidate";
    const templateInfo = templatesList.find(t => t.id === templateId);
    const templateName = templateInfo?.name || "Standard";
    const safeName = fullName.replace(/\s+/g, "_");
    const safeTemplate = templateName.replace(/\s+/g, "_");
    const fileName = `${safeName}_Resume_${safeTemplate}_${Date.now()}.pdf`;

    // 6. Add ActivityLog
    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "DOWNLOAD_RESUME_PDF",
          message: `Downloaded resume PDF for document: ${builderDoc.title}`,
          details: `Template used: "${templateName}" (Free). Filename: "${fileName}". Engine: React PDF Renderer`,
        },
      });
    } catch (logError) {
      console.warn("Failed to create activity log for PDF download:", logError);
    }

    // 7. Return Response
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
      message: "PDF generation failed. Please try again."
    }, { status: 500 });
  }
}
