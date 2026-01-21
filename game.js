// ===========================================
// GLOBAL DECLARATIONS - Available immediately when file loads
// ===========================================

// CHARACTER SELECTION SYSTEM MOVED TO ui.js (PHASE 1)
// let playerSelections = {}; // Temporary selections - MOVED TO ui.js
// let confirmedSelections = {}; // Confirmed/final selections - MOVED TO ui.js
// let activePlayers = new Set(); // Track which players have joined - MOVED TO ui.js
// let detectedPlayers = 1; // Keyboard always available - MOVED TO ui.js

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
// CHARACTER SELECTION SYSTEM MOVED TO ui.js (PHASE 1)
// window.activePlayers = activePlayers;     // MOVED TO ui.js
// window.playerSelections = playerSelections; // MOVED TO ui.js
// window.confirmedSelections = confirmedSelections; // MOVED TO ui.js

// Game logic and loop

// ===========================================
// CHARACTER SELECTION SYSTEM MOVED TO ui.js (PHASE 1)
// ===========================================
// All character selection functions and variables have been moved to ui.js
// with proper parameter passing to maintain functionality
//
// MOVED FUNCTIONS (now in ui.js):
// - updatePlayerDetection(detectedPlayersRef)
// - updatePlayerStatus(activePlayers, detectedPlayers)
// - joinPlayer(playerId, activePlayers, playerSelections, detectedPlayersRef)
// - removePlayer(playerId, activePlayers, playerSelections, confirmedSelections)
// - assignFirstAvailableCharacter(playerId, characters, playerSelections)
// - selectCharacter(playerId, direction, characters, playerSelections, confirmedSelections)
// - isCharacterTaken(charId, excludePlayerId, playerSelections)
// - confirmSelection(playerId, playerSelections, confirmedSelections)
// - updateSelectionUI(charId, playerSelections)
// - updateStartButton(activePlayers, confirmedSelections)
//
// MOVED VARIABLES (now in ui.js):
// - playerSelections
// - confirmedSelections
// - activePlayers
// - detectedPlayers
//
// CALL SITE UPDATES (in ui.js):
// - All window.functionName() calls updated to window.UISystem.functionName()
// - All calls now pass required parameters explicitly
// - State is passed via references and collections

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



// ===========================================
// COMBAT HELPER FUNCTIONS - MOVED TO combat_system.js (PHASE 2)
// ===========================================
// calculateHitBoxPosition(entity, animationSystem) - MOVED TO combat_system.js
// addDamageNumberToTarget(attacker, target, damage, isCritical, damageNumberManager) - MOVED TO combat_system.js

