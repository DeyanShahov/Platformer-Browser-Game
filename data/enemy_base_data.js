// Enemy Base Data System for Platformer Game
// Centralized system for managing enemy types, stats, and rewards
// This file serves as the foundation for all enemy generation

class EnemyBaseData {
    constructor(enemyType, level = 1) {
        this.enemyType = enemyType; // 'basic', 'elite', 'boss', etc.
        this.level = level;
        this.baseStats = this.getBaseStatsForType(enemyType);
        this.rewards = this.getRewardsForType(enemyType);
        this.behavior = this.getBehaviorForType(enemyType);
        this.specialAbilities = this.getSpecialAbilitiesForType(enemyType);
    }

    // Get base stats for different enemy types
    getBaseStatsForType(enemyType) {
        const baseStats = {
            basic: {
                maxHealth: 50,
                baseAttack: 10,
                baseDefense: 0,
                strength: 5,
                criticalChance: 0.05, // 5%
                speed: 50
            },
            elite: {
                maxHealth: 100,
                baseAttack: 15,
                baseDefense: 5,
                strength: 8,
                criticalChance: 0.10, // 10%
                speed: 60
            },
            boss: {
                maxHealth: 200,
                baseAttack: 20,
                baseDefense: 10,
                strength: 15,
                criticalChance: 0.20, // 20%
                speed: 40
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

    // Get behavior patterns for different enemy types
    getBehaviorForType(enemyType) {
        const behaviors = {
            basic: {
                aggression: 0.3,
                awarenessRadius: 300,
                attackPattern: 'simple',
                movementPattern: 'patrol'
            },
            elite: {
                aggression: 0.6,
                awarenessRadius: 400,
                attackPattern: 'advanced',
                movementPattern: 'chase'
            },
            boss: {
                aggression: 0.9,
                awarenessRadius: 600,
                attackPattern: 'complex',
                movementPattern: 'dynamic'
            }
        };

        return behaviors[enemyType] || behaviors.basic;
    }

    // Get special abilities for different enemy types
    getSpecialAbilitiesForType(enemyType) {
        const abilities = {
            basic: [],
            elite: ['enhanced_attack'],
            boss: ['damage_reflection', 'area_attack']
        };

        return abilities[enemyType] || abilities.basic;
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
            speed: base.speed
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
            rewards: this.rewards,
            behavior: this.behavior,
            specialAbilities: this.specialAbilities
        };
    }
}

// Global enemy base data management
window.EnemyBaseData = EnemyBaseData;