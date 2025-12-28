# 🎮 Enemy AI Script System - Technical Specification

## 📋 Document Overview

This comprehensive document outlines the design and implementation approach for an advanced Enemy AI Script System that extends the existing rarity/intelligence-based behavior system. The system provides three levels of behavioral customization while maintaining full backwards compatibility.

**Document Version:** 1.1
**Status:** Implementation Complete (Phase 1-4)
**Estimated Implementation Time:** 2-3 weeks
**Actual Implementation Time:** 1 week
**Priority:** High (Boss mechanics, complex behaviors)

**Last Updated:** December 29, 2025
**Implementation Progress:** Phase 1-4 Complete ✅

---

## 🏗️ System Architecture

### **Core Philosophy**
- **Dual System**: Maintain existing rarity/intelligence system as base + optional script overrides
- **Backwards Compatible**: All existing enemies continue working without changes
- **Modular Design**: Scripts are independent, reusable components
- **Performance Focused**: Lazy loading, caching, and efficient execution

### **System Components**

```
📁 Behavior Tree/
├── 📄 enemy_ai_config.js           # Script types, validation, constants
├── 📄 enemy_scripts.js             # Script definitions & registry (NEW)
├── 📄 enemy_script_manager.js      # Loading, caching, management (NEW)
├── 📄 enemyAI_BT.js                # Script-enabled BT nodes & integration
├── 📄 enemy_ai_utils.js            # Extended utility functions
└── 📄 base_enemy.js                # Script assignment & execution
```

---

## 🎯 Script Types & Override Levels

### **1. FULL Script** 🔴
**Override Level**: Complete (100%)
**Use Case**: Boss enemies with entirely custom behavior patterns
**Behavior**: Completely ignores rarity/intelligence system

```javascript
// Example: Mega Boss Phase 1
const megaBossPhase1Script = {
  id: "mega_boss_phase1",
  type: SCRIPT_TYPE.FULL,
  name: "Mega Boss - Awakening Phase",

  // Custom behaviors (override all defaults)
  behaviors: {
    idle: { duration: 1.5, animation: "boss_idle_roar" },
    attack: {
      pattern: "circular_charge",
      damage: 45,
      speed: 350,
      range: 250,
      cooldown: 3000
    },
    special: {
      name: "ground_slam",
      damage: 30,
      radius: 180,
      cooldown: 8000,
      effect: "screen_shake"
    }
  },

  // Custom behavior tree (complete override)
  behaviorTree: new Selector([
    // Priority 1: Emergency evasion
    new Sequence([
      new Condition(ctx => ctx.self.hpPercent < 0.2), // Low HP
      new Action(() => ({ type: COMMAND.EVADE, priority: "emergency" }))
    ]),

    // Priority 2: Special attack when available
    createSpecialAttackSubTree(),

    // Priority 3: Combat behaviors
    new Sequence([
      hasTarget,
      targetInAttackRange,
      attackAction
    ]),
    new Sequence([
      hasTarget,
      targetInChaseRange,
      chaseAction
    ]),

    // Priority 4: Custom patrol pattern
    new Action(() => ({
      type: COMMAND.PATROL,
      pattern: "figure_eight",
      radius: 300
    }))
  ])
};
```

**Usage:**
```javascript
// Boss enemy definition
const megaBoss = new BaseEnemy(x, y, z, {
  rarity: 'boss',
  intelligence: 'advanced',
  scriptConfig: {
    scriptId: 'mega_boss_phase1',
    type: SCRIPT_TYPE.FULL
  }
});
```

### **2. PARTIAL Script** 🟡
**Override Level**: Selective (30-70%)
**Use Case**: Standard enemies with modified specific behaviors
**Behavior**: Replaces only specified behaviors, keeps others from base system

```javascript
// Example: Elite Knight with custom attack
const eliteKnightScript = {
  id: "elite_knight_charge",
  type: SCRIPT_TYPE.PARTIAL,
  name: "Elite Knight - Charge Attack",

  // Only override specific behaviors
  overrides: ["attack", "chase"],

  behaviors: {
    // Custom attack pattern
    attack: {
      sequence: [
        { phase: "windup", duration: 800, animation: "charge_windup" },
        { phase: "charge", speed: 400, distance: 200, damage: 35 },
        { phase: "recovery", duration: 1200, vulnerable: true }
      ],
      cooldown: 5000
    },

    // Modified chase behavior
    chase: {
      speed: 180,  // Faster than base
      pattern: "predictive", // Predict player movement
      abortDistance: 400 // Stop chasing if too far
    }
  }
};
```

