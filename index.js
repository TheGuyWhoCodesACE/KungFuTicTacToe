function createRoom() {
    const username = document.getElementById('username').value;
    if (!username) return alert("Enter a username first!");

    // Generate a random room ID
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Save info to localStorage for the next page
    localStorage.setItem("username", username);
    localStorage.setItem("roomId", roomId);
    localStorage.setItem("isHost", "true");

    // Go to game page
    window.location.href = "game.html";
}

function joinRoom() {
    const username = document.getElementById('username').value;
    const roomId = document.getElementById('roomId').value.toUpperCase();
    if (!username || !roomId) return alert("Enter both username and room ID!");

    localStorage.setItem("username", username);
    localStorage.setItem("roomId", roomId);
    localStorage.setItem("isHost", "false");

    window.location.href = "game.html";
}
