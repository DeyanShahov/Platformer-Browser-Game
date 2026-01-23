// ===========================================
// GLOBAL DECLARATIONS - Available immediately when file loads
// ===========================================


// Separate game state string from GameState instance
window.gameStateString = 'start'; // 'start', 'playing'

// Level system integration
window.levelManager = null; // Will be initialized after game systems are ready

// Character definitions - declared globally for UI access
const characters = [
  { id: 'blue', name: 'Син герой', color: '#3AA0FF', position: 0 },
  { id: 'orange', name: 'Оранжев герой', color: '#FFA500', position: 30 },
  { id: 'green', name: 'Зелен герой', color: '#00FF00', position: 60 },
  { id: 'red', name: 'Червен герой', color: '#FF0000', position: 90 }
];

// Make globally available immediately
window.characters = characters;

// Player class - moved from entities.js
class Player {
  constructor(controls, x, y, z, color, characterId = null) {
    this.controls = controls;
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = 500;  // Visual width (for sprite rendering) - DOUBLED from 250
    this.h = 500;  // Visual height (for sprite rendering) - DOUBLED from 250
    this.collisionW = 240;  // Collision width (smaller than visual) - DOUBLED from 120
    this.collisionH = 260;  // Collision height - DOUBLED from 130
    this.zThickness = 5;   // Z thickness for 2.5D collision (hero has most presence)
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.color = color;
    this.onGround = false;

    // Character info system
    this.characterInfo = new CharacterInfo(characterId || this.getCharacterIdFromColor(color));

    // FSM handles actions now - removed currentAction system
    // Removed cooldown timers - FSM handles timing

    // UI Stats
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.maxEnergy = 50;
    this.energy = this.maxEnergy;
    this.maxMana = 30;
    this.mana = this.maxMana; // ← Вече е добавено

    // Initialize characterInfo resources to match player resources
    this.characterInfo.mana = this.mana;
    this.characterInfo.energy = this.energy;

    // Combat stats (synchronized with characterInfo, can be modified by passive skills)
    this.baseAttack = this.characterInfo.baseAttack;
    this.hitChance = this.characterInfo.hitChance;
    this.dodgeChance = this.characterInfo.dodgeChance;
    this.blockChance = this.characterInfo.blockChance;

    // Skill Tree System
    this.skillPoints = 0;  // Available skill points for unlocking skills

    // Micro skill tracking - completely separate from main skill system
    this.selectedMicroSkills = new Map(); // parentSkillType -> Set(skillIndices)

    // Нова система за нива на уменията по страници (замества старата unlockedSkills)
    this.skillLevelsByPage = {
      [SKILL_PAGES.MAIN]: new Map([
        [SKILL_TYPES.BASIC_ATTACK_LIGHT, 1],  // Започват отключени на ниво 1
        [SKILL_TYPES.BASIC_ATTACK_MEDIUM, 1], // Добавено: средна атака отключена
        [SKILL_TYPES.SECONDARY_ATTACK_LIGHT, 1],
        [SKILL_TYPES.JUMP, 1]  // Jump is always available
      ]),
      [SKILL_PAGES.SECONDARY]: new Map() // Втората страница започва празна
    };

    // Обратна съвместимост - комбинирано unlockedSkills Set от всички страници
    this.unlockedSkills = new Set([
      SKILL_TYPES.BASIC_ATTACK_LIGHT,
      SKILL_TYPES.BASIC_ATTACK_MEDIUM, // Добавено: средна атака отключена
      SKILL_TYPES.SECONDARY_ATTACK_LIGHT,
      SKILL_TYPES.JUMP
    ]);

    // Helper method to get skill levels for a specific page
    this.getSkillLevelsForPage = (page) => {
      return this.skillLevelsByPage[page] || new Map();
    };

    // Helper method to get combined skill levels from all pages
    this.skillLevels = new Proxy({}, {
      get: (target, prop) => {
        // If accessing Map methods, delegate to combined logic
        if (prop === 'get') {
          return (skillType) => {
            // Check all pages for this skill
            for (const page of Object.values(SKILL_PAGES)) {
              const pageLevels = this.skillLevelsByPage[page];
              if (pageLevels && pageLevels.has(skillType)) {
                return pageLevels.get(skillType);
              }
            }
            return 0; // Not found in any page
          };
        }

        if (prop === 'set') {
          return (skillType, value) => {
            // Determine which page this skill belongs to and update there
            let targetPage = null;
            if (Object.values(SKILL_GRID_LAYOUTS[SKILL_PAGES.MAIN]).flat().includes(skillType)) {
              targetPage = SKILL_PAGES.MAIN;
            } else if (Object.values(SKILL_GRID_LAYOUTS[SKILL_PAGES.SECONDARY]).flat().includes(skillType)) {
              targetPage = SKILL_PAGES.SECONDARY;
            }

            if (targetPage) {
              this.skillLevelsByPage[targetPage].set(skillType, value);
              // Update unlockedSkills for backwards compatibility
              if (value > 0) {
                this.unlockedSkills.add(skillType);
              } else {
                this.unlockedSkills.delete(skillType);
              }
            }
            return this.skillLevels; // Return the proxy for chaining
          };
        }

        if (prop === 'has') {
          return (skillType) => {
            for (const page of Object.values(SKILL_PAGES)) {
              const pageLevels = this.skillLevelsByPage[page];
              if (pageLevels && pageLevels.has(skillType)) {
                return true;
              }
            }
            return false;
          };
        }

        // For other properties, return undefined
        return undefined;
      }
    });

    // Combat flags
    this.hit = false;
    this.damageDealt = false; // Prevent multiple damage calculations per attack

    // Animation entity type for animation system
    this.animationEntityType = 'knight';

    // Animation system - will be registered by animation system after creation
    this.animation = null;

    // New State Machine for animation states
    this.stateMachine = null;
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

  // FSM handles all actions now - removed old action system methods
}

/**
 * Main game update loop - coordinates all game systems
 * @param {number} dt - Delta time for frame-based calculations
 */
function update(dt) {
  // Skip updates if game is paused during transitions
  if (window.levelManager?.gamePaused) {
    return;
  }

  // Handle skill tree and character stats key inputs
  window.MenuSystem.handleSkillTreeKeys(window.gameState, window.keys, window.MenuSystem.lastSkillTreeToggleTime);
  window.MenuSystem.handleCharacterStatsKeys(window.gameState, window.keys, window.MenuSystem.lastSkillTreeToggleTime);

  // Ако имаме активно меню, не ъпдейтвай играчите и враговете.
  // Това ефективно "паузира" играта.
  if (!menuActive) {
    // Обработка на смърт вече е обединена с enemy update цикъла по-долу

    // Обновяване на всички играчи
    if (window.gameState) {
      window.gameState.players.forEach((player, index) => {
        window.updatePlayer(player, index, dt);

        // Reset hit flag after a short time (like enemies)
        if (player.hit) {
          player.hit = false;
        }
      });

      // Обновяване на всички противници (живи и умиращи)
      const enemies = window.gameState.getEntitiesByType('enemy');
      enemies.forEach(enemy => {
        if (!enemy.isDying) {
          // Живи противници - AI и движение
          // Apply enemy physics FIRST (boundary clamping affects Z position)
          enemy.handleMovement(dt, CANVAS_HEIGHT, GRAVITY);
          // Then update AI with correct Z position after boundary clamping
          enemy.updateEnemyAI(dt, window.gameState.players, window.gameState);
        } else {
          // Умиращи противници - само смъртна анимация
          window.EnemyDeath.updateDeath(enemy, dt);
        }
      });
    } else {
      // Fallback към старата система за backwards compatibility
      players.forEach((player, index) => {
        window.updatePlayer(player, index, dt);
      });
      // Fallback enemy update - use legacy enemy if available
      if (window.enemy && !window.enemy.isDying) {
        window.enemy.handleMovement(dt, CANVAS_HEIGHT, GRAVITY);
        window.enemy.updateEnemyAI(dt, window.players || [], null);
      }
    }
  }
}


/**
 * Main game loop - handles frame timing and system updates
 * @param {number} ts - Timestamp from requestAnimationFrame
 */
let last = 0;
function loop(ts) {
  const dt = (ts - last) / 1000;
  last = ts;

  update(dt);

  // Update animation system AFTER physics (velocity updates)
  if (window.animationSystem && window.animationSystem.isInitialized) {
    window.animationSystem.update(dt);
  }

  render();

  // Update damage numbers
  if (window.damageNumberManager) {
    window.damageNumberManager.update(dt);
  }

  // Update enemy combat manager (attack cooldowns)
  if (window.enemyCombatManager) {
    window.enemyCombatManager.updateCooldowns(dt);
  }

  // Update camera controller
  if (window.cameraController) {
    window.cameraController.update(dt);
  }

  // Update level manager (handles level transitions and completion checking)
  if (window.levelManager) {
    window.levelManager.update(dt);

    // Update exit points
    if (window.levelManager.exitPointManager && window.gameState) {
      const players = window.gameState.getEntitiesByType('player');
      window.levelManager.exitPointManager.update(players, dt);
    }

    // Update trigger spawner
    if (window.levelManager.triggerSpawner && window.gameState) {
      const players = window.gameState.getEntitiesByType('player');
      window.levelManager.triggerSpawner.update(players, dt);
    }

    // Update dynamic entity manager
    if (window.levelManager.dynamicEntityManager && window.gameState) {
      const players = window.gameState.getEntitiesByType('player');
      window.levelManager.dynamicEntityManager.update(players, dt);
    }
  }

  // Update resource regeneration for all entities
  if (window.resourceManagers) {
    for (const [entity, resourceManager] of window.resourceManagers) {
      resourceManager.updateRegeneration(dt);
    }
  }

  requestAnimationFrame(loop);
}

