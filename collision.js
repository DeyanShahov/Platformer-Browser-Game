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
  return checkCollision(attacker.x, attacker.y, attacker.z, attacker.w, attacker.h,
                        target.x, target.y, target.z, target.w, target.h, params);
}

function canMoveTo(entity, proposedX, proposedY, proposedZ) {
  const others = [enemy, ally].filter(e => e !== entity);
  for (const other of others) {
    if (checkCollision(proposedX, proposedY, proposedZ, entity.w, entity.h,
                      other.x, other.y, other.z, other.w, other.h,
                      { zTolerance: 10, zThickness: 0 })) {
      return false;
    }
  }
  return true;
}
