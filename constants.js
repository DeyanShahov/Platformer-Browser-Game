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
