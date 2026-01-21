/* =========================
   END GAME LEVEL
   Game Complete
   Special level that shows the end game screen
   ========================= */

const END_GAME_CONFIG = {
    id: 'end_game',
    name: 'Game Complete',
    type: 'end_game',
    description: 'Congratulations! You have completed the game.',

    // Level boundaries (minimal since no gameplay)
    boundaries: {
        left: 0,
        right: 1200,
        top: 0,
        bottom: 800,
        zMin: -50,
        zMax: 50
    },

    // No entities - special level
    entities: [],

    // No triggers
    triggers: [],

    // No completion conditions - special level
    completionConditions: [],

    // No exit points - end of game
    exitPoints: [],

    // Special transition mode
    transitionMode: 'none',
    nextLevelId: null,

    // End game UI overlay
    ui: {
        endGameScreen: {
            enabled: true,
            showStats: true,
            showAchievements: true,
            showCredits: false,
            allowRestart: true,
            allowMainMenu: false // Placeholder for future main menu
        },
        background: {
            type: 'gradient',
            colors: ['#1a1a2e', '#16213e', '#0f3460'],
            animation: 'subtle_pulse'
        }
    },

    // Victory music and effects
    musicTrack: 'victory_theme',
    ambientEffects: {
        particles: {
            enabled: true,
            type: 'celebration_confetti',
            count: 100,
            colors: ['#FFD700', '#FF69B4', '#00FFFF']
        },
        fireworks: {
            enabled: true,
            count: 5,
            interval: 2000
        }
    },

    // Game completion stats and achievements
    completionData: {
        requiredLevels: 3,
        minimumTime: null,
        achievements: [
            {
                id: 'first_completion',
                name: 'First Victory',
                description: 'Complete the game for the first time',
                icon: '🏆',
                unlocked: true
            },
            {
                id: 'speed_runner',
                name: 'Speed Runner',
                description: 'Complete the game in under 5 minutes',
                icon: '⚡',
                unlocked: false,
                condition: 'time < 300000'
            },
            {
                id: 'perfectionist',
                name: 'Perfectionist',
                description: 'Complete all levels without taking damage',
                icon: '💎',
                unlocked: false,
                condition: 'damage_taken == 0'
            }
        ]
    },

    // Post-game options
    postGameOptions: {
        restart: {
            enabled: true,
            label: '🔄 Play Again',
            action: 'restart_game'
        },
        mainMenu: {
            enabled: false, // Placeholder for future implementation
            label: '🏠 Main Menu',
            action: 'main_menu'
        },
        credits: {
            enabled: false, // Placeholder for future implementation
            label: '📜 Credits',
            action: 'show_credits'
        }
    },

    // No difficulty/rewards for end game
    difficultyMultiplier: 0,
    baseExperience: 0,
    parTime: 0
};

// =========================
// EXPORTS & REGISTRATION
// =========================

// Export for global scope
if (typeof window !== 'undefined') {
    window.END_GAME_CONFIG = END_GAME_CONFIG;

    // Deferred auto-registration with LevelRegistry
    function registerEndGameLevel() {
        if (window.LevelRegistry && window.LevelData) {
            try {
                window.LevelRegistry.getInstance().registerLevel(new window.LevelData(END_GAME_CONFIG));
                console.log('[LevelRegistration] Auto-registered end_game');
            } catch (error) {
                console.warn('[LevelRegistration] Failed to auto-register end_game:', error);
                // Retry after a short delay
                setTimeout(registerEndGameLevel, 50);
            }
        } else {
            // LevelRegistry not ready yet, retry
            setTimeout(registerEndGameLevel, 10);
        }
    }

    // Start registration attempt
    registerEndGameLevel();
}
