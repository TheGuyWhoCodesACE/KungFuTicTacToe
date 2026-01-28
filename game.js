const username = localStorage.getItem("username");
const roomId = localStorage.getItem("roomId");
const isHost = localStorage.getItem("isHost") === "true";

document.getElementById("roomDisplay").innerText = roomId;

const board = Array(9).fill("");
let turn = "X"; // X always starts
let gameOver = false;

const boardDiv = document.getElementById("board");
const statusDiv = document.getElementById("status");

// Create board UI
for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", () => makeMove(i));
    boardDiv.appendChild(cell);
}

function makeMove(index) {
    if (gameOver || board[index] !== "") return;

    board[index] = turn;
    updateBoard();
    checkWinner();

    turn = turn === "X" ? "O" : "X";
}

function updateBoard() {
    board.forEach((val, idx) => {
        boardDiv.children[idx].innerText = val;
    });
}

function checkWinner() {
    const winningCombos = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];

    for (const combo of winningCombos) {
        const [a,b,c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            gameOver = true;
            statusDiv.innerText = `${board[a]} Wins!`;
            return;
        }
    }

    if (!board.includes("")) {
        gameOver = true;
        statusDiv.innerText = "It's a Tie!";
    }
}
