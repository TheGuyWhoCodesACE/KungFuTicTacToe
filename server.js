const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let players = [];
let board = Array(9).fill(null);
let currentPlayer = 'X';
let confirmations = 0;

const winningCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

io.on('connection', socket => {
  if (players.length < 2) {
    players.push(socket);
    const symbol = players.length === 1 ? 'X' : 'O';
    socket.emit('assignSymbol', symbol);
    if (players.length === 2) {
      players.forEach(p => p.emit('startGame'));
    }
  } else {
    socket.emit('roomFull');
    return;
  }

  socket.on('makeMove', index => {
    if (board[index] || players.length < 2) return;

    const playerIndex = players.indexOf(socket);
    const symbol = playerIndex === 0 ? 'X' : 'O';
    if (symbol !== currentPlayer) return;

    board[index] = symbol;
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

    players.forEach(p => p.emit('updateBoard', board));

    const winner = checkWin();
    if (winner) {
      players.forEach(p => p.emit('gameOver', winner));
    } else if (!board.includes(null)) {
      players.forEach(p => p.emit('gameOver', 'draw'));
    }
  });

  socket.on('confirmReset', () => {
    confirmations++;
    if (confirmations === 2) {
      board = Array(9).fill(null);
      currentPlayer = 'X';
      confirmations = 0;
      players.forEach(p => {
        p.emit('updateBoard', board);
        p.emit('startGame');
      });
    }
  });

  socket.on('disconnect', () => {
    players = players.filter(p => p !== socket);
    board = Array(9).fill(null);
    currentPlayer = 'X';
    confirmations = 0;
    players.forEach(p => p.emit('opponentLeft'));
  });
});

function checkWin() {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a]; // 'X' or 'O'
    }
  }
  return null;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
