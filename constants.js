// Game constants
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const Z_MIN = -450;
const Z_MAX = 200;
const X_MIN = 0;              // Left screen boundary
const X_MAX = CANVAS_WIDTH;   // Right screen boundary
const SPEED = 200;
const Z_SPEED = 200;
const GRAVITY = 800;
const JUMP_FORCE = -350;
const ATTACK_TIMER = 0.2;

// Типове действия
const ACTION_TYPES = {
  // Основни атаки
  BASIC_ATTACK_LIGHT: 'basic_attack_light',
  BASIC_ATTACK_MEDIUM: 'basic_attack_medium',
  BASIC_ATTACK_HEAVY: 'basic_attack_heavy',

  // Допълнителни атаки
  SECONDARY_ATTACK_LIGHT: 'secondary_attack_light',
  SECONDARY_ATTACK_MEDIUM: 'secondary_attack_medium',
  SECONDARY_ATTACK_HEAVY: 'secondary_attack_heavy',

  // Движения
  JUMP: 'jump'
};

// Таймери за изпълнение на действията (в секунди)
// const EXECUTION_TIMERS = {
//   [ACTION_TYPES.JUMP]: 0.0  // Скок няма таймер за изпълнение
// };

// Таймери за презареждане на действията (cooldown в секунди)
// const COOLDOWN_TIMERS = {
//   [ACTION_TYPES.JUMP]: 0.0  // Скок няма cooldown
// };

// Таймерите за изпълнение и cooldown вече са преместени в SKILL_TREE
// като executionTime и cooldownTime свойства за data-driven подход

// Debug visualization flags - set to false for production/release builds
// Usage: Set individual flags to false to disable specific visualizations
// Or set SHOW_HITBOXES to false to disable all hitbox drawing
// Runtime toggle: window.toggleDebugBoxes() in browser console
const DEBUG_MODE = {
  SHOW_HITBOXES: true,        // Master switch for all hitbox types
  SHOW_PLAYER_BOX: true,      // Yellow collision box for player
  SHOW_HURT_BOXES: true,      // Orange hurt boxes for entities
  SHOW_ATTACK_BOXES: true,    // Red attack boxes during attacks
  SHOW_ENTITY_LABELS: false,  // Entity type and ID labels
  SHOW_DAMAGE_NUMBERS: true,  // Floating damage numbers
};

// Runtime debug toggle function
function toggleDebugBoxes() {
  DEBUG_MODE.SHOW_HITBOXES = !DEBUG_MODE.SHOW_HITBOXES;
  console.log(`Debug hitboxes: ${DEBUG_MODE.SHOW_HITBOXES ? 'ENABLED' : 'DISABLED'}`);
  console.log('Individual controls:');
  console.log('- DEBUG_MODE.SHOW_PLAYER_BOX (yellow)');
  console.log('- DEBUG_MODE.SHOW_HURT_BOXES (orange)');
  console.log('- DEBUG_MODE.SHOW_ATTACK_BOXES (red)');
}

// Make toggle function globally available
if (typeof window !== 'undefined') {
  window.toggleDebugBoxes = toggleDebugBoxes;
}
