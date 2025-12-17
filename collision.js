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
  //const isAttackerAttacking = attacker.stateMachine && attacker.stateMachine.isInAttackState();
  // if (isAttackerAttacking) {
  //   console.log(`[COLLISION] checkHitboxCollision: ${attacker?.entityType} attacking ${target?.entityType}`);
  // }

  // Check FSM-based attacks first (new system)
  if (attacker.stateMachine && attacker.animation) {
    const currentFrame = attacker.animation.currentFrame;
    const animationDef = attacker.animation.animationDefinition;

    // Check if current animation has per-frame collision data
    if (animationDef && animationDef.frameData && animationDef.frameData[currentFrame]) {
      const frameData = animationDef.frameData[currentFrame];

      // Check if this frame has an attack box
      if (frameData.attackBox) {
        // Use centralized box position calculation from AnimationRenderer
        if (window.animationSystem && window.animationSystem.renderer) {
          const attackBoxPos = window.animationSystem.renderer.calculateBoxPosition(attacker, frameData.attackBox, 'attack');

          // Get target's hit box position (per-frame if available, otherwise static)
          let targetHitBox = {
            x: target.x,
            y: target.y,
            width: target.collisionW || target.w,
            height: target.collisionH || target.h
          };

          // Check if target has per-frame hit box data
          if (target.animation && target.animation.animationDefinition) {
            const targetFrame = target.animation.currentFrame;
            const targetAnimationDef = target.animation.animationDefinition;
            if (targetAnimationDef.frameData && targetAnimationDef.frameData[targetFrame] && targetAnimationDef.frameData[targetFrame].hitBox) {
              targetHitBox = window.animationSystem.renderer.calculateBoxPosition(target, targetAnimationDef.frameData[targetFrame].hitBox, 'hit');
            }
          }

          // if (isAttackerAttacking) {
          //   console.log(`[COLLISION] Frame ${currentFrame} attack box:`, attackBoxPos);
          //   console.log(`[COLLISION] Target hit box:`, targetHitBox);
          // }

          // Check collision between attack box and target's hit box
          const collisionResult = checkCollision(
            attackBoxPos.x, attackBoxPos.y, attacker.z,
            attackBoxPos.width, attackBoxPos.height, attacker.zThickness || 0,
            targetHitBox.x, targetHitBox.y, target.z,
            targetHitBox.width, targetHitBox.height, target.zThickness || 0,
            params.zTolerance || 10
          );

          // if (isAttackerAttacking && collisionResult) {
          //   console.log(`[COLLISION] HIT DETECTED!`);
          // }

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
