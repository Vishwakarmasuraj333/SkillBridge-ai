import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
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
      return NextResponse.json({ error: "Resume builder document not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, document });
  } catch (error: any) {
    console.error("Retrieve document error:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve document." }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const document = await db.resumeBuilderDocument.findFirst({
      where: { id: id, userId: user.id },
    });

    if (!document) {
      return NextResponse.json({ error: "Resume builder document not found." }, { status: 404 });
    }

    // Only allow updating title, templateId, templateType, structuredData, htmlSnapshot
    const dataToUpdate: any = {};
    if (body.title !== undefined) dataToUpdate.title = body.title;
    if (body.templateId !== undefined) dataToUpdate.templateId = body.templateId;
    if (body.templateType !== undefined) dataToUpdate.templateType = body.templateType;
    if (body.structuredData !== undefined) dataToUpdate.structuredData = body.structuredData;
    if (body.htmlSnapshot !== undefined) dataToUpdate.htmlSnapshot = body.htmlSnapshot;

    const updated = await db.resumeBuilderDocument.update({
      where: { id: id },
      data: dataToUpdate,
    });

    // Create ActivityLog entry
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: "UPDATE_RESUME_BUILDER",
        message: `Updated resume builder document: ${updated.title}`,
        details: `Updated fields: ${Object.keys(dataToUpdate).join(", ")}`,
      },
    });

    return NextResponse.json({ success: true, document: updated });
  } catch (error: any) {
    console.error("Update document error:", error);
    return NextResponse.json({ error: error.message || "Failed to update document." }, { status: 500 });
  }
}

export async function DELETE(
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
      return NextResponse.json({ error: "Resume builder document not found." }, { status: 404 });
    }

    await db.resumeBuilderDocument.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true, message: "Document deleted successfully." });
  } catch (error: any) {
    console.error("Delete document error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete document." }, { status: 500 });
  }
}
