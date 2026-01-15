/* =========================
   ENEMY AI UTILITIES
   Collision Detection, Movement Logic, Pathfinding
   ========================= */

// Import centralized configuration
// Constants are now managed in enemy_ai_config.js

/* =========================
   SCREEN BOUNDARY DETECTION
   ========================= */

/**
 * Check if enemy is at screen boundaries
 * @param {Object} enemy - Enemy entity
 * @param {number} margin - Margin from screen edge (default: 50px)
 * @returns {Object} { left: boolean, right: boolean, top: boolean, bottom: boolean }
 */
function checkScreenBoundaries(enemy, margin = (window.enemyAIConfig?.CONSTANTS?.SCREEN_MARGIN || 50)) {
  const canvas = document.getElementById('game');
  if (!canvas) return { left: false, right: false, top: false, bottom: false };

  const screenLeft = 0 + margin;
  const screenRight = canvas.width - margin;
  const screenTop = 0 + margin;
  const screenBottom = canvas.height - margin;

  return {
    left: enemy.x <= screenLeft,
    right: enemy.x >= screenRight,
    top: enemy.y <= screenTop,
    bottom: enemy.y >= screenBottom
  };
}

/**
 * Check if enemy should reverse direction due to screen boundaries
 * @param {Object} enemy - Enemy entity
 * @param {number} currentDirection - Current movement direction (1 = right, -1 = left)
 * @returns {number|null} New direction or null if no change needed
 */
function getScreenBoundaryDirection(enemy, currentDirection) {
  const boundaries = checkScreenBoundaries(enemy);

  // If at left boundary and moving left, reverse to right
  if (boundaries.left && currentDirection < 0) {
    return 1;
  }

  // If at right boundary and moving right, reverse to left
  if (boundaries.right && currentDirection > 0) {
    return -1;
  }

  return null; // No direction change needed
}

/* =========================
   ENTITY COLLISION DETECTION
   ========================= */

/**
 * Check for collisions with other entities
 * @param {Object} enemy - Enemy entity to check
 * @param {Array} entities - Array of all entities in game
 * @param {number} checkDistance - Maximum distance to check (default: 100px)
 * @returns {Array} Array of collided entities
 */
function detectEntityCollisions(enemy, entities, checkDistance = (window.enemyAIConfig?.CONSTANTS?.COLLISION_CHECK_DISTANCE || 100)) {
  if (!entities || entities.length === 0) return [];

  const collisions = [];

  for (const entity of entities) {
    // Skip self
    if (entity === enemy) continue;

    // Skip entities without hitboxes
    if (!entity.collisionW || !entity.collisionH) continue;

    // Quick distance check first
    const distance = window.calculateEntityDistance ? window.calculateEntityDistance(enemy, entity) :
      Math.sqrt(Math.pow(enemy.x - entity.x, 2) + Math.pow(enemy.y - entity.y, 2));

    if (distance > checkDistance) continue;

    // Detailed collision check
    if (checkEntityCollision(enemy, entity)) {
      collisions.push({
        entity: entity,
        distance: distance,
        direction: getDirectionToEntity(enemy, entity)
      });
    }
  }

  return collisions;
}

// function checkEntityCollision(entity1, entity2) {
//   ... (Removed to use global checkEntityCollision from collision.js)
// }

/**
 * Get direction from entity1 to entity2
 * @param {Object} from - Source entity
 * @param {Object} to - Target entity
 * @returns {Object} { x: number, y: number } normalized direction vector
 */
function getDirectionToEntity(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) return { x: 0, y: 0 };

  return {
    x: dx / length,
    y: dy / length
  };
}

/* =========================
   OBSTACLE AVOIDANCE
   ========================= */

/**
 * Find collision-free direction for patrol
 * @param {Object} enemy - Enemy entity
 * @param {number} currentDirection - Current direction (1 or -1)
 * @param {Array} entities - All entities to check against
 * @returns {number} New direction (1 or -1)
 */
function findCollisionFreeDirection(enemy, currentDirection, entities) {
  // First try current direction
  const testEnemy = { ...enemy, x: enemy.x + currentDirection * 20 };
  const collisions = detectEntityCollisions(testEnemy, entities, 30);

  if (collisions.length === 0) {
    return currentDirection; // Current direction is clear
  }

  // Try opposite direction
  const oppositeDirection = -currentDirection;
  const testEnemyOpposite = { ...enemy, x: enemy.x + oppositeDirection * 20 };
  const oppositeCollisions = detectEntityCollisions(testEnemyOpposite, entities, 30);

  if (oppositeCollisions.length === 0) {
    return oppositeDirection; // Opposite direction is clear
  }

  // Both directions blocked - stop moving
  return 0;
}

/* =========================
   TERRAIN AWARENESS
   ========================= */

/**
 * Check terrain type at position
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {string} Terrain type ('ground', 'air', 'platform', 'wall')
 */