**Usage:**
```javascript
// Partially scripted enemy
const eliteKnight = new BaseEnemy(x, y, z, {
  rarity: 'elite',
  intelligence: 'normal',
  scriptConfig: {
    scriptId: 'elite_knight_charge',
    type: SCRIPT_TYPE.PARTIAL
  }
  // Will use custom attack/chase, but base idle/special behaviors
});
```

### **3. BONUS Script** 🟢
**Override Level**: Extension (10-30%)
**Use Case**: Adding special abilities to existing enemies
**Behavior**: Adds new behaviors without modifying existing ones

```javascript
// Example: Teleporting Assassin
const teleportAssassinScript = {
  id: "teleport_assassin",
  type: SCRIPT_TYPE.BONUS,
  name: "Assassin - Teleport Ability",

  behaviors: {
    teleport: {
      range: 300,
      cooldown: 6000,
      animation: "teleport_flash",
      sound: "teleport_whoosh"
    },

    shadowStep: {
      range: 150,
      cooldown: 2000,
      invisibleDuration: 800
    }
  },

  // Bonus behaviors added to base BT
  bonusBehaviorTree: new Selector([
    // Teleport when surrounded
    new Sequence([
      new Condition(ctx => getNearbyEnemies(ctx.self, 100).length >= 3),
      new Cooldown(
        new Action(() => ({ type: "teleport", awayFrom: "enemies" })),
        6000
      )
    ]),

    // Shadow step for positioning
    new Sequence([
      new Condition(ctx => ctx.target && getDistanceToTarget(ctx) > 200),
      new Cooldown(
        new Action(() => ({ type: "shadowStep", toward: "target" })),
        2000
      )
    ])
  ])
};
```

**Usage:**
```javascript
// Enemy with bonus abilities
const teleportAssassin = new BaseEnemy(x, y, z, {
  rarity: 'elite',
  intelligence: 'advanced',
  scriptConfig: {
    scriptId: 'teleport_assassin',
    type: SCRIPT_TYPE.BONUS
  }
  // Gets all base behaviors + teleport + shadowStep
});
```

---

## 📁 File Structure & Implementation

### **enemy_ai_config.js - Extensions**

```javascript
// Add to existing file
const SCRIPT_TYPE = {
  FULL: 'full',
  PARTIAL: 'partial',
  BONUS: 'bonus'
};

const SCRIPT_CONSTANTS = {
  MAX_SCRIPT_CACHE_SIZE: 20,
  SCRIPT_LOAD_TIMEOUT: 5000,
  MAX_SCRIPT_SIZE: 102400, // 100KB limit
  VALIDATION_STRICT_MODE: true
};

// Script validation functions
function validateScriptType(type) {
  return Object.values(SCRIPT_TYPE).includes(type);
}

function validateScriptStructure(script) {
  const required = ['id', 'type', 'name'];
  for (const field of required) {
    if (!script.hasOwnProperty(field)) {
      throw new Error(`Script missing required field: ${field}`);
    }
  }

  // Type-specific validation
  switch(script.type) {
    case SCRIPT_TYPE.FULL:
      if (!script.behaviorTree) {
        throw new Error('FULL scripts must have behaviorTree');
      }
      break;
    case SCRIPT_TYPE.PARTIAL:
      if (!script.overrides || !Array.isArray(script.overrides)) {
        throw new Error('PARTIAL scripts must have overrides array');
      }
      break;
    case SCRIPT_TYPE.BONUS:
      if (!script.bonusBehaviorTree) {
        throw new Error('BONUS scripts must have bonusBehaviorTree');
      }
      break;
  }

  return true;
}

// Export extensions
window.enemyAIConfig.SCRIPT_TYPE = SCRIPT_TYPE;
window.enemyAIConfig.SCRIPT_CONSTANTS = SCRIPT_CONSTANTS;
window.enemyAIConfig.validateScriptType = validateScriptType;
window.enemyAIConfig.validateScriptStructure = validateScriptStructure;
```

