const socket = io();
let roomId = null;

document.querySelectorAll('.cell').forEach(cell => {
  cell.addEventListener('click', () => {
    const index = parseInt(cell.dataset.index);
    if (roomId) {
      socket.emit('makeMove', { roomId, index });
    }
  });
});

function createRoom() {
  roomId = document.getElementById('roomIdInput').value;
  socket.emit('createRoom', roomId);
}

function joinRoom() {
  roomId = document.getElementById('roomIdInput').value;
  socket.emit('joinRoom', roomId);
}

socket.on('roomJoined', id => {
  document.getElementById('status').textContent = `Joined room: ${id}`;
});

socket.on('updatePlayers', count => {
  document.getElementById('status').textContent += ` | Players: ${count}/2`;
});

socket.on('roomFull', () => {
  alert('Room is full!');
});

socket.on('moveMade', ({ board }) => {
  document.querySelectorAll('.cell').forEach((cell, i) => {
    cell.textContent = board[i] || '';
  });
});

socket.on('gameOver', ({ winner }) => {
  alert(`Game Over! Winner: ${winner}`);
});
