// Character Core System
// Manages character lifecycle, creation, and basic operations

// Character registry for managing all characters
let characterRegistry = new Map();

// Character Core System State
let characterCoreInitialized = false;

// Initialize the character core system
function initCharacterSystem() {
    if (characterCoreInitialized) {
        console.log('[Character Core] Already initialized');
        return;
    }

    console.log('[Character Core] Initializing...');

    // Initialize character registry
    characterRegistry.clear();

    characterCoreInitialized = true;
    console.log('[Character Core] Initialization complete');
}

// Create a new character
function createCharacter(characterData) {
    const { characterId, playerIndex } = characterData;

    if (characterRegistry.has(playerIndex)) {
        console.warn(`[Character Core] Character already exists for player ${playerIndex}`);
        return characterRegistry.get(playerIndex);
    }

    const character = new CharacterInfo(characterId);
    characterRegistry.set(playerIndex, character);

    console.log(`[Character Core] Created character for player ${playerIndex}: ${character.getDisplayName()}`);
    return character;
}

// Get character by player index
function getCharacter(playerIndex) {
    return characterRegistry.get(playerIndex) || null;
}

// Update character data
function updateCharacter(playerIndex, updates) {
    const character = characterRegistry.get(playerIndex);
    if (!character) {
        console.warn(`[Character Core] No character found for player ${playerIndex}`);
        return false;
    }

    // Apply updates to character
    Object.assign(character, updates);

    console.log(`[Character Core] Updated character for player ${playerIndex}`);
    return true;
}

// Remove character
function removeCharacter(playerIndex) {
    const character = characterRegistry.get(playerIndex);
    if (!character) {
        console.warn(`[Character Core] No character found for player ${playerIndex}`);
        return false;
    }

    characterRegistry.delete(playerIndex);
    console.log(`[Character Core] Removed character for player ${playerIndex}`);
    return true;
}

// Get all characters
function getAllCharacters() {
    return Array.from(characterRegistry.entries());
}

// Get character count
function getCharacterCount() {
    return characterRegistry.size;
}

// Check if character exists
function hasCharacter(playerIndex) {
    return characterRegistry.has(playerIndex);
}

// Reset all characters (useful for game restart)
function resetAllCharacters() {
    characterRegistry.clear();
    console.log('[Character Core] All characters reset');
}

// Global exports for backward compatibility
window.CharacterCore = {
    init: initCharacterSystem,
    createCharacter,
    getCharacter,
    updateCharacter,
    removeCharacter,
    getAllCharacters,
    getCharacterCount,
    hasCharacter,
    resetAllCharacters,
    isInitialized: () => characterCoreInitialized
};

// Initialize when loaded
initCharacterSystem();
