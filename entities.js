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

// Blue Slime Enemy Class
class BlueSlime {
  constructor(x, y, z, level = 1) {
    // Position and dimensions (scaled for sprite)
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = 240;  // Visual width (2x scaled sprite: 120*2)
    this.h = 256;  // Visual height (2x scaled sprite: 128*2)
    this.collisionW = 120;  // Collision width (same as sprite frame)
    this.collisionH = 128;  // Collision height (same as sprite frame)
    this.zThickness = 3;   // Z thickness for 2.5D collision
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.onGround = false;

    // Entity type
    this.entityType = 'enemy';

    // Enemy stats (Blue Slime specific)
    this.level = level;
    this.maxHealth = 80 + (level - 1) * 20; // 80 base + 20 per level
    this.health = this.maxHealth;
    this.baseAttack = 8 + (level - 1) * 2;   // 8 base + 2 per level
    this.baseDefense = 2;
    this.speed = 40; // Slower than player

    // Combat flags
    this.hit = false;
    this.damageDealt = false;
    this.isDying = false;
    this.deathTimer = 0;
    this.blinkCount = 0;
    this.visible = true;

    // Character info for combat system
    this.characterInfo = new CharacterInfo('enemy');
    this.characterInfo.baseAttack = this.baseAttack;
    this.characterInfo.baseDefense = this.baseDefense;
    this.characterInfo.strength = 5 + level;
    this.characterInfo.criticalChance = 0.03; // 3% crit chance

    // AI behavior
    this.aiState = 'idle'; // idle, patrol, chase, attack, flee
    this.aiTimer = 0;
    this.detectionRange = 300; // Distance to detect player
    this.attackRange = 100;    // Distance to attack player
    this.patrolDirection = 1;  // 1 = right, -1 = left
    this.patrolDistance = 200; // How far to patrol
    this.startX = x;           // Original spawn position

    // Animation entity type for animation system
    this.animationEntityType = 'blue_slime';

    // Animation system - will be set by animation system after registration
    this.animation = null;
    this.stateMachine = null; // Will be created after animation registration

    // Register with combat system
    if (window.enemyCombatManager) {
      window.enemyCombatManager.registerEnemy(this);
    }

    console.log(`[BLUE SLIME] Created Blue Slime (Level ${level}) at (${x}, ${y}) with ${this.maxHealth} HP`);
  }

  // AI Update - called every frame
  updateAI(player, dt) {
    if (this.isDying) return;

    const distanceToPlayer = Math.abs(this.x - player.x);
    const directionToPlayer = this.x < player.x ? 1 : -1;

    this.aiTimer += dt;

    switch (this.aiState) {
      case 'idle':
        // Stand still and look around
        if (this.aiTimer > 2.0) { // After 2 seconds, start patrolling
          this.aiState = 'patrol';
          this.aiTimer = 0;
        }
        // Check if player is close
        if (distanceToPlayer < this.detectionRange) {
          this.aiState = 'chase';
          this.aiTimer = 0;
        }
        break;

      case 'patrol':
        // Move back and forth
        this.vx = this.patrolDirection * this.speed * 0.5; // Slower patrol speed

        // Check patrol boundaries
        if (Math.abs(this.x - this.startX) > this.patrolDistance) {
          this.patrolDirection *= -1; // Reverse direction
          this.vx = 0;
          // Short pause before continuing
          if (this.aiTimer > 0.5) {
            this.aiTimer = 0;
          }
        }

        // Check if player is detected
        if (distanceToPlayer < this.detectionRange) {
          this.aiState = 'chase';
          this.aiTimer = 0;
          this.vx = 0;
        }
        break;

      case 'chase':
        // Move towards player
        this.vx = directionToPlayer * this.speed;

        // If player gets too far, go back to patrol
        if (distanceToPlayer > this.detectionRange * 1.5) {
          this.aiState = 'patrol';
          this.aiTimer = 0;
          this.vx = 0;
        }
        // If close enough, attack
        else if (distanceToPlayer < this.attackRange) {
          this.aiState = 'attack';
          this.aiTimer = 0;
          this.vx = 0;
        }
        break;

      case 'attack':
        // Perform attack if FSM is available
        if (this.stateMachine && !this.stateMachine.isInAttackState()) {
          // Choose random attack
          const attacks = ['attack_1', 'attack_2', 'attack_3'];
          const randomAttack = attacks[Math.floor(Math.random() * attacks.length)];
          this.stateMachine.handleAction(randomAttack);
        }

        // After attack, decide what to do next
        if (this.aiTimer > 1.5) { // Wait after attack
          if (distanceToPlayer < this.attackRange) {
            // Player still close, attack again
            this.aiTimer = 0;
          } else if (distanceToPlayer < this.detectionRange) {
            // Player moved away but still in range, chase
            this.aiState = 'chase';
            this.aiTimer = 0;
          } else {
            // Player too far, go back to patrol
            this.aiState = 'patrol';
            this.aiTimer = 0;
          }
        }
        break;
    }

    // Update animation based on AI state
    this.updateAnimationFromAI();
  }

