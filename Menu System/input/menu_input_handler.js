// Menu Input Handler System
// Centralized input coordination for all menu systems

// Key press tracking variables for skill trees
let key5Pressed = false;
let key5WasPressed = false;
let key6Pressed = false;
let key6WasPressed = false;
let key7Pressed = false;
let key7WasPressed = false;
let key8Pressed = false;
let key8WasPressed = false;
let keyTPressed = false;
let keyTWasPressed = false;
let keyYPressed = false;
let keyYWasPressed = false;
let keyUPressed = false;
let keyUWasPressed = false;
let keyIPressed = false;
let keyIWasPressed = false;

// Key press tracking variables for character stats
let key9Pressed = false;
let key9WasPressed = false;
let key0Pressed = false;
let key0WasPressed = false;
let keyMinusPressed = false;
let keyMinusWasPressed = false;
let keyEqualsPressed = false;
let keyEqualsWasPressed = false;

// Global variables for skill tree timing
let lastSkillTreeToggleTime = 0; // Timestamp to prevent rapid toggling

// Input coordination functions for skill trees
function handleSkillTreeKeys(gameState, keys) {
    const now = performance.now();
    if (now - lastSkillTreeToggleTime < 300) return; // 300ms debounce

    // Toggle main menu (Escape or 'm')
    if (keys['Escape'] || keys['m']) {
        window.MenuCore.toggleMenu();
        lastSkillTreeToggleTime = now;
        keys['Escape'] = false;
        keys['m'] = false;
        return;
    }

    // Player 1 skill tree (key 5) - 3-tier toggle system
    key5Pressed = keys['5'];
    if (key5Pressed && !key5WasPressed && gameState.players && gameState.players.length >= 1) {
        if (window.MenuSystem.currentMenu === 'microTree' && window.MenuSystem.currentSkillTreePlayer === 0) {
            // Tier 3: Micro tree is open - close micro tree (main tree stays open)
            hideMicroTree();
        } else if (window.MenuSystem.currentMenu === 'skills' && window.MenuSystem.currentSkillTreePlayer === 0) {
            // Tier 2: Main skill tree is open (no micro tree) - close everything
            window.MenuSystem.hideSkillTree();
        } else if (!window.MenuSystem.menuActive) {
            // Tier 1: No menu is active - open main skill tree
            window.MenuSystem.showSkillTreeForPlayer(0);
        }
        // If another player's menu is open, do nothing
        lastSkillTreeToggleTime = now;
    }
    key5WasPressed = key5Pressed;

    // Player 2 skill tree (key 6) - 3-tier toggle system
    key6Pressed = keys['6'];
    if (key6Pressed && !key6WasPressed && gameState.players && gameState.players.length >= 2) {
        if (window.MenuSystem.currentMenu === 'microTree' && window.MenuSystem.currentSkillTreePlayer === 1) {
            // Tier 3: Micro tree is open - close micro tree (main tree stays open)
            hideMicroTree();
        } else if (window.MenuSystem.currentMenu === 'skills' && window.MenuSystem.currentSkillTreePlayer === 1) {
            // Tier 2: Main skill tree is open (no micro tree) - close everything
            window.MenuSystem.hideSkillTree();
        } else if (!window.MenuSystem.menuActive) {
            // Tier 1: No menu is active - open main skill tree
            window.MenuSystem.showSkillTreeForPlayer(1);
        }
        // If another player's menu is open, do nothing
        lastSkillTreeToggleTime = now;
    }
    key6WasPressed = key6Pressed;

    // Player 3 skill tree (key 7) - 3-tier toggle system
    key7Pressed = keys['7'];
    if (key7Pressed && !key7WasPressed && gameState.players && gameState.players.length >= 3) {
        if (window.MenuSystem.currentMenu === 'microTree' && window.MenuSystem.currentSkillTreePlayer === 2) {
            // Tier 3: Micro tree is open - close micro tree (main tree stays open)
            hideMicroTree();
        } else if (window.MenuSystem.currentMenu === 'skills' && window.MenuSystem.currentSkillTreePlayer === 2) {
            // Tier 2: Main skill tree is open (no micro tree) - close everything
            window.MenuSystem.hideSkillTree();
        } else if (!window.MenuSystem.menuActive) {
            // Tier 1: No menu is active - open main skill tree
            window.MenuSystem.showSkillTreeForPlayer(2);
        }
        // If another player's menu is open, do nothing
        lastSkillTreeToggleTime = now;
    }
    key7WasPressed = key7Pressed;

    // Player 4 skill tree (key 8) - 3-tier toggle system
    key8Pressed = keys['8'];
    if (key8Pressed && !key8WasPressed && gameState.players && gameState.players.length >= 4) {
        if (window.MenuSystem.currentMenu === 'microTree' && window.MenuSystem.currentSkillTreePlayer === 3) {
            // Tier 3: Micro tree is open - close micro tree (main tree stays open)
            hideMicroTree();
        } else if (window.MenuSystem.currentMenu === 'skills' && window.MenuSystem.currentSkillTreePlayer === 3) {
            // Tier 2: Main skill tree is open (no micro tree) - close everything
            window.MenuSystem.hideSkillTree();
        } else if (!window.MenuSystem.menuActive) {
            // Tier 1: No menu is active - open main skill tree
            window.MenuSystem.showSkillTreeForPlayer(3);
        }
        // If another player's menu is open, do nothing
        lastSkillTreeToggleTime = now;
    }
    key8WasPressed = key8Pressed;

    // Tab navigation (only when skill tree is open)
    if (window.MenuSystem.currentMenu === 'skills') {
        // Player 1 tab navigation (key t)
        keyTPressed = keys['t'] || keys['T'];
        if (keyTPressed && !keyTWasPressed) {
            if (window.MenuSystem.currentSkillTreePlayer === 0) {
                const nextPage = window.MenuSystem.currentSkillPage === (window.SKILL_PAGES?.MAIN || 'main')
                    ? (window.SKILL_PAGES?.SECONDARY || 'secondary')
                    : (window.SKILL_PAGES?.MAIN || 'main');
                window.MenuSystem.switchSkillTreePage(nextPage);
                lastSkillTreeToggleTime = now;
            }
        }
        keyTWasPressed = keyTPressed;

        // Player 2 tab navigation (key y)
        keyYPressed = keys['y'] || keys['Y'];
        if (keyYPressed && !keyYWasPressed) {
            if (window.MenuSystem.currentSkillTreePlayer === 1) {
                const nextPage = window.MenuSystem.currentSkillPage === (window.SKILL_PAGES?.MAIN || 'main')
                    ? (window.SKILL_PAGES?.SECONDARY || 'secondary')
                    : (window.SKILL_PAGES?.MAIN || 'main');
                window.MenuSystem.switchSkillTreePage(nextPage);
                lastSkillTreeToggleTime = now;
            }
        }
        keyYWasPressed = keyYPressed;

        // Player 3 tab navigation (key u)
        keyUPressed = keys['u'] || keys['U'];
        if (keyUPressed && !keyUWasPressed) {
            if (window.MenuSystem.currentSkillTreePlayer === 2) {
                const nextPage = window.MenuSystem.currentSkillPage === (window.SKILL_PAGES?.MAIN || 'main')
                    ? (window.SKILL_PAGES?.SECONDARY || 'secondary')
                    : (window.SKILL_PAGES?.MAIN || 'main');
                window.MenuSystem.switchSkillTreePage(nextPage);
                lastSkillTreeToggleTime = now;
            }
        }
        keyUWasPressed = keyUPressed;

        // Player 4 tab navigation (key i)
        keyIPressed = keys['i'] || keys['I'];
        if (keyIPressed && !keyIWasPressed) {
            if (window.MenuSystem.currentSkillTreePlayer === 3) {
                const nextPage = window.MenuSystem.currentSkillPage === (window.SKILL_PAGES?.MAIN || 'main')
                    ? (window.SKILL_PAGES?.SECONDARY || 'secondary')
                    : (window.SKILL_PAGES?.MAIN || 'main');
                window.MenuSystem.switchSkillTreePage(nextPage);
                lastSkillTreeToggleTime = now;
            }
        }
        keyIWasPressed = keyIPressed;
    }
}

