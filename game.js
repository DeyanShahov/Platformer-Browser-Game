// Game logic and loop
function updatePlayer(player, dt) {
  player.vx = 0;
  player.vz = 0;

  // X движение
  if (keys[player.controls.left]) player.vx = -SPEED;
  if (keys[player.controls.right]) player.vx = SPEED;

  // Check X movement collision
  const proposedX = player.x + player.vx * dt;
  if (!canMoveTo(player, proposedX, player.y, player.z)) {
    player.vx = 0;
  }

  // Z движение (с граници)
  if (keys[player.controls.up]) player.vz = Z_SPEED;
  if (keys[player.controls.down]) player.vz = -Z_SPEED;

  // Опит за движение по Z
  const proposedZ = player.z + player.vz * dt;
  const clampedZ = Math.min(Math.max(proposedZ, Z_MIN), Z_MAX);

  //Check Z movement collision
  if (canMoveTo(player, player.x, player.y, clampedZ)) {
    player.z = clampedZ;
  }

  // Скок
  if (keys[player.controls.jump] && player.onGround) {
    player.vy = JUMP_FORCE;
    player.onGround = false;
  }

  // Атака
  if (keys[player.controls.attack] && !player.attacking) {
    player.attacking = true;
    player.attackTimer = ATTACK_TIMER;
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
  players.forEach(player => updatePlayer(player, dt));
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
