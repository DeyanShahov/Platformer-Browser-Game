/* =========================
   BOSS LEVEL
   Boss Level - Conditional Portal
   Challenging boss fight with conditional exit activation
   ========================= */

const BOSS_LEVEL_CONFIG = {
    id: 'boss_level',
    name: 'Boss Level - Conditional Portal',
    type: 'static',
    description: 'Face the ultimate challenge in this boss battle',

    // Level boundaries
    boundaries: {
        left: 0,
        right: 1200,
        top: 0,
        bottom: 800,
        zMin: -50,
        zMax: 50
    },

    // Boss entities
    entities: [
        {
            type: 'enemy',
            enemyType: 'blue_slime',
            level: 3, // Higher level boss
            x: 600,
            y: 300,
            z: 0,
            aiBehavior: 'boss',
            bossType: 'elite_slime'
        }
    ],

    // No triggers for boss level - straightforward fight
    triggers: [],

    // Completion conditions - defeat the boss
    completionConditions: [{
        type: 'enemies_defeated',
        targetCount: 1
    }],

    // Conditional exit portal - activates after boss defeat
    exitPoints: [{
        id: 'boss_portal',
        x: 600,
        y: 500,
        width: 100,
        height: 100,
        targetLevelId: 'end_game',
        transitionType: 'fade',
        transitionDirection: 'up',
        color: '#FF00FF',
        activationMode: 'after_completion', // Portal appears after boss defeat
        visualEffect: 'portal_swirl',
        soundEffect: 'portal_activate'
    }],

    // Level progression - manual exit through portal
    transitionMode: 'manual_via_exit',
    nextLevelId: 'end_game',

    // Boss-specific UI and effects
    ui: {
        bossBar: {
            enabled: true,
            position: 'top_center',
            showHealth: true,
            showName: true
        },
        hints: [
            {
                id: 'boss_warning',
                message: '⚠️ BOSS FIGHT ⚠️\nDefeat the elite enemy to unlock the portal!',
                position: 'center',
                duration: 8000,
                trigger: 'on_start'
            }
        ]
    },

    // Background effects for boss atmosphere
    ambientEffects: {
        fog: {
            enabled: true,
            color: '#330033',
            density: 0.3
        },
        particles: {
            enabled: true,
            type: 'energy_sparks',
            count: 50
        }
    },

    // Boss music
    musicTrack: 'boss_theme',

    // High difficulty and rewards
    difficultyMultiplier: 2.0,
    baseExperience: 500,
    parTime: 180000, // 3 minutes

    // Boss-specific rewards
    rewards: {
        experience: 500,
        items: [
            {
                id: 'boss_token',
                name: 'Boss Victory Token',
                type: 'collectible',
                rarity: 'rare'
            }
        ],
        unlocks: [
            'new_skill_tree_branch',
            'elite_equipment'
        ]
    }
};

// =========================
// EXPORTS & REGISTRATION
// =========================

// Export for global scope
if (typeof window !== 'undefined') {
    window.BOSS_LEVEL_CONFIG = BOSS_LEVEL_CONFIG;

    // Deferred auto-registration with LevelRegistry
    function registerBossLevel() {
        if (window.LevelRegistry && window.LevelData) {
            try {
                window.LevelRegistry.getInstance().registerLevel(new window.LevelData(BOSS_LEVEL_CONFIG));
                console.log('[LevelRegistration] Auto-registered boss_level');
            } catch (error) {
                console.warn('[LevelRegistration] Failed to auto-register boss_level:', error);
                // Retry after a short delay
                setTimeout(registerBossLevel, 50);
            }
        } else {
            // LevelRegistry not ready yet, retry
            setTimeout(registerBossLevel, 10);
        }
    }

    // Start registration attempt
    registerBossLevel();
}
