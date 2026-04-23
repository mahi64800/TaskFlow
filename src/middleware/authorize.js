const { HttpError } = require("../lib/httpError");

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new HttpError(401, "Authentication is required."));
    }

    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, "You do not have permission to perform this action."));
    }

    return next();
  };
}

module.exports = { authorize };
