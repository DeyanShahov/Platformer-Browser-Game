// Skill Tree Core System
// Core skill tree logic, navigation, and state management

// Skill Tree Navigation Variables (global state managed by Menu System/index.js)
let skillCursorRow = 0;
let skillCursorCol = 0;

// Skill grid layouts for different pages: 6 rows x 5 columns (30 total positions each)
const SKILL_GRID_LAYOUTS = {
    [window.SKILL_PAGES?.MAIN || 'main']: [
        // Row 1 - Real skills
        [window.SKILL_TYPES?.BASIC_ATTACK_LIGHT, window.SKILL_TYPES?.SECONDARY_ATTACK_LIGHT, window.SKILL_TYPES?.ENHANCED_ATTACK, window.SKILL_TYPES?.BASIC_DEFENSE, window.SKILL_TYPES?.COMBAT_STANCE],
        // Row 2 - Real skills
        [window.SKILL_TYPES?.BASIC_ATTACK_MEDIUM, window.SKILL_TYPES?.SECONDARY_ATTACK_MEDIUM, window.SKILL_TYPES?.STRONG_ATTACK, window.SKILL_TYPES?.STRONG_BODY, window.SKILL_TYPES?.COMBAT_SENSE],
        // Row 3 - Real skills
        [window.SKILL_TYPES?.BASIC_ATTACK_HEAVY, window.SKILL_TYPES?.SECONDARY_ATTACK_HEAVY, window.SKILL_TYPES?.ULTIMATE_ATTACK, window.SKILL_TYPES?.SKILL_03_04, window.SKILL_TYPES?.SKILL_03_05],
        // Row 4 - Elemental protection skills
        [window.SKILL_TYPES?.WATER_PROTECTION, window.SKILL_TYPES?.FIRE_PROTECTION, window.SKILL_TYPES?.AIR_PROTECTION, window.SKILL_TYPES?.EARTH_PROTECTION, window.SKILL_TYPES?.MASS_RESISTANCE],
        // Row 5 - Test skills
        [window.SKILL_TYPES?.SKILL_05_01, window.SKILL_TYPES?.SKILL_05_02, window.SKILL_TYPES?.SKILL_05_03, window.SKILL_TYPES?.SKILL_05_04, window.SKILL_TYPES?.SKILL_05_05],
        // Row 6 - Test skills
        [window.SKILL_TYPES?.SKILL_06_01, window.SKILL_TYPES?.SKILL_06_02, window.SKILL_TYPES?.SKILL_06_03, window.SKILL_TYPES?.SKILL_06_04, window.SKILL_TYPES?.SKILL_06_05]
    ],
    [window.SKILL_PAGES?.SECONDARY || 'secondary']: [
        // Row 1 - Secondary page skills
        [window.SKILL_TYPES?.SYNERGY, window.SKILL_TYPES?.SEC_SKILL_01_02, window.SKILL_TYPES?.SEC_SKILL_01_03, window.SKILL_TYPES?.SEC_SKILL_01_04, window.SKILL_TYPES?.SEC_SKILL_01_05],
        // Row 2 - Secondary page skills
        [window.SKILL_TYPES?.SEC_SKILL_02_01, window.SKILL_TYPES?.SEC_SKILL_02_02, window.SKILL_TYPES?.SEC_SKILL_02_03, window.SKILL_TYPES?.SEC_SKILL_02_04, window.SKILL_TYPES?.SEC_SKILL_02_05],
        // Row 3 - Secondary page skills
        [window.SKILL_TYPES?.SEC_SKILL_03_01, window.SKILL_TYPES?.SEC_SKILL_03_02, window.SKILL_TYPES?.SEC_SKILL_03_03, window.SKILL_TYPES?.SEC_SKILL_03_04, window.SKILL_TYPES?.SEC_SKILL_03_05],
        // Row 4 - Secondary page skills
        [window.SKILL_TYPES?.SEC_SKILL_04_01, window.SKILL_TYPES?.SEC_SKILL_04_02, window.SKILL_TYPES?.SEC_SKILL_04_03, window.SKILL_TYPES?.SEC_SKILL_04_04, window.SKILL_TYPES?.SEC_SKILL_04_05],
        // Row 5 - Secondary page skills
        [window.SKILL_TYPES?.SEC_SKILL_05_01, window.SKILL_TYPES?.SEC_SKILL_05_02, window.SKILL_TYPES?.SEC_SKILL_05_03, window.SKILL_TYPES?.SEC_SKILL_05_04, window.SKILL_TYPES?.SEC_SKILL_05_05],
        // Row 6 - Secondary page skills
        [window.SKILL_TYPES?.SEC_SKILL_06_01, window.SKILL_TYPES?.SEC_SKILL_06_02, window.SKILL_TYPES?.SEC_SKILL_06_03, window.SKILL_TYPES?.SEC_SKILL_06_04, window.SKILL_TYPES?.SEC_SKILL_06_05]
    ]
};

