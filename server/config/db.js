const admin = require("firebase-admin");
const path = require("path");

let appInitialized = false;

async function connectDB() {
  if (appInitialized) return;

  const projectId = (process.env.FIREBASE_PROJECT_ID || "").trim();
  const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || "").trim();
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").trim();
  const databaseURL = (process.env.FIREBASE_DB_URL || "").trim().replace(/\/$/, "");

  if (!projectId || !clientEmail || !privateKey || !databaseURL) {
    console.error("❌ Missing required FIREBASE environment variables.");
    throw new Error("Firebase Environment Not Configured");
  }

  // Surgical PEM Reconstruction: Fixes "Invalid JWT Signature" without needing a file
  let cleanKey = privateKey
    .replace(/^["']|["']$/g, "") // Remove quotes
    .replace(/\\n/g, "\n");     // Fix escaped newlines

  const header = "-----BEGIN PRIVATE KEY-----";
  const footer = "-----END PRIVATE KEY-----";

  if (cleanKey.includes(header) && cleanKey.includes(footer)) {
    // Extract only the base64 data, remove ALL whitespace/newlines/spaces
    const base64Part = cleanKey
      .split(header)[1]
      .split(footer)[0]
      .replace(/\s+/g, "");

    // Reconstruct the key in the exact 64-char format Google requires
    let wrappedBody = "";
    for (let i = 0; i < base64Part.length; i += 64) {
      wrappedBody += base64Part.substring(i, i + 64) + "\n";
    }
    cleanKey = `${header}\n${wrappedBody}${footer}\n`;
  }

  try {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: cleanKey
        }),
        databaseURL
      });
      console.log("✅ Firebase Admin SDK initialized (File-less mode)");
    }
    appInitialized = true;
  } catch (err) {
    console.error("❌ Firebase Auth Failed:", err.message);
    throw err;
  }
}

function getDb() {
  if (!appInitialized) {
    throw new Error("Firebase has not been initialized. Call connectDB() first.");
  }
  return admin.database();
}

module.exports = {
  connectDB,
  getDb
};
