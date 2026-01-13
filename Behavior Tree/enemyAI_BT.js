/* =========================================================
   ENEMY AI FULL BT + UNIVERSAL BOSS PHASES
   Full HD Friendly | Single File | Browser co-op ready
   ========================================================= */

/* =========================
   BT STATUS ENUM
   ========================= */
const BT_STATUS = {
  SUCCESS: "success",
  FAILURE: "failure",
  RUNNING: "running",
};

/* =========================
   BASE NODE
   ========================= */
class BTNode {
  tick(ctx) {
    throw new Error("tick() must be implemented");
  }
}

/* =========================
   COMPOSITE NODES
   ========================= */
class Selector extends BTNode {
  constructor(children = []) {
    super();
    this.children = children;
  }

  tick(ctx) {
    for (const child of this.children) {
      const status = child.tick(ctx);
      if (status !== BT_STATUS.FAILURE) return status;
    }
    return BT_STATUS.FAILURE;
  }
}

class Sequence extends BTNode {
  constructor(children = []) {
    super();
    this.children = children;
    this.currentIndex = 0;
  }

  tick(ctx) {
    while (this.currentIndex < this.children.length) {
      const status = this.children[this.currentIndex].tick(ctx);
      if (status === BT_STATUS.RUNNING) return BT_STATUS.RUNNING;
      if (status === BT_STATUS.FAILURE) {
        this.currentIndex = 0;
        return BT_STATUS.FAILURE;
      }
      this.currentIndex++;
    }
    this.currentIndex = 0;
    return BT_STATUS.SUCCESS;
  }
}

/* =========================
   DECORATORS
   ========================= */
class Cooldown extends BTNode {
  constructor(child, cooldownTime) {
    super();
    this.child = child;
    this.cooldownTime = cooldownTime;
    this.lastTime = 0;
  }

  tick(ctx) {
    const now = performance.now();
    if (now - this.lastTime < this.cooldownTime) return BT_STATUS.FAILURE;
    const status = this.child.tick(ctx);
    if (status === BT_STATUS.SUCCESS) this.lastTime = now;
    return status;
  }
}

/* =========================
   LEAF NODES
   ========================= */
class Condition extends BTNode {
  constructor(checkFn) {
    super();
    this.checkFn = checkFn;
  }

  tick(ctx) {
    return this.checkFn(ctx) ? BT_STATUS.SUCCESS : BT_STATUS.FAILURE;
  }
}

class Action extends BTNode {
  constructor(actionFn) {
    super();
    this.actionFn = actionFn;
  }

  tick(ctx) {
    ctx.command = this.actionFn(ctx);
    return BT_STATUS.SUCCESS;
  }
}

/* =========================
   COMMAND ENUM - Extended
   ========================= */
const COMMAND = {
  // Basic commands
  IDLE: "idle",
  PATROL: "patrol",
  CHASE: "chase",
  ATTACK: "attack",
  BLOCK: "block",
  EVADE: "evade",
  JUMP: "jump",
  SPECIAL: "special",

  // Patrol variants
  PATROL_LEFT: "patrol_left",
  PATROL_RIGHT: "patrol_right",
  REVERSE_PATROL: "reverse_patrol",
  PATROL_TO_IDLE: "patrol_to_idle",
  PATROL_TO_CHASE: "patrol_to_chase",

  // Vertical movement commands
  MOVE_UP: "move_up",
  MOVE_DOWN: "move_down",
  VERTICAL_MOVEMENT: "vertical_movement",

  // Script system commands (PHASE 3)
  SCRIPT_COMMAND: "script_command",

  // Contextual commands
  SPAWN_IDLE: "spawn_idle",
};

/* =========================
   ATTACK TYPE ENUM
   ========================= */
const ATTACK_TYPE = {
  LIGHT: "light",
  MEDIUM: "medium",
  HEAVY: "heavy",
};

/* =========================
   ENEMY BEHAVIORS CONFIG - Rarity/Intelligence Based
   Универсални behavior patterns базирани на rarity и intelligence level
   Всички enemy типове използват тези конфигурации
   ========================= */
