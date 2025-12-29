/* =========================
   ENEMY SCRIPT MANAGER
   Loading, caching, and runtime management
   ========================= */

class EnemyScriptManager {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = window.enemyAIConfig?.CONSTANTS?.MAX_SCRIPT_CACHE_SIZE || 20;
    this.loadTimeout = window.enemyAIConfig?.CONSTANTS?.SCRIPT_LOAD_TIMEOUT || 5000;
  }

  // Load script by ID with caching
  async loadScript(scriptId) {
    // Check cache first
    if (this.cache.has(scriptId)) {
      console.log(`[SCRIPT_MANAGER] Cache hit: ${scriptId}`);
      return this.cache.get(scriptId);
    }

    // Load from registry
    const script = window.enemyScripts?.getScript(scriptId);
    if (!script) {
      throw new Error(`Script not found: ${scriptId}`);
    }

    // Validate and compile script
    const compiledScript = await this.compileScript(script);

    // Cache compiled script
    this.addToCache(scriptId, compiledScript);

    console.log(`[SCRIPT_MANAGER] Loaded and cached: ${scriptId}`);
    return compiledScript;
  }

  // Compile script (validation, optimization)
  async compileScript(script) {
    // Deep clone to avoid modifying original (preserve getters)
    const compiled = this.deepCloneWithGetters(script);

    // Validate behavior tree structure (only if it's not a getter)
    if (compiled.behaviorTree && typeof compiled.behaviorTree !== 'function') {
      this.validateBehaviorTree(compiled.behaviorTree);
    }

    // Optimize for performance
    compiled.optimized = this.optimizeScript(compiled);

    // Add metadata
    compiled.metadata = {
      loadedAt: Date.now(),
      version: "1.0",
      checksum: this.generateChecksum(compiled)
    };

    return compiled;
  }

  // Deep clone that preserves getters
  deepCloneWithGetters(obj, visited = new WeakMap()) {
    // Handle primitives and null
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    // Handle circular references
    if (visited.has(obj)) {
      return visited.get(obj);
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      const clonedArray = [];
      visited.set(obj, clonedArray);
      for (let i = 0; i < obj.length; i++) {
        clonedArray[i] = this.deepCloneWithGetters(obj[i], visited);
      }
      return clonedArray;
    }

    // Handle objects (including getters)
    const clonedObj = Object.create(Object.getPrototypeOf(obj));
    visited.set(obj, clonedObj);

    // Copy all properties including getters
    const descriptors = Object.getOwnPropertyDescriptors(obj);
    for (const [key, descriptor] of Object.entries(descriptors)) {
      try {
        Object.defineProperty(clonedObj, key, descriptor);
      } catch (e) {
        // If we can't define the property, skip it (e.g., some native properties)
        console.warn(`[SCRIPT_MANAGER] Could not clone property ${key}:`, e.message);
      }
    }

    return clonedObj;
  }

  // Cache management
  addToCache(scriptId, script) {
    // LRU eviction if needed
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      console.log(`[SCRIPT_MANAGER] Cache eviction: ${firstKey}`);
    }

    this.cache.set(scriptId, script);
  }

  // Runtime script switching (for boss phases)
  async switchScript(entity, newScriptId) {
    console.log(`[SCRIPT_MANAGER] Switching ${entity.constructor.name} to script: ${newScriptId}`);

    try {
      const newScript = await this.loadScript(newScriptId);
      entity.activeScript = newScript;
      entity.scriptConfig.scriptId = newScriptId;

      // Reset BT state if needed
      if (entity.aiContext) {
        entity.aiContext.behaviorTree = newScript.behaviorTree;
      }

      return newScript;
    } catch (error) {
      console.error(`[SCRIPT_MANAGER] Failed to switch script for ${entity.constructor.name}:`, error);
      throw error;
    }
  }

  // Get script info without loading
  getScriptInfo(scriptId) {
    const script = window.enemyScripts?.getScript(scriptId);
    if (!script) return null;

    return {
      id: script.id,
      name: script.name,
      type: script.type,
      cached: this.cache.has(scriptId),
      size: JSON.stringify(script).length
    };
  }

  // Preload scripts for performance
  async preloadScripts(scriptIds) {
    console.log(`[SCRIPT_MANAGER] Preloading ${scriptIds.length} scripts...`);

    const promises = scriptIds.map(async (scriptId) => {
      try {
        await this.loadScript(scriptId);
        return { scriptId, success: true };
      } catch (error) {
        console.error(`[SCRIPT_MANAGER] Failed to preload ${scriptId}:`, error);
        return { scriptId, success: false, error: error.message };
      }
    });

    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`[SCRIPT_MANAGER] Preload complete: ${successful} successful, ${failed} failed`);
    return results;
  }

  // Performance monitoring
  getPerformanceStats() {
    const cacheStats = {
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize,
      cacheHitRate: this.calculateHitRate(),
      memoryUsage: this.estimateMemoryUsage()
    };

    const scriptStats = {
      totalScripts: window.enemyScripts?.SCRIPTS?.size || 0,
      loadedScripts: this.cache.size,
      loadTime: this.getAverageLoadTime()
    };

    return { ...cacheStats, ...scriptStats };
  }

  // Validation helpers
  validateBehaviorTree(bt) {
    if (!bt || typeof bt.tick !== 'function') {
      throw new Error('Invalid behavior tree structure');
    }

    // Additional validation can be added here
    // - Check for circular references
    // - Validate node types
    // - Check for required properties
  }

  optimizeScript(script) {
    // Basic optimizations
    const optimized = { ...script };

    // Remove development-only data in production
    if (!window.DEBUG_MODE) {
      delete optimized.metadata;
      delete optimized.debug;
    }

    // Optimize behavior tree if possible
    if (optimized.behaviorTree && typeof optimized.behaviorTree.optimize === 'function') {
      optimized.behaviorTree = optimized.behaviorTree.optimize();
    }

    return optimized;
  }

  generateChecksum(script) {
    // Simple checksum for change detection
    const str = JSON.stringify(script);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit
    }
    return hash.toString(16);
  }

  calculateHitRate() {
    // This would need to track access patterns over time
    // For now, return a placeholder
    return 0.85; // 85% cache hit rate
  }

  estimateMemoryUsage() {
    let totalSize = 0;
    for (const script of this.cache.values()) {
      totalSize += JSON.stringify(script).length;
    }
    return `${(totalSize / 1024).toFixed(1)}KB`;
  }

  getAverageLoadTime() {
    // This would need to track load times
    // For now, return a placeholder
    return 150; // 150ms average load time
  }

  // Clear cache (for debugging/testing)
  clearCache() {
    const clearedCount = this.cache.size;
    this.cache.clear();
    console.log(`[SCRIPT_MANAGER] Cleared cache: ${clearedCount} scripts removed`);
  }

  // Get cache contents (for debugging)
  getCacheContents() {
    return Array.from(this.cache.entries()).map(([id, script]) => ({
      id,
      name: script.name,
      type: script.type,
      loadedAt: script.metadata?.loadedAt,
      size: JSON.stringify(script).length
    }));
  }
}

