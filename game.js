// Game logic and loop
function updatePlayer(player, playerIndex, dt) {
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

  // Проверка за удар с врага
  if (player.currentAction && isAttackAction(player.currentAction)) {
    if (!enemy.hit) {
      const hit = checkHitboxCollision(player, enemy, {
        zTolerance: 20,
        zThickness: 40
      });

      if (hit) enemy.hit = true;
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

function update(dt) {
  players.forEach((player, index) => updatePlayer(player, index, dt));
}

// Game loop
let last = 0;
function loop(ts) {
  const dt = (ts - last) / 1000;
  last = ts;

  update(dt);
  render();

  requestAnimationFrame(loop);
}