// Helper function to get current skill grid layout
function getCurrentSkillGridLayout() {
    return SKILL_GRID_LAYOUTS[window.MenuSystem.currentSkillPage] || SKILL_GRID_LAYOUTS[window.SKILL_PAGES?.MAIN || 'main'];
}

// Helper function to find grid position of a skill
function findSkillGridPosition(skillType) {
    const currentLayout = getCurrentSkillGridLayout();
    for (let row = 0; row < currentLayout.length; row++) {
        for (let col = 0; col < currentLayout[row].length; col++) {
            if (currentLayout[row][col] === skillType) {
                return { row, col };
            }
        }
    }
    return null;
}

// Draw connection lines between prerequisite skills
function drawConnectionLines(svgContainer, player) {
    // Clear existing lines
    svgContainer.innerHTML = '';

    // Icon dimensions (including margins)
    const iconSize = 64;
    const iconMargin = 10;
    const totalIconSize = iconSize + iconMargin;

    // Define skill chains and their gap positions (moved 2 columns to the right due to padding changes)
    const skillChains = [
        // Basic attack chain - gap at column 3.5 (between col 3 and 4) - moved +2 from 1.25
        { skills: [window.SKILL_TYPES?.BASIC_ATTACK_LIGHT, window.SKILL_TYPES?.BASIC_ATTACK_MEDIUM, window.SKILL_TYPES?.BASIC_ATTACK_HEAVY], gapColumn: 3 },
        // Secondary attack chain - gap at column 4.5 (between col 4 and 5) - moved +2 from 2.3
        { skills: [window.SKILL_TYPES?.SECONDARY_ATTACK_LIGHT, window.SKILL_TYPES?.SECONDARY_ATTACK_MEDIUM, window.SKILL_TYPES?.SECONDARY_ATTACK_HEAVY], gapColumn: 4.05 },
        // Enhanced attack chain - gap at column 5.5 (between col 5 and 6) - moved +2 from 3.4
        { skills: [window.SKILL_TYPES?.ENHANCED_ATTACK, window.SKILL_TYPES?.STRONG_ATTACK, window.SKILL_TYPES?.ULTIMATE_ATTACK], gapColumn: 5.15 }
    ];

    // Draw vertical lines for each skill chain
    skillChains.forEach(chain => {
        for (let i = 0; i < chain.skills.length - 1; i++) {
            const fromSkill = chain.skills[i];
            const toSkill = chain.skills[i + 1];

            // Find grid positions
            const fromPos = findSkillGridPosition(fromSkill);
            const toPos = findSkillGridPosition(toSkill);

            if (fromPos && toPos) {
                // Draw vertical line in the gap between columns with dynamic color
                drawVerticalLineInGap(svgContainer, fromPos.row, toPos.row, chain.gapColumn, totalIconSize, player, toSkill);
            }
        }
    });
}

// Draw a vertical line in the gap between columns with dynamic color
function drawVerticalLineInGap(svgContainer, fromRow, toRow, gapColumn, totalIconSize, player, toSkill) {
    // Calculate pixel positions for the vertical line in the gap
    const lineX = gapColumn * totalIconSize; // Position in the gap (e.g., 0.5 * totalIconSize)
    const fromY = (fromRow + 0.5) * totalIconSize; // Center of from icon
    const toY = (toRow + 0.5) * totalIconSize;   // Center of to icon

    // Determine line color based on target skill status
    let lineColor = '#666666'; // Default gray for locked skills

    if (player.unlockedSkills.has(toSkill)) {
        lineColor = '#00ff00'; // Green - target skill is unlocked
    } else if (window.skillTreeManager.canUnlockSkill(player, toSkill)) {
        lineColor = '#ff8800'; // Orange - target skill can be unlocked
    } else {
        lineColor = '#666666'; // Gray - target skill is locked
    }

    // Create vertical line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', lineX);
    line.setAttribute('y1', fromY);
    line.setAttribute('x2', lineX);
    line.setAttribute('y2', toY);
    line.setAttribute('stroke', lineColor);
    line.setAttribute('stroke-width', '5'); // Even thicker for better visibility
    line.setAttribute('opacity', '0.95'); // Very opaque
    line.setAttribute('stroke-linecap', 'round');

    svgContainer.appendChild(line);
}