function updatePlayer(player, playerIndex, dt) {
  //console.log('[UPDATE_PLAYER] Called with player:', player, 'index:', playerIndex, 'type:', typeof player);

  // Safety check for undefined/null players
  if (!player || typeof player !== 'object') {
    //console.warn('[UPDATE_PLAYER] Invalid player, returning early');
    return;
  }

  //console.log('[UPDATE_PLAYER] Player properties - currentAction:', player.currentAction, 'controls:', !!player.controls);

  player.vx = 0;
  player.vz = 0;

  const inputMode = player.controls.inputMode || 'keyboard';

  // Движения и действия
  if (inputMode === 'keyboard') {
    handleKeyboardInput(player);
  } else if (inputMode === 'controller') {
    handleControllerInput(player, playerIndex);
  }

  // Физика и колизии
  window.handleMovement(player, dt, CANVAS_HEIGHT, GRAVITY, Z_MIN, Z_MAX);

  // Проверка за удар с врагове - FSM-based damage dealing
  if (player.stateMachine && player.stateMachine.isInAttackState() && !player.damageDealt) {
    //console.log(`[ATTACK] Player in attack state: ${player.stateMachine.getCurrentStateName()}, damage not yet dealt`);

    // Проверка за сблъсък с всички противници
    const enemies = window.gameState ? window.gameState.getEntitiesByType('enemy') : [window.enemy].filter(e => e);
    //console.log(`[ATTACK] Found ${enemies.length} enemies to check`);

    for (const enemy of enemies) {
      if (!enemy) continue;

      //console.log(`[ATTACK] Checking collision with enemy at (${enemy.x}, ${enemy.y})`);
      const hit = checkHitboxCollision(player, enemy, {
        zTolerance: 10
      });

      //console.log(`[ATTACK] Collision result: ${hit}`);

      if (hit) {
        // Use combat system to calculate and apply damage
        const currentAttackType = player.stateMachine.getCurrentAttackType();
        //console.log(`[ATTACK] Current attack type: ${currentAttackType}`);
        //console.log(`[ATTACK] Player health before attack: ${player.health}`);

        if (currentAttackType) {
          //console.log(`[ATTACK] Resolving attack with combat system...`);
          //console.log(`[ATTACK] Enemy health before attack: ${enemy.health}`);
          const combatEvent = window.combatResolver.resolveAttackNoResourceCheck(player, enemy, currentAttackType);
          //console.log(`[ATTACK] Combat event result:`, combatEvent);
          //console.log(`[ATTACK] Enemy health after attack: ${enemy.health}`);
          //console.log(`[ATTACK] Damage dealt: ${combatEvent?.actualDamage || 0}`);

          // Add damage number for visual feedback
          if (combatEvent && combatEvent.actualDamage > 0) {
            //console.log(`[ATTACK] Applying ${combatEvent.actualDamage} damage`);
            // Damage numbers appear centered above the target (enemy)
            window.addDamageNumberToTarget(player, enemy, combatEvent.actualDamage, combatEvent.damageResult.isCritical, window.damageNumberManager);
          } else {
            //console.log(`[ATTACK] No damage applied - combat event:`, combatEvent);
          }

          // Mark damage as dealt for this attack and set visual hit flag
          // Only set damageDealt if we actually applied damage
          if (combatEvent && combatEvent.actualDamage > 0) {
            player.damageDealt = true;
            enemy.hit = true;
            //console.log(`[ATTACK] Damage dealt (${combatEvent.actualDamage}), setting damageDealt flag`);
          } else {
            //console.log(`[ATTACK] No damage applied, keeping damageDealt false for potential retry`);
          }
          break; // Само един удар на атака
        } else {
          //console.log(`[ATTACK] No current attack type found`);
        }
      }
    }
  }

  // Enemy attacks using FSM system
  // Check if any enemy is attacking this player
  const enemyEntities = window.gameState ? window.gameState.getEntitiesByType('enemy') : [window.enemy].filter(e => e);

  // Count attacking enemies first to avoid spam
  const attackingEnemies = enemyEntities.filter(enemy =>
    enemy && enemy.stateMachine && enemy.stateMachine.isInAttackState() && !enemy.damageDealt
  );

  // Only log if there are actively attacking enemies
  // if (attackingEnemies.length > 0) {
  //   console.log(`[ENEMY_ATTACK_DEBUG] ${attackingEnemies.length} enemies actively attacking player`);

  for (const enemy of attackingEnemies) {
    // console.log(`[ENEMY_ATTACK_DEBUG] Enemy ${enemy?.id || 'unknown'}:`);
    // console.log(`  - currentState: ${enemy?.stateMachine?.getCurrentStateName() || 'none'}`);
    // console.log(`  - isInAttackState: ${enemy?.stateMachine?.isInAttackState() || false}`);
    // console.log(`  - damageDealt: ${enemy?.damageDealt || false}`);
    // console.log(`  - animation.currentFrame: ${enemy?.animation?.currentFrame || 'no animation'}`);
    // console.log(`  - animation.type: ${enemy?.animation?.currentAnimation || 'no animation'}`);

    // console.log(`[ENEMY_ATTACK_DEBUG] Enemy ${enemy.id} checking collision...`);
    // console.log(`[ENEMY_ATTACK_DEBUG] damageDealt before collision check: ${enemy.damageDealt}`);

    // Check collision for enemy attack
    const hit = checkHitboxCollision(enemy, player, {
      zTolerance: 10
    });

    //console.log(`[ENEMY_ATTACK_DEBUG] Collision result: ${hit}`);

    // Debug attack box position
    if (enemy.animation && enemy.animation.animationDefinition) {
      const currentFrame = enemy.animation.currentFrame;
      const frameData = enemy.animation.animationDefinition.frameData?.[currentFrame];
      // console.log(`[ENEMY_ATTACK_DEBUG] Frame data:`, {
      //   frame: currentFrame,
      //   hasAttackBox: !!frameData?.attackBox,
      //   attackBox: frameData?.attackBox
      // });
    }

    if (hit) {
      //console.log(`[ENEMY_ATTACK_DEBUG] HIT DETECTED! Getting attack type...`);
      // Use combat system to calculate and apply damage
      const enemyAttackType = enemy.stateMachine.getCurrentAttackType();
      //console.log(`[ENEMY_ATTACK_DEBUG] Attack type: ${enemyAttackType}`);

      if (enemyAttackType) {
        //console.log(`[ENEMY_ATTACK_DEBUG] Resolving attack with combat system...`);

        // Map enemy animation attack types to combat skill types
        let combatSkillType;
        switch (enemyAttackType) {
          case 'ATTACK_1':
            combatSkillType = 'basic_attack_light'; // Use player's basic attack for damage calculation
            break;
          case 'ATTACK_2':
            combatSkillType = 'secondary_attack_light';
            break;
          case 'ATTACK_3':
          case 'RUN_ATTACK':
            combatSkillType = 'basic_attack_medium';
            break;
          default:
            combatSkillType = 'basic_attack_light'; // Default fallback
        }

        //console.log(`[ENEMY_ATTACK_DEBUG] Mapped ${enemyAttackType} to combat skill: ${combatSkillType}`);
        const combatEvent = window.combatResolver.resolveAttackNoResourceCheck(enemy, player, combatSkillType);
        //console.log(`[ENEMY_ATTACK_DEBUG] Combat event:`, combatEvent);

        // Add damage number for visual feedback
        if (combatEvent && combatEvent.actualDamage > 0) {
          // Damage numbers appear centered above the target (player)
          window.addDamageNumberToTarget(enemy, player, combatEvent.actualDamage, combatEvent.damageResult.isCritical, window.damageNumberManager);
        }

        // Set damageDealt flag to prevent multiple damage per attack (unified with player system)
        if (combatEvent && combatEvent.actualDamage > 0) {
          enemy.damageDealt = true;
          //console.log(`[ENEMY_ATTACK_DEBUG] Damage applied (${combatEvent.actualDamage}), set damageDealt=true`);
        } else {
          //console.log(`[ENEMY_ATTACK_DEBUG] No damage applied, keeping damageDealt=false`);
        }

        // Set visual hit flag for player
        player.hit = true;
        //console.log(`[ENEMY_ATTACK_DEBUG] Player hit flag set to true`);
        break; // Only one enemy attack per player per frame
      } else {
        //console.log(`[ENEMY_ATTACK_DEBUG] No attack type found, skipping damage`);
      }
    } else {
      //console.log(`[ENEMY_ATTACK_DEBUG] No collision detected, enemy attack missed`);
    }
  }
}


