/**
 * Enemy Movement Module
 * Handles all enemy movement physics, collision detection, and movement behaviors
 * Extracted from BaseEnemy class to improve separation of concerns
 */

// ===========================================
// MOVEMENT PHYSICS METHODS
// ===========================================

/**
 * Handle enemy physics and movement (moved from BaseEnemy.handleMovement)
 * @param {BaseEnemy} enemy - The enemy instance
 * @param {number} dt - Delta time for frame-based calculations
 * @param {number} canvasHeight - Canvas height for ground collision
 * @param {number} gravity - Gravity constant
 */
function handleMovement(enemy, dt, canvasHeight, gravity) {
    // console.log(`[HANDLE ENEMY MOVEMENT] START - x=${enemy.x}, z=${enemy.z}, vx=${enemy.vx}, vz=${enemy.vz}`);

    // Prevent movement during attack animations (like players)
    if (enemy.stateMachine && enemy.stateMachine.isInAttackState()) {
        enemy.vx = 0;
        enemy.vz = 0;
        return;
    }

    // Apply velocity to position (basic physics)
    enemy.x += enemy.vx * dt;
    enemy.y += enemy.vy * dt;
    enemy.z += enemy.vz * dt;

    // Basic gravity for enemies (if they can fall)
    enemy.vy += gravity * dt;

    // Ground collision (similar to players)
    const groundY = canvasHeight - 600; // Same ground level as players
    if (enemy.y >= groundY) {
        enemy.y = groundY;
        enemy.vy = 0;
        enemy.onGround = true;
    } else {
        enemy.onGround = false;
    }

    // Apply screen boundaries and check for interruption
    const boundaryResult = window.applyScreenBoundaries ? window.applyScreenBoundaries(enemy) : { wasLimited: false };
    // console.log(`[HANDLE ENEMY MOVEMENT] boundary check: wasLimited=${boundaryResult.wasLimited}`);

    if (boundaryResult.wasLimited) {
        // console.log(`[HANDLE ENEMY MOVEMENT] Boundary hit - stopping movement!`);
        // Signal that boundary was hit - AI will handle BT consultation
        enemy.boundaryInterrupted = true;
    }

    // Reset velocity after movement (AI will set it again next frame)
    // Keep vx for continuous movement
    enemy.vx = 0;  // Always reset vx (horizontal)

    // Only reset vz if not in vertical movement mode
    // console.log(`[HANDLE ENEMY MOVEMENT] Before vz reset: vz=${enemy.vz}, targetZ=${enemy.targetZ}`);
    if (!enemy.targetZ) {
        enemy.vz = 0;  // Only reset vz if not doing vertical movement
        // console.log(`[HANDLE ENEMY MOVEMENT] Reset vz to 0 (no vertical movement)`);
    } else {
        // console.log(`[HANDLE ENEMY MOVEMENT] Kept vz=${enemy.vz} (vertical movement active)`);
    }
}

// ===========================================
// MOVEMENT BEHAVIOR METHODS
// ===========================================

/**
 * Vertical movement behavior: move to target Z position, then return to idle
 * @param {BaseEnemy} enemy - The enemy instance
 * @param {Array} players - Array of player entities
 * @param {number} dt - Delta time
 * @param {Object} behaviors - Behavior configuration
 */
