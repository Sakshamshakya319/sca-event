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
  
  // 1. Remove surrounding quotes and whitespace
  formattedPrivateKey = formattedPrivateKey.trim().replace(/^["']|["']$/g, "");

  // 2. Fix Render's common mangling (replacing \n with spaces or literal \\n)
  if (formattedPrivateKey.includes("\\n")) {
    formattedPrivateKey = formattedPrivateKey.split("\\n").join("\n");
  }

  // 3. Surgical Reconstruction:
  // If the key is one long line (no actual newlines), Google will reject it.
  // We extract the base64 body, clean it, and re-insert proper newlines.
  const header = "-----BEGIN PRIVATE KEY-----";
  const footer = "-----END PRIVATE KEY-----";
  
  if (formattedPrivateKey.includes(header) && formattedPrivateKey.includes(footer)) {
    let body = formattedPrivateKey
      .replace(header, "")
      .replace(footer, "")
      .replace(/\s/g, ""); // Remove ALL spaces, tabs, and newlines from the body
    
    // Google expects the key body to be clean Base64. 
    // We wrap it properly with the header/footer and real newlines.
    formattedPrivateKey = `${header}\n${body}\n${footer}`;
  }

  const credentialConfig = {
    projectId,
    clientEmail,
    privateKey: formattedPrivateKey
  };

  try {
    // Only initialize if no apps exist to avoid "already exists" errors during hot-reloads
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(credentialConfig),
        databaseURL: databaseURL
      });
      console.log("✅ Firebase initialized successfully");
    }
    appInitialized = true;
  } catch (err) {
    console.error("❌ Firebase Auth Failed:", err.message);
    // Log the key length to help the user verify they didn't copy a partial key
    console.log(`Diagnostic: Key Length = ${privateKey.length} chars`);
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
