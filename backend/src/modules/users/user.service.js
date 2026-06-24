const UserModel = require("./user.model");

class UserService {
  async createUser(data) {
    return await UserModel.create(data);
  }

  async getById(id) {
    return await UserModel.findById(id);
  }

  async getByFilter(filter) {
    return await UserModel.findOne(filter);
  }

  async getByEmailOrUsername(emailOrUsername) {
    return await UserModel.findOne({
      $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername.toLowerCase() }],
    });
  }

  async updateById(id, data) {
    return await UserModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async searchUsers(query, excludeId) {
    const filter = {
      _id: { $ne: excludeId },
      $or: [
        { name: new RegExp(query, "i") },
        { username: new RegExp(query, "i") },
      ],
    };
    return await UserModel.find(filter).limit(20);
  }

  /**
   * Returns a safe, public-facing version of a user document.
   * `viewerId` (optional) is used to compute `isFollowing`.
   */
  toPublicProfile(user, viewerId = null) {
    if (!user) return null;
    const followers = user.followers || [];
    const following = user.following || [];

    return {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profilePicture: user.profilePicture,
      followersCount: followers.length,
      followingCount: following.length,
      isFollowing: viewerId
        ? followers.some((f) => f.toString() === viewerId.toString())
        : undefined,
      createdAt: user.createdAt,
    };
  }
}

const userSvc = new UserService();
module.exports = userSvc;
