// Menu system for Platformer Game
let menuActive = false;
let currentMenu = 'main'; // 'main', 'controls', 'skills', 'characterStats'
let currentSkillTreePlayer = null; // Index of player whose skills are being viewed
let currentCharacterStatsPlayer = null; // Index of player whose stats are being viewed

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

window.controls = {
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
      basicAttackLight: 'q',      // Лека основна атака
      basicAttackMedium: 'w',     // Средна основна атака
      basicAttackHeavy: 'e',      // Тежка основна атака

      // Допълнителни атаки
      secondaryAttackLight: 'a',  // Лека допълнителна атака
      secondaryAttackMedium: 's', // Средна допълнителна атака
      secondaryAttackHeavy: 'd'   // Тежка допълнителна атака
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
      basicAttackLight: 'u',      // Лека основна атака
      basicAttackMedium: 'i',     // Средна основна атака
      basicAttackHeavy: 'o',      // Тежка основна атака

      // Допълнителни атаки
      secondaryAttackLight: 'j',  // Лека допълнителна атака
      secondaryAttackMedium: 'k', // Средна допълнителна атака
      secondaryAttackHeavy: 'l'   // Тежка допълнителна атака
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
      basicAttackLight: '1',      // Лека основна атака
      basicAttackMedium: '2',     // Средна основна атака
      basicAttackHeavy: '3',      // Тежка основна атака

      // Допълнителни атаки
      secondaryAttackLight: '4',  // Лека допълнителна атака
      secondaryAttackMedium: '5', // Средна допълнителна атака
      secondaryAttackHeavy: '6'   // Тежка допълнителна атака
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
      basicAttackLight: 'q',      // Лека основна атака
      basicAttackMedium: 'e',     // Средна основна атака
      basicAttackHeavy: 'r',      // Тежка основна атака

      // Допълнителни атаки
      secondaryAttackLight: 't',  // Лека допълнителна атака
      secondaryAttackMedium: 'y', // Средна допълнителна атака
      secondaryAttackHeavy: 'u'   // Тежка допълнителна атака
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
let rebindingAction = null;

// Load controls from localStorage
function loadControls() {
  const saved = localStorage.getItem('platformerControls');
  if (saved) {
    const savedControls = JSON.parse(saved);
    Object.keys(savedControls).forEach(player => {
      if (window.controls[player]) {
        Object.assign(window.controls[player], savedControls[player]);
      } else {
        window.controls[player] = savedControls[player];
      }
    });
  }
}

// Save controls to localStorage
function saveControls() {
  localStorage.setItem('platformerControls', JSON.stringify(window.controls));
}

// Initialize menu
function initMenu() {
  loadControls();

  // Create menu HTML
  const menuDiv = document.createElement('div');
  menuDiv.id = 'gameMenu';
  menuDiv.innerHTML = `
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

      <!-- Tab Display -->
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

    <!-- Micro Skill Tree Modal -->
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
  document.body.appendChild(menuDiv);

  // Event listeners
  document.getElementById('changeControlsBtn').onclick = showControlsMenu;
  document.getElementById('backToGameBtn').onclick = hideMenu;
  document.getElementById('backToMainBtn').onclick = showMainMenu;
  document.getElementById('unlockSkillBtn').onclick = handleUnlockClick; // Централизираме го тук
  // Micro skill tree is now handled by micro_skill_tree.js




  updateGamepadStatus();

  // Gamepad events
  window.addEventListener('gamepadconnected', updateGamepadStatus);
  window.addEventListener('gamepaddisconnected', updateGamepadStatus);

  updateControlsDisplay();
}

function updateGamepadStatus() {
  const gamepadStatus = document.getElementById('gamepadStatus');
  const gamepads = navigator.getGamepads();
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

function showMenu() {
  menuActive = true;
  currentMenu = 'main';
  document.getElementById('gameMenu').style.display = 'flex';
  document.getElementById('mainMenu').style.display = 'block';
  document.getElementById('controlsMenu').style.display = 'none';
  updateGamepadStatus();
}

function hideMenu() {
  // Ако сме били в менюто с умения, извикай неговата функция за затваряне,
  // за да се почистят event listener-ите.
  if (currentMenu === 'skills') {
    hideSkillTree();
    return; // hideSkillTree() ще се погрижи за останалото.
  }

  // Ако сме били в менюто със статистики на героя
  if (currentMenu === 'characterStats') {
    hideCharacterStats();
    return; // hideCharacterStats() ще се погрижи за останалото.
  }

  menuActive = false;
  document.getElementById('gameMenu').style.display = 'none';
  document.getElementById('mainMenu').style.display = 'none';
  document.getElementById('controlsMenu').style.display = 'none';
  document.getElementById('skillTreeMenu').style.display = 'none';
  document.getElementById('characterStatsMenu').style.display = 'none';

  // Нулираме състоянието
  currentMenu = 'main';
  currentSkillTreePlayer = null;
  currentCharacterStatsPlayer = null;
  cleanupSkillTreeInput(); // Почистваме за всеки случай
  cleanupCharacterStatsInput(); // Почистваме за всеки случай
}

function showMainMenu() {
  currentMenu = 'main';
  document.getElementById('mainMenu').style.display = 'block';
  document.getElementById('controlsMenu').style.display = 'none';
}

function showControlsMenu() {
  currentMenu = 'controls';
  document.getElementById('mainMenu').style.display = 'none';
  document.getElementById('controlsMenu').style.display = 'block';
  updateControlsDisplay();
}

function updateControlsDisplay() {
  const controlsList = document.getElementById('controlsList');
  controlsList.innerHTML = '';

  // Разделяне на контролите на две групи
  const basicActions = [
    { key: 'left', label: 'Move Left' },
    { key: 'right', label: 'Move Right' },
    { key: 'up', label: 'Move Up (Z+)' },
    { key: 'down', label: 'Move Down (Z-)' },
    { key: 'jump', label: 'Jump' }
  ];

  const attackActions = [
    { key: 'basicAttackLight', label: 'Basic Attack Light' },
    { key: 'basicAttackMedium', label: 'Basic Attack Medium' },
    { key: 'basicAttackHeavy', label: 'Basic Attack Heavy' },
    { key: 'secondaryAttackLight', label: 'Secondary Attack Light' },
    { key: 'secondaryAttackMedium', label: 'Secondary Attack Medium' },
    { key: 'secondaryAttackHeavy', label: 'Secondary Attack Heavy' }
  ];

  // Лява таблица - основни контроли
  const leftContainer = document.createElement('div');
  leftContainer.style.position = 'absolute';
  leftContainer.style.left = '20px';
  leftContainer.style.top = '80px';
  leftContainer.style.width = '45%';

  const leftTitle = document.createElement('h3');
  leftTitle.textContent = 'Movement Controls';
  leftTitle.style.color = '#fff';
  leftTitle.style.marginBottom = '10px';
  leftContainer.appendChild(leftTitle);

  const leftTable = createControlsTable(basicActions, true); // true = include input mode
  leftContainer.appendChild(leftTable);

  // Дясна таблица - атаки
  const rightContainer = document.createElement('div');
  rightContainer.style.position = 'absolute';
  rightContainer.style.right = '20px';
  rightContainer.style.top = '80px';
  rightContainer.style.width = '50%';

  const rightTitle = document.createElement('h3');
  rightTitle.textContent = 'Attack Controls';
  rightTitle.style.color = '#fff';
  rightTitle.style.marginBottom = '10px';
  rightContainer.appendChild(rightTitle);

  const rightTable = createControlsTable(attackActions, false); // false = no input mode
  rightContainer.appendChild(rightTable);

  controlsList.appendChild(leftContainer);
  controlsList.appendChild(rightContainer);
}

// Помощна функция за създаване на таблица с контроли
function createControlsTable(actions, includeInputMode) {
  const table = document.createElement('table');
  table.style.borderCollapse = 'collapse';
  table.style.width = '100%';
  table.style.background = '#222';
  table.style.border = '2px solid #444';

  // Header row
  const headerRow = document.createElement('tr');
  const actionHeader = document.createElement('th');
  actionHeader.textContent = 'Action';
  actionHeader.style.padding = '8px';
  actionHeader.style.border = '1px solid #444';
  actionHeader.style.color = '#fff';
  actionHeader.style.background = '#333';
  headerRow.appendChild(actionHeader);

  // Player columns
  for (let i = 1; i <= 2; i++) { // Само 2 играча за по-компактно меню
    const playerHeader = document.createElement('th');
    playerHeader.textContent = `Player ${i}`;
    playerHeader.style.padding = '8px';
    playerHeader.style.border = '1px solid #444';
    playerHeader.style.color = '#fff';
    playerHeader.style.background = '#333';
    headerRow.appendChild(playerHeader);
  }

  table.appendChild(headerRow);

  // Input Mode row (само за лявата таблица)
  if (includeInputMode) {
    const inputModeRow = document.createElement('tr');
    const inputModeLabel = document.createElement('td');
    inputModeLabel.textContent = 'Input Mode';
    inputModeLabel.style.padding = '6px';
    inputModeLabel.style.border = '1px solid #444';
    inputModeLabel.style.color = '#fff';
    inputModeLabel.style.fontWeight = 'bold';
    inputModeLabel.style.background = '#2a2a2a';
    inputModeRow.appendChild(inputModeLabel);

    for (let i = 1; i <= 2; i++) {
      const player = `player${i}`;
      const inputModeCell = document.createElement('td');
      inputModeCell.style.padding = '6px';
      inputModeCell.style.border = '1px solid #444';
      inputModeCell.style.textAlign = 'center';
      inputModeCell.style.background = '#2a2a2a';

      if (window.controls[player]) {
        const select = document.createElement('select');
        select.style.background = '#444';
        select.style.color = '#fff';
        select.style.border = '1px solid #666';
        select.style.fontSize = '12px';
        select.style.padding = '2px';

        const keyboardOption = document.createElement('option');
        keyboardOption.value = 'keyboard';
        keyboardOption.textContent = 'Keyboard';
        select.appendChild(keyboardOption);

        const controllerOption = document.createElement('option');
        controllerOption.value = 'controller';
        controllerOption.textContent = 'Controller';
        select.appendChild(controllerOption);

        select.value = window.controls[player].inputMode || 'keyboard';
        select.onchange = () => {
          window.controls[player].inputMode = select.value;
          saveControls();
          updateControlsDisplay(); // Refresh display to show correct key/button names
        };

        inputModeCell.appendChild(select);
      } else {
        inputModeCell.textContent = 'N/A';
        inputModeCell.style.color = '#666';
      }

      inputModeRow.appendChild(inputModeCell);
    }

    table.appendChild(inputModeRow);
  }

  // Action rows
  actions.forEach(action => {
    const row = document.createElement('tr');

    // Action label
    const actionCell = document.createElement('td');
    actionCell.textContent = action.label;
    actionCell.style.padding = '6px';
    actionCell.style.border = '1px solid #444';
    actionCell.style.color = '#fff';
    actionCell.style.fontSize = '12px';
    row.appendChild(actionCell);

    // Player control cells
    for (let i = 1; i <= 2; i++) {
      const player = `player${i}`;
      const controlCell = document.createElement('td');
      controlCell.style.padding = '6px';
      controlCell.style.border = '1px solid #444';
      controlCell.style.textAlign = 'center';

      if (window.controls[player]) {
        // Get current input mode
        const inputMode = window.controls[player].inputMode || 'keyboard';
        const currentControls = window.controls[player][inputMode];

        // Get the current key/button for this action
        let displayText = 'N/A';
        if (currentControls && currentControls[action.key] !== undefined) {
          if (inputMode === 'keyboard') {
            displayText = currentControls[action.key];
          } else if (inputMode === 'controller') {
            // Convert button number to readable name
            const buttonNumber = currentControls[action.key];
            displayText = buttonNames[buttonNumber] || `Button ${buttonNumber}`;
          }
        }

        const keySpan = document.createElement('span');
        keySpan.id = `key-${player}-${action.key}`;
        keySpan.className = rebindingAction === `${player}-${action.key}` ? 'rebinding' : '';
        keySpan.textContent = displayText;
        keySpan.style.marginRight = '5px';
        keySpan.style.color = rebindingAction === `${player}-${action.key}` ? 'yellow' : '#fff';
        keySpan.style.fontSize = '11px';

        const changeBtn = document.createElement('button');
        changeBtn.textContent = 'Change';
        changeBtn.setAttribute('onclick', `startRebinding('${player}', '${action.key}')`);
        changeBtn.style.fontSize = '10px';
        changeBtn.style.padding = '2px 4px';

        controlCell.appendChild(keySpan);
        controlCell.appendChild(changeBtn);
      } else {
        controlCell.textContent = 'N/A';
        controlCell.style.color = '#666';
        controlCell.style.fontSize = '11px';
      }

      row.appendChild(controlCell);
    }

    table.appendChild(row);
  });

  return table;
}

function startRebinding(player, action) {
  rebindingAction = `${player}-${action}`;
  updateControlsDisplay();

  const handler = (e) => {
    e.preventDefault();
    
    // Намери текущия input mode
    const inputMode = window.controls[player].inputMode || 'keyboard';
    
    // Запиши в правилната суб-структура
    if (!window.controls[player][inputMode]) {
      window.controls[player][inputMode] = {};
    }
    window.controls[player][inputMode][action] = e.key;
    
    rebindingAction = null;
    saveControls();
    updateControlsDisplay();
    document.removeEventListener('keydown', handler);
  };

  document.addEventListener('keydown', handler);
}

// Make functions global for onclick
window.startRebinding = startRebinding;

// Helper function to calculate total passive effect from all skill levels
function calculateTotalPassiveEffect(skillInfo, player, skillType) {
  const currentLevel = window.skillTreeManager.getSkillLevel(player, skillType);

  if (!skillInfo.levelEffects || currentLevel === 0) {
    // No leveling or level 0 - return base passive effect
    return skillInfo.passiveEffect;
  }

  // Sum all level effects up to current level
  const totalValue = skillInfo.levelEffects
    .slice(0, currentLevel)
    .reduce((sum, effect) => sum + effect.value, 0);

  return {
    stat: skillInfo.passiveEffect.stat,
    value: totalValue
  };
}

// Helper function to get skill level display text (current/max)
function getSkillLevelDisplay(player, skillType) {
  const skill = SKILL_TREE[skillType];
  if (!skill) return '0/0';

  const currentLevel = window.skillTreeManager.getSkillLevel(player, skillType);
  const maxLevel = skill.maxLevel || 1; // Default to 1 for non-leveling skills

  return `${currentLevel}/${maxLevel}`;
}

// Helper function to get current effect display text
function getCurrentEffectDisplay(player, skillType, skillInfo) {
  const currentLevel = window.skillTreeManager.getSkillLevel(player, skillType);

  if (currentLevel === 0) {
    return "Ненаучен скил";
  }

  // Calculate total effect from all levels up to current
  if (skillInfo.passiveEffect && skillInfo.levelEffects) {
    // For single-level skills with multiple effects, show all effects
    if (currentLevel === 1 && skillInfo.maxLevel === 1 && Array.isArray(skillInfo.levelEffects[0])) {
      const effects = skillInfo.levelEffects[0];
      return effects.map(effect => effect.description).join(', ');
    }

    // For multi-level skills with single effects per level, accumulate values
    const totalValue = skillInfo.levelEffects
      .slice(0, currentLevel)
      .reduce((sum, effect) => {
        // Handle both single effects and arrays of effects
        if (Array.isArray(effect)) {
          return sum + effect.reduce((subSum, subEffect) => subSum + subEffect.value, 0);
        }
        return sum + (effect.value || 0);
      }, 0);

    const displayName = skillInfo.passiveEffect.statDisplay || skillInfo.passiveEffect.stat;
    return `+${totalValue} ${displayName}`;
  }

  // For non-leveling skills or active skills
  return skillInfo.description;
}

// Helper function to get next effect display text
function getNextEffectDisplay(player, skillType, skillInfo) {
  const currentLevel = window.skillTreeManager.getSkillLevel(player, skillType);
  const maxLevel = skillInfo.maxLevel || 1;

  if (currentLevel >= maxLevel) {
    return "Максимално развитие";
  }

  if (currentLevel === 0) {
    // First time unlocking
    if (skillInfo.levelEffects && skillInfo.levelEffects[0]) {
      const levelEffects = skillInfo.levelEffects[0];
      if (Array.isArray(levelEffects)) {
        // Multiple effects - show all descriptions
        return levelEffects.map(effect => effect.description).join(', ');
      } else {
        // Single effect
        return levelEffects.description;
      }
    }
    return skillInfo.description;
  }

  // Upgrading to next level
  if (skillInfo.levelEffects && skillInfo.levelEffects[currentLevel]) {
    const nextLevelEffects = skillInfo.levelEffects[currentLevel];

    if (Array.isArray(nextLevelEffects)) {
      // Multiple effects - show all descriptions
      const descriptions = nextLevelEffects.map(effect => effect.description);
      return `${descriptions.join(', ')}`;
    } else {
      // Single effect - calculate total
      const totalAfterUpgrade = skillInfo.levelEffects
        .slice(0, currentLevel + 1)
        .reduce((sum, effect) => sum + effect.value, 0);

      return `${nextLevelEffects.description} (общо +${totalAfterUpgrade} ${skillInfo.passiveEffect.statDisplay || skillInfo.passiveEffect.stat})`;
    }
  }

  return "Няма допълнителен ефект";
}

// Helper function to get skill point cost for next level
function getSkillPointCost(player, skillType) {
  const skill = SKILL_TREE[skillType];
  if (!skill) return 0;

  const currentLevel = window.skillTreeManager.getSkillLevel(player, skillType);
  const maxLevel = skill.maxLevel || 1;

  // If already at max level, return 0 (can't upgrade)
  if (currentLevel >= maxLevel) {
    return 0;
  }

  // For leveling skills, get cost from levelCosts array
  if (skill.levelCosts && skill.levelCosts[currentLevel] !== undefined) {
    return skill.levelCosts[currentLevel];
  }

  // Fallback for non-leveling skills
  return skill.levelCosts ? skill.levelCosts[0] : 0;
}

// Helper function to get formatted prerequisites display with level requirements
function getPrerequisitesDisplay(skillInfo) {
  if (skillInfo.prerequisites.length === 0) return 'Няма';

  return skillInfo.prerequisites.map(prereq => {
    // Use custom display text if provided, otherwise generate automatically
    if (prereq.displayText) {
      return prereq.displayText;
    }

    // Generate display text based on prerequisite type
    switch (prereq.type) {
      case "skill_level":
        const skillName = SKILL_TREE[prereq.skill].name;
        return `${skillName} (ниво ${prereq.level}+)`;

      case "player_level":
        return `Ниво на героя ${prereq.level}+`;

      case "quest_completed":
        return `Завършена мисия: ${prereq.questId}`;

      case "achievement_unlocked":
        return `Отключено постижение: ${prereq.achievementId}`;

      default:
        return `Неизвестно изискване: ${prereq.type}`;
    }
  }).join(', ');
}

// Skill Tree Navigation Variables
let skillCursorRow = 0;
let skillCursorCol = 0;
let currentSkillPage = SKILL_PAGES.MAIN; // Current skill tree page (main/secondary)
let skillIcons = {}; // Cache for loaded icons

// Skill grid layouts for different pages: 6 rows x 5 columns (30 total positions each)
const SKILL_GRID_LAYOUTS = {
  [SKILL_PAGES.MAIN]: [
    // Row 1 - Real skills
    [SKILL_TYPES.BASIC_ATTACK_LIGHT, SKILL_TYPES.SECONDARY_ATTACK_LIGHT, SKILL_TYPES.ENHANCED_ATTACK, SKILL_TYPES.BASIC_DEFENSE, SKILL_TYPES.COMBAT_STANCE],
    // Row 2 - Real skills
    [SKILL_TYPES.BASIC_ATTACK_MEDIUM, SKILL_TYPES.SECONDARY_ATTACK_MEDIUM, SKILL_TYPES.STRONG_ATTACK, SKILL_TYPES.STRONG_BODY, SKILL_TYPES.COMBAT_SENSE],
    // Row 3 - Real skills
    [SKILL_TYPES.BASIC_ATTACK_HEAVY, SKILL_TYPES.SECONDARY_ATTACK_HEAVY, SKILL_TYPES.ULTIMATE_ATTACK, SKILL_TYPES.SKILL_03_04, SKILL_TYPES.SKILL_03_05],
    // Row 4 - Elemental protection skills
    [SKILL_TYPES.WATER_PROTECTION, SKILL_TYPES.FIRE_PROTECTION, SKILL_TYPES.AIR_PROTECTION, SKILL_TYPES.EARTH_PROTECTION, SKILL_TYPES.MASS_RESISTANCE],
    // Row 5 - Test skills
    [SKILL_TYPES.SKILL_05_01, SKILL_TYPES.SKILL_05_02, SKILL_TYPES.SKILL_05_03, SKILL_TYPES.SKILL_05_04, SKILL_TYPES.SKILL_05_05],
    // Row 6 - Test skills
    [SKILL_TYPES.SKILL_06_01, SKILL_TYPES.SKILL_06_02, SKILL_TYPES.SKILL_06_03, SKILL_TYPES.SKILL_06_04, SKILL_TYPES.SKILL_06_05]
  ],
  [SKILL_PAGES.SECONDARY]: [
    // Row 1 - Secondary page skills
    [SKILL_TYPES.SYNERGY, SKILL_TYPES.SEC_SKILL_01_02, SKILL_TYPES.SEC_SKILL_01_03, SKILL_TYPES.SEC_SKILL_01_04, SKILL_TYPES.SEC_SKILL_01_05],
    // Row 2 - Secondary page skills
    [SKILL_TYPES.SEC_SKILL_02_01, SKILL_TYPES.SEC_SKILL_02_02, SKILL_TYPES.SEC_SKILL_02_03, SKILL_TYPES.SEC_SKILL_02_04, SKILL_TYPES.SEC_SKILL_02_05],
    // Row 3 - Secondary page skills
    [SKILL_TYPES.SEC_SKILL_03_01, SKILL_TYPES.SEC_SKILL_03_02, SKILL_TYPES.SEC_SKILL_03_03, SKILL_TYPES.SEC_SKILL_03_04, SKILL_TYPES.SEC_SKILL_03_05],
    // Row 4 - Secondary page skills
    [SKILL_TYPES.SEC_SKILL_04_01, SKILL_TYPES.SEC_SKILL_04_02, SKILL_TYPES.SEC_SKILL_04_03, SKILL_TYPES.SEC_SKILL_04_04, SKILL_TYPES.SEC_SKILL_04_05],
    // Row 5 - Secondary page skills
    [SKILL_TYPES.SEC_SKILL_05_01, SKILL_TYPES.SEC_SKILL_05_02, SKILL_TYPES.SEC_SKILL_05_03, SKILL_TYPES.SEC_SKILL_05_04, SKILL_TYPES.SEC_SKILL_05_05],
    // Row 6 - Secondary page skills
    [SKILL_TYPES.SEC_SKILL_06_01, SKILL_TYPES.SEC_SKILL_06_02, SKILL_TYPES.SEC_SKILL_06_03, SKILL_TYPES.SEC_SKILL_06_04, SKILL_TYPES.SEC_SKILL_06_05]
  ]
};

// Helper function to get current skill grid layout
function getCurrentSkillGridLayout() {
  return SKILL_GRID_LAYOUTS[currentSkillPage] || SKILL_GRID_LAYOUTS[SKILL_PAGES.MAIN];
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
    { skills: [SKILL_TYPES.BASIC_ATTACK_LIGHT, SKILL_TYPES.BASIC_ATTACK_MEDIUM, SKILL_TYPES.BASIC_ATTACK_HEAVY], gapColumn: 3 },
    // Secondary attack chain - gap at column 4.5 (between col 4 and 5) - moved +2 from 2.3
    { skills: [SKILL_TYPES.SECONDARY_ATTACK_LIGHT, SKILL_TYPES.SECONDARY_ATTACK_MEDIUM, SKILL_TYPES.SECONDARY_ATTACK_HEAVY], gapColumn: 4.05 },
    // Enhanced attack chain - gap at column 5.5 (between col 5 and 6) - moved +2 from 3.4
    { skills: [SKILL_TYPES.ENHANCED_ATTACK, SKILL_TYPES.STRONG_ATTACK, SKILL_TYPES.ULTIMATE_ATTACK], gapColumn: 5.15 }
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

// Draw a single curved connection line between two grid positions
function drawConnectionLine(svgContainer, fromPos, toPos, totalIconSize) {
  // Calculate pixel positions (center of icons)
  const fromX = fromPos.col * totalIconSize + totalIconSize / 2;
  const fromY = fromPos.row * totalIconSize + totalIconSize / 2;
  const toX = toPos.col * totalIconSize + totalIconSize / 2;
  const toY = toPos.row * totalIconSize + totalIconSize / 2;

  // Create curved path using quadratic Bézier curve
  // Control point is at the midpoint horizontally, and at the 'from' Y vertically
  const controlX = (fromX + toX) / 2;
  const controlY = fromY;

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`);
  path.setAttribute('stroke', '#ffffff'); // White color for better visibility
  path.setAttribute('stroke-width', '4'); // Thicker lines
  path.setAttribute('fill', 'none');
  path.setAttribute('opacity', '0.9'); // More opaque
  path.setAttribute('stroke-linecap', 'round');

  svgContainer.appendChild(path);
}

