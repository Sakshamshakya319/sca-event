const express = require("express");
const { getDb } = require("../config/db");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

const withTimeout = (promise, ms = 5000, timeoutError = new Error("Firebase timeout")) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(timeoutError), ms))
  ]);
};

router.use(authenticate);

router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const ref = db.ref(`tasks/${req.user.id}`);
    const snapshot = await withTimeout(ref.once("value"));
    const data = snapshot.val() || {};
    const items = Object.entries(data).map(([id, value]) => ({
      _id: id,
      ...value
    }));
    items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return res.json(items);
  } catch (err) {
    console.error("Firebase error loading tasks:", err.message || err);
    return res.status(500).json({ message: "Failed to load tasks: " + (err.message || "Unknown error") });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, eventName, priority, dueDate } = req.body || {};
    if (!title || !eventName) {
      return res.status(400).json({ message: "Title and event name are required" });
    }
    const db = getDb();
    const ref = db.ref(`tasks/${req.user.id}`).push();
    const now = Date.now();
    const taskData = {
      ownerId: req.user.id,
      ownerRole: req.user.role,
      title,
      eventName,
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      completed: false,
      createdAt: now,
      updatedAt: now
    };
    await withTimeout(ref.set(taskData));
    return res.status(201).json({
      _id: ref.key,
      ...taskData
    });
  } catch (err) {
    console.error("Firebase error creating task:", err.message || err);
    return res.status(500).json({ message: "Failed to create task: " + (err.message || "Unknown error") });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const ref = db.ref(`tasks/${req.user.id}/${id}`);
    const snapshot = await withTimeout(ref.once("value"));
    const existing = snapshot.val();
    if (!existing) {
      return res.status(404).json({ message: "Task not found" });
    }
    const updates = {};
    if (typeof req.body.completed === "boolean") {
      updates.completed = req.body.completed;
    }
    if (req.body.title) {
      updates.title = req.body.title;
    }
    if (req.body.priority) {
      updates.priority = req.body.priority;
    }
    if (req.body.dueDate !== undefined) {
      updates.dueDate = req.body.dueDate
        ? new Date(req.body.dueDate).toISOString()
        : null;
    }
    updates.updatedAt = Date.now();
    await withTimeout(ref.update(updates));
    return res.json({
      _id: id,
      ...existing,
      ...updates
    });
  } catch (err) {
    console.error("Firebase error updating task:", err.message || err);
    return res.status(500).json({ message: "Failed to update task: " + (err.message || "Unknown error") });
  }
});

module.exports = router;
