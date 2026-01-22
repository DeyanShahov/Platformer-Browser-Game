// ===========================================
// AI CONSTRAINTS - AI behavior constraints and screen boundaries
// ===========================================

/**
 * Behavior constraints function - determines which behaviors are physically possible
 * Now uses centralized enemy AI utilities for consistency
 * Accepts optional dynamicBlocked for merging with static constraints
 * @param {Object} entity - The entity to check constraints for
 * @param {Set} dynamicBlocked - Optional set of dynamically blocked behaviors
 * @returns {Object} Constraints object with allowed/blocked behaviors and reasons
 */
function getBehaviorConstraints(entity, dynamicBlocked = null) {
    const constraints = {
        allowed: new Set(['idle', 'attack', 'chase']), // Always allowed
        blocked: new Set(),
        reasons: {},
        dynamicBlocked: dynamicBlocked || new Set() // ← НОВО: Dynamic blocked behaviors
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
    const canMoveUp = entity.z < Z_MAX;   // Z increases as we move up the screen (towards background)
    const canMoveDown = entity.z > Z_MIN; // Z decreases as we move down the screen (towards foreground)

    if (!canMoveUp) {
        constraints.blocked.add('move_up');
        constraints.reasons.move_up = 'screen_boundary_top';
    } else {
        constraints.allowed.add('move_up');
    }

    if (!canMoveDown) {
        constraints.blocked.add('move_down');
        constraints.reasons.move_down = 'screen_boundary_bottom';
    } else {
        constraints.allowed.add('move_down');
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

    //console.log(`[BEHAVIOR_CONSTRAINTS] ${entity.entityType} constraints:`, {
    //    allowed: Array.from(constraints.allowed),
    //    blocked: Array.from(constraints.blocked),
    //    reasons: constraints.reasons
    //});

    return constraints;
}

/**
 * Universal screen boundaries function - checks and applies boundaries, returns interruption info
 * @param {Object} entity - The entity to apply boundaries to
 * @returns {Object} Result object with wasLimited property
 */
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
            //console.log(`[SCREEN_BOUNDARIES] ${entity.entityType} hit left boundary, clamping X from ${entity.x} to ${leftBoundary}`);
            entity.x = leftBoundary;
            entity.vx = 0; // Stop horizontal movement
            wasLimited = true;
        } else if (entity.x > rightBoundary) {
            //console.log(`[SCREEN_BOUNDARIES] ${entity.entityType} hit right boundary, clamping X from ${entity.x} to ${rightBoundary}`);
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

        //console.log(`[SCREEN_BOUNDARIES] ${entity.entityType} fallback boundaries - left: ${leftBoundary}, right: ${rightBoundary}, width: ${entityWidth}`);

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
        //console.log(`[SCREEN_BOUNDARIES] ${entity.entityType} hit bottom boundary, clamping Z from ${entity.z} to ${Z_MIN}`);
        entity.z = Z_MIN;
        entity.vz = 0; // Stop vertical movement
        wasLimited = true;
    } else if (entity.z > Z_MAX) {
        //console.log(`[SCREEN_BOUNDARIES] ${entity.entityType} hit top boundary, clamping Z from ${entity.z} to ${Z_MAX}`);
        entity.z = Z_MAX;
        entity.vz = 0; // Stop vertical movement
        wasLimited = true;
    }

    return { wasLimited };
}

// Helper functions - duplicated for self-containment
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

//// REMOVED DUPLICATED getCurrentHitBoxPosition - now uses unified version from entity_collision.js

// Export to global scope for backward compatibility
window.getBehaviorConstraints = getBehaviorConstraints;
window.applyScreenBoundaries = applyScreenBoundaries;
