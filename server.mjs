import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join a board room (authorId is the room)
  socket.on("join-board", (boardId) => {
    socket.join(boardId);
    console.log(`Socket ${socket.id} joined board: ${boardId}`);
  });

  socket.on("leave-board", (boardId) => {
    socket.leave(boardId);
    console.log(`Socket ${socket.id} left board: ${boardId}`);
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

  // Edge was added
  socket.on("edge-added", (data) => {
    socket.to(data.boardId).emit("edge-added", data);
  });

  // Edge was removed
  socket.on("edge-removed", (data) => {
    socket.to(data.boardId).emit("edge-removed", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.SOCKET_PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});
