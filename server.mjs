import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-note", (noteId) => {
    socket.join(noteId);
    console.log(`Socket ${socket.id} joined note: ${noteId}`);
  });

  socket.on("leave-note", (noteId) => {
    socket.leave(noteId);
    console.log(`Socket ${socket.id} left note: ${noteId}`);
  });

  socket.on("content-change", (data) => {
    socket.to(data.noteId).emit("content-update", {
      content: data.content,
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.SOCKET_PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});
