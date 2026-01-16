// Input handling
const keys = {};
window.addEventListener("keydown", e => {
  //console.log('[INPUT] KeyDown fired:', e.key, e.code);

  // Клавиши, които трябва да работят винаги (за менюта)
  const menuKeys = ['Escape', 'm', '5', '6', '7', '8', '9', '0', '-', '=', 't', 'y', 'u', 'i'];

  // Ако е клавиш за меню, регистрирай го винаги
  if (menuKeys.includes(e.key)) {
    //console.log('[INPUT] Menu key detected, setting:', e.key, '= true');
    keys[e.key] = true;
    return; // Излез, за да не попаднеш в долната проверка
  }

  // Set default values for variables that might not be loaded yet
  const menuActive = window.menuActive || false;
  const rebindingAction = window.rebindingAction || false;
  const gameStateString = window.gameStateString || 'start';

  // Всички останали клавиши (за игра) работят само ако играта не е в меню
  if (!menuActive && !rebindingAction && gameStateString !== 'start') {
    //console.log('[INPUT] Game key detected, setting:', e.key, '= true');
    keys[e.key] = true;
  }
}, { capture: true });

window.addEventListener("keyup", e => keys[e.key] = false, { capture: true });

// Export the keys object globally
window.keys = keys;

function isKeyPressed(key) {
  return keys[key] === true;
}
