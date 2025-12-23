/* =========================
   ENEMY AI UTILITIES
   Collision Detection, Movement Logic, Pathfinding
   ========================= */

/* =========================
   CONSTANTS
   ========================= */
const ENEMY_AI_CONSTANTS = {
  SCREEN_MARGIN: 50,        // Pixels from screen edge to trigger boundary detection
  COLLISION_CHECK_DISTANCE: 100,  // Distance to check for entity collisions
  OBSTACLE_DETECTION_RANGE: 50,   // Range for obstacle detection
  TERRAIN_CHECK_DEPTH: 10,        // How far down to check for terrain
};

/* =========================
   SCREEN BOUNDARY DETECTION
   ========================= */

/**
 * Check if enemy is at screen boundaries
 * @param {Object} enemy - Enemy entity
 * @param {number} margin - Margin from screen edge (default: 50px)
 * @returns {Object} { left: boolean, right: boolean, top: boolean, bottom: boolean }
 */
function checkScreenBoundaries(enemy, margin = ENEMY_AI_CONSTANTS.SCREEN_MARGIN) {
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
function detectEntityCollisions(enemy, entities, checkDistance = ENEMY_AI_CONSTANTS.COLLISION_CHECK_DISTANCE) {
  if (!entities || entities.length === 0) return [];

  const collisions = [];

  for (const entity of entities) {
    // Skip self
    if (entity === enemy) continue;

    // Skip entities without hitboxes
    if (!entity.collisionW || !entity.collisionH) continue;

    // Quick distance check first
    const distance = Math.sqrt(
      Math.pow(enemy.x - entity.x, 2) +
      Math.pow(enemy.y - entity.y, 2)
    );

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

/**
 * Check collision between two entities using collision system with Z-depth support for AI
 * @param {Object} entity1 - First entity
 * @param {Object} entity2 - Second entity
 * @returns {boolean} True if colliding
 */
function checkEntityCollision(entity1, entity2) {
  // Use checkCollisionWithBuffer directly to avoid infinite recursion
  if (window.checkCollisionWithBuffer) {
    return window.checkCollisionWithBuffer(
      entity1.x, entity1.y, entity1.z,
      entity1.collisionW || entity1.w, entity1.collisionH || entity1.h, entity1.zThickness || 0,
      entity2.x, entity2.y, entity2.z,
      entity2.collisionW || entity2.w, entity2.collisionH || entity2.h, entity2.zThickness || 0,
      30, // Z tolerance - allow small Z differences for AI movement
      2   // Buffer - small buffer for smoother AI movement
    );
  }

  // Fallback to simple AABB if collision system not available
  console.warn('[AI COLLISION] Collision system not available, using fallback AABB');
  const entity1Left = entity1.x - (entity1.collisionW || entity1.w) / 2;
  const entity1Right = entity1.x + (entity1.collisionW || entity1.w) / 2;
  const entity1Top = entity1.y - (entity1.collisionH || entity1.h) / 2;
  const entity1Bottom = entity1.y + (entity1.collisionH || entity1.h) / 2;

  const entity2Left = entity2.x - (entity2.collisionW || entity2.w) / 2;
  const entity2Right = entity2.x + (entity2.collisionW || entity2.w) / 2;
  const entity2Top = entity2.y - (entity2.collisionH || entity2.h) / 2;
  const entity2Bottom = entity2.y + (entity2.collisionH || entity2.h) / 2;

  return (
    entity1Left < entity2Right &&
    entity1Right > entity2Left &&
    entity1Top < entity2Bottom &&
    entity1Bottom > entity2Top
  );
}

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
  const groundY = 480; // Same as player ground level

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
    const y = 480; // Ground level

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
    .map(entity => ({
      entity,
      distance: Math.sqrt(
        Math.pow(enemy.x - entity.x, 2) +
        Math.pow(enemy.y - entity.y, 2)
      )
    }))
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
function detectObstacleAhead(enemy, checkDistance = ENEMY_AI_CONSTANTS.OBSTACLE_DETECTION_RANGE) {
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
   GLOBAL EXPORTS (following project pattern)
   ========================= */
window.enemyAIUtils = {
  // Constants
  CONSTANTS: ENEMY_AI_CONSTANTS,

  // Screen boundary functions
  checkScreenBoundaries,
  getScreenBoundaryDirection,

  // Entity collision functions
  detectEntityCollisions,
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

  // BT integration
  detectObstacleAhead
};
