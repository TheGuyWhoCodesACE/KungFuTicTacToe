const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

let board = [];
let cooldowns = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("placeMarker", (data) => {
    const now = Date.now();
    if (!cooldowns[socket.id]) cooldowns[socket.id] = { placed: 0, until: 0 };

    let state = cooldowns[socket.id];
    if (now < state.until) return;

    if (state.placed < 1) {
      state.placed++;
    } else {
      state.placed = 0;
      state.until = now + 1000;
    }

    board.push({ x: data.x, y: data.y, playerId: socket.id, time: now });
    io.emit("updateBoard", board);
  });

  socket.on("disconnect", () => {
    delete cooldowns[socket.id];
  });
});

setInterval(() => {
  const now = Date.now();
  board = board.filter(marker => now - marker.time < 2000);
  io.emit("updateBoard", board);
}, 100);

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