const ENEMY_BEHAVIORS = {
  common: {
    basic: {
      idle: { duration: 3 },
      patrol: {
        radiusX: 200, speed: 50, radiusY: 0,
        directionLogic: 'constraint_based', // Use physical constraints
        interruptHandling: { onBoundary: 'reverse', onEntity: 'idle', onPlayer: 'chase' }
      },
      targetSelection: { strategy: "firstHit" },
      chase: { radiusX: 200, speed: 80, radiusY: 0 },
      attack: { lightChance: 1.0, mediumChance: 0, heavyChance: 0 },
      block: { useChance: 0 }, evade: { useChance: 0.1 },
      jump: { height: 50 }, special: { available: false },
      meta: { awarenessRadius: 300 }
    },
    normal: {
      idle: { duration: 1.5 },
      patrol: {
        radiusX: 300, speed: 60, radiusY: 0,
        directionLogic: 'constraint_based',
        interruptHandling: { onBoundary: 'reverse', onEntity: 'idle', onPlayer: 'chase' }
      },
      targetSelection: { strategy: "closest" },
      chase: { radiusX: 400, speed: 100, radiusY: 0 },
      attack: { lightChance: 0.6, mediumChance: 0.4, heavyChance: 0 },
      block: { useChance: 0.2 }, evade: { useChance: 0.3 },
      jump: { height: 60 }, special: { available: false },
      meta: { awarenessRadius: 200 }
    },
    advanced: {
      idle: { duration: 1.0 },
      patrol: {
        radiusX: 400, speed: 80, radiusY: 0,
        directionLogic: 'constraint_based',
        interruptHandling: { onBoundary: 'reverse', onEntity: 'idle', onPlayer: 'chase' }
      },
      targetSelection: { strategy: "dynamic" },
      chase: { radiusX: 500, speed: 120, radiusY: 0 },
      attack: { lightChance: 0.4, mediumChance: 0.4, heavyChance: 0.2 },
      block: { useChance: 0.4 }, evade: { useChance: 0.5 },
      jump: { height: 80 }, special: { available: true },
      meta: { awarenessRadius: 250 }
    },
  },
  elite: {
    basic: {
      idle: { duration: 1.5 },
      patrol: {
        radiusX: 400, speed: 80, radiusY: 0,
        directionLogic: 'constraint_based',
        interruptHandling: { onBoundary: 'reverse', onEntity: 'idle', onPlayer: 'chase' }
      },
      targetSelection: { strategy: "closest" },
      chase: { radiusX: 500, speed: 120, radiusY: 0 },
      attack: { lightChance: 0.7, mediumChance: 0.3, heavyChance: 0 },
      block: { useChance: 0.3 }, evade: { useChance: 0.3 },
      jump: { height: 70 }, special: { available: true },
      meta: { awarenessRadius: 300 }
    },
    normal: {
      idle: { duration: 1.2 },
      patrol: {
        radiusX: 500, speed: 100, radiusY: 0,
        directionLogic: 'constraint_based',
        interruptHandling: { onBoundary: 'reverse', onEntity: 'idle', onPlayer: 'chase' }
      },
      targetSelection: { strategy: "dynamic" },
      chase: { radiusX: 600, speed: 150, radiusY: 0 },
      attack: { lightChance: 0.4, mediumChance: 0.5, heavyChance: 0.1 },
      block: { useChance: 0.5 }, evade: { useChance: 0.5 },
      jump: { height: 90 }, special: { available: true },
      meta: { awarenessRadius: 350 }
    },
    advanced: {
      idle: { duration: 0.8 },
      patrol: {
        radiusX: 600, speed: 120, radiusY: 0,
        directionLogic: 'constraint_based',
        interruptHandling: { onBoundary: 'reverse', onEntity: 'idle', onPlayer: 'chase' }
      },
      targetSelection: { strategy: "dynamic" },
      chase: { radiusX: 800, speed: 180, radiusY: 0 },
      attack: { lightChance: 0.3, mediumChance: 0.4, heavyChance: 0.3 },
      block: { useChance: 0.7 }, evade: { useChance: 0.6 },
      jump: { height: 120 }, special: { available: true },
      meta: { awarenessRadius: 400 }
    },
  },
  boss: {
    basic: {
      idle: { duration: 1.0 },
      patrol: {
        radiusX: 0, speed: 0, radiusY: 0, // Bosses don't patrol normally
        directionLogic: 'constraint_based',
        interruptHandling: { onBoundary: 'idle', onEntity: 'idle', onPlayer: 'chase' }
      },
      targetSelection: { strategy: "closest" },
      chase: { radiusX: 1000, speed: 200, radiusY: 0 },
      attack: { lightChance: 0.7, mediumChance: 0.3, heavyChance: 0 },
      block: { useChance: 0.5 }, evade: { useChance: 0.3 },
      jump: { height: 100 }, special: { available: true },
      meta: { awarenessRadius: 500 }
    },
    normal: {
      idle: { duration: 0.8 },
      patrol: {
        radiusX: 200, speed: 100, radiusY: 0,
        directionLogic: 'constraint_based',
        interruptHandling: { onBoundary: 'idle', onEntity: 'idle', onPlayer: 'chase' }
      },
      targetSelection: { strategy: "dynamic" },
      chase: { radiusX: 1200, speed: 250, radiusY: 0 },
      attack: { lightChance: 0.5, mediumChance: 0.3, heavyChance: 0.2 },
      block: { useChance: 0.8 }, evade: { useChance: 0.5 },
      jump: { height: 120 }, special: { available: true },
      meta: { awarenessRadius: 600 }
    },
    advanced: {
      idle: { duration: 0.5 },
      patrol: {
        radiusX: 300, speed: 150, radiusY: 0,
        directionLogic: 'constraint_based',
        interruptHandling: { onBoundary: 'idle', onEntity: 'idle', onPlayer: 'chase' }
      },
      targetSelection: { strategy: "dynamic" },
      chase: { radiusX: 1400, speed: 300, radiusY: 0 },
      attack: { lightChance: 0.2, mediumChance: 0.4, heavyChance: 0.4 },
      block: { useChance: 1.0 }, evade: { useChance: 0.8 },
      jump: { height: 150 }, special: { available: true },
      meta: { awarenessRadius: 700 }
    },
  },
};

