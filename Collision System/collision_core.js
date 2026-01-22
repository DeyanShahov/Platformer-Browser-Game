// ===========================================
// COLLISION CORE - Basic collision detection primitives
// ===========================================

/**
 * Basic collision detection function
 * @param {number} ax - Entity A X position
 * @param {number} ay - Entity A Y position
 * @param {number} az - Entity A Z position
 * @param {number} aw - Entity A width
 * @param {number} ah - Entity A height
 * @param {number} azThickness - Entity A Z thickness
 * @param {number} tx - Entity Target X position
 * @param {number} ty - Entity Target Y position
 * @param {number} tz - Entity Target Z position
 * @param {number} tw - Entity Target width
 * @param {number} th - Entity Target height
 * @param {number} tzThickness - Entity Target Z thickness
 * @param {number} zTolerance - Z-axis tolerance for collision
 * @returns {boolean} True if collision detected
 */
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

/**
 * Enhanced collision check with buffer support
 * @param {number} ax - Entity A X position
 * @param {number} ay - Entity A Y position
 * @param {number} az - Entity A Z position
 * @param {number} aw - Entity A width
 * @param {number} ah - Entity A height
 * @param {number} azThickness - Entity A Z thickness
 * @param {number} tx - Entity Target X position
 * @param {number} ty - Entity Target Y position
 * @param {number} tz - Entity Target Z position
 * @param {number} tw - Entity Target width
 * @param {number} th - Entity Target height
 * @param {number} tzThickness - Entity Target Z thickness
 * @param {number} zTolerance - Z-axis tolerance for collision
 * @param {number} buffer - Collision buffer to shrink entity A box
 * @returns {boolean} True if collision detected
 */
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

// Export to global scope for backward compatibility
window.checkCollision = checkCollision;
window.checkCollisionWithBuffer = checkCollisionWithBuffer;
