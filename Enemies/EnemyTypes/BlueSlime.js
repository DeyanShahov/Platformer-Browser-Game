/**
 * Blue Slime Enemy Type
 * Specific implementation of a blue slime enemy using centralized configuration system
 * Inherits from BaseEnemy and adds slime-specific behavior
 */

class BlueSlime extends BaseEnemy {
    constructor(x, y, z, level = 1) {
        // Get configuration from centralized manager
        const config = EnemyTypeManager.getEnemyConfig('slime');
        const completeData = EnemyTypeManager.getCompleteEnemyData('slime', null, level);

        // Set up base configuration with stats from manager
        const enemyConfig = {
            // Dimensions (scaled for sprite)
            w: 240,  // Visual width (2x scaled sprite: 120*2)
            h: 256,  // Visual height (2x scaled sprite: 128*2)
            collisionW: 100,  // Standardized fallback width
            collisionH: 70,   // Standardized fallback height
            zThickness: 3,   // Z thickness for 2.5D collision

            // Stats (from centralized manager)
            maxHealth: completeData.stats.maxHealth,
            baseAttack: completeData.stats.baseAttack,
            baseDefense: completeData.stats.baseDefense,
            strength: completeData.stats.strength,
            criticalChance: completeData.stats.criticalChance,
            speed: completeData.stats.speed,

            // AI configuration
            rarity: config.rarity,        // BT rarity level
            intelligence: config.intelligence,   // BT intelligence level

            // Animation
            animationEntityType: config.animationEntityType,

            // Rewards (from centralized manager)
            experienceReward: completeData.rewards.experience,
            goldReward: completeData.rewards.gold,

            // Level for rewards
            level: level
        };

        // Call BaseEnemy constructor with position and config
        super(x, y, z, enemyConfig);

        // Blue Slime specific properties
        this.level = level;
        this.experienceReward = completeData.rewards.experience;
        this.goldReward = completeData.rewards.gold;

        // Log detailed enemy information for debugging and verification
        console.log(`[BLUE SLIME] Created Blue Slime (Level ${level}) at (${x}, ${y}) with ${this.maxHealth} HP`);
        console.log(`[BLUE SLIME] - Stats: HP=${completeData.stats.maxHealth}, ATK=${completeData.stats.baseAttack}, DEF=${completeData.stats.baseDefense}`);
        console.log(`[BLUE SLIME] - Rarity: ${completeData.config.rarity}, Intelligence: ${completeData.config.intelligence}`);
        console.log(`[BLUE SLIME] - Rewards: ${completeData.rewards.experience} XP, ${completeData.rewards.gold} Gold`);
        console.log(`[BLUE SLIME] - Special Abilities: [${completeData.config.specialAbilities.join(', ')}]`);
    }

    // Override attack profile for Blue Slime (only light attacks)
    createAttackProfile() {
        const config = EnemyTypeManager.getEnemyConfig('slime');
        return window.createAttackProfile ? window.createAttackProfile(config.attackProfile) : null;
    }

    // Take damage from player attacks
    takeDamage(damage) {
        if (this.isDying) return 0;

        this.health -= damage;
        this.hit = true;

        console.log(`[BLUE SLIME] Took ${damage} damage, health: ${this.health}/${this.maxHealth}`);

        if (this.health <= 0) {
            window.EnemyDeath.die(this);
            return damage; // Return full damage dealt
        }

        // Play hurt animation
        if (this.stateMachine) {
            this.stateMachine.forceState('hurt');
        }

        return damage;
    }

    // Get experience reward for defeating this enemy (from centralized manager)
    getExperienceReward() {
        const config = EnemyTypeManager.getEnemyConfig('slime');
        const rewards = EnemyTypeManager.getEnemyRewards(config, this.level);
        return rewards.experience;
    }

    // Get gold reward (from centralized manager)
    getGoldReward() {
        const config = EnemyTypeManager.getEnemyConfig('slime');
        const rewards = EnemyTypeManager.getEnemyRewards(config, this.level);
        return rewards.gold;
    }
}

// ===========================================
// FACTORY FUNCTION
// ===========================================

/**
 * Factory function to create Blue Slime
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} z - Z position
 * @param {number} level - Enemy level
 * @returns {BlueSlime} New BlueSlime instance
 */
function createBlueSlime(x, y, z, level = 1) {
    return new BlueSlime(x, y, z, level);
}

// ===========================================
// MODULE EXPORTS
// ===========================================

window.BlueSlime = BlueSlime;
window.createBlueSlime = createBlueSlime;
