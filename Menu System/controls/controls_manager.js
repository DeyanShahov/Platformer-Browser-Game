// Controls Manager System
// Handles loading, saving, and managing control configurations

// Global controls configuration
const controls = {
    player1: {
        inputMode: 'keyboard',
        keyboard: {
            // Движения
            left: 'ArrowLeft',
            right: 'ArrowRight',
            up: 'ArrowUp',
            down: 'ArrowDown',
            jump: 'z',

            // Основни атаки
            basicAttackLight: 'q',
            basicAttackMedium: 'w',
            basicAttackHeavy: 'e',

            // Допълнителни атаки
            secondaryAttackLight: 'a',
            secondaryAttackMedium: 's',
            secondaryAttackHeavy: 'd'
        },
        controller: {
            // Движения (D-pad)
            left: 14,   // D-pad Left
            right: 15,  // D-pad Right
            up: 12,     // D-pad Up
            down: 13,   // D-pad Down
            jump: 7,    // R2 бутон

            // Основни атаки
            basicAttackLight: 2,        // □ Square бутон - лека основна атака
            basicAttackMedium: 3,       // ◯ Circle бутон - средна основна атака
            basicAttackHeavy: 4,        // △ Triangle бутон - тежка основна атака

            // Допълнителни атаки
            secondaryAttackLight: 0,    // X Cross бутон - лека допълнителна атака
            secondaryAttackMedium: 1,   // L1 бутон - средна допълнителна атака
            secondaryAttackHeavy: 5     // R1 бутон - тежка допълнителна атака
        }
    },
    player2: {
        inputMode: 'controller',
        keyboard: {
            // Движения
            left: '4',
            right: '6',
            up: '8',
            down: '5',
            jump: '9',

            // Основни атаки
            basicAttackLight: 'u',
            basicAttackMedium: 'i',
            basicAttackHeavy: 'o',

            // Допълнителни атаки
            secondaryAttackLight: 'j',
            secondaryAttackMedium: 'k',
            secondaryAttackHeavy: 'l'
        },
        controller: {
            // Движения (D-pad)
            left: 14,   // D-pad Left
            right: 15,  // D-pad Right
            up: 12,     // D-pad Up
            down: 13,   // D-pad Down
            jump: 7,    // X бутон

            // Основни атаки (PS3 контролер бутони)
            basicAttackLight: 2,        // □ Square бутон - лека основна атака
            basicAttackMedium: 3,       // ◯ Circle бутон - средна основна атака
            basicAttackHeavy: 4,        // △ Triangle бутон - тежка основна атака

            // Допълнителни атаки (PS3 контролер бутони)
            secondaryAttackLight: 0,    // X Cross бутон - лека допълнителна атака
            secondaryAttackMedium: 1,   // L1 бутон - средна допълнителна атака
            secondaryAttackHeavy: 5     // R1 бутон - тежка допълнителна атака
        }
    },
    player3: {
        inputMode: 'keyboard',
        keyboard: {
            // Движения (допълнителни клавиши за Player 3)
            left: 'j',
            right: 'l',
            up: 'i',
            down: 'k',
            jump: 'space',

            // Основни атаки (числа за Player 3)
            basicAttackLight: '1',
            basicAttackMedium: '2',
            basicAttackHeavy: '3',

            // Допълнителни атаки
            secondaryAttackLight: '4',
            secondaryAttackMedium: '5',
            secondaryAttackHeavy: '6'
        },
        controller: {
            // Движения (D-pad)
            left: 14,   // D-pad Left
            right: 15,  // D-pad Right
            up: 12,     // D-pad Up
            down: 13,   // D-pad Down
            jump: 7,    // R2 бутон

            // Основни атаки
            basicAttackLight: 2,        // □ Square бутон - лека основна атака
            basicAttackMedium: 3,       // ◯ Circle бутон - средна основна атака
            basicAttackHeavy: 4,        // △ Triangle бутон - тежка основна атака

            // Допълнителни атаки
            secondaryAttackLight: 0,    // X Cross бутон - лека допълнителна атака
            secondaryAttackMedium: 1,   // L1 бутон - средна допълнителна атака
            secondaryAttackHeavy: 5     // R1 бутон - тежка допълнителна атака
        }
    },
    player4: {
        inputMode: 'controller',
        keyboard: {
            // Движения (букви за Player 4)
            left: 'a',
            right: 'd',
            up: 'w',
            down: 's',
            jump: 'space',

            // Основни атаки
            basicAttackLight: 'q',
            basicAttackMedium: 'e',
            basicAttackHeavy: 'r',

            // Допълнителни атаки
            secondaryAttackLight: 't',
            secondaryAttackMedium: 'y',
            secondaryAttackHeavy: 'u'
        },
        controller: {
            // Движения (D-pad)
            left: 14,   // D-pad Left
            right: 15,  // D-pad Right
            up: 12,     // D-pad Up
            down: 13,   // D-pad Down
            jump: 7,    // R2 бутон

            // Основни атаки (PS4 контролер бутони)
            basicAttackLight: 2,        // □ Square бутон - лека основна атака
            basicAttackMedium: 3,       // ◯ Circle бутон - средна основна атака
            basicAttackHeavy: 4,        // △ Triangle бутон - тежка основна атака

            // Допълнителни атаки (PS4 контролер бутони)
            secondaryAttackLight: 0,    // X Cross бутон - лека допълнителна атака
            secondaryAttackMedium: 1,   // L1 бутон - средна допълнителна атака
            secondaryAttackHeavy: 5     // R1 бутон - тежка допълнителна атака
        }
    }
};