### **enemy_scripts.js - NEW FILE**

```javascript
/* =========================
   ENEMY SCRIPT DEFINITIONS
   All enemy behavior scripts and templates
   ========================= */

// Import required modules
// (Will be available globally)

// Script Registry
const ENEMY_SCRIPTS = new Map();

// Boss Script Templates
const BOSS_SCRIPTS = {
  // Phase-based boss scripts
  megaBoss: {
    phase1: {
      id: "mega_boss_phase1",
      type: SCRIPT_TYPE.FULL,
      name: "Mega Boss - Phase 1",
      behaviors: { /* ... */ },
      behaviorTree: createMegaBossPhase1BT()
    },

    phase2: {
      id: "mega_boss_phase2",
      type: SCRIPT_TYPE.FULL,
      name: "Mega Boss - Phase 2",
      behaviors: { /* ... */ },
      behaviorTree: createMegaBossPhase2BT()
    }
  },

  // Single-phase complex boss
  dragonBoss: {
    id: "dragon_boss",
    type: SCRIPT_TYPE.FULL,
    name: "Ancient Dragon",
    behaviors: {
      flight: { speed: 200, altitude: 150 },
      fireball: { damage: 40, speed: 300, arc: 45 },
      tailWhip: { damage: 35, range: 180, knockback: 200 }
    },
    behaviorTree: createDragonBossBT()
  }
};

// Elite Enemy Scripts
const ELITE_SCRIPTS = {
  chargingKnight: {
    id: "charging_knight",
    type: SCRIPT_TYPE.PARTIAL,
    name: "Charging Knight",
    overrides: ["attack", "chase"],
    behaviors: { /* charge attack pattern */ }
  },

  teleportAssassin: {
    id: "teleport_assassin",
    type: SCRIPT_TYPE.BONUS,
    name: "Teleport Assassin",
    behaviors: { /* teleport abilities */ },
    bonusBehaviorTree: createTeleportAssassinBT()
  }
};

// Mini-boss Scripts
const MINI_BOSS_SCRIPTS = {
  flameElemental: {
    id: "flame_elemental",
    type: SCRIPT_TYPE.FULL,
    name: "Flame Elemental",
    behaviors: {
      fireBreath: { damage: 25, duration: 2000, range: 150 },
      immolation: { damage: 15, radius: 100, duration: 5000 }
    },
    behaviorTree: createFlameElementalBT()
  }
};

// Utility Scripts (reusable components)
const UTILITY_SCRIPTS = {
  patrolPatterns: {
    figureEight: { /* 8-shaped patrol */ },
    spiral: { /* spiral patrol */ },
    randomWaypoint: { /* random navigation */ }
  },

  attackPatterns: {
    multiStage: { /* windup -> attack -> recovery */ },
    combo: { /* rapid multi-hit */ },
    charged: { /* charge-up super attack */ }
  }
};

// Script Registration
function registerScript(script) {
  try {
    validateScriptStructure(script);
    ENEMY_SCRIPTS.set(script.id, script);
    console.log(`[SCRIPT_REGISTRY] Registered: ${script.name} (${script.id})`);
  } catch (error) {
    console.error(`[SCRIPT_REGISTRY] Failed to register ${script.id}:`, error);
  }
}

// Auto-register all scripts
function initializeScriptRegistry() {
  console.log('[SCRIPT_REGISTRY] Initializing...');

  // Register boss scripts
  Object.values(BOSS_SCRIPTS).forEach(phaseScripts => {
    if (Array.isArray(phaseScripts)) {
      phaseScripts.forEach(registerScript);
    } else {
      registerScript(phaseScripts);
    }
  });

  // Register elite scripts
  Object.values(ELITE_SCRIPTS).forEach(registerScript);

  // Register mini-boss scripts
  Object.values(MINI_BOSS_SCRIPTS).forEach(registerScript);

  console.log(`[SCRIPT_REGISTRY] Complete. ${ENEMY_SCRIPTS.size} scripts registered.`);
}

// Global Exports
window.enemyScripts = {
  SCRIPTS: ENEMY_SCRIPTS,
  BOSS_SCRIPTS,
  ELITE_SCRIPTS,
  MINI_BOSS_SCRIPTS,
  UTILITY_SCRIPTS,

  registerScript,
  initializeScriptRegistry,

  // Helper functions
  getScript: (id) => ENEMY_SCRIPTS.get(id),
  hasScript: (id) => ENEMY_SCRIPTS.has(id),
  listScripts: () => Array.from(ENEMY_SCRIPTS.keys())
};

// Auto-initialize when loaded
initializeScriptRegistry();
```

