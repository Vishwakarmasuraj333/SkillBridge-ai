import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getWorkingGeminiModel(): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const candidateModels = [
    process.env.GEMINI_MODEL || "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-flash-latest",
    "gemini-1.5-flash"
  ];

  let lastError: any = null;
  for (const modelName of candidateModels) {
    try {
      console.log(`Checking working model status for Gemini candidate: ${modelName}`);
      const client = new GoogleGenerativeAI(apiKey);
      const model = client.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Reply with only OK");
      const text = result.response.text();
      if (text && text.trim().length > 0) {
        return modelName;
      }
    } catch (err: any) {
      console.warn(`Gemini check model ${modelName} failed:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error("Gemini health test failed on all candidate models.");
}

export async function testGemini(): Promise<{ success: boolean; model: string; error?: string }> {
  try {
    const workingModel = await getWorkingGeminiModel();
    return { success: true, model: workingModel };
  } catch (err: any) {
    return { success: false, model: "", error: err.message || String(err) };
  }
}

export async function generateGeminiContent(prompt: string, systemInstruction: string): Promise<{ text: string; modelUsed: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const modelName = await getWorkingGeminiModel();
  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: modelName });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `${systemInstruction}\n\nCandidate Input Data:\n${prompt}` }] }],
    generationConfig: { responseMimeType: "application/json" }
  });

  const text = result.response.text();
  if (text && text.trim().length > 0) {
    return { text, modelUsed: modelName };
  }

  throw new Error(`Gemini returned empty content using model ${modelName}`);
}

export async function extractTextFromFileWithGemini(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const candidateModels = [
    process.env.GEMINI_MODEL || "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-flash-latest",
    "gemini-1.5-flash"
  ];

  const prompt = "Extract all readable resume text from this file. Return only clean plain text. Do not summarize. Preserve name, email, phone, links, skills, education, experience, projects, certifications, and dates. If the document is scanned or image-based, use visual reading/OCR. Return only the extracted resume text.";

  let lastError: any = null;
  for (const modelName of candidateModels) {
    try {
      console.log(`[EXTRACT] attempting Gemini Vision extraction with model: ${modelName} on file ${fileName}`);
      const client = new GoogleGenerativeAI(apiKey);
      const model = client.getGenerativeModel({ model: modelName });

      const result = await model.generateContent([
        {
          inlineData: {
            data: buffer.toString("base64"),
            mimeType: mimeType
          }
        },
        prompt
      ]);

      const text = result.response.text();
      if (text && text.trim().length > 0) {
        console.log(`[EXTRACT] Gemini extraction successful with model ${modelName}, text length: ${text.length}`);
        return text.trim();
      }
    } catch (err: any) {
      console.warn(`[EXTRACT] Gemini Vision extraction model ${modelName} failed:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error("Gemini Vision text extraction failed on all candidate models.");
}