/* =========================
   UNIVERSAL BOSS PHASES
   Всички босове ще могат да използват тези фази
   ========================= */
const bossPhases = [
  {
    name: "Phase 1",
    hpThreshold: 1.0,
    capabilities: { canBlock: false, canEvade: false },
    attackProfile: createAttackProfile([ATTACK_TYPE.LIGHT]),
    intelligence: { blockChance: 0, evadeChance: 0.1, aggression: 0.3 },
    specialActive: false,
  },
  {
    name: "Phase 2",
    hpThreshold: 0.66,
    capabilities: { canBlock: true, canEvade: true },
    attackProfile: createAttackProfile([ATTACK_TYPE.LIGHT, ATTACK_TYPE.MEDIUM]),
    intelligence: { blockChance: 0.5, evadeChance: 0.4, aggression: 0.6 },
    specialActive: true,
  },
  {
    name: "Phase 3",
    hpThreshold: 0.33,
    capabilities: { canBlock: true, canEvade: true },
    attackProfile: createAttackProfile([ATTACK_TYPE.LIGHT, ATTACK_TYPE.MEDIUM, ATTACK_TYPE.HEAVY]),
    intelligence: { blockChance: 0.9, evadeChance: 0.8, aggression: 1.0 },
    specialActive: true,
  },
];

/* =========================
   ATTACK PROFILE UTILITY
   ========================= */
function createAttackProfile(allowedAttacks) {
  return {
    chooseAttack(ctx) {
      let best = allowedAttacks[0];
      let bestScore = -Infinity;
      for (const attack of allowedAttacks) {
        let score = 0;
        if (attack === ATTACK_TYPE.LIGHT) score += 10;
        if (attack === ATTACK_TYPE.MEDIUM) score += 20;
        if (attack === ATTACK_TYPE.HEAVY) score += 30;
        if (score > bestScore) {
          bestScore = score;
          best = attack;
        }
      }
      return best;
    },
  };
}

