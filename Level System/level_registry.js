/* =========================
   LEVEL REGISTRY SYSTEM
   Central registry for managing all game levels
   Handles level loading, caching, and organization
   ========================= */

class LevelRegistry {
    constructor() {
        this.levels = new Map();
        this.categories = new Map();

        // Initialize registry with predefined levels
        this.initializeWithPredefinedLevels();

        // Set as global instance for auto-registration
        if (!window.levelRegistryInstance) {
            window.levelRegistryInstance = this;
        }
    }

    /**
     * Get the global registry instance
     * @returns {LevelRegistry} The global registry instance
     */
    static getInstance() {
        if (!window.levelRegistryInstance) {
            window.levelRegistryInstance = new LevelRegistry();
        }
        return window.levelRegistryInstance;
    }

    /**
     * Initialize the registry - levels auto-register themselves now
     */
    initializeWithPredefinedLevels() {
        console.log('[LevelRegistry] Registry initialized - levels auto-register from their files');
        console.log(`[LevelRegistry] Currently registered levels: ${this.levels.size}`);
    }

    /**
     * Register a level in the registry
     * @param {LevelData} levelData - Level data to register
     */
    registerLevel(levelData) {
        if (!(levelData instanceof window.LevelData)) {
            throw new Error('Must register LevelData instance');
        }

        this.levels.set(levelData.id, levelData);
        console.log(`[LevelRegistry] Registered level: ${levelData.id}`);
    }

    /**
     * Get level by ID
     * @param {string} levelId - Level identifier
     */
    getLevel(levelId) {
        return this.levels.get(levelId) || null;
    }

    /**
     * Get all registered levels
     */
    getAllLevels() {
        return Array.from(this.levels.values());
    }

    /**
     * Get levels by category
     * @param {string} category - Category name
     */
    getLevelsByCategory(category) {
        return this.getAllLevels().filter(level => {
            // Add category logic when implemented
            return true; // Placeholder
        });
    }

    /**
     * Check if level exists
     * @param {string} levelId - Level identifier
     */
    hasLevel(levelId) {
        return this.levels.has(levelId);
    }

    /**
     * Remove level from registry
     * @param {string} levelId - Level identifier
     */
    unregisterLevel(levelId) {
        const removed = this.levels.delete(levelId);
        if (removed) {
            console.log(`[LevelRegistry] Unregistered level: ${levelId}`);
        }
        return removed;
    }

    /**
     * Clear all levels
     */
    clear() {
        this.levels.clear();
        this.categories.clear();
        console.log('[LevelRegistry] Cleared all levels');
    }
}

// =========================
// GLOBAL EXPORTS
// =========================

window.LevelRegistry = LevelRegistry;
