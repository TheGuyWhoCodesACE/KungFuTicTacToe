const DB_URL = "https://kung-fu-tic-tac-toe-default-rtdb.firebaseio.com";
const ROOM = "room1"; // simple single-room system

let playerSymbol = null;

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");

// Create board UI
for (let i = 0; i < 9; i++) {
  const cell = document.createElement("div");
  cell.className = "cell";
  cell.dataset.index = i;
  cell.onclick = () => makeMove(i);
  boardEl.appendChild(cell);
}

// Join room
async function joinRoom() {
  const res = await fetch(`${DB_URL}/rooms/${ROOM}.json`);
  let room = await res.json();

  if (!room) {
    // First player
    room = {
      players: 1,
      board: Array(9).fill(""),
      turn: "X",
      winner: null
    };
    playerSymbol = "X";
  } else if (room.players === 1) {
    // Second player
    room.players = 2;
    playerSymbol = "O";
  } else {
    alert("Room full");
    return;
  }

  await fetch(`${DB_URL}/rooms/${ROOM}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(room)
  });

  listenForUpdates();
}

function listenForUpdates() {
  setInterval(async () => {
    const res = await fetch(`${DB_URL}/rooms/${ROOM}.json`);
    const room = await res.json();
    if (!room) return;

    updateBoard(room.board);

    if (room.players < 2) {
      statusEl.textContent = "Waiting for another player...";
    } else if (room.winner) {
      statusEl.textContent = room.winner === "draw"
        ? "It's a draw!"
        : `Player ${room.winner} wins!`;
    } else {
      statusEl.textContent =
        room.turn === playerSymbol
          ? "Your turn"
          : "Opponent's turn";
    }
  }, 500);
}

async function makeMove(index) {
  const res = await fetch(`${DB_URL}/rooms/${ROOM}.json`);
  const room = await res.json();

  if (
    !room ||
    room.winner ||
    room.turn !== playerSymbol ||
    room.board[index] !== ""
  ) return;

  room.board[index] = playerSymbol;

  if (checkWin(room.board, playerSymbol)) {
    room.winner = playerSymbol;
  } else if (room.board.every(c => c !== "")) {
    room.winner = "draw";
  } else {
    room.turn = playerSymbol === "X" ? "O" : "X";
  }

  await fetch(`${DB_URL}/rooms/${ROOM}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(room)
  });
}

function updateBoard(board) {
  document.querySelectorAll(".cell").forEach((cell, i) => {
    cell.textContent = board[i];
  });
}

function checkWin(b, p) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return wins.some(w => w.every(i => b[i] === p));
}

// Start
joinRoom();