/* =========================
   REUSABLE CONDITIONS
   ========================= */
const hasTarget = new Condition(ctx => {
  const result = !!ctx.target;
  // console.log(`[BT_CONDITION] hasTarget: ${result}, target distance: ${ctx.target?.distance?.toFixed(1) || 'none'}`);
  return result;
});

const targetInAttackRange = new Condition(ctx => {
  const result = ctx.target?.distance <= 100;
  // console.log(`[BT_CONDITION] targetInAttackRange: ${result}, distance: ${ctx.target?.distance?.toFixed(1) || 'none'}`);
  return result;
});

const targetInChaseRange = new Condition(ctx => {
  const result = ctx.target?.distance <= (ctx.behaviors?.chase?.radiusX || 300);
  // console.log(`[BT_CONDITION] targetInChaseRange: ${result}, distance: ${ctx.target?.distance?.toFixed(1) || 'none'}, range: ${ctx.behaviors?.chase?.radiusX || 300}`);
  return result;
});
const canBlock = new Condition(ctx => ctx.capabilities.canBlock && Math.random() < (ctx.intelligence.blockChance || 0));
const canEvade = new Condition(ctx => ctx.capabilities.canEvade && Math.random() < (ctx.intelligence.evadeChance || 0));

// Context-aware patrol conditions
const patrolInterrupted = new Condition(ctx =>
  ctx.consultationContext?.reason?.includes('patrol') ||
  ctx.consultationContext?.reason?.includes('boundary') ||
  ctx.consultationContext?.reason?.includes('entity') ||
  ctx.consultationContext?.reason?.includes('distance')
);

const patrolInterruptedByBoundary = new Condition(ctx =>
  ctx.consultationContext?.reason?.includes('boundary')
);

const patrolInterruptedByEntity = new Condition(ctx =>
  ctx.consultationContext?.reason?.includes('entity')
);

const patrolInterruptedByDistance = new Condition(ctx =>
  ctx.consultationContext?.reason?.includes('distance')
);

const patrolInterruptedByPlayer = new Condition(ctx =>
  ctx.consultationContext?.reason?.includes('player')
);

// Attack completion condition
const attackCompleted = new Condition(ctx =>
  ctx.consultationContext?.reason === 'attack_complete'
);

// Situation-aware conditions
const afterAttackCondition = new Condition(ctx =>
  ctx.consultationContext?.reason === 'attack_complete' ||
  ctx.consultationContext?.reason === 'attack_timeout'
);

const boundaryCollisionCondition = new Condition(ctx =>
  ctx.consultationContext?.reason === 'screen_boundary' ||
  ctx.consultationContext?.reason === 'entity_collision'
);

const playerDetectionCondition = new Condition(ctx =>
  ctx.consultationContext?.reason === 'player_detected' ||
  ctx.consultationContext?.reason === 'player_in_range'
);

// NEW: Player collision condition - highest priority for immediate attack
const playerCollisionCondition = new Condition(ctx =>
  ctx.consultationContext?.reason === 'player_collision'
);

const canPatrolLeft = new Condition(ctx =>
  !ctx.behaviorConstraints?.blocked?.has('patrol_left')
);

const canPatrolRight = new Condition(ctx =>
  !ctx.behaviorConstraints?.blocked?.has('patrol_right')
);

const idleTimeout = new Condition(ctx =>
  ctx.consultationContext?.reason === 'idle_timeout' ||
  ctx.consultationContext?.reason === 'spawn_idle_timeout'
);

/* =========================
   BASIC ACTIONS
   ========================= */
const idleAction = new Action(() => ({ type: COMMAND.IDLE }));
const patrolAction = new Action(() => ({ type: COMMAND.PATROL }));
const chaseAction = new Action(() => ({ type: COMMAND.CHASE }));
const blockAction = new Action(() => ({ type: COMMAND.BLOCK }));
const evadeAction = new Action(() => ({ type: COMMAND.EVADE }));
const attackAction = new Action(ctx => ({ type: COMMAND.ATTACK, attackType: ctx.attackProfile.chooseAttack(ctx) }));