function getTerrainTypeAt(x, y) {
  // This would integrate with the game's terrain/collision system
  // For now, simple ground check
  const groundY = window.enemyAIConfig?.CONSTANTS?.GROUND_LEVEL_Y || 480; // Use centralized constant

  if (y >= groundY - 5) return 'ground';
  if (y < groundY - 100) return 'air';

  return 'platform';
}

/* =========================
   PATROL WAYPOINTS
   ========================= */

/**
 * Calculate patrol waypoints around center point
 * @param {number} centerX - Center X position
 * @param {number} radius - Patrol radius
 * @param {number} numWaypoints - Number of waypoints (default: 4)
 * @returns {Array} Array of {x, y} waypoint objects
 */
function calculatePatrolWaypoints(centerX, radius, numWaypoints = 4) {
  const waypoints = [];
  const angleStep = (Math.PI * 2) / numWaypoints;

  for (let i = 0; i < numWaypoints; i++) {
    const angle = i * angleStep;
    const x = centerX + Math.cos(angle) * radius;
    const y = window.enemyAIConfig?.CONSTANTS?.GROUND_LEVEL_Y || 480; // Use centralized constant

    waypoints.push({ x, y });
  }

  return waypoints;
}

/* =========================
   DISTANCE AND RANGE UTILITIES
   ========================= */

/**
 * Get all entities within range of enemy
 * @param {Object} enemy - Enemy entity
 * @param {Array} entities - Array of entities to check
 * @param {number} range - Maximum range
 * @returns {Array} Array of entities within range with distance info
 */
function getEntitiesInRange(enemy, entities, range) {
  if (!entities || entities.length === 0) return [];

  return entities
    .map(entity => {
      // FIXED: Include Z-coordinate in distance calculation for 2.5D gameplay
      const distance = window.calculateEntityDistance ? window.calculateEntityDistance(enemy, entity) :
        Math.sqrt(
          Math.pow(enemy.x - entity.x, 2) +
          Math.pow(enemy.y - entity.y, 2) +
          Math.pow((enemy.z || 0) - (entity.z || 0), 2)
        );

      console.log(`[GET_ENTITIES_IN_RANGE] Entity ${entity?.entityType} distance: ${distance.toFixed(1)}, range: ${range}, inRange: ${distance <= range}`);

      return {
        entity,
        distance
      };
    })
    .filter(item => item.distance <= range)
    .sort((a, b) => a.distance - b.distance); // Closest first
}

/**
 * Find best flee direction from threats
 * @param {Object} enemy - Enemy entity
 * @param {Array} threats - Array of threatening entities
 * @returns {Object} { direction: number, reason: string }
 */
function getBestFleeDirection(enemy, threats) {
  if (!threats || threats.length === 0) {
    return { direction: enemy.patrolDirection || 1, reason: 'no_threats' };
  }

  // Simple flee logic: move away from closest threat
  const closestThreat = threats.reduce((closest, threat) => {
    const distance = Math.abs(enemy.x - threat.x);
    return (!closest || distance < closest.distance) ? { ...threat, distance } : closest;
  }, null);

  if (!closestThreat) {
    return { direction: enemy.patrolDirection || 1, reason: 'no_valid_threat' };
  }

  // Move away from threat
  const direction = enemy.x < closestThreat.x ? -1 : 1;

  return {
    direction,
    reason: 'flee_from_threat',
    threatDistance: closestThreat.distance
  };
}

/* =========================
   BT INTEGRATION HELPERS
   ========================= */

/**
 * Check if obstacle is ahead in movement direction
 * @param {Object} enemy - Enemy entity
 * @param {number} checkDistance - Distance to check ahead
 * @returns {boolean} True if obstacle detected
 */
function detectObstacleAhead(enemy, checkDistance = (window.enemyAIConfig?.CONSTANTS?.OBSTACLE_DETECTION_RANGE || 50)) {
  // Check screen boundaries
  const boundaries = checkScreenBoundaries(enemy, 20);
  if ((enemy.vx > 0 && boundaries.right) || (enemy.vx < 0 && boundaries.left)) {
    return true;
  }

  // Check entity collisions ahead
  const aheadPosition = {
    x: enemy.x + enemy.vx * checkDistance / Math.abs(enemy.vx || 1),
    y: enemy.y,
    collisionW: enemy.collisionW,
    collisionH: enemy.collisionH
  };

  const entities = window.gameState ? window.gameState.getAllEntities() : [];
  const collisions = detectEntityCollisions(aheadPosition, entities, checkDistance);

  return collisions.length > 0;
}

/* =========================
   CACHING SYSTEM FOR PERFORMANCE
   ========================= */

// Cache for screen boundaries (canvas size rarely changes)
let screenBoundaryCache = null;
let lastCanvasWidth = 0;
let lastCanvasHeight = 0;

