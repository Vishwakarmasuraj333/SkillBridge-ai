import { NextResponse } from "next/server";
import { extractResumeText } from "@/lib/resume-extractor";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided in form field 'file'" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let pdfParseTextLength = 0;
    let geminiAttempted = false;
    let geminiTextLength = 0;
    let text = "";
    let method = "";

    try {
      const result = await extractResumeText({
        buffer,
        fileName: file.name,
        mimeType: file.type || "application/pdf"
      });
      text = result.text;
      method = result.method;
      pdfParseTextLength = result.pdfParseTextLength || 0;
      geminiAttempted = result.geminiAttempted || false;
      geminiTextLength = result.geminiTextLength || 0;
    } catch (err: any) {
      return NextResponse.json({
        success: false,
        error: err.message || String(err),
        pdfParseTextLength: err.pdfParseTextLength || 0,
        geminiAttempted: err.geminiAttempted || false,
        geminiTextLength: err.geminiTextLength || 0
      }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      mimeType: file.type,
      size: file.size,
      pdfParseTextLength: pdfParseTextLength || (method === "pdf-parse" ? text.length : 0),
      geminiAttempted: geminiAttempted || method.startsWith("gemini"),
      geminiTextLength: geminiTextLength || (method.startsWith("gemini") ? text.length : 0),
      method,
      preview: text.substring(0, 300)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