/* =========================
   SPECIAL ATTACK SUBTREE
   ========================= */
function createSpecialAttackSubTree(ctx) {
  return new Sequence([
    new Condition(c => c.behaviors.special.available),
    new Cooldown(new Action(() => ({ type: COMMAND.SPECIAL })), 5000),
  ]);
}

/* =========================
   PATROL DECISION SUBTREE
   Universal patrol behavior using rarity/intelligence config
   ========================= */
function createPatrolDecisionSubtree(config) {
  if (!config?.patrol) {
    // Fallback for configs without patrol settings
    return new Selector([
      new Sequence([hasTarget, chaseAction]),
      patrolAction
    ]);
  }

  return new Selector([
    // Priority 1: Interrupted patrol - handle based on interruption reason
    new Sequence([
      patrolInterrupted,
      new Selector([
        // Player detected during patrol - chase immediately
        new Sequence([patrolInterruptedByPlayer, new Action(() => ({ type: COMMAND.CHASE }))]),

        // Hit boundary - go to idle (thinking phase)
        new Sequence([patrolInterruptedByBoundary, new Action(() => ({ type: COMMAND.IDLE, duration: 0.5 }))]),

        // Hit entity - idle briefly
        new Sequence([patrolInterruptedByEntity, new Action(() => ({ type: COMMAND.IDLE, duration: 1.0 }))]),

        // Hit max distance - reverse patrol
        new Sequence([patrolInterruptedByDistance, new Action(() => ({ type: COMMAND.REVERSE_PATROL }))]),

        // Unknown interruption - idle
        new Action(() => ({ type: COMMAND.IDLE, duration: 0.5 }))
      ])
    ]),

    // Priority 2: Idle timeout (spawn or regular) - transition to patrol
    new Sequence([
      idleTimeout,
      new Sequence([
        // Ensure constraints are up-to-date before patrol decision
        new Condition(ctx => {
          // Force constraint refresh by calling getBehaviorConstraints
          const freshConstraints = window.getBehaviorConstraints ?
            window.getBehaviorConstraints(ctx.self) : null;
          if (freshConstraints) {
            ctx.behaviorConstraints = freshConstraints;
            console.log(`[BT_CONSTRAINTS] Refreshed constraints for patrol decision:`, {
              blocked: Array.from(freshConstraints.blocked),
              allowed: Array.from(freshConstraints.allowed)
            });
          }
          return true; // Always succeed, just refresh constraints
        }),
        new Action(ctx => generateContextualPatrolCommand(ctx, config))
      ])
    ]),

    // Priority 3: Normal patrol - choose direction based on constraints
    new Sequence([
      new Condition(ctx => !ctx.target), // Only patrol if no target
      new Action(ctx => generateContextualPatrolCommand(ctx, config))
    ]),

    // Fallback - basic patrol
    patrolAction
  ]);
}

/* =========================
   DYNAMIC COMMAND GENERATION
   Generates contextual commands based on constraints and config
   ========================= */
function generateContextualPatrolCommand(ctx, config) {
  const constraints = ctx.behaviorConstraints;

  if (!config?.patrol) {
    return { type: COMMAND.PATROL };
  }

  const directionLogic = config.patrol.directionLogic || 'random';

  // Constraint-based direction selection
  if (directionLogic === 'constraint_based') {
    const canGoLeft = !constraints?.blocked?.has('patrol_left');
    const canGoRight = !constraints?.blocked?.has('patrol_right');

    if (canGoLeft && !canGoRight) {
      // Only left available
      return { type: COMMAND.PATROL_LEFT };
    } else if (canGoRight && !canGoLeft) {
      // Only right available
      return { type: COMMAND.PATROL_RIGHT };
    } else if (canGoLeft && canGoRight) {
      // Both available - random choice
      return Math.random() > 0.5 ?
        { type: COMMAND.PATROL_LEFT } :
        { type: COMMAND.PATROL_RIGHT };
    } else {
      // Neither available - idle
      return { type: COMMAND.IDLE, duration: 1.0 };
    }
  }

  // Random direction selection (fallback)
  if (directionLogic === 'random') {
    return Math.random() > 0.5 ?
      { type: COMMAND.PATROL_LEFT } :
      { type: COMMAND.PATROL_RIGHT };
  }

  // Default patrol
  return { type: COMMAND.PATROL };
}

