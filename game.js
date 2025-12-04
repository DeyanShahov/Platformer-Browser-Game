// Game logic and loop
function updatePlayer(player, playerIndex, dt) {
  player.vx = 0;
  player.vz = 0;

  const inputMode = player.controls.inputMode || 'keyboard';

  if (inputMode === 'keyboard') {
    // Keyboard input only
    if (keys[player.controls.left]) player.vx = -SPEED;
    if (keys[player.controls.right]) player.vx = SPEED;
    if (keys[player.controls.up]) player.vz = Z_SPEED;
    if (keys[player.controls.down]) player.vz = -Z_SPEED;

    if (keys[player.controls.jump] && player.onGround) {
      player.vy = JUMP_FORCE;
      player.onGround = false;
    }

    if (keys[player.controls.attack] && !player.attacking) {
      player.attacking = true;
      player.attackTimer = ATTACK_TIMER;
    }
  } else if (inputMode === 'controller') {
    // Gamepad input only
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[playerIndex];

    if (gamepad) {
      // Left stick horizontal
      if (Math.abs(gamepad.axes[0]) > 0.1) {
        player.vx = gamepad.axes[0] * SPEED;
      }

      // Left stick vertical (for Z movement)
      if (Math.abs(gamepad.axes[1]) > 0.1) {
        player.vz = -gamepad.axes[1] * Z_SPEED;
      }

      // D-pad
      if (gamepad.buttons[12].pressed) player.vz = Z_SPEED; // Up
      if (gamepad.buttons[13].pressed) player.vz = -Z_SPEED; // Down
      if (gamepad.buttons[14].pressed) player.vx = -SPEED; // Left
      if (gamepad.buttons[15].pressed) player.vx = SPEED; // Right

      // Jump (A/X button)
      if (gamepad.buttons[0].pressed && player.onGround) {
        player.vy = JUMP_FORCE;
        player.onGround = false;
      }

      // Attack (B/Circle button)
      if (gamepad.buttons[1].pressed && !player.attacking) {
        player.attacking = true;
        player.attackTimer = ATTACK_TIMER;
      }
    }
  }

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

  // Проверки за атака
  if (player.attacking) {
    player.attackTimer -= dt;
    if (player.attackTimer <= 0) player.attacking = false;

    if (!enemy.hit) {
      const hit = checkHitboxCollision(player, enemy, {
        zTolerance: 20,
        zThickness: 40
      });

      if (hit) enemy.hit = true;
    }
  }
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