// Skill Tree Functions
function showSkillTreeForPlayer(playerIndex) {
    console.log(`[SKILL TREE] Attempting to show for player ${playerIndex + 1} (index: ${playerIndex})`);
    if (playerIndex < 0 || playerIndex >= window.gameState.players.length) {
        console.log(`[SKILL TREE] Invalid player index: ${playerIndex}`);
        return;
    }

    window.MenuSystem.currentSkillTreePlayer = playerIndex;
    const player = window.gameState.players[playerIndex];
    console.log(`[SKILL TREE] Setting currentSkillTreePlayer to index ${playerIndex}`);

    // Reset cursor to top-left
    skillCursorRow = 0;
    skillCursorCol = 0;

    // Update title with combined player info and skill points
    const titleEl = document.getElementById('skillTreeTitle');
    titleEl.textContent = `Дърво на уменията - Играч ${playerIndex + 1} / Налични точки за разпределение: ${player.skillPoints}`;

    // Render skill tree
    console.log(`[SKILL TREE] Rendering skill tree for player ${playerIndex + 1}`);
    renderSkillTree(player);

    // Show skill tree menu
    console.log(`[SKILL TREE] Setting menu states: menuActive=true, currentMenu='skills'`);
    window.MenuSystem.menuActive = true;
    window.MenuSystem.currentMenu = 'skills';
    document.getElementById('gameMenu').style.display = 'flex';
    document.getElementById('skillTreeMenu').style.display = 'block';
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('controlsMenu').style.display = 'none';

    // Update cursor position after menu is shown (CSS layout applied)
    setTimeout(() => {
        updateCursorPosition();
    }, 0);

    // Set up input handling for skill tree navigation
    console.log(`[SKILL TREE] Setting up input handling`);
    cleanupSkillTreeInput(); // Почистваме стари listener-и преди да добавим нови
    setupSkillTreeInput();

    console.log(`[SKILL TREE] Show completed successfully`);
}

function hideSkillTree() {
    console.log(`[SKILL TREE] Hiding skill tree (was for player index: ${window.MenuSystem.currentSkillTreePlayer})`);
    window.MenuSystem.currentSkillTreePlayer = null;
    window.MenuSystem.menuActive = false;
    window.MenuSystem.currentMenu = 'main';
    document.getElementById('gameMenu').style.display = 'none';
    document.getElementById('skillTreeMenu').style.display = 'none';
    console.log(`[SKILL TREE] Hide completed`);
}

function renderSkillTree(player) {
    try {
        console.log('Rendering skill tree...');
        const gridEl = document.getElementById('skillGrid');
        if (!gridEl) {
            console.error('skillGrid element not found!');
            return;
        }

        gridEl.innerHTML = '';

        // Add SVG container for connection lines (behind skill icons)
        const svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgContainer.id = 'skillConnections';
        svgContainer.style.position = 'absolute';
        svgContainer.style.top = '0';
        svgContainer.style.left = '0';
        svgContainer.style.width = '100%';
        svgContainer.style.height = '100%';
        svgContainer.style.pointerEvents = 'none';
        svgContainer.style.zIndex = '1'; // Between background and skill icons
        gridEl.appendChild(svgContainer);

        // Get current skill grid layout
        const currentLayout = getCurrentSkillGridLayout();

        // Create skill icons in grid
        for (let row = 0; row < currentLayout.length; row++) {
            for (let col = 0; col < currentLayout[row].length; col++) {
                const skillType = currentLayout[row][col];

                // Пропускаме празните позиции (null)
                if (!skillType) continue;

                const skillInfo = window.SKILL_TREE[skillType];

                const skillIcon = document.createElement('div');
                skillIcon.className = 'skill-icon';
                skillIcon.dataset.skillType = skillType;
                skillIcon.dataset.row = row;
                skillIcon.dataset.col = col;

                // Determine icon state
                if (player.unlockedSkills.has(skillType)) {
                    skillIcon.classList.add('unlocked');
                } else if (window.skillTreeManager.canUnlockSkill(player, skillType)) {
                    skillIcon.classList.add('available');
                } else {
                    skillIcon.classList.add('locked');
                }

                // Load and display icon
                loadSkillIconForElement(skillIcon, row, col, player);

                gridEl.appendChild(skillIcon);
            }
        }

        // Draw connection lines between skills
        drawConnectionLines(svgContainer, player);

        // Update selected skill info
        updateSelectedSkillInfo();

        console.log('Skill tree rendered successfully');
    } catch (error) {
        console.error('Error in renderSkillTree:', error);
    }
}

