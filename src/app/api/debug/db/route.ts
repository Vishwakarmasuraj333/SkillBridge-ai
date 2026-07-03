import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const databaseUrlConfigured = !!process.env.DATABASE_URL;
  const maskedUrl = maskDatabaseUrl(process.env.DATABASE_URL);

  let ok = false;
  let databaseName = "unknown";
  let error: string | null = null;
  const tablesFound: string[] = [];
  const missingTables: string[] = [];

  if (!databaseUrlConfigured) {
    return NextResponse.json({
      ok: false,
      databaseUrlConfigured: false,
      database: "none",
      tablesFound: [],
      missingTables: [
        "User", "Resume", "JobDescription", "ResumeAnalysis", 
        "InterviewQuestion", "CoverLetter", "ActivityLog", 
        "ResumeBuilderDocument", "Payment"
      ],
      error: "DATABASE_URL environment variable is missing"
    });
  }

  try {
    // 1. Try raw query to verify database connection
    const rawOkResult = await prisma.$queryRaw<any[]>`SELECT 1 as ok`;
    const rawDbResult = await prisma.$queryRaw<any[]>`SELECT DATABASE() as db`;
    
    ok = rawOkResult && rawOkResult.length > 0;
    if (rawDbResult && rawDbResult.length > 0) {
      const firstRow = rawDbResult[0];
      databaseName = firstRow.db || Object.values(firstRow)[0] || "unknown";
    }

    // 2. Check each table
    const tablesToCheck = [
      { name: "User", check: () => prisma.user.findFirst() },
      { name: "Resume", check: () => prisma.resume.findFirst() },
      { name: "JobDescription", check: () => prisma.jobDescription.findFirst() },
      { name: "ResumeAnalysis", check: () => prisma.resumeAnalysis.findFirst() },
      { name: "InterviewQuestion", check: () => prisma.interviewQuestion.findFirst() },
      { name: "CoverLetter", check: () => prisma.coverLetter.findFirst() },
      { name: "ActivityLog", check: () => prisma.activityLog.findFirst() },
      { name: "ResumeBuilderDocument", check: () => prisma.resumeBuilderDocument.findFirst() },
      { name: "Payment", check: () => prisma.payment.findFirst() }
    ];

    for (const table of tablesToCheck) {
      try {
        await table.check();
        tablesFound.push(table.name);
      } catch (tableErr: any) {
        console.warn(`[DEBUG_DB] Table check failed for ${table.name}:`, tableErr.message || tableErr);
        missingTables.push(table.name);
      }
    }

  } catch (dbErr: any) {
    console.error("[DEBUG_DB_ERROR] Connection/Query failed:", dbErr);
    ok = false;
    error = dbErr.message || String(dbErr);
    
    // If connection failed, treat all tables as missing
    missingTables.push(
      "User", "Resume", "JobDescription", "ResumeAnalysis", 
      "InterviewQuestion", "CoverLetter", "ActivityLog", 
      "ResumeBuilderDocument", "Payment"
    );
  }

  return NextResponse.json({
    ok,
    databaseUrlConfigured,
    maskedUrl,
    database: databaseName,
    tablesFound,
    missingTables,
    error: error ? "A database connection error occurred. Check server logs." : null
  });
}

function maskDatabaseUrl(url: string | undefined): string {
  if (!url) return "Not Configured";
  try {
    const regex = /^(mysql:\/\/)([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
    const match = url.match(regex);
    if (match) {
      const [_, scheme, user, pass, host, port, rest] = match;
      const maskedUser = user.substring(0, 3) + "***";
      const maskedPass = "***";
      const maskedHost = host.substring(0, 5) + "***";
      return `${scheme}${maskedUser}:${maskedPass}@${maskedHost}:${port}/${rest}`;
    }
    return "Configured (Masked due to unrecognized format)";
  } catch (e) {
    return "Configured (Masking failed)";
  }
}
