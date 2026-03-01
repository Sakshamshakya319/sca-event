const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }
  try {
    const secret = process.env.JWT_SECRET || "sca-ems-demo-secret";
    const payload = jwt.verify(token, secret);
    req.user = {
      id: payload.id,
      role: payload.role,
      name: payload.name,
      identifier: payload.identifier
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = authenticate;
