/* =========================
   ENEMY AI CONFIGURATION
   Centralized constants and configuration for AI system
   ========================= */

/* =========================
   AI CONSTANTS
   ========================= */
const ENEMY_AI_CONSTANTS = {
  // Screen boundaries
  SCREEN_MARGIN: 50,        // Pixels from screen edge to trigger boundary detection
  SCREEN_MARGIN_TIGHT: 20,  // Tighter margin for obstacle detection

  // Collision detection
  COLLISION_CHECK_DISTANCE: 100,  // Distance to check for entity collisions
  OBSTACLE_DETECTION_RANGE: 50,   // Range for obstacle detection
  AI_COLLISION_BUFFER: 8,         // Buffer for smoother AI movement
  Z_TOLERANCE: 30,               // Z-depth tolerance for AI collisions

  // Movement and patrol
  PATROL_SKIP_COLLISION_FRAME: true, // Skip collision checks on first patrol frame
  MAX_PATROL_DISTANCE: 1000,     // Maximum distance enemy can patrol from spawn

  // Terrain awareness
  TERRAIN_CHECK_DEPTH: 10,        // How far down to check for terrain
  GROUND_LEVEL_Y: 480,           // Default ground level (same as player)

  // AI timing
  THINKING_DURATION_BASE: 3000,  // Base thinking duration in ms
  THINKING_DURATION_MIN: 1000,   // Minimum thinking time for fair gameplay

  // Intelligence multipliers
  BASIC_INTELLIGENCE_MULTIPLIER: 1.0,
  NORMAL_INTELLIGENCE_MULTIPLIER: 1.5,
  ADVANCED_INTELLIGENCE_MULTIPLIER: 2.0,

  // Rarity thinking adjustments
  COMMON_THINKING_MULTIPLIER: 1.0,
  ELITE_THINKING_MULTIPLIER: 1.1,
  BOSS_THINKING_MULTIPLIER: 1.2,

  // Situation-based thinking adjustments
  ATTACK_COMPLETE_MULTIPLIER: 0.8,
  PLAYER_DETECTED_MULTIPLIER: 0.6,
  SCREEN_BOUNDARY_MULTIPLIER: 0.9,
  PATROL_END_MULTIPLIER: 1.0,

  // BT integration
  BT_CONSTRAINT_CHECK_DISTANCE_X: 100, // Horizontal distance for constraint checks
  BT_CONSTRAINT_CHECK_DISTANCE_Z: 50,  // Vertical distance for constraint checks

  // Script system constants (PHASE 1)
  MAX_SCRIPT_CACHE_SIZE: 20,      // Maximum cached scripts
  SCRIPT_LOAD_TIMEOUT: 5000,      // Script load timeout (ms)
  MAX_SCRIPT_SIZE: 102400,        // Maximum script size (100KB)
  VALIDATION_STRICT_MODE: true,   // Strict validation enabled
};

/* =========================
   AI BEHAVIOR CONFIGURATIONS
   ========================= */
const AI_BEHAVIOR_CONFIGS = {
  // Intelligence levels affect thinking time and decision complexity
  intelligence: {
    basic: { name: 'basic', thinkingMultiplier: 1.0 },
    normal: { name: 'normal', thinkingMultiplier: 1.5 },
    advanced: { name: 'advanced', thinkingMultiplier: 2.0 },
  },

  // Rarity levels affect behavior complexity and stats
  rarity: {
    common: { name: 'common', thinkingMultiplier: 1.0 },
    elite: { name: 'elite', thinkingMultiplier: 1.1 },
    boss: { name: 'boss', thinkingMultiplier: 1.2 },
  },

  // Situation-based behavior adjustments
  situations: {
    idle_timeout: { thinkingMultiplier: 1.0 },
    patrol_end: { thinkingMultiplier: 1.0 },
    screen_boundary: { thinkingMultiplier: 0.9 },
    entity_collision: { thinkingMultiplier: 0.9 },
    player_detected: { thinkingMultiplier: 0.6 },
    attack_complete: { thinkingMultiplier: 0.8 },
  }
};

/* =========================
   EXPORT CONFIGURATION
   ========================= */
window.enemyAIConfig = {
  CONSTANTS: ENEMY_AI_CONSTANTS,
  BEHAVIORS: AI_BEHAVIOR_CONFIGS,

  // Helper functions for configuration
  getIntelligenceMultiplier: function(intelligence) {
    return this.BEHAVIORS.intelligence[intelligence]?.thinkingMultiplier || 1.0;
  },

  getRarityMultiplier: function(rarity) {
    return this.BEHAVIORS.rarity[rarity]?.thinkingMultiplier || 1.0;
  },

  getSituationMultiplier: function(situation) {
    return this.BEHAVIORS.situations[situation]?.thinkingMultiplier || 1.0;
  },

  // Calculate final thinking duration based on enemy properties
  calculateThinkingDuration: function(baseDuration, intelligence, rarity, situation = 'idle_timeout') {
    let duration = baseDuration;

    // Apply intelligence multiplier
    duration *= this.getIntelligenceMultiplier(intelligence);

    // Apply rarity multiplier
    duration *= this.getRarityMultiplier(rarity);

    // Apply situation multiplier
    duration *= this.getSituationMultiplier(situation);

    // Ensure minimum thinking time
    return Math.max(this.CONSTANTS.THINKING_DURATION_MIN, duration);
  }
};

// Legacy support - export constants directly for backwards compatibility
window.ENEMY_AI_CONSTANTS = ENEMY_AI_CONSTANTS;

/* =========================
   SCRIPT SYSTEM TYPES & VALIDATION (PHASE 1)
   ========================= */

// Script types enum
const SCRIPT_TYPE = {
  FULL: 'full',     // Complete behavior override (100%)
  PARTIAL: 'partial', // Selective behavior override (30-70%)
  BONUS: 'bonus'    // Extension/additional behaviors (10-30%)
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

// Export script system extensions
window.enemyAIConfig.SCRIPT_TYPE = SCRIPT_TYPE;
window.enemyAIConfig.validateScriptType = validateScriptType;
window.enemyAIConfig.validateScriptStructure = validateScriptStructure;
