const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const rooms = {};

io.on('connection', socket => {
  console.log('A user connected');

  socket.on('createRoom', roomId => {
    if (!rooms[roomId]) {
      rooms[roomId] = { players: [], board: Array(9).fill(null), turn: 'X' };
    }
    if (rooms[roomId].players.length < 2) {
      rooms[roomId].players.push(socket.id);
      socket.join(roomId);
      socket.emit('roomJoined', roomId);
      io.to(roomId).emit('updatePlayers', rooms[roomId].players.length);
    }
  });

  socket.on('joinRoom', roomId => {
    if (rooms[roomId] && rooms[roomId].players.length < 2) {
      rooms[roomId].players.push(socket.id);
      socket.join(roomId);
      socket.emit('roomJoined', roomId);
      io.to(roomId).emit('updatePlayers', rooms[roomId].players.length);
    } else {
      socket.emit('roomFull');
    }
  });

  socket.on('makeMove', ({ roomId, index }) => {
    const room = rooms[roomId];
    if (!room) return;

    const symbol = room.players[0] === socket.id ? 'X' : 'O';
    if (room.turn !== symbol) return;

    if (!room.board[index]) {
      room.board[index] = symbol;
      room.turn = symbol === 'X' ? 'O' : 'X';
      io.to(roomId).emit('moveMade', { board: room.board, turn: room.turn });

      const winner = checkWinner(room.board);
      if (winner) {
        io.to(roomId).emit('gameOver', { winner });
        delete rooms[roomId];
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    for (const [roomId, room] of Object.entries(rooms)) {
      room.players = room.players.filter(p => p !== socket.id);
      if (room.players.length === 0) {
        delete rooms[roomId];
      }
    }
  });
});

function checkWinner(board) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6]          // diags
  ];
  for (const [a,b,c] of wins) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
