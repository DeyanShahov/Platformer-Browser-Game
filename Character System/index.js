// Character System - Unified API for all character-related functionality
// Orchestrates character core, progression, UI, and combat systems

// Character System State
let characterSystemInitialized = false;

// Main initialization function
function initCharacterSystem() {
    if (characterSystemInitialized) {
        console.log('[Character System] Already initialized');
        return;
    }

    console.log('[Character System] Initializing...');

    try {
        // Initialize core character functionality
        window.CharacterCore.init();

        // Initialize progression systems
        window.ExperienceSystem.init();
        window.StatDistributionSystem.init();

        // Initialize combat integration
        window.CharacterCombatSystem.init();

        characterSystemInitialized = true;
        console.log('[Character System] Initialization complete');

    } catch (error) {
        console.error('[Character System] Initialization failed:', error);
        throw error;
    }
}

// Character management functions
function createCharacter(characterData) {
    return window.CharacterCore.createCharacter(characterData);
}

function getCharacter(playerIndex) {
    return window.CharacterCore.getCharacter(playerIndex);
}

function updateCharacter(playerIndex, updates) {
    return window.CharacterCore.updateCharacter(playerIndex, updates);
}

// Experience and leveling
function addExperience(playerIndex, amount) {
    return window.ExperienceSystem.addExperience(playerIndex, amount);
}

function getLevelInfo(playerIndex) {
    return window.ExperienceSystem.getLevelInfo(playerIndex);
}

// Stat distribution
function modifyStrength(playerIndex, amount) {
    return window.StatDistributionSystem.modifyStrength(playerIndex, amount);
}

function modifySpeed(playerIndex, amount) {
    return window.StatDistributionSystem.modifySpeed(playerIndex, amount);
}

function modifyIntelligence(playerIndex, amount) {
    return window.StatDistributionSystem.modifyIntelligence(playerIndex, amount);
}

function getAvailableStatPoints(playerIndex) {
    return window.StatDistributionSystem.getAvailableStatPoints(playerIndex);
}

// Character stats UI
function showCharacterStats(playerIndex) {
    return window.characterStatsUI.showForPlayer(playerIndex);
}

function hideCharacterStats() {
    return window.characterStatsUI.hide();
}

// Character combat integration
function getCharacterCombatStats(playerIndex) {
    return window.CharacterCombatSystem.getCharacterCombatStats(playerIndex);
}

function applyCharacterCombatBonuses(playerIndex, combatData) {
    return window.CharacterCombatSystem.applyCharacterCombatBonuses(playerIndex, combatData);
}

// System status
function isCharacterSystemReady() {
    return characterSystemInitialized;
}

function getCharacterSystemStatus() {
    return {
        initialized: characterSystemInitialized,
        core: window.CharacterCore ? 'ready' : 'not ready',
        ui: window.characterStatsUI ? 'ready' : 'not ready',
        experience: window.ExperienceSystem ? 'ready' : 'not ready',
        stats: window.StatDistributionSystem ? 'ready' : 'not ready',
        combat: window.CharacterCombatSystem ? 'ready' : 'not ready'
    };
}

// Global exports for backward compatibility
window.CharacterSystem = {
    init: initCharacterSystem,
    createCharacter,
    getCharacter,
    updateCharacter,
    addExperience,
    getLevelInfo,
    modifyStrength,
    modifySpeed,
    modifyIntelligence,
    getAvailableStatPoints,
    showCharacterStats,
    hideCharacterStats,
    getCharacterCombatStats,
    applyCharacterCombatBonuses,
    isReady: isCharacterSystemReady,
    getStatus: getCharacterSystemStatus
};
