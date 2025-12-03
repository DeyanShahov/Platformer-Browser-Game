// Input handling
const keys = {};
window.addEventListener("keydown", e => {
  if (!menuActive && !rebindingAction) {
    keys[e.key] = true;
  }
});
window.addEventListener("keyup", e => keys[e.key] = false);
