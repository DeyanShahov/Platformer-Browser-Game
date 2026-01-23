// Character Combat System
// Integrates character stats and skills with the combat system

// Character Combat System State
let characterCombatSystemInitialized = false;

// Combat bonuses configuration
const COMBAT_BONUSES = {
    STRENGTH_ATTACK_MULTIPLIER: 0.5,     // +0.5 attack per strength point
    INTELLIGENCE_MANA_MULTIPLIER: 2,      // +2 mana per intelligence point
    SPEED_DODGE_MULTIPLIER: 0.01,         // +1% dodge per speed point
    STRENGTH_CRIT_DAMAGE_MULTIPLIER: 0.02, // +2% crit damage per strength point
    BASE_ATTACK_FROM_STRENGTH: true,     // Use strength for base attack calculation
    BASE_DEFENSE_FROM_STRENGTH: true     // Use strength for base defense calculation
};

// Initialize the character combat system
function initCharacterCombatSystem() {
    if (characterCombatSystemInitialized) {
        console.log('[Character Combat] Already initialized');
        return;
    }

    console.log('[Character Combat] Initializing...');
    characterCombatSystemInitialized = true;
    console.log('[Character Combat] Initialization complete');
}

// Get character combat stats
function getCharacterCombatStats(playerIndex) {
    const character = window.CharacterCore.getCharacter(playerIndex);
    if (!character) {
        console.warn(`[Character Combat] No character found for player ${playerIndex}`);
        return null;
    }

    // Calculate combat bonuses from character stats
    const bonuses = calculateCombatBonuses(character);

    return {
        baseAttack: bonuses.baseAttack,
        baseDefense: bonuses.baseDefense,
        critChance: bonuses.critChance,
        critDamage: bonuses.critDamage,
        hitChance: bonuses.hitChance,
        dodgeChance: bonuses.dodgeChance,
        blockChance: bonuses.blockChance,
        magicResistances: bonuses.magicResistances,
        statBonuses: {
            strength: bonuses.strengthBonus,
            speed: bonuses.speedBonus,
            intelligence: bonuses.intelligenceBonus
        }
    };
}

// Calculate combat bonuses from character stats
function calculateCombatBonuses(character) {
    const bonuses = {
        baseAttack: 5, // Base attack
        baseDefense: 0, // Base defense
        critChance: 0.10, // 10% base crit chance
        critDamage: 1.5, // 150% base crit damage
        hitChance: 0.95, // 95% base hit chance
        dodgeChance: 0.05, // 5% base dodge chance
        blockChance: 0.05, // 5% base block chance
        magicResistances: {
            water: 0,
            fire: 0,
            air: 0,
            earth: 0
        }
    };

    // Strength bonuses
    if (COMBAT_BONUSES.BASE_ATTACK_FROM_STRENGTH) {
        bonuses.baseAttack += Math.floor(character.strength * COMBAT_BONUSES.STRENGTH_ATTACK_MULTIPLIER);
    }
    if (COMBAT_BONUSES.BASE_DEFENSE_FROM_STRENGTH) {
        bonuses.baseDefense += Math.floor(character.strength * 0.2); // 0.2 defense per strength
    }
    bonuses.critDamage += character.strength * COMBAT_BONUSES.STRENGTH_CRIT_DAMAGE_MULTIPLIER;

    // Speed bonuses
    bonuses.dodgeChance += character.speed * COMBAT_BONUSES.SPEED_DODGE_MULTIPLIER;
    bonuses.hitChance += character.speed * 0.005; // +0.5% hit chance per speed point

    // Intelligence bonuses (mainly affects mana and magic)
    // Mana bonuses are handled separately in player mana calculation

    // Level-based bonuses
    const levelBonus = (character.level - 1) * 0.02; // +2% per level to various stats
    bonuses.critChance += levelBonus;
    bonuses.hitChance += levelBonus;
    bonuses.dodgeChance += levelBonus;
    bonuses.blockChance += levelBonus;

    // Cap percentages
    bonuses.critChance = Math.min(bonuses.critChance, 0.95); // Max 95%
    bonuses.hitChance = Math.min(bonuses.hitChance, 0.99); // Max 99%
    bonuses.dodgeChance = Math.min(bonuses.dodgeChance, 0.75); // Max 75%
    bonuses.blockChance = Math.min(bonuses.blockChance, 0.50); // Max 50%

    // Store stat bonuses for reference
    bonuses.strengthBonus = {
        attack: COMBAT_BONUSES.BASE_ATTACK_FROM_STRENGTH ?
            Math.floor(character.strength * COMBAT_BONUSES.STRENGTH_ATTACK_MULTIPLIER) : 0,
        defense: COMBAT_BONUSES.BASE_DEFENSE_FROM_STRENGTH ?
            Math.floor(character.strength * 0.2) : 0,
        critDamage: character.strength * COMBAT_BONUSES.STRENGTH_CRIT_DAMAGE_MULTIPLIER
    };

    bonuses.speedBonus = {
        dodge: character.speed * COMBAT_BONUSES.SPEED_DODGE_MULTIPLIER,
        hit: character.speed * 0.005
    };

    bonuses.intelligenceBonus = {
        // Intelligence mainly affects mana pool and regeneration
        manaMultiplier: 1 + (character.intelligence * 0.1) // +10% mana per intelligence point
    };

    return bonuses;
}

