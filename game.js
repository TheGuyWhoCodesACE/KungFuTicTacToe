const username = localStorage.getItem("username");
const roomId = localStorage.getItem("roomId");
const isHost = localStorage.getItem("isHost") === "true";

document.getElementById("roomDisplay").innerText = roomId;

const roomRef = db.ref("rooms/" + roomId);
const boardDiv = document.getElementById("board");
const statusDiv = document.getElementById("status");

// Create board UI
for (let i = 0; i < 9; i++) {
  const cell = document.createElement("div");
  cell.className = "cell";
  cell.onclick = () => makeMove(i);
  boardDiv.appendChild(cell);
}

// Create / join room
roomRef.once("value", snap => {
  if (!snap.exists()) {
    roomRef.set({
      board: Array(9).fill(""),
      turn: "X",
      players: { X: username }
    });
  } else {
    roomRef.child("players/O").set(username);
  }
});

// Listen for updates
roomRef.on("value", snap => {
  const data = snap.val();
  if (!data) return;

  updateBoard(data.board);
  statusDiv.innerText = `Turn: ${data.turn}`;
});

// Make move
function makeMove(index) {
  roomRef.once("value", snap => {
    const data = snap.val();
    if (!data) return;

    const mySymbol = isHost ? "X" : "O";
    if (data.turn !== mySymbol) return;
    if (data.board[index] !== "") return;

    data.board[index] = mySymbol;
    data.turn = mySymbol === "X" ? "O" : "X";

    roomRef.update(data);
  });
}

// Update UI
function updateBoard(board) {
  board.forEach((v, i) => {
    boardDiv.children[i].innerText = v;
  });
}
