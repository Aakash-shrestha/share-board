import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join a user-specific room (for dashboard updates)
  socket.on("join-user", (userId) => {
    socket.join(`user:${userId}`);
    console.log(`Socket ${socket.id} joined user room: user:${userId}`);
  });

  socket.on("leave-user", (userId) => {
    socket.leave(`user:${userId}`);
    console.log(`Socket ${socket.id} left user room: user:${userId}`);
  });

  // Join a board room (authorId is the room)
  socket.on("join-board", (boardId) => {
    socket.join(boardId);
    console.log(`Socket ${socket.id} joined board: ${boardId}`);
  });

  socket.on("leave-board", (boardId) => {
    socket.leave(boardId);
    console.log(`Socket ${socket.id} left board: ${boardId}`);
  });

  // Board was shared with a user
  socket.on("board-shared", (data) => {
    // data: { userId, board: { id, name, ownerName, noteCount } }
    io.to(`user:${data.userId}`).emit("board-shared", data);
  });

  // Board was unshared from a user
  socket.on("board-unshared", (data) => {
    // data: { userId, boardId }
    io.to(`user:${data.userId}`).emit("board-unshared", data);
  });

  // Node was moved (position changed)
  socket.on("node-moved", (data) => {
    socket.to(data.boardId).emit("node-moved", data);
  });

  // Node was added
  socket.on("node-added", (data) => {
    socket.to(data.boardId).emit("node-added", data);
  });

  // Node content was edited
  socket.on("node-edited", (data) => {
    socket.to(data.boardId).emit("node-edited", data);
  });

  //node was deleted
  socket.on("node-deleted", (data) => {
    socket.to(data.boardId).emit("node-deleted", data);
  });

  // Edge was added
  socket.on("edge-added", (data) => {
    socket.to(data.boardId).emit("edge-added", data);
  });

  // Edge was removed
  socket.on("edge-removed", (data) => {
    socket.to(data.boardId).emit("edge-removed", data);
  });

  socket.on("node-image-updated", (data) => {
    socket.to(data.boardId).emit("node-image-updated", data);
  });

  socket.on("node-image-removed", (data) => {
    socket.to(data.boardId).emit("node-image-removed", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.SOCKET_PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});
