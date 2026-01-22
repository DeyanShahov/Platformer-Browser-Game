// ===========================================
// ENTITY COLLISION - Unified entity collision system
// ===========================================

//console.log('[COLLISION_SYSTEM] entity_collision.js LOADED - Version with detailed debug logs');

/**
 * Helper function to get current per-frame hit box dimensions (for calculateBoxPosition)
 * @param {Object} entity - The entity to get hit box dimensions for
 * @returns {Object|null} Hit box dimensions or null if no animation data
 */
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

/**
 * Helper function to check if animation system is fully ready for entity
 * @param {Object} entity - The entity to check
 * @returns {boolean} True if animation system is ready
 */
function isAnimationSystemReadyForEntity(entity) {
    return entity.animation &&
        entity.animation.animationDefinition &&
        entity.animation.animationDefinition.frameData &&
        entity.animation.currentFrame !== undefined &&
        entity.animation.animationDefinition.frameData[entity.animation.currentFrame];
}

/**
 * Helper function to get current per-frame hit box position and dimensions (for unified collision)
 * @param {Object} entity - The entity to get hit box position for
 * @returns {Object|null} Hit box position data or null if no animation data
 */
function getCurrentHitBoxPosition(entity) {
    if (!entity.animation || !entity.animation.animationDefinition) {
        return null; // No animation system fallback
    }

    const currentFrame = entity.animation.currentFrame;
    const animationDef = entity.animation.animationDefinition;

    // Check if current animation frame has hit box data
    if (!animationDef.frameData || !animationDef.frameData[currentFrame] || !animationDef.frameData[currentFrame].hitBox) {
        return null;
    }

    const hitBoxData = animationDef.frameData[currentFrame].hitBox;

    // DEBUG: Log hitBoxData values and entity position
    //console.log(`[HITBOX_DEBUG_DETAIL] ${entity.animationEntityType || entity.entityType} hitBoxData:`, {
    //    x: hitBoxData.x,
    //    y: hitBoxData.y,
    //    width: hitBoxData.width,
    //    height: hitBoxData.height,
    //    entityPos: { x: entity.x, y: entity.y, z: entity.z },
    //    entitySize: { w: entity.w, h: entity.h }
    //});

    // Calculate hit box position consistently with AnimationRenderer
    const zOffset = entity.z * 1.0;
    const drawX = entity.x;
    const drawY = entity.y - entity.h - zOffset;

    //console.log(`[HITBOX_DEBUG_DETAIL] ${entity.animationEntityType || entity.entityType} draw calculations:`, {
    //    zOffset: zOffset.toFixed(1),
    //    drawX: drawX.toFixed(1),
    //    drawY: drawY.toFixed(1),
    //    entityX: entity.x.toFixed(1),
    //    entityY: entity.y.toFixed(1),
    //    entityH: entity.h
    //});

    let boxX, boxY;

    // Position relative to sprite coordinates - hitbox data is already in world coordinates
    boxX = drawX + hitBoxData.x;

    // Rectangle vs Sprite branching for Y-axis
    if (animationDef.spriteSheet && entity.animationEntityType !== 'blue_slime') {
        boxY = drawY + entity.h / 2 - hitBoxData.y;
    } else {
        boxY = drawY + entity.h - hitBoxData.height;
    }

    // FIX: Apply facing direction flipping for BODY hitboxes (collision boxes)
    // COPY EXACTLY AnimationRenderer flipping logic
    if (entity.animation && entity.animation.facingDirection === 'left') {
        // FIX UNIVERSAL: Flip around the ACTUAL PHYSICAL CENTER

        let centerX;

        // Try to get precise hitbox center from current frame - SAME AS AnimationRenderer
        if (entity.animation.animationDefinition &&
            entity.animation.animationDefinition.frameData &&
            entity.animation.animationDefinition.frameData[entity.animation.currentFrame] &&
            entity.animation.animationDefinition.frameData[entity.animation.currentFrame].hitBox) {

            const currentHitBoxData = entity.animation.animationDefinition.frameData[entity.animation.currentFrame].hitBox;

            // Calculate absolute hitbox X position - SAME AS AnimationRenderer
            const hitBoxX = drawX + currentHitBoxData.x;
            centerX = hitBoxX + currentHitBoxData.width / 2;

        } else {
            // Fallback: Use standard collision width - SAME AS AnimationRenderer
            const collisionW = entity.collisionW || entity.w;
            centerX = entity.x + collisionW / 2;
        }

        // Apply MIRRORING to hitbox coordinates (equivalent to AnimationRenderer canvas transform)
        // Mirror the hitbox around the center point
        const distanceFromCenter = boxX - centerX;
        boxX = centerX - distanceFromCenter;
    }

    const result = {
        x: boxX,
        y: boxY,
        width: hitBoxData.width,
        height: hitBoxData.height
    };

    // Debug logging for collision issues - ACTIVATED
    //console.log(`[HITBOX_DEBUG] ${entity.animationEntityType || entity.entityType}: pos(${entity.x.toFixed(1)}, ${entity.z.toFixed(1)}) hitbox(${result.x.toFixed(1)}, ${result.y.toFixed(1)}, ${result.width.toFixed(1)}x${result.height.toFixed(1)})`);

    return result;
}

