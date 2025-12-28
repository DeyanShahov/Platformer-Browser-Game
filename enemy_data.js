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

  // MOVED TO base_enemy.js - Enemy creation logic

// Global enemy data management
window.EnemyData = EnemyData;
// createEnemyWithData moved to base_enemy.js
