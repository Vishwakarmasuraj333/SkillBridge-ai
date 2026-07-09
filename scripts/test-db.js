const mysql = require("mysql2/promise");
require("dotenv").config();

async function testConnection() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ Error: DATABASE_URL environment variable is not defined in .env file.");
    process.exit(1);
  }

  // Mask database password and credentials for safety in logs
  let maskedUrl = "mysql://";
  let urlObj;
  try {
    const cleanUrl = dbUrl.trim();
    urlObj = new URL(cleanUrl.startsWith("mysql://") ? cleanUrl : `mysql://${cleanUrl}`);
    maskedUrl = `${urlObj.protocol}//${urlObj.username}:******@${urlObj.host}${urlObj.pathname}${urlObj.search}`;
  } catch (e) {
    maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":******@");
  }

  console.log(`Connecting to database: ${maskedUrl}`);

  let connection;
  try {
    if (!urlObj) {
      throw new Error("Failed to parse database URL.");
    }

    // Explicitly parse connection URL and pass the ssl: { rejectUnauthorized: true } option to mysql2
    connection = await mysql.createConnection({
      host: urlObj.hostname,
      port: urlObj.port ? parseInt(urlObj.port) : 4000,
      user: urlObj.username,
      password: urlObj.password ? decodeURIComponent(urlObj.password) : undefined,
      database: urlObj.pathname.replace(/^\//, "") || "skillbridge_db",
      ssl: {
        rejectUnauthorized: true
      }
    });
    
    console.log("⚡ Executing diagnostic queries...");
    const [okRows] = await connection.query("SELECT 1 AS ok");
    const [dbRows] = await connection.query("SELECT DATABASE() AS db");
    
    const isOk = okRows?.[0]?.ok === 1;
    const dbName = dbRows?.[0]?.db || "unknown";

    await connection.end();

    if (isOk) {
      console.log(`\n✅ Database connection working!`);
      console.log(`📂 Active Database: ${dbName}`);
      process.exit(0);
    } else {
      console.error(`\n❌ Diagnostic failed: SELECT 1 returned unexpected output.`);
      process.exit(1);
    }
  } catch (err) {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {}
    }

    console.error(`\n❌ Connection failed!`);
    console.error(`Code: ${err.code || "UNKNOWN"}`);
    console.error(`Message: ${err.message}`);

    const errMsg = err.message || "";
    const errCode = err.code || "";

    console.log("\n💡 Hints:");
    if (errCode === "ER_ACCESS_DENIED_ERROR" || errMsg.includes("Access denied")) {
      console.log("- Access Denied: Please check your username and password. If your password has special characters like @ : / ? # & %, ensure it is URL encoded (e.g. @ becomes %40).");
    } else if (errCode === "ER_BAD_DB_ERROR" || errMsg.includes("Unknown database")) {
      console.log("- Unknown Database: Ensure 'skillbridge_db' database is created on your TiDB Cloud Starter instance.");
    } else if (errCode === "ETIMEDOUT" || errCode === "ENOTFOUND" || errMsg.includes("timeout") || errMsg.includes("reach")) {
      console.log("- Connection Timeout: Verify that you are using the Public Endpoint, your TiDB cluster status is active, and your client network/firewall allows outgoing port 4000 connections.");
    } else if (errMsg.includes("SSL") || errMsg.includes("ssl") || errMsg.includes("handshake") || errMsg.includes("insecure transport")) {
      console.log("- SSL Handshake Error: Ensure you have appended '?sslaccept=strict' to your DATABASE_URL, and that the server accepts TLSv1.2+ connections.");
    } else {
      console.log("- Double check your DATABASE_URL format and credentials.");
    }

    process.exit(1);
  }
}

testConnection();
