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
    const ref = db.ref("events");
    const snapshot = await withTimeout(ref.once("value"));
    const data = snapshot.val() || {};
    const items = Object.entries(data).map(([id, value]) => ({
      id,
      ...value
    }));
    const { status } = req.query || {};
    let filtered =
      status && status !== "all"
        ? items.filter(e => e.status === status)
        : items;

    if (req.user && req.user.role === "student") {
      const idNorm = String(req.user.identifier || "")
        .trim()
        .toLowerCase();
      filtered = filtered.filter(e => {
        const students = e.students || {};
        const values = Object.values(students);
        if (!values.length) return false;
        return values.some(
          s =>
            s &&
            String(s.identifier || "")
              .trim()
              .toLowerCase() === idNorm
        );
      });
      console.log(`[DEBUG] Student ${idNorm} has ${filtered.length} assigned events`);
      filtered.forEach(e => {
        console.log(`[DEBUG] Event: ${e.title}, Students:`, Object.values(e.students || {}).map(s => s.identifier));
      });
    }
    filtered.sort((a, b) => {
      const ad = a.date || "";
      const bd = b.date || "";
      if (ad < bd) return -1;
      if (ad > bd) return 1;
      return 0;
    });
    return res.json(filtered);
  } catch (err) {
    console.error("Firebase error loading events:", err.message || err);
    return res.status(500).json({ message: "Failed to load events: " + (err.message || "Unknown error") });
  }
});

