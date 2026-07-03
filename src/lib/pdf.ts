import { createRequire } from "module";

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const require = createRequire(import.meta.url);
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch (error) {
    console.error("pdf-parse extraction failed, using stream regex fallback:", error);
    return extractTextFallback(buffer);
  }
}

export function cleanExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n") // collapse excessive line breaks
    .replace(/[ \t]+/g, " ")     // collapse duplicate horizontal spacing
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join("\n")
    .trim();
}

function extractTextFallback(buffer: Buffer): string {
  const content = buffer.toString("binary");
  const textChunks: string[] = [];
  
  // match simple parentheses strings: (Text) Tj
  const regexTj = /\(([^)]+)\)\s*Tj/g;
  let match;
  while ((match = regexTj.exec(content)) !== null) {
    textChunks.push(match[1]);
  }

  // match array of strings inside TJ operator: [ (Text1) 10 (Text2) ] TJ
  if (textChunks.length === 0) {
    const regexTJ = /\[([^\]]+)\]\s*TJ/g;
    while ((match = regexTJ.exec(content)) !== null) {
      const subMatches = match[1].match(/\(([^)]+)\)/g);
      if (subMatches) {
        subMatches.forEach(sm => {
          textChunks.push(sm.slice(1, -1));
        });
      }
    }
  }
  
  if (textChunks.length === 0) {
    throw new Error("Could not extract any plain text from this PDF file.");
  }
  
  return textChunks.join(" ");
}