function loadSkillIconForElement(element, row, col, player) {
    // Get the skill type for this grid position
    const currentLayout = getCurrentSkillGridLayout();
    const skillType = currentLayout[row][col];
    const skillInfo = window.SKILL_TREE[skillType];

    // Add CSS class based on skill usage type
    if (skillInfo.usageType === window.SKILL_USAGE_TYPES.ACTIVE) {
        element.classList.add('skill-active');
    } else if (skillInfo.usageType === window.SKILL_USAGE_TYPES.ACTIVE_PASSIVE) {
        element.classList.add('skill-active-passive');
    }

    // Use CSS clipping to show the correct icon from sprite sheet
    const { x, y } = window.getIconPosition(skillInfo.iconRow, skillInfo.iconCol);

    element.innerHTML = `<img src="Assets/Swordsman-Skill-Icons.webp"
        style="
            width: 100%;
            height: 100%;
            object-fit: none;
            object-position: -${x}px -${y}px;
            border-radius: 6px;
        "
        onerror="this.style.display='none'; this.nextSibling.style.display='block';"
    ><div style="display:none; font-size:10px; text-align:center; color:yellow; line-height:64px;">${skillInfo.iconRow}-${skillInfo.iconCol}</div>`;

    // Add type indicator for active skills
    if (skillInfo.usageType === window.SKILL_USAGE_TYPES.ACTIVE) {
        const indicator = document.createElement('div');
        indicator.className = 'skill-type-indicator';
        indicator.textContent = '⚡';
        indicator.title = 'Активно умение - изисква ръчно активиране';
        element.appendChild(indicator);
    } else if (skillInfo.usageType === window.SKILL_USAGE_TYPES.ACTIVE_PASSIVE) {
        const indicator = document.createElement('div');
        indicator.className = 'skill-type-indicator';
        indicator.textContent = '🔄';
        indicator.title = 'Активно-пасивно умение - toggle с ресурсна цена';
        element.appendChild(indicator);
    }

    // Add level indicator
    const levelIndicator = document.createElement('div');
    levelIndicator.className = 'skill-level-indicator';
    levelIndicator.textContent = getSkillLevelDisplay(player, skillType);
    element.appendChild(levelIndicator);
}

function updateCursorPosition() {
    const cursorEl = document.getElementById('skillCursor');
    const leftPanelEl = document.getElementById('skillTreeLeftPanel');

    // Find the currently selected skill icon
    const selectedIcon = document.querySelector(`.skill-icon[data-row="${skillCursorRow}"][data-col="${skillCursorCol}"]`);

    if (selectedIcon) {
        // Get positions relative to the left panel
        const iconRect = selectedIcon.getBoundingClientRect();
        const panelRect = leftPanelEl.getBoundingClientRect();

        // Calculate cursor position to center it over the icon
        const iconCenterX = iconRect.left + iconRect.width / 2 - panelRect.left;
        const iconCenterY = iconRect.top + iconRect.height / 2 - panelRect.top;

        // Position cursor so its center aligns with icon center
        const cursorX = iconCenterX - 39.3; // 70px cursor width / 2
        const cursorY = iconCenterY - 39.3; // 70px cursor height / 2

        cursorEl.style.left = `${cursorX}px`;
        cursorEl.style.top = `${cursorY}px`;
    }

    // Update selected class on skill icons
    document.querySelectorAll('.skill-icon').forEach(icon => {
        const row = parseInt(icon.dataset.row);
        const col = parseInt(icon.dataset.col);
        if (row === skillCursorRow && col === skillCursorCol) {
            icon.classList.add('selected');
        } else {
            icon.classList.remove('selected');
        }
    });
}

