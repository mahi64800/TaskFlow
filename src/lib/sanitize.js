const { HttpError } = require("./httpError");

function collapseWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function sanitizeString(value, field, options = {}) {
  const { allowEmpty = false, maxLength = 255 } = options;

  if (typeof value !== "string") {
    throw new HttpError(400, `${field} must be a string.`);
  }

  const sanitized = collapseWhitespace(value.replace(/[<>]/g, ""));

  if (!allowEmpty && !sanitized) {
    throw new HttpError(400, `${field} is required.`);
  }

  if (sanitized.length > maxLength) {
    throw new HttpError(400, `${field} must be at most ${maxLength} characters.`);
  }

  return sanitized;
}

function sanitizeOptionalString(value, field, options = {}) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return sanitizeString(value, field, options);
}

function sanitizeEmail(email) {
  const sanitized = sanitizeString(email, "Email", { maxLength: 320 }).toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(sanitized)) {
    throw new HttpError(400, "Email must be a valid email address.");
  }

  return sanitized;
}

module.exports = {
  sanitizeEmail,
  sanitizeOptionalString,
  sanitizeString,
};