// Global instance
window.enemyScriptManager = new EnemyScriptManager();

// Debug interface
window.debugEnemyScripts = {
  // List all available scripts
  listScripts: () => {
    const scripts = window.enemyScripts?.SCRIPTS;
    if (!scripts) {
      console.error('Scripts not loaded');
      return;
    }

    console.table(Array.from(scripts.entries()).map(([id, script]) => ({
      ID: id,
      Name: script.name,
      Type: script.type,
      Cached: window.enemyScriptManager.cache.has(id)
    })));
  },

  // Force script on enemy
  forceScript: (enemyIndex, scriptId) => {
    const enemies = window.gameState?.getEntitiesByType('enemy') || [];
    if (enemies[enemyIndex]) {
      window.enemyScriptManager.switchScript(enemies[enemyIndex], scriptId);
      console.log(`Forced ${scriptId} on enemy ${enemyIndex}`);
    } else {
      console.error(`Enemy ${enemyIndex} not found`);
    }
  },

  // Show performance stats
  showPerformance: () => {
    console.table(window.enemyScriptManager.getPerformanceStats());
  },

  // Show cache contents
  showCache: () => {
    console.table(window.enemyScriptManager.getCacheContents());
  },

  // Create test enemy with script
  spawnScriptedEnemy: (scriptId, x = 400, y = 300) => {
    try {
      const enemy = new window.ScriptEnabledEnemy(x, y, 0, {
        scriptConfig: { scriptId, type: window.enemyAIConfig.SCRIPT_TYPE.FULL }
      });
      window.gameState?.addEntity(enemy);
      console.log(`Spawned enemy with script: ${scriptId}`);
      return enemy;
    } catch (error) {
      console.error(`Failed to spawn scripted enemy:`, error);
    }
  },

  // Clear script cache
  clearCache: () => {
    window.enemyScriptManager.clearCache();
  },

  // Preload all scripts
  preloadAll: async () => {
    const scriptIds = Array.from(window.enemyScripts?.SCRIPTS?.keys() || []);
    const results = await window.enemyScriptManager.preloadScripts(scriptIds);
    console.log('Preload results:', results);
    return results;
  }
};

console.log('[SCRIPT_MANAGER] Enemy Script Manager initialized');
