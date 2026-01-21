/**
 * Enemy Factory Module
 * Handles enemy creation and instantiation
 * Provides factory functions for different enemy types
 */

// ===========================================
// ENEMY CREATION FUNCTIONS
// ===========================================

/**
 * Create enemy instance with stats
 * @param {string} enemyType - Type of enemy ('basic', etc.)
 * @param {number} level - Enemy level
 * @returns {Object} Created enemy entity
 */
function createEnemyWithData(enemyType = 'basic', level = 1) {
    const enemyData = new EnemyData(enemyType, level);
    const stats = enemyData.getScaledStats();

    // Create the enemy entity (using existing createEntity function)
    // Use default Y position if CANVAS_HEIGHT is not available
    // Move entities higher up - responsive to canvas size
    const enemyY = (typeof CANVAS_HEIGHT !== 'undefined') ? Math.max(200, CANVAS_HEIGHT - 600) : 300;

    // Scale X position for new canvas size
    const scaleFactor = (typeof CANVAS_WIDTH !== 'undefined') ? CANVAS_WIDTH / 900 : 1;
    const enemyX = 450 * scaleFactor;

    const enemy = window.createEntity(enemyX, enemyY, 0, 60, 60, "#FF3020");

    // Add Z thickness for 2.5D collision
    enemy.zThickness = 5;// 25;  // Enemy thickness (slightly less than player)

    // Apply stats from enemy data
    enemy.maxHealth = stats.maxHealth;
    enemy.health = stats.maxHealth;
    enemy.currentAction = null;
    enemy.executionTimer = 0;
    enemy.hit = false;

    // Entity type for combat system
    enemy.entityType = 'enemy';

    // Add character info for combat system
    enemy.characterInfo = new window.CharacterInfo('enemy');
    enemy.characterInfo.baseAttack = stats.baseAttack;
    enemy.characterInfo.baseDefense = stats.baseDefense;
    enemy.characterInfo.strength = stats.strength;
    enemy.characterInfo.criticalChance = stats.criticalChance;

    // Death state properties
    enemy.isDying = false;
    enemy.deathTimer = 0;
    enemy.blinkCount = 0;
    enemy.visible = true; // For blink animation

    // Store enemy data for reference
    enemy.enemyData = enemyData;

    // Add animation placeholder - will be registered by animation system
    enemy.animation = null;

    // FSM will be added after animation registration in main.js
    enemy.stateMachine = null;

    // Register enemy with combat system
    if (window.enemyCombatManager) {
        window.enemyCombatManager.registerEnemy(enemy);
    }

    //console.log(`[ENEMY] Created ${enemyData.getDisplayName()} (Level ${level}) with ${stats.maxHealth} HP`);

    return enemy;
}

// ===========================================
// MODULE EXPORTS
// ===========================================

window.createEnemyWithData = createEnemyWithData;
