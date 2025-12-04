// Main initialization
let ctx;

function initGame() {
  // Setup canvas
  const canvas = document.getElementById("game");
  ctx = canvas.getContext("2d");

  // Create players
  players.push(new Player(controls.player1, 100, CANVAS_HEIGHT - 100, 0, "#3AA0FF"));
  players.push(new Player(controls.player2, 200, CANVAS_HEIGHT - 100, 30, "#FFA500"));

  // Create NPCs
  enemy = createEntity(450, CANVAS_HEIGHT - 100, 50, 60, 60, "#FF3020");
  ally = createEntity(520, CANVAS_HEIGHT - 100, 90, 50, 50, "#00FF00");

  // Initialize menu
  initMenu();

  // Start game loop
  requestAnimationFrame(loop);
}
