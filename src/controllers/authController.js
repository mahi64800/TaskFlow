const { comparePassword, hashPassword } = require("../lib/password");
const { HttpError } = require("../lib/httpError");
const { signToken } = require("../lib/token");
const {
  validateLoginPayload,
  validateRegistrationPayload,
} = require("../lib/validators");
const { readDatabase, updateDatabase, withoutSensitiveUserFields } = require("../data/store");

function buildAuthResponse(user) {
  const safeUser = withoutSensitiveUserFields(user);

  return {
    token: signToken(safeUser),
    user: safeUser,
  };
}

function register(req, res, next) {
  try {
    const payload = validateRegistrationPayload(req.body);

    const newUser = updateDatabase((db) => {
      const existingUser = db.users.find((user) => user.email === payload.email);

      if (existingUser) {
        throw new HttpError(409, "An account with this email already exists.");
      }

      const now = new Date().toISOString();
      const id = db.counters.users + 1;
      db.counters.users = id;

      const user = {
        createdAt: now,
        email: payload.email,
        id,
        name: payload.name,
        passwordHash: hashPassword(payload.password),
        role: "user",
        updatedAt: now,
      };

      db.users.push(user);
      return user;
    });

    return res.status(201).json({
      data: buildAuthResponse(newUser),
      message: "Registration successful.",
    });
  } catch (error) {
    return next(error);
  }
}

function login(req, res, next) {
  try {
    const payload = validateLoginPayload(req.body);
    const db = readDatabase();
    const user = db.users.find((item) => item.email === payload.email);

    if (!user || !comparePassword(payload.password, user.passwordHash)) {
      throw new HttpError(401, "Invalid email or password.");
    }

    return res.json({
      data: buildAuthResponse(user),
      message: "Login successful.",
    });
  } catch (error) {
    return next(error);
  }
}

function getCurrentUser(req, res) {
  res.json({
    data: req.user,
  });
}

module.exports = {
  getCurrentUser,
  login,
  register,
};
