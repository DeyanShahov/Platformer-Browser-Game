/**
 * Enemy Modifier System
 * Centralized system for applying dynamic modifications to enemies following the specified progression logic
 * Progression: Base → Type → Rarity → Level → Universal
 */

class EnemyModifierSystem {
    /**
     * Apply all dynamic modifications to create a complete enemy configuration
     * @param {string} enemyType - Type of enemy (slime, goblin, dragon, etc.)
     * @param {string} rarity - Rarity level (common, elite, boss)
     * @param {string} intelligence - Intelligence level (basic, normal, advanced)
     * @param {number} level - Enemy level
     * @returns {Object} Complete enemy configuration with all modifications applied
     */
    static applyDynamicModifications(enemyType, rarity, intelligence, level) {
        // Step 1: Get base stats from EnemyBaseData
        const baseConfig = this.applyBaseStats(enemyType, level);

        // Step 2: Apply type-specific modifications
        this.applyTypeModifications(baseConfig, enemyType);

        // Step 3: Apply rarity-specific bonuses
        this.applyRarityBonuses(baseConfig, rarity, level);

        // Step 4: Apply level-based scaling
        this.applyLevelScaling(baseConfig, level);

        // Step 5: Apply universal type-specific modifiers
        this.applyUniversalModifiers(baseConfig, enemyType);

        // Set additional properties
        baseConfig.rarity = rarity;
        baseConfig.intelligence = intelligence;
        baseConfig.level = level;

        return baseConfig;
    }

    /**
     * Get base stats from EnemyBaseData
     * @param {string} enemyType - Type of enemy
     * @param {number} level - Enemy level
     * @returns {Object} Base configuration with stats
     */
    static applyBaseStats(enemyType, level) {
        const baseData = new EnemyBaseData(enemyType, level);
        return {
            type: enemyType,
            level: level,
            baseStats: baseData.baseStats,
            rewards: baseData.rewards,
            behavior: baseData.behavior,
            specialAbilities: baseData.specialAbilities,
            // Initialize with base stats
            maxHealth: baseData.baseStats.maxHealth,
            baseAttack: baseData.baseStats.baseAttack,
            baseDefense: baseData.baseStats.baseDefense,
            strength: baseData.baseStats.strength,
            criticalChance: baseData.baseStats.criticalChance,
            speed: baseData.baseStats.speed,
            // Initialize with base rewards
            experienceReward: baseData.rewards.experience,
            goldReward: baseData.rewards.gold,
            // Initialize behavior
            aggression: baseData.behavior.aggression,
            awarenessRadius: baseData.behavior.awarenessRadius,
            attackPattern: baseData.behavior.attackPattern,
            movementPattern: baseData.behavior.movementPattern
        };
    }

    /**
     * Apply type-specific modifications based on enemy type
     * @param {Object} config - Enemy configuration object
     * @param {string} enemyType - Type of enemy
     */
    static applyTypeModifications(config, enemyType) {
        // Handle subtype mapping (e.g., 'blue_slime' -> 'slime')
        let databaseEnemyType = enemyType;
        if (enemyType.endsWith('_slime')) {
            // Map subtypes like 'blue_slime', 'green_slime', etc. to base type 'slime'
            databaseEnemyType = 'slime';
        }

        // Get type modification rules from database
        const typeRules = window.EnemyTypeDatabase?.[databaseEnemyType]?.typeModifications;

        if (!typeRules) {
            console.warn(`No type modifications found for enemy type: ${enemyType} (mapped to: ${databaseEnemyType})`);
            return;
        }

        // Apply percentage-based multipliers
        const rarity = config.rarity || 'common';
        const typeMods = typeRules[rarity] || typeRules.basic;

        if (typeMods.healthMultiplier) {
            config.maxHealth = Math.round(config.maxHealth * typeMods.healthMultiplier);
        }
        if (typeMods.attackMultiplier) {
            config.baseAttack = Math.round(config.baseAttack * typeMods.attackMultiplier);
        }
        if (typeMods.defenseMultiplier) {
            config.baseDefense = Math.round(config.baseDefense * typeMods.defenseMultiplier);
        }
        if (typeMods.speedMultiplier) {
            config.speed = Math.round(config.speed * typeMods.speedMultiplier);
        }
        if (typeMods.criticalChanceMultiplier) {
            config.criticalChance = config.criticalChance * typeMods.criticalChanceMultiplier;
        }
    }

