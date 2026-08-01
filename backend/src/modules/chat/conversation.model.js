const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    // unread counts per participant: { userId: count }
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

// Enforce exactly 2 participants and uniqueness of the pair
ConversationSchema.index({ participants: 1 });

const ConversationModel = mongoose.model("Conversation", ConversationSchema);
module.exports = ConversationModel;