// Character stats input coordination
function handleCharacterStatsKeys(gameState, keys) {
    const now = performance.now();
    if (now - lastSkillTreeToggleTime < 300) return; // 300ms debounce (reuse same timer)

    // Player 1 character stats (key 9) - toggle player's own stats
    key9Pressed = keys['9'];
    if (key9Pressed && !key9WasPressed && gameState.players && gameState.players.length >= 1) {
        if (window.MenuSystem.currentMenu === 'characterStats' && window.MenuSystem.currentCharacterStatsPlayer === 0) {
            // Close if player's own stats are open
            window.MenuSystem.hideCharacterStats();
        } else if (!window.MenuSystem.menuActive) {
            // Open only if no menu is active
            window.MenuSystem.showCharacterStatsForPlayer(0);
        }
        // If another player's stats are open, do nothing
        lastSkillTreeToggleTime = now;
    }
    key9WasPressed = key9Pressed;

    // Player 2 character stats (key 0) - toggle player's own stats
    key0Pressed = keys['0'];
    if (key0Pressed && !key0WasPressed && gameState.players && gameState.players.length >= 2) {
        if (window.MenuSystem.currentMenu === 'characterStats' && window.MenuSystem.currentCharacterStatsPlayer === 1) {
            // Close if player's own stats are open
            window.MenuSystem.hideCharacterStats();
        } else if (!window.MenuSystem.menuActive) {
            // Open only if no menu is active
            window.MenuSystem.showCharacterStatsForPlayer(1);
        }
        // If another player's stats are open, do nothing
        lastSkillTreeToggleTime = now;
    }
    key0WasPressed = key0Pressed;

    // Player 3 character stats (key -) - toggle player's own stats
    keyMinusPressed = keys['-'];
    if (keyMinusPressed && !keyMinusWasPressed && gameState.players && gameState.players.length >= 3) {
        if (window.MenuSystem.currentMenu === 'characterStats' && window.MenuSystem.currentCharacterStatsPlayer === 2) {
            // Close if player's own stats are open
            window.MenuSystem.hideCharacterStats();
        } else if (!window.MenuSystem.menuActive) {
            // Open only if no menu is active
            window.MenuSystem.showCharacterStatsForPlayer(2);
        }
        // If another player's stats are open, do nothing
        lastSkillTreeToggleTime = now;
    }
    keyMinusWasPressed = keyMinusPressed;

    // Player 4 character stats (key =) - toggle player's own stats
    keyEqualsPressed = keys['='];
    if (keyEqualsPressed && !keyEqualsWasPressed && gameState.players && gameState.players.length >= 4) {
        if (window.MenuSystem.currentMenu === 'characterStats' && window.MenuSystem.currentCharacterStatsPlayer === 3) {
            // Close if player's own stats are open
            window.MenuSystem.hideCharacterStats();
        } else if (!window.MenuSystem.menuActive) {
            // Open only if no menu is active
            window.MenuSystem.showCharacterStatsForPlayer(3);
        }
        // If another player's stats are open, do nothing
        lastSkillTreeToggleTime = now;
    }
    keyEqualsWasPressed = keyEqualsPressed;
}



