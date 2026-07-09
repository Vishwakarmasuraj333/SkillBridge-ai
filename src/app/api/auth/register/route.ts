export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";

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

    const { email, password, name } = body;

    // 1. Basic field validations
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required fields." },
        { status: 400 }
      );
    }

    if (typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters long." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== "string" || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // 2. Check environment config for DATABASE_URL at request time
    if (!process.env.DATABASE_URL) {
      console.error("[REGISTER_ERROR] DATABASE_URL environment variable is missing.");
      return NextResponse.json(
        { error: "Database connection URL is not configured. Please check your environment variables." },
        { status: 500 }
      );
    }

    // 3. Connect to database at request time
    try {
      await prisma.$connect();
    } catch (connErr: any) {
      const { message, status } = getSafeDatabaseErrorMessage(connErr);
      return NextResponse.json({ error: message }, { status });
    }

    // 4. Check if user already exists
    let existingUser;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
    } catch (findErr: any) {
      const { message, status } = getSafeDatabaseErrorMessage(findErr);
      return NextResponse.json({ error: message }, { status });
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email address already exists." },
        { status: 400 }
      );
    }

    // 5. Hash password and create user
    const passwordHash = await hashPassword(password);
    
    let user;
    try {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: passwordHash,
          name: name.trim(),
        },
      });
    } catch (createErr: any) {
      const { message, status } = getSafeDatabaseErrorMessage(createErr);
      return NextResponse.json({ error: message }, { status });
    }

    // 6. Generate token
    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    // 7. Log activity (non-blocking for registration success, but let's log any errors)
    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "REGISTER",
          details: "User registered account.",
        },
      });
    } catch (logErr: any) {
      console.error("[REGISTER_LOG_ERROR] Failed to write activity log:", logErr);
    }

    // 8. Set cookie
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
      message: "Registration successful",
    });
  } catch (error: any) {
    console.error("[REGISTER_UNEXPECTED_ERROR]", error);
    return NextResponse.json(
      { error: "An unexpected system error occurred during registration." },
      { status: 500 }
    );
  }
}

function getSafeDatabaseErrorMessage(error: any): { message: string; status: number } {
  console.error("[REGISTER_ERROR]", {
    name: error?.name,
    code: error?.code,
    message: error?.message,
    meta: error?.meta,
  });

  const code = error?.code || "";

  // Duplicate email / Unique constraint
  if (code === "P2002") {
    return {
      message: "A user with this email address already exists.",
      status: 400
    };
  }

  return {
    message: "Database connection failed. Check production database configuration.",
    status: 500
  };
}
