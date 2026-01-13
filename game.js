// ===========================================
// GLOBAL DECLARATIONS - Available immediately when file loads
// ===========================================
let playerSelections = {}; // Temporary selections
let confirmedSelections = {}; // Confirmed/final selections
let activePlayers = new Set(); // Track which players have joined
let detectedPlayers = 1; // Keyboard always available

// Separate game state string from GameState instance
window.gameStateString = 'start'; // 'start', 'playing'

// Character definitions - declared globally for UI access
const characters = [
  { id: 'blue', name: 'Син герой', color: '#3AA0FF', position: 0 },
  { id: 'orange', name: 'Оранжев герой', color: '#FFA500', position: 30 },
  { id: 'green', name: 'Зелен герой', color: '#00FF00', position: 60 },
  { id: 'red', name: 'Червен герой', color: '#FF0000', position: 90 }
];

// Make globally available immediately
window.characters = characters;
window.activePlayers = activePlayers;
window.playerSelections = playerSelections;
window.confirmedSelections = confirmedSelections;

// Game logic and loop

function updatePlayerDetection() {
  const gamepads = navigator.getGamepads();
  let controllerCount = 0;
  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) controllerCount++;
  }
  detectedPlayers = 1 + controllerCount; // Keyboard + controllers

  // Update status with joined players info
  updatePlayerStatus();
}

function updatePlayerStatus() {
  const statusEl = document.getElementById('playerStatus');
  const joinedPlayers = Array.from(activePlayers).sort();

  if (joinedPlayers.length === 0) {
    // No players joined yet - show join instructions
    statusEl.textContent = 'Press 1-4 to join as Player X';
  } else {
    // Show joined players and device detection
    const joinedText = `Players joined: ${joinedPlayers.join(', ')}`;
    const deviceText = detectedPlayers > 1 ? ` | ${detectedPlayers} devices detected` : '';
    statusEl.textContent = joinedText + deviceText;
  }
}

function joinPlayer(playerId) {
  console.log(`[DEBUG] joinPlayer(${playerId}) called`);
  if (!activePlayers.has(playerId)) {
    console.log(`[DEBUG] Adding player ${playerId} to activePlayers`);
    activePlayers.add(playerId);
    console.log(`Player ${playerId} joined!`);

    // Auto-assign first available character
    assignFirstAvailableCharacter(playerId);

    // Auto-confirm for Players 3 & 4 (console testing only)
    if (playerId >= 3) {
      confirmSelection(playerId);
    }

    updatePlayerStatus();

    // Reset start button state - new player needs to confirm selection
    updateStartButton();
  } else {
    console.log(`[DEBUG] Player ${playerId} already active`);
  }
}

function removePlayer(playerId) {
  if (activePlayers.has(playerId)) {
    activePlayers.delete(playerId);

    // Clean up selections for this player
    for (let charId in playerSelections) {
      if (playerSelections[charId] === playerId) {
        delete playerSelections[charId];
        updateSelectionUI(charId);
      }
    }

    for (let charId in confirmedSelections) {
      if (confirmedSelections[charId] === playerId) {
        delete confirmedSelections[charId];
        updateSelectionUI(charId);
      }
    }

    updatePlayerStatus();
    updateStartButton();

    console.log(`Player ${playerId} removed!`);
  }
}

function assignFirstAvailableCharacter(playerId) {
  // Find first available character (not taken by any player)
  for (let i = 0; i < window.characters.length; i++) {
    const char = window.characters[i];
    if (!isCharacterTaken(char.id, null)) { // null = check if taken by anyone
      playerSelections[char.id] = playerId;
      updateSelectionUI(char.id);
      console.log(`Player ${playerId} auto-assigned to ${char.name}`);
      break;
    }
  }
}

function selectCharacter(playerId, direction) {
  // Find current selection for this player
  let currentIndex = -1;
  for (let charId in playerSelections) {
    if (playerSelections[charId] === playerId) {
      currentIndex = window.characters.findIndex(c => c.id === charId);
      break;
    }
  }

  // Calculate new index (skip taken characters)
  let attempts = 0;
  let newIndex = currentIndex;

  do {
    if (direction === 'next') {
      newIndex = (newIndex + 1) % window.characters.length;
    } else if (direction === 'previous') {
      newIndex = newIndex <= 0 ? window.characters.length - 1 : newIndex - 1;
    }
    attempts++;
  } while (isCharacterTaken(window.characters[newIndex].id, playerId) && attempts < window.characters.length);

  // If we couldn't find an available character, don't change selection
  if (isCharacterTaken(window.characters[newIndex].id, playerId)) {
    return;
  }

  // Clear previous selection and confirmed selection for this player
  for (let charId in playerSelections) {
    if (playerSelections[charId] === playerId) {
      delete playerSelections[charId];
      updateSelectionUI(charId);
    }
  }

  // Remove any confirmed selections for this player (they must reconfirm)
  for (let charId in confirmedSelections) {
    if (confirmedSelections[charId] === playerId) {
      delete confirmedSelections[charId];
      // Update UI for the old confirmed character
      updateSelectionUI(charId);
      console.log(`Player ${playerId} changed selection, removed confirmed choice`);
      break; // Should only have one confirmed selection per player
    }
  }

  // Set new selection (temporarily highlight)
  const newChar = window.characters[newIndex];
  playerSelections[newChar.id] = playerId;
  updateSelectionUI(newChar.id);

  // Update start button since confirmed selections may have changed
  updateStartButton();
}

function isCharacterTaken(charId, excludePlayerId) {
  // Check if character is selected by another player
  for (let selectedCharId in playerSelections) {
    if (selectedCharId === charId && playerSelections[selectedCharId] !== excludePlayerId) {
      return true;
    }
  }
  return false;
}

function confirmSelection(playerId) {
  // Find if player has a selection
  let selectedChar = null;
  for (let charId in playerSelections) {
    if (playerSelections[charId] === playerId) {
      selectedChar = charId;
      break;
    }
  }

  if (selectedChar) {
    // Move from temporary to confirmed selections
    confirmedSelections[selectedChar] = playerId;

    // Mark as confirmed (permanent)
    const indicator = document.getElementById(`selection-${selectedChar}`);
    if (indicator) {
      indicator.textContent = `Player ${playerId}`;
      indicator.classList.add('confirmed');
    }

    console.log(`Player ${playerId} confirmed selection of ${window.characters.find(c => c.id === selectedChar).name}`);

    // Check if we can start the game
    updateStartButton();
  }
}

function updateSelectionUI(charId) {
  const indicator = document.getElementById(`selection-${charId}`);
  if (indicator) {
    const playerId = playerSelections[charId];
    if (playerId) {
      indicator.textContent = `P${playerId}`;
      indicator.classList.remove('confirmed');
    } else {
      indicator.textContent = '';
    }
  }
}

