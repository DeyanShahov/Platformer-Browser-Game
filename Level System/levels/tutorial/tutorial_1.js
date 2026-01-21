/* =========================
   TUTORIAL LEVEL 1
   First Steps - Always Active Door
   Basic tutorial level introducing combat mechanics
   ========================= */

const TUTORIAL_1_CONFIG = {
    id: 'tutorial_1',
    name: 'First Steps - Always Active Door',
    type: 'static',
    description: 'Learn the basics of movement and combat in this introductory level',

    // Level boundaries
    boundaries: {
        left: 0,
        right: 1200,
        top: 0,
        bottom: 800,
        zMin: -50,
        zMax: 50
    },

    // Entities to spawn
    entities: [
        {
            type: 'enemy',
            enemyType: 'blue_slime',
            level: 1,
            x: 600,
            y: 400,
            z: 0,
            aiBehavior: 'passive'
        }
    ],

    // Completion conditions
    completionConditions: [{
        type: 'enemies_defeated',
        targetCount: 1
    }],

    // Exit points
    exitPoints: [{
        id: 'tutorial_exit',
        x: 1100,
        y: 400,
        width: 80,
        height: 80,
        targetLevelId: 'combat_room_1',
        transitionType: 'fade',
        transitionDirection: 'right',
        color: '#00FF00',
        activationMode: 'after_completion'
    }],

    // Level progression
    transitionMode: 'manual_via_exit',
    nextLevelId: 'combat_room_1',

    // Tutorial settings
    tutorial: {
        enabled: true,
        steps: [
            {
                id: 'movement',
                message: 'Use WASD to move around',
                trigger: 'on_start'
            },
            {
                id: 'combat',
                message: 'Defeat the enemy to progress',
                trigger: 'enemy_spotted'
            }
        ]
    },

    // Difficulty and progression
    difficultyMultiplier: 0.5,
    baseExperience: 50,
    parTime: 180000 // 3 minutes
};

// =========================
// EXPORTS & REGISTRATION
// =========================

registerLevelConfig(TUTORIAL_1_CONFIG);