### **enemy_script_manager.js - NEW FILE**

```javascript
/* =========================
   ENEMY SCRIPT MANAGER
   Loading, caching, and runtime management
   ========================= */

class EnemyScriptManager {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = SCRIPT_CONSTANTS.MAX_SCRIPT_CACHE_SIZE;
    this.loadTimeout = SCRIPT_CONSTANTS.SCRIPT_LOAD_TIMEOUT;
  }

  // Load script by ID with caching
  async loadScript(scriptId) {
    // Check cache first
    if (this.cache.has(scriptId)) {
      console.log(`[SCRIPT_MANAGER] Cache hit: ${scriptId}`);
      return this.cache.get(scriptId);
    }

    // Load from registry
    const script = window.enemyScripts.getScript(scriptId);
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
    // Deep clone to avoid modifying original
    const compiled = JSON.parse(JSON.stringify(script));

    // Validate behavior tree
    if (compiled.behaviorTree) {
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
  switchScript(entity, newScriptId) {
    console.log(`[SCRIPT_MANAGER] Switching ${entity.constructor.name} to script: ${newScriptId}`);

    return this.loadScript(newScriptId).then(script => {
      entity.activeScript = script;
      entity.scriptConfig.scriptId = newScriptId;

      // Reset BT state if needed
      if (entity.aiContext) {
        entity.aiContext.behaviorTree = script.behaviorTree;
      }

      return script;
    });
  }

  // Performance monitoring
  getPerformanceStats() {
    return {
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize,
      cacheHitRate: this.calculateHitRate(),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  // Validation helpers
  validateBehaviorTree(bt) {
    // Basic structure validation
    if (!bt || typeof bt.tick !== 'function') {
      throw new Error('Invalid behavior tree structure');
    }
  }

  optimizeScript(script) {
    // Basic optimizations (can be expanded)
    const optimized = { ...script };

    // Remove development-only data in production
    if (!window.DEBUG_MODE) {
      delete optimized.metadata;
      delete optimized.debug;
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
    // Would need to track access patterns
    return 0.85; // Placeholder
  }

  estimateMemoryUsage() {
    let totalSize = 0;
    for (const script of this.cache.values()) {
      totalSize += JSON.stringify(script).length;
    }
    return `${(totalSize / 1024).toFixed(1)}KB`;
  }
}

// Global instance
window.enemyScriptManager = new EnemyScriptManager();

// Debug interface
window.debugEnemyScripts = {
  listLoaded: () => Array.from(window.enemyScriptManager.cache.keys()),
  getStats: () => window.enemyScriptManager.getPerformanceStats(),
  clearCache: () => {
    window.enemyScriptManager.cache.clear();
    console.log('Script cache cleared');
  },
  forceScript: (enemyId, scriptId) => {
    const enemy = findEnemyById(enemyId);
    if (enemy) {
      window.enemyScriptManager.switchScript(enemy, scriptId);
    }
  }
};
```

### **enemyAI_BT.js - Extensions**