function updateVerticalMovementBehavior(enemy, players, dt, behaviors) {
    // console.log(`[VZ_DEBUG] updateVerticalMovementBehavior START - vz=${enemy.vz}, targetZ=${enemy.targetZ}`);

    if (enemy.targetZ === undefined) {
        //console.log(`[BASE ENEMY VERTICAL] ERROR: targetZ not set, exiting vertical movement`);
        enemy.transitionToBehavior({ type: 'idle', duration: 0.5 }, behaviors);
        return;
    }

    // Check if we're stuck at boundary (vz = 0 and target is outside bounds)
    const isStuckAtBoundary = enemy.vz === 0 && (
        (enemy.targetZ < Z_MIN && enemy.z <= Z_MIN) ||
        (enemy.targetZ > Z_MAX && enemy.z >= Z_MAX)
    );

    if (isStuckAtBoundary) {
        //console.log(`[VERTICAL STUCK] Stuck at boundary (z=${enemy.z}, targetZ=${enemy.targetZ}), immediate BT consultation`);
        enemy.vz = 0;
        enemy.targetZ = undefined;
        enemy.verticalMovementStartZ = undefined;

        // Immediate BT consultation instead of idle delay
        const nextBehavior = enemy.consultBTForBehavior(players, { reason: 'vertical_stuck' });
        enemy.transitionToBehavior(nextBehavior, behaviors);
        return;
    }

    // Calculate distance moved so far
    const distanceMoved = Math.abs(enemy.z - enemy.verticalMovementStartZ);
    const targetDistance = Math.abs(enemy.targetZ - enemy.verticalMovementStartZ); // Dynamic distance to target

    //console.log(`[BASE ENEMY VERTICAL] Moving: current=${enemy.z.toFixed(1)}, target=${enemy.targetZ.toFixed(1)}, moved=${distanceMoved.toFixed(1)}, targetDistance=${targetDistance.toFixed(1)}`);

    // Check if we've reached or exceeded the target distance
    if (distanceMoved >= targetDistance) {
        //console.log(`[BASE ENEMY VERTICAL] Target reached (${distanceMoved.toFixed(1)} >= ${targetDistance}), immediate BT consultation`);

        // Apply boundary enforcement to ensure we're within limits
        const boundaryResult = window.applyScreenBoundaries ? window.applyScreenBoundaries(enemy) : { wasLimited: false };
        if (boundaryResult.wasLimited) {
            //console.log(`[BASE ENEMY VERTICAL] Boundary enforced after movement`);
        }

        // Cache targetZ for logging
        const reachedTargetZ = enemy.targetZ;

        // Stop movement and clear ALL vertical movement state
        enemy.vz = 0;
        enemy.targetZ = undefined;
        enemy.verticalMovementStartZ = undefined;

        // Dynamic IDLE duration based on rarity/intelligence
        const idleDuration = enemy.aiContext?.behaviors?.idle?.duration || 0.2;

        //console.log(`%c[COMMAND INTERRUPTED] Vertical movement completed (reached target Z: ${reachedTargetZ !== undefined ? reachedTargetZ.toFixed(1) : 'unknown'}) - going to idle (thinking phase)`, 'color: #00ffff; font-weight: bold; font-size: 14px;');

        // ADD IDLE THINKING instead of immediate BT
        enemy.transitionToBehavior({ type: 'idle', duration: idleDuration }, behaviors); // 0.3 sec мислене
        return;

        // Immediate BT consultation instead of idle delay
        // const nextBehavior = enemy.consultBTForBehavior([], { reason: 'vertical_complete' });
        // enemy.transitionToBehavior(nextBehavior, behaviors);
        // return;
    }

    // Check for player proximity during vertical movement
    const closestPlayer = window.EnemyCombat.getClosestPlayer(enemy, players);
    const attackRange = enemy.attackRange; // Use standard/configured attack range

    if (closestPlayer && closestPlayer.distance <= attackRange) {
        //console.log(`%c[PLAYER DETECTED] Player in range during vertical movement - stopping move and preparing attack`, 'color: #ff0000; font-weight: bold; font-size: 14px;');
        enemy.vz = 0;
        enemy.targetZ = undefined;
        enemy.verticalMovementStartZ = undefined;

        // Idle briefly before attack (thinking phase)
        enemy.transitionToBehavior({ type: 'idle', duration: 0.3 }, behaviors);
        return;
    }

    // Calculate proposed movement
    const proposedZ = enemy.z + (enemy.vz * dt);

    // Apply collision correction for Z axis
    const correctedZ = window.applyCollisionCorrection ?
        window.applyCollisionCorrection(enemy, enemy.x, enemy.y, proposedZ, 'z') :
        proposedZ;

    // Check if vertical movement was blocked by collision
    // Use larger epsilon (0.1) to ignore microscopic floating point corrections
    if (Math.abs(correctedZ - proposedZ) > 0.1) {
        // Find the entity that actually blocked us for better logging
        const blocker = enemy.detectCollidedEntity(enemy.x, enemy.y, proposedZ);

        //console.log(`%c[COMMAND INTERRUPTED] Vertical movement blocked by ${blocker ? blocker.entityType : 'unknown obstacle'} - going to idle (thinking phase)`, 'color: #00ffff; font-weight: bold; font-size: 14px;');

        // Stop movement and reset state
        enemy.vz = 0;
        enemy.targetZ = undefined;
        enemy.verticalMovementStartZ = undefined;

        if (blocker && blocker.entityType === 'player') {
            console.log(`[PLAYER COLLISION] Vertical move hit PLAYER at Z=${proposedZ.toFixed(1)} - going to IDLE (thinking phase)`);
            enemy.transitionToBehavior({ type: 'idle', duration: 0.3, canInterrupt: false }, behaviors);
        } else {
            enemy.transitionToBehavior({ type: 'idle', duration: 0.5 }, behaviors);
        }
        return;
    }

    // Apply movement
    enemy.z = correctedZ;

    // Apply boundary enforcement during movement (safety check)
    const boundaryResult = window.applyScreenBoundaries ? window.applyScreenBoundaries(enemy) : { wasLimited: false };
    if (boundaryResult.wasLimited) {
        //console.log(`[BASE ENEMY VERTICAL] Boundary hit during movement, resetting movement state`);
        // Stop movement if we hit a boundary
        enemy.vz = 0;
        enemy.targetZ = undefined;
        enemy.verticalMovementStartZ = undefined;
        enemy.transitionToBehavior({ type: 'idle', duration: 0.5 }, behaviors);
        return;
    }

    // console.log(`[BASE ENEMY VERTICAL] Continuing movement: vz=${enemy.vz.toFixed(1)}, new_z=${enemy.z.toFixed(1)}`);
}

