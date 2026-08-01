const router = require("express").Router();

const authRouter = require("../modules/auth/auth.router");
const profileRouter = require("../modules/users/profile.router");
const usersRouter = require("../modules/users/users.router");
const postsRouter = require("../modules/posts/posts.router");
const followRouter = require("../modules/follow/follow.router");
const chatRouter = require("../modules/chat/chat.router");

router.get("/", (req, res) => {
  res.json({
    data: null,
    message: "Social App API v1 is up and running",
    status: "OK",
  });
});

router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/users", usersRouter);
router.use("/posts", postsRouter);
router.use("/follow", followRouter);
router.use("/chat", chatRouter);

module.exports = router;
