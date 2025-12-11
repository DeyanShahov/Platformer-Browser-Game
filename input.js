// Input handling
const keys = {};
window.addEventListener("keydown", e => {
  // Клавиши, които трябва да работят винаги (за менюта)
  const menuKeys = ['Escape', 'm', '5', '6', '7', '8', '9', '0', '-', '=', 't', 'y', 'u', 'i'];

  // Ако е клавиш за меню, регистрирай го винаги
  if (menuKeys.includes(e.key)) {
    keys[e.key] = true;
    return; // Излез, за да не попаднеш в долната проверка
  }
  // Всички останали клавиши (за игра) работят само ако играта не е в меню
  if (!menuActive && !rebindingAction && gameState !== 'start') {
    keys[e.key] = true;
  }
});
window.addEventListener("keyup", e => keys[e.key] = false);

function isKeyPressed(key) {
  return keys[key] === true;
}