/**
 * Walking behavior: patrol movement with intelligent collision handling OR vertical movement
 * @param {BaseEnemy} enemy - The enemy instance
 * @param {Array} players - Array of player entities
 * @param {number} dt - Delta time
 * @param {Object} behaviors - Behavior configuration
 */
function updateWalkingBehavior(enemy, players, dt, behaviors) {
    // Check if we're in vertical movement mode (has targetZ set)
    if (enemy.targetZ !== undefined) {
        return updateVerticalMovementBehavior(enemy, players, dt, behaviors);
    }

    const patrolSpeed = behaviors.patrol?.speed || 50;
    const patrolRadius = behaviors.patrol?.radiusX || 200;

    // Initialize patrol if needed
    if (enemy.patrolDirection === undefined) {
        enemy.patrolDirection = 1; // Start right
        enemy.startX = enemy.x; // Patrol center
    }

    // Skip collision checks for first frame after state change (allows smooth transition)
    if (enemy.skipCollisionCheckThisFrame) {
        enemy.skipCollisionCheckThisFrame = false; // Reset flag
        // console.log(`[BASE ENEMY PATROL] Skipping collision checks for first frame after transition`);

        // Continue with patrol movement without collision checks
        const proposedX = enemy.x + (enemy.patrolDirection * patrolSpeed * dt);
        enemy.x = proposedX;
        enemy.vx = enemy.patrolDirection * patrolSpeed;
        return;
    }

    // Check if boundary was hit during movement (set by handleEnemyMovement)
    if (enemy.boundaryInterrupted) {
        enemy.boundaryInterrupted = false; // Reset flag
        //console.log(`%c[COMMAND INTERRUPTED] Patrol blocked by screen boundary - going to idle (thinking phase)`, 'color: #00ffff; font-weight: bold; font-size: 14px;');

        // 🎯 НОВО: Определяне на блокирана посока и добавяне към dynamic blocked
        const blockedDirection = enemy.patrolDirection > 0 ? 'patrol_right' : 'patrol_left';
        enemy.addBlockedBehavior(blockedDirection, 'screen_boundary');

        console.log(`%c[COMMAND INTERRUPTED] ${enemy.constructor.name} #${enemy.instanceId} patrol blocked by screen boundary (${blockedDirection}) - going to idle (thinking phase)`, 'color: #00ffff; font-weight: bold; font-size: 14px;');
        console.log(`%c[AI_SITUATION] ${enemy.constructor.name} #${enemy.instanceId}: "Патрулът е прекъснат от граница, какво да правя?" Ограничение: ${blockedDirection}`, 'color: #ffaa00; font-weight: bold; font-size: 12px;');

        // Consult BT with context about screen boundary collision
        const nextBehavior = enemy.consultBTForBehavior(players, {
            reason: 'screen_boundary',
            blockedMovement: true
        });
        enemy.transitionToBehavior(nextBehavior, behaviors);
        return;
    }

    // Calculate proposed movement
    const proposedX = enemy.x + (enemy.patrolDirection * patrolSpeed * dt);

    // Use unified collision system with buffer for AI (more tolerant than player movement)
    const aiBuffer = 8; // Allow 8px overlap for smoother AI movement

    const correctedX = window.applyCollisionCorrection ?
        window.applyCollisionCorrection(enemy, proposedX, enemy.y, enemy.z, 'x', { buffer: aiBuffer }) :
        proposedX;

    const correctionDelta = correctedX - proposedX;
    const hasSignificantCorrection = Math.abs(correctionDelta) > aiBuffer + 1;

    // console.log(`[AI COLLISION DEBUG] Collision correction result:`);
    // console.log(`[AI COLLISION DEBUG] - Proposed X: ${proposedX.toFixed(1)}`);
    // console.log(`[AI COLLISION DEBUG] - Corrected X: ${correctedX.toFixed(1)}`);
    // console.log(`[AI COLLISION DEBUG] - Correction delta: ${correctionDelta.toFixed(1)}px`);
    // console.log(`[AI COLLISION DEBUG] - Significant correction (> ${aiBuffer + 1}px): ${hasSignificantCorrection}`);

    // Check all entities for potential collisions
    if (window.gameState) {
        const allEntities = window.gameState.getAllEntities();
        const nearbyEntities = allEntities.filter(e =>
            e !== enemy &&
            Math.abs(e.x - enemy.x) < 200 && // Within 200px horizontally
            Math.abs(e.z - enemy.z) < 100    // Within 100 units vertically
        );

        // Nearby entities logging commented out to reduce console spam
        // nearbyEntities.forEach((entity, index) => {
        //   console.log(`[AI COLLISION DEBUG]   ${index + 1}. ${entity.entityType} at (${entity.x.toFixed(1)}, ${entity.z.toFixed(1)}) - distance: ${distance.toFixed(1)}px`);
        // });
    }

    // Check if movement was blocked by collision (with buffer consideration)
    if (hasSignificantCorrection) {
        // DEBUG: Log collision details
        //console.log(`[COLLISION_DEBUG] hasSignificantCorrection=true, delta: ${correctionDelta.toFixed(1)}px`);

        // NEW: Check if collision is with player - if so, attack immediately!
        const collidedEntity = enemy.detectCollidedEntity(proposedX, enemy.y, enemy.z);
        //console.log(`[COLLISION_DEBUG] Collided entity:`, collidedEntity ? `${collidedEntity.entityType} (${collidedEntity.x?.toFixed(1)}, ${collidedEntity.z?.toFixed(1)})` : 'none');

        if (collidedEntity && collidedEntity.entityType === 'player') {
            //console.log(`%c[PLAYER COLLISION] Patrol interrupted by PLAYER collision (${correctionDelta.toFixed(1)}px correction) - ATTACKING IMMEDIATELY!`, 'color: #ff0000; font-weight: bold; font-size: 14px;');
            // Direct attack - no idle thinking phase for player collisions
            const attackCommand = { type: 'attack', attackType: 'light' };
            enemy.transitionToBehavior(attackCommand, behaviors);
            return;
        } else {
            // 🎯 НОВО: Entity collision - анализирай посоката и блокирай правилните поведения
            const blockedDirections = enemy.getBlockedDirectionsFromCollision(proposedX, enemy.y, enemy.z);
            blockedDirections.forEach(direction => {
                enemy.addBlockedBehavior(direction, 'entity_collision');
            });

            console.log(`%c[COMMAND INTERRUPTED] ${enemy.constructor.name} #${enemy.instanceId} patrol blocked by entity collision (${correctionDelta.toFixed(1)}px correction) - blocked: ${Array.from(blockedDirections).join(', ')} - going to idle (thinking phase)`, 'color: #00ffff; font-weight: bold; font-size: 14px;');
            enemy.transitionToBehavior({ type: 'idle', duration: 0.5 }, behaviors);
            return;
        }
    } else if (correctedX !== proposedX) {
        // console.log(`[AI COLLISION DEBUG] ✅ Small correction applied (${correctionDelta.toFixed(1)}px), continuing patrol`);
    } else {
        // console.log(`[AI COLLISION DEBUG] ✅ No collision detected, moving freely`);
    }

    // Check patrol radius boundaries - go to idle first (thinking phase)
    if (Math.abs(enemy.x - enemy.startX) >= patrolRadius) {
        console.log(`%c[NORMAL BEHAVIOR] ${enemy.constructor.name} #${enemy.instanceId} patrol completed (max distance: ${Math.abs(enemy.x - enemy.startX).toFixed(1)} >= ${patrolRadius}) - consulting BT for next action`, 'color: #0088ff; font-weight: bold; font-size: 14px;');
        // Go to idle state first (thinking phase) before consulting BT
        enemy.transitionToBehavior({ type: 'idle', duration: 0.5 }, behaviors);
        return;
    }

    // Check for player detection during patrol - BOTH distance AND collision based
    const closestPlayer = window.EnemyCombat.getClosestPlayer(enemy, players);
    const isPlayerColliding = enemy.detectCollidedEntity(enemy.x, enemy.y, enemy.z)?.entityType === 'player';

    //console.log(`[DISTANCE_DEBUG] Enemy at (${enemy.x.toFixed(1)}, ${enemy.z.toFixed(1)}), Player at (${closestPlayer?.x?.toFixed(1)}, ${closestPlayer?.z?.toFixed(1)}), Distance: ${closestPlayer?.distance?.toFixed(1)}, Colliding: ${isPlayerColliding}`);

    if (isPlayerColliding) {
        // Direct collision with player - go to idle first (thinking phase)
        //console.log(`[COLLISION DETECTED] Player collision detected during patrol - going to IDLE (thinking phase)`);
        enemy.transitionToBehavior({ type: 'idle', duration: 0.3, canInterrupt: false }, behaviors);
        return;
    } else if (closestPlayer && closestPlayer.distance <= (behaviors.chase?.radiusX || 300)) {
        // Distance-based detection
        //console.log(`[BASE ENEMY PATROL] Player detected during patrol at distance ${closestPlayer.distance.toFixed(1)}, consulting BT`);
        const nextBehavior = enemy.consultBTForBehavior(players, { reason: 'player_detected', playerDistance: closestPlayer.distance });
        if (nextBehavior.type === 'chase') {
            enemy.transitionToBehavior(nextBehavior, behaviors);
            return;
        }
    }

    // Continue patrol movement - no issues detected
    enemy.x = correctedX; // Apply corrected movement
    enemy.vx = enemy.patrolDirection * patrolSpeed;
}