// Обработка на клавиатурен вход
function handleKeyboardInput(player) {
  const controls = getCurrentControls(player);

  // Движения
  if (window.keys[controls.left]) {
    player.vx = -SPEED;
  }
  if (window.keys[controls.right]) {
    player.vx = SPEED;
  }
  if (window.keys[controls.up]) {
    player.vz = Z_SPEED;
  }
  if (window.keys[controls.down]) {
    player.vz = -Z_SPEED;
  }

  // Скок - FSM-based
  if (window.keys[controls.jump] && player.onGround && player.stateMachine) {
    logAction(0, 'клавиатура', controls.jump.toUpperCase(), 'jump');
    player.vy = JUMP_FORCE;
    player.onGround = false;
    player.stateMachine.handleAction('jump');
  }

  // Основни атаки - FSM-based
  if (window.keys[controls.basicAttackLight] && player.stateMachine && !player.stateMachine.isInAttackState()) {
    logAction(0, 'клавиатура', controls.basicAttackLight.toUpperCase(), 'attack_light');
    player.stateMachine.handleAction('attack_light');
  }
  if (window.keys[controls.basicAttackMedium] && player.stateMachine && !player.stateMachine.isInAttackState()) {
    // Check if player can perform skill (resources, etc.) - centralized in combat_system.js
    if (window.combatResolver.canPlayerPerformSkill(player, 'basic_attack_medium')) {
      logAction(0, 'клавиатура', controls.basicAttackMedium.toUpperCase(), 'attack_medium');
      player.stateMachine.handleAction('attack_medium');
    } else {
      // TODO: Show "not enough mana" feedback to player
    }
  }
  // if (window.keys[controls.basicAttackHeavy] && player.stateMachine && !player.stateMachine.isInAttackState()) {
  //   logAction(0, 'клавиатура', controls.basicAttackHeavy.toUpperCase(), 'attack_heavy');
  //   player.stateMachine.handleAction('attack_heavy');
  // }

  // Допълнителни атаки - FSM-based (when implemented)
  // For now, secondary attacks use the same as primary
  if (window.keys[controls.secondaryAttackLight] && player.stateMachine && !player.stateMachine.isInAttackState()) {
    logAction(0, 'клавиатура', controls.secondaryAttackLight.toUpperCase(), 'attack_light');
    player.stateMachine.handleAction('attack_light');
  }
  // if (window.keys[controls.secondaryAttackMedium] && player.stateMachine && !player.stateMachine.isInAttackState()) {
  //   logAction(0, 'клавиатура', controls.secondaryAttackMedium.toUpperCase(), 'attack_medium');
  //   player.stateMachine.handleAction('secondary_attack_medium');
  // }
  // if (window.keys[controls.secondaryAttackHeavy] && player.stateMachine && !player.stateMachine.isInAttackState()) {
  //   logAction(0, 'клавиатура', controls.secondaryAttackHeavy.toUpperCase(), 'attack_heavy');
  //   player.stateMachine.handleAction('secondary_attack_heavy');
  // }
}

