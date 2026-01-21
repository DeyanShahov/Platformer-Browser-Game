/**
 * Enemy Death Module
 * Handles all enemy death sequences, defeat processing, and cleanup
 * Extracted from BaseEnemy class to improve separation of concerns
 */

// ===========================================
// DEATH SEQUENCE METHODS
// ===========================================

/**
 * Death sequence (can be overridden by subclasses)
 * @param {BaseEnemy} enemy - The enemy instance
 */
function die(enemy) {
    enemy.isDying = true;
    enemy.health = 0;

    console.log(`[BASE ENEMY] ${enemy.constructor.name} defeated!`);

    // Transition to death state (animation will be handled by FSM)
    if (enemy.stateMachine) {
        console.log(`[ENEMY_DIE] Calling stateMachine.handleAction('die') for ${enemy.constructor.name}`);
        enemy.stateMachine.handleAction('die');
    } else {
        console.warn(`[ENEMY_DIE] No stateMachine available for ${enemy.constructor.name}`);
    }

    // Note: Combat system handles unregistering from combat manager after animation completes
}

/**
 * Update death animation (wait for animation completion)
 * @param {BaseEnemy} enemy - The enemy instance
 * @param {number} dt - Delta time
 */
function updateDeath(enemy, dt) {
    if (!enemy.isDying) return;

    enemy.deathTimer += dt;

    // Get death animation duration dynamically from animation definition
    const deathAnimationDuration = enemy.animation?.animationDefinition?.duration || 3.0;

    // Wait for animation to complete (use dynamic duration instead of hardcoded 3.0)
    if (enemy.deathTimer >= deathAnimationDuration) {
        enemy.visible = false;
        // Trigger enemy defeat handling (moved from combat system to here)
        if (window.handleEnemyDefeat) {
            window.handleEnemyDefeat(null, enemy); // Call global function from game.js
        }
    }
}

// ===========================================
// REWARD CALCULATION METHODS
// ===========================================

/**
 * Get experience reward (should be overridden by subclasses)
 * @param {BaseEnemy} enemy - The enemy instance
 * @returns {number} Experience reward amount
 */
function getExperienceReward(enemy) {
    return 100 + (enemy.level - 1) * 25;
}

/**
 * Get gold reward (should be overridden by subclasses)
 * @param {BaseEnemy} enemy - The enemy instance
 * @returns {number} Gold reward amount
 */
function getGoldReward(enemy) {
    return 10 + (enemy.level - 1) * 2;
}

// ===========================================
// MODULE EXPORTS
// ===========================================

window.EnemyDeath = {
    die,
    updateDeath,
    getExperienceReward,
    getGoldReward
};