/**
 * Main unified collision function
 * @param {Object} entity1 - First entity
 * @param {Object} entity2 - Second entity
 * @param {string} collisionType - Type of collision ('movement', 'attack', etc.)
 * @param {Object} params - Additional parameters
 * @returns {boolean} True if collision detected
 */
function checkEntityCollision(entity1, entity2, collisionType, params = {}) {
    const defaults = {
        zTolerance: collisionType === 'movement' ? 10 : 10,
        buffer: params.buffer !== undefined ? params.buffer : (collisionType === 'movement' ? 0 : 0), // Use 0 buffer by default for movement to match correction logic
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

    // REMOVED FALLBACK LOGIC - USE ONLY HIT BOX DATA
    // Both entities MUST have hit box data, otherwise no collision

    if (!e1HitBox || !e2HitBox) {
        // No hit box data available - no collision possible
        return false;
    }

    // Use per-frame hit box position and dimensions for BOTH entities
    // Adjust hit box position for proposed movement (entity1 only)
    const xOffset = config.entity1Pos.x - entity1.x; // Movement offset
    const yOffset = config.entity1Pos.y - entity1.y;

    e1X = e1HitBox.x + xOffset;
    e1Y = e1HitBox.y + yOffset;
    e1Z = config.entity1Pos.z;
    e1W = e1HitBox.width;
    e1H = e1HitBox.height;

    // Use per-frame hit box for entity2 (no proposed movement)
    e2X = e2HitBox.x;
    e2Y = e2HitBox.y;
    e2Z = entity2.z;
    e2W = e2HitBox.width;
    e2H = e2HitBox.height;

    // Check collision with buffer for movement
    const hasCollision = checkCollisionWithBuffer(
        e1X, e1Y, e1Z, e1W, e1H, entity1.zThickness || 0,
        e2X, e2Y, e2Z, e2W, e2H, entity2.zThickness || 0,
        config.zTolerance, config.buffer
    );

    // DEBUG: Log collision check details when checking player vs enemy
    if ((entity1.entityType === 'player' && entity2.entityType === 'enemy') ||
        (entity1.entityType === 'enemy' && entity2.entityType === 'player')) {
        //console.log(`[COLLISION_SYSTEM_ENTITY_CHECK] ${entity1.entityType} vs ${entity2.entityType} collision check:`);
        //console.log(`[COLLISION_SYSTEM_ENTITY_CHECK] Entity1: pos(${entity1.x.toFixed(1)}, ${entity1.z.toFixed(1)}) -> hitbox(${e1X.toFixed(1)}, ${e1Y.toFixed(1)}, ${e1W}x${e1H})`);
        //console.log(`[COLLISION_SYSTEM_ENTITY_CHECK] Entity2: pos(${entity2.x.toFixed(1)}, ${entity2.z.toFixed(1)}) -> hitbox(${e2X.toFixed(1)}, ${e2Y.toFixed(1)}, ${e2W}x${e2H})`);
        //console.log(`[COLLISION_SYSTEM_ENTITY_CHECK] Proposed pos: (${config.entity1Pos.x.toFixed(1)}, ${config.entity1Pos.z.toFixed(1)})`);
        //console.log(`[COLLISION_SYSTEM_ENTITY_CHECK] Buffer: ${config.buffer}, Z tolerance: ${config.zTolerance}`);
        //console.log(`[COLLISION_SYSTEM_ENTITY_CHECK] RESULT: ${hasCollision ? 'COLLISION' : 'NO COLLISION'}`);
    }

    if (hasCollision && config.logCollisions) {
        //console.log(`[COLLISION_SYSTEM] ${collisionType.toUpperCase()} blocked: ${entity1.entityType} vs ${entity2.entityType}`);
        //console.log(`[COLLISION_SYSTEM] ${entity1.entityType} at (${e1X.toFixed(1)}, ${e1Y.toFixed(1)}, Z:${e1Z.toFixed(1)}) ${e1W}x${e1H}`);
        //console.log(`[COLLISION_SYSTEM] ${entity2.entityType} at (${e2X.toFixed(1)}, ${e2Y.toFixed(1)}, Z:${e2Z.toFixed(1)}) ${e2W}x${e2H}`);
        //console.log(`[COLLISION_SYSTEM] Z diff: ${Math.abs(e1Z - e2Z).toFixed(1)}, Z tolerance: ${config.zTolerance}`);
    }

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

/**
 * Unified attack collision function (moved from game.js - contains game logic)
 * @param {Object} attacker - The attacking entity
 * @param {Object} target - The target entity
 * @param {Object} params - Additional parameters including zTolerance
 * @returns {boolean} True if hit detected
 */
function checkHitboxCollision(attacker, target, params) {
    //console.log(`[COLLISION_DEBUG] checkHitboxCollision: ${attacker?.entityType} attacking ${target?.entityType}`);
    //console.log(`[COLLISION_DEBUG] Attacker state: ${attacker?.stateMachine?.getCurrentStateName()}, isInAttackState: ${attacker?.stateMachine?.isInAttackState()}`);
    //console.log(`[COLLISION_DEBUG] Target position: (${target?.x?.toFixed(1)}, ${target?.y?.toFixed(1)}, ${target?.z?.toFixed(1)})`);

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
                        // FIX: Use the actual hitbox center for pivoting, matching visual renderer
                        let entityCenterX;

                        const hitBoxPos = getCurrentHitBoxPosition(attacker);
                        if (hitBoxPos) {
                            entityCenterX = hitBoxPos.x + hitBoxPos.width / 2;
                        } else {
                            entityCenterX = attacker.x + (attacker.collisionW || attacker.w) / 2;
                        }

                        // Mirror the attack box around the pivot
                        const distanceFromCenter = (attackBoxPos.x + attackBoxPos.width / 2) - entityCenterX;
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
                    //console.log(`[COLLISION] HIT DETECTED on frame ${currentFrame}!`);
                    //console.log(`[COLLISION] Attack box: x=${attackBoxPos.x.toFixed(1)}, y=${attackBoxPos.y.toFixed(1)}, w=${attackBoxPos.width}, h=${attackBox.height}`);
                    //console.log(`[COLLISION] Target hit box: x=${targetHitBox.x.toFixed(1)}, y=${targetHitBox.y.toFixed(1)}, w=${targetHitBox.width}, h=${targetHitBox.height}`);
                }

                return collisionResult;
            }
        }
    }

    return false;
}

