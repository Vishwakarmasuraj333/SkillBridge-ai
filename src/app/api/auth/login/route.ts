export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Validate request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid JSON body in request." },
        { status: 400 }
      );
    }

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required fields." },
        { status: 400 }
      );
    }

    // Check environment config for DATABASE_URL at request time
    if (!process.env.DATABASE_URL) {
      console.error("[LOGIN_ERROR] DATABASE_URL environment variable is missing.");
      return NextResponse.json(
        { error: "Database connection URL is not configured. Please check your environment variables." },
        { status: 500 }
      );
    }

    // Connect to database at request time
    try {
      await prisma.$connect();
    } catch (connErr: any) {
      const { message, status } = getSafeDatabaseErrorMessage(connErr);
      return NextResponse.json({ error: message }, { status });
    }

    // 1. Find user
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
    } catch (findErr: any) {
      const { message, status } = getSafeDatabaseErrorMessage(findErr);
      return NextResponse.json({ error: message }, { status });
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 2. Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 3. Generate token
    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    // 4. Log activity (non-blocking for login success, but let's log errors)
    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "LOGIN",
          details: "User logged in.",
        },
      });
    } catch (logErr: any) {
      console.error("[LOGIN_LOG_ERROR] Failed to write activity log:", logErr);
    }

    // 5. Set cookie
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      message: "Login successful",
    });
  } catch (error: any) {
    console.error("[LOGIN_UNEXPECTED_ERROR]", error);
    return NextResponse.json(
      { error: "An unexpected system error occurred during login." },
      { status: 500 }
    );
  }
}

function getSafeDatabaseErrorMessage(error: any): { message: string; status: number } {
  console.error("[LOGIN_ERROR]", {
    name: error?.name,
    code: error?.code,
    message: error?.message,
    meta: error?.meta,
  });

  return {
    message: "Database connection failed. Check production database configuration.",
    status: 500
  };
}