// MOVED TO update() function below






// Обработка на контролерен вход
function handleControllerInput(player, playerIndex) {
  const gamepads = navigator.getGamepads();
  const gamepad = gamepads[playerIndex];
  const controls = getCurrentControls(player);

  if (gamepad) {
    // Движения
    if (Math.abs(gamepad.axes[0]) > 0.1) {
      player.vx = gamepad.axes[0] * SPEED;
    }
    if (Math.abs(gamepad.axes[1]) > 0.1) {
      player.vz = -gamepad.axes[1] * Z_SPEED;
    }

    // D-pad движения
    if (gamepad.buttons[12].pressed) {
      logAction(playerIndex, 'контролер', 'D-pad ↑', 'движение нагоре');
      player.vz = Z_SPEED;
    }
    if (gamepad.buttons[13].pressed) {
      logAction(playerIndex, 'контролер', 'D-pad ↓', 'движение надолу');
      player.vz = -Z_SPEED;
    }
    if (gamepad.buttons[14].pressed) {
      logAction(playerIndex, 'контролер', 'D-pad ←', 'движение наляво');
      player.vx = -SPEED;
    }
    if (gamepad.buttons[15].pressed) {
      logAction(playerIndex, 'контролер', 'D-pad →', 'движение надясно');
      player.vx = SPEED;
    }

    // Скок - FSM-based
    if (isButtonPressed(gamepad, controls.jump) && player.onGround && player.stateMachine) {
      //console.log(`[JUMP] Jump started - player on ground, triggering FSM jump`);
      const buttonName = getButtonName(controls.jump);
      logAction(playerIndex, 'контролер', buttonName, 'jump');
      player.vy = JUMP_FORCE;
      player.onGround = false;
      player.stateMachine.handleAction('jump');
    }

    // Основни атаки - FSM-based
    if (isButtonPressed(gamepad, controls.basicAttackLight) && player.stateMachine && !player.stateMachine.isInAttackState()) {
      const buttonName = getButtonName(controls.basicAttackLight);
      logAction(playerIndex, 'контролер', buttonName, 'attack_light');
      player.stateMachine.handleAction('attack_light');
    }
    if (isButtonPressed(gamepad, controls.basicAttackMedium) && player.stateMachine && !player.stateMachine.isInAttackState()) {
      const buttonName = getButtonName(controls.basicAttackMedium);
      logAction(playerIndex, 'контролер', buttonName, 'attack_medium');
      player.stateMachine.handleAction('attack_medium');
    }
    if (isButtonPressed(gamepad, controls.basicAttackHeavy) && player.stateMachine && !player.stateMachine.isInAttackState()) {
      const buttonName = getButtonName(controls.basicAttackHeavy);
      logAction(playerIndex, 'контролер', buttonName, 'attack_heavy');
      player.stateMachine.handleAction('attack_heavy');
    }

    // Допълнителни атаки - FSM-based (for now use same as primary)
    if (isButtonPressed(gamepad, controls.secondaryAttackLight) && player.stateMachine && !player.stateMachine.isInAttackState()) {
      const buttonName = getButtonName(controls.secondaryAttackLight);
      logAction(playerIndex, 'контролер', buttonName, 'attack_light');
      player.stateMachine.handleAction('attack_light');
    }
    if (isButtonPressed(gamepad, controls.secondaryAttackMedium) && player.stateMachine && !player.stateMachine.isInAttackState()) {
      const buttonName = getButtonName(controls.secondaryAttackMedium);
      logAction(playerIndex, 'контролер', buttonName, 'attack_medium');
      player.stateMachine.handleAction('attack_medium');
    }
    if (isButtonPressed(gamepad, controls.secondaryAttackHeavy) && player.stateMachine && !player.stateMachine.isInAttackState()) {
      const buttonName = getButtonName(controls.secondaryAttackHeavy);
      logAction(playerIndex, 'контролер', buttonName, 'attack_heavy');
      player.stateMachine.handleAction('attack_heavy');
    }
  }
}



