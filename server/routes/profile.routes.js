const express = require("express");
const { getDb } = require("../config/db");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

router.use(authenticate);

router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const ref = db.ref(`profiles/${req.user.id}`);
    const snapshot = await ref.once("value");
    const data = snapshot.val() || null;
    return res.json(
      data || {
        fullName: req.user.name || "",
        identifier: req.user.identifier || "",
        program: "",
        degree: "",
        semester: "",
        section: "",
        universityEmail: "",
        personalEmail: "",
        phone: "",
        photoUrl: "",
        updatedAt: null
      }
    );
  } catch (err) {
    return res.status(500).json({ message: "Failed to load profile" });
  }
});

router.put("/", async (req, res) => {
  try {
    const {
      fullName,
      identifier,
      program,
      degree,
      semester,
      section,
      universityEmail,
      personalEmail,
      phone,
      photoUrl
    } = req.body || {};

    const profile = {
      fullName: fullName || "",
      identifier: identifier || "",
      program: program || "",
      degree: degree || "",
      semester: semester || "",
      section: section || "",
      universityEmail: universityEmail || "",
      personalEmail: personalEmail || "",
      phone: phone || "",
      photoUrl: photoUrl || "",
      updatedAt: Date.now()
    };

    const db = getDb();
    const ref = db.ref(`profiles/${req.user.id}`);
    await ref.set(profile);

    return res.json(profile);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update profile" });
  }
});

module.exports = router;

