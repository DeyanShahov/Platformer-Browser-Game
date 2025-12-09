class Player {
  constructor(controls, x, y, z, color, characterId = null) {
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

    // Character info system
    this.characterInfo = new CharacterInfo(characterId || this.getCharacterIdFromColor(color));

    // Нова система за действия
    this.currentAction = null;      // Текущо изпълнявано действие
    this.executionTimer = 0;        // Таймер за изпълнение
    this.cooldownTimers = {};       // Таймери за презареждане

    // Инициализация на cooldown таймери за всички действия
    Object.values(ACTION_TYPES).forEach(actionType => {
      this.cooldownTimers[actionType] = 0;
    });

    // UI Stats
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.maxEnergy = 50;
    this.energy = this.maxEnergy;
    this.maxMana = 30;
    this.mana = this.maxMana;

    // Skill Tree System
    this.skillPoints = 0;  // Available skill points for unlocking skills
    this.unlockedSkills = new Set([
      SKILL_TYPES.BASIC_ATTACK_LIGHT,
      SKILL_TYPES.SECONDARY_ATTACK_LIGHT
    ]); // Skills that are unlocked and can be used

    // Combat flags
    this.hit = false;
    this.damageDealt = false; // Prevent multiple damage calculations per attack
  }

  // Helper method to determine character ID from color
  getCharacterIdFromColor(color) {
    const colorMap = {
      '#3AA0FF': 'blue',
      '#FFA500': 'orange',
      '#00FF00': 'green',
      '#FF0000': 'red'
    };
    return colorMap[color] || 'blue'; // Default to blue if color not found
  }

  // Проверка дали може да се изпълни дадено действие
  canPerformAction(actionType) {
    // First check cooldowns and current action
    const baseCheck = this.cooldownTimers[actionType] <= 0 && !this.currentAction;

    // Then check skill and resources
    const skillCheck = window.skillTreeManager.canPerformActionWithResources(this, actionType);

    return baseCheck && skillCheck;
  }

  // Започване на действие
  startAction(actionType) {
    if (this.canPerformAction(actionType)) {
      // Consume resources before starting action
      const resourcesConsumed = window.skillTreeManager.consumeResources(this, actionType);
      if (!resourcesConsumed) return false;

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
          // Action completed - reset flags
          this.currentAction = null;
          this.executionTimer = 0;
          this.damageDealt = false; // Reset damage flag for next attack
        }
      } else {
        // Действия с 0 време за изпълнение (като скок) се изчистват веднага
        this.currentAction = null;
        this.executionTimer = 0;
        this.damageDealt = false; // Reset damage flag for next attack
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
console.log('[ENTITIES] window.players initialized:', window.players);
let enemy, ally;