// FSM handles all action types now - removed isAttackAction function

// Помощна функция за автоматично превключване между клавиатура и контролер
function getCurrentControls(player) {
  //return player.controls[player.controls.inputMode];

  const mode = player.controls.inputMode || 'keyboard';
  let controls = player.controls[mode];

  // Ако контролер controls липсват, създай default
  if (mode === 'controller' && !controls) {
    //console.log('Creating default controller controls');
    controls = {
      // Движения (D-pad)
      left: 14,   // D-pad Left
      right: 15,  // D-pad Right
      up: 12,     // D-pad Up
      down: 13,   // D-pad Down
      jump: 7,    // R2 бутон

      // Основни атаки
      basicAttackLight: 2,        // □ Square бутон - лека основна атака
      basicAttackMedium: 3,       // ◯ Circle бутон - средна основна атака
      basicAttackHeavy: 4,        // △ Triangle бутон - тежка основна атака

      // Допълнителни атаки
      secondaryAttackLight: 0,    // X Cross бутон - лека допълнителна атака
      secondaryAttackMedium: 1,   // L1 бутон - средна допълнителна атака
      secondaryAttackHeavy: 5     // R1 бутон - тежка допълнителна атака
    };
    player.controls.controller = controls;
  }
  return controls;
}

// Debug помощни функции
function logAction(playerIndex, inputDevice, button, actionType) {
  const playerNum = playerIndex + 1;
  const actionName = getActionDisplayName(actionType);
  //console.log(`🎮 Играч ${playerNum}, ${inputDevice}, бутон "${button}", действие ${actionName}`);
}

function getActionDisplayName(actionType) {
  const names = {
    [window.SKILL_TYPES?.JUMP]: 'скок',
    [window.SKILL_TYPES?.BASIC_ATTACK_LIGHT]: 'основна лека атака',
    [window.SKILL_TYPES?.BASIC_ATTACK_MEDIUM]: 'основна средна атака',
    [window.SKILL_TYPES?.BASIC_ATTACK_HEAVY]: 'основна тежка атака',
    [window.SKILL_TYPES?.SECONDARY_ATTACK_LIGHT]: 'допълнителна лека атака',
    [window.SKILL_TYPES?.SECONDARY_ATTACK_MEDIUM]: 'допълнителна средна атака',
    [window.SKILL_TYPES?.SECONDARY_ATTACK_HEAVY]: 'допълнителна тежка атака'
  };
  return names[actionType] || actionType;
}

function isButtonPressed(gamepad, buttonIndex, threshold = 0.5) {
  const button = gamepad.buttons[buttonIndex];

  if (!button) {
    //console.log(`Button ${buttonIndex} not found`);
    return false;
  }

  if (button.pressed !== undefined && button.pressed) {
    return true;
  }

  if (button.value !== undefined && button.value > threshold) {
    return true;
  }

  return false;
}


function getButtonName(buttonIndex) {
  const buttonNames = {
    0: 'X', 1: '◯', 2: '□', 3: '△',
    4: 'L1', 5: 'R1', 6: 'L2', 7: 'R2',
    8: 'Share', 9: 'Options',
    12: 'D-pad ↑', 13: 'D-pad ↓', 14: 'D-pad ←', 15: 'D-pad →'
  };
  return buttonNames[buttonIndex] || `Button ${buttonIndex}`;
}



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
        updatePlayer(player, index, dt);

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
          enemy.updateDeath(dt);
        }
      });
    } else {
      // Fallback към старата система за backwards compatibility
      players.forEach((player, index) => {
        updatePlayer(player, index, dt);
      });
      // Fallback enemy update - use legacy enemy if available
      if (window.enemy && !window.enemy.isDying) {
        window.enemy.handleMovement(dt, CANVAS_HEIGHT, GRAVITY);
        window.enemy.updateEnemyAI(dt, window.players || [], null);
      }
    }
  }
}

