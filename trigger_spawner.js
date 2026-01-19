/* =========================
   TRIGGER-BASED SPAWNING SYSTEM
   Dynamic enemy spawning based on player position, time, and game events
   Supports area triggers, wave systems, and performance-managed spawning
   ========================= */

class TriggerSpawner {
    /**
     * Create a trigger-based spawning system
     * @param {Object} levelManager - Reference to level manager
     */
    constructor(levelManager) {
        this.levelManager = levelManager;
        this.activeTriggers = new Set();
        this.spawnedEntities = new Map(); // Track spawned entities by trigger
        this.lastUpdateTime = 0;

        console.log('[TriggerSpawner] Initialized');
    }

    // =========================
    // TRIGGER MANAGEMENT
    // =========================

    /**
     * Add a spawning trigger to the system
     * @param {Object} triggerConfig - Trigger configuration
     */
    addTrigger(triggerConfig) {
        const trigger = this.createTrigger(triggerConfig);
        this.activeTriggers.add(trigger);
        console.log(`[TriggerSpawner] Added trigger: ${trigger.id} (${trigger.type})`);
        return trigger;
    }

    /**
     * Remove a spawning trigger
     * @param {string} triggerId - ID of trigger to remove
     */
    removeTrigger(triggerId) {
        for (const trigger of this.activeTriggers) {
            if (trigger.id === triggerId) {
                this.activeTriggers.delete(trigger);
                // Cleanup spawned entities
                this.cleanupTriggerEntities(trigger);
                console.log(`[TriggerSpawner] Removed trigger: ${triggerId}`);
                return true;
            }
        }
        return false;
    }

    /**
     * Create a trigger object from configuration
     * @param {Object} config - Trigger configuration
     */
    createTrigger(config) {
        const trigger = {
            id: config.id || `trigger_${Date.now()}_${Math.random()}`,
            type: config.type || 'area_enter', // 'area_enter', 'time_delay', 'wave', 'player_proximity'
            active: config.active !== false,
            triggered: false,
            lastTriggered: 0,
            cooldown: config.cooldown || 0,

            // Trigger-specific properties
            ...config
        };

        return trigger;
    }

    /**
     * Load triggers from level data
     * @param {Array} triggerConfigs - Array of trigger configurations
     */
    loadFromLevelData(triggerConfigs) {
        this.clear();
        if (!triggerConfigs || !Array.isArray(triggerConfigs)) return;

        for (const config of triggerConfigs) {
            this.addTrigger(config);
        }

        console.log(`[TriggerSpawner] Loaded ${triggerConfigs.length} triggers from level data`);
    }

    /**
     * Clear all triggers and cleanup spawned entities
     */
    clear() {
        for (const trigger of this.activeTriggers) {
            this.cleanupTriggerEntities(trigger);
        }
        this.activeTriggers.clear();
        this.spawnedEntities.clear();
        console.log('[TriggerSpawner] Cleared all triggers');
    }

    // =========================
    // TRIGGER EVALUATION
    // =========================

    /**
     * Update all triggers and check for spawning conditions
     * @param {Array} players - Array of player entities
     * @param {number} dt - Delta time
     */
    update(players, dt) {
        if (!players || players.length === 0) return;

        const currentTime = Date.now();
        this.lastUpdateTime = currentTime;

        for (const trigger of this.activeTriggers) {
            if (!trigger.active) continue;

            // Skip if already triggered (one-time triggers)
            if (trigger.triggered) continue;

            // Check cooldown
            if (trigger.cooldown > 0 && currentTime - trigger.lastTriggered < trigger.cooldown) {
                continue;
            }

            // Evaluate trigger condition
            if (this.evaluateTrigger(trigger, players, dt)) {
                this.executeTrigger(trigger, players);
                trigger.lastTriggered = currentTime;
            }
        }
    }

