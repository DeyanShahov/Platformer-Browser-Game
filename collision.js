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

// Unified attack collision function - MOVED TO game.js (contains game logic)

// ===========================================
// UNIFIED COLLISION SYSTEM
// ===========================================

// Helper function to get current per-frame hit box dimensions (for calculateBoxPosition)
function getCurrentHitBoxDimensions(entity) {
  if (!entity.animation || !entity.animation.animationDefinition) {
    return null; // No animation system - use static dimensions
  }

  const currentFrame = entity.animation.currentFrame;
  const animationDef = entity.animation.animationDefinition;

  // Check if current animation frame has hit box data
  if (animationDef.frameData && animationDef.frameData[currentFrame] && animationDef.frameData[currentFrame].hitBox) {
    return animationDef.frameData[currentFrame].hitBox;
  }

  return null; // No per-frame data - use static dimensions
}

// Helper function to get current per-frame hit box position and dimensions (for unified collision)
function getCurrentHitBoxPosition(entity) {
  const hitBoxData = getCurrentHitBoxDimensions(entity);
  if (!hitBoxData) return null;

  // Calculate hit box position the same way as AnimationRenderer
  const zOffset = entity.z * 1.0;
  const drawX = entity.x;
  const drawY = entity.y - entity.h - zOffset;

  let boxX, boxY;

  // Position relative to sprite coordinates (same as AnimationRenderer)
  boxX = drawX + hitBoxData.x;
  boxY = drawY + entity.h/2 - hitBoxData.y;

  return {
    x: boxX,
    y: boxY,
    width: hitBoxData.width,
    height: hitBoxData.height
  };
}

// Main unified collision function
function checkEntityCollision(entity1, entity2, collisionType, params = {}) {
  const defaults = {
    zTolerance: collisionType === 'movement' ? 30 : 10,
    buffer: collisionType === 'movement' ? 8 : 0, // Allow larger overlap for movement to prevent sticking
    entity1Pos: { x: entity1.x, y: entity1.y, z: entity1.z }, // Allow custom position for entity1
    logCollisions: collisionType === 'movement' // Log movement collisions, not attacks
  };

  const config = { ...defaults, ...params };

  // Get collision dimensions and positions - prioritize per-frame hit boxes over static dimensions
  const e1HitBox = getCurrentHitBoxPosition(entity1);
  const e2HitBox = getCurrentHitBoxPosition(entity2);

  // Calculate positions for collision check
  let e1X, e1Y, e1Z, e1W, e1H;
  let e2X, e2Y, e2Z, e2W, e2H;

  if (e1HitBox) {
    // Use per-frame hit box position and dimensions
    // Adjust hit box position for proposed movement
    const xOffset = config.entity1Pos.x - entity1.x; // Movement offset
    const yOffset = config.entity1Pos.y - entity1.y;
    const zOffset = config.entity1Pos.z - entity1.z;

    e1X = e1HitBox.x + xOffset;
    e1Y = e1HitBox.y + yOffset;
    e1Z = config.entity1Pos.z;
    e1W = e1HitBox.width;
    e1H = e1HitBox.height;
  } else {
    // Use static dimensions
    e1X = config.entity1Pos.x;
    e1Y = config.entity1Pos.y;
    e1Z = config.entity1Pos.z;
    e1W = entity1.collisionW || entity1.w;
    e1H = entity1.collisionH || entity1.h;
  }

  if (e2HitBox) {
    // Use per-frame hit box for entity2
    e2X = e2HitBox.x;
    e2Y = e2HitBox.y;
    e2Z = entity2.z;
    e2W = e2HitBox.width;
    e2H = e2HitBox.height;
  } else {
    // Use static dimensions for entity2
    e2X = entity2.x;
    e2Y = entity2.y;
    e2Z = entity2.z;
    e2W = entity2.collisionW || entity2.w;
    e2H = entity2.collisionH || entity2.h;
  }

  // Check collision with buffer for movement
  const hasCollision = checkCollisionWithBuffer(
    e1X, e1Y, e1Z, e1W, e1H, entity1.zThickness || 0,
    e2X, e2Y, e2Z, e2W, e2H, entity2.zThickness || 0,
    config.zTolerance, config.buffer
  );

  // if (hasCollision && config.logCollisions) {
  //   console.log(`[COLLISION] ${collisionType.toUpperCase()} blocked: ${entity1.entityType} vs ${entity2.entityType}`);
  //   console.log(`[COLLISION] ${entity1.entityType} at (${e1X.toFixed(1)}, ${e1Y.toFixed(1)}) ${e1W}x${e1H}`);
  //   console.log(`[COLLISION] ${entity2.entityType} at (${e2X.toFixed(1)}, ${e2Y.toFixed(1)}) ${e2W}x${e2H}`);
  // }

  // Special logging for ally collisions to debug the issue
  // if ((entity1.entityType === 'player' && entity2.entityType === 'ally') ||
  //     (entity1.entityType === 'ally' && entity2.entityType === 'player')) {
  //   console.log(`[ALLY COLLISION DEBUG] Player-Ally collision check:`);
  //   console.log(`[ALLY COLLISION DEBUG] Player: pos(${entity1.x.toFixed(1)}, ${entity1.y.toFixed(1)}, ${entity1.z.toFixed(1)}) collision(${entity1.collisionW || entity1.w}x${entity1.collisionH || entity1.h})`);
  //   console.log(`[ALLY COLLISION DEBUG] Ally: pos(${entity2.x.toFixed(1)}, ${entity2.y.toFixed(1)}, ${entity2.z.toFixed(1)}) size(${entity2.w}x${entity2.h})`);
  //   console.log(`[ALLY COLLISION DEBUG] Collision result: ${hasCollision}`);
  //   console.log(`[ALLY COLLISION DEBUG] Z difference: ${Math.abs(entity1.z - entity2.z)}, Z tolerance: 30`);
  // }

  return hasCollision;
}

