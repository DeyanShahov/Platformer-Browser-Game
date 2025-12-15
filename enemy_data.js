// Enemy Data System for Platformer Game
// Manages enemy types, stats, and rewards for future expansion

class EnemyData {
  constructor(enemyType, level = 1) {
    this.enemyType = enemyType; // 'basic', 'elite', 'boss', etc.
    this.level = level;
    this.baseStats = this.getBaseStatsForType(enemyType);
    this.rewards = this.getRewardsForType(enemyType);
  }

  // Get base stats for different enemy types
  getBaseStatsForType(enemyType) {
    const baseStats = {
      basic: {
        maxHealth: 50,
        baseAttack: 3,
        baseDefense: 1,
        strength: 5,
        criticalChance: 0.05, // 5%
        speed: 50,
        experienceReward: 200
      },
      elite: {
        maxHealth: 100,
        baseAttack: 6,
        baseDefense: 3,
        strength: 8,
        criticalChance: 0.10, // 10%
        speed: 60,
        experienceReward: 500
      },
      boss: {
        maxHealth: 2100,
        baseAttack: 12,
        baseDefense: 8,
        strength: 15,
        criticalChance: 0.20, // 20%
        speed: 40,
        experienceReward: 2000
      }
    };

    return baseStats[enemyType] || baseStats.basic;
  }

  // Get rewards for different enemy types
  getRewardsForType(enemyType) {
    const rewards = {
      basic: {
        experience: 50,
        gold: 10,
        items: [] // Future: item drops
      },
      elite: {
        experience: 100,
        gold: 25,
        items: [] // Future: better item drops
      },
      boss: {
        experience: 200,
        gold: 100,
        items: [] // Future: rare item drops
      }
    };

    return rewards[enemyType] || rewards.basic;
  }

  // Scale stats based on level
  getScaledStats() {
    const base = this.baseStats;
    const levelMultiplier = 1 + (this.level - 1) * 0.2; // 20% increase per level

    return {
      maxHealth: Math.round(base.maxHealth * levelMultiplier),
      baseAttack: Math.round(base.baseAttack * levelMultiplier),
      baseDefense: Math.round(base.baseDefense * levelMultiplier),
      strength: Math.round(base.strength * levelMultiplier),
      criticalChance: base.criticalChance, // Critical chance doesn't scale
      speed: base.speed,
      experienceReward: Math.round(base.experienceReward * levelMultiplier)
    };
  }

  // Get display name for enemy type
  getDisplayName() {
    const names = {
      basic: 'Основен враг',
      elite: 'Елитен враг',
      boss: 'Бос'
    };
    return names[this.enemyType] || this.enemyType;
  }

  // Get full enemy info
  getEnemyInfo() {
    return {
      type: this.enemyType,
      level: this.level,
      displayName: this.getDisplayName(),
      stats: this.getScaledStats(),
      rewards: this.rewards
    };
  }
}

  // Create enemy instance with stats
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

    const enemy = window.createEntity(enemyX, enemyY, 50, 60, 60, "#FF3020");

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

    // Register enemy with combat system
    if (window.enemyCombatManager) {
      window.enemyCombatManager.registerEnemy(enemy);
    }

    //console.log(`[ENEMY] Created ${enemyData.getDisplayName()} (Level ${level}) with ${stats.maxHealth} HP`);

    return enemy;
  }

// Global enemy data management
window.EnemyData = EnemyData;
window.createEnemyWithData = createEnemyWithData;
