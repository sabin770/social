const usersRouter = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const usersCtrl = require("./users.controller");

usersRouter.get("/search", auth(), usersCtrl.searchUsers);

module.exports = usersRouter;