    /**
     * Apply rarity-specific bonuses
     * @param {Object} config - Enemy configuration object
     * @param {string} rarity - Rarity level
     * @param {number} level - Enemy level
     */
    static applyRarityBonuses(config, rarity, level) {
        // Rarity bonus calculations (these are typically percentage-based)
        switch (rarity) {
            case 'elite':
                // Elite enemies get additional bonuses based on their level
                const eliteDefenseBonus = 2 * level; // 2 per level for defense
                config.baseDefense += eliteDefenseBonus;

                // Additional percentage bonuses for elite
                config.maxHealth = Math.round(config.maxHealth * 1.5); // +50% HP
                config.baseAttack = Math.round(config.baseAttack * 1.5); // +50% ATK
                config.speed = Math.round(config.speed * 1.2); // +20% SPD
                break;

            case 'boss':
                // Boss enemies get more significant percentage bonuses
                config.maxHealth = Math.round(config.maxHealth * 2.0); // +100% HP
                config.baseAttack = Math.round(config.baseAttack * 2.0); // +100% ATK
                config.baseDefense = Math.round(config.baseDefense * 2.0); // +100% DEF
                config.criticalChance = config.criticalChance * 2.0; // +100% crit chance
                config.speed = Math.round(config.speed * 1.5); // +50% SPD
                break;

            default:
                // Common enemies get no additional bonuses
                break;
        }
    }

    /**
     * Apply level-based scaling with both percentage and fixed-point bonuses
     * @param {Object} config - Enemy configuration object
     * @param {number} level - Enemy level
     */
    static applyLevelScaling(config, level) {
        // Level-based percentage scaling (10% per level)
        const levelMultiplier = 1 + (level - 1) * 0.1; // 10% increase per level

        config.maxHealth = Math.round(config.maxHealth * levelMultiplier);
        config.baseAttack = Math.round(config.baseAttack * levelMultiplier);
        config.baseDefense = Math.round(config.baseDefense * levelMultiplier);
        config.strength = Math.round(config.strength * levelMultiplier);

        // Apply fixed-point bonuses based on enemy type
        const typeRules = window.EnemyTypeDatabase?.[config.type]?.universalModifiers?.levelBonuses;
        if (typeRules) {
            config.maxHealth += typeRules.healthBonusPerLevel * (level - 1);
            config.baseAttack += typeRules.attackBonusPerLevel * (level - 1);
            config.baseDefense += typeRules.defenseBonusPerLevel * (level - 1);
            config.strength += typeRules.strengthBonusPerLevel * (level - 1);
        }
    }

    /**
     * Apply universal type-specific modifiers
     * @param {Object} config - Enemy configuration object
     * @param {string} enemyType - Type of enemy
     */
    static applyUniversalModifiers(config, enemyType) {
        const typeRules = window.EnemyTypeDatabase?.[enemyType]?.universalModifiers;

        if (!typeRules) {
            return;
        }

        // Apply base defense bonus (if any)
        if (typeof typeRules.baseDefense === 'number') {
            config.baseDefense += typeRules.baseDefense;
        }

        // Apply special abilities
        if (Array.isArray(typeRules.specialAbilities)) {
            // Merge with existing abilities
            config.specialAbilities = [...new Set([...(config.specialAbilities || []), ...typeRules.specialAbilities])];
        }
    }

    /**
     * Get modification rules for a specific enemy type
     * @param {string} enemyType - Type of enemy
     * @returns {Object} Modification rules for the enemy type
     */
    static getEnemyModificationRules(enemyType) {
        return window.EnemyTypeDatabase?.[enemyType] || null;
    }
}

// Export for global access
window.EnemyModifierSystem = EnemyModifierSystem;