```javascript
// Add to existing file

/* =========================
   SCRIPT-AWARE BT NODES
   ========================= */

// Script execution node
class ScriptNode extends BTNode {
  constructor(scriptAction) {
    super();
    this.scriptAction = scriptAction; // Function that returns command
  }

  tick(ctx) {
    try {
      return this.scriptAction(ctx);
    } catch (error) {
      console.error('[SCRIPT_NODE] Error executing script action:', error);
      return BT_STATUS.FAILURE;
    }
  }
}

// Script-aware selector (prioritizes scripted behaviors)
class ScriptSelector extends Selector {
  constructor(children = [], scriptPriority = false) {
    super(children);
    this.scriptPriority = scriptPriority;
  }

  tick(ctx) {
    // If script priority enabled, check for script commands first
    if (this.scriptPriority && ctx.activeScript) {
      const scriptResult = this.checkScriptCommands(ctx);
      if (scriptResult !== BT_STATUS.FAILURE) {
        return scriptResult;
      }
    }

    // Fall back to normal selector behavior
    return super.tick(ctx);
  }

  checkScriptCommands(ctx) {
    // Script-specific logic here
    return BT_STATUS.FAILURE; // Continue with base behaviors
  }
}

// Script merge utility for PARTIAL/BONUS scripts
function mergeCommands(baseCommand, scriptCommand, scriptType) {
  switch(scriptType) {
    case SCRIPT_TYPE.PARTIAL:
      // Script command takes priority for overridden behaviors
      return scriptCommand || baseCommand;

    case SCRIPT_TYPE.BONUS:
      // Execute both if possible, prefer script for conflicts
      if (!scriptCommand) return baseCommand;
      if (!baseCommand) return scriptCommand;

      // For BONUS scripts, create composite command
      return {
        type: 'composite',
        base: baseCommand,
        bonus: scriptCommand,
        execute: function(ctx) {
          // Execute both commands
          this.base.execute?.(ctx);
          this.bonus.execute?.(ctx);
        }
      };

    default:
      return scriptCommand || baseCommand;
  }
}

// Extended BT factory with script support
function createUniversalEnemyBehaviorTree(rarity, intelligence, scriptConfig = null) {
  const config = ENEMY_BEHAVIORS[rarity]?.[intelligence];

  if (!config) {
    console.warn(`[BT_FACTORY] Unknown rarity/intelligence: ${rarity}/${intelligence}, using fallback BT`);
    return createFallbackBehaviorTree();
  }

  // Create base behavior tree
  let behaviorTree;

  if (scriptConfig?.type === SCRIPT_TYPE.FULL && scriptConfig.script) {
    // FULL script override
    behaviorTree = scriptConfig.script.behaviorTree;
  } else {
    // Base system with potential script integration
    behaviorTree = new ScriptSelector([
      // Priority 1: Defensive reactions
      new Sequence([canEvade, evadeAction]),
      new Sequence([canBlock, blockAction]),

      // Priority 2: Combat behaviors
      new Sequence([hasTarget, targetInAttackRange, attackAction]),
      new Sequence([hasTarget, targetInChaseRange, chaseAction]),

      // Priority 3: Special attacks
      createSpecialAttackSubTree(),

      // Priority 4: Script behaviors (if BONUS type)
      ...(scriptConfig?.type === SCRIPT_TYPE.BONUS && scriptConfig.script?.bonusBehaviorTree ?
          [scriptConfig.script.bonusBehaviorTree] : []),

      // Priority 5: Movement behaviors
      createVerticalMovementSubtree(config),
      createPatrolDecisionSubtree(config),

      // Fallback
      patrolAction,
    ], true); // Enable script priority
  }

  return behaviorTree;
}

// Export script-enabled BT functions
window.createScriptEnabledBT = createUniversalEnemyBehaviorTree;
window.ScriptNode = ScriptNode;
window.ScriptSelector = ScriptSelector;
window.mergeCommands = mergeCommands;
```

### **base_enemy.js - Extensions**

