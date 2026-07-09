import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return NextResponse.json({
      ok: false,
      databaseUrlConfigured: false,
      database: null,
      errorCode: "MISSING_ENV",
      errorMessage: "DATABASE_URL environment variable is not defined.",
      hint: "Add DATABASE_URL to your .env file or Vercel environment variables."
    });
  }

  // Mask database password and credentials for safety
  let maskedUrl = "mysql://";
  try {
    const cleanUrl = dbUrl.trim();
    const urlObj = new URL(cleanUrl.startsWith("mysql://") ? cleanUrl : `mysql://${cleanUrl}`);
    maskedUrl = `${urlObj.protocol}//${urlObj.username}:******@${urlObj.host}${urlObj.pathname}${urlObj.search}`;
  } catch (e) {
    maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":******@");
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbUrl);
    
    const [rows]: any = await connection.query("SELECT DATABASE() as db");
    const dbName = rows?.[0]?.db || "unknown";

    await connection.end();

    return NextResponse.json({
      ok: true,
      databaseUrlConfigured: true,
      database: dbName,
      maskedUrl,
      errorCode: null,
      errorMessage: null,
      hint: "Database connection successful! Run 'npx prisma db push' to ensure tables are created."
    });
  } catch (err: any) {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {}
    }

    const errMsg = err?.message || "";
    const errCode = err?.code || "";
    let hint = "Verify database URL is correct and public endpoint is allowed.";

    if (errCode === "ER_ACCESS_DENIED_ERROR" || errMsg.includes("Access denied")) {
      hint = "Username/password is incorrect. If the password has special characters like @ : / ? # & %, it MUST be URL encoded (e.g. @ becomes %40).";
    } else if (errCode === "ER_BAD_DB_ERROR" || errMsg.includes("Unknown database")) {
      hint = "The database name does not exist. Ensure the database name is 'skillbridge_db' and is created on the cluster.";
    } else if (errCode === "ETIMEDOUT" || errCode === "ENOTFOUND" || errMsg.includes("timeout") || errMsg.includes("reach")) {
      hint = "Connection timed out. Check if you are using the Public Endpoint, Authorized IP Networks allow Vercel access, and Vercel network connection is active.";
    } else if (errMsg.includes("SSL") || errMsg.includes("ssl") || errMsg.includes("handshake")) {
      hint = "SSL handshake failed. Make sure to append '?sslaccept=strict' or '?ssl={\"rejectUnauthorized\":true}' to your DATABASE_URL.";
    }

    return NextResponse.json({
      ok: false,
      databaseUrlConfigured: true,
      database: null,
      maskedUrl,
      errorCode: errCode || "CONNECTION_FAILED",
      errorMessage: errMsg,
      hint
    });
  }
}
