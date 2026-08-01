const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { AppConfig } = require("../config/config");
const userSvc = require("../modules/users/user.service");

// tracks userId -> Set of socketIds (a user may have multiple tabs open)
const onlineUsers = new Map();

const initSocket = (httpServer, app) => {
  const io = new Server(httpServer, {
    cors: {
      origin: AppConfig.frontendUrl,
      credentials: true,
    },
  });

  // store io instance on the express app so controllers can emit
  app.set("io", io);

  /**
   * Auth middleware for socket connections.
   * Expects the JWT as a handshake auth token: { auth: { token } }
   * (the frontend sends this via socket({ auth: { token } })).
   */
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) throw new Error("No token");

      const payload = jwt.verify(token, AppConfig.jwtSecret);
      const user = await userSvc.getById(payload.sub);
      if (!user) throw new Error("User not found");

      socket.userId = user._id.toString();
      socket.user = { _id: user._id, name: user.name, username: user.username };
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(`[Socket] ${socket.user.username} connected (${socket.id})`);

    // Track online users
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    // Join a personal room so we can emit targeted events (e.g. unread badge updates)
    socket.join(userId);

    // Broadcast updated online list to all connected clients
    io.emit("online_users", Array.from(onlineUsers.keys()));

    /**
     * join_conversation - client joins a conversation room to receive messages
     * payload: { conversationId }
     */
    socket.on("join_conversation", ({ conversationId }) => {
      if (conversationId) {
        socket.join(conversationId);
      }
    });

    /**
     * leave_conversation - client leaves a conversation room
     * payload: { conversationId }
     */
    socket.on("leave_conversation", ({ conversationId }) => {
      if (conversationId) {
        socket.leave(conversationId);
      }
    });

    /**
     * typing - broadcast typing indicator to conversation room (excluding sender)
     * payload: { conversationId }
     */
    socket.on("typing", ({ conversationId }) => {
      if (conversationId) {
        socket.to(conversationId).emit("user_typing", {
          conversationId,
          user: socket.user,
        });
      }
    });

    /**
     * stop_typing - broadcast stop-typing signal
     * payload: { conversationId }
     */
    socket.on("stop_typing", ({ conversationId }) => {
      if (conversationId) {
        socket.to(conversationId).emit("user_stop_typing", {
          conversationId,
          userId,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] ${socket.user.username} disconnected (${socket.id})`);
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) onlineUsers.delete(userId);
      }
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

module.exports = initSocket;
