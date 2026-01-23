// Menu UI System
// UI-related functions for menu display and updates

// Update gamepad status display
function updateGamepadStatus() {
    const gamepadStatus = document.getElementById('gamepadStatus');
    if (!gamepadStatus) return;

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    let statusText = '';

    let connectedCount = 0;
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            connectedCount++;
            statusText += `Gamepad ${i + 1}: ${gamepads[i].id}<br>`;
        }
    }

    if (connectedCount === 0) {
        statusText = 'No gamepads connected';
    } else {
        statusText = `Gamepads connected: ${connectedCount}<br>` + statusText;
    }

    gamepadStatus.innerHTML = `<p style="color: #fff; margin: 10px 0;">${statusText}</p>`;
}

// Create menu HTML structure (moved from menu_core.js for better separation)
function createMenuHTML() {
    return `
        <div id="mainMenu" class="menu">
            <h2>Game Menu</h2>
            <div id="gamepadStatus"></div>
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
    `;
}

// Helper function to show/hide menu elements
function showMenuElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'block';
    }
}

function hideMenuElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

// Update menu title
function updateMenuTitle(titleId, title) {
    const titleElement = document.getElementById(titleId);
    if (titleElement) {
        titleElement.textContent = title;
    }
}

// Global exports for backward compatibility
window.MenuUI = {
    updateGamepadStatus,
    createMenuHTML,
    showMenuElement,
    hideMenuElement,
    updateMenuTitle
};
