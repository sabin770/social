const fs = require("fs");
const path = require("path");
const userSvc = require("./user.service");
const authSvc = require("../auth/auth.service");

class UsersController {
  // GET /api/profile/:userId  (or /api/users/:userId)
  async getProfile(req, res, next) {
    try {
      const user = await userSvc.getById(req.params.userId);
      if (!user) {
        throw { code: 404, message: "User not found", status: "ERR_USER_NOT_FOUND" };
      }

      const viewerId = req.loggedInUser ? req.loggedInUser._id : null;
      res.json({
        data: userSvc.toPublicProfile(user, viewerId),
        message: "Profile fetched successfully",
        status: "OK",
      });
    } catch (exception) {
      next(exception);
    }
  }

  // PUT /api/profile/:userId
  async updateProfile(req, res, next) {
    try {
      if (req.params.userId !== req.loggedInUser._id.toString()) {
        throw {
          code: 403,
          message: "You can only update your own profile",
          status: "ERR_FORBIDDEN",
        };
      }

      const allowedFields = ["name", "bio"];
      const updates = {};
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      });

      // optional password change
      if (req.body.password) {
        updates.password = await authSvc.hashPassword(req.body.password);
      }

      const user = await userSvc.updateById(req.loggedInUser._id, updates);

      res.json({
        data: userSvc.toPublicProfile(user, user._id),
        message: "Profile updated successfully",
        status: "OK",
      });
    } catch (exception) {
      next(exception);
    }
  }

  // POST /api/profile/upload-pic
  async uploadProfilePic(req, res, next) {
    try {
      if (!req.file) {
        throw { code: 422, message: "No image file provided", status: "ERR_NO_FILE" };
      }

      const user = await userSvc.getById(req.loggedInUser._id);

      // remove old profile picture from disk (if any)
      if (user.profilePicture) {
        const oldPath = path.join(__dirname, "..", "..", "..", "public", user.profilePicture);
        fs.existsSync(oldPath) && fs.unlink(oldPath, () => {});
      }

      const relativePath = `/uploads/profiles/${req.file.filename}`;
      const updated = await userSvc.updateById(req.loggedInUser._id, {
        profilePicture: relativePath,
      });

      res.json({
        data: userSvc.toPublicProfile(updated, updated._id),
        message: "Profile picture updated successfully",
        status: "OK",
      });
    } catch (exception) {
      next(exception);
    }
  }

  // GET /api/users/search?q=
  async searchUsers(req, res, next) {
    try {
      const q = (req.query.q || "").trim();
      if (!q) {
        return res.json({ data: [], message: "Search results", status: "OK" });
      }

      const users = await userSvc.searchUsers(q, req.loggedInUser._id);
      res.json({
        data: users.map((u) => userSvc.toPublicProfile(u, req.loggedInUser._id)),
        message: "Search results",
        status: "OK",
      });
    } catch (exception) {
      next(exception);
    }
  }
}

const usersCtrl = new UsersController();
module.exports = usersCtrl;
