import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  socket.on("join-note", (noteId: string) => {
    socket.join(noteId);
  });

  socket.on("edit-note", (data: { noteId: string; content: string }) => {
    socket.to(data.noteId).emit("update-note", data.content);
  });
});

httpServer.listen(3001, () => {
  console.log("Socket server running on port 3001");
});
