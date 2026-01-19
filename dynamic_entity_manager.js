/* =========================
   DYNAMIC ENTITY MANAGEMENT SYSTEM
   Performance optimization and dynamic entity lifecycle management
   Handles entity pooling, culling, and memory optimization
   ========================= */

class DynamicEntityManager {
    /**
     * Create a dynamic entity management system
     * @param {Object} gameState - Reference to game state
     * @param {Object} levelManager - Reference to level manager
     */
    constructor(gameState, levelManager) {
        this.gameState = gameState;
        this.levelManager = levelManager;

        // Entity pools for reuse
        this.entityPools = new Map();
        this.maxPoolSize = 50; // Maximum entities per pool type

        // Performance monitoring
        this.performanceStats = {
            activeEntities: 0,
            pooledEntities: 0,
            culledEntities: 0,
            lastCleanup: Date.now()
        };

        // Culling settings
        this.cullingEnabled = true;
        this.cullDistance = 1500; // Pixels outside viewport to cull
        this.cullCheckInterval = 5000; // Check every 5 seconds

        console.log('[DynamicEntityManager] Initialized');
    }

    // =========================
    // ENTITY POOLING SYSTEM
    // =========================

    /**
     * Get an entity from the pool or create a new one
     * @param {string} entityType - Type of entity to get
     * @param {Object} config - Entity configuration
     */
    getPooledEntity(entityType, config = {}) {
        const pool = this.getEntityPool(entityType);

        // Try to get from pool first
        if (pool.length > 0) {
            const entity = pool.pop();
            this.resetEntityForReuse(entity, config);
            this.performanceStats.pooledEntities--;
            console.log(`[EntityPool] Reused ${entityType} from pool`);
            return entity;
        }

        // Create new entity if pool is empty
        return this.createNewEntity(entityType, config);
    }

    /**
     * Return an entity to the pool for reuse
     * @param {Object} entity - Entity to pool
     */
    returnToPool(entity) {
        if (!entity || !entity.entityType) return;

        const pool = this.getEntityPool(entity.entityType);

        // Only pool if pool isn't full
        if (pool.length < this.maxPoolSize) {
            // Reset entity to clean state
            this.prepareEntityForPooling(entity);
            pool.push(entity);
            this.performanceStats.pooledEntities++;
            console.log(`[EntityPool] Returned ${entity.entityType} to pool (pool size: ${pool.length})`);
        } else {
            // Pool is full, let garbage collector handle it
            console.log(`[EntityPool] Pool full for ${entity.entityType}, discarding entity`);
        }
    }

    /**
     * Get or create an entity pool
     * @param {string} entityType - Type of entity pool
     */
    getEntityPool(entityType) {
        if (!this.entityPools.has(entityType)) {
            this.entityPools.set(entityType, []);
        }
        return this.entityPools.get(entityType);
    }

    /**
     * Create a new entity (fallback when pooling isn't available)
     * @param {string} entityType - Type of entity
     * @param {Object} config - Entity configuration
     */
    createNewEntity(entityType, config) {
        // This would normally delegate to the appropriate entity factory
        console.log(`[EntityPool] Creating new ${entityType} (not from pool)`);

        // For now, delegate to level manager's spawn method
        if (this.levelManager && this.levelManager.spawnEntity) {
            return this.levelManager.spawnEntity({ ...config, type: entityType });
        }

        return null;
    }

    /**
     * Reset an entity for reuse from the pool
     * @param {Object} entity - Entity to reset
     * @param {Object} newConfig - New configuration
     */
    resetEntityForReuse(entity, newConfig) {
        // Reset core properties
        entity.x = newConfig.x || 0;
        entity.y = newConfig.y || 0;
        entity.z = newConfig.z || 0;
        entity.health = newConfig.health || entity.maxHealth || 100;
        entity.visible = true;
        entity.isDying = false;
        entity.hit = false;
        entity.damageDealt = false;

        // Reset animation state
        if (entity.animation) {
            entity.animation.forceAnimation = false;
            entity.animation.currentAnimation = 'idle';
        }

        // Reset FSM state
        if (entity.stateMachine) {
            entity.stateMachine.changeState('idle');
        }

        // Apply new configuration
        Object.assign(entity, newConfig);

        console.log(`[EntityPool] Reset ${entity.entityType} for reuse`);
    }

