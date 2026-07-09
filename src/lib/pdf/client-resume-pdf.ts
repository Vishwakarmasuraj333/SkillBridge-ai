import { generateResumePdfBuffer } from "./generate-resume-pdf";

export async function generateClientResumePdf({
  data,
  templateId,
}: {
  data: any;
  templateId?: string;
}): Promise<Uint8Array> {
  console.log("[CLIENT_PDF_FALLBACK_GENERATION] Starting client-side pdf-lib generation...", { templateId });
  return generateResumePdfBuffer({
    data,
    templateId: templateId || "classic-clean",
  });
}