```javascript
// Add to existing BaseEnemy class

class BaseEnemy {
  constructor(x, y, z, config = {}) {
    // ... existing constructor code ...

    // Script configuration
    this.scriptConfig = config.scriptConfig || null;
    this.activeScript = null;

    // Initialize script if specified
    if (this.scriptConfig?.scriptId) {
      this.initializeScript();
    }

    // ... rest of constructor ...
  }

  // NEW: Script initialization
  async initializeScript() {
    try {
      console.log(`[ENEMY_SCRIPT] Initializing ${this.scriptConfig.scriptId} for ${this.constructor.name}`);

      // Load script through manager
      this.activeScript = await window.enemyScriptManager.loadScript(this.scriptConfig.scriptId);

      // Validate script type matches configuration
      if (this.activeScript.type !== this.scriptConfig.type) {
        throw new Error(`Script type mismatch: config says ${this.scriptConfig.type}, script is ${this.activeScript.type}`);
      }

      console.log(`[ENEMY_SCRIPT] Successfully loaded: ${this.activeScript.name}`);

    } catch (error) {
      console.error(`[ENEMY_SCRIPT] Failed to load ${this.scriptConfig.scriptId}:`, error);
      // Continue without script (fallback to base system)
      this.scriptConfig = null;
      this.activeScript = null;
    }
  }

  // NEW: Runtime script switching (for boss phases)
  async switchScript(newScriptId) {
    if (!newScriptId) {
      console.log('[ENEMY_SCRIPT] Disabling script, reverting to base system');
      this.scriptConfig = null;
      this.activeScript = null;
      this.initializeBT(); // Recreate base BT
      return;
    }

    try {
      const newScript = await window.enemyScriptManager.switchScript(this, newScriptId);
      console.log(`[ENEMY_SCRIPT] Switched to: ${newScript.name}`);

      // Update AI context with new BT
      if (this.aiContext) {
        this.aiContext.behaviorTree = newScript.behaviorTree;
      }

    } catch (error) {
      console.error('[ENEMY_SCRIPT] Failed to switch script:', error);
    }
  }

  // MODIFIED: consultBTForBehavior with script support
  consultBTForBehavior(players, context = {}) {
    // Get fresh behavior constraints
    const constraints = window.getBehaviorConstraints ? window.getBehaviorConstraints(this) : null;
    if (constraints) {
      context.behaviorConstraints = constraints;
    }

    // Script decision logic
    if (this.activeScript) {
      const scriptCommand = this.getScriptCommand(context);

      switch(this.scriptConfig.type) {
        case SCRIPT_TYPE.FULL:
          // Complete script override
          return scriptCommand;

        case SCRIPT_TYPE.PARTIAL:
          // Selective override
          if (this.isBehaviorOverridden(scriptCommand.type)) {
            return scriptCommand;
          }
          break;

        case SCRIPT_TYPE.BONUS:
          // Execute script command alongside base
          const baseCommand = this.getBaseCommand(context);
          return window.mergeCommands(baseCommand, scriptCommand, SCRIPT_TYPE.BONUS);
      }
    }

    // Base system fallback
    return this.getBaseCommand(context);
  }

  // NEW: Script command generation
  getScriptCommand(context) {
    if (!this.activeScript?.behaviorTree) {
      return null;
    }

    // Update script context
    const scriptContext = this.createScriptContext(context);

    // Execute script BT
    this.activeScript.behaviorTree.tick(scriptContext);

    return scriptContext.command;
  }

  // NEW: Base command generation
  getBaseCommand(context) {
    // Existing base system logic
    return window.tickEnemyAI(this.aiContext.behaviorTree, this.aiContext);
  }

  // NEW: Check if behavior is overridden by partial script
  isBehaviorOverridden(behaviorType) {
    return this.activeScript?.overrides?.includes(behaviorType);
  }

  // NEW: Create script execution context
  createScriptContext(baseContext) {
    return {
      ...baseContext,
      self: this.aiContext.self,
      targets: this.aiContext.targets,
      behaviors: this.activeScript.behaviors,
      command: null
    };
  }

  // ... existing methods ...
}

// Export script-enabled enemy
window.ScriptEnabledEnemy = BaseEnemy;
```

---

## 🎮 Usage Examples

### **Boss with Phase Changes**

```javascript
// Boss enemy with phase switching
class PhaseBoss extends BaseEnemy {
  constructor(x, y, z) {
    super(x, y, z, {
      rarity: 'boss',
      intelligence: 'advanced',
      scriptConfig: {
        scriptId: 'mega_boss_phase1',
        type: SCRIPT_TYPE.FULL
      }
    });

    this.phaseThresholds = [0.66, 0.33]; // HP percentages
    this.currentPhase = 1;
  }

  updateAI(players, dt) {
    // Check for phase change
    const hpPercent = this.health / this.maxHealth;
    const newPhase = this.calculatePhase(hpPercent);

    if (newPhase !== this.currentPhase) {
      this.switchToPhase(newPhase);
    }

    // Continue with normal AI
    super.updateAI(players, dt);
  }

  calculatePhase(hpPercent) {
    for (let i = this.phaseThresholds.length - 1; i >= 0; i--) {
      if (hpPercent <= this.phaseThresholds[i]) {
        return this.phaseThresholds.length - i + 1;
      }
    }
    return 1;
  }

  async switchToPhase(phaseNumber) {
    const scriptId = `mega_boss_phase${phaseNumber}`;
    console.log(`[PHASE_BOSS] Switching to phase ${phaseNumber} (${scriptId})`);

    try {
      await this.switchScript(scriptId);
      this.currentPhase = phaseNumber;

      // Phase-specific effects
      this.triggerPhaseEffects(phaseNumber);

    } catch (error) {
      console.error('[PHASE_BOSS] Phase switch failed:', error);
    }
  }

  triggerPhaseEffects(phase) {
    switch(phase) {
      case 2:
        // Phase 2 effects
        console.log('[PHASE_BOSS] Phase 2: Increased aggression!');
        break;
      case 3:
        // Phase 3 effects
        console.log('[PHASE_BOSS] Phase 3: Desperate final form!');
        break;
    }
  }
}
```

