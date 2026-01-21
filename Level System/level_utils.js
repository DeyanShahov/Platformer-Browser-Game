/* =========================
   LEVEL UTILITIES
   Common utilities for level configuration export and registration
   Eliminates code duplication across level files
   ========================= */

/**
 * Register a level configuration with global scope and LevelRegistry
 * Handles deferred registration with retry logic
 * @param {Object} levelConfig - Level configuration object
 */
function registerLevelConfig(levelConfig) {
    if (!levelConfig || !levelConfig.id) {
        console.error('[LevelUtils] Invalid level config: missing id');
        return;
    }

    const configVarName = `${levelConfig.id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_CONFIG`;
    const registerFunctionName = `register${levelConfig.id.replace(/[^a-zA-Z0-9]/g, '')}Level`;

    // Export for global scope
    if (typeof window !== 'undefined') {
        window[configVarName] = levelConfig;

        // Deferred auto-registration with LevelRegistry
        function registerLevel() {
            if (window.LevelRegistry && window.LevelData) {
                try {
                    window.LevelRegistry.getInstance().registerLevel(new window.LevelData(levelConfig));
                    console.log(`[LevelRegistration] Auto-registered ${levelConfig.id}`);
                } catch (error) {
                    console.warn(`[LevelRegistration] Failed to auto-register ${levelConfig.id}:`, error);
                    // Retry after a short delay
                    setTimeout(registerLevel, 50);
                }
            } else {
                // LevelRegistry not ready yet, retry
                setTimeout(registerLevel, 10);
            }
        }

        // Start registration attempt
        registerLevel();
    }
}

// =========================
// GLOBAL EXPORTS
// =========================

window.registerLevelConfig = registerLevelConfig;