    /**
     * Prepare entity for pooling (cleanup references)
     * @param {Object} entity - Entity to prepare
     */
    prepareEntityForPooling(entity) {
        // Clear references that might cause memory leaks
        entity.target = null;
        entity.followTarget = null;
        entity.btMemory = null;

        // Mark as not visible
        entity.visible = false;

        // Clear any timers or callbacks
        if (entity.deathTimer) {
            clearTimeout(entity.deathTimer);
            entity.deathTimer = null;
        }
    }

    // =========================
    // DISTANCE CULLING SYSTEM
    // =========================

    /**
     * Update culling for all entities
     * @param {Array} players - Array of player entities
     */
    updateCulling(players) {
        if (!this.cullingEnabled) return;

        const now = Date.now();
        if (now - this.performanceStats.lastCleanup < this.cullCheckInterval) {
            return; // Not time to check yet
        }

        this.performanceStats.lastCleanup = now;

        const allEntities = this.gameState.getAllEntities();
        let culledCount = 0;

        for (const entity of allEntities) {
            if (this.shouldCullEntity(entity, players)) {
                this.cullEntity(entity);
                culledCount++;
            }
        }

        if (culledCount > 0) {
            console.log(`[Culling] Culled ${culledCount} entities`);
            this.performanceStats.culledEntities += culledCount;
        }
    }

    /**
     * Check if an entity should be culled
     * @param {Object} entity - Entity to check
     * @param {Array} players - Array of players
     */
    shouldCullEntity(entity, players) {
        // Don't cull players or essential entities
        if (entity.entityType === 'player' || entity.essential) {
            return false;
        }

        // Don't cull entities that are currently in combat
        if (entity.stateMachine && entity.stateMachine.isInAttackState()) {
            return false;
        }

        // Check distance from all players
        for (const player of players) {
            const distance = Math.sqrt(
                Math.pow(entity.x - player.x, 2) +
                Math.pow(entity.y - player.y, 2)
            );

            if (distance <= this.cullDistance) {
                return false; // At least one player is close enough
            }
        }

        return true; // All players are too far away
    }

    /**
     * Cull an entity (disable or pool it)
     * @param {Object} entity - Entity to cull
     */
    cullEntity(entity) {
        // Option 1: Return to pool if pooling is enabled
        if (this.entityPools.has(entity.entityType)) {
            this.returnToPool(entity);
            this.gameState.removeEntity(this.gameState.getEntityId(entity));
            return;
        }

        // Option 2: Just disable the entity
        entity.visible = false;
        entity.active = false;

        // Stop AI updates
        entity.aiDisabled = true;

        console.log(`[Culling] Disabled ${entity.entityType} at (${entity.x.toFixed(1)}, ${entity.y.toFixed(1)})`);
    }

    /**
     * Restore culled entities when players get close
     * @param {Array} players - Array of players
     */
    restoreCulledEntities(players) {
        // This would check pooled entities and respawn them when players get close
        // For now, this is a placeholder for future implementation
    }

    // =========================
    // PERFORMANCE MONITORING
    // =========================

