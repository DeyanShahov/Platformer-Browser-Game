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
  // Blue Slime Vertical Ping-Pong Test
  blueSlimeVerticalPingPong: {
    id: "blue_slime_vertical_test",
    type: SCRIPT_TYPE.FULL,
    name: "Blue Slime - Vertical Ping-Pong Test",

    behaviors: {
      verticalPingPong: {
        // Movement parameters
        displacement: 50,           // Units to move each time (exactly 50 as requested)
        speed: Z_SPEED,            // Use player movement speed (200 units/sec)

        // Boundary settings
        boundaries: {
          min: Z_MIN,             // -450 (bottom limit)
          max: Z_MAX              // 200 (top limit)
        },

        // Movement logic
        directionLogic: "boundary_based",  // Auto-switch at boundaries
        hysteresis: 10,           // Prevent rapid switching near boundaries
      }
    },

    // Behavior Tree - single action that determines movement direction
    behaviorTree: new Selector([
      new Action(ctx => {
        const config = ctx.behaviors.verticalPingPong;
        const currentZ = ctx.self.z;

        // Calculate effective boundaries with displacement
        const topBoundary = config.boundaries.max - config.displacement;
        const bottomBoundary = config.boundaries.min + config.displacement;

        // Determine movement direction based on current position
        let direction;

        if (currentZ >= topBoundary) {
          // At or near top boundary - move down
          direction = "down";
          console.log(`[VERTICAL_TEST] At top boundary (${currentZ.toFixed(1)}), switching to DOWN`);
        } else if (currentZ <= bottomBoundary) {
          // At or near bottom boundary - move up
          direction = "up";
          console.log(`[VERTICAL_TEST] At bottom boundary (${currentZ.toFixed(1)}), switching to UP`);
        } else {
          // In middle zone - continue current direction or choose based on position
          const middlePoint = (config.boundaries.max + config.boundaries.min) / 2;
          direction = currentZ > middlePoint ? "down" : "up";
          console.log(`[VERTICAL_TEST] In middle zone (${currentZ.toFixed(1)}), continuing ${direction.toUpperCase()}`);
        }

        // Return movement command
        return {
          type: direction === "up" ? COMMAND.MOVE_UP : COMMAND.MOVE_DOWN,
          displacement: config.displacement,
          speed: config.speed,
          boundaries: config.boundaries
        };
      })
    ])
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

// Auto-initialize when loaded
initializeScriptRegistry();
