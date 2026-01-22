// ===========================================
// COLLISION UTILS - Utility functions for collision support
// ===========================================

/**
 * Calculate precise edge-to-edge distance between two entities
 * Accounts for per-frame hitboxes and Z-axis depth.
 * @param {Object} entity1 - Source entity
 * @param {Object} entity2 - Target entity
 * @returns {number} Distance in pixels
 */
function calculateEntityDistance(entity1, entity2) {
    if (!entity1 || !entity2) return Infinity;

    const hBox1 = getCurrentHitBoxPosition(entity1);
    const hBox2 = getCurrentHitBoxPosition(entity2);

    let distance;

    if (hBox1 && hBox2) {
        // Calculate horizontal edge-to-edge distance
        const center1 = hBox1.x + hBox1.width / 2;
        const center2 = hBox2.x + hBox2.width / 2;
        // (distance between centers) - (half widths)
        const hDist = Math.max(0, Math.abs(center1 - center2) - (hBox1.width + hBox2.width) / 2);

        // Z distance
        const zDist = Math.abs((entity1.z || 0) - (entity2.z || 0));

        // Combine using Pythagorean theorem
        distance = Math.sqrt(Math.pow(hDist, 2) + Math.pow(zDist, 2));
    } else {
        // FALLBACK improved: Use centered collision boxes instead of visual origins
        // Better fallback logic for more accurate distance calculations

        // Get collision dimensions with better defaults based on entity type
        let colW1, colH1, colW2, colH2;

        if (entity1.entityType === 'player') {
            // Player has standardized dimensions
            colW1 = entity1.collisionW || 65;
            colH1 = entity1.collisionH || 260;
        } else if (entity1.entityType === 'enemy' || entity1.entityType === 'blue_slime') {
            // Enemy dimensions
            colW1 = entity1.collisionW || entity1.w * 0.4 || 80;
            colH1 = entity1.collisionH || entity1.h * 0.6 || 60;
        } else {
            // Generic fallback
            colW1 = entity1.collisionW || entity1.w * 0.5 || 100;
            colH1 = entity1.collisionH || entity1.h * 0.5 || 100;
        }

        if (entity2.entityType === 'player') {
            colW2 = entity2.collisionW || 65;
            colH2 = entity2.collisionH || 260;
        } else if (entity2.entityType === 'enemy' || entity2.entityType === 'blue_slime') {
            colW2 = entity2.collisionW || entity2.w * 0.4 || 80;
            colH2 = entity2.collisionH || entity2.h * 0.6 || 60;
        } else {
            colW2 = entity2.collisionW || entity2.w * 0.5 || 100;
            colH2 = entity2.collisionH || entity2.h * 0.5 || 100;
        }

        // Calculate centers of collision boxes (centered within visual frames)
        const c1x = entity1.x + (entity1.w - colW1) / 2;
        const c1y = entity1.y + (entity1.h - colH1) / 2;
        const c2x = entity2.x + (entity2.w - colW2) / 2;
        const c2y = entity2.y + (entity2.h - colH2) / 2;

        // Calculate horizontal edge-to-edge distance between centered collision boxes
        const hDist = Math.max(0, Math.abs(c1x - c2x) - (colW1 + colW2) / 2);
        const vDist = Math.max(0, Math.abs(c1y - c2y) - (colH1 + colH2) / 2);
        const dz = Math.abs((entity1.z || 0) - (entity2.z || 0));

        // Use 3D distance for more accurate calculations
        distance = Math.sqrt(hDist * hDist + vDist * vDist + dz * dz);

        // Enhanced logging for debugging
        if (!hBox1 || !hBox2) {
            const animReady1 = isAnimationSystemReadyForEntity(entity1);
            const animReady2 = isAnimationSystemReadyForEntity(entity2);
            const rawDist = Math.sqrt(
                Math.pow(entity1.x - entity2.x, 2) +
                Math.pow((entity1.z || 0) - (entity2.z || 0), 2)
            );
            //console.log(`[DISTANCE_FALLBACK] Animation not ready for: ${!animReady1 ? entity1.entityType + '(no anim)' : ''} ${!animReady2 ? entity2.entityType + '(no anim)' : ''}. Fallback: ${distance.toFixed(1)}px (Raw origin dist: ${rawDist.toFixed(1)}px)`);
        }
    }

    return distance;
}

// Helper functions - duplicated for self-containment
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

    // Calculate hit box position consistently with AnimationRenderer
    const zOffset = entity.z * 1.0;
    const drawX = entity.x;
    const drawY = entity.y - entity.h - zOffset;

    let boxX, boxY;

    // Position relative to sprite coordinates
    boxX = drawX + hitBoxData.x;

    // Rectangle vs Sprite branching for Y-axis
    if (animationDef.spriteSheet && entity.animationEntityType !== 'blue_slime') {
        boxY = drawY + entity.h / 2 - hitBoxData.y;
    } else {
        boxY = drawY + entity.h - hitBoxData.height;
    }

    // DISABLED mirroring for BODY hitboxes (collisionType !== 'attack')
    // The renderer pivots the whole frame around the hitbox center, so the physical box remains at the same world X.

    return {
        x: boxX,
        y: boxY,
        width: hitBoxData.width,
        height: hitBoxData.height
    };
}

function isAnimationSystemReadyForEntity(entity) {
    return entity.animation &&
        entity.animation.animationDefinition &&
        entity.animation.animationDefinition.frameData &&
        entity.animation.currentFrame !== undefined &&
        entity.animation.animationDefinition.frameData[entity.animation.currentFrame];
}

// Export to global scope for backward compatibility
window.calculateEntityDistance = calculateEntityDistance;