/**
 * Get cached screen boundaries, update cache if canvas size changed
 * @returns {Object} Cached boundary calculations
 */
function getCachedScreenBoundaries() {
  const canvas = document.getElementById('game');
  if (!canvas) return { left: false, right: false, top: false, bottom: false };

  // Check if cache needs refresh
  if (!screenBoundaryCache || lastCanvasWidth !== canvas.width || lastCanvasHeight !== canvas.height) {
    lastCanvasWidth = canvas.width;
    lastCanvasHeight = canvas.height;
    screenBoundaryCache = {
      width: canvas.width,
      height: canvas.height,
      centerX: canvas.width / 2,
      centerY: canvas.height / 2
    };
  }

  return screenBoundaryCache;
}

/* =========================
   PERFORMANCE OPTIMIZATIONS
   ========================= */

/**
 * Optimized distance calculation with early exit for performance
 * @param {Object} entity1 - First entity
 * @param {Object} entity2 - Second entity
 * @param {number} maxDistance - Maximum distance to check (for early exit)
 * @returns {number|null} Distance or null if exceeds maxDistance
 */
function calculateDistanceOptimized(entity1, entity2, maxDistance = Infinity) {
  const distance = window.calculateEntityDistance ? window.calculateEntityDistance(entity1, entity2) :
    Math.sqrt(Math.pow(entity1.x - entity2.x, 2) + Math.pow(entity1.y - entity2.y, 2));

  if (maxDistance !== Infinity && distance > maxDistance) return null;
  return distance;
}

/**
 * Batch collision detection for multiple entities (more efficient)
 * @param {Object} sourceEntity - Entity to check collisions for
 * @param {Array} targetEntities - Entities to check against
 * @param {number} checkDistance - Maximum distance to check
 * @returns {Array} Array of collision data
 */
function batchCollisionDetection(sourceEntity, targetEntities, checkDistance) {
  if (!targetEntities || targetEntities.length === 0) return [];

  const collisions = [];
  const checkDistanceSquared = checkDistance * checkDistance;

  for (const target of targetEntities) {
    if (target === sourceEntity) continue;

    // Skip entities without hitboxes
    if (!target.collisionW || !target.collisionH) continue;

    const distance = window.calculateEntityDistance ? window.calculateEntityDistance(sourceEntity, target) :
      Math.sqrt(Math.pow(sourceEntity.x - target.x, 2) + Math.pow(sourceEntity.y - target.y, 2));

    if (distance > checkDistance) continue;

    // Detailed collision check
    if (checkEntityCollision(sourceEntity, target)) {
      collisions.push({
        entity: target,
        distance: distance,
        direction: getDirectionToEntity(sourceEntity, target)
      });
    }
  }

  return collisions;
}

/* =========================
   ENHANCED UTILITY FUNCTIONS
   ========================= */

/**
 * Enhanced screen boundary check with caching
 * @param {Object} enemy - Enemy entity
 * @param {number} margin - Margin from screen edge
 * @returns {Object} Boundary status
 */
function checkScreenBoundariesCached(enemy, margin = (window.enemyAIConfig?.CONSTANTS?.SCREEN_MARGIN || 50)) {
  const canvas = document.getElementById('game');
  if (!canvas) return { left: false, right: false, top: false, bottom: false };

  const boundaries = getCachedScreenBoundaries();

  return {
    left: enemy.x <= margin,
    right: enemy.x >= (boundaries.width - margin),
    top: enemy.y <= margin,
    bottom: enemy.y >= (boundaries.height - margin)
  };
}

/* =========================
   GLOBAL EXPORTS (following project pattern)
   ========================= */
window.enemyAIUtils = {
  // Constants (now from centralized config)
  CONSTANTS: window.enemyAIConfig?.CONSTANTS || ENEMY_AI_CONSTANTS,

  // Screen boundary functions
  checkScreenBoundaries,
  checkScreenBoundariesCached, // Optimized version with caching
  getScreenBoundaryDirection,

  // Entity collision functions
  detectEntityCollisions,
  batchCollisionDetection, // Optimized batch processing
  checkEntityCollision,
  getDirectionToEntity,

  // Obstacle avoidance
  findCollisionFreeDirection,

  // Terrain awareness
  getTerrainTypeAt,

  // Patrol waypoints
  calculatePatrolWaypoints,

  // Distance utilities
  getEntitiesInRange,
  getBestFleeDirection,
  calculateDistanceOptimized, // Performance optimized distance calc

  // BT integration
  detectObstacleAhead,

  // Caching utilities
  getCachedScreenBoundaries,

  // Performance monitoring (for debugging)
  getPerformanceStats: function () {
    return {
      cacheHits: screenBoundaryCache ? 1 : 0,
      canvasSize: { width: lastCanvasWidth, height: lastCanvasHeight }
    };
  }
};