/**
 * Legacy movement collision function (moved from game.js)
 * @param {Object} entity - The entity attempting to move
 * @param {number} proposedX - Proposed X position
 * @param {number} proposedY - Proposed Y position
 * @param {number} proposedZ - Proposed Z position
 * @returns {boolean} True if movement is allowed
 */
function canMoveTo(entity, proposedX, proposedY, proposedZ) {
    // Get all other entities
    const allEntities = window.gameState ? window.gameState.getAllEntities() :
        [...players, window.enemy, window.ally].filter(e => e !== null && e !== undefined);
    const others = allEntities.filter(e => e !== entity && e !== null && e !== undefined);

    //console.log(`[COLLISION_SYSTEM_CAN_MOVE_TO] ${entity.entityType} checking movement to (${proposedX.toFixed(1)}, ${proposedY.toFixed(1)}, ${proposedZ.toFixed(1)}), others: ${others.length}`);

    // Check collision with each other entity using unified system
    for (const other of others) {
        const hasCollision = checkEntityCollision(
            entity, other, 'movement',
            {
                entity1Pos: { x: proposedX, y: proposedY, z: proposedZ },
                buffer: 2 // Small buffer for smoother movement
            }
        );

        //console.log(`[COLLISION_SYSTEM_CAN_MOVE_TO] Checking vs ${other.entityType}: collision=${hasCollision}, buffer=2`);

        if (hasCollision) {
            //console.log(`[COLLISION_SYSTEM_CAN_MOVE_TO] ${entity.entityType} movement BLOCKED by ${other.entityType} at (${proposedX.toFixed(1)}, ${proposedY.toFixed(1)}, ${proposedZ.toFixed(1)})`);
            return false; // Movement blocked
        }
    }

    //console.log(`[COLLISION_SYSTEM_CAN_MOVE_TO] ${entity.entityType} movement ALLOWED to (${proposedX.toFixed(1)}, ${proposedY.toFixed(1)}, ${proposedZ.toFixed(1)})`);
    return true; // Movement allowed
}

