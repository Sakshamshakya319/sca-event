const express = require("express");
const jwt = require("jsonwebtoken");
const { getDb } = require("../config/db");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

const withTimeout = (promise, ms = 3000, timeoutError = new Error("Firebase timeout")) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(timeoutError), ms))
  ]);
};

const demoUsers = [
  {
    id: "superadmin-1",
    role: "superadmin",
    identifier: "sca@admin.lpu",
    password: "sca@admin@nrt*gam",
    name: "Superadmin",
    mustChangePassword: false
  },
  {
    id: "admin-1",
    role: "admin",
    identifier: "admin@sca.lpu.edu.in",
    password: "admin123",
    name: "Dr. Admin",
    mustChangePassword: false
  },
  {
    id: "faculty-1",
    role: "faculty",
    identifier: "faculty@lpu.co.in",
    password: "faculty123",
    name: "Prof. P. Sharma",
    mustChangePassword: false
  },
  {
    id: "student-1",
    role: "student",
    identifier: "12201234",
    password: "student123",
    name: "Rahul Verma",
    mustChangePassword: false
  }
];

const dynamicUsers = {
  faculty: {},
  student: {}
};

function generatePassword(length = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    const idx = Math.floor(Math.random() * chars.length);
    out += chars.charAt(idx);
  }
  return out;
}

router.post("/login", async (req, res) => {
  const { role, identifier, password } = req.body || {};
  if (!identifier || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }
  const normalizedIdentifier = String(identifier).trim().toLowerCase();

  const findUserForRole = async roleKey => {
    let found =
      demoUsers.find(
        u =>
          u.role === roleKey &&
          String(u.identifier).trim().toLowerCase() === normalizedIdentifier &&
          u.password === password
      ) || null;
    if (!found && dynamicUsers[roleKey]) {
      const memoryUsers = Object.entries(dynamicUsers[roleKey]).map(
        ([id, value]) => ({
          id,
          ...value
        })
      );
      found =
        memoryUsers.find(
          u =>
            String(u.identifier).trim().toLowerCase() ===
            normalizedIdentifier && u.password === password
        ) || null;
    }
    if (!found && (roleKey === "faculty" || roleKey === "student")) {
      try {
        const db = getDb();
        const ref = db.ref(`users/${roleKey}`);
        const snapshot = await withTimeout(ref.once("value"));
        const data = snapshot.val() || {};
        const createdUsers = Object.entries(data).map(([id, value]) => ({
          id,
          ...value
        }));
        found =
          createdUsers.find(
            u =>
              String(u.identifier).trim().toLowerCase() ===
              normalizedIdentifier && u.password === password
          ) || null;
      } catch {
        found = null;
      }
    }
    return found;
  };

  let user = null;
  if (role) {
    user = await findUserForRole(role);
  } else {
    const rolesToCheck = ["superadmin", "admin", "faculty", "student"];
    // eslint-disable-next-line no-restricted-syntax
    for (const r of rolesToCheck) {
      // eslint-disable-next-line no-await-in-loop
      const candidate = await findUserForRole(r);
      if (candidate) {
        user = candidate;
        break;
      }
    }
  }
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const secret = process.env.JWT_SECRET || "sca-ems-demo-secret";
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      name: user.name,
      identifier: user.identifier
    },
    secret,
    { expiresIn: "5d" }
  );
  return res.json({
    token,
    user: {
      id: user.id,
      role: user.role,
      name: user.name,
      identifier: user.identifier,
      mustChangePassword: !!user.mustChangePassword
    }
  });
});

