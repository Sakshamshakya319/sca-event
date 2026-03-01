const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: false
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/tasks", require("./routes/task.routes"));
app.use("/api/profile", require("./routes/profile.routes"));
app.use("/api/contact", require("./routes/contact.routes"));
app.use("/api/events", require("./routes/event.routes"));

const port = process.env.PORT || 4000;

const frontendDir = path.join(__dirname, "..", "frontend");
const distDir = path.join(frontendDir, "dist");

if (process.env.NODE_ENV === "production") {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ message: "Not found" });
    }
    res.sendFile(path.join(distDir, "index.html"));
  });
} else {
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json({
      message:
        "Frontend is served separately by the Vite dev server (http://localhost:5173)"
    });
  });
}

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log("SCA EMS API listening on port " + port);
    });
  })
  .catch(err => {
    console.error("Failed to initialize Firebase", err.message || err);
    process.exit(1);
  });
