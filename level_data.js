/* =========================
   LEVEL DATA SYSTEM
   Data-driven level configuration and management
   Defines level structure, entities, completion conditions
   ========================= */

class LevelData {
    /**
     * Create a new level data configuration
     * @param {Object} config - Level configuration object
     */
    constructor(config) {
        // Basic level information
        this.id = config.id;
        this.name = config.name || 'Unnamed Level';
        this.description = config.description || '';
        this.type = config.type || 'static'; // 'static', 'scrolling_horizontal', 'scrolling_vertical'

        // Visual and audio settings
        this.backgroundImages = config.backgroundImages || [];
        this.musicTrack = config.musicTrack || null;
        this.ambientEffects = config.ambientEffects || null;

        // Level mechanics
        this.boundaries = config.boundaries || this.getDefaultBoundaries();
        this.scrollSettings = config.scrollSettings || null;

        // Entity definitions
        this.entities = config.entities || [];
        this.neutralObjects = config.neutralObjects || [];

        // Player spawn points
        this.playerSpawns = config.playerSpawns || this.getDefaultPlayerSpawns();

        // Completion conditions
        this.completionConditions = config.completionConditions || [];

        // Transition settings
        this.exitPoints = config.exitPoints || [];
        this.nextLevelId = config.nextLevelId || null;
        this.transitionType = config.transitionType || 'fade';

        // UI and tutorial settings
        this.ui = config.ui || null;
        this.tutorial = config.tutorial || null;

        // Progression settings
        this.difficultyMultiplier = config.difficultyMultiplier || 1.0;
        this.baseExperience = config.baseExperience || 100;
        this.parTime = config.parTime || 300000; // 5 minutes default

        // Validate configuration
        this.validateConfiguration();

        console.log(`[LevelData] Created level: ${this.id} (${this.type})`);
    }

    // =========================
    // CONFIGURATION VALIDATION
    // =========================

    /**
     * Validate level configuration for required fields and consistency
     */
    validateConfiguration() {
        const errors = [];

        // Required fields
        if (!this.id) errors.push('Level ID is required');
        if (!this.name) errors.push('Level name is required');

        // Type validation
        const validTypes = ['static', 'scrolling_horizontal', 'scrolling_vertical'];
        if (!validTypes.includes(this.type)) {
            errors.push(`Invalid level type: ${this.type}. Must be one of: ${validTypes.join(', ')}`);
        }

        // Boundary validation
        if (this.boundaries) {
            if (this.boundaries.right <= this.boundaries.left) {
                errors.push('Right boundary must be greater than left boundary');
            }
            if (this.boundaries.bottom <= this.boundaries.top) {
                errors.push('Bottom boundary must be greater than top boundary');
            }
        }

        // Entity validation
        this.entities.forEach((entity, index) => {
            if (!entity.type) {
                errors.push(`Entity ${index}: type is required`);
            }
            if (entity.type === 'enemy' && !entity.enemyType) {
                errors.push(`Entity ${index}: enemyType is required for enemy entities`);
            }
        });

        // Completion condition validation
        this.completionConditions.forEach((condition, index) => {
            if (!condition.type) {
                errors.push(`Completion condition ${index}: type is required`);
            }
            const validConditionTypes = ['enemies_defeated', 'time_survival', 'object_interaction', 'puzzle_solved', 'area_reached', 'score_achieved', 'multiple'];
            if (!validConditionTypes.includes(condition.type)) {
                errors.push(`Completion condition ${index}: invalid type '${condition.type}'`);
            }
        });

        if (errors.length > 0) {
            throw new Error(`Level configuration validation failed:\n${errors.join('\n')}`);
        }
    }

    // =========================
    // LEVEL PROPERTIES
    // =========================

    /**
     * Get default boundaries for a level
     */
    getDefaultBoundaries() {
        return {
            left: 0,
            right: typeof CANVAS_WIDTH !== 'undefined' ? CANVAS_WIDTH : 1200,
            top: 0,
            bottom: typeof CANVAS_HEIGHT !== 'undefined' ? CANVAS_HEIGHT : 800,
            zMin: -50,
            zMax: 50
        };
    }

    /**
     * Get default player spawn points
     */
    getDefaultPlayerSpawns() {
        const centerX = (this.boundaries.right - this.boundaries.left) / 2;
        const centerY = (this.boundaries.bottom - this.boundaries.top) / 2;

        return [
            { x: centerX - 100, y: centerY, z: 0 }, // Player 1
            { x: centerX + 100, y: centerY, z: 0 }, // Player 2
            { x: centerX, y: centerY + 50, z: 0 }, // Player 3
            { x: centerX, y: centerY - 50, z: 0 }  // Player 4
        ];
    }

    /**
     * Check if level is scrolling type
     */
    isScrollingLevel() {
        return this.type.includes('scrolling');
    }

    /**
     * Get level dimensions
     */
    getDimensions() {
        return {
            width: this.boundaries.right - this.boundaries.left,
            height: this.boundaries.bottom - this.boundaries.top,
            depth: this.boundaries.zMax - this.boundaries.zMin
        };
    }

    /**
     * Get all entities (enemies + neutral objects)
     */
    getAllEntities() {
        return [...this.entities, ...this.neutralObjects];
    }

