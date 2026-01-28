function createRoom() {
    const username = document.getElementById("username").value.trim();
    if (!username) return alert("Enter a username");

    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

    localStorage.setItem("username", username);
    localStorage.setItem("roomId", roomId);

    window.location.href = "game.html";
}

function joinRoom() {
    const username = document.getElementById("username").value.trim();
    const roomId = document.getElementById("roomId").value.trim().toUpperCase();
    if (!username || !roomId) return alert("Enter username and room ID");

    localStorage.setItem("username", username);
    localStorage.setItem("roomId", roomId);

    window.location.href = "game.html";
}
