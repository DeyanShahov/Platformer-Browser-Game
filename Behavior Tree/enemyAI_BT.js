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
   COMMAND ENUM
   ========================= */
const COMMAND = {
  IDLE: "idle",
  PATROL: "patrol",
  CHASE: "chase",
  ATTACK: "attack",
  BLOCK: "block",
  EVADE: "evade",
  JUMP: "jump",
  SPECIAL: "special",
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
   ENEMY BEHAVIORS CONFIG
   Унифицирани параметри за всички Rare/Intelligence комбинации
   A–J behaviors: idle, patrol, targetSelection, chase, attack, block, evade, jump, special, meta
   ========================= */
const ENEMY_BEHAVIORS = {
  common: {
    basic: { idle: { duration: 3 }, patrol: { radiusX: 200, speed: 50, radiusY: 0 }, targetSelection: { strategy: "firstHit" }, chase: { radiusX: 300, speed: 80, radiusY: 0 }, attack: { lightChance: 1.0, mediumChance: 0, heavyChance: 0 }, block: { useChance: 0 }, evade: { useChance: 0.1 }, jump: { height: 50 }, special: { available: false }, meta: { awarenessRadius: 150 } },
    normal: { idle: { duration: 1.5 }, patrol: { radiusX: 300, speed: 60, radiusY: 0 }, targetSelection: { strategy: "closest" }, chase: { radiusX: 400, speed: 100, radiusY: 0 }, attack: { lightChance: 0.6, mediumChance: 0.4, heavyChance: 0 }, block: { useChance: 0.2 }, evade: { useChance: 0.3 }, jump: { height: 60 }, special: { available: false }, meta: { awarenessRadius: 200 } },
    advanced: { idle: { duration: 1.0 }, patrol: { radiusX: 400, speed: 80, radiusY: 0 }, targetSelection: { strategy: "dynamic" }, chase: { radiusX: 500, speed: 120, radiusY: 0 }, attack: { lightChance: 0.4, mediumChance: 0.4, heavyChance: 0.2 }, block: { useChance: 0.4 }, evade: { useChance: 0.5 }, jump: { height: 80 }, special: { available: true }, meta: { awarenessRadius: 250 } },
  },
  elite: {
    basic: { idle: { duration: 1.5 }, patrol: { radiusX: 400, speed: 80, radiusY: 0 }, targetSelection: { strategy: "closest" }, chase: { radiusX: 500, speed: 120, radiusY: 0 }, attack: { lightChance: 0.7, mediumChance: 0.3, heavyChance: 0 }, block: { useChance: 0.3 }, evade: { useChance: 0.3 }, jump: { height: 70 }, special: { available: true }, meta: { awarenessRadius: 300 } },
    normal: { idle: { duration: 1.2 }, patrol: { radiusX: 500, speed: 100, radiusY: 0 }, targetSelection: { strategy: "dynamic" }, chase: { radiusX: 600, speed: 150, radiusY: 0 }, attack: { lightChance: 0.4, mediumChance: 0.5, heavyChance: 0.1 }, block: { useChance: 0.5 }, evade: { useChance: 0.5 }, jump: { height: 90 }, special: { available: true }, meta: { awarenessRadius: 350 } },
    advanced: { idle: { duration: 0.8 }, patrol: { radiusX: 600, speed: 120, radiusY: 0 }, targetSelection: { strategy: "dynamic" }, chase: { radiusX: 800, speed: 180, radiusY: 0 }, attack: { lightChance: 0.3, mediumChance: 0.4, heavyChance: 0.3 }, block: { useChance: 0.7 }, evade: { useChance: 0.6 }, jump: { height: 120 }, special: { available: true }, meta: { awarenessRadius: 400 } },
  },
  boss: {
    basic: { idle: { duration: 1.0 }, patrol: { radiusX: 0, speed: 0, radiusY: 0 }, targetSelection: { strategy: "closest" }, chase: { radiusX: 1000, speed: 200, radiusY: 0 }, attack: { lightChance: 0.7, mediumChance: 0.3, heavyChance: 0 }, block: { useChance: 0.5 }, evade: { useChance: 0.3 }, jump: { height: 100 }, special: { available: true }, meta: { awarenessRadius: 500 } },
    normal: { idle: { duration: 0.8 }, patrol: { radiusX: 200, speed: 100, radiusY: 0 }, targetSelection: { strategy: "dynamic" }, chase: { radiusX: 1200, speed: 250, radiusY: 0 }, attack: { lightChance: 0.5, mediumChance: 0.3, heavyChance: 0.2 }, block: { useChance: 0.8 }, evade: { useChance: 0.5 }, jump: { height: 120 }, special: { available: true }, meta: { awarenessRadius: 600 } },
    advanced: { idle: { duration: 0.5 }, patrol: { radiusX: 300, speed: 150, radiusY: 0 }, targetSelection: { strategy: "dynamic" }, chase: { radiusX: 1400, speed: 300, radiusY: 0 }, attack: { lightChance: 0.2, mediumChance: 0.4, heavyChance: 0.4 }, block: { useChance: 1.0 }, evade: { useChance: 0.8 }, jump: { height: 150 }, special: { available: true }, meta: { awarenessRadius: 700 } },
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
const hasTarget = new Condition(ctx => !!ctx.target);
const targetInAttackRange = new Condition(ctx => ctx.target?.distance <= 100);
const targetInChaseRange = new Condition(ctx => ctx.target?.distance <= (ctx.behaviors?.chase?.radiusX || 300));
const canBlock = new Condition(ctx => ctx.capabilities.canBlock && Math.random() < (ctx.intelligence.blockChance || 0));
const canEvade = new Condition(ctx => ctx.capabilities.canEvade && Math.random() < (ctx.intelligence.evadeChance || 0));

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
   SOFT TARGET SELECTION
   ========================= */
function selectTarget(ctx) {
  if (!ctx.targets || ctx.targets.length === 0) return null;

  const awarenessRadius = ctx.behaviors?.meta?.awarenessRadius || 150;

  // Filter targets within awareness radius
  const validTargets = ctx.targets.filter(t => t.distance <= awarenessRadius);

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
  return best;
}

/* =========================
   ENEMY BEHAVIOR TREE FACTORY
   ========================= */
function createEnemyBehaviorTree() {
  return new Selector([
    // Defensive reactions
    new Sequence([canEvade, evadeAction]),
    new Sequence([canBlock, blockAction]),
    // Combat
    new Sequence([hasTarget, targetInAttackRange, attackAction]),
    // Special attack
    createSpecialAttackSubTree(),
    // Movement
    new Sequence([hasTarget, targetInChaseRange, chaseAction]),
    // Default idle/patrol
    patrolAction,
  ]);
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
window.selectTarget = selectTarget;
window.createEnemyBehaviorTree = createEnemyBehaviorTree;
window.BossPhaseManager = BossPhaseManager;
window.tickEnemyAI = tickEnemyAI;
