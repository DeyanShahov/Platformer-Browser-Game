// Enemy Combat Manager - moved from combat_system.js
class EnemyCombatManager {
    constructor() {
        this.enemyAttackCooldowns = new Map(); // enemy -> current cooldown time
        this.defaultAttackCooldown = 1.0; // 1 second between attacks per enemy
    }

    // Register an enemy for combat management
    registerEnemy(enemy) {
        this.enemyAttackCooldowns.set(enemy, 0);
        //console.log(`[ENEMY COMBAT] Registered enemy for combat:`, enemy);
    }

    // Unregister enemy (when defeated or removed)
    unregisterEnemy(enemy) {
        this.enemyAttackCooldowns.delete(enemy);
        //console.log(`[ENEMY COMBAT] Unregistered enemy from combat:`, enemy);
    }

    // Check if enemy can attack (cooldown expired)
    canEnemyAttack(enemy) {
        const cooldown = this.enemyAttackCooldowns.get(enemy);
        return cooldown !== undefined && cooldown <= 0;
    }

    // Perform enemy attack on player
    performEnemyAttack(enemy, player) {
        if (!this.canEnemyAttack(enemy)) {
            return false;
        }

        // Execute the attack
        const attackResult = window.combatResolver.resolveAttack(enemy, player, 'enemy_attack');

        // Set attack cooldown for this enemy
        this.enemyAttackCooldowns.set(enemy, this.defaultAttackCooldown);

        //console.log(`[ENEMY COMBAT] Enemy attacked player. Cooldown set to ${this.defaultAttackCooldown}s`);
        return attackResult !== null;
    }

    // Update all enemy attack cooldowns
    updateCooldowns(dt) {
        let updatedCount = 0;
        for (let [enemy, cooldown] of this.enemyAttackCooldowns) {
            if (cooldown > 0) {
                this.enemyAttackCooldowns.set(enemy, cooldown - dt);
                updatedCount++;
            }
        }

        if (updatedCount > 0) {
            console.log(`[ENEMY COMBAT] Updated ${updatedCount} enemy cooldowns`);
        }
    }

    // Get current cooldown for an enemy
    getEnemyCooldown(enemy) {
        return this.enemyAttackCooldowns.get(enemy) || 0;
    }

    // Force reset cooldown for an enemy (for testing or special cases)
    resetEnemyCooldown(enemy) {
        this.enemyAttackCooldowns.set(enemy, 0);
        //console.log(`[ENEMY COMBAT] Reset cooldown for enemy:`, enemy);
    }

    // Get all registered enemies
    getRegisteredEnemies() {
        return Array.from(this.enemyAttackCooldowns.keys());
    }

    // Get combat-ready enemies (cooldown <= 0)
    getReadyEnemies() {
        const ready = [];
        for (let [enemy, cooldown] of this.enemyAttackCooldowns) {
            if (cooldown <= 0) {
                ready.push(enemy);
            }
        }
        return ready;
    }
}

// Export globally for traditional JavaScript approach
window.EnemyCombatManager = EnemyCombatManager;