router.get("/me", (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }
  try {
    const secret = process.env.JWT_SECRET || "sca-ems-demo-secret";
    const payload = jwt.verify(token, secret);
    return res.json({
      id: payload.id,
      role: payload.role,
      name: payload.name,
      identifier: payload.identifier
    });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

router.get("/users", authenticate, async (req, res) => {
  const role = req.query.role;
  if (!role) {
    return res.status(400).json({ message: "Missing role" });
  }
  const allowed = ["faculty", "student"];
  if (!allowed.includes(role)) {
    return res.status(400).json({ message: "Unsupported role" });
  }
  if (
    req.user.role !== "admin" &&
    req.user.role !== "superadmin" &&
    !(req.user.role === "faculty" && role === "student")
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const seeded = demoUsers
    .filter(u => u.role === role)
    .map(u => ({
      id: u.id,
      role: u.role,
      name: u.name,
      identifier: u.identifier,
      password: ""
    }));
  let createdFromDb = [];
  try {
    const db = getDb();
    const ref = db.ref(`users/${role}`);
    const snapshot = await withTimeout(ref.once("value"));
    const data = snapshot.val() || {};
    createdFromDb = Object.entries(data).map(([id, value]) => ({
      id,
      role,
      name: value.name || "",
      identifier: value.identifier,
      password: value.password || "",
      mustChangePassword: !!value.mustChangePassword
    }));
  } catch {
    createdFromDb = [];
  }
  const createdFromMemory = Object.entries(dynamicUsers[role] || {}).map(
    ([id, value]) => ({
      id,
      role: value.role,
      name: value.name || "",
      identifier: value.identifier,
      password: value.password || "",
      mustChangePassword: !!value.mustChangePassword
    })
  );
  return res.json([...seeded, ...createdFromDb, ...createdFromMemory]);
});

router.post("/password", authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const role = req.user.role;
  const id = req.user.id;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Both current and new password are required" });
  }
  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "New password should be at least 6 characters long" });
  }
  if (!["faculty", "student", "admin"].includes(role)) {
    return res.status(400).json({ message: "Password change is not supported for this role" });
  }
  try {
    const db = getDb();
    const ref = db.ref(`users/${role}`);
    const snapshot = await withTimeout(ref.once("value"));
    const data = snapshot.val() || {};
    const existingEntry = Object.entries(data).find(
      ([key]) => key === id
    );
    let userRecord = null;
    if (existingEntry) {
      const [, value] = existingEntry;
      userRecord = { id, ...value };
    } else if (dynamicUsers[role] && dynamicUsers[role][id]) {
      userRecord = { id, ...dynamicUsers[role][id] };
    }
    if (!userRecord) {
      return res.status(404).json({ message: "User not found" });
    }
    if (userRecord.password !== currentPassword) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    const updated = {
      ...userRecord,
      password: newPassword,
      mustChangePassword: false
    };
    try {
      const userRef = db.ref(`users/${role}/${id}`);
      await withTimeout(userRef.update({
        password: newPassword,
        mustChangePassword: false
      }));
    } catch {
    }
    if (!dynamicUsers[role]) {
      dynamicUsers[role] = {};
    }
    dynamicUsers[role][id] = {
      role,
      name: updated.name || "",
      identifier: updated.identifier,
      password: newPassword,
      mustChangePassword: false
    };
    return res.json({ message: "Password updated successfully" });
  } catch {
    return res.status(500).json({ message: "Failed to update password" });
  }
});

router.post("/users", authenticate, async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  const { role, name, identifier } = req.body || {};
  const allowed = ["faculty", "student"];
  if (!role || !identifier) {
    return res.status(400).json({ message: "Role and identifier are required" });
  }
  if (!allowed.includes(role)) {
    return res.status(400).json({ message: "Unsupported role" });
  }
  const trimmedIdentifier = String(identifier).trim();
  if (!trimmedIdentifier) {
    return res.status(400).json({ message: "Identifier is required" });
  }
  const password = generatePassword(10);
  const user = {
    role,
    name: name || "",
    identifier: trimmedIdentifier,
    password,
    mustChangePassword: true
  };
  let id;
  try {
    const db = getDb();
    const ref = db.ref(`users/${role}`).push();
    await withTimeout(ref.set(user));
    id = ref.key;
  } catch {
    id = `mem-${Date.now()}`;
  }
  if (!dynamicUsers[role]) {
    dynamicUsers[role] = {};
  }
  dynamicUsers[role][id] = user;
  return res.status(201).json({
    id,
    ...user
  });
});

router.delete("/users/:role/:id", authenticate, async (req, res) => {
  const { role, id } = req.params;
  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  const allowed = ["faculty", "student"];
  if (!allowed.includes(role)) {
    return res.status(400).json({ message: "Unsupported role" });
  }
  const seeded = demoUsers.find((u) => u.role === role && u.id === id);
  if (seeded) {
    return res.status(400).json({ message: "Cannot delete default demo account" });
  }
  try {
    const db = getDb();
    const ref = db.ref(`users/${role}/${id}`);
    await withTimeout(ref.remove());
  } catch {
  }
  if (dynamicUsers[role] && dynamicUsers[role][id]) {
    delete dynamicUsers[role][id];
  }
  return res.status(204).end();
});

module.exports = router;
