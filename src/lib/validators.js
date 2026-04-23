const { HttpError } = require("./httpError");
const {
  sanitizeEmail,
  sanitizeOptionalString,
  sanitizeString,
} = require("./sanitize");

const validStatuses = new Set(["todo", "in-progress", "done"]);
const validPriorities = new Set(["low", "medium", "high"]);

function requireStrongPassword(password) {
  if (typeof password !== "string" || password.length < 8) {
    throw new HttpError(400, "Password must be at least 8 characters long.");
  }

  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    throw new HttpError(
      400,
      "Password must include at least one uppercase letter, one lowercase letter, and one number."
    );
  }

  return password;
}

function validateRegistrationPayload(body) {
  return {
    name: sanitizeString(body.name, "Name", { maxLength: 80 }),
    email: sanitizeEmail(body.email),
    password: requireStrongPassword(body.password),
  };
}

function validateLoginPayload(body) {
  return {
    email: sanitizeEmail(body.email),
    password: typeof body.password === "string" ? body.password : "",
  };
}

function normalizeDate(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new HttpError(400, "dueDate must be a valid ISO date string.");
  }

  return parsed.toISOString();
}

function validateTaskPayload(body, options = {}) {
  const { partial = false } = options;
  const payload = {};

  if (!partial || body.title !== undefined) {
    payload.title = sanitizeString(body.title, "Title", { maxLength: 120 });
  }

  if (!partial || body.description !== undefined) {
    payload.description = sanitizeOptionalString(body.description, "Description", {
      maxLength: 1000,
    });
  }

  if (!partial || body.status !== undefined) {
    const status = sanitizeString(body.status, "Status", { maxLength: 20 }).toLowerCase();

    if (!validStatuses.has(status)) {
      throw new HttpError(400, "Status must be one of: todo, in-progress, done.");
    }

    payload.status = status;
  }

  if (!partial || body.priority !== undefined) {
    const priority = sanitizeString(body.priority, "Priority", { maxLength: 20 }).toLowerCase();

    if (!validPriorities.has(priority)) {
      throw new HttpError(400, "Priority must be one of: low, medium, high.");
    }

    payload.priority = priority;
  }

  if (!partial || body.dueDate !== undefined) {
    payload.dueDate = normalizeDate(body.dueDate);
  }

  return payload;
}

function parseNumericId(value, field = "id") {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new HttpError(400, `${field} must be a positive integer.`);
  }

  return parsed;
}

module.exports = {
  parseNumericId,
  validPriorities,
  validStatuses,
  validateLoginPayload,
  validateRegistrationPayload,
  validateTaskPayload,
};