/**
 * Running behavior: Strategic Z-First Chase with Deadlock Prevention
 * @param {BaseEnemy} enemy - The enemy instance
 * @param {Array} players - Array of player entities
 * @param {number} dt - Delta time
 * @param {Object} behaviors - Behavior configuration
 */
function updateRunningBehavior(enemy, players, dt, behaviors) {
    const closestPlayer = window.EnemyCombat.getClosestPlayer(enemy, players);
    if (!closestPlayer) {
        // No players - consult BT for next behavior
        const nextBehavior = enemy.consultBTForBehavior(players);
        enemy.transitionToBehavior(nextBehavior, behaviors);
        return;
    }

    const chaseSpeed = behaviors.chase?.speed || 80;
    const attackRange = behaviors.attack?.range || enemy.attackRange;

    // Initialize chase state if needed
    if (!enemy.chaseState) {
        enemy.chaseState = { zFailCount: 0, lastZFailTime: 0 };
    }

    // ESCAPE STATE PROTECTION: Prevent infinite loops during deadlock prevention
    if (enemy.chaseState?.isEscaping) {
        // During escape mode - DON'T check for player proximity or try Z-repositioning
        // Just continue horizontal movement until safe distance is achieved
        enemy.vx = enemy.chaseState.escapeDirection * chaseSpeed * 0.8;
        enemy.vz = 0;

        // Check if safe distance achieved
        const currentXDistance = Math.abs(enemy.x - closestPlayer.x);
        if (currentXDistance >= enemy.chaseState.escapeUntilXDistance) {
            console.log(`[Z_DEADLOCK] Safe distance achieved (${currentXDistance.toFixed(1)} >= ${enemy.chaseState.escapeUntilXDistance}), ending escape mode`);
            delete enemy.chaseState.isEscaping;
            delete enemy.chaseState.escapeDirection;
            delete enemy.chaseState.escapeUntilXDistance;
            enemy.chaseState.zFailCount = 0; // Reset failure count for fresh start
        }

        // Boundary enforcement during escape
        const boundaryResult = window.applyScreenBoundaries ? window.applyScreenBoundaries(enemy) : { wasLimited: false };
        if (boundaryResult.wasLimited) {
            enemy.vx = 0;
            enemy.vz = 0;
        }

        return; // Skip all other chase logic during escape mode
    }

    // Z-assessment using precise alignment (±10px from target Z-position)
    const zRepositionThreshold = 10; // Align to within ±10px of target Z-position

    // Initialize chase state if needed
    if (!enemy.chaseState) {
        enemy.chaseState = { zFailCount: 0, lastZFailTime: 0 };
    }

    // MOVE zDifference DECLARATION BEFORE X-overlap detection to fix temporal dead zone
    const zDifference = Math.abs(enemy.z - closestPlayer.z);

    // X-OVERLAP DETECTION: Determine repositioning strategy based on hitbox overlap
    const xDistance = Math.abs(enemy.x - closestPlayer.x);
    const minXSeparation = 170; // Minimum pixels needed for safe Z-movement (accounts for hitbox widths)
    const isXOverlapping = xDistance <= minXSeparation;
    const needsRepositioning = zDifference > zRepositionThreshold;

    // console.log(`[Z_CHASE_STRATEGY] ========== STRATEGY DECISION ==========`);

    // DUAL STRATEGY SELECTION: Trigger when X-overlapping OR when Z-repositioning needed
    // FIX: Prevent X-FIRST re-triggering after initial repositioning is complete
    const needsInitialRepositioning = (isXOverlapping && !enemy.chaseState?.xSeparationAchieved) || needsRepositioning;

    if (needsInitialRepositioning) {
        if (isXOverlapping && !enemy.chaseState?.xSeparationAchieved) {
            // STRATEGY B: X-overlapping + initial repositioning needed → X-first repositioning
            //console.log(`[Z_CHASE_STRATEGY] Using X-FIRST strategy: X-overlapping detected (distance: ${xDistance.toFixed(1)} <= ${minXSeparation}), initial repositioning needed`);

            // Move horizontally to create safe separation, then potentially align vertically if needed
            enemy.chaseState.strategy = 'x_first';
            enemy.chaseState.xTargetSeparation = minXSeparation + 10; // Target separation + buffer

            // Determine direction to move horizontally (away from player)
            const xDirection = enemy.x < closestPlayer.x ? -1 : 1;
            enemy.vx = xDirection * chaseSpeed * 0.8; // Slightly slower for control
            enemy.vz = 0; // No Z movement during X-separation

            //console.log(`[Z_CHASE_STRATEGY] Moving horizontally: vx=${enemy.vx.toFixed(1)}, target separation=${enemy.chaseState.xTargetSeparation}`);
            return; // Exit - continue this strategy next frame
        } else {
            // STRATEGY A: X-separated + Z-different → Z-first repositioning (existing logic)
            //console.log(`[Z_CHASE_STRATEGY] Using Z-FIRST strategy: X-separated (distance: ${xDistance.toFixed(1)} > ${minXSeparation}), Z-diff: ${zDifference.toFixed(1)} > ${zRepositionThreshold}`);
            enemy.chaseState.strategy = 'z_first';
            // Continue with existing Z-first logic below
        }
    } else {
        // No repositioning needed - normal horizontal chase
        //console.log(`[Z_CHASE_STRATEGY] No repositioning needed: X-distance ${xDistance.toFixed(1)} ${isXOverlapping ? '<=' : '>'} ${minXSeparation}, Z-diff ${zDifference.toFixed(1)} ${needsRepositioning ? '>' : '<='} ${zRepositionThreshold}${enemy.chaseState?.xSeparationAchieved ? ', xSeparationAchieved=true' : ''}`);
    }

    // Handle ongoing X-first strategy (when we were previously moving horizontally)
    if (enemy.chaseState?.strategy === 'x_first' && !enemy.chaseState?.xSeparationAchieved) {
        const currentXDistance = Math.abs(enemy.x - closestPlayer.x);

        if (currentXDistance >= enemy.chaseState.xTargetSeparation) {
            // X-separation achieved, now switch to Z-alignment
            //console.log(`[Z_CHASE_STRATEGY] X-separation achieved (${currentXDistance.toFixed(1)} >= ${enemy.chaseState.xTargetSeparation}), switching to Z-alignment`);
            enemy.chaseState.xSeparationAchieved = true;
            enemy.vx = 0; // Stop horizontal movement
            // Continue to Z-repositioning logic below
        } else {
            // Continue horizontal separation
            const xDirection = enemy.x < closestPlayer.x ? -1 : 1;
            enemy.vx = xDirection * chaseSpeed * 0.8;
            enemy.vz = 0;
            return; // Continue X-separation
        }
    }

    // 3D distance check for attack range
    const distance3D = window.calculateEntityDistance ? window.calculateEntityDistance(enemy, closestPlayer) : closestPlayer.distance;

    // Check for collision or 3D attack range
    if (enemy.detectCollidedEntity(enemy.x, enemy.y, enemy.z)?.entityType === 'player' || distance3D <= attackRange) {
        // Reset chase state on successful engagement
        enemy.chaseState = { zFailCount: 0, lastZFailTime: 0 };
        // Transition to attack preparation
        enemy.transitionToBehavior({ type: 'idle', duration: 0.3, canInterrupt: false }, behaviors);
        return;
    }

    // PHASE 1: Z-ASSESSMENT - Check if Z-repositioning needed (zDifference already calculated above)
    const needsZRepositioning = zDifference > zRepositionThreshold;

    if (needsZRepositioning && !enemy.chaseState?.zAligned) {
        // PHASE 2: Z-FIRST REPOSITIONING - Prioritize vertical alignment
        //console.log(`[Z_CHASE] Enemy repositioning: Z-diff ${zDifference.toFixed(1)} > ${zRepositionThreshold}`);

        // Calculate Z-movement direction and speed
        const zDirection = enemy.z < closestPlayer.z ? 1 : -1;
        const zRepositionSpeed = Math.min(chaseSpeed * 0.6, zDifference * 1.5); // Conservative Z-speed

        // Apply Z-movement with collision checking
        const proposedZ = enemy.z + (zDirection * zRepositionSpeed * dt);
        const correctedZ = window.applyCollisionCorrection ?
            window.applyCollisionCorrection(enemy, enemy.x, enemy.y, proposedZ, 'z') :
            proposedZ;

        // Check if Z-movement is possible (not blocked)
        if (Math.abs(correctedZ - proposedZ) < 2) { // Small tolerance for floating point
            enemy.z = correctedZ;
            enemy.vz = zDirection * zRepositionSpeed;

            // Check if Z-alignment achieved
            const newZDifference = Math.abs(enemy.z - closestPlayer.z);
            if (newZDifference <= zRepositionThreshold) {
                //console.log(`[Z_CHASE] Z-alignment achieved: ${newZDifference.toFixed(1)} <= ${zRepositionThreshold}`);
                enemy.chaseState = { ...enemy.chaseState, zAligned: true };
                enemy.vz = 0; // Stop Z-movement
            }

            // During Z-repositioning, maintain safe X-distance to avoid collision conflicts
            enemy.vx = 0; // Don't move horizontally while repositioning
            return;
        } else {
            // Z-movement blocked - track failure and apply deadlock prevention
            enemy.chaseState.zFailCount = (enemy.chaseState.zFailCount || 0) + 1;
            enemy.chaseState.lastZFailTime = performance.now();

            //console.log(`[Z_DEADLOCK] Z-repositioning blocked, fail count: ${enemy.chaseState.zFailCount}`);

            // Deadlock prevention: minimum safe distance enforcement
            const minSafeDistance = 50; // pixels - enough to avoid collision conflicts
            const currentXDistance = Math.abs(enemy.x - closestPlayer.x);

            if (enemy.chaseState.zFailCount >= 2 && currentXDistance < minSafeDistance) {
                // Force X-movement away from player before retrying Z-repositioning
                const escapeDirection = enemy.x < closestPlayer.x ? -1 : 1; // Move away
                enemy.vx = escapeDirection * chaseSpeed * 0.8; // Slightly slower for control
                enemy.vz = 0;

                //console.log(`[Z_DEADLOCK] Creating safe distance: ${currentXDistance.toFixed(1)} < ${minSafeDistance}, moving away`);

                // Prevent immediate re-detection during escape - SET ESCAPE FLAGS
                enemy.chaseState.isEscaping = true;
                enemy.chaseState.escapeDirection = escapeDirection;
                enemy.chaseState.escapeUntilXDistance = minSafeDistance;
                return; // Skip normal chase logic
            }

            // Boundary-aware fallback for persistent failures
            const atBoundary = enemy.x <= 50 || enemy.x >= (typeof CANVAS_WIDTH !== 'undefined' ? CANVAS_WIDTH - 50 : 850);
            const persistentZFailure = enemy.chaseState.zFailCount >= 5;

            if (atBoundary && persistentZFailure) {
                //console.log(`[Z_DEADLOCK] Boundary deadlock detected, switching to boundary-aware mode`);
                // Give up chase and return to patrol
                enemy.chaseState = {}; // Reset chase state
                enemy.transitionToBehavior({ type: 'idle', duration: 1.0 }, behaviors);
                return;
            }

            // Mark as unachievable and proceed with horizontal chase only
            enemy.chaseState = { ...enemy.chaseState, zAligned: false, zBlocked: true };
        }
    }

    // Allow Z-repositioning attempts again after sufficient X-distance achieved
    if (enemy.chaseState.escapeUntilXDistance) {
        const currentXDistance = Math.abs(enemy.x - closestPlayer.x);
        if (currentXDistance >= enemy.chaseState.escapeUntilXDistance) {
            //console.log(`[Z_DEADLOCK] Safe distance achieved: ${currentXDistance.toFixed(1)} >= ${enemy.chaseState.escapeUntilXDistance}`);
            delete enemy.chaseState.escapeUntilXDistance;
            enemy.chaseState.zFailCount = 0; // Reset failure count
        }
    }

    // PHASE 3: X-PURSUIT - Horizontal chase toward (now Z-aligned) target
    //console.log(`[Z_CHASE] Horizontal pursuit: distance=${distance3D.toFixed(1)}, Z-aligned=${!!enemy.chaseState?.zAligned}`);

    if (closestPlayer.distance > (behaviors.chase?.radiusX || 300) * 1.5) {
        // Player too far - reset chase state and consult BT
        enemy.chaseState = { zFailCount: 0, lastZFailTime: 0 };
        const nextBehavior = enemy.consultBTForBehavior(players);
        enemy.transitionToBehavior(nextBehavior, behaviors);
        return;
    }

    // Continue horizontal chasing
    const xDirection = enemy.x < closestPlayer.x ? 1 : -1;
    enemy.vx = xDirection * chaseSpeed;
    enemy.vz = 0; // No Z-movement during horizontal pursuit

    // Boundary enforcement
    const boundaryResult = window.applyScreenBoundaries ? window.applyScreenBoundaries(enemy) : { wasLimited: false };
    if (boundaryResult.wasLimited) {
        enemy.vx = 0;
        enemy.vz = 0;
    }
}