// Enhanced collision check with buffer support
function checkCollisionWithBuffer(ax, ay, az, aw, ah, azThickness, tx, ty, tz, tw, th, tzThickness, zTolerance, buffer = 0) {
  // Z collision check (unchanged)
  const effectiveZThickness = azThickness + tzThickness;
  const dz = Math.abs(az - tz);
  if (dz > effectiveZThickness + zTolerance) return false;

  // X/Y collision with buffer
  const ax1 = ax + buffer; // Shrink entity1 box by buffer
  const ay1 = ay + buffer;
  const ax2 = ax + aw - buffer;
  const ay2 = ay + ah - buffer;

  const bx1 = tx;
  const by1 = ty;
  const bx2 = tx + tw;
  const by2 = ty + th;

  const overlap = ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1;
  return overlap;
}

// Collision correction function - allows animations but corrects position
function applyCollisionCorrection(entity, proposedX, proposedY, proposedZ, axis, options = {}) {
  const buffer = options.buffer || 0; // Allow custom buffer for AI vs player movement
  // Get all other entities
  const allEntities = window.gameState ? window.gameState.getAllEntities() :
                     [...players, window.enemy, window.ally].filter(e => e !== null && e !== undefined);
  const others = allEntities.filter(e => e !== entity && e !== null && e !== undefined);

  //console.log(`[COLLISION_CORRECTION] Checking ${entity.entityType} movement on ${axis}-axis. Others: ${others.length}`);

  // Check collision with each other entity
  for (const other of others) {
    const hasCollision = checkEntityCollision(
      entity, other, 'movement',
      {
        entity1Pos: { x: proposedX, y: proposedY, z: proposedZ },
        buffer: 0 // No buffer for precise collision correction
      }
    );

    if (hasCollision) {
      console.log(`[COLLISION CORRECTION] ${entity.entityType} correcting position on ${axis}-axis`);

      // Calculate correction based on collision direction
      if (axis === 'x') {
        // For X-axis collision, find the closest valid position
        const entityHitBox = getCurrentHitBoxPosition(entity);
        const otherHitBox = getCurrentHitBoxPosition(other);

        if (entityHitBox && otherHitBox) {
          // Calculate the proposed hit box position
          const proposedOffset = proposedX - entity.x;
          const proposedHitBoxX = entityHitBox.x + proposedOffset;

          // Determine which side of the collision we should correct to
          const proposedCenter = proposedHitBoxX + entityHitBox.width / 2;
          const otherCenter = otherHitBox.x + otherHitBox.width / 2;

          // Calculate overlap between hit boxes (Separation Vector approach)
          const entityLeft = proposedHitBoxX;
          const entityRight = proposedHitBoxX + entityHitBox.width;
          const entityTop = entityHitBox.y;
          const entityBottom = entityHitBox.y + entityHitBox.height;

          const otherLeft = otherHitBox.x;
          const otherRight = otherHitBox.x + otherHitBox.width;
          const otherTop = otherHitBox.y;
          const otherBottom = otherHitBox.y + otherHitBox.height;

          // Calculate overlap on X axis
          const overlapX = Math.min(entityRight, otherRight) - Math.max(entityLeft, otherLeft);
          const overlapY = Math.min(entityBottom, otherBottom) - Math.max(entityTop, otherTop);

          console.log(`[COLLISION_CORRECTION] Overlap X: ${overlapX.toFixed(1)}, Y: ${overlapY.toFixed(1)}`);

          // If there's actual overlap, calculate separation
          if (overlapX > 0 && overlapY > 0) {
            // Determine separation direction based on centers
            const entityCenterX = proposedHitBoxX + entityHitBox.width / 2;
            const otherCenterX = otherHitBox.x + otherHitBox.width / 2;

            // Calculate separation distance (split overlap equally)
            const separationX = overlapX / 2 + 1; // +1 pixel buffer to prevent sticking

            if (entityCenterX < otherCenterX) {
              // Entity is to the left, push it further left
              const correctedHitBoxX = proposedHitBoxX - separationX;
              const correctedEntityX = entity.x + (correctedHitBoxX - entityHitBox.x);
              console.log(`[COLLISION_CORRECTION] Separation vector: push left by ${separationX.toFixed(1)}px`);
              console.log(`[COLLISION_CORRECTION] Correcting X from ${proposedX.toFixed(1)} to ${correctedEntityX.toFixed(1)}`);
              return correctedEntityX;
            } else {
              // Entity is to the right, push it further right
              const correctedHitBoxX = proposedHitBoxX + separationX;
              const correctedEntityX = entity.x + (correctedHitBoxX - entityHitBox.x);
              console.log(`[COLLISION_CORRECTION] Separation vector: push right by ${separationX.toFixed(1)}px`);
              console.log(`[COLLISION_CORRECTION] Correcting X from ${proposedX.toFixed(1)} to ${correctedEntityX.toFixed(1)}`);
              return correctedEntityX;
            }
          } else {
            console.log(`[COLLISION_CORRECTION] No overlap detected, allowing movement`);
            return proposedX;
          }
        }
      }

      // For now, return current position if we can't determine correction
      console.log(`[COLLISION CORRECTION] Returning current position (correction failed)`);
      return entity.x;
    }
  }

  // No collision, return proposed position
  return proposedX;
}

