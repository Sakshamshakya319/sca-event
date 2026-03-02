const express = require("express");
const jwt = require("jsonwebtoken");
const { getDb } = require("../config/db");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

const withTimeout = (promise, ms = 5000, timeoutError = new Error("Firebase timeout")) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(timeoutError), ms))
  ]);
};

router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message, category, universityId, role } =
      req.body || {};
    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ message: "Name, email and message are required" });
    }

    let userMeta = null;
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (token) {
      try {
        const secret = process.env.JWT_SECRET || "sca-ems-demo-secret";
        const payload = jwt.verify(token, secret);
        userMeta = {
          id: payload.id,
          role: payload.role,
          name: payload.name,
          identifier: payload.identifier
        };
      } catch {
        userMeta = null;
      }
    }

    const db = getDb();
    const ref = db.ref("contactMessages").push();
    const now = Date.now();

    const payload = {
      name,
      email,
      subject: subject || "",
      message,
      category: category || "",
      universityId: universityId || null,
      role: role || null,
      status: "new",
      createdAt: now,
      userId: userMeta ? userMeta.id : null,
      userRole: userMeta ? userMeta.role : null,
      userIdentifier: userMeta ? userMeta.identifier : null
    };

    await withTimeout(ref.set(payload));

    return res.status(201).json({ id: ref.key });
  } catch (err) {
    console.error("Firebase error submitting contact query:", err.message || err);
    return res.status(500).json({ message: "Failed to submit contact query: " + (err.message || "Unknown error") });
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const db = getDb();
    const ref = db.ref("contactMessages");
    const snapshot = await withTimeout(ref.once("value"));
    const data = snapshot.val() || {};
    const items = Object.entries(data).map(([id, value]) => ({
      id,
      ...value
    }));
    items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return res.json(items);
  } catch (err) {
    console.error("Firebase error loading contact queries:", err.message || err);
    return res.status(500).json({ message: "Failed to load contact queries: " + (err.message || "Unknown error") });
  }
});

module.exports = router;

