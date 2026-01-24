// Menu System Orchestrator
// Central coordinator for all menu-related functionality

// Global state variables
let menuActive = false;
let currentMenu = 'main'; // 'main', 'controls', 'skills', 'characterStats'
let currentSkillTreePlayer = null; // Index of player whose skills are being viewed
let currentCharacterStatsPlayer = null; // Index of player whose stats are being viewed
let currentSkillPage = window.SKILL_PAGES?.MAIN || 'main'; // Current skill tree page (main/secondary)

// Initialize the complete menu system
function initMenu() {
    console.log('[Menu System] Initializing menu system...');

    // Initialize core menu functionality
    initMenuCore();

    // Load controls configuration
    loadControls();

    // Update initial gamepad status
    updateGamepadStatus();

    // Update controls display
    updateControlsDisplay();

    console.log('[Menu System] Menu system initialized successfully');
}

// Menu state management functions
function getMenuState() {
    return {
        menuActive,
        currentMenu,
        currentSkillTreePlayer,
        currentCharacterStatsPlayer
    };
}

function setMenuState(state) {
    menuActive = state.menuActive || false;
    currentMenu = state.currentMenu || 'main';
    currentSkillTreePlayer = state.currentSkillTreePlayer || null;
    currentCharacterStatsPlayer = state.currentCharacterStatsPlayer || null;
}

// Export unified API
window.MenuSystem = {
    // Core functions
    initMenu,
    showMenu,
    hideMenu,
    showMainMenu,
    showControlsMenu,

    // Controls system
    loadControls,
    saveControls,
    updateControlsDisplay,
    startRebinding,

    // Skill tree system
    showSkillTreeForPlayer,
    hideSkillTree,
    renderSkillTree,
    updateSelectedSkillInfo,
    moveCursor,
    switchSkillTreePage,
    tryUnlockSelectedSkill,

    // Skill helpers
    getSkillLevelDisplay,
    getCurrentEffectDisplay,
    getNextEffectDisplay,
    getPrerequisitesDisplay,
    getSkillPointCost,
    calculateTotalPassiveEffect,

    // Input coordination
    handleSkillTreeKeys,
    handleCharacterStatsKeys,
    lastSkillTreeToggleTime,

    // Character stats (external) - use Character System functions
    showCharacterStatsForPlayer: window.CharacterSystem.showCharacterStats,
    hideCharacterStats: window.CharacterSystem.hideCharacterStats,

    // State management
    getMenuState,
    setMenuState,

    // Global state (for backward compatibility)
    get menuActive() { return menuActive; },
    set menuActive(value) { menuActive = value; },
    get currentMenu() { return currentMenu; },
    set currentMenu(value) { currentMenu = value; },
    get currentSkillTreePlayer() { return currentSkillTreePlayer; },
    set currentSkillTreePlayer(value) { currentSkillTreePlayer = value; },
    get currentCharacterStatsPlayer() { return currentCharacterStatsPlayer; },
    set currentCharacterStatsPlayer(value) { currentCharacterStatsPlayer = value; },
    get currentSkillPage() { return currentSkillPage; },
    set currentSkillPage(value) { currentSkillPage = value; }
};

// window.MenuSystem is now ready to be used by other scripts
// The initialization will be triggered by the main game logic

