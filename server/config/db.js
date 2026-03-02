const admin = require("firebase-admin");
const path = require("path");

let appInitialized = false;

async function connectDB() {
  if (appInitialized) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const databaseURL = process.env.FIREBASE_DB_URL;

  if (!projectId || !clientEmail || !privateKey || !databaseURL) {
    console.error("Missing Firebase environment variables:", {
      projectId: !!projectId,
      clientEmail: !!clientEmail,
      privateKey: !!privateKey,
      databaseURL: !!databaseURL
    });
    throw new Error("Missing Firebase environment variables");
  }

  let formattedPrivateKey = privateKey;
  
  // 1. Remove any surrounding quotes (single or double)
  formattedPrivateKey = formattedPrivateKey.trim().replace(/^["']|["']$/g, "");

  // 2. Handle escaped newlines (\n as a string)
  if (formattedPrivateKey.includes("\\n")) {
    formattedPrivateKey = formattedPrivateKey.split("\\n").join("\n");
  }

  // 3. Fix "Mangled Key" issue: If it's all on one line with spaces instead of newlines
  // This happens when pasting from a JSON file into some dashboards
  if (!formattedPrivateKey.includes("\n") && formattedPrivateKey.includes(" ")) {
    // If it starts with the header but has no newlines, it's definitely mangled
    const header = "-----BEGIN PRIVATE KEY-----";
    const footer = "-----END PRIVATE KEY-----";
    if (formattedPrivateKey.startsWith(header) && formattedPrivateKey.includes(footer)) {
      let body = formattedPrivateKey
        .replace(header, "")
        .replace(footer, "")
        .trim();
      // Replace all spaces in the body with nothing (it's base64)
      body = body.split(" ").join("");
      // Reconstruct with proper newlines (64 chars per line is standard but not strictly required)
      formattedPrivateKey = `${header}\n${body}\n${footer}`;
    }
  }

  // 4. Final verification: ensure it has at least the header and footer
  if (!formattedPrivateKey.includes("-----BEGIN PRIVATE KEY-----")) {
    console.error("CRITICAL: FIREBASE_PRIVATE_KEY is missing the 'BEGIN' header.");
  }

  const credentialConfig = {
    projectId,
    clientEmail,
    privateKey: formattedPrivateKey
  };

  try {
    admin.initializeApp({
      credential: admin.credential.cert(credentialConfig),
      databaseURL: databaseURL
    });
    console.log("Firebase initialized successfully for project:", projectId);
    appInitialized = true;
  } catch (err) {
    console.error("Firebase initialization failed:", err.message);
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
