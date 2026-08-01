const fs = require("fs");
const path = require("path");
const postSvc = require("./post.service");
const PostModel = require("./post.model");

class PostsController {
  // POST /api/posts
  async createPost(req, res, next) {
    try {
      const { text } = req.body;

      if (!text && !req.file) {
        throw {
          code: 422,
          message: "A post must have text or an image",
          status: "ERR_EMPTY_POST",
        };
      }

      const data = {
        author: req.loggedInUser._id,
        text: text || "",
      };

      if (req.file) {
        data.image = `/uploads/posts/${req.file.filename}`;
      }

      const post = await postSvc.createPost(data);

      res.status(201).json({
        data: postSvc.toPublicPost(post, req.loggedInUser._id),
        message: "Post created successfully",
        status: "OK",
      });
    } catch (exception) {
      next(exception);
    }
  }

  // GET /api/posts  (feed - newest first)
  async getFeed(req, res, next) {
    try {
      const page = +req.query.page || 1;
      const limit = +req.query.limit || 10;

      const { posts, pagination } = await postSvc.getFeed({ page, limit });
      const viewerId = req.loggedInUser ? req.loggedInUser._id : null;

      res.json({
        data: posts.map((p) => postSvc.toPublicPost(p, viewerId)),
        message: "Feed fetched successfully",
        status: "OK",
        meta: { pagination },
      });
    } catch (exception) {
      next(exception);
    }
  }

  // GET /api/posts/user/:userId
  async getUserPosts(req, res, next) {
    try {
      const page = +req.query.page || 1;
      const limit = +req.query.limit || 12;

      const { posts, pagination } = await postSvc.getByUser(req.params.userId, { page, limit });
      const viewerId = req.loggedInUser ? req.loggedInUser._id : null;

      res.json({
        data: posts.map((p) => postSvc.toPublicPost(p, viewerId)),
        message: "User posts fetched successfully",
        status: "OK",
        meta: { pagination },
      });
    } catch (exception) {
      next(exception);
    }
  }

  // GET /api/posts/:id
  async getPostById(req, res, next) {
    try {
      const post = await postSvc.getPopulatedById(req.params.id);
      if (!post) {
        throw { code: 404, message: "Post not found", status: "ERR_POST_NOT_FOUND" };
      }

      const viewerId = req.loggedInUser ? req.loggedInUser._id : null;
      res.json({
        data: postSvc.toPublicPost(post, viewerId),
        message: "Post fetched successfully",
        status: "OK",
      });
    } catch (exception) {
      next(exception);
    }
  }

  // DELETE /api/posts/:id  (own posts only)
  async deletePost(req, res, next) {
    try {
      const post = await postSvc.getById(req.params.id);
      if (!post) {
        throw { code: 404, message: "Post not found", status: "ERR_POST_NOT_FOUND" };
      }

      if (post.author.toString() !== req.loggedInUser._id.toString()) {
        throw {
          code: 403,
          message: "You can only delete your own posts",
          status: "ERR_FORBIDDEN",
        };
      }

      if (post.image) {
        const imgPath = path.join(__dirname, "..", "..", "..", "public", post.image);
        fs.existsSync(imgPath) && fs.unlink(imgPath, () => {});
      }

      await postSvc.deleteById(req.params.id);

      res.json({
        data: { _id: req.params.id },
        message: "Post deleted successfully",
        status: "OK",
      });
    } catch (exception) {
      next(exception);
    }
  }

  // PUT /api/posts/:id/like  (toggle like / unlike)
  async toggleLike(req, res, next) {
    try {
      const post = await postSvc.getById(req.params.id);
      if (!post) {
        throw { code: 404, message: "Post not found", status: "ERR_POST_NOT_FOUND" };
      }

      const userId = req.loggedInUser._id;
      const alreadyLiked = post.likes.some((id) => id.toString() === userId.toString());

      if (alreadyLiked) {
        await PostModel.findByIdAndUpdate(req.params.id, { $pull: { likes: userId } });
      } else {
        await PostModel.findByIdAndUpdate(req.params.id, { $addToSet: { likes: userId } });
      }

      const updated = await postSvc.getPopulatedById(req.params.id);

      res.json({
        data: postSvc.toPublicPost(updated, userId),
        message: alreadyLiked ? "Post unliked" : "Post liked",
        status: "OK",
      });
    } catch (exception) {
      next(exception);
    }
  }

  // POST /api/posts/:id/comments
  async addComment(req, res, next) {
    try {
      const { text } = req.body;
      const post = await postSvc.getById(req.params.id);
      if (!post) {
        throw { code: 404, message: "Post not found", status: "ERR_POST_NOT_FOUND" };
      }

      post.comments.push({ user: req.loggedInUser._id, text });
      await post.save();

      const updated = await postSvc.getPopulatedById(req.params.id);

      res.status(201).json({
        data: postSvc.toPublicPost(updated, req.loggedInUser._id),
        message: "Comment added successfully",
        status: "OK",
      });
    } catch (exception) {
      next(exception);
    }
  }

  // DELETE /api/posts/:id/comments/:commentId  (own comment or own post)
  async deleteComment(req, res, next) {
    try {
      const post = await postSvc.getById(req.params.id);
      if (!post) {
        throw { code: 404, message: "Post not found", status: "ERR_POST_NOT_FOUND" };
      }

      const comment = post.comments.find((c) => c._id.toString() === req.params.commentId);
      if (!comment) {
        throw { code: 404, message: "Comment not found", status: "ERR_COMMENT_NOT_FOUND" };
      }

      const isOwnComment = comment.user.toString() === req.loggedInUser._id.toString();
      const isOwnPost = post.author.toString() === req.loggedInUser._id.toString();

      if (!isOwnComment && !isOwnPost) {
        throw {
          code: 403,
          message: "You can only delete your own comments",
          status: "ERR_FORBIDDEN",
        };
      }

      post.comments = post.comments.filter((c) => c._id.toString() !== req.params.commentId);
      await post.save();

      const updated = await postSvc.getPopulatedById(req.params.id);

      res.json({
        data: postSvc.toPublicPost(updated, req.loggedInUser._id),
        message: "Comment deleted successfully",
        status: "OK",
      });
    } catch (exception) {
      next(exception);
    }
  }
}

const postsCtrl = new PostsController();
module.exports = postsCtrl;