// ===========================================
// PHASE 6: COORDINATION FUNCTIONS MOVED TO base_enemy.js
// ===========================================
// updateEnemyAI() - MOVED TO BaseEnemy.updateEnemyAI() instance method
// handleEnemyMovement() - MOVED TO BaseEnemy.handleMovement() instance method
// checkIfEntityIsInCollision() - MOVED TO BaseEnemy.checkIfInCollision() instance method

// ===========================================
// PHASE 6: COORDINATION FUNCTIONS MOVED TO base_enemy.js
// ===========================================
// updateEnemyAI() - MOVED TO BaseEnemy.updateEnemyAI() instance method
// handleEnemyMovement() - MOVED TO BaseEnemy.handleMovement() instance method
// checkIfEntityIsInCollision() - MOVED TO BaseEnemy.checkIfInCollision() instance method

// Game loop
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

// ===========================================
// PHASE 6: COORDINATION FUNCTIONS MOVED TO base_enemy.js
// ===========================================
// checkIfEntityIsInCollision() - MOVED TO BaseEnemy.checkIfInCollision() instance method


// ===========================================
// ENTITY SORTING LOGIC - moved from render.js
// ===========================================

// Get sorted entities for rendering (game logic that was in render.js)
function getSortedEntitiesForRendering() {
  // Get all entities from game state or fallback to legacy system
  const entities = window.gameState ? window.gameState.getAllEntities() :
    [...players, window.enemy, window.ally].filter(e => e !== null && e !== undefined);

  // Debug logging for backwards compatibility
  if (!window.gameState && window.enemy && window.enemy.isDying) {
    console.log('[RENDER] Enemy dying status (legacy):', {
      enemyExists: window.enemy !== null,
      isDying: window.enemy.isDying,
      deathTimer: window.enemy.deathTimer,
      defeatHandled: window.enemy.defeatHandled,
      visible: window.enemy.visible,
      entitiesCount: entities.length,
      enemyInEntities: entities.includes(window.enemy)
    });
  }

  // Sort entities by Z-order (effective Y position) for proper rendering
  return entities.sort((a, b) => (a.y - a.z) - (b.y - b.z));
}

// ===========================================
// ENEMY STATUS LOGIC - moved from render.js
// ===========================================

// Get enemy health status and color (game logic that was in render.js)
function getEnemyHealthStatus(entity) {
  if (!entity.enemyData) return null;

  const healthPercent = entity.maxHealth > 0 ? (entity.health / entity.maxHealth) * 100 : 0;
  const healthStatus = entity.health <= 0 ? '[Мъртъв]' :
    healthPercent > 60 ? '[Жив]' :
      healthPercent > 30 ? '[Ранен]' : '[Критично]';

  // Color based on health
  const healthColor = entity.health <= 0 ? '#FF0000' :  // Dead - red
    healthPercent > 60 ? '#00FF00' :   // Healthy - green
      healthPercent > 30 ? '#FFFF00' :   // Wounded - yellow
        '#FF8800'; // Critical - orange

  return { healthStatus, healthColor, healthPercent };
}



// ===========================================
// PHASE 5: GAME SETUP - MOVED TO main.js
// ===========================================
// initGameWithSelections() function has been moved to main.js
// with new parameter-based signature for better separation of concerns



// CHARACTER SELECTION SYSTEM EXPORTS MOVED TO ui.js (PHASE 1)
// All exports now available through window.UISystem







// ===========================================
// ENEMY DEFEAT FUNCTIONS MOVED FROM combat_system.js
// ===========================================

