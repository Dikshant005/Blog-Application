const User = require("../models/user");
const { validateToken } = require("../services/authentication");

function checkForAuthenticationCookie(cookieName) {
  return async (req, res, next) => {
    const cookies = req.cookies || {};
    const tokenCookieValue = cookies[cookieName];
    if (!tokenCookieValue) {
      return next();
    }

    try {
      // Validate the JWT token and get the payload
      const userPayload = validateToken(tokenCookieValue);

      // Fetch user from DB by ID from the token payload
      const user = await User.findById(userPayload._id);

      // Attach the full user object to req.user
      req.user = user;
    } catch (error) {
      console.error("Authentication middleware error:", error);
    }

    return next();
  };
}

module.exports = {
  checkForAuthenticationCookie,
};
