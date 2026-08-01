const profileRouter = require("express").Router();
const Joi = require("joi");
const auth = require("../../middlewares/auth.middleware");
const uploader = require("../../middlewares/filehandling.middleware");
const validateData = require("../../middlewares/validator.middleware");
const usersCtrl = require("./users.controller");

const UpdateProfileDTO = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  bio: Joi.string().max(200).allow("").optional(),
  password: Joi.string().min(6).max(100).optional(),
});

// upload profile picture (must come before /:userId routes to avoid clashes)
profileRouter.post(
  "/upload-pic",
  auth(),
  uploader("profiles").single("image"),
  usersCtrl.uploadProfilePic
);

profileRouter.get("/:userId", auth(false), usersCtrl.getProfile);
profileRouter.put("/:userId", auth(), validateData(UpdateProfileDTO), usersCtrl.updateProfile);

module.exports = profileRouter;
