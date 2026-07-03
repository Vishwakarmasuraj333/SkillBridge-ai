import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. No valid session found." },
        { status: 401 }
      );
    }

    return NextResponse.json({ 
      user,
      configStatus: {
        hasDatabase: !!process.env.DATABASE_URL,
        hasGemini: !!process.env.GEMINI_API_KEY,
        hasOpenAI: !!process.env.OPENAI_API_KEY,
        hasRazorpayKeyId: !!process.env.RAZORPAY_KEY_ID,
        hasRazorpayKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
        hasPublicRazorpayKeyId: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        hasRazorpayWebhookSecret: !!process.env.RAZORPAY_WEBHOOK_SECRET,
        hasAppUrl: !!process.env.APP_URL,
        razorpayMode: process.env.RAZORPAY_KEY_ID?.startsWith("rzp_live_")
          ? "live"
          : process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_")
          ? "test"
          : "unknown"
      }
    });
  } catch (error) {
    console.error("Me endpoint error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