### **Complex Attack Sequences**

```javascript
// Multi-stage attack pattern
const complexAttackScript = {
  id: "complex_attack_sequence",
  type: SCRIPT_TYPE.PARTIAL,
  overrides: ["attack"],

  behaviors: {
    attack: {
      name: "Whirlwind Strike",
      sequence: [
        {
          phase: "telegraph",
          duration: 1000,
          animation: "attack_telegraph",
          invincible: true
        },
        {
          phase: "charge",
          duration: 500,
          speed: 600,
          damage: 25,
          knockback: 150
        },
        {
          phase: "whirlwind",
          duration: 1500,
          hits: 3,
          damage: 15,
          radius: 120
        },
        {
          phase: "recovery",
          duration: 2000,
          vulnerable: true,
          slow: 0.5
        }
      ],
      cooldown: 8000
    }
  }
};

// BT implementation
function createComplexAttackBT() {
  return new Sequence([
    // Check cooldown
    new Condition(ctx => !ctx.attackCooldown || Date.now() - ctx.lastAttack > ctx.behaviors.attack.cooldown),

    // Telegraph phase
    new Action(ctx => ({
      type: "attack_sequence",
      phase: "telegraph",
      duration: ctx.behaviors.attack.sequence[0].duration
    })),

    // Charge phase
    new Action(ctx => ({
      type: "attack_sequence",
      phase: "charge",
      speed: ctx.behaviors.attack.sequence[1].speed,
      damage: ctx.behaviors.attack.sequence[1].damage
    })),

    // Whirlwind phase
    new Action(ctx => ({
      type: "attack_sequence",
      phase: "whirlwind",
      hits: ctx.behaviors.attack.sequence[2].hits,
      damage: ctx.behaviors.attack.sequence[2].damage
    })),

    // Recovery phase
    new Action(ctx => ({
      type: "attack_sequence",
      phase: "recovery",
      duration: ctx.behaviors.attack.sequence[3].duration
    }))
  ]);
}
```

### **Debug & Testing Interface**

```javascript
// Debug console commands
window.enemyScriptDebug = {
  // List all available scripts
  listScripts: () => {
    console.table(Array.from(window.enemyScripts.SCRIPTS.entries()).map(([id, script]) => ({
      ID: id,
      Name: script.name,
      Type: script.type,
      Loaded: window.enemyScriptManager.cache.has(id)
    })));
  },

  // Force script on enemy
  forceScript: (enemyIndex, scriptId) => {
    const enemies = window.gameState.getEntitiesByType('enemy');
    if (enemies[enemyIndex]) {
      window.enemyScriptManager.switchScript(enemies[enemyIndex], scriptId);
      console.log(`Forced ${scriptId} on enemy ${enemyIndex}`);
    }
  },

  // Show script performance
  showPerformance: () => {
    console.table(window.enemyScriptManager.getPerformanceStats());
  },

  // Create test enemy with script
  spawnScriptedEnemy: (scriptId, x = 400, y = 300) => {
    const enemy = new window.ScriptEnabledEnemy(x, y, 0, {
      scriptConfig: { scriptId, type: SCRIPT_TYPE.FULL }
    });
    window.gameState.addEntity(enemy);
    console.log(`Spawned enemy with script: ${scriptId}`);
    return enemy;
  }
};

// Usage examples:
// enemyScriptDebug.listScripts()
// enemyScriptDebug.forceScript(0, 'mega_boss_phase2')
// enemyScriptDebug.showPerformance()
// enemyScriptDebug.spawnScriptedEnemy('dragon_boss')
```