// ===========================================
// COLLISION FUNCTIONS MOVED FROM game.js
// ===========================================

// Unified attack collision function (moved from game.js - contains game logic)
function checkHitboxCollision(attacker, target, params) {
  // Only log when attacker is actually in attack state to reduce spam
  const isAttackerAttacking = attacker.stateMachine && attacker.stateMachine.isInAttackState();
  const isPlayerAttacking = isAttackerAttacking && attacker.entityType !== 'enemy';
  // if (isPlayerAttacking) {
  //   console.log(`[COLLISION] checkHitboxCollision: ${attacker?.entityType} attacking ${target?.entityType}`);
  // }

  // Check FSM-based attacks using unified collision system
  if (attacker.stateMachine && attacker.animation) {
    const currentFrame = attacker.animation.currentFrame;
    const animationDef = attacker.animation.animationDefinition;

    // Check if current animation has per-frame collision data
    if (animationDef && animationDef.frameData && animationDef.frameData[currentFrame]) {
      const frameData = animationDef.frameData[currentFrame];

      // Check if this frame has an attack box (only damage when attack box is active)
      if (frameData.attackBox) {
        // Calculate attack box position accounting for facing direction
        let attackBoxPos;
        if (window.animationSystem && window.animationSystem.renderer) {
          attackBoxPos = window.animationSystem.renderer.calculateBoxPosition(attacker, frameData.attackBox, 'attack');

          // Adjust attack box position based on facing direction
          // When facing left, the attack box needs to be mirrored
          if (attacker.animation && attacker.animation.facingDirection === 'left') {
            // Calculate the center of the entity for mirroring
            const entityCenterX = attacker.x + attacker.collisionW / 2;

            // Mirror the attack box around the entity center
            const distanceFromCenter = attackBoxPos.x + attackBoxPos.width / 2 - entityCenterX;
            const mirroredCenterX = entityCenterX - distanceFromCenter;

            attackBoxPos = {
              x: mirroredCenterX - attackBoxPos.width / 2,
              y: attackBoxPos.y,
              width: attackBoxPos.width,
              height: attackBoxPos.height
            };
          }
        }

        // Get target's hit box position and dimensions (prioritize per-frame data)
        let targetHitBox;
        const targetHitBoxData = getCurrentHitBoxDimensions(target);

        if (targetHitBoxData) {
          // Use per-frame hit box data from animation system
          targetHitBox = window.animationSystem.renderer.calculateBoxPosition(target, targetHitBoxData, 'hit');
        } else {
          // Fallback for entities without per-frame data
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

        // Use unified collision system for attack collision (no buffer, precise collision)
        const collisionResult = checkCollisionWithBuffer(
          attackBoxPos.x, attackBoxPos.y, attacker.z,
          attackBoxPos.width, attackBoxPos.height, attacker.zThickness || 0,
          targetHitBox.x, targetHitBox.y, target.z,
          targetHitBox.width, targetHitBox.height, target.zThickness || 0,
          params.zTolerance || 10, 0 // No buffer for attacks
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

  return false;
}

// Helper function to get current per-frame hit box dimensions (for calculateBoxPosition)
function getCurrentHitBoxDimensions(entity) {
  if (!entity.animation || !entity.animation.animationDefinition) {
    return null; // No animation system - use static dimensions
  }

  const currentFrame = entity.animation.currentFrame;
  const animationDef = entity.animation.animationDefinition;

  // Check if current animation frame has hit box data
  if (animationDef.frameData && animationDef.frameData[currentFrame] && animationDef.frameData[currentFrame].hitBox) {
    return animationDef.frameData[currentFrame].hitBox;
  }

  return null; // No per-frame data - use static dimensions
}

// Legacy movement collision function (moved from game.js)
function canMoveTo(entity, proposedX, proposedY, proposedZ) {
  // Get all other entities
  const allEntities = window.gameState ? window.gameState.getAllEntities() :
                     [...players, window.enemy, window.ally].filter(e => e !== null && e !== undefined);
  const others = allEntities.filter(e => e !== entity && e !== null && e !== undefined);

  // Check collision with each other entity using unified system
  for (const other of others) {
    const hasCollision = checkEntityCollision(
      entity, other, 'movement',
      {
        entity1Pos: { x: proposedX, y: proposedY, z: proposedZ },
        buffer: 2 // Small buffer for smoother movement
      }
    );

    if (hasCollision) {
      return false; // Movement blocked
    }
  }

  return true; // Movement allowed
}

// Behavior constraints function - determines which behaviors are physically possible
// Now uses centralized enemy AI utilities for consistency
function getBehaviorConstraints(entity) {
  const constraints = {
    allowed: new Set(['idle', 'attack', 'chase']), // Always allowed
    blocked: new Set(),
    reasons: {}
  };

  // Use centralized constants
  const config = window.enemyAIConfig?.CONSTANTS || {};
  const btCheckDistanceX = config.BT_CONSTRAINT_CHECK_DISTANCE_X || 100;
  const btCheckDistanceZ = config.BT_CONSTRAINT_CHECK_DISTANCE_Z || 50;

  // Check horizontal movement constraints using enemyAIUtils (cached version for performance)
  if (window.enemyAIUtils && window.enemyAIUtils.checkScreenBoundariesCached) {
    const boundaries = window.enemyAIUtils.checkScreenBoundariesCached(entity);

    // Can move right? (check if not at right boundary)
    if (boundaries.right) {
      constraints.blocked.add('patrol_right');
      constraints.blocked.add('move_right');
      constraints.reasons.patrol_right = 'screen_boundary_right';
    }

    // Can move left? (check if not at left boundary)
    if (boundaries.left) {
      constraints.blocked.add('patrol_left');
      constraints.blocked.add('move_left');
      constraints.reasons.patrol_left = 'screen_boundary_left';
    }
  } else if (window.enemyAIUtils && window.enemyAIUtils.checkScreenBoundaries) {
    // Fallback to non-cached version
    const boundaries = window.enemyAIUtils.checkScreenBoundaries(entity);

    // Can move right? (check if not at right boundary)
    if (boundaries.right) {
      constraints.blocked.add('patrol_right');
      constraints.blocked.add('move_right');
      constraints.reasons.patrol_right = 'screen_boundary_right';
    }

    // Can move left? (check if not at left boundary)
    if (boundaries.left) {
      constraints.blocked.add('patrol_left');
      constraints.blocked.add('move_left');
      constraints.reasons.patrol_left = 'screen_boundary_left';
    }
  } else {
    // Fallback for when utils are not available
    const entityWidth = entity.collisionW || entity.w || 50;
    if (entity.x >= CANVAS_WIDTH - entityWidth) {
      constraints.blocked.add('patrol_right');
      constraints.blocked.add('move_right');
      constraints.reasons.patrol_right = 'screen_boundary_right';
    }
    if (entity.x <= 0) {
      constraints.blocked.add('patrol_left');
      constraints.blocked.add('move_left');
      constraints.reasons.patrol_left = 'screen_boundary_left';
    }
  }

  // Can patrol? (needs at least one direction available)
  const canPatrol = !constraints.blocked.has('patrol_left') || !constraints.blocked.has('patrol_right');
  if (!canPatrol) {
    constraints.blocked.add('patrol');
    constraints.reasons.patrol = 'no_movement_space';
  } else {
    // Allow patrol if at least one direction is available
    constraints.allowed.add('patrol');
    constraints.allowed.add('patrol_left');
    constraints.allowed.add('patrol_right');
  }

  // Check vertical movement constraints
  const canMoveUp = entity.z > Z_MIN;
  const canMoveDown = entity.z < Z_MAX;

  if (!canMoveUp) {
    constraints.blocked.add('move_up');
    constraints.reasons.move_up = 'screen_boundary_top';
  }

  if (!canMoveDown) {
    constraints.blocked.add('move_down');
    constraints.reasons.move_down = 'screen_boundary_bottom';
  }

  // Check for obstacles/entities blocking movement using enemyAIUtils
  if (window.enemyAIUtils && window.enemyAIUtils.detectEntityCollisions) {
    const entities = window.gameState ? window.gameState.getAllEntities() : [];
    const nearbyEntities = window.enemyAIUtils.detectEntityCollisions(entity, entities, btCheckDistanceX);

    if (nearbyEntities.length > 0) {
      constraints.blocked.add('patrol');
      constraints.reasons.patrol = 'entities_blocking';
    }
  } else {
    // Fallback entity checking
    const entities = window.gameState ? window.gameState.getAllEntities() : [];
    const nearbyEntities = entities.filter(e =>
      e !== entity &&
      Math.abs(e.x - entity.x) < btCheckDistanceX &&
      Math.abs(e.z - entity.z) < btCheckDistanceZ
    );

    if (nearbyEntities.length > 0) {
      constraints.blocked.add('patrol');
      constraints.reasons.patrol = 'entities_blocking';
    }
  }

  console.log(`[BEHAVIOR_CONSTRAINTS] ${entity.entityType} constraints:`, {
    allowed: Array.from(constraints.allowed),
    blocked: Array.from(constraints.blocked),
    reasons: constraints.reasons
  });

  return constraints;
}

// Universal screen boundaries function - checks and applies boundaries, returns interruption info
function applyScreenBoundaries(entity) {
  let wasLimited = false;

  // Get current per-frame hit box dimensions and position offset
  const hitBoxData = getCurrentHitBoxDimensions(entity);
  const hitBoxPosition = getCurrentHitBoxPosition(entity);

  if (hitBoxData && hitBoxPosition) {
    // Calculate boundaries based on actual hit box position in sprite frame
    const hitBoxOffsetX = hitBoxPosition.x - entity.x; // How much hit box is offset from entity.x
    const hitBoxOffsetY = hitBoxPosition.y - entity.z; // How much hit box is offset from entity.z

    // Ensure full hit box visibility: entity.x + hitBoxOffsetX + hitBoxData.width <= CANVAS_WIDTH
    const leftBoundary = -hitBoxOffsetX; // Allow entity to go left enough to show full hit box
    const rightBoundary = CANVAS_WIDTH - (hitBoxOffsetX + hitBoxData.width);
    const bottomBoundary = Z_MIN; // Same as before
    const topBoundary = Z_MAX; // Same as before

    //console.log(`[SCREEN_BOUNDARIES] ${entity.entityType} hit box offset X: ${hitBoxOffsetX}, width: ${hitBoxData.width}`);
    //console.log(`[SCREEN_BOUNDARIES] ${entity.entityType} boundaries - left: ${leftBoundary}, right: ${rightBoundary}`);

    // Horizontal boundaries (X-axis) - ensure full hit box visibility
    if (entity.x < leftBoundary) {
      console.log(`[SCREEN_BOUNDARIES] ${entity.entityType} hit left boundary, clamping X from ${entity.x} to ${leftBoundary}`);
      entity.x = leftBoundary;
      entity.vx = 0; // Stop horizontal movement
      wasLimited = true;
    } else if (entity.x > rightBoundary) {
      console.log(`[SCREEN_BOUNDARIES] ${entity.entityType} hit right boundary, clamping X from ${entity.x} to ${rightBoundary}`);
      entity.x = rightBoundary;
      entity.vx = 0; // Stop horizontal movement
      wasLimited = true;
    }
  } else {
    // Fallback for entities without per-frame hit boxes
    const entityWidth = entity.collisionW || entity.w || 50;
    const leftBoundary = 0;
    const rightBoundary = CANVAS_WIDTH - entityWidth;
    const bottomBoundary = Z_MIN;
    const topBoundary = Z_MAX;

    console.log(`[SCREEN_BOUNDARIES] ${entity.entityType} fallback boundaries - left: ${leftBoundary}, right: ${rightBoundary}, width: ${entityWidth}`);

    if (entity.x < leftBoundary) {
      entity.x = leftBoundary;
      entity.vx = 0;
      wasLimited = true;
    } else if (entity.x > rightBoundary) {
      entity.x = rightBoundary;
      entity.vx = 0;
      wasLimited = true;
    }
  }

  // Vertical boundaries (Z-axis) - same as before
  if (entity.z < Z_MIN) {
    console.log(`[SCREEN_BOUNDARIES] ${entity.entityType} hit bottom boundary, clamping Z from ${entity.z} to ${Z_MIN}`);
    entity.z = Z_MIN;
    entity.vz = 0; // Stop vertical movement
    wasLimited = true;
  } else if (entity.z > Z_MAX) {
    console.log(`[SCREEN_BOUNDARIES] ${entity.entityType} hit top boundary, clamping Z from ${entity.z} to ${Z_MAX}`);
    entity.z = Z_MAX;
    entity.vz = 0; // Stop vertical movement
    wasLimited = true;
  }

  return { wasLimited };
}
