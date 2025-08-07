let playersReady = 0;

io.on('connection', (socket) => {
  // ... your existing code ...

  socket.on('move', (data) => {
    // Assume `data.board` is a 2D array (3x3)
    const winner = checkWinner(data.board);
    if (winner) {
      io.emit('gameOver', { winner });
    }
  });

  socket.on('restartConfirm', () => {
    playersReady++;
    if (playersReady === 2) {
      io.emit('restartGame');
      playersReady = 0;
    }
  });
});

// Win detection logic
function checkWinner(board) {
  const lines = [
    // rows
    [board[0][0], board[0][1], board[0][2]],
    [board[1][0], board[1][1], board[1][2]],
    [board[2][0], board[2][1], board[2][2]],
    // columns
    [board[0][0], board[1][0], board[2][0]],
    [board[0][1], board[1][1], board[2][1]],
    [board[0][2], board[1][2], board[2][2]],
    // diagonals
    [board[0][0], board[1][1], board[2][2]],
    [board[0][2], board[1][1], board[2][0]]
  ];

  for (const line of lines) {
    if (line[0] && line[0] === line[1] && line[1] === line[2]) {
      return line[0]; // 'X' or 'O'
    }
  }

  return null;
}
