/**
 * Enemy Combat Module
 * Handles all enemy combat interactions, damage taking, and attack behaviors
 * Extracted from BaseEnemy class to improve separation of concerns
 */

// ===========================================
// COMBAT BEHAVIOR METHODS
// ===========================================

/**
 * Attack behavior: check for animation completion and consult BT
 * @param {BaseEnemy} enemy - The enemy instance
 * @param {Array} players - Array of player entities
 * @param {number} dt - Delta time
 * @param {Object} behaviors - Behavior configuration
 */
function updateAttackBehavior(enemy, players, dt, behaviors) {
    //console.log(`[ATTACK_DEBUG] Current state: ${enemy.stateMachine?.getCurrentStateName()}, isInAttackState: ${enemy.stateMachine?.isInAttackState()}, animation: ${enemy.animation?.currentAnimation}, frame: ${enemy.animation?.currentFrame}`);

    // Initialize timeout tracking
    if (!enemy.attackTimeoutStart) {
        enemy.attackTimeoutStart = performance.now();
    }

    // Fallback: Check if attack animation has completed (state machine transition)
    if (enemy.stateMachine && !enemy.stateMachine.isInAttackState()) {
        console.log(`%c[NORMAL BEHAVIOR] ${enemy.constructor.name} #${enemy.instanceId} attack completed - consulting BT for next action`, 'color: #0088ff; font-weight: bold; font-size: 14px;');
        const nextBehavior = enemy.consultBTForBehavior(players, { reason: 'attack_complete' });
        enemy.transitionToBehavior(nextBehavior, behaviors);
        return;
    }
}

// ===========================================
// DAMAGE HANDLING METHODS
// ===========================================

/**
 * Take damage from player attacks
 * @param {BaseEnemy} enemy - The enemy instance
 * @param {number} damage - Amount of damage to take
 * @returns {number} Actual damage dealt
 */
function takeDamage(enemy, damage) {
    if (enemy.isDying) return 0;

    enemy.health -= damage;
    enemy.hit = true;

    //console.log(`[BASE ENEMY] Took ${damage} damage, health: ${enemy.health}/${enemy.maxHealth}`);

    if (enemy.health <= 0) {
        window.EnemyDeath.die(enemy);
        return damage; // Return full damage dealt
    }

    // Play hurt animation
    if (enemy.stateMachine) {
        enemy.stateMachine.forceState('hurt');
    }

    return damage;
}

// ===========================================
// COMBAT UTILITY METHODS
// ===========================================

/**
 * Helper: Get closest player using precise edge-to-edge distance
 * @param {BaseEnemy} enemy - The enemy instance
 * @param {Array} players - Array of player entities
 * @returns {Object|null} Closest player with distance or null
 */
function getClosestPlayer(enemy, players) {
    if (!players || players.length === 0) return null;

    return players.reduce((closest, player) => {
        // Precise edge-to-edge distance (robust for non-centered hitboxes and mirroring)
        const distance = window.calculateEntityDistance ? window.calculateEntityDistance(enemy, player) :
            Math.sqrt(Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.z - player.z, 2));

        if (!closest || distance < closest.distance) {
            return { ...player, distance };
        }
        return closest;
    }, null);
}

// ===========================================
// MODULE EXPORTS
// ===========================================

window.EnemyCombat = {
    updateAttackBehavior,
    takeDamage,
    getClosestPlayer
};
