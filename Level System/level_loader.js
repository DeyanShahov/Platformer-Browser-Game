/* =========================
   LEVEL LOADER UTILITIES
   Utilities for loading and registering level data
   Handles dynamic imports and level initialization
   ========================= */

/**
 * Load and register a level from a level configuration
 * @param {Object} levelConfig - Raw level configuration object
 * @param {LevelRegistry} registry - Level registry instance
 * @returns {LevelData} Created LevelData instance
 */
function loadLevelFromConfig(levelConfig, registry) {
    try {
        console.log(`[LevelLoader] Loading level: ${levelConfig.id}`);

        // Create LevelData instance
        const levelData = new window.LevelData(levelConfig);

        // Register in registry
        registry.registerLevel(levelData);

        console.log(`[LevelLoader] Successfully loaded and registered level: ${levelData.id}`);
        return levelData;

    } catch (error) {
        console.error(`[LevelLoader] Failed to load level ${levelConfig.id}:`, error);
        throw error;
    }
}

/**
 * Load all predefined levels into the registry
 * Now loads from individual level files instead of hardcoded data
 * @param {LevelRegistry} registry - Level registry instance
 */
function loadAllPredefinedLevels(registry) {
    console.log('[LevelLoader] Loading all predefined levels from individual files...');

    // Level configurations from individual files (accessed via global variables)
    const levelSources = [
        {
            id: 'tutorial_1',
            globalVar: 'TUTORIAL_1_CONFIG',
            file: 'data/levels/tutorial/tutorial_1.js'
        },
        {
            id: 'combat_room_1',
            globalVar: 'COMBAT_ROOM_1_CONFIG',
            file: 'data/levels/combat/combat_room_1.js'
        },
        {
            id: 'boss_level',
            globalVar: 'BOSS_LEVEL_CONFIG',
            file: 'data/levels/boss/boss_level.js'
        },
        {
            id: 'end_game',
            globalVar: 'END_GAME_CONFIG',
            file: 'data/levels/special/end_game.js'
        }
    ];

    let loadedCount = 0;
    let failedCount = 0;

    // Load each level from its global variable
    for (const source of levelSources) {
        try {
            // Check if the global variable exists
            const levelConfig = window[source.globalVar];

            if (!levelConfig) {
                throw new Error(`Global variable ${source.globalVar} not found. Make sure ${source.file} is loaded.`);
            }

            // Validate that the config has the expected ID
            if (levelConfig.id !== source.id) {
                console.warn(`[LevelLoader] Level config ID mismatch: expected ${source.id}, got ${levelConfig.id}`);
            }

            // Load and register the level
            loadLevelFromConfig(levelConfig, registry);
            loadedCount++;

            console.log(`[LevelLoader] Successfully loaded level ${source.id} from ${source.file}`);

        } catch (error) {
            console.error(`[LevelLoader] Failed to load level ${source.id} from ${source.file}:`, error);
            failedCount++;
        }
    }

    console.log(`[LevelLoader] Finished loading levels from files: ${loadedCount} loaded, ${failedCount} failed`);
    return { loadedCount, failedCount };
}

/**
 * Load a level from a file path (for future dynamic loading)
 * @param {string} filePath - Path to the level file
 * @param {LevelRegistry} registry - Level registry instance
 * @returns {Promise<LevelData>} Promise that resolves to the loaded LevelData
 */
async function loadLevelFromFile(filePath, registry) {
    try {
        console.log(`[LevelLoader] Loading level from file: ${filePath}`);

        // This would use dynamic import in a real implementation
        // const levelModule = await import(filePath);
        // const levelConfig = levelModule.default || levelModule;

        // For now, throw an error indicating this needs implementation
        throw new Error('Dynamic file loading not yet implemented. Use loadLevelFromConfig instead.');

    } catch (error) {
        console.error(`[LevelLoader] Failed to load level from file ${filePath}:`, error);
        throw error;
    }
}

/**
 * Validate level data before registration
 * @param {Object} levelConfig - Level configuration to validate
 * @returns {boolean} Whether the configuration is valid
 */
function validateLevelConfig(levelConfig) {
    const errors = [];

    // Required fields
    if (!levelConfig.id) errors.push('Missing id');
    if (!levelConfig.name) errors.push('Missing name');
    if (!levelConfig.type) errors.push('Missing type');

    // Type validation
    const validTypes = ['static', 'scrolling_horizontal', 'scrolling_vertical', 'end_game'];
    if (!validTypes.includes(levelConfig.type)) {
        errors.push(`Invalid type: ${levelConfig.type}`);
    }

    // Boundaries validation
    if (!levelConfig.boundaries) {
        errors.push('Missing boundaries');
    } else {
        const b = levelConfig.boundaries;
        if (b.right <= b.left) errors.push('Invalid boundaries: right <= left');
        if (b.bottom <= b.top) errors.push('Invalid boundaries: bottom <= top');
    }

    if (errors.length > 0) {
        console.error(`[LevelLoader] Validation failed for level ${levelConfig.id}:`, errors);
        return false;
    }

    return true;
}

/**
 * Get loading statistics
 * @param {LevelRegistry} registry - Level registry instance
 * @returns {Object} Loading statistics
 */
function getLoadingStats(registry) {
    const stats = registry.getStats();

    return {
        ...stats,
        validationErrors: registry.validateAllLevels()
    };
}

// =========================
// GLOBAL EXPORTS
// =========================

window.LevelLoader = {
    loadLevelFromConfig,
    loadAllPredefinedLevels,
    loadLevelFromFile,
    validateLevelConfig,
    getLoadingStats
};
