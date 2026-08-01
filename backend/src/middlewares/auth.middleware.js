const jwt = require("jsonwebtoken");
const { AppConfig } = require("../config/config");
const userSvc = require("../modules/users/user.service");

/**
 * auth middleware - verifies JWT from either:
 *  - httpOnly cookie "token"
 *  - Authorization: Bearer <token> header
 *
 * if `required` is false, the middleware will NOT throw when no token is
 * present, but will still attach `req.loggedInUser` if a valid token exists.
 * This is useful for routes that behave differently for logged in vs guest users.
 */
const auth = (required = true) => {
  return async (req, res, next) => {
    try {
      let token = null;

      if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
      } else if (req.headers["authorization"]) {
        token = req.headers["authorization"].replace("Bearer ", "");
      }

      if (!token) {
        if (required) {
          throw {
            code: 401,
            message: "You must be logged in to access this resource",
            status: "ERR_AUTH_TOKEN_MISSING",
          };
        }
        return next();
      }

      let payload;
      try {
        payload = jwt.verify(token, AppConfig.jwtSecret);
      } catch (err) {
        throw {
          code: 401,
          message: "Session expired or invalid. Please login again",
          status: "ERR_AUTH_TOKEN_INVALID",
        };
      }

      const user = await userSvc.getById(payload.sub);
      if (!user) {
        throw {
          code: 401,
          message: "User not found",
          status: "ERR_USER_NOT_FOUND",
        };
      }

      req.loggedInUser = {
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
      };

      next();
    } catch (exception) {
      next(exception);
    }
  };
};

module.exports = auth;
