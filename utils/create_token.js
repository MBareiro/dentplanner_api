const jwt = require("jsonwebtoken");

const createToken = (user) => {
    const payload = {
      user_id: user.id,
      user_role: user.role_id,
    };
    return jwt.sign(payload, process.env.JWT_SECRET);
  };

  module.exports = { createToken };
