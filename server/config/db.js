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
  
  // 1. Remove any surrounding quotes and whitespace
  formattedPrivateKey = formattedPrivateKey.trim().replace(/^["']|["']$/g, "");

  // 2. Handle literal \n strings (common in Render/Heroku)
  formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, "\n");

  // 3. Perfect PEM Reconstruction
  // This ensures the key has the exact headers, footers, and 64-character line wrapping
  const header = "-----BEGIN PRIVATE KEY-----";
  const footer = "-----END PRIVATE KEY-----";

  if (formattedPrivateKey.includes(header) && formattedPrivateKey.includes(footer)) {
    // Extract only the Base64 content between the headers
    let base64Body = formattedPrivateKey
      .split(header)[1]
      .split(footer)[0]
      .replace(/\s+/g, ""); // Remove ALL spaces, tabs, and newlines

    // Rebuild the key with standard 64-character line breaks
    let wrappedBody = "";
    for (let i = 0; i < base64Body.length; i += 64) {
      wrappedBody += base64Body.substring(i, i + 64) + "\n";
    }

    formattedPrivateKey = `${header}\n${wrappedBody}${footer}\n`;
  }

  const credentialConfig = {
    projectId: projectId.trim(),
    clientEmail: clientEmail.trim(),
    privateKey: formattedPrivateKey
  };

  try {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(credentialConfig),
        databaseURL: databaseURL.trim().replace(/\/$/, "") // Remove trailing slash
      });
      console.log("✅ Firebase Admin SDK initialized successfully");
    }
    appInitialized = true;
  } catch (err) {
    console.error("❌ Firebase Initialization Error:", err.message);
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
