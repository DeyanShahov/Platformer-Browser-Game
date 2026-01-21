/**
 * Blue Slime Enemy Type
 * Specific implementation of a blue slime enemy
 * Inherits from BaseEnemy and adds slime-specific behavior
 */

class BlueSlime extends BaseEnemy {
    constructor(x, y, z, level = 1) {
        // Blue Slime specific configuration
        const config = {
            // Dimensions (scaled for sprite)
            w: 240,  // Visual width (2x scaled sprite: 120*2)
            h: 256,  // Visual height (2x scaled sprite: 128*2)
            collisionW: 100,  // Standardized fallback width
            collisionH: 70,   // Standardized fallback height
            zThickness: 3,   // Z thickness for 2.5D collision

            // Stats (Blue Slime specific)
            maxHealth: 80 + (level - 1) * 20, // 80 base + 20 per level
            baseAttack: 8 + (level - 1) * 2,   // 8 base + 2 per level
            baseDefense: 2,
            speed: 40, // Slower than player

            // Character info
            strength: 5 + level,
            criticalChance: 0.03, // 3% crit chance

            // AI configuration
            rarity: 'common',        // BT rarity level
            intelligence: 'basic',   // BT intelligence level

            // Animation
            animationEntityType: 'blue_slime',

            // Level for rewards
            level: level,

            // TEST SCRIPT: Vertical ping-pong movement
            // scriptConfig: {
            //   scriptId: 'blue_slime_vertical_test',
            //   type: window.enemyAIConfig?.SCRIPT_TYPE?.FULL || 'full'
            // }
        };

        // Call BaseEnemy constructor with position and config
        super(x, y, z, config);

        // ADD THIS: Comprehensive script debugging
        // console.log(`%c[BLUE SLIME DEBUG] Constructor - Script System Check`, 'color: #ff6b6b; font-weight: bold; font-size: 14px;');
        // console.log('[BLUE SLIME DEBUG] scriptConfig:', this.scriptConfig);
        // console.log('[BLUE SLIME DEBUG] window.enemyScripts exists:', !!window.enemyScripts);
        // console.log('[BLUE SLIME DEBUG] window.enemyScriptManager exists:', !!window.enemyScriptManager);
        // console.log('[BLUE SLIME DEBUG] window.enemyAIConfig exists:', !!window.enemyAIConfig);
        // console.log('[BLUE SLIME DEBUG] SCRIPT_TYPE available:', !!window.enemyAIConfig?.SCRIPT_TYPE);

        // if (this.scriptConfig?.scriptId) {
        //   console.log(`[BLUE SLIME DEBUG] Looking for script: ${this.scriptConfig.scriptId}`);
        //   const scriptExists = window.enemyScripts?.hasScript(this.scriptConfig.scriptId);
        //   console.log(`[BLUE SLIME DEBUG] Script exists in registry: ${scriptExists}`);

        //   if (scriptExists) {
        //     const script = window.enemyScripts.getScript(this.scriptConfig.scriptId);
        //     console.log(`[BLUE SLIME DEBUG] Script loaded:`, script);
        //     console.log(`[BLUE SLIME DEBUG] Script type: ${script.type}`);
        //     console.log(`[BLUE SLIME DEBUG] Has behaviorTree: ${!!script.behaviorTree}`);
        //   }
        // }

        // Check if async initialization happened
        // setTimeout(() => {
        //   console.log(`%c[BLUE SLIME DEBUG] Post-constructor check (100ms delay)`, 'color: #4ecdc4; font-weight: bold;');
        //   console.log('[BLUE SLIME DEBUG] activeScript:', !!this.activeScript);
        //   if (this.activeScript) {
        //     console.log('[BLUE SLIME DEBUG] activeScript details:', this.activeScript);
        //   }
        // }, 100);

        // Blue Slime specific properties
        this.level = level;

        console.log(`[BLUE SLIME] Created Blue Slime (Level ${level}) at (${x}, ${y}) with ${this.maxHealth} HP`);
    }

    // Override attack profile for Blue Slime (only light attacks)
    createAttackProfile() {
        return window.createAttackProfile ? window.createAttackProfile(["light"]) : null;
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

    // Get experience reward for defeating this enemy
    getExperienceReward() {
        return 150 + (this.level - 1) * 50; // 150 base + 50 per level
    }

    // Get gold reward
    getGoldReward() {
        return 15 + (this.level - 1) * 5; // 15 base + 5 per level
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