// Reset all key states (useful for cleanup)
function resetKeyStates() {
    // Skill tree keys
    key5Pressed = key5WasPressed = false;
    key6Pressed = key6WasPressed = false;
    key7Pressed = key7WasPressed = false;
    key8Pressed = key8WasPressed = false;
    keyTPressed = keyTWasPressed = false;
    keyYPressed = keyYWasPressed = false;
    keyUPressed = keyUWasPressed = false;
    keyIPressed = keyIWasPressed = false;

    // Character stats keys
    key9Pressed = key9WasPressed = false;
    key0Pressed = key0WasPressed = false;
    keyMinusPressed = keyMinusWasPressed = false;
    keyEqualsPressed = keyEqualsWasPressed = false;

    console.log('[Menu Input] All key states reset');
}

// Get current input state for debugging
function getInputState() {
    return {
        skillTreeKeys: {
            player1: { pressed: key5Pressed, wasPressed: key5WasPressed },
            player2: { pressed: key6Pressed, wasPressed: key6WasPressed },
            player3: { pressed: key7Pressed, wasPressed: key7WasPressed },
            player4: { pressed: key8Pressed, wasPressed: key8WasPressed },
            tabs: {
                player1: { pressed: keyTPressed, wasPressed: keyTWasPressed },
                player2: { pressed: keyYPressed, wasPressed: keyYWasPressed },
                player3: { pressed: keyUPressed, wasPressed: keyUWasPressed },
                player4: { pressed: keyIPressed, wasPressed: keyIWasPressed }
            }
        },
        characterStatsKeys: {
            player1: { pressed: key9Pressed, wasPressed: key9WasPressed },
            player2: { pressed: key0Pressed, wasPressed: key0WasPressed },
            player3: { pressed: keyMinusPressed, wasPressed: keyMinusWasPressed },
            player4: { pressed: keyEqualsPressed, wasPressed: keyEqualsWasPressed }
        },
        lastToggleTime: lastSkillTreeToggleTime
    };
}

// Global exports for backward compatibility
window.MenuInputHandler = {
    handleSkillTreeKeys,
    handleCharacterStatsKeys,
    resetKeyStates,
    getInputState,
    lastSkillTreeToggleTime
};
