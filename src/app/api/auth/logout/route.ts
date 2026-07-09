export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    
    if (user) {
      try {
        await prisma.activityLog.create({
          data: {
            userId: user.id,
            action: "LOGOUT",
            details: "User logged out.",
          },
        });
      } catch (dbLogErr) {
        console.warn("[LOGOUT_WARN] Failed to write activity log:", dbLogErr);
      }
    }

    const cookieStore = await cookies();
    cookieStore.delete("token");

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during logout." },
      { status: 500 }
    );
  }
}
