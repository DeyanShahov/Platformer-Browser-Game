/* =========================
   TRIGGER-BASED SPAWNING SYSTEM
   Dynamic enemy spawning based on player position, time, and game events
   Supports area triggers, wave systems, and performance-managed spawning
   ========================= */

// =========================
// TRIGGER STATES - State Machine for Trigger Lifecycle
// =========================
const TRIGGER_STATES = {
    INACTIVE: 'inactive',      // Trigger created but not yet activated
    ACTIVE: 'active',          // Trigger is active and evaluating conditions
    TRIGGERED: 'triggered',    // Condition met, currently executing
    COMPLETED: 'completed',    // Max count reached or manually completed
    DISABLED: 'disabled'       // Manually disabled by game logic
};

// Debug: Verify TRIGGER_STATES object is properly defined
console.log('[TriggerSpawner] TRIGGER_STATES defined:', TRIGGER_STATES);
console.log('[TriggerSpawner] TRIGGER_STATES.ACTIVE:', TRIGGER_STATES.ACTIVE);
console.log('[TriggerSpawner] TRIGGER_STATES.INACTIVE:', TRIGGER_STATES.INACTIVE);

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
        this.performanceStats = {
            totalSpawns: 0,
            failedSpawns: 0,
            activeTriggers: 0,
            completedTriggers: 0
        };

        console.log('[TriggerSpawner] Initialized with enhanced state management');
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
        // Validate required properties
        if (!config.type) {
            console.warn('[TriggerSpawner] Trigger config missing type, defaulting to area_enter');
            config.type = 'area_enter';
        }

        const trigger = {
            id: config.id || `trigger_${Date.now()}_${Math.random()}`,
            type: config.type,
            state: TRIGGER_STATES.INACTIVE, // Start in inactive state
            active: config.active !== false,
            triggered: false, // Legacy property for backward compatibility
            lastTriggered: 0,
            cooldown: config.cooldown || 0,
            spawnCount: 0, // Initialize spawn counter
            startTime: undefined, // Will be set when activated
            waveIndex: 0, // For wave triggers

            // Trigger-specific properties
            ...config
        };

        // Initialize maxCount if not provided
        if (trigger.maxCount === undefined && trigger.interval) {
            trigger.maxCount = Infinity; // Infinite spawns for interval triggers without maxCount
        }

        console.log(`[TriggerSpawner] Created trigger ${trigger.id} (${trigger.type}) in state: ${trigger.state}`);
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

        // Safety check: prevent infinite loops
        const maxEvaluations = 100;
        let evaluations = 0;

        // Log system state very infrequently - only when debugging is needed
        // Commented out for production to reduce noise
        // if (this.activeTriggers.size > 0 && this.performanceStats.totalSpawns % 200 === 0) {
        //     this.logTriggerSystemState();
        // }

        for (const trigger of this.activeTriggers) {
            if (evaluations++ > maxEvaluations) {
                console.error('[TriggerSpawner] Too many evaluations - breaking loop to prevent infinite spawning');
                break;
            }

            // CRITICAL FIX: Skip if in COMPLETED state (replaces old boolean logic)
            if (trigger.state === TRIGGER_STATES.COMPLETED) {
                // Only log when debugging specific issues
                // console.log(`[TriggerSpawner] ${trigger.id} is COMPLETED - skipping evaluation`);
                continue;
            }

            // Skip if not active
            if (!trigger.active) {
                // Only log when debugging specific issues
                // console.log(`[TriggerSpawner] ${trigger.id} is not active - skipping`);
                continue;
            }

            // Skip if in TRIGGERED state (currently executing)
            if (trigger.state === TRIGGER_STATES.TRIGGERED) {
                // Only log when debugging specific issues
                // console.log(`[TriggerSpawner] ${trigger.id} is TRIGGERED - skipping evaluation`);
                continue;
            }

            // Check cooldown
            if (trigger.cooldown > 0 && currentTime - trigger.lastTriggered < trigger.cooldown) {
                // Only log when debugging specific issues
                // console.log(`[TriggerSpawner] ${trigger.id} on cooldown - skipping`);
                continue;
            }

            // DEBUG: Log trigger evaluation only for debugging purposes
            // Comment out this line for production to reduce noise
            // console.log(`[TriggerSpawner] Evaluating trigger ${trigger.id} of type ${trigger.type} in state: ${trigger.state}`);

            // Evaluate trigger condition
            if (this.evaluateTrigger(trigger, players, dt)) {
                console.log(`[TriggerSpawner] Trigger ${trigger.id} condition met, executing...`);
                this.executeTrigger(trigger, players);
                // Note: Timing is now handled in executeTrigger via state transitions
            } else {
                // Only log when debugging specific issues - comment out for production
                // console.log(`[TriggerSpawner] Trigger ${trigger.id} condition NOT met`);
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

        // Check if this is a one-time trigger and already triggered
        if (trigger.oneTime && trigger.triggered) {
            console.log(`[TriggerSpawner] ${trigger.id} is one-time and already triggered - skipping`);
            return false;
        }

        for (const player of players) {
            if (this.isPlayerInArea(player, area)) {
                // For one-time triggers, we need to make sure they're not re-triggered after completion
                if (trigger.oneTime && trigger.state === TRIGGER_STATES.COMPLETED) {
                    console.log(`[TriggerSpawner] ${trigger.id} is one-time and completed - skipping`);
                    return false;
                }
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
        const debugInfo = this.getTriggerDebugInfo(trigger.id);
        console.log(`[TriggerSpawner] Evaluating time delay trigger ${trigger.id}`, debugInfo);

        // Skip if trigger is completed
        if (trigger.state === TRIGGER_STATES.COMPLETED) {
            console.log(`[TriggerSpawner] ${trigger.id} already completed - skipping evaluation`);
            return false;
        }

        // Initialize trigger if first evaluation (only if not already ACTIVE)
        if (trigger.state === TRIGGER_STATES.INACTIVE) {
            const result = this.transitionTriggerState(trigger, TRIGGER_STATES.ACTIVE);
            if (result) {
                console.log(`[TriggerSpawner] ${trigger.id} activated and ready for first spawn`);
            } else {
                console.error(`[TriggerSpawner] Failed to activate trigger ${trigger.id}`);
                return false;
            }
        }

        // Check max count first for interval triggers
        if (trigger.interval && trigger.maxCount && trigger.spawnCount >= trigger.maxCount) {
            const result = this.transitionTriggerState(trigger, TRIGGER_STATES.COMPLETED);
            if (result) {
                console.log(`[TriggerSpawner] ${trigger.id} max count reached - deactivating`);
            } else {
                console.error(`[TriggerSpawner] Failed to complete trigger ${trigger.id}`);
            }
            return false;
        }

        // Handle interval-based triggers
        if (trigger.interval) {
            const timeSinceLastTrigger = this.lastUpdateTime - (trigger.lastTriggered || trigger.startTime || 0);

            if (timeSinceLastTrigger >= trigger.interval) {
                console.log(`[TriggerSpawner] ${trigger.id} interval condition met (${timeSinceLastTrigger} >= ${trigger.interval})`);
                return true;
            } else {
                console.log(`[TriggerSpawner] ${trigger.id} waiting for interval (${timeSinceLastTrigger} < ${trigger.interval})`);
                return false;
            }
        }

        // Handle single-delay triggers
        else if (trigger.delay) {
            const elapsed = this.lastUpdateTime - trigger.startTime;
            const targetDelay = trigger.delay || 0;

            if (elapsed >= targetDelay) {
                if (trigger.state !== TRIGGER_STATES.TRIGGERED) {
                    console.log(`[TriggerSpawner] ${trigger.id} single delay condition met (${elapsed} >= ${targetDelay})`);
                    return true;
                } else {
                    console.log(`[TriggerSpawner] ${trigger.id} already triggered - not triggering again`);
                    return false;
                }
            } else {
                console.log(`[TriggerSpawner] ${trigger.id} waiting for delay (${elapsed} < ${targetDelay})`);
                return false;
            }
        }

        // Immediate triggers (no delay or interval)
        else {
            console.log(`[TriggerSpawner] ${trigger.id} immediate trigger - ready to execute`);
            return true;
        }
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
    async executeTrigger(trigger, players) {
        console.log(`[TriggerSpawner] Executing trigger: ${trigger.id} (${trigger.type})`);

        // For one-time triggers, mark as triggered immediately
        if (trigger.oneTime) {
            trigger.triggered = true;
            console.log(`[TriggerSpawner] ${trigger.id} marked as one-time triggered`);
        }

        // Transition to TRIGGERED state
        this.transitionTriggerState(trigger, TRIGGER_STATES.TRIGGERED);

        try {
            let spawnedCount = 0;

            switch (trigger.type) {
                case 'wave':
                    spawnedCount = await this.executeWaveTrigger(trigger, players);
                    break;

                default:
                    spawnedCount = await this.spawnEntities(trigger, players);
                    break;
            }

            // Update spawn statistics
            this.performanceStats.totalSpawns++;

            // CRITICAL FIX: Increment spawn count after successful spawning
            trigger.spawnCount += spawnedCount;
            console.log(`[TriggerSpawner] ${trigger.id} spawn count incremented: ${trigger.spawnCount}/${trigger.maxCount || '∞'}`);

            // Determine next state based on trigger configuration
            if (trigger.maxCount && trigger.spawnCount >= trigger.maxCount) {
                // Trigger has reached its maximum spawn count
                this.transitionTriggerState(trigger, TRIGGER_STATES.COMPLETED);
                console.log(`[TriggerSpawner] ${trigger.id} COMPLETED: ${trigger.spawnCount}/${trigger.maxCount} spawns reached`);
            } else if (!trigger.maxCount || trigger.maxCount > 1) {
                // Trigger can spawn multiple times (interval-based or infinite)
                this.transitionTriggerState(trigger, TRIGGER_STATES.ACTIVE);
                console.log(`[TriggerSpawner] ${trigger.id} ready for next spawn: ${trigger.spawnCount}/${trigger.maxCount || '∞'}`);
            } else {
                // Single execution trigger
                this.transitionTriggerState(trigger, TRIGGER_STATES.COMPLETED);
                console.log(`[TriggerSpawner] ${trigger.id} completed single execution`);
            }

        } catch (error) {
            console.error(`[TriggerSpawner] Execution failed for ${trigger.id}:`, error);
            this.performanceStats.failedSpawns++;
            // Return to ACTIVE state on failure to allow retry
            this.transitionTriggerState(trigger, TRIGGER_STATES.ACTIVE);
        }
    }

    /**
     * Execute wave trigger (spawn wave of enemies)
     * @param {Object} trigger - Wave trigger
     * @param {Array} players - Array of players
     */
    async executeWaveTrigger(trigger, players) {
        if (!trigger.waves || trigger.waveIndex >= trigger.waves.length) {
            return 0; // Return 0 spawned entities
        }

        const currentWave = trigger.waves[trigger.waveIndex];
        console.log(`[TriggerSpawner] Executing wave ${trigger.waveIndex + 1}/${trigger.waves.length}`);

        // Spawn wave entities and get count
        const spawnedCount = await this.spawnEntities(currentWave, players);

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

        return spawnedCount;
    }

    /**
     * Spawn entities for a trigger
     * @param {Object} trigger - Trigger configuration
     * @param {Array} players - Array of players
     */
    /**
     * Deep clone entity configuration to prevent object reference sharing
     * @param {Object} config - Entity configuration
     * @returns {Object} Deep cloned configuration
     */
    deepCloneEntityConfig(config) {
        try {
            // Use JSON serialization for deep cloning
            return JSON.parse(JSON.stringify(config));
        } catch (error) {
            console.error(`[TriggerSpawner] Deep clone failed, falling back to shallow copy:`, error);

            // Fallback to shallow copy if JSON fails (e.g., with functions)
            return { ...config };
        }
    }

    async spawnEntities(trigger, players) {
        if (!trigger.entities || !Array.isArray(trigger.entities)) {
            console.warn(`[TriggerSpawner] No entities defined for trigger: ${trigger.id}`);
            return;
        }

        console.log(`[TriggerSpawner] spawnEntities called for trigger ${trigger.id} with entities:`, trigger.entities);

        const spawnedIds = [];

        for (const entityConfig of trigger.entities) {
            // FIX: Use deep cloning to prevent object reference mutation
            const spawnConfig = this.deepCloneEntityConfig(entityConfig);

            // Add debug info for tracking
            spawnConfig._triggerId = trigger.id;
            spawnConfig._spawnTime = Date.now();
            spawnConfig._spawnIndex = spawnedIds.length;

            console.log(`[TriggerSpawner] About to spawn entity with config:`, spawnConfig);
            console.log(`[TriggerSpawner] BEFORE deep clone - spawnConfig.x: ${spawnConfig.x}, spawnConfig.y: ${spawnConfig.y}`);

            try {
                const entityId = await this.levelManager.spawnEntity(spawnConfig);
                spawnedIds.push(entityId);

                console.log(`[TriggerSpawner] Spawned ${spawnConfig.type} #${spawnConfig._spawnIndex + 1} via trigger ${trigger.id} at (${spawnConfig.x}, ${spawnConfig.y}, ${spawnConfig.z})`);
            } catch (error) {
                console.error(`[TriggerSpawner] Failed to spawn entity #${spawnConfig._spawnIndex + 1}:`, spawnConfig, error);
            }
        }

        // Track spawned entities for this trigger
        if (!this.spawnedEntities.has(trigger.id)) {
            this.spawnedEntities.set(trigger.id, []);
        }
        this.spawnedEntities.get(trigger.id).push(...spawnedIds);

        console.log(`[TriggerSpawner] ${trigger.id}: Completed spawn batch (${spawnedIds.length} entities)`);
        return spawnedIds;
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
     * Transition trigger to a new state with appropriate lifecycle handling
     * @param {Object} trigger - Trigger to transition
     * @param {string} newState - Target state
     */
    transitionTriggerState(trigger, newState) {
        // Validate that the new state is a valid state value
        const validStates = Object.values(TRIGGER_STATES);
        if (!validStates.includes(newState)) {
            console.error(`[TriggerSpawner] Invalid state: ${newState} - not found in valid states`);
            console.error(`[TriggerSpawner] Valid states:`, validStates);
            return false;
        }

        // Validate that the current state is a valid state value
        if (!validStates.includes(trigger.state)) {
            console.error(`[TriggerSpawner] Invalid current state: ${trigger.state} - not found in valid states`);
            console.error(`[TriggerSpawner] Valid states:`, validStates);
            return false;
        }

        // Allow all state transitions (no strict validation for now)
        // Future enhancement: Add specific transition rules
        console.log(`[TriggerSpawner] ${trigger.id}: ${trigger.state} → ${newState}`);
        trigger.state = newState;

        // Handle state-specific initialization
        switch (newState) {
            case TRIGGER_STATES.ACTIVE:
                if (!trigger.startTime) {
                    trigger.startTime = this.lastUpdateTime;
                }
                break;

            case TRIGGER_STATES.COMPLETED:
                trigger.active = false;
                this.performanceStats.completedTriggers++;
                console.log(`[TriggerSpawner] ${trigger.id} completed after ${trigger.spawnCount} spawns`);
                break;

            case TRIGGER_STATES.DISABLED:
                trigger.active = false;
                break;
        }

        return true;
    }

    /**
     * Get comprehensive debug information for a specific trigger
     * @param {string} triggerId - Trigger ID
     * @returns {Object|null} Debug information or null if not found
     */
    getTriggerDebugInfo(triggerId) {
        const trigger = Array.from(this.activeTriggers)
            .find(t => t.id === triggerId);

        if (!trigger) {
            console.warn(`[TriggerSpawner] Trigger ${triggerId} not found`);
            return null;
        }

        const currentTime = this.lastUpdateTime;
        const timeSinceLastTrigger = trigger.lastTriggered ? currentTime - trigger.lastTriggered : 0;
        const timeSinceStart = trigger.startTime ? currentTime - trigger.startTime : 0;

        return {
            id: trigger.id,
            type: trigger.type,
            state: trigger.state,
            active: trigger.active,
            triggered: trigger.triggered,
            spawnCount: trigger.spawnCount,
            maxCount: trigger.maxCount,
            startTime: trigger.startTime,
            lastTriggered: trigger.lastTriggered,
            currentTime: currentTime,
            timeSinceLastTrigger: timeSinceLastTrigger,
            timeSinceStart: timeSinceStart,
            cooldownRemaining: trigger.cooldown > 0 ?
                Math.max(0, trigger.cooldown - timeSinceLastTrigger) : 0,
            nextSpawnIn: trigger.interval ?
                Math.max(0, trigger.interval - timeSinceLastTrigger) : null,
            entitiesSpawned: this.spawnedEntities.get(trigger.id) || [],
            completionPercentage: trigger.maxCount ?
                Math.min(100, Math.round((trigger.spawnCount / trigger.maxCount) * 100)) : 0
        };
    }

    /**
     * Log comprehensive system state for debugging
     */
    logTriggerSystemState() {
        console.group('[TriggerSpawner] System State');
        console.log(`Active Triggers: ${this.activeTriggers.size}`);
        console.log(`Spawned Entities: ${this.spawnedEntities.size}`);
        console.log(`Last Update: ${new Date(this.lastUpdateTime).toLocaleTimeString()}`);
        console.log(`Performance Stats:`, this.performanceStats);

        const activeTriggers = Array.from(this.activeTriggers)
            .filter(t => t.active && t.state !== TRIGGER_STATES.COMPLETED);

        console.log(`Active (non-completed) Triggers: ${activeTriggers.length}`);

        activeTriggers.forEach(trigger => {
            const debugInfo = this.getTriggerDebugInfo(trigger.id);
            console.log(`${trigger.id}:`, {
                type: debugInfo.type,
                state: debugInfo.state,
                spawns: `${debugInfo.spawnCount}/${debugInfo.maxCount || '∞'}`,
                nextSpawn: debugInfo.nextSpawnIn !== null ? `${debugInfo.nextSpawnIn}ms` : 'N/A',
                completion: `${debugInfo.completionPercentage}%`
            });
        });

        console.groupEnd();
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
            trigger.spawnCount = 0;
            trigger.state = TRIGGER_STATES.INACTIVE;
            trigger.active = true; // Reactivate triggers on reset
        }

        // Reset performance stats but keep spawned entities for cleanup
        this.performanceStats = {
            totalSpawns: 0,
            failedSpawns: 0,
            activeTriggers: this.activeTriggers.size,
            completedTriggers: 0
        };

        console.log('[TriggerSpawner] Reset all trigger states');
    }

    /**
     * Force reset of all triggers to their initial state
     * This is used when loading a new level to ensure clean state
     */
    forceReset() {
        // Clear all triggers and reset everything
        this.clear();

        // Reset performance stats
        this.performanceStats = {
            totalSpawns: 0,
            failedSpawns: 0,
            activeTriggers: 0,
            completedTriggers: 0
        };

        console.log('[TriggerSpawner] Force reset all trigger states');
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