// Game constants
const Z_MIN = 20;
const Z_MAX = 320;
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 500;
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
const EXECUTION_TIMERS = {
  [ACTION_TYPES.BASIC_ATTACK_LIGHT]: 0.15,      // Бърза лека атака
  [ACTION_TYPES.BASIC_ATTACK_MEDIUM]: 0.3,      // Средна атака
  [ACTION_TYPES.BASIC_ATTACK_HEAVY]: 0.6,       // Бавна тежка атака

  [ACTION_TYPES.SECONDARY_ATTACK_LIGHT]: 0.2,   // Бърза лека допълнителна
  [ACTION_TYPES.SECONDARY_ATTACK_MEDIUM]: 0.4,  // Средна допълнителна
  [ACTION_TYPES.SECONDARY_ATTACK_HEAVY]: 0.8,   // Бавна тежка допълнителна

  [ACTION_TYPES.JUMP]: 0.0  // Скок няма таймер за изпълнение
};

// Таймери за презареждане на действията (cooldown в секунди)
const COOLDOWN_TIMERS = {
  [ACTION_TYPES.BASIC_ATTACK_LIGHT]: 0.5,   // Бързо презареждане
  [ACTION_TYPES.BASIC_ATTACK_MEDIUM]: 1.0,   // Средно презареждане
  [ACTION_TYPES.BASIC_ATTACK_HEAVY]: 2.0,    // Бавно презареждане

  [ACTION_TYPES.SECONDARY_ATTACK_LIGHT]: 0.8, // Бързо презареждане
  [ACTION_TYPES.SECONDARY_ATTACK_MEDIUM]: 1.5, // Средно презареждане
  [ACTION_TYPES.SECONDARY_ATTACK_HEAVY]: 3.0,   // Бавно презареждане

  [ACTION_TYPES.JUMP]: 0.0  // Скок няма cooldown
};
