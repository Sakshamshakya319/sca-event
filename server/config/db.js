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

  // 2. Handle both literal newlines and escaped \n characters
  if (formattedPrivateKey.includes("\\n")) {
    formattedPrivateKey = formattedPrivateKey.split("\\n").join("\n");
  }

  // 3. If it's still all on one line and missing \n, it might be corrupted
  if (!formattedPrivateKey.includes("\n") && formattedPrivateKey.includes(" ")) {
    console.warn("Firebase Private Key looks like it might be space-separated instead of newline-separated.");
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
