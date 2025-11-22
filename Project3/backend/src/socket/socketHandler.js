function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // this is just a test
    socket.on("ping", () => {
      console.log(`Ping from ${socket.id}`);
      socket.emit("pong");
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

module.exports = setupSocket;
