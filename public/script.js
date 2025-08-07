const socket = io();
let currentRoom = null;
let mySymbol = "X";
let isMyTurn = true;

function createRoom() {
  const roomId = document.getElementById("roomInput").value;
  socket.emit("createRoom", roomId);
}

socket.on("roomJoined", (roomId) => {
  currentRoom = roomId;
  document.getElementById("status").innerText = "Joined room: " + roomId;
  drawBoard();
});

socket.on("roomFull", () => {
  document.getElementById("status").innerText = "Room is full!";
});

socket.on("updatePlayers", (players) => {
  mySymbol = players.indexOf(socket.id) === 0 ? "X" : "O";
  isMyTurn = mySymbol === "X";
  document.getElementById("status").innerText = `You are "${mySymbol}"`;
});

socket.on("opponentMove", ({ index, symbol }) => {
  document.querySelectorAll(".cell")[index].innerText = symbol;
  isMyTurn = true;
});

function drawBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.onclick = () => {
      if (!cell.innerText && isMyTurn && currentRoom) {
        cell.innerText = mySymbol;
        socket.emit("makeMove", {
          roomId: currentRoom,
          index: i,
          symbol: mySymbol
        });
        isMyTurn = false;
      }
    };
    board.appendChild(cell);
  }
}
