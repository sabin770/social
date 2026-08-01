const PostModel = require("./post.model");

const AUTHOR_FIELDS = "name username profilePicture";

class PostService {
  async createPost(data) {
    const post = await PostModel.create(data);
    return await this.getPopulatedById(post._id);
  }

  async getPopulatedById(id) {
    return await PostModel.findById(id)
      .populate("author", AUTHOR_FIELDS)
      .populate("comments.user", AUTHOR_FIELDS);
  }

  async getFeed({ page = 1, limit = 10 }) {
    const skip = (+page - 1) * +limit;
    const posts = await PostModel.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(+limit)
      .populate("author", AUTHOR_FIELDS)
      .populate("comments.user", AUTHOR_FIELDS);

    const count = await PostModel.countDocuments({});
    return { posts, pagination: { page: +page, limit: +limit, count } };
  }

  async getByUser(authorId, { page = 1, limit = 12 }) {
    const skip = (+page - 1) * +limit;
    const posts = await PostModel.find({ author: authorId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(+limit)
      .populate("author", AUTHOR_FIELDS)
      .populate("comments.user", AUTHOR_FIELDS);

    const count = await PostModel.countDocuments({ author: authorId });
    return { posts, pagination: { page: +page, limit: +limit, count } };
  }

  async getById(id) {
    return await PostModel.findById(id);
  }

  async deleteById(id) {
    return await PostModel.findByIdAndDelete(id);
  }

  /**
   * Shapes a populated post document for the API response,
   * adding `likesCount`, `commentsCount` and `isLiked` (relative to viewer).
   */
  toPublicPost(post, viewerId = null) {
    if (!post) return null;
    const obj = post.toObject ? post.toObject() : post;

    return {
      _id: obj._id,
      text: obj.text,
      image: obj.image,
      author: obj.author,
      likesCount: obj.likes ? obj.likes.length : 0,
      isLiked: viewerId
        ? (obj.likes || []).some((id) => id.toString() === viewerId.toString())
        : false,
      commentsCount: obj.comments ? obj.comments.length : 0,
      comments: (obj.comments || []).map((c) => ({
        _id: c._id,
        text: c.text,
        user: c.user,
        createdAt: c.createdAt,
      })),
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }
}

const postSvc = new PostService();
module.exports = postSvc;
