const userSvc = require("../users/user.service");
const authSvc = require("./auth.service");

class AuthController {
  async register(req, res, next) {
    try {
      const { name, username, email, password } = req.body;

      const existing = await userSvc.getByFilter({
        $or: [{ email }, { username }],
      });

      if (existing) {
        const detail = {};
        if (existing.email === email) detail.email = "Email is already registered";
        if (existing.username === username) detail.username = "Username is already taken";
        throw {
          code: 409,
          message: "Account already exists",
          status: "ERR_USER_EXISTS",
          detail,
        };
      }

      const hashedPassword = await authSvc.hashPassword(password);

      const user = await userSvc.createUser({
        name,
        username,
        email,
        password: hashedPassword,
      });

      const token = authSvc.generateToken(user._id);
      authSvc.setTokenCookie(res, token);

      res.status(201).json({
        data: {
          user: userSvc.toPublicProfile(user, user._id),
          token,
        },
        message: "Account created successfully",
        status: "OK",
      });
    } catch (exception) {
      next(exception);
    }
  }

  async login(req, res, next) {
    try {
      const { emailOrUsername, password } = req.body;

      const user = await userSvc.getByEmailOrUsername(emailOrUsername);
      if (!user) {
        throw {
          code: 401,
          message: "Invalid email/username or password",
          status: "ERR_INVALID_CREDENTIALS",
        };
      }

      const isMatch = await authSvc.comparePassword(password, user.password);
      if (!isMatch) {
        throw {
          code: 401,
          message: "Invalid email/username or password",
          status: "ERR_INVALID_CREDENTIALS",
        };
      }

      const token = authSvc.generateToken(user._id);
      authSvc.setTokenCookie(res, token);

      res.json({
        data: {
          user: userSvc.toPublicProfile(user, user._id),
          token,
        },
        message: "Logged in successfully",
        status: "OK",
      });
    } catch (exception) {
      next(exception);
    }
  }

  async logout(req, res, next) {
    try {
      authSvc.clearTokenCookie(res);
      res.json({
        data: null,
        message: "Logged out successfully",
        status: "OK",
      });
    } catch (exception) {
      next(exception);
    }
  }

  async socketToken(req, res, next) {
    try {
      // Issues a fresh short-lived JWT specifically for the socket handshake.
      // The client can't read the httpOnly cookie, so this REST call (which
      // is authenticated via the cookie) lets the frontend get a token it
      // can pass as socket auth.
      const token = authSvc.generateToken(req.loggedInUser._id);
      res.json({
        data: { token },
        message: "Socket token issued",
        status: "OK",
      });
    } catch (exception) {
      next(exception);
    }
  }

  async me(req, res, next) {
    try {
      const user = await userSvc.getById(req.loggedInUser._id);
      if (!user) {
        throw { code: 404, message: "User not found", status: "ERR_USER_NOT_FOUND" };
      }
      res.json({
        data: userSvc.toPublicProfile(user, user._id),
        message: "Current user fetched",
        status: "OK",
      });
    } catch (exception) {
      next(exception);
    }
  }
}

const authCtrl = new AuthController();
module.exports = authCtrl;