/* =========================
   SOFT TARGET SELECTION
   Now uses centralized enemy AI utilities for consistency
   ========================= */
function selectTarget(ctx) {
  // console.log(`[SELECT_TARGET_DEBUG] === SELECT TARGET DEBUG ===`);
  // console.log(`[SELECT_TARGET_DEBUG] ctx.self exists:`, !!ctx.self);
  // console.log(`[SELECT_TARGET_DEBUG] ctx.targets exists:`, !!ctx.targets);
  // console.log(`[SELECT_TARGET_DEBUG] ctx.targets length:`, ctx.targets?.length || 0);

  if (!ctx.self || !ctx.targets || ctx.targets.length === 0) {
    // console.log(`[SELECT_TARGET] No targets available - self: ${!!ctx.self}, targets: ${ctx.targets?.length || 0}`);
    return null;
  }

  // console.log(`[SELECT_TARGET_DEBUG] ctx.self position:`, { x: ctx.self.x?.toFixed(1), y: ctx.self.y?.toFixed(1), z: ctx.self.z?.toFixed(1) });

  const awarenessRadius = ctx.behaviors?.meta?.awarenessRadius || 150;
  // console.log(`[SELECT_TARGET_DEBUG] awarenessRadius: ${awarenessRadius}`);
  // console.log(`[SELECT_TARGET_DEBUG] ctx.behaviors?.meta:`, ctx.behaviors?.meta);

  // console.log(`[SELECT_TARGET_DEBUG] Raw ctx.targets:`, ctx.targets);
  // console.log(`[SELECT_TARGET_DEBUG] Target distances:`, ctx.targets.map(t => ({
  //   distance: t.distance,
  //   hasEntity: !!t.entity,
  //   entityType: t.entity?.entityType
  // })));

  // Use centralized getEntitiesInRange utility for consistency
  if (window.enemyAIUtils && window.enemyAIUtils.getEntitiesInRange) {
    // console.log(`[SELECT_TARGET_DEBUG] Using enemyAIUtils.getEntitiesInRange`);

    // Convert targets array to entities array format expected by utility
    const targetEntities = ctx.targets
      .map(t => {
        // console.log(`[SELECT_TARGET_DEBUG] Processing target:`, {
        //   original: t,
        //   entity: t.entity || t,
        //   distance: t.distance,
        //   hasEntity: !!t.entity,
        //   entityType: t.entity?.entityType
        // });

        // FIXED: Properly extract entity and validate it has required properties
        const entity = t.entity || t;
        if (!entity || entity.x === undefined || entity.y === undefined) {
          // console.log(`[SELECT_TARGET_DEBUG] Invalid entity found, skipping:`, entity);
          return null;
        }

        return entity;
      })
      .filter(entity => entity !== null); // Remove invalid entities

    // console.log(`[SELECT_TARGET_DEBUG] targetEntities array:`, targetEntities);
    // console.log(`[SELECT_TARGET_DEBUG] targetEntities positions:`, targetEntities.map(e => ({
    //   x: e?.x?.toFixed(1),
    //   y: e?.y?.toFixed(1),
    //   z: e?.z?.toFixed(1),
    //   entityType: e?.entityType
    // })));

    // Get entities within range using utility
    // console.log(`[SELECT_TARGET_DEBUG] Calling getEntitiesInRange with radius: ${awarenessRadius}`);
    const entitiesInRange = window.enemyAIUtils.getEntitiesInRange(ctx.self, targetEntities, awarenessRadius);
    // console.log(`[SELECT_TARGET_DEBUG] getEntitiesInRange returned:`, entitiesInRange);
    // console.log(`[SELECT_TARGET] Entities in range (${awarenessRadius}px): ${entitiesInRange.length}`);

    if (entitiesInRange.length === 0) {
      // console.log(`[SELECT_TARGET_DEBUG] No entities in range, returning null`);
      return null;
    }

    // Select best target from valid ones
    let best = entitiesInRange[0];
    let bestScore = -Infinity;
    for (const t of entitiesInRange) {
      // Calculate score based on distance and health
      let score = (1000 - t.distance) + (100 - (t.entity?.hpPercent || t.hpPercent || 100));
      // console.log(`[SELECT_TARGET_DEBUG] Target score for ${t.entity?.entityType || 'unknown'}: distance=${t.distance.toFixed(1)}, score=${score.toFixed(1)}`);
      if (score > bestScore) {
        bestScore = score;
        best = t;
      }
    }
    // console.log(`[SELECT_TARGET] Selected target at distance: ${best.distance.toFixed(1)}`);
    return best;
  } else {
    // console.log(`[SELECT_TARGET_DEBUG] enemyAIUtils.getEntitiesInRange not available, using fallback`);

    // Fallback to original implementation
    const validTargets = ctx.targets.filter(t => t.distance <= awarenessRadius);
    // console.log(`[SELECT_TARGET_DEBUG] Fallback validTargets:`, validTargets);
    // console.log(`[SELECT_TARGET] Valid targets within ${awarenessRadius}px: ${validTargets.length}`);

    if (validTargets.length === 0) return null;

    // Select best target from valid ones
    let best = validTargets[0];
    let bestScore = -Infinity;
    for (const t of validTargets) {
      let score = (1000 - t.distance) + (100 - t.hpPercent);
      if (score > bestScore) {
        bestScore = score;
        best = t;
      }
    }
    // console.log(`[SELECT_TARGET] Selected target at distance: ${best.distance.toFixed(1)}`);
    return best;
  }
}

