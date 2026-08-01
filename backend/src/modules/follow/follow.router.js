const followRouter = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const followCtrl = require("./follow.controller");

followRouter.get("/:userId", auth(false), followCtrl.getFollowData);
followRouter.post("/:userId", auth(), followCtrl.follow);
followRouter.delete("/:userId", auth(), followCtrl.unfollow);

module.exports = followRouter;