---

## 🔧 Implementation Roadmap

### **Phase 1: Core Infrastructure** ✅ COMPLETED
- [x] Script type definitions (`SCRIPT_TYPE.FULL/PARTIAL/BONUS`)
- [x] Basic validation functions with error handling
- [x] Script constants (cache size, timeouts, size limits)
- [x] File structure planning and integration points

### **Phase 2: Script System Base** ✅ COMPLETED
- [x] Create `enemy_scripts.js` with script registry (Map-based)
- [x] Create `enemy_script_manager.js` with caching and async loading
- [x] Extend `enemy_ai_config.js` with script constants
- [x] Implement Blue Slime vertical test script (`blue_slime_vertical_test`)
- [x] Auto-initialization and error recovery

### **Phase 3: BT Integration** ✅ COMPLETED
- [x] Add script-aware BT nodes (`ScriptNode`, `ScriptSelector`)
- [x] Implement command merging logic (`mergeCommands` function)
- [x] Create script execution context system
- [x] Extend BT factory with script support (`createScriptEnabledBT`)
- [x] Add MOVE_UP/MOVE_DOWN commands to COMMAND enum

### **Phase 4: Enemy Integration** ✅ COMPLETED
- [x] Extend `BaseEnemy` with script initialization (`initializeScript()`)
- [x] Implement runtime script switching (`switchScript()`)
- [x] Add script validation on enemy creation
- [x] Modify `consultBTForBehavior()` with proper script priority logic
- [x] Graceful fallback to base system on script failures
- [x] Blue Slime integration with vertical test script

### **Phase 5: Boss Examples** 🔄 IN PROGRESS
- [x] Create Blue Slime vertical ping-pong test script
- [ ] Create comprehensive boss scripts (Mega Boss phases)
- [ ] Implement phase switching system
- [ ] Add complex attack sequences for bosses

### **Phase 6: Testing & Polish** 🔄 IN PROGRESS
- [x] Basic debug tools (`window.enemyScriptDebug`)
- [x] Performance monitoring (`getPerformanceStats()`)
- [ ] Comprehensive testing with various script types
- [ ] Memory management optimization
- [ ] Advanced debug tools and script visualization

---

## 📊 Performance Considerations

### **Memory Management**
- Script caching with LRU eviction (max 20 scripts)
- Lazy loading of script assets
- Reference counting for shared scripts

### **Execution Performance**
- BT node pooling to reduce GC pressure
- Cached script validation results
- Optimized script merging logic

### **Load Times**
- Asynchronous script loading
- Progressive script validation
- Background compilation for complex scripts

---

## 🐛 Error Handling & Debugging

### **Script Validation**
```javascript
function validateScript(script) {
  // Structure validation
  if (!script.id || !script.type || !script.name) {
    throw new Error('Missing required script fields');
  }

  // Type-specific validation
  switch(script.type) {
    case SCRIPT_TYPE.FULL:
      if (!script.behaviorTree) {
        throw new Error('FULL scripts require behaviorTree');
      }
      break;
    // ... more validations
  }
}
```

### **Runtime Error Recovery**
- Graceful fallback to base system on script failure
- Error logging with script context
- Script isolation to prevent crashes

### **Debug Features**
- Script execution tracing
- Performance monitoring
- Visual script tree debugging

---

## 🔄 Migration Strategy

### **Backwards Compatibility**
- All existing enemies continue working without changes
- Script system is purely additive
- Base rarity/intelligence system remains default

### **Gradual Adoption**
- Start with simple BONUS scripts for existing enemies
- Add PARTIAL scripts for elite enemies
- Implement FULL scripts for new boss content

### **Version Control**
- Script versioning for change management
- Migration utilities for script updates
- Rollback capability for problematic scripts

---

## 🎯 Success Metrics

- **Performance**: <5ms average script execution time
- **Memory**: <10MB total script cache size
- **Compatibility**: 100% backwards compatibility
- **Maintainability**: Modular script system with clear separation of concerns

---

**Document Author:** Deyan Shahov
**Review Date:** Ready for implementation
**Implementation Priority:** High

*This system provides the foundation for complex boss mechanics while maintaining the simplicity of the existing AI system.*
