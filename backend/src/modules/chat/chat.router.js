const chatRouter = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const chatCtrl = require("./chat.controller");

// All chat routes require authentication
chatRouter.use(auth());

chatRouter.get("/unread", chatCtrl.getTotalUnread);
chatRouter.get("/conversations", chatCtrl.getConversations);
chatRouter.post("/conversations", chatCtrl.openConversation);
chatRouter.get("/conversations/:conversationId/messages", chatCtrl.getMessages);
chatRouter.post("/conversations/:conversationId/messages", chatCtrl.sendMessage);

module.exports = chatRouter;