// Skill Tree Functions
function showSkillTreeForPlayer(playerIndex) {
  console.log(`[SKILL TREE] Attempting to show for player ${playerIndex + 1} (index: ${playerIndex})`);
  if (playerIndex < 0 || playerIndex >= window.players.length) {
    console.log(`[SKILL TREE] Invalid player index: ${playerIndex}`);
    return;
  }

  currentSkillTreePlayer = playerIndex;
  const player = window.players[playerIndex];
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
  menuActive = true;
  currentMenu = 'skills';
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
  console.log(`[SKILL TREE] Hiding skill tree (was for player index: ${currentSkillTreePlayer})`);
  currentSkillTreePlayer = null;
  menuActive = false;
  currentMenu = 'main';
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

        const skillInfo = SKILL_TREE[skillType];

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
        loadSkillIconForElement(skillIcon, row, col);

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

function loadSkillIconForElement(element, row, col) {
  // Get the skill type for this grid position
  const currentLayout = getCurrentSkillGridLayout();
  const skillType = currentLayout[row][col];
  const skillInfo = SKILL_TREE[skillType];

  // Add CSS class based on skill usage type
  if (skillInfo.usageType === SKILL_USAGE_TYPES.ACTIVE) {
    element.classList.add('skill-active');
  } else if (skillInfo.usageType === SKILL_USAGE_TYPES.ACTIVE_PASSIVE) {
    element.classList.add('skill-active-passive');
  }

  // Use CSS clipping to show the correct icon from sprite sheet
  const { x, y } = getIconPosition(skillInfo.iconRow, skillInfo.iconCol);

  // Get the current player for level display
  const player = currentSkillTreePlayer !== null ? window.players[currentSkillTreePlayer] : null;

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
  if (skillInfo.usageType === SKILL_USAGE_TYPES.ACTIVE) {
    const indicator = document.createElement('div');
    indicator.className = 'skill-type-indicator';
    indicator.textContent = '⚡';
    indicator.title = 'Активно умение - изисква ръчно активиране';
    element.appendChild(indicator);
  } else if (skillInfo.usageType === SKILL_USAGE_TYPES.ACTIVE_PASSIVE) {
    const indicator = document.createElement('div');
    indicator.className = 'skill-type-indicator';
    indicator.textContent = '🔄';
    indicator.title = 'Активно-пасивно умение - toggle с ресурсна цена';
    element.appendChild(indicator);
  }

  // Add level indicator
  if (player) {
    const levelIndicator = document.createElement('div');
    levelIndicator.className = 'skill-level-indicator';
    levelIndicator.textContent = getSkillLevelDisplay(player, skillType);
    element.appendChild(levelIndicator);
  }
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
  if (currentSkillTreePlayer === null) return;

  const player = window.players[currentSkillTreePlayer];
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

  const skillInfo = SKILL_TREE[skillType];

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

function getResourceDisplay(skillInfo) {
  if (skillInfo.resourceType === RESOURCE_TYPES.NONE) {
    return 'None';
  } else if (skillInfo.resourceType === RESOURCE_TYPES.MANA) {
    return `${skillInfo.resourceCost} Mana`;
  } else if (skillInfo.resourceType === RESOURCE_TYPES.ENERGY) {
    return `${skillInfo.resourceCost} Energy`;
  }
  return 'Unknown';
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
  if (currentMenu !== 'skills') return;

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
  if (currentSkillTreePlayer === null) return;

  const player = window.players[currentSkillTreePlayer];
  const currentLayout = getCurrentSkillGridLayout();
  const skillType = currentLayout[skillCursorRow][skillCursorCol];

  if (!skillType) return; // Empty slot

  const skillInfo = SKILL_TREE[skillType];
  const currentLevel = window.skillTreeManager.getSkillLevel(player, skillType);

  // Check if this is an ACTIVE skill that's already unlocked and has a micro tree
  if (skillInfo.usageType === SKILL_USAGE_TYPES.ACTIVE &&
      currentLevel >= 1 &&
      skillInfo.microTree) {
    // Open micro skill tree instead of upgrading
    showMicroTreeForSkill(skillType);
    return;
  }

  // Normal unlock/upgrade logic
  if (window.skillTreeManager.unlockSkill(player, skillType)) {
    console.log(`Player ${currentSkillTreePlayer + 1} unlocked skill: ${SKILL_TREE[skillType].name}`);

    // Update title with new skill points
    const titleEl = document.getElementById('skillTreeTitle');
    titleEl.textContent = `Дърво на уменията - Играч ${currentSkillTreePlayer + 1} / Налични точки за разпределение: ${player.skillPoints}`;

    // Refresh skill tree
    renderSkillTree(player);
  }
}

// Глобална функция за превключване на главното меню
function toggleMenu() {
  if (menuActive) {
    hideMenu();
  } else {
    showMenu();
  }
}

// Character Stats Functions
function showCharacterStatsForPlayer(playerIndex) {
  console.log(`[CHARACTER STATS] Attempting to show for player ${playerIndex + 1} (index: ${playerIndex})`);
  if (playerIndex < 0 || playerIndex >= window.players.length) {
    console.log(`[CHARACTER STATS] Invalid player index: ${playerIndex}`);
    return;
  }

  currentCharacterStatsPlayer = playerIndex;
  console.log(`[CHARACTER STATS] Setting currentCharacterStatsPlayer to index ${playerIndex}`);

  // Show character stats
  window.characterStatsUI.showForPlayer(playerIndex);

  console.log(`[CHARACTER STATS] Show completed successfully`);
}

function hideCharacterStats() {
  console.log(`[CHARACTER STATS] Hiding character stats (was for player index: ${currentCharacterStatsPlayer})`);
  currentCharacterStatsPlayer = null;
  menuActive = false;
  currentMenu = 'main';
  window.characterStatsUI.hide();
  cleanupCharacterStatsInput();
  console.log(`[CHARACTER STATS] Hide completed`);
}

function setupCharacterStatsInput() {
  // Character stats menu uses simple toggle - no complex navigation needed
  // Just listen for the toggle key again to close
  document.addEventListener('keydown', handleCharacterStatsKeyDown);
}

function cleanupCharacterStatsInput() {
  document.removeEventListener('keydown', handleCharacterStatsKeyDown);
}

function handleCharacterStatsKeyDown(e) {
  if (currentMenu !== 'characterStats') return;

  // For now, character stats menu only closes with Escape or the player's toggle key
  // In the future, we can add navigation if needed
  if (e.key === 'Escape') {
    e.preventDefault();
    hideCharacterStats();
  }
}

// Function to switch skill tree page
function switchSkillTreePage(page) {
  if (page !== SKILL_PAGES.MAIN && page !== SKILL_PAGES.SECONDARY) {
    console.error(`Invalid skill page: ${page}`);
    return;
  }

  currentSkillPage = page;

  // Update tab active states
  const mainTabEl = document.getElementById('mainPageTab');
  const secondaryTabEl = document.getElementById('secondaryPageTab');

  if (mainTabEl) {
    if (page === SKILL_PAGES.MAIN) {
      mainTabEl.classList.add('active');
    } else {
      mainTabEl.classList.remove('active');
    }
  }

  if (secondaryTabEl) {
    if (page === SKILL_PAGES.SECONDARY) {
      secondaryTabEl.classList.add('active');
    } else {
      secondaryTabEl.classList.remove('active');
    }
  }

  // Reset cursor to top-left when switching pages
  skillCursorRow = 0;
  skillCursorCol = 0;

  // Re-render skill tree for current player
  if (currentSkillTreePlayer !== null) {
    const player = window.players[currentSkillTreePlayer];
    renderSkillTree(player);

    // Update cursor position after re-rendering
    setTimeout(() => {
      updateCursorPosition();
    }, 0);
  }

  console.log(`Switched to skill tree page: ${page}`);
}

// Helper function to get skill type display text
function getSkillTypeDisplayText(usageType) {
  switch (usageType) {
    case SKILL_USAGE_TYPES.ACTIVE:
      return 'Активно';
    case SKILL_USAGE_TYPES.PASSIVE:
      return 'Пасивно';
    case SKILL_USAGE_TYPES.ACTIVE_PASSIVE:
      return 'Активно-пасивно';
    default:
      return 'Неизвестен тип';
  }
}

// Make skill tree and character stats functions global
window.showSkillTreeForPlayer = showSkillTreeForPlayer;
window.hideSkillTree = hideSkillTree;
window.showCharacterStatsForPlayer = showCharacterStatsForPlayer;
window.hideCharacterStats = hideCharacterStats;
window.toggleMenu = toggleMenu;
window.switchSkillTreePage = switchSkillTreePage;
