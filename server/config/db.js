const admin = require("firebase-admin");
const path = require("path");

let appInitialized = false;

async function connectDB() {
  if (appInitialized) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const databaseURL = process.env.FIREBASE_DB_URL;

  let credentialConfig;

  if (!privateKey || privateKey.includes("YOUR_PRIVATE_KEY_LINES")) {
    const serviceAccountPath = path.join(
      __dirname,
      "..",
      "..",
      "sca-lpu-firebase-adminsdk.json"
    );
    credentialConfig = require(serviceAccountPath);
  } else {
    if (!projectId || !clientEmail || !databaseURL) {
      throw new Error("Missing Firebase environment variables");
    }
    credentialConfig = {
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n")
    };
  }

  admin.initializeApp({
    credential: admin.credential.cert(credentialConfig),
    databaseURL:
      databaseURL ||
      `https://${credentialConfig.project_id}-default-rtdb.firebaseio.com`
  });

  appInitialized = true;
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