    /**
     * Update performance statistics
     */
    updatePerformanceStats() {
        const allEntities = this.gameState.getAllEntities();
        this.performanceStats.activeEntities = allEntities.length;

        // Calculate pool sizes
        let totalPooled = 0;
        for (const pool of this.entityPools.values()) {
            totalPooled += pool.length;
        }
        this.performanceStats.pooledEntities = totalPooled;
    }

    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        this.updatePerformanceStats();
        return { ...this.performanceStats };
    }

    /**
     * Log performance information
     */
    logPerformanceInfo() {
        const stats = this.getPerformanceStats();
        console.log('[Performance] Entity Stats:', {
            active: stats.activeEntities,
            pooled: stats.pooledEntities,
            culled: stats.culledEntities,
            total: stats.activeEntities + stats.pooledEntities
        });

        // Log pool details
        console.log('[Performance] Entity Pools:');
        for (const [type, pool] of this.entityPools) {
            console.log(`  ${type}: ${pool.length}/${this.maxPoolSize}`);
        }
    }

    // =========================
    // MEMORY MANAGEMENT
    // =========================

    /**
     * Perform garbage collection and cleanup
     */
    performCleanup() {
        const now = Date.now();

        // Clean up old pooled entities (keep only recent ones)
        for (const [type, pool] of this.entityPools) {
            if (pool.length > this.maxPoolSize / 2) {
                // Keep only the most recently used entities
                pool.splice(0, pool.length - this.maxPoolSize / 2);
                console.log(`[Cleanup] Reduced ${type} pool to ${pool.length} entities`);
            }
        }

        // Reset culling stats
        this.performanceStats.culledEntities = 0;

        console.log(`[Cleanup] Performed entity cleanup at ${new Date(now).toLocaleTimeString()}`);
    }

    // =========================
    // CONFIGURATION
    // =========================

    /**
     * Configure culling settings
     * @param {Object} settings - Culling configuration
     */
    configureCulling(settings) {
        if (settings.enabled !== undefined) {
            this.cullingEnabled = settings.enabled;
        }
        if (settings.distance !== undefined) {
            this.cullDistance = settings.distance;
        }
        if (settings.interval !== undefined) {
            this.cullCheckInterval = settings.interval;
        }

        console.log('[DynamicEntityManager] Culling configured:', {
            enabled: this.cullingEnabled,
            distance: this.cullDistance,
            interval: this.cullCheckInterval
        });
    }

    /**
     * Configure pooling settings
     * @param {Object} settings - Pooling configuration
     */
    configurePooling(settings) {
        if (settings.maxPoolSize !== undefined) {
            this.maxPoolSize = settings.maxPoolSize;
        }

        console.log('[DynamicEntityManager] Pooling configured:', {
            maxPoolSize: this.maxPoolSize
        });
    }

    // =========================
    // INTEGRATION METHODS
    // =========================

    /**
     * Update method called every frame
     * @param {Array} players - Array of players
     * @param {number} dt - Delta time
     */
    update(players, dt) {
        // Update culling
        this.updateCulling(players);

        // Periodic cleanup
        if (Math.random() < 0.001) { // 0.1% chance per frame (~ every 1000 frames)
            this.performCleanup();
        }
    }

    /**
     * Handle level transition cleanup
     */
    onLevelTransition() {
        // Return eligible entities to pools
        const allEntities = this.gameState.getAllEntities();

        for (const entity of allEntities) {
            if (entity.entityType === 'enemy' && !entity.isDying && entity.health > 0) {
                // Healthy enemies can be pooled for reuse
                this.returnToPool(entity);
            }
        }

        console.log('[DynamicEntityManager] Performed level transition cleanup');
    }

    /**
     * Reset manager state
     */
    reset() {
        // Clear all pools
        this.entityPools.clear();

        // Reset stats
        this.performanceStats = {
            activeEntities: 0,
            pooledEntities: 0,
            culledEntities: 0,
            lastCleanup: Date.now()
        };

        console.log('[DynamicEntityManager] Reset to initial state');
    }
}

// =========================
// PERFORMANCE MONITORING UTILITIES
// =========================

/**
 * Simple performance monitor for entity counts
 */
class EntityPerformanceMonitor {
    constructor() {
        this.samples = [];
        this.maxSamples = 60; // 60 samples = 1 second at 60 FPS
    }

    /**
     * Record a performance sample
     * @param {Object} stats - Performance stats
     */
    recordSample(stats) {
        this.samples.push({
            timestamp: Date.now(),
            ...stats
        });

        // Keep only recent samples
        if (this.samples.length > this.maxSamples) {
            this.samples.shift();
        }
    }

    /**
     * Get average performance over recent samples
     */
    getAverageStats() {
        if (this.samples.length === 0) return null;

        const totals = this.samples.reduce((acc, sample) => ({
            activeEntities: acc.activeEntities + sample.activeEntities,
            pooledEntities: acc.pooledEntities + sample.pooledEntities,
            culledEntities: acc.culledEntities + sample.culledEntities
        }), { activeEntities: 0, pooledEntities: 0, culledEntities: 0 });

        return {
            activeEntities: Math.round(totals.activeEntities / this.samples.length),
            pooledEntities: Math.round(totals.pooledEntities / this.samples.length),
            culledEntities: Math.round(totals.culledEntities / this.samples.length)
        };
    }

    /**
     * Check if performance is degrading
     */
    isPerformanceDegrading() {
        if (this.samples.length < 10) return false;

        const recent = this.samples.slice(-10);
        const older = this.samples.slice(-20, -10);

        const recentAvg = recent.reduce((sum, s) => sum + s.activeEntities, 0) / recent.length;
        const olderAvg = older.reduce((sum, s) => sum + s.activeEntities, 0) / older.length;

        // If active entities increased by more than 50%, might be degrading
        return (recentAvg - olderAvg) / olderAvg > 0.5;
    }
}

// =========================
// GLOBAL EXPORTS
// =========================

window.DynamicEntityManager = DynamicEntityManager;
window.EntityPerformanceMonitor = EntityPerformanceMonitor;
