// Experience System
// Manages character leveling, experience points, and progression

// Experience System State
let experienceSystemInitialized = false;

// Experience table and leveling logic
const EXPERIENCE_CONFIG = {
    BASE_XP_PER_LEVEL: 100,
    XP_MULTIPLIER: 1.0, // Linear progression for now
    LEVEL_CAP: 50,
    XP_REWARD_MULTIPLIERS: {
        ENEMY_KILL: 1.0,
        QUEST_COMPLETE: 2.0,
        BOSS_KILL: 3.0
    }
};

// Initialize the experience system
function initExperienceSystem() {
    if (experienceSystemInitialized) {
        console.log('[Experience System] Already initialized');
        return;
    }

    console.log('[Experience System] Initializing...');
    experienceSystemInitialized = true;
    console.log('[Experience System] Initialization complete');
}

// Calculate experience needed for a specific level
function calculateExperienceForLevel(level) {
    return Math.floor(level * EXPERIENCE_CONFIG.BASE_XP_PER_LEVEL * EXPERIENCE_CONFIG.XP_MULTIPLIER);
}

// Get experience info for a character
function getLevelInfo(playerIndex) {
    const character = window.CharacterCore.getCharacter(playerIndex);
    if (!character) {
        console.warn(`[Experience System] No character found for player ${playerIndex}`);
        return null;
    }

    return {
        level: character.level,
        experience: character.experience,
        experienceToNext: character.experienceToNext,
        experiencePercentage: (character.experience / character.experienceToNext) * 100,
        totalExperienceNeeded: calculateExperienceForLevel(character.level + 1),
        isMaxLevel: character.level >= EXPERIENCE_CONFIG.LEVEL_CAP
    };
}

// Add experience to a character
function addExperience(playerIndex, amount, source = 'unknown') {
    const character = window.CharacterCore.getCharacter(playerIndex);
    if (!character) {
        console.warn(`[Experience System] No character found for player ${playerIndex}`);
        return false;
    }

    if (character.level >= EXPERIENCE_CONFIG.LEVEL_CAP) {
        console.log(`[Experience System] Character is at max level (${EXPERIENCE_CONFIG.LEVEL_CAP})`);
        return false;
    }

    character.experience += amount;

    console.log(`[Experience System] Player ${playerIndex} gained ${amount} XP from ${source}. Total: ${character.experience}`);

    // Check for level up
    let leveledUp = false;
    while (character.experience >= character.experienceToNext && character.level < EXPERIENCE_CONFIG.LEVEL_CAP) {
        levelUpCharacter(playerIndex);
        leveledUp = true;
    }

    return leveledUp;
}

// Level up a character (internal function)
function levelUpCharacter(playerIndex) {
    const character = window.CharacterCore.getCharacter(playerIndex);
    if (!character) return;

    // Deduct experience cost
    character.experience -= character.experienceToNext;
    character.level++;

    // Calculate new experience requirement
    character.experienceToNext = calculateExperienceForLevel(character.level + 1);

    // Auto-increase stats
    character.strength += 1;
    character.speed += 1;
    character.intelligence += 1;

    // Give free points for manual distribution
    character.freePoints += 5;

    console.log(`[Experience System] Player ${playerIndex} leveled up to ${character.level}!`);
    console.log(`[Experience System] Auto stats: +1 Strength, +1 Speed, +1 Intelligence`);
    console.log(`[Experience System] Free points: +5 (Total: ${character.freePoints})`);

    // Restore resources on level up (if player exists)
    const player = window.gameState?.players?.[playerIndex];
    if (player) {
        player.health = player.maxHealth;
        player.mana = player.maxMana;
        player.energy = player.maxEnergy;
        console.log(`[Experience System] Player ${playerIndex} resources restored to 100%`);

        // Give skill points
        if (player.skillPoints !== undefined) {
            player.skillPoints += 2;
            console.log(`[Experience System] Player ${playerIndex} gained 2 skill points (Total: ${player.skillPoints})`);
        }
    }
}

// Set character level directly (admin/cheat function)
function setCharacterLevel(playerIndex, newLevel) {
    const character = window.CharacterCore.getCharacter(playerIndex);
    if (!character) {
        console.warn(`[Experience System] No character found for player ${playerIndex}`);
        return false;
    }

    newLevel = Math.max(1, Math.min(newLevel, EXPERIENCE_CONFIG.LEVEL_CAP));

    if (newLevel < character.level) {
        // Level down - reset experience
        character.level = newLevel;
        character.experience = 0;
        character.experienceToNext = calculateExperienceForLevel(newLevel + 1);
    } else if (newLevel > character.level) {
        // Level up - give full experience
        character.level = newLevel;
        character.experience = 0;
        character.experienceToNext = calculateExperienceForLevel(newLevel + 1);
    }

    console.log(`[Experience System] Player ${playerIndex} level set to ${newLevel}`);
    return true;
}

// Calculate experience reward based on source
function calculateExperienceReward(baseAmount, source = 'enemy_kill') {
    const multiplier = EXPERIENCE_CONFIG.XP_REWARD_MULTIPLIERS[source] || 1.0;
    return Math.floor(baseAmount * multiplier);
}

// Get leveling progress as percentage
function getLevelingProgress(playerIndex) {
    const info = getLevelInfo(playerIndex);
    return info ? info.experiencePercentage : 0;
}

// Check if character can level up
function canLevelUp(playerIndex) {
    const info = getLevelInfo(playerIndex);
    return info ? info.experience >= info.experienceToNext && !info.isMaxLevel : false;
}

// Get experience configuration
function getExperienceConfig() {
    return { ...EXPERIENCE_CONFIG };
}

// Global exports for backward compatibility
window.ExperienceSystem = {
    init: initExperienceSystem,
    getLevelInfo,
    addExperience,
    setCharacterLevel,
    calculateExperienceReward,
    getLevelingProgress,
    canLevelUp,
    getConfig: getExperienceConfig,
    isInitialized: () => experienceSystemInitialized
};
