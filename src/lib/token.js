const jwt = require("jsonwebtoken");
const { jwtExpiresIn, jwtSecret } = require("../config");

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
}

function verifyToken(token) {
  return jwt.verify(token, jwtSecret);
}

module.exports = {
  signToken,
  verifyToken,
};
