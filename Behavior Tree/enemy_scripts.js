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
      behaviorTree: createMegaBossPhase1BT()
    },

    phase2: {
      id: "mega_boss_phase2",
      type: SCRIPT_TYPE.FULL,
      name: "Mega Boss - Phase 2",
      behaviors: {
        idle: { duration: 1.0, animation: "boss_idle_enraged" },
        attack: {
          pattern: "multi_charge",
          damage: 55,
          speed: 400,
          range: 300,
          cooldown: 2500
        },
        special: {
          name: "meteor_rain",
          damage: 40,
          radius: 250,
          cooldown: 12000,
          effect: "screen_shake"
        }
      },
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
    behaviors: {
      attack: {
        sequence: [
          { phase: "windup", duration: 800, animation: "charge_windup" },
          { phase: "charge", speed: 400, distance: 200, damage: 35 },
          { phase: "recovery", duration: 1200, vulnerable: true }
        ],
        cooldown: 5000
      },
      chase: {
        speed: 180,
        pattern: "predictive",
        abortDistance: 400
      }
    }
  },

  teleportAssassin: {
    id: "teleport_assassin",
    type: SCRIPT_TYPE.BONUS,
    name: "Teleport Assassin",
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

// TEST SCRIPTS - For development and testing
const TEST_SCRIPTS = {
  // Blue Slime Vertical Ping-Pong Test - IDLE before every movement
  blueSlimeVerticalPingPong: {
    id: "blue_slime_vertical_test",
    type: SCRIPT_TYPE.FULL,
    name: "Blue Slime - Vertical Ping-Pong with IDLE",

    behaviors: {
      pingPongSequence: {
        // Sequence: IDLE → Continuous Movement → IDLE → Continuous Movement → ...
        steps: [
          // Step 1: IDLE преди движение (duration: 'auto' = базирано на характеристики)
          {
            id: 'think_before_move',
            type: 'idle',
            params: { duration: 'auto' }
          },
          // Step 2: Непрекъснато вертикално движение докато не hit boundary/collision
          {
            id: 'move_continuous',
            type: 'move_vertical',
            params: {
              direction: 'auto', // Определя се динамично
              speed: Z_SPEED,
              continuous: true,
              boundaries: { min: Z_MIN - 100, max: Z_MAX + 100 } // Увеличено разстояние 650→850
            }
          }
        ],
        canInterrupt: false,     // Не може да се прекъсне
        idleBetweenSteps: false, // IDLE е част от sequence
        loop: true,              // Повтаря се безкрайно
        dynamicDirection: true   // Направлението се определя динамично
      }
    },

    // Behavior Tree - sequence-aware с dynamic direction logic
    get behaviorTree() {
      return createSequenceBehaviorTree({
        id: 'ping_pong_with_idle',
        sequenceKey: 'pingPongSequence',

        // Custom logic за dynamic direction determination
        onStepStart: function(ctx, stepId) {
          if (stepId === 'move_continuous') {
            // Определи направление базирано на текуща позиция
            const currentZ = ctx.self.z;
            const middle = (Z_MAX + Z_MIN) / 2;

            // Ако сме над средата -> надолу, иначе нагоре
            const direction = currentZ > middle ? 'down' : 'up';

            // Update step params динамично
            const sequence = ctx.behaviors.pingPongSequence;
            const step = sequence.steps.find(s => s.id === stepId);
            step.params.direction = direction;

            console.log(`[PING_PONG] Starting ${direction} from Z=${currentZ.toFixed(1)} (middle: ${middle.toFixed(1)})`);
          }
        }
      });
    }
  },

  // Alternative: Simple Vertical Movement (non-sequence)
  blueSlimeSimpleVertical: {
    id: "blue_slime_simple_vertical",
    type: SCRIPT_TYPE.FULL,
    name: "Blue Slime - Simple Vertical Movement",

    behaviors: {
      verticalMovement: {
        displacement: 50,
        speed: Z_SPEED,
        boundaries: { min: Z_MIN, max: Z_MAX }
      }
    },

    get behaviorTree() {
      return new Selector([
        new Action(ctx => {
          const config = ctx.behaviors.verticalMovement;
          const currentZ = ctx.self.z;

          // Simple up/down logic
          const direction = currentZ > 0 ? "down" : "up";

          return {
            type: direction === "up" ? COMMAND.MOVE_UP : COMMAND.MOVE_DOWN,
            displacement: config.displacement,
            speed: config.speed
          };
        })
      ]);
    }
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

  // Register boss scripts - handle nested structures
  Object.values(BOSS_SCRIPTS).forEach(bossContainer => {
    // Check if this is a direct script (has id) or a container (phase1, phase2, etc.)
    if (bossContainer.id) {
      // Direct script like dragonBoss
      registerScript(bossContainer);
    } else {
      // Container with multiple phases like megaBoss
      Object.values(bossContainer).forEach(script => {
        if (script && script.id) {
          registerScript(script);
        }
      });
    }
  });

  // Register elite scripts
  Object.values(ELITE_SCRIPTS).forEach(registerScript);

  // Register mini-boss scripts
  Object.values(MINI_BOSS_SCRIPTS).forEach(registerScript);

  // Register TEST scripts (for development)
  Object.values(TEST_SCRIPTS).forEach(registerScript);

  console.log(`[SCRIPT_REGISTRY] Complete. ${ENEMY_SCRIPTS.size} scripts registered.`);
}

// Global Exports
window.enemyScripts = {
  SCRIPTS: ENEMY_SCRIPTS,
  BOSS_SCRIPTS,
  ELITE_SCRIPTS,
  MINI_BOSS_SCRIPTS,
  TEST_SCRIPTS,
  UTILITY_SCRIPTS,

  registerScript,
  initializeScriptRegistry,

  // Helper functions
  getScript: (id) => ENEMY_SCRIPTS.get(id),
  hasScript: (id) => ENEMY_SCRIPTS.has(id),
  listScripts: () => Array.from(ENEMY_SCRIPTS.keys())
};

// Placeholder functions for boss behavior trees (to be implemented later)
// These prevent script loading errors during development/testing

function createMegaBossPhase1BT() {
  console.warn('[PLACEHOLDER] createMegaBossPhase1BT() not implemented');
  return new Selector([new Action(() => ({ type: 'idle', duration: 2.0 }))]);
}

function createMegaBossPhase2BT() {
  console.warn('[PLACEHOLDER] createMegaBossPhase2BT() not implemented');
  return new Selector([new Action(() => ({ type: 'idle', duration: 2.0 }))]);
}

function createDragonBossBT() {
  console.warn('[PLACEHOLDER] createDragonBossBT() not implemented');
  return new Selector([new Action(() => ({ type: 'idle', duration: 2.0 }))]);
}

function createTeleportAssassinBT() {
  console.warn('[PLACEHOLDER] createTeleportAssassinBT() not implemented');
  return new Selector([new Action(() => ({ type: 'idle', duration: 1.0 }))]);
}

function createFlameElementalBT() {
  console.warn('[PLACEHOLDER] createFlameElementalBT() not implemented');
  return new Selector([new Action(() => ({ type: 'idle', duration: 1.5 }))]);
}

// Auto-initialize when loaded
initializeScriptRegistry();
