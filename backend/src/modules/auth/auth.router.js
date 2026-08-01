const authRouter = require("express").Router();
const Joi = require("joi");
const validateData = require("../../middlewares/validator.middleware");
const auth = require("../../middlewares/auth.middleware");
const authCtrl = require("./auth.controller");

const RegisterDTO = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  username: Joi.string()
    .min(3)
    .max(30)
    .lowercase()
    .pattern(/^[a-z0-9_.]+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Username can only contain lowercase letters, numbers, dots and underscores",
    }),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
});

const LoginDTO = Joi.object({
  emailOrUsername: Joi.string().required(),
  password: Joi.string().required(),
});

authRouter.post("/register", validateData(RegisterDTO), authCtrl.register);
authRouter.post("/login", validateData(LoginDTO), authCtrl.login);
authRouter.post("/logout", authCtrl.logout);
authRouter.get("/me", auth(), authCtrl.me);
authRouter.get("/socket-token", auth(), authCtrl.socketToken);

module.exports = authRouter;
