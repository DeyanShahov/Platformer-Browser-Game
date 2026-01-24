// Menu Core System
// Basic menu functionality and state management

// Menu state variables (managed by Menu System/index.js)

// Initialize menu system
function initMenuCore() {
    console.log('[Menu Core] Initializing menu core...');

    // Create menu HTML structure
    const menuHTML = createMenuHTML();
    const menuDiv = document.createElement('div');
    menuDiv.id = 'gameMenu';
    menuDiv.innerHTML = menuHTML;
    document.body.appendChild(menuDiv);

    // Set up event listeners
    setupMenuEventListeners();

    // Set up gamepad event listeners
    setupGamepadListeners();

    console.log('[Menu Core] Menu core initialized');
}

// Create menu HTML structure
function createMenuHTML() {
    return `
        <div id="mainMenu" class="menu">
            <h2>Game Menu</h2>
            <div id="gamepadStatus"></div>
            <button id="endlessModeBtn">Endless Mode</button>
            <button id="changeControlsBtn">Change Controls</button>
            <button id="backToGameBtn">Back to Game</button>
        </div>
        <div id="controlsMenu" class="menu" style="display:none;">
            <h2>Change Controls</h2>
            <div id="controlsList"></div>
            <button id="backToMainBtn">Back</button>
        </div>
        <div id="skillTreeMenu" class="menu" style="display:none;">
            <h2 id="skillTreeTitle">Дърво на уменията</h2>
            <div id="skillTreeTabDisplay">
                <div id="mainPageTab" class="skill-page-tab active" data-page="main">Основна страница</div>
                <div id="secondaryPageTab" class="skill-page-tab" data-page="secondary">Вторична страница</div>
            </div>
            <div id="skillTreeSplitContainer">
                <div id="skillTreeLeftPanel">
                    <div id="skillGrid"></div>
                    <div id="skillCursor"></div>
                </div>
                <div id="skillTreeRightPanel">
                    <div id="skillDetails">
                        <div id="skillInfoContainer">
                            <div id="skillInfo">
                                <h3 id="skillInfoName">Изберете умение</h3>
                                <p id="skillInfoDescription">Използвайте стрелките за навигация</p>
                                <div id="skillRequirements">
                                    <div id="skillPrerequisites">Prerequisites: None</div>
                                    <div id="skillResourceCost">Resource Cost: None</div>
                                    <div id="skillPointCost">Skill Points: 0</div>
                                    <div id="skillStatus">Status: Select skill</div>
                                </div>
                            </div>
                        </div>
                        <button id="unlockSkillBtn" style="display:none;">Отключи умение</button>
                    </div>
                </div>
            </div>
        </div>
        <div id="microTreeModal" class="menu micro-tree-modal" style="display:none;">
            <h2 id="microTreeTitle">Специализации</h2>
            <div id="microTreeDescription" class="micro-tree-description">
                Тип на системата: One Per Row ( позволява се само един скил за развитие на ред )
            </div>
            <div id="microTreeSplitContainer">
                <div id="microTreeLeftPanel">
                    <div id="microSkillGrid"></div>
                    <div id="microSkillCursor"></div>
                </div>
                <div id="microTreeRightPanel">
                    <div id="microSkillDetails">
                        <div id="microSkillInfoContainer">
                            <div id="microSkillInfo">
                                <h3 id="microSkillInfoName">Изберете специализация</h3>
                                <div id="microSkillRequirements">
                                    <div id="microPrerequisites">Prerequisites: None</div>
                                    <div id="microResourceCost">Resource Cost: None</div>
                                    <div id="microSkillPointCost">Skill Points: 0</div>
                                    <div id="microSkillStatus">Status: Select micro skill</div>
                                </div>
                            </div>
                        </div>
                        <button id="selectMicroSkillBtn" style="display:none;">Избери</button>
                    </div>
                </div>
            </div>
        </div>
        ${window.characterStatsUI.getMenuHTML()}
    `;
}

// Set up menu event listeners
function setupMenuEventListeners() {
    // Main menu buttons
    const endlessModeBtn = document.getElementById('endlessModeBtn');
    const changeControlsBtn = document.getElementById('changeControlsBtn');
    const backToGameBtn = document.getElementById('backToGameBtn');
    const backToMainBtn = document.getElementById('backToMainBtn');
    const unlockSkillBtn = document.getElementById('unlockSkillBtn');

    if (endlessModeBtn) {
        endlessModeBtn.onclick = () => {
            console.log('[Menu Core] Starting Endless Mode...');
            window.levelManager.startEndlessMode();
            hideMenu();
        };
    }

    if (changeControlsBtn) {
        changeControlsBtn.onclick = () => {
            window.MenuCore.showControlsMenu();
        };
    }

    if (backToGameBtn) {
        backToGameBtn.onclick = hideMenu;
    }

    if (backToMainBtn) {
        backToMainBtn.onclick = showMainMenu;
    }

    if (unlockSkillBtn) {
        unlockSkillBtn.onclick = () => {
            window.SkillTreeCore.handleUnlockClick();
        };
    }
}

// Set up gamepad event listeners
function setupGamepadListeners() {
    window.addEventListener('gamepadconnected', updateGamepadStatus);
    window.addEventListener('gamepaddisconnected', updateGamepadStatus);
}

// Menu display functions
function showMenu() {
    window.MenuSystem.menuActive = true;
    window.MenuSystem.currentMenu = 'main';
    const menuDiv = document.getElementById('gameMenu');
    const mainMenu = document.getElementById('mainMenu');

    if (menuDiv) menuDiv.style.display = 'flex';
    if (mainMenu) mainMenu.style.display = 'block';

    updateGamepadStatus();
}

// Toggle menu function (opens if closed, closes if open)
function toggleMenu() {
    if (window.MenuSystem.menuActive) {
        // If menu is active, close all menus
        hideMenu();
    } else {
        // If no menu is active, open main menu
        showMenu();
    }
}

function hideMenu() {
    // Check if we're in skill tree menu
    if (window.MenuSystem.currentMenu === 'skills') {
        hideSkillTree();
        return;
    }

    // Check if we're in character stats menu
    if (window.MenuSystem.currentMenu === 'characterStats') {
        hideCharacterStats();
        return;
    }

    // Hide all menus
    window.MenuSystem.menuActive = false;
    window.MenuSystem.currentMenu = 'main';

    const menus = ['gameMenu', 'mainMenu', 'controlsMenu', 'skillTreeMenu', 'characterStatsMenu'];
    menus.forEach(menuId => {
        const menu = document.getElementById(menuId);
        if (menu) menu.style.display = 'none';
    });
}

function showMainMenu() {
    window.MenuSystem.currentMenu = 'main';

    const mainMenu = document.getElementById('mainMenu');
    const controlsMenu = document.getElementById('controlsMenu');

    if (mainMenu) mainMenu.style.display = 'block';
    if (controlsMenu) controlsMenu.style.display = 'none';
}

function showControlsMenu() {
    window.MenuSystem.currentMenu = 'controls';

    const mainMenu = document.getElementById('mainMenu');
    const controlsMenu = document.getElementById('controlsMenu');

    if (mainMenu) mainMenu.style.display = 'none';
    if (controlsMenu) controlsMenu.style.display = 'block';

    // Update controls display
    window.ControlsUI.updateControlsDisplay();
}

// Global exports for backward compatibility
window.MenuCore = {
    initMenuCore,
    showMenu,
    hideMenu,
    showMainMenu,
    showControlsMenu,
    createMenuHTML,
    toggleMenu
};
