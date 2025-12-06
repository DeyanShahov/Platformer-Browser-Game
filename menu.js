// Menu system for Platformer Game
let menuActive = false;
let currentMenu = 'main'; // 'main', 'controls'

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
  `;
  document.body.appendChild(menuDiv);

  // Event listeners
  document.getElementById('changeControlsBtn').addEventListener('click', showControlsMenu);
  document.getElementById('backToGameBtn').addEventListener('click', hideMenu);
  document.getElementById('backToMainBtn').addEventListener('click', showMainMenu);

  // Menu toggle
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'm') {
      if (menuActive) {
        hideMenu();
      } else {
        showMenu();
      }
    }
  });

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
  menuActive = false;
  document.getElementById('gameMenu').style.display = 'none';
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