// Button name mappings for controllers
const buttonNames = {
    0: 'X',      // Cross бутон (долен)
    1: '◯',      // Circle бутон (десен)
    2: '□',      // Square бутон (ляв)
    3: '△',      // Triangle бутон (горен)
    4: 'L1',     // Ляв shoulder бутон
    5: 'R1',     // Десен shoulder бутон
    6: 'L2',     // Ляв trigger (L2)
    7: 'R2',     // Десен trigger (R2)
    8: 'Share',  // Share/Select бутон
    9: 'Options', // Options/Start бутон
    12: 'D-pad ↑', // D-pad нагоре
    13: 'D-pad ↓', // D-pad надолу
    14: 'D-pad ←', // D-pad наляво
    15: 'D-pad →'  // D-pad надясно
};

// Load controls from localStorage
function loadControls() {
    try {
        const saved = localStorage.getItem('platformerControls');
        if (saved) {
            const savedControls = JSON.parse(saved);
            Object.keys(savedControls).forEach(player => {
                if (controls[player]) {
                    Object.assign(controls[player], savedControls[player]);
                } else {
                    controls[player] = savedControls[player];
                }
            });
            console.log('[Controls Manager] Controls loaded from localStorage');
        }

        // Set global window.controls for backward compatibility
        window.controls = controls;
        console.log('[Controls Manager] Global window.controls set');
    } catch (error) {
        console.error('[Controls Manager] Error loading controls:', error);
        // Even on error, set the default controls globally
        window.controls = controls;
    }
}

// Save controls to localStorage
function saveControls() {
    try {
        localStorage.setItem('platformerControls', JSON.stringify(controls));
        console.log('[Controls Manager] Controls saved to localStorage');
    } catch (error) {
        console.error('[Controls Manager] Error saving controls:', error);
    }
}

// Get controls configuration
function getControls() {
    return controls;
}

// Get button name mapping
function getButtonNames() {
    return buttonNames;
}

// Get specific player controls
function getPlayerControls(playerId) {
    return controls[playerId] || null;
}

// Update player input mode
function setPlayerInputMode(playerId, inputMode) {
    if (controls[playerId] && (inputMode === 'keyboard' || inputMode === 'controller')) {
        controls[playerId].inputMode = inputMode;
        saveControls();
        return true;
    }
    return false;
}

// Update specific control binding
function updateControlBinding(playerId, inputMode, action, value) {
    if (controls[playerId] && controls[playerId][inputMode]) {
        controls[playerId][inputMode][action] = value;
        saveControls();
        return true;
    }
    return false;
}

// Reset controls to defaults
function resetControlsToDefaults() {
    // This would reset all controls to the default configuration above
    // Implementation would depend on having a separate defaults object
    console.log('[Controls Manager] Reset to defaults not implemented yet');
}

// Validate controls configuration
function validateControls() {
    const requiredActions = [
        'left', 'right', 'up', 'down', 'jump',
        'basicAttackLight', 'basicAttackMedium', 'basicAttackHeavy',
        'secondaryAttackLight', 'secondaryAttackMedium', 'secondaryAttackHeavy'
    ];

    let isValid = true;

    Object.keys(controls).forEach(playerId => {
        const playerControls = controls[playerId];

        if (!playerControls.inputMode || !['keyboard', 'controller'].includes(playerControls.inputMode)) {
            console.warn(`[Controls Manager] Invalid inputMode for ${playerId}`);
            isValid = false;
        }

        ['keyboard', 'controller'].forEach(mode => {
            if (!playerControls[mode]) {
                console.warn(`[Controls Manager] Missing ${mode} controls for ${playerId}`);
                isValid = false;
                return;
            }

            requiredActions.forEach(action => {
                if (playerControls[mode][action] === undefined) {
                    console.warn(`[Controls Manager] Missing ${action} in ${mode} controls for ${playerId}`);
                    isValid = false;
                }
            });
        });
    });

    return isValid;
}

// Global exports for backward compatibility
window.ControlsManager = {
    loadControls,
    saveControls,
    getControls,
    getButtonNames,
    getPlayerControls,
    setPlayerInputMode,
    updateControlBinding,
    resetControlsToDefaults,
    validateControls,
    get defaultControls() { return controls; },
    get buttonNames() { return buttonNames; }
};
