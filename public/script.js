const socket = io();
const boardEl = document.getElementById('board');
const status = document.getElementById('status');
const confirmOverlay = document.getElementById('confirm');
const playBtn = document.getElementById('playAgain');

let me;
const cells = [];

for (let i = 0; i < 9; i++) {
  const cell = document.createElement('div');
  cell.className = 'cell';
  cell.dataset.index = i;
  boardEl.appendChild(cell);
  cell.addEventListener('click', () => {
    socket.emit('placeMarker', i);
  });
  cells.push(cell);
}

socket.on('connected', id => {
  me = id;
  status.textContent = 'Game ready! Place markers!';
});

socket.on('boardUpdate', board => {
  cells.forEach(c => c.innerHTML = '');
  board.forEach(m => {
    const mk = document.createElement('div');
    mk.className = 'marker';
    mk.textContent = m.player === me ? 'X' : 'O';
    cells[m.index].appendChild(mk);
  });
});

socket.on('gameOver', winner => {
  status.textContent = winner === me ? 'You win!' : 'You lose.';
  confirmOverlay.classList.remove('hidden');
});

socket.on('newGame', () => {
  status.textContent = 'New Game! Place markers!';
  confirmOverlay.classList.add('hidden');
});

playBtn.addEventListener('click', () => {
  socket.emit('restartConfirm');
  confirmOverlay.classList.add('hidden');
  status.textContent = 'Waiting for opponent...';
});
