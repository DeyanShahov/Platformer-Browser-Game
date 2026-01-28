/**
 * Centralized Database of Enemy Types with Modification Rules
 * Following RPG conventions and D&D standards
 */

const EnemyTypeDatabase = {
    // Base slime type - common enemy
    slime: {
        // Type-specific modifications (percentage increases)
        typeModifications: {
            basic: {
                healthMultiplier: 1.0,     // 100% of base
                attackMultiplier: 1.0,     // 100% of base  
                defenseMultiplier: 1.0,    // 100% of base
                speedMultiplier: 1.0,      // 100% of base
                criticalChanceMultiplier: 1.0 // 100% of base
            },
            elite: {
                healthMultiplier: 2.0,     // 200% of base
                attackMultiplier: 2.0,     // 200% of base
                defenseMultiplier: 1.5,    // 150% of base  
                speedMultiplier: 1.2,      // 120% of base
                criticalChanceMultiplier: 1.5 // 150% of base
            },
            boss: {
                healthMultiplier: 3.0,     // 300% of base
                attackMultiplier: 3.0,     // 300% of base
                defenseMultiplier: 2.5,    // 250% of base
                speedMultiplier: 1.4,      // 140% of base
                criticalChanceMultiplier: 2.0 // 200% of base
            }
        },

        // Universal modifiers for all slimes (type-specific bonuses)
        universalModifiers: {
            // Base universal modifiers for slime type
            baseDefense: 1,           // +1 defense for all slimes
            specialAbilities: ['slime_morph', 'acid_resistance'], // Common slime abilities
            // Level-based bonuses for slimes (fixed points added per level)
            levelBonuses: {
                healthBonusPerLevel: 5,   // +5 HP per level
                attackBonusPerLevel: 2,   // +2 ATK per level  
                defenseBonusPerLevel: 1,  // +1 DEF per level
                strengthBonusPerLevel: 1  // +1 STR per level
            }
        },

        // Special abilities that slimes can have
        specialAbilities: {
            basic: ['slime_morph'],
            elite: ['slime_morph', 'acid_splash'],
            boss: ['slime_morph', 'acid_splash', 'area_damage']
        },

        // Behavior patterns for different slime types
        behavior: {
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
        }
    },

    // More enemy types for testing
    goblin: {
        typeModifications: {
            basic: {
                healthMultiplier: 1.0,
                attackMultiplier: 1.2,
                defenseMultiplier: 0.8,
                speedMultiplier: 1.3,
                criticalChanceMultiplier: 1.0
            },
            elite: {
                healthMultiplier: 1.5,
                attackMultiplier: 1.8,
                defenseMultiplier: 1.2,
                speedMultiplier: 1.5,
                criticalChanceMultiplier: 1.5
            },
            boss: {
                healthMultiplier: 2.5,
                attackMultiplier: 3.0,
                defenseMultiplier: 2.0,
                speedMultiplier: 1.2,
                criticalChanceMultiplier: 2.0
            }
        },

        universalModifiers: {
            baseDefense: 2, // Goblins have natural armor
            specialAbilities: ['stealth', 'ranged_attack'],
            levelBonuses: {
                healthBonusPerLevel: 3,
                attackBonusPerLevel: 3,
                defenseBonusPerLevel: 1,
                strengthBonusPerLevel: 2
            }
        },

        specialAbilities: {
            basic: ['stealth'],
            elite: ['stealth', 'ranged_attack'],
            boss: ['stealth', 'ranged_attack', 'berserk']
        },

        behavior: {
            basic: {
                aggression: 0.4,
                awarenessRadius: 250,
                attackPattern: 'simple',
                movementPattern: 'patrol'
            },
            elite: {
                aggression: 0.7,
                awarenessRadius: 350,
                attackPattern: 'advanced',
                movementPattern: 'chase'
            },
            boss: {
                aggression: 0.9,
                awarenessRadius: 500,
                attackPattern: 'complex',
                movementPattern: 'dynamic'
            }
        }
    },

    // Dragon type - example of more complex enemy
    dragon: {
        typeModifications: {
            basic: {
                healthMultiplier: 2.0,     // 200% of base
                attackMultiplier: 2.0,     // 200% of base
                defenseMultiplier: 1.5,    // 150% of base
                speedMultiplier: 1.2,      // 120% of base
                criticalChanceMultiplier: 1.0 // 100% of base
            },
            elite: {
                healthMultiplier: 3.0,     // 300% of base  
                attackMultiplier: 3.0,     // 300% of base
                defenseMultiplier: 2.0,    // 200% of base
                speedMultiplier: 1.4,      // 140% of base
                criticalChanceMultiplier: 1.5 // 150% of base
            },
            boss: {
                healthMultiplier: 5.0,     // 500% of base
                attackMultiplier: 5.0,     // 500% of base
                defenseMultiplier: 3.0,    // 300% of base
                speedMultiplier: 1.6,      // 160% of base
                criticalChanceMultiplier: 2.0 // 200% of base
            }
        },

        universalModifiers: {
            baseDefense: 50, // Dragons have massive natural armor
            specialAbilities: ['fire_breath', 'wing_attack'],
            levelBonuses: {
                healthBonusPerLevel: 50,   // +50 HP per level
                attackBonusPerLevel: 10,   // +10 ATK per level
                defenseBonusPerLevel: 10,  // +10 DEF per level
                strengthBonusPerLevel: 5   // +5 STR per level
            }
        },

        specialAbilities: {
            basic: ['fire_breath'],
            elite: ['fire_breath', 'wing_attack'],
            boss: ['fire_breath', 'wing_attack', 'area_damage', 'magic_resistance']
        },

        behavior: {
            basic: {
                aggression: 0.8,
                awarenessRadius: 800,
                attackPattern: 'complex',
                movementPattern: 'dynamic'
            },
            elite: {
                aggression: 0.9,
                awarenessRadius: 1000,
                attackPattern: 'complex',
                movementPattern: 'dynamic'
            },
            boss: {
                aggression: 1.0,
                awarenessRadius: 1200,
                attackPattern: 'complex',
                movementPattern: 'dynamic'
            }
        }
    }
};

// Export for global access
window.EnemyTypeDatabase = EnemyTypeDatabase;