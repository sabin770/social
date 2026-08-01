const UserModel = require("../users/user.model");
const userSvc = require("../users/user.service");

class FollowController {
  // POST /api/follow/:userId  -> logged in user follows :userId
  async follow(req, res, next) {
    try {
      const targetId = req.params.userId;
      const myId = req.loggedInUser._id;

      if (targetId === myId.toString()) {
        throw { code: 400, message: "You cannot follow yourself", status: "ERR_SELF_FOLLOW" };
      }

      const target = await userSvc.getById(targetId);
      if (!target) {
        throw { code: 404, message: "User not found", status: "ERR_USER_NOT_FOUND" };
      }

      const alreadyFollowing = target.followers.some((f) => f.toString() === myId.toString());
      if (alreadyFollowing) {
        throw {
          code: 409,
          message: "You are already following this user",
          status: "ERR_ALREADY_FOLLOWING",
        };
      }

      await UserModel.findByIdAndUpdate(targetId, { $addToSet: { followers: myId } });
      await UserModel.findByIdAndUpdate(myId, { $addToSet: { following: targetId } });

      const updatedTarget = await userSvc.getById(targetId);

      res.json({
        data: userSvc.toPublicProfile(updatedTarget, myId),
        message: `You are now following ${target.username}`,
        status: "OK",
      });
    } catch (exception) {
      next(exception);
    }
  }

  // DELETE /api/follow/:userId -> logged in user unfollows :userId
  async unfollow(req, res, next) {
    try {
      const targetId = req.params.userId;
      const myId = req.loggedInUser._id;

      const target = await userSvc.getById(targetId);
      if (!target) {
        throw { code: 404, message: "User not found", status: "ERR_USER_NOT_FOUND" };
      }

      await UserModel.findByIdAndUpdate(targetId, { $pull: { followers: myId } });
      await UserModel.findByIdAndUpdate(myId, { $pull: { following: targetId } });

      const updatedTarget = await userSvc.getById(targetId);

      res.json({
        data: userSvc.toPublicProfile(updatedTarget, myId),
        message: `You unfollowed ${target.username}`,
        status: "OK",
      });
    } catch (exception) {
      next(exception);
    }
  }

  // GET /api/follow/:userId -> followers & following lists for a user
  async getFollowData(req, res, next) {
    try {
      const userId = req.params.userId;

      const user = await UserModel.findById(userId)
        .populate("followers", "name username profilePicture")
        .populate("following", "name username profilePicture");

      if (!user) {
        throw { code: 404, message: "User not found", status: "ERR_USER_NOT_FOUND" };
      }

      res.json({
        data: {
          followers: user.followers,
          following: user.following,
          followersCount: user.followers.length,
          followingCount: user.following.length,
        },
        message: "Follow data fetched successfully",
        status: "OK",
      });
    } catch (exception) {
      next(exception);
    }
  }
}

const followCtrl = new FollowController();
module.exports = followCtrl;
