import { extractTextFromFileWithGemini } from "./gemini";
import OpenAI from "openai";
import mammoth from "mammoth";
import { extractTextFromPdf } from "./pdf";

export interface ExtractionResult {
  text: string;
  method: string;
  pdfParseTextLength?: number;
  geminiAttempted?: boolean;
  geminiTextLength?: number;
  warning?: string;
}

export class ExtractionError extends Error {
  pdfParseTextLength: number;
  geminiAttempted: boolean;
  geminiTextLength: number;

  constructor(
    message: string,
    extra: { pdfParseTextLength: number; geminiAttempted: boolean; geminiTextLength: number }
  ) {
    super(message);
    this.name = "ExtractionError";
    this.pdfParseTextLength = extra.pdfParseTextLength;
    this.geminiAttempted = extra.geminiAttempted;
    this.geminiTextLength = extra.geminiTextLength;
  }
}

export async function extractResumeText(input: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}): Promise<ExtractionResult> {
  const { buffer, fileName, mimeType } = input;
  const isPdf = mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");
  const isImage = mimeType.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(fileName);
  const isDocx =
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.toLowerCase().endsWith(".docx");

  console.log(`Starting extraction for ${fileName} | mime: ${mimeType} | size: ${buffer.length} bytes`);

  let pdfParseTextLength = 0;
  let geminiAttempted = false;
  let geminiTextLength = 0;

  // A. PDF Extraction Logic
  if (isPdf) {
    // 1. Try pdf-parse
    try {
      console.log("[EXTRACT] starting pdf-parse");
      const rawText = await extractTextFromPdf(buffer);
      const cleaned = cleanText(rawText);
      pdfParseTextLength = cleaned.length;
      console.log("[EXTRACT] pdf-parse text length", pdfParseTextLength);

      if (cleaned.length >= 80) {
        logSafe({ fileName, mimeType, method: "pdf-parse", length: cleaned.length });
        return { text: cleaned, method: "pdf-parse", pdfParseTextLength };
      }
      console.warn("pdf-parse text too short (< 80 chars), falling back to Gemini Vision.");
    } catch (err) {
      console.warn("pdf-parse extraction failed, using Gemini Vision fallback:", err);
    }

    // 2. Fallback to Gemini Multimodal Document Extraction
    geminiAttempted = true;
    console.log("[EXTRACT] starting Gemini fallback");
    
    // Verify Gemini API key is configured before fallback
    if (!process.env.GEMINI_API_KEY) {
      throw new ExtractionError(
        "Gemini API is not working. Go to Settings and run connection test.",
        { pdfParseTextLength, geminiAttempted, geminiTextLength }
      );
    }

    try {
      const text = await extractTextFromFileWithGemini(buffer, "application/pdf", fileName);
      const cleaned = cleanText(text);
      geminiTextLength = cleaned.length;
      console.log("[EXTRACT] Gemini text length", geminiTextLength);

      if (cleaned.length >= 80) {
        logSafe({ fileName, mimeType, method: "gemini-pdf-vision", length: cleaned.length });
        return {
          text: cleaned,
          method: "gemini-pdf-vision",
          pdfParseTextLength,
          geminiAttempted,
          geminiTextLength,
        };
      }
      console.warn("Gemini vision extracted text too short (< 80 chars).");
    } catch (err: any) {
      console.error("Gemini Vision document extraction failed:", err);
      throw new ExtractionError(
        `Gemini Vision failed: ${err.message || String(err)}`,
        { pdfParseTextLength, geminiAttempted, geminiTextLength }
      );
    }

    throw new ExtractionError(
      "We could not read this PDF file automatically. Both pdf-parse and Gemini fallback failed to return sufficient text.",
      { pdfParseTextLength, geminiAttempted, geminiTextLength }
    );
  }

  // B. Image Extraction Logic
  if (isImage) {
    const resolvedMime = mimeType.startsWith("image/") ? mimeType : getMimeFromFileName(fileName);
    geminiAttempted = true;
    console.log("[EXTRACT] starting Gemini fallback for image");

    // Verify Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      throw new ExtractionError(
        "Gemini API is not working. Go to Settings and run connection test.",
        { pdfParseTextLength, geminiAttempted, geminiTextLength }
      );
    }

    try {
      const text = await extractTextFromFileWithGemini(buffer, resolvedMime, fileName);
      const cleaned = cleanText(text);
      geminiTextLength = cleaned.length;
      console.log("[EXTRACT] Gemini text length", geminiTextLength);

      if (cleaned.length >= 80) {
        logSafe({ fileName, mimeType: resolvedMime, method: "gemini-image-vision", length: cleaned.length });
        return {
          text: cleaned,
          method: "gemini-image-vision",
          pdfParseTextLength,
          geminiAttempted,
          geminiTextLength,
        };
      }
      console.warn("Gemini image vision extracted text too short (< 80 chars).");
    } catch (err: any) {
      console.error("Gemini image vision extraction failed, trying OpenAI fallback:", err);
    }

    // Fallback to OpenAI Vision
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log("Attempting Image text extraction via OpenAI Vision fallback...");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extract all readable resume text from this image. Return only clean plain text. Preserve name, email, phone, links, skills, education, experience, projects, certifications, and dates. Do not summarize."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${resolvedMime};base64,${buffer.toString("base64")}`
                  }
                }
              ]
            }
          ]
        });

        const text = response.choices[0]?.message?.content || "";
        const cleaned = cleanText(text);
        if (cleaned.length >= 80) {
          logSafe({ fileName, mimeType: resolvedMime, method: "openai-image-vision", length: cleaned.length });
          return {
            text: cleaned,
            method: "openai-image-vision",
            pdfParseTextLength,
            geminiAttempted,
            geminiTextLength,
          };
        }
      } catch (err) {
        console.error("OpenAI vision extraction failed:", err);
      }
    }

    throw new ExtractionError(
      "We could not read this image file automatically. Gemini OCR failed to return sufficient text.",
      { pdfParseTextLength, geminiAttempted, geminiTextLength }
    );
  }

  // C. DOCX Extraction Logic
  if (isDocx) {
    try {
      console.log("[EXTRACT] starting docx-mammoth");
      const result = await mammoth.extractRawText({ buffer });
      const cleaned = cleanText(result.value);
      if (cleaned.length >= 80) {
        logSafe({ fileName, mimeType, method: "docx-mammoth", length: cleaned.length });
        return { text: cleaned, method: "docx-mammoth" };
      }
      console.warn("Mammoth extracted text too short (< 80 chars).");
    } catch (err: any) {
      console.error("Mammoth DOCX extraction failed:", err);
      throw new ExtractionError(
        `Mammoth DOCX extraction failed: ${err.message || String(err)}`,
        { pdfParseTextLength, geminiAttempted, geminiTextLength }
      );
    }

    throw new ExtractionError(
      "We could not read this DOCX file automatically. Mammoth failed to return sufficient text.",
      { pdfParseTextLength, geminiAttempted, geminiTextLength }
    );
  }

  // D. General Fallback/Failure
  throw new ExtractionError(
    "Unsupported file type for automated resume reading.",
    { pdfParseTextLength, geminiAttempted, geminiTextLength }
  );
}

// Clean and normalize text
function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n")
    .trim();
}

// Map file names to resolved image mimetypes
function getMimeFromFileName(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

// Safe server log statement
function logSafe(logData: { fileName: string; mimeType: string; method: string; length: number }) {
  console.log(
    `[Extraction Success] File: "${logData.fileName}" | Mime: "${logData.mimeType}" | Method: "${logData.method}" | Length: ${logData.length} chars`
  );
}