/* =========================
   VERTICAL MOVEMENT SUBTREE
   Handles vertical movement decisions with boundary checking
   ========================= */
function createVerticalMovementSubtree(config) {
  return new Sequence([
    // Check if vertical movement is available in constraints
    new Condition(ctx => {
      const constraints = ctx.behaviorConstraints;
      return constraints?.allowed?.has('move_up') || constraints?.allowed?.has('move_down');
    }),
    // Randomly choose between up/down, respecting constraints
    new Action(ctx => {
      const constraints = ctx.behaviorConstraints;
      const canMoveUp = constraints?.allowed?.has('move_up');
      const canMoveDown = constraints?.allowed?.has('move_down');

      if (canMoveUp && canMoveDown) {
        // Both directions available - random choice
        return Math.random() > 0.5 ?
          { type: COMMAND.MOVE_UP } :
          { type: COMMAND.MOVE_DOWN };
      } else if (canMoveUp) {
        // Only up available
        return { type: COMMAND.MOVE_UP };
      } else if (canMoveDown) {
        // Only down available
        return { type: COMMAND.MOVE_DOWN };
      } else {
        // No vertical movement possible
        return { type: COMMAND.IDLE, duration: 0.5 };
      }
    }),
  ]);
}

/* =========================
   ENEMY BEHAVIOR TREE FACTORY - Universal
   Creates BT based on rarity/intelligence configuration
   ========================= */
function createUniversalEnemyBehaviorTree(rarity, intelligence) {
  const config = ENEMY_BEHAVIORS[rarity]?.[intelligence];

  if (!config) {
    console.warn(`[BT_FACTORY] Unknown rarity/intelligence: ${rarity}/${intelligence}, using fallback BT`);
    return createFallbackBehaviorTree();
  }

  console.log(`[BT_FACTORY] Creating BT for ${rarity}/${intelligence}`);

  return new Selector([
    // Priority 1: Defensive reactions (always available)
    new Sequence([canEvade, evadeAction]),
    new Sequence([canBlock, blockAction]),

    // Priority 2: Combat behaviors
    new Sequence([hasTarget, targetInAttackRange, new Cooldown(attackAction, 1500)]), // 1.5 second cooldown between attacks
    new Sequence([hasTarget, targetInChaseRange, chaseAction]),

    // Priority 3: Special attacks (if available)
    createSpecialAttackSubTree(),

    // Priority 4: Vertical movement (random up/down within boundaries)
    createVerticalMovementSubtree(config),

    // Priority 5: Intelligent patrol behavior (context-aware)
    createPatrolDecisionSubtree(config),

    // Fallback - basic patrol
    patrolAction,
  ]);
}

