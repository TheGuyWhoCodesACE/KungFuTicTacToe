const socket = io();
const boardEl = document.getElementById("board");

for (let i = 0; i < 9; i++) {
  const cell = document.createElement("div");
  cell.className = "cell";
  cell.dataset.index = i;
  cell.addEventListener("click", () => {
    const x = i % 3;
    const y = Math.floor(i / 3);
    socket.emit("placeMarker", { x, y });
  });
  boardEl.appendChild(cell);
}

function clearMarkers() {
  document.querySelectorAll(".marker").forEach(el => el.remove());
}

socket.on("updateBoard", (markers) => {
  clearMarkers();
  markers.forEach(({ x, y, playerId }) => {
    const index = y * 3 + x;
    const cell = document.querySelector(`.cell[data-index='${index}']`);
    const marker = document.createElement("div");
    marker.className = "marker";
    marker.textContent = playerId.slice(0, 1).toUpperCase();
    cell.appendChild(marker);
  });
});
