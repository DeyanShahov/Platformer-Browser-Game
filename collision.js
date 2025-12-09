// Collision detection logic
function checkCollision(ax, ay, az, aw, ah, tx, ty, tz, tw, th, params) {
  const { zTolerance, zThickness } = params;

  const dz = Math.abs(az - tz);
  if (dz > zThickness + zTolerance) return false;

  const ax1 = ax;
  const ay1 = ay;
  const ax2 = ax + aw;
  const ay2 = ay + ah;

  const bx1 = tx;
  const by1 = ty;
  const bx2 = tx + tw;
  const by2 = ty + th;

  const overlap = ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1;
  return overlap;
}

function checkHitboxCollision(attacker, target, params) {
  // Основни атаки - само дясната страна
  if (attacker.currentAction === ACTION_TYPES.BASIC_ATTACK_LIGHT) {
    // Лека основна атака: 1 черта вдясно
    return checkCollision(
      attacker.x + attacker.w + 5, attacker.y, attacker.z,  // позиция
      2, attacker.h,  // размер (тънка вертикална линия)
      target.x, target.y, target.z, target.w, target.h,
      params
    );
  } else if (attacker.currentAction === ACTION_TYPES.BASIC_ATTACK_MEDIUM) {
    // Средна основна атака: 2 черти вдясно
    return checkCollision(
      attacker.x + attacker.w + 5, attacker.y, attacker.z,  // позиция
      15, attacker.h,  // размер (по-широка област)
      target.x, target.y, target.z, target.w, target.h,
      params
    );
  } else if (attacker.currentAction === ACTION_TYPES.BASIC_ATTACK_HEAVY) {
    // Тежка основна атака: 3 черти вдясно
    return checkCollision(
      attacker.x + attacker.w + 5, attacker.y, attacker.z,  // позиция
      25, attacker.h,  // размер (най-широка област)
      target.x, target.y, target.z, target.w, target.h,
      params
    );
  }

  // Допълнителни атаки - около целия герой
  else if (attacker.currentAction === ACTION_TYPES.SECONDARY_ATTACK_LIGHT) {
    // Лека допълнителна атака: единично очертание
    return checkCollision(attacker.x, attacker.y, attacker.z, attacker.w, attacker.h,
                          target.x, target.y, target.z, target.w, target.h, params);
  } else if (attacker.currentAction === ACTION_TYPES.SECONDARY_ATTACK_MEDIUM) {
    // Средна допълнителна атака: двойно очертание (по-голям хитбокс)
    return checkCollision(attacker.x - 10, attacker.y - 10, attacker.z,
                          attacker.w + 20, attacker.h + 20,
                          target.x, target.y, target.z, target.w, target.h, params);
  } else if (attacker.currentAction === ACTION_TYPES.SECONDARY_ATTACK_HEAVY) {
    // Тежка допълнителна атака: тройно очертание (най-голям хитбокс)
    return checkCollision(attacker.x - 20, attacker.y - 20, attacker.z,
                          attacker.w + 40, attacker.h + 40,
                          target.x, target.y, target.z, target.w, target.h, params);
  }

  // По подразбиране - няма колизия
  return false;
}

function canMoveTo(entity, proposedX, proposedY, proposedZ) {
  const others = [...players, window.enemy, window.ally].filter(e => e !== entity && e !== null && e !== undefined);
  for (const other of others) {
    if (checkCollision(proposedX, proposedY, proposedZ, entity.w, entity.h,
                      other.x, other.y, other.z, other.w, other.h,
                      { zTolerance: 10, zThickness: 0 })) {
      return false;
    }
  }
  return true;
}
