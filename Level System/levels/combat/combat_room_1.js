/* =========================
   COMBAT ROOM LEVEL 1
   Combat Training - Automatic Transition
   Advanced combat level with trigger-based spawning
   ========================= */

const COMBAT_ROOM_1_CONFIG = {
    id: 'combat_room_1',
    name: 'Combat Training - Automatic Transition',
    type: 'static',
    description: 'Master combat skills with multiple enemies and dynamic spawning',

    // Level boundaries
    boundaries: {
        left: 0,
        right: 1200,
        top: 0,
        bottom: 800,
        zMin: -50,
        zMax: 50
    },

    // Initial entities to spawn
    entities: [
        {
            type: 'enemy',
            enemyType: 'blue_slime',
            level: 1,
            x: 400,
            y: 300,
            z: 0,
            aiBehavior: 'aggressive'
        }
    ],

    // Trigger-based spawning system
    triggers: [
        // Area-based trigger - spawn enemy when player moves right
        {
            id: 'area_spawn_1',
            type: 'area_enter',
            area: {
                x: 600,
                y: 400,
                width: 100,
                height: 100
            },
            entities: [
                {
                    type: 'enemy',
                    enemyType: 'blue_slime',
                    level: 2,
                    x: 800,
                    y: 500,
                    z: 0,
                    aiBehavior: 'aggressive'
                }
            ],
            oneTime: true // Only trigger once
        },

        // Time-based trigger - spawn multiple enemies with random positions
        {
            id: 'time_spawn_1',
            type: 'time_delay',
            delay: 5000,      // First spawn after 5 seconds
            interval: 5000,   // Repeat every 5 seconds
            maxCount: 5,      // Total of 5 spawns
            entities: [
                {
                    type: 'enemy',
                    enemyType: 'blue_slime',
                    level: 1,
                    randomPosition: true, // Random position within level bounds
                    aiBehavior: 'aggressive'
                }
            ]
        }
    ],

    // Completion conditions - defeat 3 enemies total
    completionConditions: [{
        type: 'enemies_defeated',
        targetCount: 3
    }],

    // No exit points - automatic transition
    exitPoints: [],

    // Level progression - automatic transition after completion
    transitionMode: 'automatic',
    nextLevelId: 'boss_level',

    // UI hints
    ui: {
        hints: [
            {
                id: 'combat_hint',
                message: 'Multiple enemies will spawn over time. Stay alert!',
                position: 'top_center',
                duration: 5000,
                trigger: 'on_start'
            }
        ]
    },

    // Difficulty and progression
    difficultyMultiplier: 1.0,
    baseExperience: 100,
    parTime: 120000 // 2 minutes
};

// =========================
// EXPORTS & REGISTRATION
// =========================

// Export for global scope
if (typeof window !== 'undefined') {
    window.COMBAT_ROOM_1_CONFIG = COMBAT_ROOM_1_CONFIG;

    // Deferred auto-registration with LevelRegistry
    function registerCombatRoom1Level() {
        if (window.LevelRegistry && window.LevelData) {
            try {
                window.LevelRegistry.getInstance().registerLevel(new window.LevelData(COMBAT_ROOM_1_CONFIG));
                console.log('[LevelRegistration] Auto-registered combat_room_1');
            } catch (error) {
                console.warn('[LevelRegistration] Failed to auto-register combat_room_1:', error);
                // Retry after a short delay
                setTimeout(registerCombatRoom1Level, 50);
            }
        } else {
            // LevelRegistry not ready yet, retry
            setTimeout(registerCombatRoom1Level, 10);
        }
    }

    // Start registration attempt
    registerCombatRoom1Level();
}
