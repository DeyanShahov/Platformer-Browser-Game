/**
 * Enemy Type Manager - Clean Version
 * Centralized system for managing enemy types, configurations, and modifiers
 * Provides unified interface for creating enemies with proper stats and behaviors
 */

class EnemyTypeManager {
    /**
     * Get complete enemy configuration for a specific type and subtype
     * @param {string} enemyType - Base enemy type (e.g., 'slime', 'bear')
     * @param {string} enemySubType - Specific variant (e.g., 'elite', 'boss', 'black_bear')
     * @returns {Object} Complete enemy configuration
     */
    static getEnemyConfig(enemyType, enemySubType = null) {
        // Get base configuration from EnemyBaseData
        const baseData = new EnemyBaseData(enemyType, 1);
        const baseConfig = {
            type: enemyType,
            baseStats: baseData.baseStats,
            rarity: 'common',
            intelligence: 'basic',
            animationEntityType: enemyType,
            specialAbilities: baseData.specialAbilities || [],
            attackProfile: ['light'],
            levelScaling: 0.2
        };

        // Apply type-specific configurations (universal modifiers, etc.)
        const typeConfig = this.getTypeConfig(enemyType);
        const mergedConfig = { ...baseConfig, ...typeConfig };

        // If we have a subtype, merge it with base config
        if (enemySubType && this.hasSubTypeConfig(enemyType, enemySubType)) {
            const subTypeConfig = this.getSubTypeConfig(enemyType, enemySubType);
            return this.mergeConfigs(mergedConfig, subTypeConfig);
        }

        return mergedConfig;
    }

    /**
     * Get type-specific configuration (universal modifiers, etc.)
     * @param {string} enemyType - Enemy type name
     * @returns {Object} Type-specific configuration
     */
    static getTypeConfig(enemyType) {
        const configs = {
            slime: {
                type: 'slime',
                rarity: 'common',
                intelligence: 'basic',
                animationEntityType: 'blue_slime',
                // Universal modifiers for all slime types
                universalModifiers: {
                    baseDefense: 1  // +1 defense for all slimes
                },
                // Additional properties that can be overridden by subtypes
                specialAbilities: [],
                attackProfile: ['light'],
                levelScaling: 0.2, // 20% increase per level
            },
            bear: {
                type: 'bear',
                rarity: 'common',
                intelligence: 'basic',
                animationEntityType: 'bear',
                experienceReward: 250,
                goldReward: 20,
                specialAbilities: ['charge', 'claw_attack'],
                attackProfile: ['light', 'heavy'],
                levelScaling: 0.25, // 25% increase per level
            },
            skeleton: {
                type: 'skeleton',
                rarity: 'common',
                intelligence: 'basic',
                animationEntityType: 'skeleton',
                experienceReward: 180,
                goldReward: 15,
                specialAbilities: ['ranged_attack', 'bone_armor'],
                attackProfile: ['light', 'medium'],
                levelScaling: 0.15, // 15% increase per level
            }
        };

        return configs[enemyType] || configs.slime;
    }

    /**
     * Get subtype configuration for enemy type
     * @param {string} enemyType - Enemy type name
     * @param {string} subType - Subtype name
     * @returns {Object} Subtype configuration
     */
    static getSubTypeConfig(enemyType, subType) {
        const subTypes = {
            slime: {
                elite: {
                    rarity: 'elite',
                    intelligence: 'normal',
                    animationEntityType: 'elite_slime',
                    experienceReward: 500,
                    goldReward: 25,
                    specialAbilities: ['enhanced_attack'],
                    attackProfile: ['light', 'medium'],
                    levelScaling: 0.2
                },
                boss: {
                    rarity: 'boss',
                    intelligence: 'advanced',
                    animationEntityType: 'boss_slime',
                    experienceReward: 2000,
                    goldReward: 100,
                    specialAbilities: ['damage_reflection', 'area_attack'],
                    attackProfile: ['light', 'medium', 'heavy'],
                    levelScaling: 0.2
                }
            },
            bear: {
                black_bear: {
                    rarity: 'elite',
                    intelligence: 'normal',
                    animationEntityType: 'black_bear',
                    experienceReward: 350,
                    goldReward: 30,
                    specialAbilities: ['charge', 'claw_attack', 'berserk'],
                    attackProfile: ['light', 'heavy', 'medium'],
                    levelScaling: 0.25
                }
            },
            skeleton: {
                archer: {
                    rarity: 'elite',
                    intelligence: 'normal',
                    animationEntityType: 'archer_skeleton',
                    experienceReward: 220,
                    goldReward: 25,
                    specialAbilities: ['ranged_attack', 'bone_armor', 'arrow_shower'],
                    attackProfile: ['light', 'medium', 'heavy'],
                    levelScaling: 0.15
                },
                warrior: {
                    rarity: 'elite',
                    intelligence: 'normal',
                    animationEntityType: 'warrior_skeleton',
                    experienceReward: 200,
                    goldReward: 20,
                    specialAbilities: ['ranged_attack', 'bone_armor', 'shield_block'],
                    attackProfile: ['light', 'medium', 'heavy'],
                    levelScaling: 0.15
                }
            }
        };

        return subTypes[enemyType]?.[subType] || {};
    }

