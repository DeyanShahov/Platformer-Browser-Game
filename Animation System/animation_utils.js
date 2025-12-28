// Animation Utils
// Utility functions for animation system operations
// Handles animation lookups, configurations, and type resolution

// ===========================================
// ANIMATION LOOKUP FUNCTIONS
// ===========================================

/**
 * Get animation definition for entity type and animation type
 * @param {string} entityType - Entity type (e.g., 'knight', 'blue_slime', 'enemy')
 * @param {string} animationType - Animation type (e.g., 'idle', 'walk', 'attack_1')
 * @returns {Object|null} Animation definition or null if not found
 */
function getAnimationDefinition(entityType, animationType) {
  const definitions = window.ANIMATION_DEFINITIONS[entityType];
  return definitions ? definitions[animationType] : null;
}

/**
 * Get sprite configuration for entity type
 * @param {string} entityType - Entity type
 * @returns {Object} Sprite configuration with defaults
 */
function getSpriteConfig(entityType) {
  return window.SPRITE_CONFIGS[entityType] || window.SPRITE_CONFIGS.default;
}

/**
 * Get keyframe definition for animation
 * @param {string} keyframeName - Keyframe name (e.g., 'sprite-4-frames')
 * @returns {Object|null} Keyframe definition or null if not found
 */
function getKeyframeDefinition(keyframeName) {
  return window.KEYFRAME_DEFINITIONS[keyframeName] || null;
}

/**
 * Get animation priority for state management
 * @param {string} animationType - Animation type
 * @returns {number} Priority value (higher = more important)
 */
function getAnimationPriority(animationType) {
  return window.ANIMATION_PRIORITIES[animationType] || 0;
}

// ===========================================
// ENTITY TYPE RESOLUTION
// ===========================================

/**
 * Resolve entity animation type based on entity properties
 * @param {Object} entity - Entity object
 * @param {string} baseType - Base animation type (IDLE, WALK, etc.)
 * @returns {string|null} Resolved animation type or null
 */
function resolveEntityAnimationType(entity, baseType) {
  const entityType = entity.animationEntityType || 'enemy';

  // Handle special entity types
  if (entityType === 'blue_slime') {
    return window.BLUE_SLIME_ANIMATION_TYPES?.[baseType] || null;
  }

  // Standard entity types
  return window.ANIMATION_TYPES?.[baseType.toLowerCase()] || null;
}

/**
 * Check if entity type supports animation
 * @param {string} entityType - Entity type to check
 * @returns {boolean} True if animations are supported
 */
function supportsAnimation(entityType) {
  return window.ANIMATION_DEFINITIONS.hasOwnProperty(entityType);
}

/**
 * Get all available entity types that support animations
 * @returns {Array<string>} Array of entity type names
 */
function getSupportedEntityTypes() {
  return Object.keys(window.ANIMATION_DEFINITIONS || {});
}

/**
 * Get all animation types for a specific entity type
 * @param {string} entityType - Entity type
 * @returns {Array<string>} Array of animation type names
 */
function getEntityAnimationTypes(entityType) {
  const definitions = window.ANIMATION_DEFINITIONS?.[entityType];
  return definitions ? Object.keys(definitions) : [];
}

// ===========================================
// ANIMATION VALIDATION
// ===========================================

/**
 * Validate animation definition structure
 * @param {Object} definition - Animation definition to validate
 * @returns {boolean} True if valid
 */
function validateAnimationDefinition(definition) {
  if (!definition || typeof definition !== 'object') return false;

  // Required properties
  const required = ['spriteSheet', 'frames', 'frameWidth', 'frameHeight', 'duration', 'loop'];
  for (const prop of required) {
    if (!(prop in definition)) return false;
  }

  // Type checks
  if (typeof definition.frames !== 'number' || definition.frames < 1) return false;
  if (typeof definition.duration !== 'number' || definition.duration <= 0) return false;

  return true;
}

/**
 * Validate sprite sheet exists for animation
 * @param {Object} definition - Animation definition
 * @returns {boolean} True if sprite exists
 */
function validateSpriteSheet(definition) {
  if (!definition.spriteSheet) return false;

  // Check if sprite is loaded (if spriteManager exists)
  if (window.spriteManager) {
    return window.spriteManager.isSpriteLoaded(definition.spriteSheet);
  }

  return true; // Assume valid if no spriteManager
}

