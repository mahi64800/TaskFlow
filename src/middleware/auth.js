const { HttpError } = require("../lib/httpError");
const { verifyToken } = require("../lib/token");
const { readDatabase, withoutSensitiveUserFields } = require("../data/store");

function requireAuth(req, _res, next) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return next(new HttpError(401, "Authorization token is missing."));
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = verifyToken(token);
    const db = readDatabase();
    const user = db.users.find((item) => item.id === Number(payload.sub));

    if (!user) {
      throw new HttpError(401, "User associated with this token no longer exists.");
    }

    req.user = withoutSensitiveUserFields(user);
    return next();
  } catch (error) {
    const authError =
      error instanceof HttpError ? error : new HttpError(401, "Invalid or expired token.");
    return next(authError);
  }
}

module.exports = { requireAuth };
