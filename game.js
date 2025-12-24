// Game logic and loop

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

  for (const enemy of enemyEntities) {
    if (!enemy || !enemy.stateMachine || !enemy.stateMachine.isInAttackState()) continue;

    // Check collision for enemy attack
    const hit = checkHitboxCollision(enemy, player, {
      zTolerance: 10
    });

    if (hit) {
      // Use combat system to calculate and apply damage
      const enemyAttackType = enemy.stateMachine.getCurrentAttackType();
      if (enemyAttackType) {
        const combatEvent = window.combatResolver.resolveAttack(enemy, player, enemyAttackType);

        // Add damage number for visual feedback
        if (combatEvent && combatEvent.actualDamage > 0) {
          const damageX = player.x + player.w / 2;
          const damageY = player.y - 10;
          window.damageNumberManager.addDamageNumber(damageX, damageY, combatEvent.actualDamage, combatEvent.damageResult.isCritical);
        }

        // Set visual hit flag for player
        player.hit = true;
        break; // Only one enemy attack per player per frame
      }
    }
  }
}

// Обработка на клавиатурен вход
function handleKeyboardInput(player) {
  const controls = getCurrentControls(player);

  // Движения
  if (keys[controls.left]) player.vx = -SPEED;
  if (keys[controls.right]) player.vx = SPEED;
  if (keys[controls.up]) player.vz = Z_SPEED;
  if (keys[controls.down]) player.vz = -Z_SPEED;

  // Скок - FSM-based
  if (keys[controls.jump] && player.onGround && player.stateMachine) {
    console.log(`[JUMP] Jump started - player on ground, triggering FSM jump`);
    logAction(0, 'клавиатура', controls.jump.toUpperCase(), 'jump');
    player.vy = JUMP_FORCE;
    player.onGround = false;
    player.stateMachine.handleAction('jump');
  }

  // Основни атаки - FSM-based
  if (keys[controls.basicAttackLight] && player.stateMachine && !player.stateMachine.isInAttackState()) {
    logAction(0, 'клавиатура', controls.basicAttackLight.toUpperCase(), 'attack_light');
    player.stateMachine.handleAction('attack_light');
  }
  if (keys[controls.basicAttackMedium] && player.stateMachine && !player.stateMachine.isInAttackState()) {
    // Check if player can perform skill (resources, etc.) - centralized in combat_system.js
    if (window.combatResolver.canPlayerPerformSkill(player, 'basic_attack_medium')) {
      logAction(0, 'клавиатура', controls.basicAttackMedium.toUpperCase(), 'attack_medium');
      player.stateMachine.handleAction('attack_medium');
    } else {
      console.log('[INPUT] Cannot perform basic_attack_medium (not enough resources?)');
      // TODO: Show "not enough mana" feedback to player
    }
  }
  // if (keys[controls.basicAttackHeavy] && player.stateMachine && !player.stateMachine.isInAttackState()) {
  //   logAction(0, 'клавиатура', controls.basicAttackHeavy.toUpperCase(), 'attack_heavy');
  //   player.stateMachine.handleAction('attack_heavy');
  // }

  // Допълнителни атаки - FSM-based (when implemented)
  // For now, secondary attacks use the same as primary
  if (keys[controls.secondaryAttackLight] && player.stateMachine && !player.stateMachine.isInAttackState()) {
    logAction(0, 'клавиатура', controls.secondaryAttackLight.toUpperCase(), 'attack_light');
    player.stateMachine.handleAction('secondary_attack_light');
  }
  // if (keys[controls.secondaryAttackMedium] && player.stateMachine && !player.stateMachine.isInAttackState()) {
  //   logAction(0, 'клавиатура', controls.secondaryAttackMedium.toUpperCase(), 'attack_medium');
  //   player.stateMachine.handleAction('secondary_attack_medium');
  // }
  // if (keys[controls.secondaryAttackHeavy] && player.stateMachine && !player.stateMachine.isInAttackState()) {
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
  //console.log('handleSkillTreeKeys called - currentMenu:', currentMenu, 'keys.t:', keys['t'], 'keys.y:', keys['y'], 'keys.u:', keys['u'], 'keys.i:', keys['i']);

  // Toggle main menu (Escape or 'm')
  if (keys['Escape'] || keys['m']) {
    toggleMenu();
    lastSkillTreeToggleTime = now;
    keys['Escape'] = false;
    keys['m'] = false;
  }

  // Player 1 skill tree (key 5) - 3-tier toggle system
  key5Pressed = keys['5'];
  if (key5Pressed && !key5WasPressed && players.length >= 1) { // Key just pressed
    //console.log('Key 5 pressed - currentMenu:', currentMenu, 'currentSkillTreePlayer:', currentSkillTreePlayer);
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
  key6Pressed = keys['6'];
  if (key6Pressed && !key6WasPressed && players.length >= 2) {
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
  key7Pressed = keys['7'];
  if (key7Pressed && !key7WasPressed && players.length >= 3) {
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
  key8Pressed = keys['8'];
  if (key8Pressed && !key8WasPressed && players.length >= 4) {
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
    keyTPressed = keys['t'] || keys['T'];
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
    keyYPressed = keys['y'] || keys['Y'];
    if (keyYPressed && !keyYWasPressed) {
      if (currentSkillTreePlayer === 1) {
        const nextPage = currentSkillPage === SKILL_PAGES.MAIN ? SKILL_PAGES.SECONDARY : SKILL_PAGES.MAIN;
        switchSkillTreePage(nextPage);
        lastSkillTreeToggleTime = now;
      }
    }
    keyYWasPressed = keyYPressed;

    // Player 3 tab navigation (key u)
    keyUPressed = keys['u'] || keys['U'];
    if (keyUPressed && !keyUWasPressed) {
      if (currentSkillTreePlayer === 2) {
        const nextPage = currentSkillPage === SKILL_PAGES.MAIN ? SKILL_PAGES.SECONDARY : SKILL_PAGES.MAIN;
        switchSkillTreePage(nextPage);
        lastSkillTreeToggleTime = now;
      }
    }
    keyUWasPressed = keyUPressed;

    // Player 4 tab navigation (key i)
    keyIPressed = keys['i'] || keys['I'];
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
  applyScreenBoundaries(player);

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

  // Player 1 character stats (key 9) - toggle player's own stats
  key9Pressed = keys['9'];
  if (key9Pressed && !key9WasPressed && players.length >= 1) { // Key just pressed
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
  key0Pressed = keys['0'];
  if (key0Pressed && !key0WasPressed && players.length >= 2) {
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
  keyMinusPressed = keys['-'];
  if (keyMinusPressed && !keyMinusWasPressed && players.length >= 3) {
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
  keyEqualsPressed = keys['='];
  if (keyEqualsPressed && !keyEqualsWasPressed && players.length >= 4) {
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

  //console.log('[UPDATE] Starting update, menuActive:', menuActive);

  // Ако имаме активно меню, не ъпдейтвай играчите и враговете.
  // Това ефективно "паузира" играта.
  if (!menuActive) {
    // Централизирана обработка на смърт за всички умиращи елементи
    updateDeathSequences(dt);

    // Обновяване на всички играчи
    if (window.gameState) {
      //console.log('[UPDATE] Processing players via game state:', window.gameState.players.length, 'players');
      window.gameState.players.forEach((player, index) => {
        //console.log(`[UPDATE] Processing player at index ${index}:`, player);
        updatePlayer(player, index, dt);
      });

      // Обновяване на всички противници (само живи и не умиращи)
      const enemies = window.gameState.getEntitiesByType('enemy');
      //console.log('[UPDATE] Processing enemies:', enemies.length);
      enemies.forEach(enemy => {
        if (!enemy.isDying) { // Не обновяваме AI за умиращи противници
          updateEnemyAI(enemy, dt);
          // Apply enemy physics (similar to player movement)
          handleEnemyMovement(enemy, dt);
        }
      });

      //console.log('[UPDATE] Game state debug:', window.gameState.getDebugInfo());
    } else {
      // Fallback към старата система за backwards compatibility
      //console.log('[UPDATE] Using legacy system, players:', players.length);
      players.forEach((player, index) => {
        //console.log(`[UPDATE] Processing player at index ${index}:`, player);
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
          console.log(`[ENEMY AI] Enemy attacks with ${randomAttack}`);
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

  // Apply screen boundaries to keep enemy within screen bounds
  applyScreenBoundaries(enemy);

  // Reset velocity after movement (AI will set it again next frame)
  // Keep vx for continuous movement, reset vz
  enemy.vz = 0;
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

// Universal screen boundaries function - keeps all entities within screen bounds
function applyScreenBoundaries(entity) {
  // Horizontal boundaries (X-axis)
  if (entity.x < X_MIN) {
    console.log(`[SCREEN_BOUNDARIES] ${entity.entityType} hit left boundary, clamping X from ${entity.x} to ${X_MIN}`);
    entity.x = X_MIN;
    entity.vx = 0; // Stop horizontal movement
  } else if (entity.x > X_MAX) {
    console.log(`[SCREEN_BOUNDARIES] ${entity.entityType} hit right boundary, clamping X from ${entity.x} to ${X_MAX}`);
    entity.x = X_MAX;
    entity.vx = 0; // Stop horizontal movement
  }

  // Vertical boundaries (Z-axis) - same as before but now universal
  if (entity.z < Z_MIN) {
    console.log(`[SCREEN_BOUNDARIES] ${entity.entityType} hit bottom boundary, clamping Z from ${entity.z} to ${Z_MIN}`);
    entity.z = Z_MIN;
    entity.vz = 0; // Stop vertical movement
  } else if (entity.z > Z_MAX) {
    console.log(`[SCREEN_BOUNDARIES] ${entity.entityType} hit top boundary, clamping Z from ${entity.z} to ${Z_MAX}`);
    entity.z = Z_MAX;
    entity.vz = 0; // Stop vertical movement
  }
}