// Apply character combat bonuses to combat data
function applyCharacterCombatBonuses(playerIndex, combatData) {
    const characterStats = getCharacterCombatStats(playerIndex);
    if (!characterStats) {
        console.warn(`[Character Combat] No character stats found for player ${playerIndex}`);
        return combatData; // Return unchanged
    }

    const enhancedCombatData = { ...combatData };

    // Apply stat bonuses
    enhancedCombatData.baseAttack = (enhancedCombatData.baseAttack || 0) + characterStats.baseAttack;
    enhancedCombatData.baseDefense = (enhancedCombatData.baseDefense || 0) + characterStats.baseDefense;
    enhancedCombatData.critChance = characterStats.critChance;
    enhancedCombatData.critDamage = characterStats.critDamage;
    enhancedCombatData.hitChance = characterStats.hitChance;
    enhancedCombatData.dodgeChance = characterStats.dodgeChance;
    enhancedCombatData.blockChance = characterStats.blockChance;

    // Apply magic resistances
    if (!enhancedCombatData.magicResistances) {
        enhancedCombatData.magicResistances = { ...characterStats.magicResistances };
    } else {
        Object.keys(characterStats.magicResistances).forEach(element => {
            enhancedCombatData.magicResistances[element] =
                (enhancedCombatData.magicResistances[element] || 0) + characterStats.magicResistances[element];
        });
    }

    console.log(`[Character Combat] Applied bonuses for player ${playerIndex}:`, characterStats.statBonuses);
    return enhancedCombatData;
}

// Calculate mana pool based on character intelligence
function getCharacterManaPool(playerIndex) {
    const character = window.CharacterCore.getCharacter(playerIndex);
    if (!character) {
        console.warn(`[Character Combat] No character found for player ${playerIndex}`);
        return 30; // Default mana pool
    }

    const baseMana = 30; // Base mana pool
    const manaFromIntelligence = character.intelligence * COMBAT_BONUSES.INTELLIGENCE_MANA_MULTIPLIER;
    const levelBonus = (character.level - 1) * 5; // +5 mana per level

    return baseMana + manaFromIntelligence + levelBonus;
}

// Calculate mana regeneration rate
function getCharacterManaRegen(playerIndex) {
    const character = window.CharacterCore.getCharacter(playerIndex);
    if (!character) {
        return 1; // Default regen rate
    }

    const baseRegen = 1; // Base mana regen per second
    const regenFromIntelligence = character.intelligence * 0.1; // +0.1 regen per intelligence
    const levelBonus = (character.level - 1) * 0.05; // +0.05 regen per level

    return baseRegen + regenFromIntelligence + levelBonus;
}

// Get character combat effectiveness rating
function getCharacterCombatRating(playerIndex) {
    const character = window.CharacterCore.getCharacter(playerIndex);
    const combatStats = getCharacterCombatStats(playerIndex);

    if (!character || !combatStats) {
        return 0;
    }

    // Calculate overall combat rating
    const attackRating = combatStats.baseAttack * (1 + combatStats.critChance * (combatStats.critDamage - 1));
    const defenseRating = combatStats.baseDefense * (1 + combatStats.dodgeChance + combatStats.blockChance);
    const accuracyRating = combatStats.hitChance * 100;

    const levelMultiplier = character.level * 0.1; // 10% per level
    const statMultiplier = (character.strength + character.speed + character.intelligence) * 0.01; // 1% per total stat point

    return Math.floor((attackRating + defenseRating + accuracyRating) * (1 + levelMultiplier + statMultiplier));
}

// Get combat bonuses configuration
function getCombatBonusesConfig() {
    return { ...COMBAT_BONUSES };
}

// Validate combat bonuses
function validateCombatBonuses(playerIndex) {
    const character = window.CharacterCore.getCharacter(playerIndex);
    if (!character) {
        return { valid: false, errors: ['Character not found'] };
    }

    const combatStats = getCharacterCombatStats(playerIndex);
    const errors = [];

    // Validate percentages are within reasonable ranges
    if (combatStats.critChance < 0 || combatStats.critChance > 1) {
        errors.push(`Invalid crit chance: ${combatStats.critChance}`);
    }
    if (combatStats.hitChance < 0 || combatStats.hitChance > 1) {
        errors.push(`Invalid hit chance: ${combatStats.hitChance}`);
    }
    if (combatStats.dodgeChance < 0 || combatStats.dodgeChance > 1) {
        errors.push(`Invalid dodge chance: ${combatStats.dodgeChance}`);
    }
    if (combatStats.blockChance < 0 || combatStats.blockChance > 1) {
        errors.push(`Invalid block chance: ${combatStats.blockChance}`);
    }

    return {
        valid: errors.length === 0,
        errors,
        combatRating: getCharacterCombatRating(playerIndex)
    };
}

// Global exports for backward compatibility
window.CharacterCombatSystem = {
    init: initCharacterCombatSystem,
    getCharacterCombatStats,
    applyCharacterCombatBonuses,
    getCharacterManaPool,
    getCharacterManaRegen,
    getCharacterCombatRating,
    getConfig: getCombatBonusesConfig,
    validateCombatBonuses,
    isInitialized: () => characterCombatSystemInitialized
};
