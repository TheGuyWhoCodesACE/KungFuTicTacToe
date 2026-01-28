const username = localStorage.getItem("username");
const roomId = localStorage.getItem("roomId");
const isHost = localStorage.getItem("isHost") === "true";

document.getElementById("roomDisplay").innerText = roomId;

const roomRef = db.ref("rooms/" + roomId);
const boardDiv = document.getElementById("board");

const symbol = isHost ? "X" : "O";
let lastPlaceTime = 0;

// Build board
for (let i = 0; i < 9; i++) {
  const cell = document.createElement("div");
  cell.className = "cell";
  cell.onclick = () => attemptPlace(i);
  boardDiv.appendChild(cell);
}

// Initialize room
roomRef.once("value", snap => {
  if (!snap.exists()) {
    roomRef.set({
      board: Array(9).fill(null),
      timestamps: Array(9).fill(0)
    });
  }
});

// Listen for updates
roomRef.on("value", snap => {
  const data = snap.val();
  if (!data) return;

  data.board.forEach((value, i) => {
    const cell = boardDiv.children[i];

    if (value) {
      cell.innerText = value.symbol;
      cell.classList.add("fade");

      const elapsed = Date.now() - value.time;
      if (elapsed < 2000) {
        cell.style.opacity = 1 - elapsed / 2000;
      } else {
        cell.innerText = "";
        cell.classList.remove("fade");
        cell.style.opacity = 1;
      }
    } else {
      cell.innerText = "";
      cell.classList.remove("fade");
      cell.style.opacity = 1;
    }
  });
});

// Attempt to place tile
function attemptPlace(index) {
  const now = Date.now();

  // Cooldown: 0.2 seconds
  if (now - lastPlaceTime < 200) return;
  lastPlaceTime = now;

  roomRef.once("value", snap => {
    const data = snap.val();
    if (!data) return;

    // If tile still exists and hasn't expired, block
    const tile = data.board[index];
    if (tile && now - tile.time < 2000) return;

    // Place tile
    data.board[index] = {
      symbol: symbol,
      time: now
    };

    roomRef.update({ board: data.board });

    // Remove tile after 2 seconds
    setTimeout(() => {
      roomRef.once("value", s => {
        const d = s.val();
        if (!d) return;

        if (d.board[index] && d.board[index].time === now) {
          d.board[index] = null;
          roomRef.update({ board: d.board });
        }
      });
    }, 2000);
  });
}
