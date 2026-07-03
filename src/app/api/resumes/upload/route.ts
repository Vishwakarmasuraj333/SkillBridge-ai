import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { extractResumeText, ExtractionError } from "@/lib/resume-extractor";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // 1. Authenticate user from JWT HttpOnly cookie
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse form data
    const formData = await req.formData();
    const file = (formData.get("file") || formData.get("resume")) as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file was uploaded. Please upload a valid resume." },
        { status: 400 }
      );
    }

    // Safe server debug logs
    console.log("[UPLOAD] userId", user.id);
    console.log("[UPLOAD] fileName", file.name);
    console.log("[UPLOAD] mimeType", file.type);
    console.log("[UPLOAD] size", file.size);

    // Validate size: max 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum supported resume size is 10MB." },
        { status: 400 }
      );
    }

    // Validate mimeTypes
    const allowedMimeTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const fileNameLower = file.name.toLowerCase();
    const isAllowedExt = /\.(pdf|png|jpe?g|webp|docx)$/i.test(fileNameLower);

    if (!allowedMimeTypes.includes(file.type) && !isAllowedExt) {
      return NextResponse.json(
        { error: "Invalid file type. Supported formats: PDF, PNG, JPG, JPEG, WEBP, DOCX." },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Extract text content
    let text = "";
    let method = "";

    try {
      const extraction = await extractResumeText({
        buffer,
        fileName: file.name,
        mimeType: file.type || getMimeFromExtension(file.name),
      });
      text = extraction.text;
      method = extraction.method;
      console.log("[EXTRACT] final method", method);
    } catch (err: any) {
      console.warn("Automated resume extraction failed:", err);
      
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(file.name.toLowerCase());
      
      let stage: "pdf-parse" | "gemini-pdf" | "gemini-image" | "save-db" = "pdf-parse";
      if (isPdf) {
        stage = err.message?.includes("Gemini") ? "gemini-pdf" : "pdf-parse";
      } else if (isImage) {
        stage = "gemini-image";
      }

      // Return 422 for normal extraction errors without throwing a 500 crash
      return NextResponse.json(
        {
          success: false,
          code: "EXTRACTION_FAILED",
          stage: stage,
          message: err.message || "We could not read this file automatically. You can paste resume text manually below.",
          allowManualPaste: true,
          debug: {
            fileName: file.name,
            mimeType: file.type || getMimeFromExtension(file.name),
            size: file.size,
            pdfParseTextLength: err.pdfParseTextLength || 0,
            geminiAttempted: err.geminiAttempted || isImage || (isPdf && stage === "gemini-pdf"),
            geminiTextLength: err.geminiTextLength || 0,
          }
        },
        { status: 422 }
      );
    }

    // 4. Save to MySQL database
    let resume;
    const title = file.name.replace(/\.[^/.]+$/, "");
    
    try {
      resume = await db.resume.create({
        data: {
          userId: user.id,
          title: title,
          fileName: file.name,
          text: text,
          mimeType: file.type || getMimeFromExtension(file.name),
          extractionMethod: method,
        },
      });
    } catch (dbErr: any) {
      console.error("Database save failed:", dbErr);
      return NextResponse.json(
        {
          success: false,
          code: "EXTRACTION_FAILED",
          stage: "save-db",
          message: "Failed to save the extracted resume to the database.",
          debug: {
            fileName: file.name,
            mimeType: file.type || getMimeFromExtension(file.name),
            size: file.size,
            pdfParseTextLength: text.length,
            geminiAttempted: method.startsWith("gemini"),
            geminiTextLength: method.startsWith("gemini") ? text.length : 0,
            dbError: dbErr.message || String(dbErr)
          }
        },
        { status: 500 }
      );
    }

    // 5. Create ActivityLog
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: "UPLOAD_RESUME",
        message: `Uploaded and parsed resume: ${file.name} using ${method}`,
        details: `Saved file "${file.name}" with title "${title}". Extracted length: ${text.length} characters.`,
      },
    });

    return NextResponse.json({
      success: true,
      resume: {
        id: resume.id,
        title: resume.title,
        fileName: resume.fileName,
        mimeType: resume.mimeType,
        extractionMethod: resume.extractionMethod,
        createdAt: resume.createdAt,
      },
      extractionMethod: method,
      textLength: text.length,
      textPreview: text.substring(0, 300),
    });
  } catch (error: any) {
    console.error("Critical upload route failure:", error);
    return NextResponse.json(
      { error: "An unexpected system error occurred during upload processing." },
      { status: 500 }
    );
  }
}

function getMimeFromExtension(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "image/jpeg";
}
