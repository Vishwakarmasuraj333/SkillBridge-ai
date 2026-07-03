import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateResumePdfBuffer } from "@/lib/pdf-generator";
import { renderResumeHtml } from "@/lib/resume-html";
import { templatesList } from "@/components/resume-templates/templates";

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

    const document = await db.resumeBuilderDocument.findFirst({
      where: { id: id, userId: user.id },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    // Load full user details to check premium status
    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      select: { isPremium: true, premiumUntil: true }
    });

    const isPremiumUser = !!(fullUser?.isPremium && (!fullUser.premiumUntil || new Date(fullUser.premiumUntil) > new Date()));

    // Find template type (FREE or PREMIUM)
    const templateInfo = templatesList.find(t => t.id === document.templateId);
    const templateType = templateInfo?.type || "FREE";

    if (templateType === "PREMIUM" && !isPremiumUser) {
      return NextResponse.json({ error: "Premium template requires upgrade." }, { status: 403 });
    }

    const structuredData = document.structuredData as any;

    // Build filename
    const fullName = structuredData?.personalInfo?.fullName || "Candidate";
    const templateName = templateInfo?.name || "Standard";
    const safeName = fullName.replace(/\s+/g, "_");
    const safeTemplate = templateName.replace(/\s+/g, "_");
    const fileName = `${safeName}_Resume_${safeTemplate}.pdf`;

    // Render HTML and compile PDF buffer
    const html = renderResumeHtml(document.templateId, structuredData, isPremiumUser);
    const pdfBuffer = await generateResumePdfBuffer({ html, fileName });

    // Add ActivityLog
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: "DOWNLOAD_RESUME_PDF",
        message: `Downloaded resume PDF for document: ${document.title}`,
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
    console.error("PDF generation failure:", error);
    return NextResponse.json({ error: error.message || "Failed to generate PDF." }, { status: 500 });
  }
}
