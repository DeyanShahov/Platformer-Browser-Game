// Skill Tree UI System
// Pure UI rendering functions for skill tree display

// Tab switching functionality
function switchToMainPageTab() {
    const mainTab = window.SKILL_PAGES?.MAIN || 'main';
    switchSkillTreePage(mainTab);
}

function switchToSecondaryPageTab() {
    const secondaryTab = window.SKILL_PAGES?.SECONDARY || 'secondary';
    switchSkillTreePage(secondaryTab);
}

// Set up tab event listeners
function setupSkillTreeTabs() {
    const mainTabEl = document.getElementById('mainPageTab');
    const secondaryTabEl = document.getElementById('secondaryPageTab');

    if (mainTabEl) {
        mainTabEl.addEventListener('click', switchToMainPageTab);
    }

    if (secondaryTabEl) {
        secondaryTabEl.addEventListener('click', switchToSecondaryPageTab);
    }
}

// Update tab visual states
function updateTabStates(currentPage) {
    const mainTabEl = document.getElementById('mainPageTab');
    const secondaryTabEl = document.getElementById('secondaryPageTab');

    const mainPage = window.SKILL_PAGES?.MAIN || 'main';
    const secondaryPage = window.SKILL_PAGES?.SECONDARY || 'secondary';

    if (mainTabEl) {
        if (currentPage === mainPage) {
            mainTabEl.classList.add('active');
        } else {
            mainTabEl.classList.remove('active');
        }
    }

    if (secondaryTabEl) {
        if (currentPage === secondaryPage) {
            secondaryTabEl.classList.add('active');
        } else {
            secondaryTabEl.classList.remove('active');
        }
    }
}

// Update skill tree title
function updateSkillTreeTitle(playerIndex, skillPoints) {
    const titleEl = document.getElementById('skillTreeTitle');
    if (titleEl) {
        titleEl.textContent = `Дърво на уменията - Играч ${playerIndex + 1} / Налични точки за разпределение: ${skillPoints}`;
    }
}

// Clear skill tree display
function clearSkillTreeDisplay() {
    const gridEl = document.getElementById('skillGrid');
    const connectionsEl = document.getElementById('skillConnections');

    if (gridEl) {
        // Keep only the SVG container, remove all skill icons
        const svgContainer = gridEl.querySelector('#skillConnections');
        gridEl.innerHTML = '';
        if (svgContainer) {
            gridEl.appendChild(svgContainer);
        }
    }

    if (connectionsEl) {
        connectionsEl.innerHTML = '';
    }
}

// Show skill tree loading state
function showSkillTreeLoading() {
    const gridEl = document.getElementById('skillGrid');
    if (gridEl) {
        gridEl.innerHTML = '<div style="text-align: center; padding: 50px; color: #fff;">Зареждане на уменията...</div>';
    }
}

// Hide skill tree menu
function hideSkillTreeMenu() {
    const menuEl = document.getElementById('skillTreeMenu');
    if (menuEl) {
        menuEl.style.display = 'none';
    }
}

// Show skill tree menu
function showSkillTreeMenu() {
    const menuEl = document.getElementById('skillTreeMenu');
    if (menuEl) {
        menuEl.style.display = 'block';
    }
}

// Initialize skill tree UI components
function initSkillTreeUI() {
    setupSkillTreeTabs();
    console.log('[Skill Tree UI] Initialized');
}

// Global exports for backward compatibility
window.SkillTreeUI = {
    switchToMainPageTab,
    switchToSecondaryPageTab,
    setupSkillTreeTabs,
    updateTabStates,
    updateSkillTreeTitle,
    clearSkillTreeDisplay,
    showSkillTreeLoading,
    hideSkillTreeMenu,
    showSkillTreeMenu,
    initSkillTreeUI
};