// ===========================================
// UNIFIED MOVEMENT SYSTEM - For all entities
// ===========================================

/**
 * Unified entity movement function - handles collision, boundaries, and physics for ALL entities
 * Uses proper separation between physical movement stopping and velocity preservation for animations
 * @param {Object} entity - The entity to move (player, enemy, etc.)
 * @param {number} dt - Delta time
 * @param {number} canvasHeight - Canvas height for ground collision
 * @param {number} gravity - Gravity constant
 * @param {number} zMin - Minimum Z boundary
 * @param {number} zMax - Maximum Z boundary
 * @param {Object} options - Additional options (entityType: 'player'|'enemy'|'npc')
 */
function handleEntityMovement(entity, dt, canvasHeight, gravity, zMin, zMax, options = {}) {
    const entityType = options.entityType || 'generic';

    // Prevent movement during attack animations (all entities)
    if (entity.stateMachine && entity.stateMachine.isInAttackState()) {
        return; // Skip movement processing during attacks
    }

    // 1. Entity-to-Entity Collision Correction (X-axis)
    // Players use correction (smooth pushing), enemies might use blocking
    if (entityType === 'player') {
        const proposedX = entity.x + entity.vx * dt;
        const correctedX = applyCollisionCorrection(entity, proposedX, entity.y, entity.z, 'x');
        entity.x = correctedX;
    } else {
        // For enemies/NPCs - check if movement is allowed before applying
        const proposedX = entity.x + entity.vx * dt;
        if (canMoveTo(entity, proposedX, entity.y, entity.z)) {
            entity.x = proposedX;
        } else {
            // Movement blocked - but DON'T reset velocity (preserve for AI/animations)
        }
    }

    // 2. Z-Axis Movement with Collision Check
    const proposedZ = entity.z + entity.vz * dt;
    const clampedZ = Math.min(Math.max(proposedZ, zMin), zMax);

    if (canMoveTo(entity, entity.x, entity.y, clampedZ)) {
        entity.z = clampedZ;
    }
    // If Z movement blocked - don't reset vz (preserve for AI logic)

    // 3. Gravity & Ground Collision (for entities that can fall)
    if (entityType === 'player' || entityType === 'enemy') {
        // Apply gravity
        entity.vy += gravity * dt;
        entity.y += entity.vy * dt;

        // Ground collision
        const groundY = canvasHeight - 600; // Same ground level
        if (entity.y >= groundY) {
            // Landing logic
            const wasInAir = !entity.onGround;
            entity.y = groundY;
            entity.vy = 0;
            entity.onGround = true;

            // Player-specific landing animation transitions
            if (entityType === 'player' && wasInAir) {
                // Trigger FSM transition for jump landing
                if (entity.animation && entity.animation.currentAnimation === window.ANIMATION_TYPES?.JUMP) {
                    entity.animation.forceAnimation = false;
                    if (entity.stateMachine && entity.stateMachine.currentState?.name === 'jumping') {
                        const transition = entity.stateMachine.currentState.update(entity, 0);
                        if (transition) {
                            entity.stateMachine.changeState(transition);
                        }
                    }
                }
            }
        } else {
            entity.onGround = false;
        }
    }

    // 4. Screen Boundaries - STOP PHYSICAL MOVEMENT but PRESERVE VELOCITY for animations
    const entityWidth = entity.collisionW || entity.w || 50;
    const leftBoundary = 0;
    const rightBoundary = CANVAS_WIDTH - entityWidth;

    // X boundaries - clamp position but don't reset velocity
    if (entity.x < leftBoundary) {
        entity.x = leftBoundary;
        // DON'T reset entity.vx = 0; - preserve for animation FSM
    } else if (entity.x > rightBoundary) {
        entity.x = rightBoundary;
        // DON'T reset entity.vx = 0; - preserve for animation FSM
    }

    // Z boundaries - clamp position but don't reset velocity
    if (entity.z < zMin) {
        entity.z = zMin;
        // DON'T reset entity.vz = 0; - preserve for AI/animations
    } else if (entity.z > zMax) {
        entity.z = zMax;
        // DON'T reset entity.vz = 0; - preserve for AI/animations
    }

    // 5. Entity-specific post-movement logic
    if (entityType === 'enemy') {
        // Reset velocities after movement (AI will set them again next frame)
        // But only reset if not in persistent movement mode
        if (!entity.targetZ) {
            entity.vz = 0; // Reset Z velocity if not doing vertical movement
        }
        entity.vx = 0; // Always reset X velocity (AI-driven)
    }
    // Players keep their velocities for FSM animation logic
}