    /**
     * Get entities by type
     * @param {string} type - Entity type to filter by
     */
    getEntitiesByType(type) {
        return this.getAllEntities().filter(entity => entity.type === type);
    }

    /**
     * Get enemy entities only
     */
    getEnemies() {
        return this.entities.filter(entity => entity.type === 'enemy');
    }

    /**
     * Get neutral objects only
     */
    getNeutralObjects() {
        return this.neutralObjects;
    }

    // =========================
    // COMPLETION LOGIC
    // =========================

    /**
     * Get completion requirements summary
     */
    getCompletionSummary() {
        const summary = {
            totalConditions: this.completionConditions.length,
            enemyDefeatRequired: 0,
            timeRequired: 0,
            areasRequired: [],
            objectsRequired: []
        };

        this.completionConditions.forEach(condition => {
            switch (condition.type) {
                case 'enemies_defeated':
                    summary.enemyDefeatRequired = Math.max(summary.enemyDefeatRequired, condition.targetCount || 0);
                    break;
                case 'time_survival':
                    summary.timeRequired = Math.max(summary.timeRequired, condition.targetTime || 0);
                    break;
                case 'area_reached':
                    summary.areasRequired.push(condition.targetArea);
                    break;
                case 'object_interaction':
                    summary.objectsRequired.push(condition.objectId);
                    break;
            }
        });

        return summary;
    }

    /**
     * Check if level has specific completion type
     * @param {string} type - Completion condition type
     */
    hasCompletionType(type) {
        return this.completionConditions.some(condition => condition.type === type);
    }

    // =========================
    // SERIALIZATION
    // =========================

    /**
     * Serialize level data for saving/loading
     */
    serialize() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            type: this.type,
            boundaries: { ...this.boundaries },
            entities: this.entities.map(entity => ({ ...entity })),
            neutralObjects: this.neutralObjects.map(obj => ({ ...obj })),
            completionConditions: this.completionConditions.map(cond => ({ ...cond })),
            difficultyMultiplier: this.difficultyMultiplier,
            baseExperience: this.baseExperience,
            parTime: this.parTime,
            // Include other serializable properties as needed
        };
    }

    /**
     * Create level data from serialized data
     * @param {Object} data - Serialized level data
     */
    static deserialize(data) {
        return new LevelData(data);
    }

    // =========================
    // UTILITY METHODS
    // =========================

    /**
     * Get level display information
     */
    getDisplayInfo() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            type: this.type,
            dimensions: this.getDimensions(),
            entityCount: this.getAllEntities().length,
            enemyCount: this.getEnemies().length,
            completionSummary: this.getCompletionSummary()
        };
    }

    /**
     * Clone level data for modifications
     */
    clone() {
        return new LevelData(this.serialize());
    }

    /**
     * Create a modified version of this level
     * @param {Object} modifications - Properties to modify
     */
    createVariant(modifications) {
        const variantData = { ...this.serialize(), ...modifications };
        return new LevelData(variantData);
    }
}

// =========================
// LEVEL DATA PRESETS
// =========================

/**
 * Predefined level templates for quick creation
 */
const LEVEL_PRESETS = {
    TUTORIAL: {
        type: 'static',
        boundaries: { left: 0, right: 1200, top: 0, bottom: 800, zMin: -50, zMax: 50 },
        completionConditions: [{
            type: 'enemies_defeated',
            targetCount: 1
        }]
    },

    COMBAT_ROOM: {
        type: 'static',
        boundaries: { left: 0, right: 1200, top: 0, bottom: 800, zMin: -50, zMax: 50 },
        completionConditions: [{
            type: 'enemies_defeated',
            targetCount: 3
        }]
    },

    SCROLLING_LEVEL: {
        type: 'scrolling_horizontal',
        scrollSettings: {
            direction: 'right',
            speed: 1.0,
            deadzone: 200,
            bounds: { startX: 0, endX: 3000, minY: 0, maxY: 800 }
        },
        completionConditions: [{
            type: 'area_reached',
            targetArea: { x: 2800, y: 0, width: 200, height: 800 }
        }]
    }
};

/**
 * Create level from preset template
 * @param {string} presetName - Name of preset to use
 * @param {Object} customConfig - Custom configuration to apply
 */
function createLevelFromPreset(presetName, customConfig) {
    const preset = LEVEL_PRESETS[presetName.toUpperCase()];
    if (!preset) {
        throw new Error(`Unknown level preset: ${presetName}`);
    }

    const levelConfig = { ...preset, ...customConfig };
    return new LevelData(levelConfig);
}

// =========================
// LEVEL REGISTRY SYSTEM
// =========================

class LevelRegistry {
    constructor() {
        this.levels = new Map();
        this.categories = new Map();
    }

    /**
     * Register a level in the registry
     * @param {LevelData} levelData - Level data to register
     */
    registerLevel(levelData) {
        if (!(levelData instanceof LevelData)) {
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

window.LevelData = LevelData;
window.LevelRegistry = LevelRegistry;
window.LEVEL_PRESETS = LEVEL_PRESETS;
window.createLevelFromPreset = createLevelFromPreset;
