// ===========================================
// COLLISION CORRECTION - Collision response and correction logic
// ===========================================

/**
 * Collision correction function - allows animations but corrects position
 * @param {Object} entity - The entity to correct
 * @param {number} proposedX - Proposed X position
 * @param {number} proposedY - Proposed Y position
 * @param {number} proposedZ - Proposed Z position
 * @param {string} axis - The axis to correct ('x', 'y', 'z')
 * @param {Object} options - Additional options including buffer
 * @returns {number} Corrected position value
 */
function applyCollisionCorrection(entity, proposedX, proposedY, proposedZ, axis, options = {}) {
    const buffer = options.buffer || 0; // Allow custom buffer for AI vs player movement
    // Get all other entities
    const allEntities = window.gameState ? window.gameState.getAllEntities() :
        [...players, window.enemy, window.ally].filter(e => e !== null && e !== undefined);
    const others = allEntities.filter(e => e !== entity && e !== null && e !== undefined);

    //console.log(`[COLLISION_SYSTEM_CORRECTION] Checking ${entity.entityType} movement on ${axis}-axis. Others: ${others.length}`);

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
            //console.log(`[COLLISION_SYSTEM_CORRECTION] COLLISION DETECTED: ${entity.entityType} vs ${other.entityType} on ${axis}-axis`);
            //console.log(`[COLLISION_SYSTEM_CORRECTION] Entity positions: ${entity.entityType}(${entity.x.toFixed(1)}, ${entity.z.toFixed(1)}) vs ${other.entityType}(${other.x.toFixed(1)}, ${other.z.toFixed(1)})`);

            // Calculate correction based on collision direction
            if (axis === 'x') {
                //console.log(`[COLLISION_SYSTEM_CORRECTION] Applying X-axis correction for ${entity.entityType}`);
                // For X-axis collision, find the closest valid position
                const entityHitBox = getCurrentHitBoxPosition(entity);
                const otherHitBox = getCurrentHitBoxPosition(other);

                //console.log(`[COLLISION_SYSTEM_CORRECTION] DEBUG: entityHitBox for ${entity.entityType}:`, entityHitBox);
                //console.log(`[COLLISION_SYSTEM_CORRECTION] DEBUG: otherHitBox for ${other.entityType}:`, otherHitBox);
                //console.log(`[COLLISION_SYSTEM_CORRECTION] DEBUG: entityHitBox exists: ${!!entityHitBox}, otherHitBox exists: ${!!otherHitBox}`);

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

                    //console.log(`[COLLISION_SYSTEM_CORRECTION] Overlap X: ${overlapX.toFixed(1)}, Y: ${overlapY.toFixed(1)}`);

                    // If there's actual overlap, calculate separation
                    if (overlapX > 0 && overlapY > 0) {
                        // Determine separation direction based on centers
                        const entityCenterX = proposedHitBoxX + entityHitBox.width / 2;
                        const otherCenterX = otherHitBox.x + otherHitBox.width / 2;

                        // Calculate separation distance (split overlap equally)
                        const separationX = overlapX / 2 + 1; // +1 pixel buffer to prevent sticking

                        //console.log(`[COLLISION_SYSTEM_CORRECTION] Separation direction: ${entityCenterX < otherCenterX ? 'LEFT' : 'RIGHT'}`);
                        //console.log(`[COLLISION_SYSTEM_CORRECTION] Centers: Entity(${entityCenterX.toFixed(1)}) vs Other(${otherCenterX.toFixed(1)})`);
                        //console.log(`[COLLISION_SYSTEM_CORRECTION] Separation distance: ${separationX.toFixed(1)}px`);

                        if (entityCenterX < otherCenterX) {
                            // Entity is to the left, push it further left
                            const correctedHitBoxX = proposedHitBoxX - separationX;
                            const correctedEntityX = entity.x + (correctedHitBoxX - entityHitBox.x);
                            //console.log(`[COLLISION_SYSTEM_CORRECTION] CORRECTING: push left by ${separationX.toFixed(1)}px`);
                            //console.log(`[COLLISION_SYSTEM_CORRECTION] RESULT: X from ${proposedX.toFixed(1)} to ${correctedEntityX.toFixed(1)}`);
                            return correctedEntityX;
                        } else {
                            // Entity is to the right, push it further right
                            const correctedHitBoxX = proposedHitBoxX + separationX;
                            const correctedEntityX = entity.x + (correctedHitBoxX - entityHitBox.x);
                            //console.log(`[COLLISION_SYSTEM_CORRECTION] CORRECTING: push right by ${separationX.toFixed(1)}px`);
                            //console.log(`[COLLISION_SYSTEM_CORRECTION] RESULT: X from ${proposedX.toFixed(1)} to ${correctedEntityX.toFixed(1)}`);
                            return correctedEntityX;
                        }
                    } else {
                        //console.log(`[COLLISION_CORRECTION] No overlap detected, allowing movement`);
                        return proposedX;
                    }
                }
            } else if (axis === 'z') {
                // For Z-axis collision (depth), checks should apply to ALL entities
                // This ensures enemies don't stack on top of each other

                const zDifference = proposedZ - other.z;
                const entityThickness = entity.zThickness || 3;
                const otherThickness = other.zThickness || 3;
                const minZDistance = entityThickness + otherThickness + 10; // 10px buffer for player

                if (Math.abs(zDifference) < minZDistance) {
                    //console.log(`[COLLISION_CORRECTION] Z-axis clash with PLAYER detected. Diff: ${zDifference.toFixed(1)}`);
                    const correction = zDifference > 0 ? minZDistance : -minZDistance;
                    const correctedZ = other.z + correction;
                    return correctedZ;
                }
            }

            // For now, return current position if we can't determine correction
            //console.log(`[COLLISION CORRECTION] Returning current position (correction failed)`);
            if (axis === 'z') return entity.z;
            if (axis === 'y') return entity.y;
            return entity.x;
        }
    }

    // No collision, return proposed position
    if (axis === 'z') return proposedZ;
    if (axis === 'y') return proposedY;
    return proposedX;
}

// Helper function - REMOVED DUPLICATION
// Uses unified getCurrentHitBoxPosition from entity_collision.js

// Export to global scope for backward compatibility
window.applyCollisionCorrection = applyCollisionCorrection;