// ===========================================
// ENTITY-SPECIFIC MOVEMENT WRAPPERS
// ===========================================

/**
 * Player movement wrapper - uses unified movement with player-specific behavior
 * @param {Player} player - The player entity
 * @param {number} dt - Delta time
 * @param {number} canvasHeight - Canvas height
 * @param {number} gravity - Gravity constant
 * @param {number} zMin - Minimum Z boundary
 * @param {number} zMax - Maximum Z boundary
 */
function handlePlayerMovement(player, dt, canvasHeight, gravity, zMin, zMax) {
    handleEntityMovement(player, dt, canvasHeight, gravity, zMin, zMax, { entityType: 'player' });
}

/**
 * Enemy movement wrapper - uses unified movement with enemy-specific behavior
 * @param {Enemy} enemy - The enemy entity
 * @param {number} dt - Delta time
 * @param {number} canvasHeight - Canvas height
 * @param {number} gravity - Gravity constant
 * @param {number} zMin - Minimum Z boundary
 * @param {number} zMax - Maximum Z boundary
 */
function handleEnemyMovement(enemy, dt, canvasHeight, gravity, zMin, zMax) {
    handleEntityMovement(enemy, dt, canvasHeight, gravity, zMin, zMax, { entityType: 'enemy' });
}

// Export to global scope for backward compatibility
window.getCurrentHitBoxDimensions = getCurrentHitBoxDimensions;
window.getCurrentHitBoxPosition = getCurrentHitBoxPosition;
window.checkEntityCollision = checkEntityCollision;
window.checkHitboxCollision = checkHitboxCollision;
window.canMoveTo = canMoveTo;
window.handleEntityMovement = handleEntityMovement;
window.handlePlayerMovement = handlePlayerMovement;
window.handleEnemyMovement = handleEnemyMovement;
