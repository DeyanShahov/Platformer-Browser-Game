class Player {
  constructor(controls, x, y, z, color) {
    this.controls = controls;
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = 50;
    this.h = 50;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.color = color;
    this.onGround = false;

    // Нова система за действия
    this.currentAction = null;      // Текущо изпълнявано действие
    this.executionTimer = 0;        // Таймер за изпълнение
    this.cooldownTimers = {};       // Таймери за презареждане

    // Инициализация на cooldown таймери за всички действия
    Object.values(ACTION_TYPES).forEach(actionType => {
      this.cooldownTimers[actionType] = 0;
    });

    this.hit = false;
  }

  // Проверка дали може да се изпълни дадено действие
  canPerformAction(actionType) {
    return this.cooldownTimers[actionType] <= 0 && !this.currentAction;
  }

  // Започване на действие
  startAction(actionType) {
    if (this.canPerformAction(actionType)) {
      this.currentAction = actionType;
      this.executionTimer = EXECUTION_TIMERS[actionType];
      this.cooldownTimers[actionType] = COOLDOWN_TIMERS[actionType];
      return true;
    }
    return false;
  }

  // Обновяване на таймерите
  updateTimers(dt) {
    // Намаляване на cooldown таймерите
    Object.keys(this.cooldownTimers).forEach(actionType => {
      if (this.cooldownTimers[actionType] > 0) {
        this.cooldownTimers[actionType] -= dt;
        if (this.cooldownTimers[actionType] < 0) {
          this.cooldownTimers[actionType] = 0;
        }
      }
    });

    // Намаляване на таймера за изпълнение
    if (this.currentAction) {
      if (this.executionTimer > 0) {
        this.executionTimer -= dt;
        if (this.executionTimer <= 0) {
          this.currentAction = null;
          this.executionTimer = 0;
        }
      } else {
        // Действия с 0 време за изпълнение (като скок) се изчистват веднага
        this.currentAction = null;
        this.executionTimer = 0;
      }
    }
  }
}

// Entity management for NPCs
function createEntity(x, y, z, w, h, color) {
  return {
    x, y, z,
    w, h,
    vx: 0,
    vy: 0,
    vz: 0,
    color,
    onGround: false,

    // For attack state
    attacking: false,
    attackTimer: 0,

    // For hit state
    hit: false,
  };
}

// Global entities
window.players = [];
let enemy, ally;
