function createRoom() {
  const username = usernameInput();
  const roomId = randomRoom();

  localStorage.setItem("username", username);
  localStorage.setItem("roomId", roomId);
  localStorage.setItem("role", "X");

  location.href = "game.html";
}

function joinRoom() {
  const username = usernameInput();
  const roomId = document.getElementById("roomId").value.trim().toUpperCase();

  localStorage.setItem("username", username);
  localStorage.setItem("roomId", roomId);
  localStorage.setItem("role", "O");

  location.href = "game.html";
}

function usernameInput() {
  const u = document.getElementById("username").value.trim();
  if (!u) alert("Enter username");
  return u;
}

function randomRoom() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