function updateSelectedSkillInfo() {
    if (window.MenuSystem.currentSkillTreePlayer === null) return;

    const player = window.gameState.players[window.MenuSystem.currentSkillTreePlayer];
    const currentLayout = getCurrentSkillGridLayout();
    const skillType = currentLayout[skillCursorRow][skillCursorCol];

    // Проверка дали има валидно умение на тази позиция
    if (!skillType) {
        // Празна позиция - показваме placeholder информация
        document.getElementById('skillInfoName').textContent = 'Няма умение';
        document.getElementById('skillInfoDescription').textContent = 'Тази позиция е празна';

        const skillDetails = document.getElementById('skillRequirements');
        skillDetails.innerHTML = `
            <div>Prerequisites: N/A</div>
            <div>Resource Cost: N/A</div>
            <div>Skill Points: N/A</div>
            <div>Status: Empty slot</div>
        `;

        // Скриваме unlock бутона за празни позиции
        const unlockBtn = document.getElementById('unlockSkillBtn');
        unlockBtn.style.display = 'none';
        return;
    }

    const skillInfo = window.SKILL_TREE[skillType];

    // Update skill info
    document.getElementById('skillInfoName').textContent = skillInfo.name;

    // Update requirements
    const prereqText = getPrerequisitesDisplay(skillInfo);

    // Update status
    let statusText = 'Status: ';
    if (player.unlockedSkills.has(skillType)) {
        statusText += 'Unlocked';
    } else if (window.skillTreeManager.canUnlockSkill(player, skillType)) {
        statusText += 'Available';
    } else {
        statusText += 'Locked';
    }

    // NEW: Current Effect vs Next Effect display
    const currentEffect = getCurrentEffectDisplay(player, skillType, skillInfo);
    const nextEffect = getNextEffectDisplay(player, skillType, skillInfo);

    const skillDetails = document.getElementById('skillRequirements');
    const effectsHTML = `
        <div class="skill-effects">
            <div class="current-effect">
                <h4>Текущ ефект:</h4>
                <p>${currentEffect}</p>
            </div>
            <div class="next-effect">
                <h4>Следващ ефект:</h4>
                <p>${nextEffect}</p>
            </div>
        </div>
    `;

    const fullInfo = `
        <div>Prerequisites: ${prereqText}</div>
        <div>Resource Cost: ${getResourceDisplay(skillInfo)}</div>
        <div>Нужни точки за развитие: ${getSkillPointCost(player, skillType)}</div>
        <div>${statusText}</div>
        ${effectsHTML}
    `;
    skillDetails.innerHTML = fullInfo; // ПРЕЗАПИСВА вместо ДОБАВЯ

    // Update unlock/upgrade button
    const unlockBtn = document.getElementById('unlockSkillBtn');
    const upgradeInfo = window.skillTreeManager.getSkillUpgradeInfo(player, skillType);

    if (upgradeInfo) {
        const { currentLevel, maxLevel, canUpgrade, nextLevelCost, nextLevelEffect } = upgradeInfo;

        if (currentLevel === 0) {
            // Not unlocked yet
            unlockBtn.textContent = 'Отключи умение';
            unlockBtn.style.display = canUpgrade ? 'block' : 'none';
        } else if (currentLevel < maxLevel) {
            // Can upgrade
            unlockBtn.textContent = `Upgrade (Lv.${currentLevel} → ${currentLevel + 1})`;
            unlockBtn.style.display = canUpgrade ? 'block' : 'none';
        } else {
            // Max level reached
            unlockBtn.textContent = `Max Level (${maxLevel})`;
            unlockBtn.style.display = 'block';
            unlockBtn.disabled = true;
        }
    } else {
        // Legacy skill without leveling
        const canUnlock = window.skillTreeManager.canUnlockSkill(player, skillType);
        unlockBtn.textContent = 'Отключи умение';
        unlockBtn.style.display = canUnlock ? 'block' : 'none';
    }

    unlockBtn.disabled = !window.skillTreeManager.canUnlockSkill(player, skillType);
}

function moveCursor(direction) {
    const currentLayout = getCurrentSkillGridLayout();

    switch (direction) {
        case 'up':
            skillCursorRow = Math.max(0, skillCursorRow - 1);
            break;
        case 'down':
            skillCursorRow = Math.min(currentLayout.length - 1, skillCursorRow + 1);
            break;
        case 'left':
            skillCursorCol = Math.max(0, skillCursorCol - 1);
            break;
        case 'right':
            skillCursorCol = Math.min(currentLayout[0].length - 1, skillCursorCol + 1);
            break;
    }

    updateCursorPosition();
    updateSelectedSkillInfo();
}