    /**
     * Check if a subtype configuration exists for enemy type
     * @param {string} enemyType - Enemy type name
     * @param {string} subType - Subtype name
     * @returns {boolean} True if configuration exists
     */
    static hasSubTypeConfig(enemyType, subType) {
        const subTypes = this.getSubTypeConfig(enemyType, subType);
        return Object.keys(subTypes).length > 0;
    }

    /**
     * Merge base and subtype configurations
     * @param {Object} baseConfig - Base configuration
     * @param {Object} subTypeConfig - Subtype configuration
     * @returns {Object} Merged configuration
     */
    static mergeConfigs(baseConfig, subTypeConfig) {
        const merged = { ...baseConfig };

        // Merge base stats with subtype stats
        if (subTypeConfig.baseStats && baseConfig.baseStats) {
            merged.baseStats = { ...baseConfig.baseStats, ...subTypeConfig.baseStats };
        }

        // Merge other properties
        Object.keys(subTypeConfig).forEach(key => {
            if (key !== 'baseStats') {
                merged[key] = subTypeConfig[key];
            }
        });

        return merged;
    }

    /**
     * Calculate scaled stats based on level and modifiers
     * @param {Object} config - Enemy configuration
     * @param {number} level - Enemy level
     * @returns {Object} Scaled stats
     */
    static calculateScaledStats(config, level) {
        // Get base stats from EnemyBaseData for proper inheritance
        const baseData = new EnemyBaseData(config.type || 'basic', level);
        const baseStats = baseData.baseStats;

        const multiplier = 1 + (level - 1) * config.levelScaling;

        // Apply base multipliers from subtype configuration
        const scaledStats = {};
        Object.keys(baseStats).forEach(stat => {
            if (typeof baseStats[stat] === 'number') {
                let statValue = baseStats[stat] * multiplier;
                // Apply subtype multipliers if they exist
                if (config[`${stat}Multiplier`] && config[`${stat}Multiplier`] !== 1) {
                    statValue *= config[`${stat}Multiplier`];
                }
                scaledStats[stat] = Math.round(statValue);
            } else {
                scaledStats[stat] = baseStats[stat];
            }
        });

        // Apply universal modifiers if they exist
        if (config.universalModifiers) {
            Object.keys(config.universalModifiers).forEach(modifier => {
                if (typeof scaledStats[modifier] === 'number' && typeof config.universalModifiers[modifier] === 'number') {
                    scaledStats[modifier] += config.universalModifiers[modifier];
                }
            });
        }

        // Apply rarity-based bonuses and level scaling
        if (config.rarity) {
            const rarityBonus = this.getRarityBonus(config.rarity, level);
            Object.keys(rarityBonus).forEach(stat => {
                if (typeof scaledStats[stat] === 'number' && typeof rarityBonus[stat] === 'number') {
                    // Handle percentage multipliers for boss enemies
                    if (stat.includes('Multiplier')) {
                        scaledStats[stat] = scaledStats[stat] * rarityBonus[stat];
                    } else {
                        scaledStats[stat] += rarityBonus[stat];
                    }
                }
            });
        }

        return scaledStats;
    }