    /**
     * Evaluate if a trigger condition is met
     * @param {Object} trigger - Trigger to evaluate
     * @param {Array} players - Array of player entities
     * @param {number} dt - Delta time
     */
    evaluateTrigger(trigger, players, dt) {
        switch (trigger.type) {
            case 'area_enter':
                return this.evaluateAreaEnterTrigger(trigger, players);

            case 'time_delay':
                return this.evaluateTimeDelayTrigger(trigger);

            case 'wave':
                return this.evaluateWaveTrigger(trigger, players);

            case 'player_proximity':
                return this.evaluateProximityTrigger(trigger, players);

            default:
                console.warn(`[TriggerSpawner] Unknown trigger type: ${trigger.type}`);
                return false;
        }
    }

    /**
     * Evaluate area enter trigger
     * @param {Object} trigger - Area trigger
     * @param {Array} players - Array of players
     */
    evaluateAreaEnterTrigger(trigger, players) {
        const area = trigger.area || trigger;

        for (const player of players) {
            if (this.isPlayerInArea(player, area)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Evaluate time delay trigger
     * @param {Object} trigger - Time trigger
     */
    evaluateTimeDelayTrigger(trigger) {
        if (!trigger.startTime) {
            trigger.startTime = this.lastUpdateTime;
            // Нов параметър - брояч на спавнвания (само ако има maxCount)
            if (trigger.maxCount > 1) {
                trigger.spawnCount = 0;
            }
        }

        // **Стара логика** (еднократно изпълнение) - ако няма interval/maxCount
        if (!trigger.interval && (!trigger.maxCount || trigger.maxCount <= 1)) {
            const elapsed = this.lastUpdateTime - trigger.startTime;
            return elapsed >= (trigger.delay || 0);
        }

        // **Нова логика** (многократно изпълнение) - ако има interval/maxCount
        if (trigger.maxCount && trigger.spawnCount >= trigger.maxCount) {
            return false; // Спрете ако е достигнат лимитът
        }

        const timeSinceLastSpawn = this.lastUpdateTime - (trigger.lastSpawnTime || trigger.startTime);
        const targetDelay = trigger.interval || trigger.delay || 0;

        if (timeSinceLastSpawn >= targetDelay) {
            trigger.lastSpawnTime = this.lastUpdateTime;
            if (trigger.maxCount) {
                trigger.spawnCount = (trigger.spawnCount || 0) + 1;
            }
            return true;
        }

        return false;
    }

    /**
     * Evaluate wave trigger
     * @param {Object} trigger - Wave trigger
     * @param {Array} players - Array of players
     */
    evaluateWaveTrigger(trigger, players) {
        // Wave triggers activate based on player progress or time
        if (trigger.waveIndex === undefined) {
            trigger.waveIndex = 0;
        }

        if (trigger.waveIndex >= (trigger.waves || []).length) {
            return false; // All waves completed
        }

        const currentWave = trigger.waves[trigger.waveIndex];
        if (!currentWave) return false;

        // Check wave activation condition
        switch (currentWave.condition) {
            case 'time':
                return this.evaluateTimeDelayTrigger(currentWave);

            case 'area_enter':
                return this.evaluateAreaEnterTrigger(currentWave, players);

            case 'enemies_cleared':
                return this.checkEnemiesCleared(trigger);

            default:
                return false;
        }
    }

    /**
     * Evaluate proximity trigger
     * @param {Object} trigger - Proximity trigger
     * @param {Array} players - Array of players
     */
    evaluateProximityTrigger(trigger, players) {
        const centerX = trigger.x || 0;
        const centerY = trigger.y || 0;
        const radius = trigger.radius || 200;

        for (const player of players) {
            const distance = Math.sqrt(
                Math.pow(player.x - centerX, 2) +
                Math.pow(player.y - centerY, 2)
            );

            if (distance <= radius) {
                return true;
            }
        }
        return false;
    }

    // =========================
    // TRIGGER EXECUTION
    // =========================

    /**
     * Execute a trigger (spawn entities)
     * @param {Object} trigger - Trigger to execute
     * @param {Array} players - Array of players
     */
    executeTrigger(trigger, players) {
        console.log(`[TriggerSpawner] Executing trigger: ${trigger.id} (${trigger.type})`);

        switch (trigger.type) {
            case 'wave':
                this.executeWaveTrigger(trigger, players);
                break;

            default:
                this.spawnEntities(trigger, players);
                break;
        }

        // **Нова логика** - не задавайте triggered = true ако има maxCount > 1
        if (!trigger.maxCount || trigger.maxCount <= 1) {
            trigger.triggered = true; // Стара логика - еднократно
        } else {
            // Нова логика - позволете повторни изпълнения
            trigger.triggered = false;
        }
    }

    /**
     * Execute wave trigger (spawn wave of enemies)
     * @param {Object} trigger - Wave trigger
     * @param {Array} players - Array of players
     */
    executeWaveTrigger(trigger, players) {
        if (!trigger.waves || trigger.waveIndex >= trigger.waves.length) {
            return;
        }

        const currentWave = trigger.waves[trigger.waveIndex];
        console.log(`[TriggerSpawner] Executing wave ${trigger.waveIndex + 1}/${trigger.waves.length}`);

        // Spawn wave entities
        this.spawnEntities(currentWave, players);

        // Setup next wave
        trigger.waveIndex++;

        // If there are more waves, schedule next wave
        if (trigger.waveIndex < trigger.waves.length) {
            const nextWave = trigger.waves[trigger.waveIndex];
            if (nextWave.delay) {
                setTimeout(() => {
                    console.log(`[TriggerSpawner] Preparing next wave: ${trigger.waveIndex + 1}`);
                }, nextWave.delay);
            }
        }
    }

    /**
     * Spawn entities for a trigger
     * @param {Object} trigger - Trigger configuration
     * @param {Array} players - Array of players
     */
    async spawnEntities(trigger, players) {
        if (!trigger.entities || !Array.isArray(trigger.entities)) {
            console.warn(`[TriggerSpawner] No entities defined for trigger: ${trigger.id}`);
            return;
        }

        const spawnedIds = [];

        for (const entityConfig of trigger.entities) {
            // **Нова опция** - random позиция ако е зададено
            if (entityConfig.randomPosition && this.levelManager.currentLevel?.boundaries) {
                const boundaries = this.levelManager.currentLevel.boundaries;
                entityConfig.x = boundaries.left + Math.random() * (boundaries.right - boundaries.left);
                entityConfig.y = boundaries.top + Math.random() * (boundaries.bottom - boundaries.top);
                entityConfig.z = boundaries.zMin + Math.random() * (boundaries.zMax - boundaries.zMin);
                console.log(`[TriggerSpawner] Generated random position: (${entityConfig.x.toFixed(1)}, ${entityConfig.y.toFixed(1)}, ${entityConfig.z.toFixed(1)})`);
            }

            try {
                const entityId = await this.levelManager.spawnEntity(entityConfig);
                spawnedIds.push(entityId);

                console.log(`[TriggerSpawner] Spawned ${entityConfig.type} via trigger ${trigger.id}`);
            } catch (error) {
                console.error(`[TriggerSpawner] Failed to spawn entity:`, entityConfig, error);
            }
        }

        // Track spawned entities for this trigger
        if (!this.spawnedEntities.has(trigger.id)) {
            this.spawnedEntities.set(trigger.id, []);
        }
        this.spawnedEntities.get(trigger.id).push(...spawnedIds);
    }

    // =========================
    // UTILITY METHODS
    // =========================

    /**
     * Check if player is in a trigger area
     * @param {Object} player - Player entity
     * @param {Object} area - Area definition
     */
    isPlayerInArea(player, area) {
        const playerLeft = player.x - player.collisionW / 2;
        const playerRight = player.x + player.collisionW / 2;
        const playerTop = player.y - player.collisionH;
        const playerBottom = player.y;

        const areaLeft = area.x - (area.width / 2);
        const areaRight = area.x + (area.width / 2);
        const areaTop = area.y - area.height;
        const areaBottom = area.y;

        // AABB collision
        return playerRight > areaLeft &&
            playerLeft < areaRight &&
            playerBottom > areaTop &&
            playerTop < areaBottom;
    }

    /**
     * Check if enemies from previous wave are cleared
     * @param {Object} trigger - Wave trigger
     */
    checkEnemiesCleared(trigger) {
        const triggerEntities = this.spawnedEntities.get(trigger.id) || [];
        if (triggerEntities.length === 0) return true;

        // Check if any spawned enemies are still alive
        for (const entityId of triggerEntities) {
            const entity = this.levelManager.gameState.getEntity(entityId);
            if (entity && entity.health > 0 && !entity.isDying) {
                return false; // Still enemies alive
            }
        }

        return true; // All enemies cleared
    }

    /**
     * Cleanup entities spawned by a trigger
     * @param {Object} trigger - Trigger to cleanup
     */
    cleanupTriggerEntities(trigger) {
        const entityIds = this.spawnedEntities.get(trigger.id) || [];

        for (const entityId of entityIds) {
            // Remove entity from game state if it still exists
            const entity = this.levelManager.gameState.getEntity(entityId);
            if (entity) {
                this.levelManager.gameState.removeEntity(entityId);
            }
        }

        this.spawnedEntities.delete(trigger.id);
    }

    /**
     * Get debug information
     */
    getDebugInfo() {
        const info = {
            activeTriggers: this.activeTriggers.size,
            spawnedEntities: this.spawnedEntities.size,
            triggers: []
        };

        for (const trigger of this.activeTriggers) {
            info.triggers.push({
                id: trigger.id,
                type: trigger.type,
                active: trigger.active,
                triggered: trigger.triggered,
                spawnedCount: (this.spawnedEntities.get(trigger.id) || []).length
            });
        }

        return info;
    }

    /**
     * Reset trigger states (for level restart)
     */
    reset() {
        for (const trigger of this.activeTriggers) {
            trigger.triggered = false;
            trigger.lastTriggered = 0;
            trigger.waveIndex = 0;
            trigger.startTime = undefined;
        }

        // Don't clear spawnedEntities - they will be cleaned up by level manager
        console.log('[TriggerSpawner] Reset all trigger states');
    }
}

// =========================
// TRIGGER PRESETS
// =========================

/**
 * Predefined trigger configurations for common spawning patterns
 */
const TRIGGER_PRESETS = {
    AREA_SPAWN: {
        type: 'area_enter',
        area: { x: 0, y: 0, width: 200, height: 200 },
        entities: []
    },

    TIME_SPAWN: {
        type: 'time_delay',
        delay: 5000, // 5 seconds
        entities: []
    },

    WAVE_ENCOUNTER: {
        type: 'wave',
        waves: [
            {
                condition: 'area_enter',
                area: { x: 0, y: 0, width: 200, height: 200 },
                entities: [],
                delay: 2000
            },
            {
                condition: 'enemies_cleared',
                entities: [],
                delay: 3000
            }
        ]
    },

    PROXIMITY_AMBUSH: {
        type: 'player_proximity',
        x: 0, y: 0, radius: 300,
        entities: []
    }
};

/**
 * Create trigger with preset configuration
 * @param {string} presetName - Name of preset
 * @param {Object} overrides - Override properties
 */
function createTriggerWithPreset(presetName, overrides = {}) {
    const preset = TRIGGER_PRESETS[presetName.toUpperCase()];
    if (!preset) {
        console.warn(`Unknown trigger preset: ${presetName}`);
        return { ...overrides };
    }

    return { ...preset, ...overrides };
}

// =========================
// GLOBAL EXPORTS
// =========================

window.TriggerSpawner = TriggerSpawner;
window.createTriggerWithPreset = createTriggerWithPreset;
window.TRIGGER_PRESETS = TRIGGER_PRESETS;
