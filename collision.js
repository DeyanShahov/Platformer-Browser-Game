// Collision detection logic
function checkCollision(ax, ay, az, aw, ah, azThickness, tx, ty, tz, tw, th, tzThickness, zTolerance) {
  // Calculate effective Z thickness (sum of both objects' thicknesses)
  const effectiveZThickness = azThickness + tzThickness;

  const dz = Math.abs(az - tz);
  if (dz > effectiveZThickness + zTolerance) return false;

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
  // Only log when attacker is actually in attack state to reduce spam
  // Only log player attacks, not enemy attacks to avoid console spam
  const isAttackerAttacking = attacker.stateMachine && attacker.stateMachine.isInAttackState();
  const isPlayerAttacking = isAttackerAttacking && attacker.entityType !== 'enemy';
  if (isPlayerAttacking) {
    console.log(`[COLLISION] checkHitboxCollision: ${attacker?.entityType} attacking ${target?.entityType}`);
  }

  // Check FSM-based attacks first (new system)
  if (attacker.stateMachine && attacker.animation) {
    const currentFrame = attacker.animation.currentFrame;
    const animationDef = attacker.animation.animationDefinition;

    // Check if current animation has per-frame collision data
    if (animationDef && animationDef.frameData && animationDef.frameData[currentFrame]) {
      const frameData = animationDef.frameData[currentFrame];

      // Check if this frame has an attack box (only damage when attack box is active)
      if (frameData.attackBox) {
        // Use centralized box position calculation from AnimationRenderer
        if (window.animationSystem && window.animationSystem.renderer) {
          const attackBoxPos = window.animationSystem.renderer.calculateBoxPosition(attacker, frameData.attackBox, 'attack');

          // Get target's hit box position (per-frame if available, otherwise static)
          let targetHitBox;

          // Check if target has per-frame hit box data
          if (target.animation && target.animation.animationDefinition) {
            const targetFrame = target.animation.currentFrame;
            const targetAnimationDef = target.animation.animationDefinition;
            if (targetAnimationDef.frameData && targetAnimationDef.frameData[targetFrame] && targetAnimationDef.frameData[targetFrame].hitBox) {
              // Use per-frame hit box data
              targetHitBox = window.animationSystem.renderer.calculateBoxPosition(target, targetAnimationDef.frameData[targetFrame].hitBox, 'hit');
            } else {
              // Use static hit box positioned like animation system
              const zOffset = target.z * 1.0;
              const drawX = target.x;
              const drawY = target.y - target.h - zOffset;
              targetHitBox = {
                x: drawX,
                y: drawY + target.h - (target.collisionH || target.h),
                width: target.collisionW || target.w,
                height: target.collisionH || target.h
              };
            }
          } else {
            // Fallback for entities without animation system - use static collision box
            const zOffset = target.z * 1.0;
            const drawX = target.x;
            const drawY = target.y - target.h - zOffset;
            targetHitBox = {
              x: drawX,
              y: drawY + target.h - (target.collisionH || target.h),
              width: target.collisionW || target.w,
              height: target.collisionH || target.h
            };
          }

          // Check collision between attack box and target's hit box
          const collisionResult = checkCollision(
            attackBoxPos.x, attackBoxPos.y, attacker.z,
            attackBoxPos.width, attackBoxPos.height, attacker.zThickness || 0,
            targetHitBox.x, targetHitBox.y, target.z,
            targetHitBox.width, targetHitBox.height, target.zThickness || 0,
            params.zTolerance || 10
          );

          // Only log successful hits to reduce spam
          if (isAttackerAttacking && collisionResult) {
            console.log(`[COLLISION] HIT DETECTED on frame ${currentFrame}!`);
            console.log(`[COLLISION] Attack box: x=${attackBoxPos.x.toFixed(1)}, y=${attackBoxPos.y.toFixed(1)}, w=${attackBoxPos.width}, h=${attackBoxPos.height}`);
            console.log(`[COLLISION] Target hit box: x=${targetHitBox.x.toFixed(1)}, y=${targetHitBox.y.toFixed(1)}, w=${targetHitBox.width}, h=${targetHitBox.height}`);
          }

          return collisionResult;
        }
      }
    }
  }

  // No collision detected
  return false;
}

function canMoveTo(entity, proposedX, proposedY, proposedZ) {
  // Използвай game state система или fallback към старата за backwards compatibility
  const allEntities = window.gameState ? window.gameState.getAllEntities() :
                     [...players, window.enemy, window.ally].filter(e => e !== null && e !== undefined);

  // Филтрирай само други елементи (не текущия)
  const others = allEntities.filter(e => e !== entity && e !== null && e !== undefined);

  // Use collision dimensions for player, visual dimensions for others
  const entityW = entity.collisionW || entity.w;
  const entityH = entity.collisionH || entity.h;

  for (const other of others) {
    // Use collision dimensions for other player entities too
    const otherW = other.collisionW || other.w;
    const otherH = other.collisionH || other.h;

    if (checkCollision(proposedX, proposedY, proposedZ, entityW, entityH, entity.zThickness || 0,
                      other.x, other.y, other.z, otherW, otherH, other.zThickness || 0,
                      30)) {  // zTolerance for movement
      return false; // Има колизия - не може да се движи
    }
  }
  return true; // Няма колизия - може да се движи
}