router.post("/", async (req, res) => {
  if (
    req.user.role !== "admin" &&
    req.user.role !== "superadmin" &&
    req.user.role !== "faculty"
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const { title, date, time, venue, eventType, expectedAudience, facultyName, facultyIdentifier, description, important } =
    req.body || {};
  if (!title || !date) {
    return res
      .status(400)
      .json({ message: "Title and date are required to create event" });
  }
  const rawDate = String(date).trim();
  let isoDate;
  try {
    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) {
      return res.status(400).json({ message: "Invalid event date" });
    }
    isoDate = parsed.toISOString();
  } catch {
    return res.status(400).json({ message: "Invalid event date" });
  }
  const now = Date.now();
  try {
    const db = getDb();
    const ref = db.ref("events").push();
    const event = {
      title,
      date: isoDate,
      time: time || "",
      venue: venue || "",
      eventType: eventType || "",
      expectedAudience: expectedAudience || "",
      facultyName: facultyName || "",
      facultyIdentifier: facultyIdentifier || "",
      description: description || "",
      important: !!important,
      status:
        req.user.role === "faculty"
          ? "pending"
          : "approved",
      createdBy: req.user.id,
      createdRole: req.user.role,
      createdAt: now
    };
    await withTimeout(ref.set(event));
    return res.status(201).json({
      id: ref.key,
      ...event
    });
  } catch (err) {
    console.error("Firebase error creating event:", err.message || err);
    return res.status(500).json({ message: "Failed to create event: " + (err.message || "Unknown error") });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  if (
    req.user.role !== "admin" &&
    req.user.role !== "superadmin" &&
    req.user.role !== "faculty"
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { title, date, time, venue, eventType, expectedAudience, facultyName, facultyIdentifier, description, important, status } = req.body || {};

  if (!title || !date) {
    return res.status(400).json({ message: "Title and date are required" });
  }

  const rawDate = String(date).trim();
  let isoDate;
  try {
    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) {
      return res.status(400).json({ message: "Invalid event date" });
    }
    isoDate = parsed.toISOString();
  } catch {
    return res.status(400).json({ message: "Invalid event date" });
  }

  try {
    const db = getDb();
    const ref = db.ref(`events/${id}`);
    const snapshot = await withTimeout(ref.once("value"));
    if (!snapshot.val()) {
      return res.status(404).json({ message: "Event not found" });
    }

    const currentEvent = snapshot.val();

    // Faculty can only edit their own events
    if (req.user.role === "faculty") {
      if (currentEvent.facultyIdentifier !== req.user.identifier && currentEvent.createdBy !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: You can only edit your own events" });
      }
    }

    const updates = {
      title,
      date: isoDate,
      time: time || "",
      venue: venue || "",
      eventType: eventType || "",
      expectedAudience: expectedAudience || "",
      facultyName: facultyName || currentEvent.facultyName || "",
      facultyIdentifier: facultyIdentifier || currentEvent.facultyIdentifier || "",
      description: description || "",
      important: !!important,
      updatedAt: Date.now()
    };

    // Only admins/superadmins can update status directly via PUT
    if ((req.user.role === "admin" || req.user.role === "superadmin") && status) {
      const allowedStatuses = ["pending", "approved", "rejected", "completed"];
      if (allowedStatuses.includes(status)) {
        updates.status = status;
      }
    }

    await withTimeout(ref.update(updates));

    const updatedSnap = await withTimeout(ref.once("value"));
    return res.json({
      id,
      ...updatedSnap.val()
    });
  } catch (error) {
    console.error("Firebase error updating event:", error.message || error);
    return res.status(500).json({ message: "Failed to update event: " + (error.message || "Unknown error") });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Forbidden: Only admins can delete events" });
  }

  try {
    const db = getDb();
    const ref = db.ref(`events/${id}`);
    const snapshot = await withTimeout(ref.once("value"));
    if (!snapshot.val()) {
      return res.status(404).json({ message: "Event not found" });
    }

    await withTimeout(ref.remove());
    return res.status(204).send();
  } catch (error) {
    console.error("Firebase error deleting event:", error.message || error);
    return res.status(500).json({ message: "Failed to delete event: " + (error.message || "Unknown error") });
  }
});

router.post("/:id/todos", async (req, res) => {
  const { id } = req.params;
  if (
    req.user.role !== "admin" &&
    req.user.role !== "superadmin" &&
    req.user.role !== "faculty"
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const { title, important, audience } = req.body || {};
  if (!title) {
    return res.status(400).json({ message: "Task title is required" });
  }
  try {
    const db = getDb();
    const eventRef = db.ref(`events/${id}`);
    const snapshot = await withTimeout(eventRef.once("value"));
    if (!snapshot.val()) {
      return res.status(404).json({ message: "Event not found" });
    }
    const todoRef = eventRef.child("todos").push();
    const allowedAudiences = ["faculty", "students", "all"];
    const normalizedAudience = allowedAudiences.includes(audience)
      ? audience
      : "students";
    const todo = {
      title,
      important: !!important,
      audience: normalizedAudience,
      completed: false,
      createdAt: Date.now()
    };
    await withTimeout(todoRef.set(todo));
    const updatedSnap = await withTimeout(eventRef.once("value"));
    const value = updatedSnap.val();
    return res.status(201).json({
      id,
      ...value
    });
  } catch (err) {
    console.error("Firebase error adding task:", err.message || err);
    return res.status(500).json({ message: "Failed to add task: " + (err.message || "Unknown error") });
  }
});

router.post("/:id/students", async (req, res) => {
  const { id } = req.params;
  if (
    req.user.role !== "admin" &&
    req.user.role !== "superadmin" &&
    req.user.role !== "faculty"
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const { identifier, name } = req.body || {};
  const trimmedIdentifier = String(identifier || "").trim();
  if (!trimmedIdentifier) {
    return res
      .status(400)
      .json({ message: "Student identifier is required" });
  }
  try {
    const db = getDb();
    const eventRef = db.ref(`events/${id}`);
    const studentsRef = eventRef.child("students").push();
    const student = {
      identifier: trimmedIdentifier,
      name: name || "",
      assignedBy: req.user.id,
      assignedRole: req.user.role,
      assignedAt: Date.now()
    };
    await withTimeout(studentsRef.set(student));
    const updatedSnap = await withTimeout(eventRef.once("value"));
    const value = updatedSnap.val() || {};
    return res.status(201).json({ id, ...value });
  } catch (err) {
    console.error("Firebase error assigning student:", err.message || err);
    return res.status(500).json({ message: "Failed to assign student: " + (err.message || "Unknown error") });
  }
});

router.delete("/:id/students/:studentId", async (req, res) => {
  const { id, studentId } = req.params;
  if (
    req.user.role !== "admin" &&
    req.user.role !== "superadmin" &&
    req.user.role !== "faculty"
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }
  try {
    const db = getDb();
    const eventRef = db.ref(`events/${id}`);
    const studentRef = eventRef.child(`students/${studentId}`);
    await withTimeout(studentRef.remove());
    const updatedSnap = await withTimeout(eventRef.once("value"));
    const value = updatedSnap.val() || {};
    return res.json({ id, ...value });
  } catch (err) {
    console.error("Firebase error removing student:", err.message || err);
    return res.status(500).json({ message: "Failed to remove student: " + (err.message || "Unknown error") });
  }
});

router.patch("/:id/todos/:todoId", async (req, res) => {
  const { id, todoId } = req.params;
  if (
    req.user.role !== "admin" &&
    req.user.role !== "superadmin" &&
    req.user.role !== "faculty" &&
    req.user.role !== "student"
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const { completed } = req.body || {};
  try {
    const db = getDb();
    const eventRef = db.ref(`events/${id}`);
    const eventSnap = await eventRef.once("value");
    const eventData = eventSnap.val();
    if (!eventData) {
      return res.status(404).json({ message: "Event not found" });
    }
    const todoRef = db.ref(`events/${id}/todos/${todoId}`);
    const snapshot = await todoRef.once("value");
    const todoData = snapshot.val();
    if (!todoData) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (req.user.role === "student") {
      const students = eventData.students || {};
      const idNorm = String(req.user.identifier || "")
        .trim()
        .toLowerCase();
      const isAssigned = Object.values(students).some(s => {
        if (!s) return false;
        const studentIdNorm = String(s.identifier || "")
          .trim()
          .toLowerCase();
        return studentIdNorm && studentIdNorm === idNorm;
      });
      if (!isAssigned) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const audience = todoData.audience || "students";
      if (audience === "faculty") {
        return res.status(403).json({ message: "Forbidden" });
      }
    }
    const updates = {};
    if (typeof completed === "boolean") {
      updates.completed = completed;
    }
    updates.updatedAt = Date.now();
    await todoRef.update(updates);
    const updatedEventSnap = await eventRef.once("value");
    const value = updatedEventSnap.val();
    return res.json({
      id,
      ...value
    });
  } catch {
    return res.status(500).json({ message: "Failed to update task" });
  }
});

router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  const { status } = req.body || {};
  const allowed = ["pending", "approved", "rejected", "completed"];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  try {
    const db = getDb();
    const ref = db.ref(`events/${id}`);
    const snapshot = await withTimeout(ref.once("value"));
    if (!snapshot.val()) {
      return res.status(404).json({ message: "Event not found" });
    }
    await withTimeout(ref.update({
      status,
      statusUpdatedAt: Date.now()
    }));
    const updated = await withTimeout(ref.once("value"));
    const value = updated.val();
    return res.json({
      id,
      ...value
    });
  } catch (err) {
    console.error("Firebase error updating status:", err.message || err);
    return res.status(500).json({ message: "Failed to update status: " + (err.message || "Unknown error") });
  }
});

module.exports = router;