function updateStartButton() {
  const startBtn = document.getElementById('startGameBtn');

  // Check if all joined players have confirmed their selections
  const joinedPlayers = Array.from(activePlayers);
  const allConfirmed = joinedPlayers.every(playerId => {
    // Check if this player has a confirmed selection
    return Object.values(confirmedSelections).includes(playerId);
  });

  const hasSelections = Object.keys(confirmedSelections).length > 0;

  if (joinedPlayers.length === 1) {
    // Single player - just needs any selection
    startBtn.disabled = !hasSelections;
    startBtn.textContent = hasSelections ? 'Start Game' : 'Select Character First';
  } else {
    // Multiple players - all must confirm
    startBtn.disabled = !allConfirmed;
    startBtn.textContent = allConfirmed ? 'Start Game' : 'All Players Must Confirm Selection';
  }
}

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

// Global variables for skill tree timing
let lastSkillTreeToggleTime = 0; // Timestamp to prevent rapid toggling

function updatePlayer(player, playerIndex, dt) {
  //console.log('[UPDATE_PLAYER] Called with player:', player, 'index:', playerIndex, 'type:', typeof player);

  // Safety check for undefined/null players
  if (!player || typeof player !== 'object') {
    console.warn('[UPDATE_PLAYER] Invalid player, returning early');
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
  handleMovement(player, dt);

  // Проверка за удар с врагове - FSM-based damage dealing
  if (player.stateMachine && player.stateMachine.isInAttackState() && !player.damageDealt) {
    console.log(`[ATTACK] Player in attack state: ${player.stateMachine.getCurrentStateName()}, damage not yet dealt`);

    // Проверка за сблъсък с всички противници
    const enemies = window.gameState ? window.gameState.getEntitiesByType('enemy') : [window.enemy].filter(e => e);
    console.log(`[ATTACK] Found ${enemies.length} enemies to check`);

    for (const enemy of enemies) {
      if (!enemy) continue;

      console.log(`[ATTACK] Checking collision with enemy at (${enemy.x}, ${enemy.y})`);
      const hit = checkHitboxCollision(player, enemy, {
        zTolerance: 10
      });

      console.log(`[ATTACK] Collision result: ${hit}`);

      if (hit) {
        // Use combat system to calculate and apply damage
        const currentAttackType = player.stateMachine.getCurrentAttackType();
        console.log(`[ATTACK] Current attack type: ${currentAttackType}`);
        console.log(`[ATTACK] Player health before attack: ${player.health}`);

        if (currentAttackType) {
          console.log(`[ATTACK] Resolving attack with combat system...`);
          console.log(`[ATTACK] Enemy health before attack: ${enemy.health}`);
          const combatEvent = window.combatResolver.resolveAttackNoResourceCheck(player, enemy, currentAttackType);
          console.log(`[ATTACK] Combat event result:`, combatEvent);
          console.log(`[ATTACK] Enemy health after attack: ${enemy.health}`);
          console.log(`[ATTACK] Damage dealt: ${combatEvent?.actualDamage || 0}`);

          // Add damage number for visual feedback
          if (combatEvent && combatEvent.actualDamage > 0) {
            console.log(`[ATTACK] Applying ${combatEvent.actualDamage} damage`);
            const damageX = enemy.x + enemy.w + 5;
            const damageY = enemy.y - enemy.h - 15;
            window.damageNumberManager.addDamageNumber(damageX, damageY, combatEvent.actualDamage, combatEvent.damageResult.isCritical);
          } else {
            console.log(`[ATTACK] No damage applied - combat event:`, combatEvent);
          }

          // Mark damage as dealt for this attack and set visual hit flag
          // Only set damageDealt if we actually applied damage
          if (combatEvent && combatEvent.actualDamage > 0) {
            player.damageDealt = true;
            enemy.hit = true;
            console.log(`[ATTACK] Damage dealt (${combatEvent.actualDamage}), setting damageDealt flag`);
          } else {
            console.log(`[ATTACK] No damage applied, keeping damageDealt false for potential retry`);
          }
          break; // Само един удар на атака
        } else {
          console.log(`[ATTACK] No current attack type found`);
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
  if (attackingEnemies.length > 0) {
    console.log(`[ENEMY_ATTACK_DEBUG] ${attackingEnemies.length} enemies actively attacking player`);

    for (const enemy of attackingEnemies) {
      console.log(`[ENEMY_ATTACK_DEBUG] Enemy ${enemy?.id || 'unknown'}:`);
      console.log(`  - currentState: ${enemy?.stateMachine?.getCurrentStateName() || 'none'}`);
      console.log(`  - isInAttackState: ${enemy?.stateMachine?.isInAttackState() || false}`);
      console.log(`  - damageDealt: ${enemy?.damageDealt || false}`);
      console.log(`  - animation.currentFrame: ${enemy?.animation?.currentFrame || 'no animation'}`);
      console.log(`  - animation.type: ${enemy?.animation?.currentAnimation || 'no animation'}`);

      console.log(`[ENEMY_ATTACK_DEBUG] Enemy ${enemy.id} checking collision...`);
      console.log(`[ENEMY_ATTACK_DEBUG] damageDealt before collision check: ${enemy.damageDealt}`);

    // Check collision for enemy attack
    const hit = checkHitboxCollision(enemy, player, {
      zTolerance: 10
    });

    console.log(`[ENEMY_ATTACK_DEBUG] Collision result: ${hit}`);

    // Debug attack box position
    if (enemy.animation && enemy.animation.animationDefinition) {
      const currentFrame = enemy.animation.currentFrame;
      const frameData = enemy.animation.animationDefinition.frameData?.[currentFrame];
      console.log(`[ENEMY_ATTACK_DEBUG] Frame data:`, {
        frame: currentFrame,
        hasAttackBox: !!frameData?.attackBox,
        attackBox: frameData?.attackBox
      });
    }

    if (hit) {
      console.log(`[ENEMY_ATTACK_DEBUG] HIT DETECTED! Getting attack type...`);
      // Use combat system to calculate and apply damage
      const enemyAttackType = enemy.stateMachine.getCurrentAttackType();
      console.log(`[ENEMY_ATTACK_DEBUG] Attack type: ${enemyAttackType}`);

      if (enemyAttackType) {
        console.log(`[ENEMY_ATTACK_DEBUG] Resolving attack with combat system...`);

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

        console.log(`[ENEMY_ATTACK_DEBUG] Mapped ${enemyAttackType} to combat skill: ${combatSkillType}`);
        const combatEvent = window.combatResolver.resolveAttackNoResourceCheck(enemy, player, combatSkillType);
        console.log(`[ENEMY_ATTACK_DEBUG] Combat event:`, combatEvent);

        // Add damage number for visual feedback
        if (combatEvent && combatEvent.actualDamage > 0) {
          const damageX = player.x + player.w / 2;
          const damageY = player.y - 10;
          window.damageNumberManager.addDamageNumber(damageX, damageY, combatEvent.actualDamage, combatEvent.damageResult.isCritical);
        }

        // Set damageDealt flag to prevent multiple damage per attack (unified with player system)
        if (combatEvent && combatEvent.actualDamage > 0) {
          enemy.damageDealt = true;
          console.log(`[ENEMY_ATTACK_DEBUG] Damage applied (${combatEvent.actualDamage}), set damageDealt=true`);
        } else {
          console.log(`[ENEMY_ATTACK_DEBUG] No damage applied, keeping damageDealt=false`);
        }

        // Set visual hit flag for player
        player.hit = true;
        console.log(`[ENEMY_ATTACK_DEBUG] Player hit flag set to true`);
        break; // Only one enemy attack per player per frame
      } else {
        console.log(`[ENEMY_ATTACK_DEBUG] No attack type found, skipping damage`);
      }
    } else {
        console.log(`[ENEMY_ATTACK_DEBUG] No collision detected, enemy attack missed`);
    }
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
  if (window.keys[controls.down]){
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

// Key press tracking variables for skill trees
let key5Pressed = false;
let key5WasPressed = false;
let key6Pressed = false;
let key6WasPressed = false;
let key7Pressed = false;
let key7WasPressed = false;
let key8Pressed = false;
let key8WasPressed = false;
let keyTPressed = false;
let keyTWasPressed = false;
let keyYPressed = false;
let keyYWasPressed = false;
let keyUPressed = false;
let keyUWasPressed = false;
let keyIPressed = false;
let keyIWasPressed = false;

// Key press tracking variables for character stats
let key9Pressed = false;
let key9WasPressed = false;
let key0Pressed = false;
let key0WasPressed = false;
let keyMinusPressed = false;
let keyMinusWasPressed = false;
let keyEqualsPressed = false;
let keyEqualsWasPressed = false;


function handleSkillTreeKeys() {
  const now = performance.now();
  if (now - lastSkillTreeToggleTime < 300) return; // 300ms debounce

  // Debug logging
  //console.log('[DEBUG] handleSkillTreeKeys called - menuActive:', menuActive, 'gameState:', window.gameStateString);
  //console.log('[DEBUG] Keys - 5:', window.keys['5'], '6:', window.keys['6'], '7:', window.keys['7'], '8:', window.keys['8']);

  // Toggle main menu (Escape or 'm')
  if (window.keys['Escape'] || window.keys['m']) {
    toggleMenu();
    lastSkillTreeToggleTime = now;
    window.keys['Escape'] = false;
    window.keys['m'] = false;
  }

  // Player 1 skill tree (key 5) - 3-tier toggle system
  key5Pressed = window.keys['5'];
  if (key5Pressed && !key5WasPressed && window.gameState.players && window.gameState.players.length >= 1) { // Key just pressed
    //console.log('Key r pressed - currentMenu:', currentMenu, 'currentSkillTreePlayer:', currentSkillTreePlayer);
    if (currentMenu === 'microTree' && currentSkillTreePlayer === 0) {
      // Tier 3: Micro tree is open - close micro tree (main tree stays open)
      //console.log('Closing micro tree for player 1 (main tree stays open)');
      hideMicroTree();
    } else if (currentMenu === 'skills' && currentSkillTreePlayer === 0) {
      // Tier 2: Main skill tree is open (no micro tree) - close everything
      //console.log('Closing skill tree for player 1');
      hideSkillTree();
    } else if (!menuActive) {
      // Tier 1: No menu is active - open main skill tree
      //console.log('Opening skill tree for player 1');
      showSkillTreeForPlayer(0);
    }
    // If another player's menu is open, do nothing
    lastSkillTreeToggleTime = now;
  }
  key5WasPressed = key5Pressed;

  // Player 2 skill tree (key 6) - 3-tier toggle system
  key6Pressed = window.keys['6'];
  if (key6Pressed && !key6WasPressed && window.gameState.players && window.gameState.players.length >= 2) {
    if (currentMenu === 'microTree' && currentSkillTreePlayer === 1) {
      // Tier 3: Micro tree is open - close micro tree (main tree stays open)
      hideMicroTree();
    } else if (currentMenu === 'skills' && currentSkillTreePlayer === 1) {
      // Tier 2: Main skill tree is open (no micro tree) - close everything
      hideSkillTree();
    } else if (!menuActive) {
      // Tier 1: No menu is active - open main skill tree
      showSkillTreeForPlayer(1);
    }
    // If another player's menu is open, do nothing
    lastSkillTreeToggleTime = now;
  }
  key6WasPressed = key6Pressed;

  // Player 3 skill tree (key 7) - 3-tier toggle system
  key7Pressed = window.keys['7'];
  if (key7Pressed && !key7WasPressed && window.gameState.players && window.gameState.players.length >= 3) {
    if (currentMenu === 'microTree' && currentSkillTreePlayer === 2) {
      // Tier 3: Micro tree is open - close micro tree (main tree stays open)
      hideMicroTree();
    } else if (currentMenu === 'skills' && currentSkillTreePlayer === 2) {
      // Tier 2: Main skill tree is open (no micro tree) - close everything
      hideSkillTree();
    } else if (!menuActive) {
      // Tier 1: No menu is active - open main skill tree
      showSkillTreeForPlayer(2);
    }
    // If another player's menu is open, do nothing
    lastSkillTreeToggleTime = now;
  }
  key7WasPressed = key7Pressed;

  // Player 4 skill tree (key 8) - 3-tier toggle system
  key8Pressed = window.keys['8'];
  if (key8Pressed && !key8WasPressed && window.gameState.players && window.gameState.players.length >= 4) {
    if (currentMenu === 'microTree' && currentSkillTreePlayer === 3) {
      // Tier 3: Micro tree is open - close micro tree (main tree stays open)
      hideMicroTree();
    } else if (currentMenu === 'skills' && currentSkillTreePlayer === 3) {
      // Tier 2: Main skill tree is open (no micro tree) - close everything
      hideSkillTree();
    } else if (!menuActive) {
      // Tier 1: No menu is active - open main skill tree
      showSkillTreeForPlayer(3);
    }
    // If another player's menu is open, do nothing
    lastSkillTreeToggleTime = now;
  }
  key8WasPressed = key8Pressed;

  // Tab navigation (only when skill tree is open) - unified logic with proper key tracking
  if (currentMenu === 'skills') {
    //console.log('Skill tree is open, checking tab navigation for player:', currentSkillTreePlayer);

    // Player 1 tab navigation (key t)
    keyTPressed = window.keys['t'] || window.keys['T'];
    if (keyTPressed && !keyTWasPressed) {
      //console.log('T key pressed, currentSkillTreePlayer:', currentSkillTreePlayer);
      if (currentSkillTreePlayer === 0) {
        //console.log('Switching tab for player 1');
        const nextPage = currentSkillPage === SKILL_PAGES.MAIN ? SKILL_PAGES.SECONDARY : SKILL_PAGES.MAIN;
        //console.log('Switching from', currentSkillPage, 'to', nextPage);
        switchSkillTreePage(nextPage);
        lastSkillTreeToggleTime = now;
      }
    }
    keyTWasPressed = keyTPressed;

    // Player 2 tab navigation (key y)
    keyYPressed = window.keys['y'] || window.keys['Y'];
    if (keyYPressed && !keyYWasPressed) {
      if (currentSkillTreePlayer === 1) {
        const nextPage = currentSkillPage === SKILL_PAGES.MAIN ? SKILL_PAGES.SECONDARY : SKILL_PAGES.MAIN;
        switchSkillTreePage(nextPage);
        lastSkillTreeToggleTime = now;
      }
    }
    keyYWasPressed = keyYPressed;

    // Player 3 tab navigation (key u)
    keyUPressed = window.keys['u'] || window.keys['U'];
    if (keyUPressed && !keyUWasPressed) {
      if (currentSkillTreePlayer === 2) {
        const nextPage = currentSkillPage === SKILL_PAGES.MAIN ? SKILL_PAGES.SECONDARY : SKILL_PAGES.MAIN;
        switchSkillTreePage(nextPage);
        lastSkillTreeToggleTime = now;
      }
    }
    keyUWasPressed = keyUPressed;

    // Player 4 tab navigation (key i)
    keyIPressed = window.keys['i'] || window.keys['I'];
    if (keyIPressed && !keyIWasPressed) {
      if (currentSkillTreePlayer === 3) {
        const nextPage = currentSkillPage === SKILL_PAGES.MAIN ? SKILL_PAGES.SECONDARY : SKILL_PAGES.MAIN;
        switchSkillTreePage(nextPage);
        lastSkillTreeToggleTime = now;
      }
    }
    keyIWasPressed = keyIPressed;
  }
}

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
      console.log(`[JUMP] Jump started - player on ground, triggering FSM jump`);
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

  // Обработка на движение и колизии
function handleMovement(player, dt) {
  // Prevent movement during attack animations
  if (player.stateMachine && player.stateMachine.isInAttackState()) {
    // During attack, character should not move - set velocity to 0
    player.vx = 0;
    player.vz = 0;
    return; // Skip movement processing during attacks
  }

  // Check X movement collision with correction instead of blocking
  const proposedX = player.x + player.vx * dt;

  // Apply collision correction - simple boundary correction like the old system
  const correctedX = applyCollisionCorrection(player, proposedX, player.y, player.z, 'x');
  player.x = correctedX;

  // Опит за движение по Z
  const proposedZ = player.z + player.vz * dt;
  const clampedZ = Math.min(Math.max(proposedZ, Z_MIN), Z_MAX);

  //Check Z movement collision
  if (canMoveTo(player, player.x, player.y, clampedZ)) {
    player.z = clampedZ;
  }

  // X movement is now handled entirely by collision correction above
  // No additional player.x += player.vx * dt; needed

  // Гравитация
  player.vy += GRAVITY * dt;
  player.y += player.vy * dt;

  // Apply screen boundaries to keep player within screen bounds
  const boundaryResult = applyScreenBoundaries(player);
  if (boundaryResult.wasLimited) {
    // Stop movement if we hit a boundary
    player.vx = 0;
    player.vz = 0;
  }

  // Земя - използвай spawn позицията вместо hardcoded 100px
  const groundY = CANVAS_HEIGHT - 600; // Съответства на spawnY в main.js
  if (player.y >= groundY) {
    // Check if this is the first frame of landing (transition from air to ground)
    const wasInAir = !player.onGround;

    player.y = groundY;
    player.vy = 0;
    player.onGround = true;

    if (wasInAir) {
      console.log(`[JUMP] Player landed on ground (y: ${groundY})`);

      // Check if player was jumping - force FSM transition
      if (player.animation && player.animation.currentAnimation === window.ANIMATION_TYPES.JUMP) {
        console.log(`[JUMP] Player was jumping, forcing FSM transition on landing`);
        // Clear force flag first
        player.animation.forceAnimation = false;

        // Force FSM transition by calling JumpingState update
        if (player.stateMachine && player.stateMachine.currentState.name === 'jumping') {
          // Temporarily set justEntered to false so update() will run
          const wasJustEntered = player.stateMachine.currentState.justEntered;
          player.stateMachine.currentState.justEntered = false;

          const transition = player.stateMachine.currentState.update(player, 0);
          if (transition) {
            console.log(`[JUMP] Landing transition to: ${transition}`);
            player.stateMachine.changeState(transition);
          }

          // Restore justEntered flag
          player.stateMachine.currentState.justEntered = wasJustEntered;
        }
      }
    }
  } else {
    // Player is in air
    player.onGround = false;
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
    console.log('Creating default controller controls');
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
  console.log(`🎮 Играч ${playerNum}, ${inputDevice}, бутон "${button}", действие ${actionName}`);
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
    console.log(`Button ${buttonIndex} not found`);
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

function handleCharacterStatsKeys() {
  const now = performance.now();
  if (now - lastSkillTreeToggleTime < 300) return; // 300ms debounce (reuse same timer)

  // Debug logging
  //console.log('[DEBUG] handleCharacterStatsKeys called - menuActive:', menuActive, 'gameState:', window.gameStateString);
  //console.log('[DEBUG] Character stats keys - 9:', window.keys['9'], '0:', window.keys['0'], '-:', window.keys['-'], '=', window.keys['=']);

  // Player 1 character stats (key 9) - toggle player's own stats
  key9Pressed = window.keys['9'];
  if (key9Pressed && !key9WasPressed && window.gameState.players && window.gameState.players.length >= 1) { // Key just pressed
    if (currentMenu === 'characterStats' && currentCharacterStatsPlayer === 0) {
      // Close if player's own stats are open
      hideCharacterStats();
    } else if (!menuActive) {
      // Open only if no menu is active
      showCharacterStatsForPlayer(0);
    }
    // If another player's stats are open, do nothing
    lastSkillTreeToggleTime = now;
  }
  key9WasPressed = key9Pressed;

  // Player 2 character stats (key 0) - toggle player's own stats
  key0Pressed = window.keys['0'];
  if (key0Pressed && !key0WasPressed && window.gameState.players && window.gameState.players.length >= 2) {
    if (currentMenu === 'characterStats' && currentCharacterStatsPlayer === 1) {
      // Close if player's own stats are open
      hideCharacterStats();
    } else if (!menuActive) {
      // Open only if no menu is active
      showCharacterStatsForPlayer(1);
    }
    // If another player's stats are open, do nothing
    lastSkillTreeToggleTime = now;
  }
  key0WasPressed = key0Pressed;

  // Player 3 character stats (key -) - toggle player's own stats
  keyMinusPressed = window.keys['-'];
  if (keyMinusPressed && !keyMinusWasPressed && window.gameState.players && window.gameState.players.length >= 3) {
    if (currentMenu === 'characterStats' && currentCharacterStatsPlayer === 2) {
      // Close if player's own stats are open
      hideCharacterStats();
    } else if (!menuActive) {
      // Open only if no menu is active
      showCharacterStatsForPlayer(2);
    }
    // If another player's stats are open, do nothing
    lastSkillTreeToggleTime = now;
  }
  keyMinusWasPressed = keyMinusPressed;

  // Player 4 character stats (key =) - toggle player's own stats
  keyEqualsPressed = window.keys['='];
  if (keyEqualsPressed && !keyEqualsWasPressed && window.gameState.players && window.gameState.players.length >= 4) {
    if (currentMenu === 'characterStats' && currentCharacterStatsPlayer === 3) {
      // Close if player's own stats are open
      hideCharacterStats();
    } else if (!menuActive) {
      // Open only if no menu is active
      showCharacterStatsForPlayer(3);
    }
    // If another player's stats are open, do nothing
    lastSkillTreeToggleTime = now;
  }
  keyEqualsWasPressed = keyEqualsPressed;
}

function update(dt) {
  // Handle skill tree and character stats key inputs
  handleSkillTreeKeys();
  handleCharacterStatsKeys();

  // Ако имаме активно меню, не ъпдейтвай играчите и враговете.
  // Това ефективно "паузира" играта.
  if (!menuActive) {
    // Централизирана обработка на смърт за всички умиращи елементи
    updateDeathSequences(dt);

    // Обновяване на всички играчи
    if (window.gameState) {
      window.gameState.players.forEach((player, index) => {
        updatePlayer(player, index, dt);

        // Reset hit flag after a short time (like enemies)
        if (player.hit) {
          player.hit = false;
        }
      });

      // Обновяване на всички противници (само живи и не умиращи)
      const enemies = window.gameState.getEntitiesByType('enemy');
      enemies.forEach(enemy => {
        if (!enemy.isDying) { // Не обновяваме AI за умиращи противници
          // Apply enemy physics FIRST (boundary clamping affects Z position)
          handleEnemyMovement(enemy, dt);
          // Then update AI with correct Z position after boundary clamping
          updateEnemyAI(enemy, dt);
        }
      });
    } else {
      // Fallback към старата система за backwards compatibility
      players.forEach((player, index) => {
        updatePlayer(player, index, dt);
      });
      updateEnemyAI(dt);
    }
  }
}

function updateEnemyAI(enemy, dt) {
  if (!enemy) return;

  // Normal AI only runs if enemy is alive and not dying
  if (enemy.health > 0 && !enemy.isDying) {
    // Get players array for AI decision making
    const players = window.gameState ? window.gameState.players : window.players || [];

    // Use BT-based AI if available, otherwise fallback to simple AI
    if (enemy.updateAI && typeof enemy.updateAI === 'function') {
      // BT-based AI (Blue Slime uses this)
      enemy.updateAI(players, dt);
    } else {
      // Simple fallback AI for other enemies
      if (Math.random() < 0.01) { // 1% chance per frame to attack
        if (enemy.stateMachine && !enemy.stateMachine.isInAttackState()) {
          // Choose random attack type for FSM
          const attackActions = ['attack_light', 'attack_medium', 'attack_heavy'];
          const randomAttack = attackActions[Math.floor(Math.random() * attackActions.length)];

          // Trigger FSM attack
          enemy.stateMachine.handleAction(randomAttack);
          //console.log(`[ENEMY AI] Enemy attacks with ${randomAttack}`);
        }
      }
    }
  }

  // Reset hit flag after a short time
  if (enemy.hit) {
    enemy.hit = false;
  }
}

// Централизирана обработка на смърт за всички умиращи елементи
// Handle enemy physics and movement (similar to player handleMovement)
function handleEnemyMovement(enemy, dt) {
  // console.log(`[HANDLE ENEMY MOVEMENT] START - x=${enemy.x}, z=${enemy.z}, vx=${enemy.vx}, vz=${enemy.vz}`);

  // Prevent movement during attack animations (like players)
  if (enemy.stateMachine && enemy.stateMachine.isInAttackState()) {
    enemy.vx = 0;
    enemy.vz = 0;
    return;
  }

  // Apply velocity to position (basic physics)
  enemy.x += enemy.vx * dt;
  enemy.y += enemy.vy * dt;
  enemy.z += enemy.vz * dt;

  // Basic gravity for enemies (if they can fall)
  enemy.vy += GRAVITY * dt;

  // Ground collision (similar to players)
  const groundY = CANVAS_HEIGHT - 600; // Same ground level as players
  if (enemy.y >= groundY) {
    enemy.y = groundY;
    enemy.vy = 0;
    enemy.onGround = true;
  } else {
    enemy.onGround = false;
  }

  // Apply screen boundaries and check for interruption
  const boundaryResult = applyScreenBoundaries(enemy);
  // console.log(`[HANDLE ENEMY MOVEMENT] boundary check: wasLimited=${boundaryResult.wasLimited}`);

  if (boundaryResult.wasLimited) {
    // console.log(`[HANDLE ENEMY MOVEMENT] Boundary hit - stopping movement!`);
    // Signal that boundary was hit - AI will handle BT consultation
    enemy.boundaryInterrupted = true;
  }

  // Reset velocity after movement (AI will set it again next frame)
  // Keep vx for continuous movement
  enemy.vx = 0;  // Always reset vx (horizontal)

  // Only reset vz if not in vertical movement mode
  // console.log(`[HANDLE ENEMY MOVEMENT] Before vz reset: vz=${enemy.vz}, targetZ=${enemy.targetZ}`);
  if (!enemy.targetZ) {
    enemy.vz = 0;  // Only reset vz if not doing vertical movement
    // console.log(`[HANDLE ENEMY MOVEMENT] Reset vz to 0 (no vertical movement)`);
  } else {
    // console.log(`[HANDLE ENEMY MOVEMENT] Kept vz=${enemy.vz} (vertical movement active)`);
  }
}

function updateDeathSequences(dt) {
  if (window.gameState) {
    const allEntities = window.gameState.getAllEntities();

    for (const entity of allEntities) {
      if (entity.isDying && entity.entityType === 'enemy') {
        const isDead = window.combatResolver.updateEnemyDeath(entity, dt);
        if (isDead) {
          console.log(`[GAME] Enemy ${entity.id} death sequence completed and removed`);
        }
      }
    }
  }
}

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

  // Update resource regeneration for all entities
  if (window.resourceManagers) {
    for (const [entity, resourceManager] of window.resourceManagers) {
      resourceManager.updateRegeneration(dt);
    }
  }

  requestAnimationFrame(loop);
}

// Helper function to check if an entity is currently in collision with other entities
function checkIfEntityIsInCollision(entity) {
  // Get all other entities
  const allEntities = window.gameState ? window.gameState.getAllEntities() :
                     [...players, window.enemy, window.ally].filter(e => e !== null && e !== undefined);
  const others = allEntities.filter(e => e !== entity && e !== null && e !== undefined);

  // Check collision with each other entity at current position
  for (const other of others) {
    const hasCollision = checkEntityCollision(
      entity, other, 'movement',
      {
        entity1Pos: { x: entity.x, y: entity.y, z: entity.z }, // Current position
        buffer: 0 // No buffer for precise collision check
      }
    );

    if (hasCollision) {
      console.log(`[COLLISION_CHECK] Entity ${entity.entityType} is currently colliding with ${other.entityType}`);
      return true;
    }
  }

  return false;
}

// Behavior constraints function - determines which behaviors are physically possible
// Now uses centralized enemy AI utilities for consistency
function getBehaviorConstraints(entity) {
  const constraints = {
    allowed: new Set(['idle', 'attack', 'chase']), // Always allowed
    blocked: new Set(),
    reasons: {}
  };

  // Use centralized constants
  const config = window.enemyAIConfig?.CONSTANTS || {};
  const btCheckDistanceX = config.BT_CONSTRAINT_CHECK_DISTANCE_X || 100;
  const btCheckDistanceZ = config.BT_CONSTRAINT_CHECK_DISTANCE_Z || 50;

  // Check horizontal movement constraints using enemyAIUtils (cached version for performance)
  if (window.enemyAIUtils && window.enemyAIUtils.checkScreenBoundariesCached) {
    const boundaries = window.enemyAIUtils.checkScreenBoundariesCached(entity);

    // Can move right? (check if not at right boundary)
    if (boundaries.right) {
      constraints.blocked.add('patrol_right');
      constraints.blocked.add('move_right');
      constraints.reasons.patrol_right = 'screen_boundary_right';
    }

    // Can move left? (check if not at left boundary)
    if (boundaries.left) {
      constraints.blocked.add('patrol_left');
      constraints.blocked.add('move_left');
      constraints.reasons.patrol_left = 'screen_boundary_left';
    }
  } else if (window.enemyAIUtils && window.enemyAIUtils.checkScreenBoundaries) {
    // Fallback to non-cached version
    const boundaries = window.enemyAIUtils.checkScreenBoundaries(entity);

    // Can move right? (check if not at right boundary)
    if (boundaries.right) {
      constraints.blocked.add('patrol_right');
      constraints.blocked.add('move_right');
      constraints.reasons.patrol_right = 'screen_boundary_right';
    }

    // Can move left? (check if not at left boundary)
    if (boundaries.left) {
      constraints.blocked.add('patrol_left');
      constraints.blocked.add('move_left');
      constraints.reasons.patrol_left = 'screen_boundary_left';
    }
  } else {
    // Fallback for when utils are not available
    const entityWidth = entity.collisionW || entity.w || 50;
    if (entity.x >= CANVAS_WIDTH - entityWidth) {
      constraints.blocked.add('patrol_right');
      constraints.blocked.add('move_right');
      constraints.reasons.patrol_right = 'screen_boundary_right';
    }
    if (entity.x <= 0) {
      constraints.blocked.add('patrol_left');
      constraints.blocked.add('move_left');
      constraints.reasons.patrol_left = 'screen_boundary_left';
    }
  }

  // Can patrol? (needs at least one direction available)
  const canPatrol = !constraints.blocked.has('patrol_left') || !constraints.blocked.has('patrol_right');
  if (!canPatrol) {
    constraints.blocked.add('patrol');
    constraints.reasons.patrol = 'no_movement_space';
  } else {
    // Allow patrol if at least one direction is available
    constraints.allowed.add('patrol');
    constraints.allowed.add('patrol_left');
    constraints.allowed.add('patrol_right');
  }

  // Check vertical movement constraints
  const canMoveUp = entity.z > Z_MIN;
  const canMoveDown = entity.z < Z_MAX;

  if (!canMoveUp) {
    constraints.blocked.add('move_up');
    constraints.reasons.move_up = 'screen_boundary_top';
  }

  if (!canMoveDown) {
    constraints.blocked.add('move_down');
    constraints.reasons.move_down = 'screen_boundary_bottom';
  }

  // Check for obstacles/entities blocking movement using enemyAIUtils
  if (window.enemyAIUtils && window.enemyAIUtils.detectEntityCollisions) {
    const entities = window.gameState ? window.gameState.getAllEntities() : [];
    const nearbyEntities = window.enemyAIUtils.detectEntityCollisions(entity, entities, btCheckDistanceX);

    if (nearbyEntities.length > 0) {
      constraints.blocked.add('patrol');
      constraints.reasons.patrol = 'entities_blocking';
    }
  } else {
    // Fallback entity checking
    const entities = window.gameState ? window.gameState.getAllEntities() : [];
    const nearbyEntities = entities.filter(e =>
      e !== entity &&
      Math.abs(e.x - entity.x) < btCheckDistanceX &&
      Math.abs(e.z - entity.z) < btCheckDistanceZ
    );

    if (nearbyEntities.length > 0) {
      constraints.blocked.add('patrol');
      constraints.reasons.patrol = 'entities_blocking';
    }
  }

  console.log(`[BEHAVIOR_CONSTRAINTS] ${entity.entityType} constraints:`, {
    allowed: Array.from(constraints.allowed),
    blocked: Array.from(constraints.blocked),
    reasons: constraints.reasons
  });

  return constraints;
}

// Universal screen boundaries function - checks and applies boundaries, returns interruption info
function applyScreenBoundaries(entity) {
  let wasLimited = false;

  // Get current per-frame hit box dimensions and position offset
  const hitBoxData = getCurrentHitBoxDimensions(entity);
  const hitBoxPosition = getCurrentHitBoxPosition(entity);

  if (hitBoxData && hitBoxPosition) {
    // Calculate boundaries based on actual hit box position in sprite frame
    const hitBoxOffsetX = hitBoxPosition.x - entity.x; // How much hit box is offset from entity.x
    const hitBoxOffsetY = hitBoxPosition.y - entity.z; // How much hit box is offset from entity.z

    // Ensure full hit box visibility: entity.x + hitBoxOffsetX + hitBoxData.width <= CANVAS_WIDTH
    const leftBoundary = -hitBoxOffsetX; // Allow entity to go left enough to show full hit box
    const rightBoundary = CANVAS_WIDTH - (hitBoxOffsetX + hitBoxData.width);
    const bottomBoundary = Z_MIN; // Same as before
    const topBoundary = Z_MAX; // Same as before

    //console.log(`[SCREEN_BOUNDARIES] ${entity.entityType} hit box offset X: ${hitBoxOffsetX}, width: ${hitBoxData.width}`);
    //console.log(`[SCREEN_BOUNDARIES] ${entity.entityType} boundaries - left: ${leftBoundary}, right: ${rightBoundary}`);

    // Horizontal boundaries (X-axis) - ensure full hit box visibility
    if (entity.x < leftBoundary) {
      console.log(`[SCREEN_BOUNDARIES] ${entity.entityType} hit left boundary, clamping X from ${entity.x} to ${leftBoundary}`);
      entity.x = leftBoundary;
      entity.vx = 0; // Stop horizontal movement
      wasLimited = true;
    } else if (entity.x > rightBoundary) {
      console.log(`[SCREEN_BOUNDARIES] ${entity.entityType} hit right boundary, clamping X from ${entity.x} to ${rightBoundary}`);
      entity.x = rightBoundary;
      entity.vx = 0; // Stop horizontal movement
      wasLimited = true;
    }
  } else {
    // Fallback for entities without per-frame hit boxes
    const entityWidth = entity.collisionW || entity.w || 50;
    const leftBoundary = 0;
    const rightBoundary = CANVAS_WIDTH - entityWidth;
    const bottomBoundary = Z_MIN;
    const topBoundary = Z_MAX;

    console.log(`[SCREEN_BOUNDARIES] ${entity.entityType} fallback boundaries - left: ${leftBoundary}, right: ${rightBoundary}, width: ${entityWidth}`);

    if (entity.x < leftBoundary) {
      entity.x = leftBoundary;
      entity.vx = 0;
      wasLimited = true;
    } else if (entity.x > rightBoundary) {
      entity.x = rightBoundary;
      entity.vx = 0;
      wasLimited = true;
    }
  }

  // Vertical boundaries (Z-axis) - same as before
  if (entity.z < Z_MIN) {
    console.log(`[SCREEN_BOUNDARIES] ${entity.entityType} hit bottom boundary, clamping Z from ${entity.z} to ${Z_MIN}`);
    entity.z = Z_MIN;
    entity.vz = 0; // Stop vertical movement
    wasLimited = true;
  } else if (entity.z > Z_MAX) {
    console.log(`[SCREEN_BOUNDARIES] ${entity.entityType} hit top boundary, clamping Z from ${entity.z} to ${Z_MAX}`);
    entity.z = Z_MAX;
    entity.vz = 0; // Stop vertical movement
    wasLimited = true;
  }

  return { wasLimited };
}

// Export behavior constraints function globally
window.getBehaviorConstraints = getBehaviorConstraints;

// COLLISION FUNCTIONS MOVED BACK TO collision.js

// ===========================================
// SKILL TREE FUNCTIONS - moved from menu.js
// ===========================================

// Helper function to get current skill grid layout
// function getCurrentSkillGridLayout() {
//   return SKILL_GRID_LAYOUTS[currentSkillPage] || SKILL_GRID_LAYOUTS[SKILL_PAGES.MAIN];
// }

// Helper function to find grid position of a skill
// function findSkillGridPosition(skillType) {
//   const currentLayout = getCurrentSkillGridLayout();
//   for (let row = 0; row < currentLayout.length; row++) {
//     for (let col = 0; col < currentLayout[row].length; col++) {
//       if (currentLayout[row][col] === skillType) {
//         return { row, col };
//       }
//     }
//   }
//   return null;
// }

// Draw connection lines between prerequisite skills
// function drawConnectionLines(svgContainer, player) {
//   // Clear existing lines
//   svgContainer.innerHTML = '';

//   // Icon dimensions (including margins)
//   const iconSize = 64;
//   const iconMargin = 10;
//   const totalIconSize = iconSize + iconMargin;

//   // Define skill chains and their gap positions (moved 2 columns to the right due to padding changes)
//   const skillChains = [
//     // Basic attack chain - gap at column 3.5 (between col 3 and 4) - moved +2 from 1.25
//     { skills: [SKILL_TYPES.BASIC_ATTACK_LIGHT, SKILL_TYPES.BASIC_ATTACK_MEDIUM, SKILL_TYPES.BASIC_ATTACK_HEAVY], gapColumn: 3 },
//     // Secondary attack chain - gap at column 4.5 (between col 4 and 5) - moved +2 from 2.3
//     { skills: [SKILL_TYPES.SECONDARY_ATTACK_LIGHT, SKILL_TYPES.SECONDARY_ATTACK_MEDIUM, SKILL_TYPES.SECONDARY_ATTACK_HEAVY], gapColumn: 4.05 },
//     // Enhanced attack chain - gap at column 5.5 (between col 5 and 6) - moved +2 from 3.4
//     { skills: [SKILL_TYPES.ENHANCED_ATTACK, SKILL_TYPES.STRONG_ATTACK, SKILL_TYPES.ULTIMATE_ATTACK], gapColumn: 5.15 }
//   ];

//   // Draw vertical lines for each skill chain
//   skillChains.forEach(chain => {
//     for (let i = 0; i < chain.skills.length - 1; i++) {
//       const fromSkill = chain.skills[i];
//       const toSkill = chain.skills[i + 1];

//       // Find grid positions
//       const fromPos = findSkillGridPosition(fromSkill);
//       const toPos = findSkillGridPosition(toSkill);

//       if (fromPos && toPos) {
//         // Draw vertical line in the gap between columns with dynamic color
//         drawVerticalLineInGap(svgContainer, fromPos.row, toPos.row, chain.gapColumn, totalIconSize, player, toSkill);
//       }
//     }
//   });
// }

// Draw a vertical line in the gap between columns with dynamic color
// function drawVerticalLineInGap(svgContainer, fromRow, toRow, gapColumn, totalIconSize, player, toSkill) {
//   // Calculate pixel positions for the vertical line in the gap
//   const lineX = gapColumn * totalIconSize; // Position in the gap (e.g., 0.5 * totalIconSize)
//   const fromY = (fromRow + 0.5) * totalIconSize; // Center of from icon
//   const toY = (toRow + 0.5) * totalIconSize;   // Center of to icon

//   // Determine line color based on target skill status
//   let lineColor = '#666666'; // Default gray for locked skills

//   if (player.unlockedSkills.has(toSkill)) {
//     lineColor = '#00ff00'; // Green - target skill is unlocked
//   } else if (window.skillTreeManager.canUnlockSkill(player, toSkill)) {
//     lineColor = '#ff8800'; // Orange - target skill can be unlocked
//   } else {
//     lineColor = '#666666'; // Gray - target skill is locked
//   }

//   // Create vertical line
//   const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
//   line.setAttribute('x1', lineX);
//   line.setAttribute('y1', fromY);
//   line.setAttribute('x2', lineX);
//   line.setAttribute('y2', toY);
//   line.setAttribute('stroke', lineColor);
//   line.setAttribute('stroke-width', '5'); // Even thicker for better visibility
//   line.setAttribute('opacity', '0.95'); // Very opaque
//   line.setAttribute('stroke-linecap', 'round');

//   svgContainer.appendChild(line);
// }





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



// Initialize game with selected players and characters
function initGameWithSelections() {
  console.log('[GAME] initGameWithSelections called');

  // Hide start screen
  const startScreen = document.getElementById('startScreen');
  if (startScreen) {
    startScreen.style.display = 'none';
    console.log('[GAME] Start screen hidden');
  }

  // Setup canvas
  const canvas = document.getElementById("game");
  ctx = canvas.getContext("2d");

  // Initialize animation system first
  initializeAnimationSystem().then(() => {
    console.log('[GAME] Animation system initialized');

    // Initialize damage number manager
    if (window.damageNumberManager) {
      window.damageNumberManager.init(canvas);
    }

    // Initialize game state system
    window.gameState = new GameState();
    console.log('[GAME] Game state initialized');

    // Clear global arrays for backwards compatibility
    window.players = [];
    console.log('[GAME] window.players cleared and set to:', window.players);

    // Create players based on confirmed selections (sorted by player ID for consistent ordering)
    const selectedChars = Object.keys(window.playerSelections).sort((a, b) =>
      window.playerSelections[a] - window.playerSelections[b]
    );
    console.log('[GAME] Creating players for selectedChars:', selectedChars);

    selectedChars.forEach((charId, index) => {
      const char = window.characters.find(c => c.id === charId);
      const playerId = window.playerSelections[charId];
      const playerKey = `player${playerId}`;

      console.log(`[GAME] Creating player ${playerId} with key ${playerKey}, controls exist:`, !!window.controls[playerKey]);

      if (window.controls[playerKey]) {
        // Scale X positions for new canvas size (from 900 to 1920)
        const scaleFactor = CANVAS_WIDTH / 900; // ~2.13
        const baseX = 100 * scaleFactor; // ~213
        const spacing = 100 * scaleFactor; // ~213
        const x = baseX + (index * spacing);

        // Move entities higher up - responsive to canvas size
        const spawnY = Math.max(200, CANVAS_HEIGHT - 600); // Min 200px from top
        const player = new Player(window.controls[playerKey], x, spawnY, char.position, char.color, char.id);

        console.log(`[GAME] Player ${playerId} created:`, player);

        // Add to game state instead of directly to players
        window.gameState.addEntity(player, 'player');
        console.log(`[GAME] Player ${playerId} added to game state`);

        // Register player with animation system
        if (window.animationSystem && window.animationSystem.isInitialized) {
          const animation = window.animationSystem.registerEntity(player, 'knight');
          console.log(`[GAME] Player ${playerId} registered with animation system:`, animation ? 'SUCCESS' : 'FAILED');
          if (animation) {
            console.log(`[GAME] Player ${playerId} animation state:`, animation.getDebugInfo());
          }
        } else {
          console.warn(`[GAME] Animation system not ready for player ${playerId}:`, {
            systemExists: !!window.animationSystem,
            isInitialized: window.animationSystem ? window.animationSystem.isInitialized : false
          });
        }

        // Initialize State Machine for player
        if (window.AnimationStateMachine) {
          player.stateMachine = new window.AnimationStateMachine(player);
          console.log(`[GAME] Player ${playerId} state machine initialized:`, player.stateMachine.getCurrentStateName());
        } else {
          console.warn(`[GAME] AnimationStateMachine not available for player ${playerId}`);
        }
      } else {
        console.warn(`No controls found for player ${playerId} (${playerKey})`);
      }
    });

    console.log('[GAME] Final game state debug:', window.gameState.getDebugInfo());

    // Create enemies using the new enemy data system
    const blueSlime = createBlueSlime(650 * (CANVAS_WIDTH / 900), Math.max(200, CANVAS_HEIGHT - 600), 0, 1);
    window.gameState.addEntity(blueSlime, 'enemy');
    console.log('[GAME] Blue Slime added to game state');

    // Register Blue Slime with animation system
    if (window.animationSystem && window.animationSystem.isInitialized) {
      const blueSlimeAnimation = window.animationSystem.registerEntity(blueSlime, 'blue_slime');
      console.log(`[GAME] Blue Slime registered with animation system:`, blueSlimeAnimation ? 'SUCCESS' : 'FAILED');

      // Create FSM after animation registration
      if (window.EnemyAnimationStateMachine) {
        blueSlime.stateMachine = new window.EnemyAnimationStateMachine(blueSlime);
        console.log(`[GAME] Blue Slime FSM initialized:`, blueSlime.stateMachine.getCurrentStateName());
      }
    }

    // Initialize menu system
    if (window.initMenu) {
      window.initMenu();
    }

    // Set game state to playing
    window.gameStateString = 'playing';

    // Start game loop
    requestAnimationFrame(loop);

    console.log('[GAME] Game initialization completed successfully');
  }).catch(error => {
    console.error('[GAME] Failed to initialize animation system:', error);
  });
}

// Export start screen variables and functions for UI access
window.characters = characters;
window.activePlayers = activePlayers;
window.playerSelections = playerSelections;
window.updatePlayerDetection = updatePlayerDetection;
window.joinPlayer = joinPlayer;
window.removePlayer = removePlayer;
window.selectCharacter = selectCharacter;
window.confirmSelection = confirmSelection;
window.updatePlayerStatus = updatePlayerStatus;
window.updateSelectionUI = updateSelectionUI;
window.updateStartButton = updateStartButton;
window.isCharacterTaken = isCharacterTaken;
window.initGameWithSelections = initGameWithSelections;







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

  // For now, trigger respawn after a short delay
  setTimeout(() => {
    respawnEnemy();
  }, 2000); // 2 second delay before respawn
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
