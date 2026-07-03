import OpenAI from "openai";

export async function testOpenAI(): Promise<{ success: boolean; model: string; error?: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { success: false, model: "", error: "OPENAI_API_KEY is not configured." };
  }

  const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: "Reply with only OK" }],
      max_tokens: 5
    });

    const text = response.choices[0]?.message?.content || "";
    if (text && text.trim().length > 0) {
      return { success: true, model: modelName };
    }
    throw new Error("Empty response returned from OpenAI API");
  } catch (err: any) {
    let errMsg = err.message || String(err);
    if (
      errMsg.toLowerCase().includes("quota") ||
      errMsg.toLowerCase().includes("insufficient_quota") ||
      errMsg.toLowerCase().includes("billing") ||
      errMsg.toLowerCase().includes("credit") ||
      errMsg.toLowerCase().includes("credits") ||
      errMsg.toLowerCase().includes("429")
    ) {
      errMsg = "OpenAI optional fallback failed: quota or billing issue.";
    }
    return { success: false, model: modelName, error: errMsg };
  }
}

export async function generateOpenAIContent(prompt: string, systemInstruction: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const openai = new OpenAI({ apiKey });

  const response = await openai.chat.completions.create({
    model: modelName,
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });

  const content = response.choices[0]?.message?.content || "";
  if (!content || content.trim().length === 0) {
    throw new Error(`OpenAI returned empty response using model ${modelName}`);
  }

  return content;
}
