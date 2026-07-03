import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

function parseAiErrorMsg(err: any): string {
  const msg = (err.message || String(err)).toLowerCase();
  
  if (
    msg.includes("api key") || 
    msg.includes("key invalid") || 
    msg.includes("invalid key") || 
    msg.includes("api_key_invalid") || 
    msg.includes("invalid_api_key") ||
    msg.includes("api key not found")
  ) {
    return "Invalid API key";
  }
  if (
    msg.includes("quota") || 
    msg.includes("rate limit") || 
    msg.includes("429") || 
    msg.includes("rate_limit_exceeded") || 
    msg.includes("resource_exhausted") ||
    msg.includes("exhausted") ||
    msg.includes("billing") || 
    msg.includes("insufficient_quota") || 
    msg.includes("credit") || 
    msg.includes("credits") ||
    msg.includes("insufficient")
  ) {
    return "OpenAI optional fallback failed: quota or billing issue.";
  }
  if (
    msg.includes("model_not_found") || 
    msg.includes("model not available") || 
    msg.includes("model not found") || 
    msg.includes("404")
  ) {
    return "Model not available";
  }
  
  return `Network/API request failed: ${err.message || "Unknown error"}`;
}

export async function GET(req: Request) {
  try {
    // 1. Authenticate user
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Test MySQL Database via Prisma
    let dbConnected = false;
    let dbError: string | null = null;
    try {
      await db.user.count();
      dbConnected = true;
    } catch (err: any) {
      dbError = err.message || "Failed to query database";
    }

    // 3. Test Gemini API
    const geminiConfigured = !!process.env.GEMINI_API_KEY;
    let geminiWorking = false;
    let geminiWorkingModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    let geminiError: string | null = null;
    if (geminiConfigured) {
      const candidateModels = [
        process.env.GEMINI_MODEL || "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-flash-latest",
        "gemini-1.5-flash"
      ];
      
      let lastError = null;
      for (const modelName of candidateModels) {
        try {
          const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
          const model = client.getGenerativeModel({ model: modelName });
          const result = await model.generateContent("Reply with only OK");
          const text = result.response.text();
          if (text && text.trim().length > 0) {
            geminiWorking = true;
            geminiWorkingModel = modelName;
            break;
          } else {
            throw new Error("Empty response returned from Gemini API");
          }
        } catch (err: any) {
          console.warn(`Health check - Gemini model ${modelName} failed:`, err);
          lastError = err;
        }
      }
      if (!geminiWorking) {
        geminiError = parseAiErrorMsg(lastError);
      }
    }

    // 4. Test OpenAI API
    const openaiConfigured = !!process.env.OPENAI_API_KEY;
    let openaiWorking = false;
    let openaiWorkingModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
    let openaiError: string | null = null;
    if (openaiConfigured) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: openaiWorkingModel,
            messages: [{ role: "user", content: "Reply with only OK" }],
            max_tokens: 5
          })
        });

        if (response.status === 200) {
          const json = await response.json();
          const text = json.choices?.[0]?.message?.content;
          if (text && text.trim().length > 0) {
            openaiWorking = true;
          } else {
            throw new Error("Empty response returned from OpenAI API");
          }
        } else {
          const errText = await response.text();
          let parsedError: any;
          try {
            parsedError = JSON.parse(errText);
          } catch {
            parsedError = null;
          }
          const errMsg = parsedError?.error?.message || errText || `Status ${response.status}`;
          throw new Error(errMsg);
        }
      } catch (err: any) {
        console.error("Health check - OpenAI failed:", err);
        openaiError = parseAiErrorMsg(err);
      }
    }

    return NextResponse.json({
      database: {
        configured: !!process.env.DATABASE_URL,
        connected: dbConnected,
        error: dbError
      },
      gemini: {
        configured: geminiConfigured,
        working: geminiWorking,
        model: geminiWorkingModel,
        error: geminiError
      },
      openai: {
        configured: openaiConfigured,
        working: openaiWorking,
        model: openaiWorkingModel,
        error: openaiError
      }
    });
  } catch (error: any) {
    console.error("Health check handler error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during health check." },
      { status: 500 }
    );
  }
}
