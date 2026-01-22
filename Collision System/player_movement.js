// ===========================================
// PLAYER MOVEMENT - Player-specific movement physics
// ===========================================

// ===========================================
// PLAYER MOVEMENT - Player-specific movement physics
// ===========================================

/**
 * Обработка на движение и колизии за играч
 * @param {Object} player - The player entity
 * @param {number} dt - Delta time
 * @param {number} canvasHeight - Canvas height
 * @param {number} gravity - Gravity value
 * @param {number} zMin - Minimum Z value
 * @param {number} zMax - Maximum Z value
 */
function handleMovement(player, dt, canvasHeight, gravity, zMin, zMax) {
    // Prevent movement during attack animations
    if (player.stateMachine && player.stateMachine.isInAttackState()) {
        // During attack, character should not move - set velocity to 0
        player.vx = 0;
        player.vz = 0;
        return; // Skip movement processing during attacks
    }

    // Check X movement collision with correction instead of blocking
    const proposedX = player.x + player.vx * dt;

    // Apply collision correction - simple boundary correction like the old system
    const correctedX = applyCollisionCorrection(player, proposedX, player.y, player.z, 'x');
    player.x = correctedX;

    // Опит за движение по Z
    const proposedZ = player.z + player.vz * dt;
    const clampedZ = Math.min(Math.max(proposedZ, zMin), zMax);

    //Check Z movement collision
    if (canMoveTo(player, player.x, player.y, clampedZ)) {
        player.z = clampedZ;
    }

    // X movement is now handled entirely by collision correction above
    // No additional player.x += player.vx * dt; needed

    // Гравитация
    player.vy += gravity * dt;
    player.y += player.vy * dt;

    // Apply screen boundaries to keep player within screen bounds
    const boundaryResult = window.applyScreenBoundaries(player);
    if (boundaryResult.wasLimited) {
        // Stop movement if we hit a boundary
        player.vx = 0;
        player.vz = 0;
    }

    // Земя - използвай spawn позицията вместо hardcoded 100px
    const groundY = canvasHeight - 600; // Съответства на spawnY в main.js
    if (player.y >= groundY) {
        // Check if this is the first frame of landing (transition from air to ground)
        const wasInAir = !player.onGround;

        player.y = groundY;
        player.vy = 0;
        player.onGround = true;

        if (wasInAir) {
            //console.log(`[JUMP] Player landed on ground (y: ${groundY})`);

            // Check if player was jumping - force FSM transition
            if (player.animation && player.animation.currentAnimation === window.ANIMATION_TYPES.JUMP) {
                //console.log(`[JUMP] Player was jumping, forcing FSM transition on landing`);
                // Clear force flag first
                player.animation.forceAnimation = false;

                // Force FSM transition by calling JumpingState update
                if (player.stateMachine && player.stateMachine.currentState.name === 'jumping') {
                    // Temporarily set justEntered to false so update() will run
                    const wasJustEntered = player.stateMachine.currentState.justEntered;
                    player.stateMachine.currentState.justEntered = false;

                    const transition = player.stateMachine.currentState.update(player, 0);
                    if (transition) {
                        //console.log(`[JUMP] Landing transition to: ${transition}`);
                        player.stateMachine.changeState(transition);
                    }

                    // Restore justEntered flag
                    player.stateMachine.currentState.justEntered = false; // Keep false to prevent re-entry
                }
            }
        }
    } else {
        // Player is in air
        player.onGround = false;
    }
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
    // Get all other entities using unified approach
    const allEntities = window.gameState ? window.gameState.getAllEntities() :
        [...window.players || [], window.enemy, window.ally].filter(e => e !== null && e !== undefined);
    const others = allEntities.filter(e => e !== entity && e !== null && e !== undefined);

    //console.log(`[COLLISION_SYSTEM_CAN_MOVE_TO] ${entity.entityType} checking movement to (${proposedX.toFixed(1)}, ${proposedY.toFixed(1)}, ${proposedZ.toFixed(1)}), others: ${others.length}`);

    // Check collision with each other entity using UNIFIED Collision System ONLY
    for (const other of others) {
        const hasCollision = window.checkEntityCollision ?
            window.checkEntityCollision(
                entity, other, 'movement',
                {
                    entity1Pos: { x: proposedX, y: proposedY, z: proposedZ },
                    buffer: 2 // Small buffer for smoother movement
                }
            ) : false;

        //console.log(`[COLLISION_SYSTEM_CAN_MOVE_TO] Checking vs ${other.entityType}: collision=${hasCollision}, buffer=2`);

        if (hasCollision) {
            //console.log(`[COLLISION_SYSTEM_CAN_MOVE_TO] ${entity.entityType} movement BLOCKED by ${other.entityType} at (${proposedX.toFixed(1)}, ${proposedY.toFixed(1)}, ${proposedZ.toFixed(1)})`);
            return false; // Movement blocked
        }
    }

    //console.log(`[COLLISION_SYSTEM_CAN_MOVE_TO] ${entity.entityType} movement ALLOWED to (${proposedX.toFixed(1)}, ${proposedY.toFixed(1)}, ${proposedZ.toFixed(1)})`);
    return true; // Movement allowed
}

// REMOVED: Own checkEntityCollision function - now uses unified Collision System only!

// Export to global scope for backward compatibility
window.handleMovement = handleMovement;
