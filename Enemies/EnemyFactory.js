/**
 * Enemy Factory Module
 * Handles enemy creation and instantiation using centralized configuration system
 * Provides factory functions for different enemy types
 */

// ===========================================
// ENEMY CREATION FUNCTIONS
// ===========================================

/**
 * Create enemy instance with stats using the new dynamic modification system
 * @param {string} enemyType - Type of enemy ('slime', 'bear', etc.)
 * @param {string} enemySubType - Specific variant ('elite', 'boss', etc.)
 * @param {number} level - Enemy level
 * @returns {Object} Created enemy entity
 */
function createEnemyWithData(enemyType, enemySubType, level, x, y, z) {
    // Check if EnemyModifierSystem is available
    if (typeof EnemyModifierSystem === 'undefined' || typeof EnemyModifierSystem.applyDynamicModifications === 'undefined') {
        console.error('[ENEMY FACTORY] EnemyModifierSystem not available! Cannot create enemy.');
        return null;
    }

    // Determine rarity and intelligence based on subtype or defaults
    let rarity = 'common';
    let intelligence = 'basic';

    if (enemySubType === 'elite') {
        rarity = 'elite';
        intelligence = 'normal';
    } else if (enemySubType === 'boss') {
        rarity = 'boss';
        intelligence = 'advanced';
    }

    // Use the new dynamic modification system to create complete enemy configuration
    //const enemyConfig = EnemyModifierSystem.applyDynamicModifications(enemyType = 'slime', enemySubType = null, level = 1, x = null, y = null, z = null);
    const enemyConfig = EnemyModifierSystem.applyDynamicModifications(enemyType, rarity, intelligence, level);

    // Log detailed enemy information for debugging and verification
    //console.log(`[ENEMY] Created ${enemyType}${enemySubType ? ` ${enemySubType}` : ''} (Level ${level})`);
    //console.log(`[ENEMY] - Stats: HP=${enemyConfig.maxHealth}, ATK=${enemyConfig.baseAttack}, DEF=${enemyConfig.baseDefense}`);
    //console.log(`[ENEMY] - Rarity: ${enemyConfig.rarity}, Intelligence: ${enemyConfig.intelligence}`);
    //console.log(`[ENEMY] - Rewards: ${enemyConfig.experienceReward} XP, ${enemyConfig.goldReward} Gold`);
    //console.log(`[ENEMY] - Special Abilities: [${enemyConfig.specialAbilities.join(', ')}]`);

    // Create the enemy using proper inheritance from BaseEnemy
    // Use the correct enemy class based on type (BlueSlime for blue_slime)
    if (enemyType === 'blue_slime' || enemyType === 'slime') {
        // For blue slimes, create a proper BlueSlime instance that inherits from BaseEnemy
        // const enemyY = (typeof CANVAS_HEIGHT !== 'undefined') ? Math.max(200, CANVAS_HEIGHT - 600) : 300;
        // const scaleFactor = (typeof CANVAS_WIDTH !== 'undefined') ? CANVAS_WIDTH / 900 : 1;
        // const enemyX = 450 * scaleFactor;

        // Create proper BlueSlime instance using the factory approach
        //const enemy = new BlueSlime(enemyX, enemyY, 0, level);

        // GET THE ACTUAL POSITION FROM CONFIG OR USE DEFAULTS
        const enemyX = x !== null ? x : 450;
        const enemyY = y !== null ? y : 300;
        const enemyZ = z !== null ? z : 0;

        // Create proper BlueSlime instance using the factory approach
        const enemy = new BlueSlime(enemyX, enemyY, enemyZ, level);


        // Apply any additional dynamic modifications that might be needed for the specific enemy instance
        enemy.maxHealth = enemyConfig.maxHealth;
        enemy.health = enemyConfig.maxHealth;
        // Ensure enemyData has the required getEnemyInfo method for rendering compatibility
        enemy.enemyData = {
            ...enemyConfig,
            getEnemyInfo: function () {
                // Derive display name from the enemy type - this matches what EnemyBaseData would provide
                let displayName = 'Blue Slime'; // Default for BlueSlime
                if (enemyConfig.type && enemyConfig.type !== 'blue_slime') {
                    let displayName = enemyConfig.type.charAt(0).toUpperCase() + enemyConfig.type.slice(1);
                    if (displayName.endsWith('_slime')) {
                        displayName = displayName.replace('_slime', ' Slime');
                    }
                }
                return {
                    type: enemyConfig.type || 'blue_slime',
                    level: enemy.level || 1,
                    displayName: displayName
                };
            }
        };
        enemy.characterInfo.baseAttack = enemyConfig.baseAttack;
        enemy.characterInfo.baseDefense = enemyConfig.baseDefense;
        enemy.characterInfo.strength = enemyConfig.strength;
        enemy.characterInfo.criticalChance = enemyConfig.criticalChance;

        // Register enemy with combat system
        if (window.enemyCombatManager) {
            window.enemyCombatManager.registerEnemy(enemy);
        }

        return enemy;
    } else {
        // Fallback for other enemy types - create base entity and apply modifications
        const enemyY = (typeof CANVAS_HEIGHT !== 'undefined') ? Math.max(200, CANVAS_HEIGHT - 600) : 300;
        const scaleFactor = (typeof CANVAS_WIDTH !== 'undefined') ? CANVAS_WIDTH / 900 : 1;
        const enemyX = 450 * scaleFactor;

        // Create the enemy entity using createEntity (plain object)
        const enemy = window.createEntity(enemyX, enemyY, 0, 60, 60, "#FF3020");

        // Add proper BaseEnemy properties and methods by adding the missing methods
        // This ensures all enemies have required methods for the game loop
        enemy.handleMovement = function (dt, canvasHeight, gravity) {
            // Use the existing EnemyMovement.handleMovement function but bind it properly
            if (window.EnemyMovement && window.EnemyMovement.handleMovement) {
                window.EnemyMovement.handleMovement(this, dt, canvasHeight, gravity);
            }
        };

        // Add Z thickness for 2.5D collision
        enemy.zThickness = 5;// 25;  // Enemy thickness (slightly less than player)

        // Apply stats from the new dynamic system
        enemy.maxHealth = enemyConfig.maxHealth;
        enemy.health = enemyConfig.maxHealth;
        enemy.currentAction = null;
        enemy.executionTimer = 0;
        enemy.hit = false;

        // Entity type for combat system
        enemy.entityType = 'enemy';

        // Add character info for combat system
        enemy.characterInfo = new window.CharacterInfo('enemy');
        enemy.characterInfo.baseAttack = enemyConfig.baseAttack;
        enemy.characterInfo.baseDefense = enemyConfig.baseDefense;
        enemy.characterInfo.strength = enemyConfig.strength;
        enemy.characterInfo.criticalChance = enemyConfig.criticalChance;

        // Death state properties
        enemy.isDying = false;
        enemy.deathTimer = 0;
        enemy.blinkCount = 0;
        enemy.visible = true; // For blink animation

        // Store enemy data for reference (using the complete configuration)
        enemy.enemyData = enemyConfig;

        // Add animation placeholder - will be registered by animation system
        enemy.animation = null;

        // FSM will be added after animation registration in main.js
        enemy.stateMachine = null;

        // Register enemy with combat system
        if (window.enemyCombatManager) {
            window.enemyCombatManager.registerEnemy(enemy);
        }

        return enemy;
    }
}

// ===========================================
// MODULE EXPORTS
// ===========================================

window.createEnemyWithData = createEnemyWithData;
