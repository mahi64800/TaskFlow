const path = require("path");

const port = Number(process.env.PORT || 3000);
const apiPrefix = "/api/v1";
const jwtSecret = process.env.JWT_SECRET || "development-secret-change-me";
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "2h";
const dataFile =
  process.env.DATA_FILE || path.join(__dirname, "..", "data", "db.json");

const defaultAdmin = {
  name: process.env.ADMIN_NAME || "System Admin",
  email: (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase(),
  password: process.env.ADMIN_PASSWORD || "Admin@12345",
};

module.exports = {
  apiPrefix,
  dataFile,
  defaultAdmin,
  jwtExpiresIn,
  jwtSecret,
  port,
};
