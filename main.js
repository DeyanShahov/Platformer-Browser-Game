// Main initialization
let ctx;

function initGame() {
  // Setup canvas
  const canvas = document.getElementById("game");
  ctx = canvas.getContext("2d");

  // Create entities
  hero = createEntity(100, CANVAS_HEIGHT - 100, 0, 50, 50, "#3AA0FF");
  enemy = createEntity(450, CANVAS_HEIGHT - 100, 50, 60, 60, "#FF3020");
  ally = createEntity(420, CANVAS_HEIGHT - 100, 90, 50, 50, "#00FF00");

  // Initialize menu
  initMenu();

  // Start game loop
  requestAnimationFrame(loop);
}
