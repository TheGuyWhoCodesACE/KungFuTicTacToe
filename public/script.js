const socket = io();
let symbol;
let board = Array(9).fill(null);
let myTurn = false;

const boardDiv = document.getElementById('board');
const statusDiv = document.getElementById('status');
const confirmContainer = document.getElementById('confirmContainer');
const confirmBtn = document.getElementById('confirmBtn');

for (let i = 0; i < 9; i++) {
  const cell = document.createElement('div');
  cell.classList.add('cell');
  cell.dataset.index = i;
  boardDiv.appendChild(cell);
  cell.addEventListener('click', () => {
    if (myTurn && !board[i]) {
      socket.emit('makeMove', i);
    }
  });
}

socket.on('assignSymbol', s => {
  symbol = s;
  statusDiv.innerText = `You are ${symbol}. Waiting for another player...`;
});

socket.on('startGame', () => {
  myTurn = symbol === 'X';
  statusDiv.innerText = myTurn ? "Your turn" : "Opponent's turn";
});

socket.on('updateBoard', newBoard => {
  board = newBoard;
  myTurn = symbol === (board.filter(Boolean).length % 2 === 0 ? 'X' : 'O');
  updateUI();
});

socket.on('gameOver', winner => {
  myTurn = false;
  if (winner === 'draw') {
    statusDiv.innerText = "It's a draw!";
  } else {
    statusDiv.innerText = winner === symbol ? "You win!" : "You lose!";
  }
  confirmContainer.style.display = 'block';
});

socket.on('opponentLeft', () => {
  statusDiv.innerText = "Opponent left. Waiting for a new player...";
  board = Array(9).fill(null);
  updateUI();
  confirmContainer.style.display = 'none';
});

socket.on('roomFull', () => {
  statusDiv.innerText = "Room is full.";
});

confirmBtn.addEventListener('click', () => {
  socket.emit('confirmReset');
  confirmContainer.style.display = 'none';
  statusDiv.innerText = "Waiting for opponent to confirm...";
});

function updateUI() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, i) => {
    cell.textContent = board[i] || '';
    if (board[i]) {
      cell.classList.add('taken');
    } else {
      cell.classList.remove('taken');
    }
  });
  if (board.includes(null)) {
    statusDiv.innerText = myTurn ? "Your turn" : "Opponent's turn";
  }
}