// ===========================================
// COLLISION DETECTION METHODS
// ===========================================

/**
 * Check if entity is currently in collision with other entities
 * @param {BaseEnemy} enemy - The enemy instance
 * @param {Object} gameState - Game state object
 * @param {Array} players - Array of player entities
 * @returns {boolean} True if colliding with another entity
 */
function checkIfInCollision(enemy, gameState, players) {
    // Get all other entities
    const allEntities = gameState ? gameState.getAllEntities() :
        [...players, enemy, window.ally].filter(e => e !== null && e !== undefined);
    const others = allEntities.filter(e => e !== enemy && e !== null && e !== undefined);

    // Check collision with each other entity at current position
    for (const other of others) {
        const hasCollision = window.checkEntityCollision ?
            window.checkEntityCollision(enemy, other, 'movement', {
                entity1Pos: { x: enemy.x, y: enemy.y, z: enemy.z }, // Current position
                buffer: 0 // No buffer for precise collision check
            }) : false;

        if (hasCollision) {
            //console.log(`[COLLISION_CHECK] Entity ${enemy.entityType} is currently colliding with ${other.entityType}`);
            return true;
        }
    }

    return false;
}

// ===========================================
// MODULE EXPORTS
// ===========================================

window.EnemyMovement = {
    handleMovement,
    updateVerticalMovementBehavior,
    updateWalkingBehavior,
    updateRunningBehavior,
    checkIfInCollision
};