// ===========================================
// ANIMATION SYSTEM HELPERS
// ===========================================

/**
 * Calculate animation duration from frame durations
 * @param {Array<number>} frameDurations - Array of frame durations
 * @returns {number} Total duration in seconds
 */
function calculateAnimationDuration(frameDurations) {
  if (!Array.isArray(frameDurations)) return 0;
  return frameDurations.reduce((sum, duration) => sum + duration, 0);
}

/**
 * Get frame count from animation definition
 * @param {Object} definition - Animation definition
 * @returns {number} Frame count
 */
function getAnimationFrameCount(definition) {
  return definition?.frames || 0;
}

/**
 * Check if animation is looping
 * @param {Object} definition - Animation definition
 * @returns {boolean} True if looping
 */
function isAnimationLooping(definition) {
  return definition?.loop === true;
}

/**
 * Get sprite sheet path from animation definition
 * @param {Object} definition - Animation definition
 * @returns {string|null} Sprite sheet path or null
 */
function getAnimationSpriteSheet(definition) {
  return definition?.spriteSheet || null;
}

// ===========================================
// DEBUGGING HELPERS
// ===========================================

/**
 * Get debug information for animation definition
 * @param {Object} definition - Animation definition
 * @param {string} entityType - Entity type
 * @param {string} animationType - Animation type
 * @returns {Object} Debug information
 */
function getAnimationDebugInfo(definition, entityType, animationType) {
  return {
    entityType,
    animationType,
    spriteSheet: getAnimationSpriteSheet(definition),
    frames: getAnimationFrameCount(definition),
    duration: definition?.duration || 0,
    looping: isAnimationLooping(definition),
    hasFrameData: !!definition?.frameData,
    frameDataLength: definition?.frameData?.length || 0,
    valid: validateAnimationDefinition(definition),
    spriteValid: validateSpriteSheet(definition)
  };
}

/**
 * Log animation system status
 */
function logAnimationSystemStatus() {
  console.log('[Animation Utils] System Status:', {
    definitionsLoaded: !!window.ANIMATION_DEFINITIONS,
    spriteConfigsLoaded: !!window.SPRITE_CONFIGS,
    keyframeDefinitionsLoaded: !!window.KEYFRAME_DEFINITIONS,
    animationPrioritiesLoaded: !!window.ANIMATION_PRIORITIES,
    blueSlimeTypesLoaded: !!window.BLUE_SLIME_ANIMATION_TYPES,
    supportedEntityTypes: getSupportedEntityTypes(),
    spriteManagerAvailable: !!window.spriteManager
  });
}

// ===========================================
// GLOBAL EXPORTS
// ===========================================

// Export utility functions globally
window.getAnimationDefinition = getAnimationDefinition;
window.getSpriteConfig = getSpriteConfig;
window.getKeyframeDefinition = getKeyframeDefinition;
window.getAnimationPriority = getAnimationPriority;
window.resolveEntityAnimationType = resolveEntityAnimationType;
window.supportsAnimation = supportsAnimation;
window.getSupportedEntityTypes = getSupportedEntityTypes;
window.getEntityAnimationTypes = getEntityAnimationTypes;
window.validateAnimationDefinition = validateAnimationDefinition;
window.validateSpriteSheet = validateSpriteSheet;
window.calculateAnimationDuration = calculateAnimationDuration;
window.getAnimationFrameCount = getAnimationFrameCount;
window.isAnimationLooping = isAnimationLooping;
window.getAnimationSpriteSheet = getAnimationSpriteSheet;
window.getAnimationDebugInfo = getAnimationDebugInfo;
window.logAnimationSystemStatus = logAnimationSystemStatus;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getAnimationDefinition,
    getSpriteConfig,
    getKeyframeDefinition,
    getAnimationPriority,
    resolveEntityAnimationType,
    supportsAnimation,
    getSupportedEntityTypes,
    getEntityAnimationTypes,
    validateAnimationDefinition,
    validateSpriteSheet,
    calculateAnimationDuration,
    getAnimationFrameCount,
    isAnimationLooping,
    getAnimationSpriteSheet,
    getAnimationDebugInfo,
    logAnimationSystemStatus
  };
}
