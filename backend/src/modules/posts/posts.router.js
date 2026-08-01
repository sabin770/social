const postsRouter = require("express").Router();
const Joi = require("joi");
const auth = require("../../middlewares/auth.middleware");
const uploader = require("../../middlewares/filehandling.middleware");
const validateData = require("../../middlewares/validator.middleware");
const postsCtrl = require("./posts.controller");

const CreatePostDTO = Joi.object({
  text: Joi.string().max(2000).allow("").optional(),
});

const CommentDTO = Joi.object({
  text: Joi.string().min(1).max(300).required(),
});

// feed & user posts
postsRouter.get("/", auth(false), postsCtrl.getFeed);
postsRouter.get("/user/:userId", auth(false), postsCtrl.getUserPosts);

// CRUD
postsRouter.post("/", auth(), uploader("posts").single("image"), validateData(CreatePostDTO), postsCtrl.createPost);
postsRouter.get("/:id", auth(false), postsCtrl.getPostById);
postsRouter.delete("/:id", auth(), postsCtrl.deletePost);

// like / unlike
postsRouter.put("/:id/like", auth(), postsCtrl.toggleLike);

// comments
postsRouter.post("/:id/comments", auth(), validateData(CommentDTO), postsCtrl.addComment);
postsRouter.delete("/:id/comments/:commentId", auth(), postsCtrl.deleteComment);

module.exports = postsRouter;
