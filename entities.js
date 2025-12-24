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

    // AI behavior - legacy system (for fallback)
    this.aiState = 'idle'; // idle, patrol, chase, attack, flee
    this.aiTimer = 0;
    this.detectionRange = 300; // Distance to detect player
    this.attackRange = 100;    // Distance to attack player
    this.patrolDirection = 1;  // 1 = right, -1 = left
    this.patrolDistance = 200; // How far to patrol
    this.startX = x;           // Original spawn position

    // BT AI Properties (following example_use_of_BT.js pattern)
    this.rarity = 'common';        // BT rarity level
    this.intelligence = 'basic';   // BT intelligence level

    // Animation entity type for animation system
    this.animationEntityType = 'blue_slime';

    // Animation system - will be set by animation system after registration
    this.animation = null;
    this.stateMachine = null; // Will be created after animation registration

    // Initialize BT AI System (following example pattern)
    this.initializeBT();

    // Register with combat system
    if (window.enemyCombatManager) {
      window.enemyCombatManager.registerEnemy(this);
    }

    console.log(`[BLUE SLIME] Created Blue Slime (Level ${level}) at (${x}, ${y}) with ${this.maxHealth} HP`);
  }

  // Initialize Behavior Tree AI System (following example_use_of_BT.js pattern)
  initializeBT() {
    if (!window.createEnemyBehaviorTree || !window.tickEnemyAI || !window.createAttackProfile) {
      console.warn('[BLUE SLIME] BT system not loaded, using fallback AI');
      return;
    }

    // Create BT context following example pattern exactly
    this.aiContext = {
      name: `BlueSlime_${this.level}`,
      rarity: this.rarity,
      intelligence: this.intelligence,
      self: { hp: this.health, maxHp: this.maxHealth, x: this.x, y: this.y },
      targets: [], // Will be updated in updateAI
      capabilities: { canBlock: false, canEvade: false },
      attackProfile: window.createAttackProfile(["light"]), // Blue Slime uses only light attacks
      intelligence: { blockChance: 0, evadeChance: 0.1, aggression: 0.3 },
      behaviors: window.ENEMY_BEHAVIORS?.[this.rarity]?.[this.intelligence],
      phaseSpecialAvailable: false, // Blue Slime is not a boss
      command: null,
    };

    // Create BT tree (following example pattern)
    this.aiContext.behaviorTree = window.createEnemyBehaviorTree();

    console.log(`[BLUE SLIME] BT AI system initialized: ${this.rarity}/${this.intelligence}`);
  }

  // AI Update - FSM controls execution, BT provides strategic decisions
  updateAI(players, dt) {
    if (this.isDying) return;

    // Update BT context with current game state (for when BT is consulted)
    this.updateBTContext(players);

    // FSM handles all movement and animation logic
    // BT is consulted only for strategic decisions (behavior transitions)
    this.updateFSMBehavior(players, dt);
  }

  // FSM-based behavior control - consults BT for strategic decisions
  updateFSMBehavior(players, dt) {
    if (!this.stateMachine) {
      console.log('[BLUE SLIME FSM] No stateMachine available');
      return;
    }

    const currentState = this.stateMachine.getCurrentStateName();
    const behaviors = this.aiContext?.behaviors || {};

    //console.log(`[BLUE SLIME FSM] Current state: ${currentState}, aiTimer: ${this.aiTimer}, vx: ${this.vx}`);

    // State-specific behavior logic
    switch(currentState) {
      case 'enemy_idle':
        this.updateIdleBehavior(players, dt, behaviors);
        break;

      case 'enemy_walking':
        this.updateWalkingBehavior(players, dt, behaviors);
        break;

      case 'enemy_running':
        this.updateRunningBehavior(players, dt, behaviors);
        break;

      case 'enemy_attack':
      case 'enemy_attack_light':
      case 'enemy_attack_medium':
      case 'enemy_attack_heavy':
        this.updateAttackBehavior(players, dt, behaviors);
        break;

      default:
        // Unknown state, go to idle
        console.log(`[BLUE SLIME FSM] Unknown state ${currentState}, going to enemy_idle`);
        this.stateMachine.changeState('enemy_idle');
        break;
    }
  }

  // Idle behavior: wait for duration, then consult BT for next action
  updateIdleBehavior(players, dt, behaviors) {
    // Handle negative timer (custom duration from command)
    if (this.aiTimer < 0) {
      // Custom duration idle - count up from negative to 0
      this.aiTimer += dt;
      this.vx = 0; // No movement

      const customDuration = Math.abs(this.aiTimer); // Original negative value
      console.log(`[BLUE SLIME IDLE] Custom duration timer: ${this.aiTimer}/${customDuration}, vx: ${this.vx}`);

      if (this.aiTimer >= 0) {
        console.log(`[BLUE SLIME IDLE] Custom duration expired, consulting BT for next behavior`);
        // Custom idle duration expired - consult BT for next behavior
        const nextBehavior = this.consultBTForBehavior(players);
        console.log(`[BLUE SLIME IDLE] BT returned:`, nextBehavior);
        this.transitionToBehavior(nextBehavior, behaviors);
        this.aiTimer = 0;
      }
      return;
    }

    // Normal idle behavior
    this.aiTimer += dt;
    this.vx = 0; // No movement

    const idleDuration = behaviors.idle?.duration || 2000;
    console.log(`[BLUE SLIME IDLE] Timer: ${this.aiTimer}/${idleDuration}, vx: ${this.vx}`);

    if (this.aiTimer >= idleDuration) {
      console.log(`[BLUE SLIME IDLE] Timer expired, consulting BT for next behavior`);
      // Idle duration expired - consult BT for next behavior
      const nextBehavior = this.consultBTForBehavior(players);
      console.log(`[BLUE SLIME IDLE] BT returned:`, nextBehavior);
      this.transitionToBehavior(nextBehavior, behaviors);
      this.aiTimer = 0;
    }
  }

  // Walking behavior: patrol movement with intelligent collision handling
  updateWalkingBehavior(players, dt, behaviors) {
    const patrolSpeed = behaviors.patrol?.speed || 50;
    const patrolRadius = behaviors.patrol?.radiusX || 200;

    // Initialize patrol if needed
    if (this.patrolDirection === undefined) {
      this.patrolDirection = 1; // Start right
      this.startX = this.x; // Patrol center
    }

    // Check screen boundaries - consult BT for decision
    const boundaryDirection = window.enemyAIUtils.getScreenBoundaryDirection(this, this.patrolDirection);
    if (boundaryDirection !== null) {
      console.log(`[BLUE SLIME PATROL] Hit screen boundary, consulting BT for decision`);
      // Consult BT with context about screen boundary collision
      const nextBehavior = this.consultBTForBehavior(players, { reason: 'screen_boundary', boundaryDirection });
      this.transitionToBehavior(nextBehavior, behaviors);
      return;
    }

    // Check entity collisions - consult BT for decision
    const entities = window.gameState ? window.gameState.getAllEntities() : [];
    const collisions = window.enemyAIUtils.detectEntityCollisions(this, entities, 80);

    if (collisions.length > 0) {
      console.log(`[BLUE SLIME PATROL] Detected ${collisions.length} entity collisions, consulting BT`);
      // Consult BT with context about entity collision
      const nextBehavior = this.consultBTForBehavior(players, {
        reason: 'entity_collision',
        collisions: collisions
      });
      this.transitionToBehavior(nextBehavior, behaviors);
      return;
    }

    // Check patrol radius boundaries - consult BT for decision
    if (Math.abs(this.x - this.startX) >= patrolRadius) {
      console.log(`[BLUE SLIME PATROL] Reached patrol radius boundary, consulting BT`);
      // Consult BT with context about patrol end
      const nextBehavior = this.consultBTForBehavior(players, { reason: 'patrol_end' });
      this.transitionToBehavior(nextBehavior, behaviors);
      return;
    }

    // Check for player detection during patrol
    const closestPlayer = this.getClosestPlayer(players);
    if (closestPlayer && closestPlayer.distance <= (behaviors.chase?.radiusX || 300)) {
      console.log(`[BLUE SLIME PATROL] Player detected during patrol, consulting BT`);
      // Player detected - consult BT for chase decision
      const nextBehavior = this.consultBTForBehavior(players, { reason: 'player_detected', playerDistance: closestPlayer.distance });
      if (nextBehavior.type === 'chase') {
        this.transitionToBehavior(nextBehavior, behaviors);
        return;
      }
    }

    // Continue patrol movement - no issues detected
    this.vx = this.patrolDirection * patrolSpeed;
  }

  // Running behavior: chase player, check distance and attack range
  updateRunningBehavior(players, dt, behaviors) {
    const closestPlayer = this.getClosestPlayer(players);

    if (!closestPlayer) {
      // No players - consult BT for next behavior
      const nextBehavior = this.consultBTForBehavior(players);
      this.transitionToBehavior(nextBehavior, behaviors);
      return;
    }

    const chaseSpeed = behaviors.chase?.speed || 80;
    const attackRange = behaviors.attack ? 100 : 100; // Use attack range from BT config

    if (closestPlayer.distance <= attackRange) {
      // In attack range - stop chasing and attack
      this.vx = 0; // Stop moving!
      const nextBehavior = this.consultBTForBehavior(players);
      if (nextBehavior.type === 'attack') {
        this.transitionToBehavior(nextBehavior, behaviors);
        return;
      }
    }

    if (closestPlayer.distance > (behaviors.chase?.radiusX || 300) * 1.5) {
      // Player too far - consult BT for next behavior
      const nextBehavior = this.consultBTForBehavior(players);
      this.transitionToBehavior(nextBehavior, behaviors);
      return;
    }

    // Continue chasing
    const direction = this.x < closestPlayer.x ? 1 : -1;
    this.vx = direction * chaseSpeed;
  }

  // Attack behavior: handled by FSM animation timing
  updateAttackBehavior(players, dt, behaviors) {
    // Attack animation is handled by FSM
    // When attack completes, FSM will automatically transition
    // No additional logic needed here
  }

  // Consult BT for strategic behavior decision with context
  consultBTForBehavior(players, context = {}) {
    // Green log - enemy asking BT for decision
    const situationText = this.getSituationText(context);
    console.log(`%c[BT_QUERY] Blue Slime #${this.level}: "${situationText}"`, 'color: #00ff00; font-weight: bold; font-size: 14px;');

    console.log('[BLUE SLIME BT] consultBTForBehavior called with context:', context, 'aiContext:', !!this.aiContext, 'behaviorTree:', !!this.aiContext?.behaviorTree, 'tickEnemyAI:', !!window.tickEnemyAI);

    if (!this.aiContext || !this.aiContext.behaviorTree) {
      console.log('[BLUE SLIME BT] BT not available, using fallback');
      // BT not available - fallback decisions
      return this.fallbackBehaviorDecision(players, context);
    }

    // Add context to aiContext for BT decision making
    this.aiContext.consultationContext = context;

    //console.log('[BLUE SLIME BT] Consulting BT for decision with context...');
    //console.log('[BLUE SLIME BT] Context targets:', this.aiContext.targets);
    //console.log('[BLUE SLIME BT] Consultation context:', context);

    // Update boss phase if needed
    if (this.aiContext.rarity === "boss" && this.aiContext.bossPhaseManager) {
      this.aiContext.bossPhaseManager.update(this.aiContext);
    }

    // Tick BT for decision
    const command = window.tickEnemyAI(this.aiContext.behaviorTree, this.aiContext);
    console.log('[BLUE SLIME BT] BT returned command:', command);

    // Red log - BT decision
    const decisionText = this.getDecisionText(command, context);
    console.log(`%c[BT_DECISION] Blue Slime #${this.level} from ${situationText} → ${decisionText}`, 'color: #ff0000; font-weight: bold; font-size: 14px;');

    // Clear context after consultation
    delete this.aiContext.consultationContext;

    return command;
  }

  // Transition to new behavior based on BT command
  transitionToBehavior(command, behaviors) {
    if (!command) return;

    switch(command.type) {
      case 'idle':
        this.stateMachine.changeState('enemy_idle');
        this.vx = 0;
        // Set idle timer for custom duration if specified
        if (command.duration) {
          this.aiTimer = -command.duration; // Negative to count up to 0
        }
        break;

      case 'patrol':
        this.stateMachine.changeState('enemy_walking');
        // Reset patrol direction for new patrol cycle
        this.patrolDirection = 1; // Always start right for new patrols
        this.startX = this.x; // Reset patrol center
        // vx will be set in updateWalkingBehavior
        break;

      case 'reverse_patrol':
        // Stay in walking state but reverse direction
        this.stateMachine.changeState('enemy_walking');
        this.patrolDirection *= -1; // Reverse current direction
        // vx will be set in updateWalkingBehavior
        break;

      case 'chase':
        this.stateMachine.changeState('enemy_running');
        // vx will be set in updateRunningBehavior
        break;

      case 'attack':
        // Map attack type to enemy FSM action
        const attackNumber = command.attackType === 'light' ? '1' :
                            command.attackType === 'medium' ? '2' :
                            command.attackType === 'heavy' ? '3' : '1';
        this.stateMachine.handleAction(`attack_${attackNumber}`);
        this.vx = 0; // Stop moving during attack
        break;

      default:
        this.stateMachine.changeState('enemy_idle');
        this.vx = 0;
        break;
    }
  }

  // Fallback behavior decision when BT is not available
  fallbackBehaviorDecision(players, context = {}) {
    console.log('[BLUE SLIME FALLBACK] Making decision with context:', context);

    const closestPlayer = this.getClosestPlayer(players);

    // Context-aware fallback decisions
    switch(context.reason) {
      case 'screen_boundary':
        // Hit screen boundary - reverse direction
        return { type: 'reverse_patrol' };

      case 'entity_collision':
        // Hit entity - idle briefly then reverse
        return { type: 'idle', duration: 1.0 };

      case 'patrol_end':
        // Reached patrol end - reverse direction
        return { type: 'reverse_patrol' };

      case 'player_detected':
        // Player detected - chase if close enough
        if (closestPlayer && closestPlayer.distance <= 300) {
          return { type: 'chase' };
        }
        break;

      default:
        // Standard fallback logic
        if (closestPlayer && closestPlayer.distance <= 100) {
          return { type: 'attack', attackType: 'light' };
        } else if (closestPlayer && closestPlayer.distance <= 300) {
          return { type: 'chase' };
        } else {
          return { type: 'patrol' };
        }
    }

    // Default fallback
    return { type: 'patrol' };
  }

  // Helper: Get situation text for BT queries
  getSituationText(context = {}) {
    switch(context.reason) {
      case 'idle_timeout':
        return 'Свърших с idle, какво да правя?';
      case 'patrol_end':
        return 'Свърших с патрула, какво сега?';
      case 'screen_boundary':
        return 'Патрулът е прекъснат от граница, какво сега?';
      case 'entity_collision':
        return 'Блъснах се в обект, какво да правя?';
      case 'player_detected':
        return 'Засечен е играч, какво да правя?';
      case 'attack_range':
        return 'Играчът е в обсег за атака, какво сега?';
      case 'player_too_far':
        return 'Играчът е твърде далеч, какво сега?';
      case 'attack_complete':
        return 'Направих атаката, какво сега?';
      default:
        return 'Нуждая се от инструкции, какво да правя?';
    }
  }

  // Helper: Get decision text for BT responses
  getDecisionText(command, context) {
    if (!command) return 'няма решение';

    switch(command.type) {
      case 'idle':
        const duration = command.duration ? ` за ${command.duration} сек` : '';
        return `idle${duration}`;
      case 'patrol':
        return 'start_patrol';
      case 'reverse_patrol':
        return 'reverse_patrol';
      case 'chase':
        return 'chase_player';
      case 'attack':
        const attackType = command.attackType || 'light';
        return `attack_${attackType}`;
      default:
        return command.type || 'unknown';
    }
  }

  // Helper: Get closest player
  getClosestPlayer(players) {
    if (!players || players.length === 0) return null;

    return players.reduce((closest, player) => {
      // Use X-Z distance for 2.5D detection
      const distance = Math.sqrt(
        Math.pow(this.x - player.x, 2) +
        Math.pow(this.z - player.z, 2)
      );
      if (!closest || distance < closest.distance) {
        return { ...player, distance };
      }
      return closest;
    }, null);
  }

  // Update BT context with current game state
  updateBTContext(players) {
    if (!this.aiContext) return;

    // Update self state
    this.aiContext.self.hp = this.health;
    this.aiContext.self.maxHp = this.maxHealth;
    this.aiContext.self.x = this.x;
    this.aiContext.self.y = this.y;

    // Update targets (players) - Use X-Z distance for 2.5D detection
    this.aiContext.targets = players.map(player => ({
      distance: Math.sqrt(  // ✅ X-Z distance for 2.5D
        Math.pow(this.x - player.x, 2) +
        Math.pow(this.z - player.z, 2)
      ),
      hpPercent: (player.health / player.maxHealth) * 100,
      damageDone: 0 // Could track damage dealt to each player
    }));
  }

  // Execute BT command
  executeBTCommand(dt) {
    if (!this.currentBTCommand) return;

    const command = this.currentBTCommand;

    switch(command.type) {
      case 'idle':
        this.executeIdle();
        break;

      case 'patrol':
        this.executePatrol(dt);
        break;

      case 'chase':
        this.executeChase(this.aiContext.targets);
        break;

      case 'attack':
        this.executeAttack(command.attackType);
        break;

      default:
        this.executeIdle();
        break;
    }
  }

  // Execute idle behavior
  executeIdle() {
    this.vx = 0;
    this.vy = 0;
    if (this.stateMachine) {
      this.stateMachine.changeState('enemy_idle');
    }
  }

  // Execute patrol behavior
  executePatrol(dt) {
    const behaviors = this.aiContext.behaviors;
    const patrolSpeed = behaviors.patrol?.speed || 50;
    const patrolRadius = behaviors.patrol?.radiusX || 200;

    // Simple left-right patrol
    if (!this.patrolDirection) {
      this.patrolDirection = 1; // Start moving right
      this.startX = this.x; // Set patrol center
      console.log(`[BLUE SLIME PATROL] Initialized patrol at x=${this.startX}, direction=${this.patrolDirection}`);
    }

    // Check if reached patrol boundary
    if (Math.abs(this.x - this.startX) >= patrolRadius) {
      this.patrolDirection *= -1; // Reverse direction
      console.log(`[BLUE SLIME PATROL] Reversed direction at x=${this.x}, new direction=${this.patrolDirection}`);
    }

    this.vx = this.patrolDirection * patrolSpeed;
    console.log(`[BLUE SLIME PATROL] Set vx=${this.vx} (direction=${this.patrolDirection} * speed=${patrolSpeed})`);

    // Update animation
    if (this.stateMachine) {
      this.stateMachine.changeState('enemy_walking');
      console.log(`[BLUE SLIME PATROL] Changed animation to enemy_walking`);
    }
  }

  // Execute chase behavior
  executeChase(targets) {
    if (!targets || targets.length === 0) {
      this.executeIdle();
      return;
    }

    // Find closest target
    const closestTarget = targets.reduce((closest, target) =>
      target.distance < closest.distance ? target : closest
    );

    const behaviors = this.aiContext.behaviors;
    const chaseSpeed = behaviors.chase?.speed || 80;
    const direction = this.x < closestTarget.x ? 1 : -1;

    this.vx = direction * chaseSpeed;

    // Update animation
    if (this.stateMachine) {
      this.stateMachine.changeState('enemy_running');
    }
  }

  // Execute attack behavior
  executeAttack(attackType) {
    this.vx = 0; // Stop moving during attack

    if (this.stateMachine && !this.stateMachine.isInAttackState()) {
      // Map BT attack type to enemy FSM action (attack_1, attack_2, attack_3)
      const attackNumber = attackType === 'light' ? '1' :
                          attackType === 'medium' ? '2' :
                          attackType === 'heavy' ? '3' : '1';

      this.stateMachine.handleAction(`attack_${attackNumber}`);
    }
  }

  // Fallback AI for when BT is not available
  fallbackAI(players, dt) {
    // Use the old AI system as backup
    if (players.length > 0) {
      const player = players[0]; // Use first player for simplicity
      this.legacyAIUpdate(player, dt);
    }
  }

  // Legacy AI update (old system)
  legacyAIUpdate(player, dt) {
    const distanceToPlayer = Math.abs(this.x - player.x);
    const directionToPlayer = this.x < player.x ? 1 : -1;

    this.aiTimer += dt;

    switch (this.aiState) {
      case 'idle':
        if (this.aiTimer > 2.0) {
          this.aiState = 'patrol';
          this.aiTimer = 0;
        }
        if (distanceToPlayer < this.detectionRange) {
          this.aiState = 'chase';
          this.aiTimer = 0;
        }
        break;

      case 'patrol':
        this.vx = this.patrolDirection * this.speed * 0.5;
        if (Math.abs(this.x - this.startX) > this.patrolDistance) {
          this.patrolDirection *= -1;
          this.vx = 0;
          if (this.aiTimer > 0.5) this.aiTimer = 0;
        }
        if (distanceToPlayer < this.detectionRange) {
          this.aiState = 'chase';
          this.aiTimer = 0;
          this.vx = 0;
        }
        break;

      case 'chase':
        this.vx = directionToPlayer * this.speed;
        if (distanceToPlayer > this.detectionRange * 1.5) {
          this.aiState = 'patrol';
          this.aiTimer = 0;
          this.vx = 0;
        } else if (distanceToPlayer < this.attackRange) {
          this.aiState = 'attack';
          this.aiTimer = 0;
          this.vx = 0;
        }
        break;

      case 'attack':
        if (this.stateMachine && !this.stateMachine.isInAttackState()) {
          const attacks = ['attack_1', 'attack_2', 'attack_3'];
          const randomAttack = attacks[Math.floor(Math.random() * attacks.length)];
          this.stateMachine.handleAction(`attack_${randomAttack.split('_')[1]}`);
        }
        if (this.aiTimer > 1.5) {
          if (distanceToPlayer < this.attackRange) {
            this.aiTimer = 0;
          } else if (distanceToPlayer < this.detectionRange) {
            this.aiState = 'chase';
            this.aiTimer = 0;
          } else {
            this.aiState = 'patrol';
            this.aiTimer = 0;
          }
        }
        break;
    }
  }

  // Update animation to match BT command (not legacy AI state)
  updateAnimationFromAI() {
    if (!this.stateMachine) return;

    const currentState = this.stateMachine.getCurrentStateName();

    // Don't interrupt attacks or hurt/death animations
    if (currentState.includes('attack') || currentState === 'hurt' || currentState === 'dead') {
      return;
    }

    // Update animation based on current BT command
    if (this.currentBTCommand) {
      switch(this.currentBTCommand.type) {
        case 'idle':
          this.stateMachine.changeState('enemy_idle');
          break;
        case 'patrol':
          this.stateMachine.changeState('enemy_walking');
          break;
        case 'chase':
          this.stateMachine.changeState('enemy_running');
          break;
        case 'attack':
          // Attack animation is handled in executeAttack method
          break;
        default:
          this.stateMachine.changeState('enemy_idle');
          break;
      }
    } else {
      // Fallback if no BT command
      this.stateMachine.changeState('enemy_idle');
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
