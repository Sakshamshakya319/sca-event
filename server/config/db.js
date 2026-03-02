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
  // Handle quotes if they exist
  if (formattedPrivateKey.startsWith('"') && formattedPrivateKey.endsWith('"')) {
    formattedPrivateKey = formattedPrivateKey.slice(1, -1);
  } else if (formattedPrivateKey.startsWith("'") && formattedPrivateKey.endsWith("'")) {
    formattedPrivateKey = formattedPrivateKey.slice(1, -1);
  }
  
  // Handle escaped newlines (\n as a string)
  formattedPrivateKey = formattedPrivateKey.split("\\n").join("\n");

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
