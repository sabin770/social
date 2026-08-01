const ConversationModel = require("./conversation.model");
const MessageModel = require("./message.model");
const userSvc = require("../users/user.service");

const SENDER_FIELDS = "name username profilePicture";

class ChatController {
  /**
   * GET /api/chat/conversations
   * Returns all conversations the logged-in user is part of,
   * sorted by most recent message.
   */
  async getConversations(req, res, next) {
    try {
      const myId = req.loggedInUser._id;

      const conversations = await ConversationModel.find({
        participants: myId,
      })
        .sort({ updatedAt: -1 })
        .populate("participants", SENDER_FIELDS)
        .populate({
          path: "lastMessage",
          select: "text sender createdAt",
          populate: { path: "sender", select: SENDER_FIELDS },
        });

      // attach unread count for the current user
      const shaped = conversations.map((c) => {
        const other = c.participants.find(
          (p) => p._id.toString() !== myId.toString()
        );
        return {
          _id: c._id,
          otherUser: other,
          lastMessage: c.lastMessage,
          unreadCount: c.unreadCounts?.get?.(myId.toString()) || 0,
          updatedAt: c.updatedAt,
        };
      });

      res.json({ data: shaped, message: "Conversations fetched", status: "OK" });
    } catch (exception) {
      next(exception);
    }
  }

  /**
   * POST /api/chat/conversations
   * Body: { participantId }
   * Opens (or returns existing) conversation with another user.
   */
  async openConversation(req, res, next) {
    try {
      const myId = req.loggedInUser._id;
      const { participantId } = req.body;

      if (!participantId) {
        throw { code: 422, message: "participantId is required", status: "ERR_VALIDATION" };
      }
      if (participantId === myId.toString()) {
        throw { code: 400, message: "You cannot message yourself", status: "ERR_SELF_MESSAGE" };
      }

      const otherUser = await userSvc.getById(participantId);
      if (!otherUser) {
        throw { code: 404, message: "User not found", status: "ERR_USER_NOT_FOUND" };
      }

      // find existing conversation between these two users
      let convo = await ConversationModel.findOne({
        participants: { $all: [myId, participantId], $size: 2 },
      })
        .populate("participants", SENDER_FIELDS)
        .populate({
          path: "lastMessage",
          select: "text sender createdAt",
          populate: { path: "sender", select: SENDER_FIELDS },
        });

      if (!convo) {
        convo = await ConversationModel.create({
          participants: [myId, participantId],
          unreadCounts: { [myId.toString()]: 0, [participantId.toString()]: 0 },
        });
        convo = await ConversationModel.findById(convo._id)
          .populate("participants", SENDER_FIELDS)
          .populate("lastMessage");
      }

      const other = convo.participants.find(
        (p) => p._id.toString() !== myId.toString()
      );

      res.json({
        data: {
          _id: convo._id,
          otherUser: other,
          lastMessage: convo.lastMessage,
          unreadCount: convo.unreadCounts?.get?.(myId.toString()) || 0,
          updatedAt: convo.updatedAt,
        },
        message: "Conversation ready",
        status: "OK",
      });
    } catch (exception) {
      next(exception);
    }
  }

  /**
   * GET /api/chat/conversations/:conversationId/messages?page=1&limit=30
   * Returns paginated messages for a conversation (oldest last).
   * Also marks all unread messages as read for the current user.
   */
  async getMessages(req, res, next) {
    try {
      const myId = req.loggedInUser._id;
      const { conversationId } = req.params;
      const page = +req.query.page || 1;
      const limit = +req.query.limit || 30;

      const convo = await ConversationModel.findOne({
        _id: conversationId,
        participants: myId,
      });

      if (!convo) {
        throw { code: 404, message: "Conversation not found", status: "ERR_NOT_FOUND" };
      }

      const total = await MessageModel.countDocuments({ conversation: conversationId });
      const skip = Math.max(0, total - page * limit);
      const take = Math.min(limit, total - (page - 1) * limit);

      const messages = await MessageModel.find({ conversation: conversationId })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(take)
        .populate("sender", SENDER_FIELDS);

      // mark as read — reset unread count for current user
      await ConversationModel.findByIdAndUpdate(conversationId, {
        $set: { [`unreadCounts.${myId.toString()}`]: 0 },
      });

      res.json({
        data: messages,
        message: "Messages fetched",
        status: "OK",
        meta: { page, limit, total },
      });
    } catch (exception) {
      next(exception);
    }
  }

  /**
   * POST /api/chat/conversations/:conversationId/messages
   * Body: { text }
   * Sends a message. The socket event is emitted from socket.js.
   */
  async sendMessage(req, res, next) {
    try {
      const myId = req.loggedInUser._id;
      const { conversationId } = req.params;
      const { text } = req.body;

      if (!text || !text.trim()) {
        throw { code: 422, message: "Message text is required", status: "ERR_VALIDATION" };
      }

      const convo = await ConversationModel.findOne({
        _id: conversationId,
        participants: myId,
      });

      if (!convo) {
        throw { code: 404, message: "Conversation not found", status: "ERR_NOT_FOUND" };
      }

      const message = await MessageModel.create({
        conversation: conversationId,
        sender: myId,
        text: text.trim(),
        readBy: [myId],
      });

      const populated = await MessageModel.findById(message._id).populate(
        "sender",
        SENDER_FIELDS
      );

      // update lastMessage and increment unread for the OTHER participant
      const otherId = convo.participants
        .find((p) => p.toString() !== myId.toString())
        .toString();

      const currentOtherUnread = convo.unreadCounts?.get?.(otherId) || 0;

      await ConversationModel.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
        [`unreadCounts.${otherId}`]: currentOtherUnread + 1,
        [`unreadCounts.${myId.toString()}`]: 0,
      });

      // Emit via socket if available (attached to app in socket.js)
      const io = req.app.get("io");
      if (io) {
        io.to(conversationId).emit("new_message", populated);
        // also notify recipient's personal room so their unread badge updates
        io.to(otherId).emit("unread_update", { conversationId });
      }

      res.status(201).json({
        data: populated,
        message: "Message sent",
        status: "OK",
      });
    } catch (exception) {
      next(exception);
    }
  }

  /**
   * GET /api/chat/unread
   * Returns the total number of unread messages across all conversations.
   */
  async getTotalUnread(req, res, next) {
    try {
      const myId = req.loggedInUser._id.toString();

      const conversations = await ConversationModel.find({
        participants: req.loggedInUser._id,
      });

      const total = conversations.reduce((sum, c) => {
        return sum + (c.unreadCounts?.get?.(myId) || 0);
      }, 0);

      res.json({ data: { total }, message: "Unread count fetched", status: "OK" });
    } catch (exception) {
      next(exception);
    }
  }
}

const chatCtrl = new ChatController();
module.exports = chatCtrl;
