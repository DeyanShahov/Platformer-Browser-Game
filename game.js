// Game logic and loop
function update(dt) {
  hero.vx = 0;
  hero.vz = 0; // ВАЖНО – нулираме преди нов вход

  // X движение
  if (keys[controls.left]) hero.vx = -SPEED;
  if (keys[controls.right]) hero.vx = SPEED;

  // Check X movement collision
  const proposedX = hero.x + hero.vx * dt;
  if (!canMoveTo(hero, proposedX, hero.y, hero.z)) {
    hero.vx = 0;
  }

  // Z движение (с граници)
  if (keys[controls.up]) hero.vz = Z_SPEED;
  if (keys[controls.down]) hero.vz = -Z_SPEED;

  // Опит за движение по Z
  const proposedZ = hero.z + hero.vz * dt;

  const clampedZ = Math.min(Math.max(proposedZ, Z_MIN), Z_MAX);

  //Check Z movement collision
  if (canMoveTo(hero, hero.x, hero.y, clampedZ)) {
    hero.z = clampedZ;
  }

  // Скок
  if (keys[controls.jump] && hero.onGround) {
    hero.vy = JUMP_FORCE;
    hero.onGround = false;
  }

  // Атака
  if (keys[controls.attack] && !hero.attacking) {
    hero.attacking = true;
    hero.attackTimer = ATTACK_TIMER;
  }

  // Реално движение X
  hero.x += hero.vx * dt;

  // Гравитация
  hero.vy += GRAVITY * dt;
  hero.y += hero.vy * dt;

  // Земя
  if (hero.y >= CANVAS_HEIGHT - 100) {
    hero.y = CANVAS_HEIGHT - 100;
    hero.vy = 0;
    hero.onGround = true;
  }

  // Проверки за атака
  if (hero.attacking) {
    hero.attackTimer -= dt;
    if (hero.attackTimer <= 0) hero.attacking = false;

    if (!enemy.hit) {
      const hit = checkHitboxCollision(hero, enemy, {
        zTolerance: 20,
        zThickness: 40
      });

      if (hit) enemy.hit = true;
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

  requestAnimationFrame(loop);
}
