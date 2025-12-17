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
    this.mana = this.maxMana;

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
        [SKILL_TYPES.SECONDARY_ATTACK_LIGHT, 1],
        [SKILL_TYPES.JUMP, 1]  // Jump is always available
      ]),
      [SKILL_PAGES.SECONDARY]: new Map() // Втората страница започва празна
    };

    // Обратна съвместимост - комбинирано unlockedSkills Set от всички страници
    this.unlockedSkills = new Set([
      SKILL_TYPES.BASIC_ATTACK_LIGHT,
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
