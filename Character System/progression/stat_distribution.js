// Stat Distribution System
// Manages manual distribution of character stat points

// Stat Distribution System State
let statDistributionSystemInitialized = false;

// Stat configuration
const STAT_CONFIG = {
    MIN_STAT_VALUE: 10, // Base value from auto-leveling
    MAX_FREE_POINTS: 100, // Maximum free points a character can accumulate
    STATS: {
        STRENGTH: 'strength',
        SPEED: 'speed',
        INTELLIGENCE: 'intelligence'
    }
};

// Initialize the stat distribution system
function initStatDistributionSystem() {
    if (statDistributionSystemInitialized) {
        console.log('[Stat Distribution] Already initialized');
        return;
    }

    console.log('[Stat Distribution] Initializing...');
    statDistributionSystemInitialized = true;
    console.log('[Stat Distribution] Initialization complete');
}

// Get available free points for a character
function getAvailableStatPoints(playerIndex) {
    const character = window.CharacterCore.getCharacter(playerIndex);
    if (!character) {
        console.warn(`[Stat Distribution] No character found for player ${playerIndex}`);
        return 0;
    }

    return character.freePoints || 0;
}

// Modify strength stat
function modifyStrength(playerIndex, amount) {
    return modifyStat(playerIndex, STAT_CONFIG.STATS.STRENGTH, amount);
}

// Modify speed stat
function modifySpeed(playerIndex, amount) {
    return modifyStat(playerIndex, STAT_CONFIG.STATS.SPEED, amount);
}

// Modify intelligence stat
function modifyIntelligence(playerIndex, amount) {
    return modifyStat(playerIndex, STAT_CONFIG.STATS.INTELLIGENCE, amount);
}

// Generic stat modification function
function modifyStat(playerIndex, statName, amount) {
    const character = window.CharacterCore.getCharacter(playerIndex);
    if (!character) {
        console.warn(`[Stat Distribution] No character found for player ${playerIndex}`);
        return false;
    }

    const currentValue = character[statName];
    const minValue = STAT_CONFIG.MIN_STAT_VALUE + (character.level - 1); // Auto increases

    if (amount > 0) {
        // Increasing stat - check if we have free points
        if (character.freePoints <= 0) {
            console.log(`[Stat Distribution] No free points available for player ${playerIndex}`);
            return false;
        }

        character[statName] += amount;
        character.freePoints -= amount;

        console.log(`[Stat Distribution] Player ${playerIndex} ${statName} increased by ${amount} (Total: ${character[statName]})`);
        return true;

    } else if (amount < 0) {
        // Decreasing stat - check minimum
        const newValue = currentValue + amount;
        if (newValue < minValue) {
            console.log(`[Stat Distribution] Cannot decrease ${statName} below minimum (${minValue}) for player ${playerIndex}`);
            return false;
        }

        character[statName] += amount; // amount is negative
        character.freePoints -= amount; // subtracting negative = adding

        console.log(`[Stat Distribution] Player ${playerIndex} ${statName} decreased by ${Math.abs(amount)} (Total: ${character[statName]})`);
        return true;
    }

    return false;
}

// Get stat information for a character
function getStatInfo(playerIndex) {
    const character = window.CharacterCore.getCharacter(playerIndex);
    if (!character) {
        console.warn(`[Stat Distribution] No character found for player ${playerIndex}`);
        return null;
    }

    const minValue = STAT_CONFIG.MIN_STAT_VALUE + (character.level - 1);

    return {
        freePoints: character.freePoints,
        minStatValue: minValue,
        stats: {
            strength: {
                current: character.strength,
                canIncrease: character.freePoints > 0,
                canDecrease: character.strength > minValue
            },
            speed: {
                current: character.speed,
                canIncrease: character.freePoints > 0,
                canDecrease: character.speed > minValue
            },
            intelligence: {
                current: character.intelligence,
                canIncrease: character.freePoints > 0,
                canDecrease: character.intelligence > minValue
            }
        },
        totalStats: character.getTotalStatPoints ? character.getTotalStatPoints() : 0
    };
}

// Reset stat distribution (refund all manually distributed points)
function resetStatDistribution(playerIndex) {
    const character = window.CharacterCore.getCharacter(playerIndex);
    if (!character) {
        console.warn(`[Stat Distribution] No character found for player ${playerIndex}`);
        return false;
    }

    // Calculate how many points were manually distributed
    const autoStats = (character.level - 1) * 3; // 3 stats auto-increased per level
    const manualPoints = (character.strength - STAT_CONFIG.MIN_STAT_VALUE) +
        (character.speed - STAT_CONFIG.MIN_STAT_VALUE) +
        (character.intelligence - STAT_CONFIG.MIN_STAT_VALUE) - autoStats;

    // Refund points
    character.freePoints += Math.max(0, manualPoints);

    // Reset to auto-leveled values
    character.strength = STAT_CONFIG.MIN_STAT_VALUE + (character.level - 1);
    character.speed = STAT_CONFIG.MIN_STAT_VALUE + (character.level - 1);
    character.intelligence = STAT_CONFIG.MIN_STAT_VALUE + (character.level - 1);

    console.log(`[Stat Distribution] Player ${playerIndex} stat distribution reset. Refunded ${Math.max(0, manualPoints)} points.`);
    return true;
}

// Add free points directly (admin function)
function addFreePoints(playerIndex, amount) {
    const character = window.CharacterCore.getCharacter(playerIndex);
    if (!character) {
        console.warn(`[Stat Distribution] No character found for player ${playerIndex}`);
        return false;
    }

    character.freePoints = Math.min(
        STAT_CONFIG.MAX_FREE_POINTS,
        Math.max(0, character.freePoints + amount)
    );

    console.log(`[Stat Distribution] Player ${playerIndex} free points ${amount > 0 ? 'increased' : 'decreased'} by ${Math.abs(amount)} (Total: ${character.freePoints})`);
    return true;
}

// Get stat distribution configuration
function getStatDistributionConfig() {
    return { ...STAT_CONFIG };
}

// Validate stat distribution
function validateStatDistribution(playerIndex) {
    const character = window.CharacterCore.getCharacter(playerIndex);
    if (!character) {
        return { valid: false, errors: ['Character not found'] };
    }

    const errors = [];
    const minValue = STAT_CONFIG.MIN_STAT_VALUE + (character.level - 1);

    if (character.strength < minValue) {
        errors.push(`Strength below minimum (${minValue})`);
    }
    if (character.speed < minValue) {
        errors.push(`Speed below minimum (${minValue})`);
    }
    if (character.intelligence < minValue) {
        errors.push(`Intelligence below minimum (${minValue})`);
    }
    if (character.freePoints < 0) {
        errors.push('Negative free points');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

// Global exports for backward compatibility
window.StatDistributionSystem = {
    init: initStatDistributionSystem,
    getAvailableStatPoints,
    modifyStrength,
    modifySpeed,
    modifyIntelligence,
    getStatInfo,
    resetStatDistribution,
    addFreePoints,
    getConfig: getStatDistributionConfig,
    validateStatDistribution,
    isInitialized: () => statDistributionSystemInitialized
};
