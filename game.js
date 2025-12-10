// Game logic and loop
function updatePlayer(player, playerIndex, dt) {
  console.log('[UPDATE_PLAYER] Called with player:', player, 'index:', playerIndex, 'type:', typeof player);

  // Safety check for undefined/null players
  if (!player || typeof player !== 'object') {
    console.warn('[UPDATE_PLAYER] Invalid player, returning early');
    return;
  }

  console.log('[UPDATE_PLAYER] Player properties - currentAction:', player.currentAction, 'controls:', !!player.controls);

  player.vx = 0;
  player.vz = 0;

  const inputMode = player.controls.inputMode || 'keyboard';

  // Обновяване на таймерите за действията
  player.updateTimers(dt);

  // Движения и действия
  if (inputMode === 'keyboard') {
    handleKeyboardInput(player);
  } else if (inputMode === 'controller') {
    handleControllerInput(player, playerIndex);
  }

  // Физика и колизии
  handleMovement(player, dt);

  // Проверка за удар с врагове
  if (player.currentAction && isAttackAction(player.currentAction)) {
    // Only check for damage if we haven't dealt damage for this attack yet
    if (!player.damageDealt) {
      // Проверка за сблъсък с всички противници
      const enemies = window.gameState ? window.gameState.getEntitiesByType('enemy') : [window.enemy].filter(e => e);

      for (const enemy of enemies) {
        if (!enemy) continue;

        const hit = checkHitboxCollision(player, enemy, {
          zTolerance: 20,
          zThickness: 40
        });

        if (hit) {
          // Use combat system to calculate and apply damage
          const combatEvent = window.combatResolver.resolveAttack(player, enemy, player.currentAction);

          // Add damage number for visual feedback
          if (combatEvent && combatEvent.actualDamage > 0) {
            const damageX = enemy.x + enemy.w / 2;
            const damageY = enemy.y - 10;
            window.damageNumberManager.addDamageNumber(damageX, damageY, combatEvent.actualDamage, combatEvent.damageResult.isCritical);
          }

          // Mark damage as dealt for this attack and set visual hit flag
          player.damageDealt = true;
          enemy.hit = true;
          break; // Само един удар на атака
        }
      }
    }
  }

  // Enemy attacks using the new EnemyCombatManager system
  // Check if any enemy can attack this player
  if (window.enemyCombatManager) {
    const enemies = window.gameState ? window.gameState.getEntitiesByType('enemy') : [window.enemy].filter(e => e);

    for (const enemy of enemies) {
      if (!enemy || !enemy.currentAction || !isAttackAction(enemy.currentAction)) continue;

      // Check collision for enemy attack
      const hit = checkHitboxCollision(enemy, player, {
        zTolerance: 20,
        zThickness: 40
      });

      if (hit && window.enemyCombatManager.canEnemyAttack(enemy)) {
        // Use EnemyCombatManager to perform the attack
        const attackSuccess = window.enemyCombatManager.performEnemyAttack(enemy, player);

        if (attackSuccess) {
          // Add damage number for visual feedback (damage numbers are handled inside resolveAttack)
          // Give experience for taking damage (for testing stats system)
          if (player.characterInfo) {
            player.characterInfo.addExperience(5);
            console.log(`Player ${window.gameState ? window.gameState.players.indexOf(player) + 1 : players.indexOf(player) + 1} gained 5 experience!`);
          }
        }
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

  // Скок
  if (keys[controls.jump] && player.onGround && player.canPerformAction(ACTION_TYPES.JUMP)) {
    logAction(0, 'клавиатура', controls.jump.toUpperCase(), ACTION_TYPES.JUMP);
    player.startAction(ACTION_TYPES.JUMP);
    player.vy = JUMP_FORCE;
    player.onGround = false;
  }

  // Основни атаки
  if (keys[controls.basicAttackLight] && player.canPerformAction(ACTION_TYPES.BASIC_ATTACK_LIGHT)) {
    logAction(0, 'клавиатура', controls.basicAttackLight.toUpperCase(), ACTION_TYPES.BASIC_ATTACK_LIGHT);
    player.startAction(ACTION_TYPES.BASIC_ATTACK_LIGHT);
  }
  if (keys[controls.basicAttackMedium] && player.canPerformAction(ACTION_TYPES.BASIC_ATTACK_MEDIUM)) {
    logAction(0, 'клавиатура', controls.basicAttackMedium.toUpperCase(), ACTION_TYPES.BASIC_ATTACK_MEDIUM);
    player.startAction(ACTION_TYPES.BASIC_ATTACK_MEDIUM);
  }
  if (keys[controls.basicAttackHeavy] && player.canPerformAction(ACTION_TYPES.BASIC_ATTACK_HEAVY)) {
    logAction(0, 'клавиатура', controls.basicAttackHeavy.toUpperCase(), ACTION_TYPES.BASIC_ATTACK_HEAVY);
    player.startAction(ACTION_TYPES.BASIC_ATTACK_HEAVY);
  }

  // Допълнителни атаки
  if (keys[controls.secondaryAttackLight] && player.canPerformAction(ACTION_TYPES.SECONDARY_ATTACK_LIGHT)) {
    logAction(0, 'клавиатура', controls.secondaryAttackLight.toUpperCase(), ACTION_TYPES.SECONDARY_ATTACK_LIGHT);
    player.startAction(ACTION_TYPES.SECONDARY_ATTACK_LIGHT);
  }
  if (keys[controls.secondaryAttackMedium] && player.canPerformAction(ACTION_TYPES.SECONDARY_ATTACK_MEDIUM)) {
    logAction(0, 'клавиатура', controls.secondaryAttackMedium.toUpperCase(), ACTION_TYPES.SECONDARY_ATTACK_MEDIUM);
    player.startAction(ACTION_TYPES.SECONDARY_ATTACK_MEDIUM);
  }
  if (keys[controls.secondaryAttackHeavy] && player.canPerformAction(ACTION_TYPES.SECONDARY_ATTACK_HEAVY)) {
    logAction(0, 'клавиатура', controls.secondaryAttackHeavy.toUpperCase(), ACTION_TYPES.SECONDARY_ATTACK_HEAVY);
    player.startAction(ACTION_TYPES.SECONDARY_ATTACK_HEAVY);
  }
}

// Skill Tree Key Handling (separate function to avoid cluttering player input)
let lastSkillTreeToggleTime = 0; // Timestamp to prevent rapid toggling

// Key press tracking variables for skill trees
let key5Pressed = false;
let key5WasPressed = false;
let key6Pressed = false;
let key6WasPressed = false;
let key7Pressed = false;
let key7WasPressed = false;
let key8Pressed = false;
let key8WasPressed = false;

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

  // Toggle main menu (Escape or 'm')
  if (keys['Escape'] || keys['m']) {
    toggleMenu();
    lastSkillTreeToggleTime = now;
    keys['Escape'] = false;
    keys['m'] = false;
  }

  // Player 1 skill tree (key 5) - toggle player's own menu
  key5Pressed = keys['5'];
  if (key5Pressed && !key5WasPressed && players.length >= 1) { // Key just pressed
    if (currentMenu === 'skills' && currentSkillTreePlayer === 0) {
      // Close if player's own skill tree is open
      hideSkillTree();
    } else if (!menuActive) {
      // Open only if no menu is active
      showSkillTreeForPlayer(0);
    }
    // If another player's skill tree is open, do nothing
    lastSkillTreeToggleTime = now;
  }
  key5WasPressed = key5Pressed;

  // Player 2 skill tree (key 6) - toggle player's own menu
  key6Pressed = keys['6'];
  if (key6Pressed && !key6WasPressed && players.length >= 2) {
    if (currentMenu === 'skills' && currentSkillTreePlayer === 1) {
      // Close if player's own skill tree is open
      hideSkillTree();
    } else if (!menuActive) {
      // Open only if no menu is active
      showSkillTreeForPlayer(1);
    }
    // If another player's skill tree is open, do nothing
    lastSkillTreeToggleTime = now;
  }
  key6WasPressed = key6Pressed;

  // Player 3 skill tree (key 7) - toggle player's own menu
  key7Pressed = keys['7'];
  if (key7Pressed && !key7WasPressed && players.length >= 3) {
    if (currentMenu === 'skills' && currentSkillTreePlayer === 2) {
      // Close if player's own skill tree is open
      hideSkillTree();
    } else if (!menuActive) {
      // Open only if no menu is active
      showSkillTreeForPlayer(2);
    }
    // If another player's skill tree is open, do nothing
    lastSkillTreeToggleTime = now;
  }
  key7WasPressed = key7Pressed;

  // Player 4 skill tree (key 8) - toggle player's own menu
  key8Pressed = keys['8'];
  if (key8Pressed && !key8WasPressed && players.length >= 4) {
    if (currentMenu === 'skills' && currentSkillTreePlayer === 3) {
      // Close if player's own skill tree is open
      hideSkillTree();
    } else if (!menuActive) {
      // Open only if no menu is active
      showSkillTreeForPlayer(3);
    }
    // If another player's skill tree is open, do nothing
    lastSkillTreeToggleTime = now;
  }
  key8WasPressed = key8Pressed;
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

    // Скок
    if (isButtonPressed(gamepad, controls.jump) && player.onGround && player.canPerformAction(ACTION_TYPES.JUMP)) {
      const buttonName = getButtonName(controls.jump);
      logAction(playerIndex, 'контролер', buttonName, ACTION_TYPES.JUMP);
      player.startAction(ACTION_TYPES.JUMP);
      player.vy = JUMP_FORCE;
      player.onGround = false;
    } 

    // Основни атаки
    if (isButtonPressed(gamepad, controls.basicAttackLight) && player.canPerformAction(ACTION_TYPES.BASIC_ATTACK_LIGHT)) {
      const buttonName = getButtonName(controls.basicAttackLight);
      logAction(playerIndex, 'контролер', buttonName, ACTION_TYPES.BASIC_ATTACK_LIGHT);
      player.startAction(ACTION_TYPES.BASIC_ATTACK_LIGHT);
    }
    if (isButtonPressed(gamepad, controls.basicAttackMedium) && player.canPerformAction(ACTION_TYPES.BASIC_ATTACK_MEDIUM)) {
      const buttonName = getButtonName(controls.basicAttackMedium);
      logAction(playerIndex, 'контролер', buttonName, ACTION_TYPES.BASIC_ATTACK_MEDIUM);
      player.startAction(ACTION_TYPES.BASIC_ATTACK_MEDIUM);
    }
    if (isButtonPressed(gamepad, controls.basicAttackHeavy) && player.canPerformAction(ACTION_TYPES.BASIC_ATTACK_HEAVY)) {
      const buttonName = getButtonName(controls.basicAttackHeavy);
      logAction(playerIndex, 'контролер', buttonName, ACTION_TYPES.BASIC_ATTACK_HEAVY);
      player.startAction(ACTION_TYPES.BASIC_ATTACK_HEAVY);
    }

    // Допълнителни атаки
    if (isButtonPressed(gamepad, controls.secondaryAttackLight) && player.canPerformAction(ACTION_TYPES.SECONDARY_ATTACK_LIGHT)) {
      const buttonName = getButtonName(controls.secondaryAttackLight);
      logAction(playerIndex, 'контролер', buttonName, ACTION_TYPES.SECONDARY_ATTACK_LIGHT);
      player.startAction(ACTION_TYPES.SECONDARY_ATTACK_LIGHT);
    }
    if (isButtonPressed(gamepad, controls.secondaryAttackMedium) && player.canPerformAction(ACTION_TYPES.SECONDARY_ATTACK_MEDIUM)) {
      const buttonName = getButtonName(controls.secondaryAttackMedium);
      logAction(playerIndex, 'контролер', buttonName, ACTION_TYPES.SECONDARY_ATTACK_MEDIUM);
      player.startAction(ACTION_TYPES.SECONDARY_ATTACK_MEDIUM);
    }
    if (isButtonPressed(gamepad, controls.secondaryAttackHeavy) && player.canPerformAction(ACTION_TYPES.SECONDARY_ATTACK_HEAVY)) {
      const buttonName = getButtonName(controls.secondaryAttackHeavy);
      logAction(playerIndex, 'контролер', buttonName, ACTION_TYPES.SECONDARY_ATTACK_HEAVY);
      player.startAction(ACTION_TYPES.SECONDARY_ATTACK_HEAVY);
    }
  }
}

// Обработка на движение и колизии
function handleMovement(player, dt) {
  // Check X movement collision
  const proposedX = player.x + player.vx * dt;
  if (!canMoveTo(player, proposedX, player.y, player.z)) {
    player.vx = 0;
  }

  // Опит за движение по Z
  const proposedZ = player.z + player.vz * dt;
  const clampedZ = Math.min(Math.max(proposedZ, Z_MIN), Z_MAX);

  //Check Z movement collision
  if (canMoveTo(player, player.x, player.y, clampedZ)) {
    player.z = clampedZ;
  }

  // Реално движение X
  player.x += player.vx * dt;

  // Гравитация
  player.vy += GRAVITY * dt;
  player.y += player.vy * dt;

  // Земя
  if (player.y >= CANVAS_HEIGHT - 100) {
    player.y = CANVAS_HEIGHT - 100;
    player.vy = 0;
    player.onGround = true;
  }
}

// Проверка дали действието е атака
function isAttackAction(actionType) {
  return actionType !== ACTION_TYPES.JUMP;
}

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
    [ACTION_TYPES.JUMP]: 'скок',
    [ACTION_TYPES.BASIC_ATTACK_LIGHT]: 'основна лека атака',
    [ACTION_TYPES.BASIC_ATTACK_MEDIUM]: 'основна средна атака',
    [ACTION_TYPES.BASIC_ATTACK_HEAVY]: 'основна тежка атака',
    [ACTION_TYPES.SECONDARY_ATTACK_LIGHT]: 'допълнителна лека атака',
    [ACTION_TYPES.SECONDARY_ATTACK_MEDIUM]: 'допълнителна средна атака',
    [ACTION_TYPES.SECONDARY_ATTACK_HEAVY]: 'допълнителна тежка атака'
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

  console.log('[UPDATE] Starting update, menuActive:', menuActive);

  // Ако имаме активно меню, не ъпдейтвай играчите и враговете.
  // Това ефективно "паузира" играта.
  if (!menuActive) {
    // Централизирана обработка на смърт за всички умиращи елементи
    updateDeathSequences(dt);

    // Обновяване на всички играчи
    if (window.gameState) {
      console.log('[UPDATE] Processing players via game state:', window.gameState.players.length, 'players');
      window.gameState.players.forEach((player, index) => {
        console.log(`[UPDATE] Processing player at index ${index}:`, player);
        updatePlayer(player, index, dt);
      });

      // Обновяване на всички противници (само живи и не умиращи)
      const enemies = window.gameState.getEntitiesByType('enemy');
      console.log('[UPDATE] Processing enemies:', enemies.length);
      enemies.forEach(enemy => {
        if (!enemy.isDying) { // Не обновяваме AI за умиращи противници
          updateEnemyAI(enemy, dt);
        }
      });

      console.log('[UPDATE] Game state debug:', window.gameState.getDebugInfo());
    } else {
      // Fallback към старата система за backwards compatibility
      console.log('[UPDATE] Using legacy system, players:', players.length);
      players.forEach((player, index) => {
        console.log(`[UPDATE] Processing player at index ${index}:`, player);
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
    // Simple AI: randomly attack every few seconds
    if (Math.random() < 0.01) { // 1% chance per frame to attack
      if (!enemy.currentAction) {
        const attackTypes = [
          ACTION_TYPES.BASIC_ATTACK_LIGHT,
          ACTION_TYPES.BASIC_ATTACK_MEDIUM,
          ACTION_TYPES.BASIC_ATTACK_HEAVY,
          ACTION_TYPES.SECONDARY_ATTACK_LIGHT,
          ACTION_TYPES.SECONDARY_ATTACK_MEDIUM,
          ACTION_TYPES.SECONDARY_ATTACK_HEAVY
        ];
        const randomAttack = attackTypes[Math.floor(Math.random() * attackTypes.length)];
        enemy.currentAction = randomAttack;
        enemy.executionTimer = EXECUTION_TIMERS[randomAttack] || 0.5;
        console.log(`Enemy ${enemy.id} attacks with ${getActionDisplayName(randomAttack)}`);
      }
    }

    // Update enemy action timer
    if (enemy.currentAction) {
      if (enemy.executionTimer > 0) {
        enemy.executionTimer -= dt;
        if (enemy.executionTimer <= 0) {
          enemy.currentAction = null;
          enemy.executionTimer = 0;
        }
      } else {
        enemy.currentAction = null;
        enemy.executionTimer = 0;
      }
    }
  }

  // Reset hit flag after a short time
  if (enemy.hit) {
    enemy.hit = false;
  }
}

// Централизирана обработка на смърт за всички умиращи елементи
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
  render();

  // Update damage numbers
  if (window.damageNumberManager) {
    window.damageNumberManager.update(dt);
  }

  // Update enemy combat manager (attack cooldowns)
  if (window.enemyCombatManager) {
    window.enemyCombatManager.updateCooldowns(dt);
  }

  requestAnimationFrame(loop);
}
