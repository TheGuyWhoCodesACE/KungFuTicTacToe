const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let board = []; // active markers: { index, player, time }
let cooldowns = {};
let confirmations = {};

io.on('connection', socket => {
  const player = socket.id;
  cooldowns[player] = { placed: 0, until: 0 };
  confirmations[player] = false;

  socket.emit('connected', player);

  socket.on('placeMarker', idx => {
    const now = Date.now();
    const cd = cooldowns[player];
    if (now < cd.until || cd.placed >= 2) return;

    board.push({ index: idx, player, time: now });
    cd.placed++;
    if (cd.placed === 2) cd.until = now + 1000;

    io.emit('boardUpdate', board);

    checkWinCondition();
  });

  socket.on('restartConfirm', () => {
    confirmations[player] = true;
    if (Object.values(confirmations).every(v => v)) startNewGame();
  });

  socket.on('disconnect', () => {
    delete cooldowns[player];
    delete confirmations[player];
  });
});

setInterval(() => {
  const now = Date.now();
  board = board.filter(m => now - m.time < 2000);
  io.emit('boardUpdate', board);

  // Reset placed count if cooldown expired
  Object.entries(cooldowns).forEach(([p, cd]) => {
    if (now >= cd.until) cd.placed = 0;
  });
}, 100);

function checkWinCondition() {
  const playersLatest = {};
  board.forEach(m => {
    playersLatest[m.player] = playersLatest[m.player] || [];
    playersLatest[m.player].push(m.index);
  });

  Object.entries(playersLatest).forEach(([p, positions]) => {
    if (hasThreeInARow(positions)) {
      io.emit('gameOver', p);
    }
  });
}

const combos = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6],
];

function hasThreeInARow(pos) {
  return combos.some(c => c.every(i => pos.includes(i)));
}

function startNewGame() {
  board = [];
  Object.keys(confirmations).forEach(p => confirmations[p] = false);
  io.emit('boardUpdate', board);
  io.emit('newGame');
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server live on port ${PORT}`));