// Handle enemy defeat
function handleEnemyDefeat(attacker, defeatedEnemy) {
  console.log(`[COMBAT] handleEnemyDefeat called with attacker:`, attacker, `defeatedEnemy:`, defeatedEnemy);

  console.log(`[COMBAT] Enemy defeated! ${attacker ? `Awarding experience to ${attacker.characterInfo?.getDisplayName() || 'Player'}` : 'Experience already awarded'}`);

  // Award experience to the attacker (only if attacker is provided)
  if (attacker && attacker.characterInfo) {
    const experienceReward = 200; // 200 XP for enemy defeat
    attacker.characterInfo.addExperience(experienceReward, attacker);
    console.log(`[COMBAT] ${attacker.characterInfo.getDisplayName()} gained ${experienceReward} experience!`);
  }

  // Update level manager completion status
  if (window.levelManager) {
    window.levelManager.completionStatus.defeatedEnemies = (window.levelManager.completionStatus.defeatedEnemies || 0) + 1;
    console.log(`[COMPLETION] Enemy defeated! Total defeated: ${window.levelManager.completionStatus.defeatedEnemies}`);
  }

  // Remove enemy from the game world via game state
  removeEnemyFromGame(defeatedEnemy);

  // Trigger any post-defeat effects
  onEnemyDefeated(attacker, defeatedEnemy);
}

// Remove enemy from the game
function removeEnemyFromGame(defeatedEnemy) {
  console.log(`[COMBAT] Removing enemy from game world...`);

  // Remove from game state if available
  if (window.gameState) {
    const entityId = window.gameState.getEntityId(defeatedEnemy);
    if (entityId) {
      window.gameState.removeEntity(entityId);
      console.log(`[COMBAT] Enemy removed from game state (ID: ${entityId})`);
    }
  } else {
    // Fallback for backwards compatibility
    if (window.enemy === defeatedEnemy) {
      console.log(`[COMBAT] Setting window.enemy to null (legacy mode)`);
      window.enemy = null;
    }
  }

  console.log(`[COMBAT] Enemy removal complete`);
}

// Post-defeat effects and events
function onEnemyDefeated(attacker, defeatedEnemy) {
  // Future: trigger quest updates, loot drops, achievements, etc.
  console.log(`[COMBAT] Enemy defeat processing complete`);

  // LEGACY RESPAWN SYSTEM - COMMENTED OUT
  // Now level system handles respawning through triggers
  /*
  // For now, trigger respawn after a short delay
  setTimeout(() => {
    respawnEnemy();
  }, 2000); // 2 second delay before respawn
  */
}

// Respawn enemy (for testing purposes)
function respawnEnemy() {
  console.log(`[COMBAT] Checking respawn conditions...`);

  // Check if we need to respawn (no enemies in game state or window.enemy is null)
  const shouldRespawn = window.gameState ?
    window.gameState.getEntitiesByType('enemy').length === 0 :
    window.enemy === null;

  if (shouldRespawn) {
    console.log(`[COMBAT] Respawning enemy...`);

    // Create new enemy
    const newEnemy = window.createEnemyWithData('basic', 1);

    // Register enemy with animation system (same as in main.js)
    if (window.animationSystem && window.animationSystem.isInitialized) {
      const enemyAnimation = window.animationSystem.registerEntity(newEnemy, 'enemy');
      console.log(`[COMBAT RESPAWN] Enemy registered with animation system:`, enemyAnimation ? 'SUCCESS' : 'FAILED');

      // Initialize FSM after animation is registered
      if (window.AnimationStateMachine) {
        newEnemy.stateMachine = new window.AnimationStateMachine(newEnemy);
        console.log(`[COMBAT RESPAWN] Enemy FSM initialized:`, newEnemy.stateMachine.getCurrentStateName());
      }
    } else {
      console.warn(`[COMBAT RESPAWN] Animation system not ready for respawned enemy`);
    }

    // Register with enemy combat manager
    if (window.enemyCombatManager) {
      window.enemyCombatManager.registerEnemy(newEnemy);
      console.log(`[COMBAT RESPAWN] Enemy registered with combat manager`);
    }

    // Add to game state if available
    if (window.gameState) {
      window.gameState.addEntity(newEnemy, 'enemy');
      console.log(`[COMBAT] Enemy respawned and added to game state with ${newEnemy.health}/${newEnemy.maxHealth} HP (ID: ${newEnemy.id})`);
    } else {
      // Fallback for backwards compatibility
      window.enemy = newEnemy;
      console.log(`[COMBAT] Enemy respawned with ${window.enemy.health}/${window.enemy.maxHealth} HP (legacy mode)`);
    }
  } else {
    console.log(`[COMBAT] Respawn not needed - enemies still present`);
  }
}
