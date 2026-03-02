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

app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "Not found" });
  }
  res.json({
    message: "SCA EMS API Server is running successfully."
  });
});

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