function setupSkillTreeInput() {
    // Add event listeners for skill tree navigation
    document.addEventListener('keydown', handleSkillTreeKeyDown);
}

function cleanupSkillTreeInput() {
    document.removeEventListener('keydown', handleSkillTreeKeyDown);
}

function handleSkillTreeKeyDown(e) {
    if (window.MenuSystem.currentMenu !== 'skills') return;

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            e.preventDefault();
            moveCursor('up');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            e.preventDefault();
            moveCursor('down');
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            e.preventDefault();
            moveCursor('left');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            e.preventDefault();
            moveCursor('right');
            break;
        case 'Enter':
        case ' ':
            e.preventDefault();
            tryUnlockSelectedSkill();
            break;
    }
}

function handleUnlockClick() {
    tryUnlockSelectedSkill();
}

function tryUnlockSelectedSkill() {
    if (window.MenuSystem.currentSkillTreePlayer === null) return;

    const player = window.gameState.players[window.MenuSystem.currentSkillTreePlayer];
    const currentLayout = getCurrentSkillGridLayout();
    const skillType = currentLayout[skillCursorRow][skillCursorCol];

    if (!skillType) return; // Empty slot

    const skillInfo = window.SKILL_TREE[skillType];
    const currentLevel = window.skillTreeManager.getSkillLevel(player, skillType);

    // Check if this is an ACTIVE skill that's already unlocked and has a micro tree
    if (skillInfo.usageType === window.SKILL_USAGE_TYPES.ACTIVE &&
        currentLevel >= 1 &&
        skillInfo.microTree) {
        // Open micro skill tree instead of upgrading
        showMicroTreeForSkill(skillType);
        return;
    }

    // Normal unlock/upgrade logic
    if (window.skillTreeManager.unlockSkill(player, skillType)) {
        console.log(`Player ${window.MenuSystem.currentSkillTreePlayer + 1} unlocked skill: ${window.SKILL_TREE[skillType].name}`);

        // Update title with new skill points
        const titleEl = document.getElementById('skillTreeTitle');
        titleEl.textContent = `Дърво на уменията - Играч ${window.MenuSystem.currentSkillTreePlayer + 1} / Налични точки за разпределение: ${player.skillPoints}`;

        // Refresh skill tree
        renderSkillTree(player);
    }
}

// Function to switch skill tree page
function switchSkillTreePage(page) {
    if (page !== (window.SKILL_PAGES?.MAIN || 'main') && page !== (window.SKILL_PAGES?.SECONDARY || 'secondary')) {
        console.error(`Invalid skill page: ${page}`);
        return;
    }

    window.MenuSystem.currentSkillPage = page;

    // Update tab active states
    const mainTabEl = document.getElementById('mainPageTab');
    const secondaryTabEl = document.getElementById('secondaryPageTab');

    if (mainTabEl) {
        if (page === (window.SKILL_PAGES?.MAIN || 'main')) {
            mainTabEl.classList.add('active');
        } else {
            mainTabEl.classList.remove('active');
        }
    }

    if (secondaryTabEl) {
        if (page === (window.SKILL_PAGES?.SECONDARY || 'secondary')) {
            secondaryTabEl.classList.add('active');
        } else {
            secondaryTabEl.classList.remove('active');
        }
    }

    // Reset cursor to top-left when switching pages
    skillCursorRow = 0;
    skillCursorCol = 0;

    // Re-render skill tree for current player
    if (window.MenuSystem.currentSkillTreePlayer !== null) {
        const player = window.gameState.players[window.MenuSystem.currentSkillTreePlayer];
        renderSkillTree(player);

        // Update cursor position after re-rendering
        setTimeout(() => {
            updateCursorPosition();
        }, 0);
    }

    console.log(`Switched to skill tree page: ${page}`);
}

// Placeholder for micro tree functionality (will be implemented later)
function showMicroTreeForSkill(skillType) {
    console.log(`Micro tree for skill ${skillType} not implemented yet`);
}

// Global exports for backward compatibility
window.SkillTreeCore = {
    showSkillTreeForPlayer,
    hideSkillTree,
    renderSkillTree,
    updateSelectedSkillInfo,
    moveCursor,
    switchSkillTreePage,
    tryUnlockSelectedSkill,
    handleUnlockClick,
    setupSkillTreeInput,
    cleanupSkillTreeInput
};
