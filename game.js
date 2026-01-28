const roomId = localStorage.getItem("roomId");
const role = localStorage.getItem("role");

document.getElementById("room").innerText = roomId;

const roomRef = db.ref("rooms/" + roomId);
const boardDiv = document.getElementById("board");
const status = document.getElementById("status");

let lastAction = 0;
let gameOver = false;

for (let i = 0; i < 9; i++) {
  const c = document.createElement("div");
  c.className = "cell";
  c.onclick = () => place(i);
  boardDiv.appendChild(c);
}

roomRef.once("value", s => {
  if (!s.exists()) {
    roomRef.set({
      board: Array(9).fill(null),
      winner: null
    });
  }
});

roomRef.on("value", snap => {
  const data = snap.val();
  if (!data) return;

  render(data.board);

  if (data.winner) {
    status.innerText = `${data.winner} WINS`;
    gameOver = true;
  }
});

function place(i) {
  if (gameOver) return;
  const now = Date.now();
  if (now - lastAction < 200) return;
  lastAction = now;

  roomRef.transaction(data => {
    if (!data || data.winner) return data;

    const tile = data.board[i];
    if (tile && now - tile.time < 2000) return data;

    data.board[i] = { symbol: role, time: now };

    if (checkWin(data.board, role, now)) {
      data.winner = role;
    }

    return data;
  });

  setTimeout(() => cleanup(i), 2000);
}

function cleanup(i) {
  roomRef.transaction(data => {
    if (!data) return data;
    const t = data.board[i];
    if (t && Date.now() - t.time >= 2000) {
      data.board[i] = null;
    }
    return data;
  });
}

function render(board) {
  board.forEach((t, i) => {
    const cell = boardDiv.children[i];
    if (!t) {
      cell.innerText = "";
      cell.style.opacity = 1;
    } else {
      cell.innerText = t.symbol;
      const age = Date.now() - t.time;
      cell.style.opacity = Math.max(0, 1 - age / 2000);
    }
  });
}

function checkWin(board, sym, now) {
  const live = i => board[i] && board[i].symbol === sym && now - board[i].time < 2000;
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return lines.some(l => l.every(live));
}
