// Input handling
const keys = {};
window.addEventListener("keydown", e => {
  if (!menuActive && !rebindingAction && gameState !== 'start') {
    keys[e.key] = true;
  }
});
window.addEventListener("keyup", e => keys[e.key] = false);

function isKeyPressed(key) {
  return keys[key] === true;
}