    /**
     * Get rarity-based bonuses for enemy scaling
     * @param {string} rarity - Enemy rarity ('common', 'elite', 'boss')
     * @param {number} level - Enemy level
     * @returns {Object} Rarity bonuses
     */
    static getRarityBonus(rarity, level) {
        const bonuses = {};

        switch (rarity) {
            case 'elite':
                // Elite enemies get level-based bonuses to defense (2 per level)
                bonuses.baseDefense = 2 * level;
                break;
            case 'boss':
                // Boss enemies get percentage-based multipliers to base stats
                // Apply 2% increase per level for boss enemies
                bonuses.healthMultiplier = 1 + (level - 1) * 0.02; // 2% per level
                bonuses.attackMultiplier = 1 + (level - 1) * 0.02; // 2% per level
                bonuses.defenseMultiplier = 1 + (level - 1) * 0.02; // 2% per level
                break;
            default:
                // Common enemies have no additional bonuses
                break;
        }

        return bonuses;
    }

    /**
     * Get enemy rewards (experience and gold) using centralized base data
     * @param {Object} config - Enemy configuration
     * @param {number} level - Enemy level
     * @returns {Object} Rewards object
     */
    static getEnemyRewards(config, level) {
        // Get base rewards from EnemyBaseData through the baseDataClass reference
        let baseExperience = 100; // Default fallback
        let baseGold = 10;       // Default fallback

        // If we have a base data class, use it to get proper base rewards
        if (config.baseDataClass) {
            const baseData = new config.baseDataClass('basic', level); // Use basic as default type for base rewards
            baseExperience = baseData.rewards.experience || 100;
            baseGold = baseData.rewards.gold || 10;
        } else {
            // Fallback to config values if no base data class is available
            baseExperience = config.experienceReward || 100;
            baseGold = config.goldReward || 10;
        }

        const experienceMultiplier = 1 + (level - 1) * 0.2; // 20% increase per level
        const goldMultiplier = 1 + (level - 1) * 0.15; // 15% increase per level

        return {
            experience: Math.round(baseExperience * experienceMultiplier),
            gold: Math.round(baseGold * goldMultiplier)
        };
    }

    /**
     * Get complete enemy data with all dynamic modifications applied
     * Following the progression logic from ENEMY_GENERATION_IMPROVEMENT_PLAN.md
     * Progression: Base → Type → Rarity → Level → Universal
     * @param {string} enemyType - Type of enemy (slime, goblin, dragon, etc.)
     * @param {string} enemySubType - Specific variant (elite, boss, black_bear, etc.)
     * @param {number} level - Enemy level
     * @returns {Object} Complete enemy configuration with all modifications applied
     */
    static getCompleteEnemyData(enemyType, enemySubType = null, level = 1) {
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
        const enemyConfig = EnemyModifierSystem.applyDynamicModifications(enemyType, rarity, intelligence, level);

        // Get base config for reference (this is what getEnemyConfig returns)
        const baseConfig = this.getEnemyConfig(enemyType, enemySubType);

        // Create the complete data structure with getEnemyInfo method for rendering compatibility
        const completeData = {
            config: baseConfig,
            stats: {
                maxHealth: enemyConfig.maxHealth,
                baseAttack: enemyConfig.baseAttack,
                baseDefense: enemyConfig.baseDefense,
                strength: enemyConfig.strength,
                criticalChance: enemyConfig.criticalChance,
                speed: enemyConfig.speed
            },
            rewards: {
                experience: enemyConfig.experienceReward,
                gold: enemyConfig.goldReward
            },
            // Add getEnemyInfo method for rendering compatibility
            getEnemyInfo: function () {
                // Derive display name from the enemy type - this matches what EnemyBaseData would provide
                let displayName = enemyType.charAt(0).toUpperCase() + enemyType.slice(1);
                if (displayName.endsWith('_slime')) {
                    displayName = displayName.replace('_slime', ' Slime');
                }
                // For blue_slime, we want "Blue Slime" as the display name
                if (enemyType === 'blue_slime') {
                    displayName = 'Blue Slime';
                }

                return {
                    type: enemyType,
                    level: level,
                    displayName: displayName
                };
            }
        };

        return completeData;
    }

}

// Global export for access from other modules
window.EnemyTypeManager = EnemyTypeManager;