/* =========================
   FALLBACK BT FACTORY
   For backwards compatibility with unknown enemy types
   ========================= */
function createFallbackBehaviorTree() {
  return new Selector([
    // Basic behaviors for unknown enemy types
    new Sequence([canEvade, evadeAction]),
    new Sequence([canBlock, blockAction]),
    new Sequence([hasTarget, targetInAttackRange, attackAction]),
    new Sequence([hasTarget, targetInChaseRange, chaseAction]),
    createSpecialAttackSubTree(),
    patrolAction,
  ]);
}

/* =========================
   LEGACY BT FACTORY (backwards compatibility)
   ========================= */
function createEnemyBehaviorTree() {
  console.warn('[BT_FACTORY] Using legacy createEnemyBehaviorTree(), consider using createUniversalEnemyBehaviorTree(enemyType)');
  return createFallbackBehaviorTree();
}

/* =========================
   BOSS PHASE MANAGER
   ========================= */
class BossPhaseManager {
  constructor(phases = bossPhases) {
    this.phases = phases.sort((a, b) => b.hpThreshold - a.hpThreshold);
    this.currentPhase = null;
  }

  update(ctx) {
    const hpPercent = ctx.self.hp / ctx.self.maxHp;
    for (const phase of this.phases) {
      if (hpPercent <= phase.hpThreshold) {
        if (this.currentPhase !== phase) {
          this.applyPhase(ctx, phase);
          this.currentPhase = phase;
        }
        break;
      }
    }
  }

  applyPhase(ctx, phase) {
    ctx.capabilities = { ...phase.capabilities };
    ctx.attackProfile = phase.attackProfile;
    ctx.intelligence = { ...phase.intelligence };
    ctx.phaseSpecialAvailable = !!phase.specialActive;
    if (phase.onEnter) phase.onEnter(ctx);
  }
}

/* =========================
   PUBLIC API
   ========================= */
function tickEnemyAI(tree, context) {
  context.command = null;
  context.target = selectTarget(context);
  tree.tick(context);
  return context.command;
}

/* =========================
   GLOBAL EXPORTS (following project pattern)
   ========================= */
window.BT_STATUS = BT_STATUS;
window.BTNode = BTNode;
window.Selector = Selector;
window.Sequence = Sequence;
window.Condition = Condition;
window.Action = Action;
window.Cooldown = Cooldown;
window.COMMAND = COMMAND;
window.ATTACK_TYPE = ATTACK_TYPE;
window.ENEMY_BEHAVIORS = ENEMY_BEHAVIORS;
window.bossPhases = bossPhases;
window.createAttackProfile = createAttackProfile;
window.hasTarget = hasTarget;
window.targetInAttackRange = targetInAttackRange;
window.canBlock = canBlock;
window.canEvade = canEvade;
window.idleAction = idleAction;
window.patrolAction = patrolAction;
window.chaseAction = chaseAction;
window.blockAction = blockAction;
window.evadeAction = evadeAction;
window.attackAction = attackAction;
window.createSpecialAttackSubTree = createSpecialAttackSubTree;
window.createPatrolDecisionSubtree = createPatrolDecisionSubtree;
window.generateContextualPatrolCommand = generateContextualPatrolCommand;
window.selectTarget = selectTarget;
window.createEnemyBehaviorTree = createEnemyBehaviorTree;
window.createUniversalEnemyBehaviorTree = createUniversalEnemyBehaviorTree;
window.createFallbackBehaviorTree = createFallbackBehaviorTree;
window.BossPhaseManager = BossPhaseManager;
window.tickEnemyAI = tickEnemyAI;

/* =========================
   SCRIPT-AWARE BT NODES (PHASE 3)
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
function createScriptEnabledBT(rarity, intelligence, scriptConfig = null) {
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
window.createScriptEnabledBT = createScriptEnabledBT;
window.ScriptNode = ScriptNode;
window.ScriptSelector = ScriptSelector;
window.mergeCommands = mergeCommands;