  // Update animation to match AI state
  updateAnimationFromAI() {
    if (!this.stateMachine) return;

    const currentState = this.stateMachine.getCurrentStateName();

    // Don't interrupt attacks or hurt/death animations
    if (currentState.includes('attack') || currentState === 'hurt' || currentState === 'dead') {
      return;
    }

    // Update animation based on movement and AI state
    if (Math.abs(this.vx) > 5) {
      // Moving
      if (this.aiState === 'chase') {
        this.stateMachine.changeState('run');
      } else {
        this.stateMachine.changeState('walk');
      }
    } else {
      // Standing still
      this.stateMachine.changeState('idle');
    }
  }

  // Take damage from player attacks
  takeDamage(damage) {
    if (this.isDying) return 0;

    this.health -= damage;
    this.hit = true;

    console.log(`[BLUE SLIME] Took ${damage} damage, health: ${this.health}/${this.maxHealth}`);

    if (this.health <= 0) {
      this.die();
      return damage; // Return full damage dealt
    }

    // Play hurt animation
    if (this.stateMachine) {
      this.stateMachine.forceState('hurt');
    }

    return damage;
  }

  // Death sequence
  die() {
    this.isDying = true;
    this.health = 0;

    console.log(`[BLUE SLIME] Blue Slime defeated!`);

    // Play death animation
    if (this.stateMachine) {
      this.stateMachine.forceState('dead');
    }

    // Remove from combat system after death animation
    setTimeout(() => {
      if (window.enemyCombatManager) {
        window.enemyCombatManager.unregisterEnemy(this);
      }
    }, 2000); // 2 second delay
  }

  // Update death animation (blink effect)
  updateDeath(dt) {
    if (!this.isDying) return;

    this.deathTimer += dt;
    this.blinkCount++;

    // Blink every 100ms
    this.visible = Math.floor(this.deathTimer * 10) % 2 === 0;

    // Remove after 2 seconds
    if (this.deathTimer > 2.0) {
      this.visible = false;
      // Entity will be removed by game cleanup
    }
  }

  // Get experience reward for defeating this enemy
  getExperienceReward() {
    return 150 + (this.level - 1) * 50; // 150 base + 50 per level
  }

  // Get gold reward
  getGoldReward() {
    return 15 + (this.level - 1) * 5; // 15 base + 5 per level
  }
}

// Factory function to create Blue Slime
function createBlueSlime(x, y, z, level = 1) {
  return new BlueSlime(x, y, z, level);
}

// Global entities
window.players = [];
console.log('[ENTITIES] window.players initialized:', window.players);
let enemy, ally;

// Blue Slime exports
window.BlueSlime = BlueSlime;
window.createBlueSlime = createBlueSlime;
