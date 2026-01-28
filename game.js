const username = localStorage.getItem("username");
const roomId = localStorage.getItem("roomId");

document.getElementById("roomDisplay").innerText = roomId;
const status = document.getElementById("status");
const boardDiv = document.getElementById("board");

const roomRef = db.ref("rooms/" + roomId);
let lastPlaceTime = 0;

// Build board
for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.onclick = () => placeTile(i);
    boardDiv.appendChild(cell);
}

// Initialize room
roomRef.transaction(data => {
    if (data === null) {
        return { board: Array(9).fill(null), players: [username], winner: null };
    } else if (!data.players.includes(username)) {
        data.players.push(username);
    }
    return data;
});

// Listen for updates
roomRef.on("value", snap => {
    const data = snap.val();
    if (!data) return;

    updateBoard(data.board);

    if (data.players.length < 2) {
        status.textContent = "Waiting for another player...";
    } else {
        status.textContent = "Kung-Fu Mode: Place your tiles!";
    }

    if (data.winner) {
        status.textContent = `🎉 ${data.winner} wins!`;
    }
});

function placeTile(index) {
    if (Date.now() - lastPlaceTime < 200) return; // cooldown 0.2s
    lastPlaceTime = Date.now();

    roomRef.transaction(data => {
        if (!data || data.winner) return data;

        const tile = data.board[index];
        if (tile && Date.now() - tile.time < 2000) return data; // still fading

        data.board[index] = { symbol: username, time: Date.now() };

        // Check win
        if (checkWin(data.board, username)) {
            data.winner = username;
        }

        return data;
    });

    // remove tile after 2s
    setTimeout(() => {
        roomRef.transaction(data => {
            if (!data) return data;
            const t = data.board[index];
            if (t && Date.now() - t.time >= 2000) data.board[index] = null;
            return data;
        });
    }, 2000);
}

function updateBoard(board) {
    board.forEach((tile, i) => {
        const cell = boardDiv.children[i];
        if (!tile) {
            cell.textContent = "";
            cell.classList.remove("fade");
            cell.style.opacity = 1;
        } else {
            cell.textContent = "X"; // show generic tile
            cell.classList.add("fade");
            const age = Date.now() - tile.time;
            cell.style.opacity = Math.max(0, 1 - age / 2000);
        }
    });
}

function checkWin(board, player) {
    const live = i => board[i] && board[i].symbol === player && Date.now() - board[i].time < 2000;
    const lines = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    return lines.some(line => line.every(live));
}
