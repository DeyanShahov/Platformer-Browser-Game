// Menu system for Platformer Game
let menuActive = false;
let currentMenu = 'main'; // 'main', 'controls'
window.controls = {
  player1: {
    inputMode: 'keyboard',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    up: 'ArrowUp',
    down: 'ArrowDown',
    jump: 'w',
    attack: 'q'
  },
  player2: {
    inputMode: 'controller',
    left: '4',
    right: '6',
    up: '8',
    down: '5',
    jump: '9',
    attack: '7'
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
    if (e.key === 'Escape' || e.key === 's') {
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

  // Create table structure
  const table = document.createElement('table');
  table.style.borderCollapse = 'collapse';
  table.style.width = '100%';

  // Header row
  const headerRow = document.createElement('tr');
  const actionHeader = document.createElement('th');
  actionHeader.textContent = 'Action';
  actionHeader.style.padding = '10px';
  actionHeader.style.border = '1px solid #444';
  actionHeader.style.color = '#fff';
  headerRow.appendChild(actionHeader);

  // Fixed 4 player columns
  for (let i = 1; i <= 4; i++) {
    const playerHeader = document.createElement('th');
    playerHeader.textContent = `Player ${i}`;
    playerHeader.style.padding = '10px';
    playerHeader.style.border = '1px solid #444';
    playerHeader.style.color = '#fff';
    headerRow.appendChild(playerHeader);
  }

  table.appendChild(headerRow);

  // Input Mode row
  const inputModeRow = document.createElement('tr');
  const inputModeLabel = document.createElement('td');
  inputModeLabel.textContent = 'Input Mode';
  inputModeLabel.style.padding = '8px';
  inputModeLabel.style.border = '1px solid #444';
  inputModeLabel.style.color = '#fff';
  inputModeLabel.style.fontWeight = 'bold';
  inputModeRow.appendChild(inputModeLabel);

  for (let i = 1; i <= 4; i++) {
    const player = `player${i}`;
    const inputModeCell = document.createElement('td');
    inputModeCell.style.padding = '8px';
    inputModeCell.style.border = '1px solid #444';
    inputModeCell.style.textAlign = 'center';

    if (window.controls[player]) {
      const select = document.createElement('select');
      select.style.background = '#444';
      select.style.color = '#fff';
      select.style.border = '1px solid #666';

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
      };

      inputModeCell.appendChild(select);
    } else {
      inputModeCell.textContent = 'N/A';
      inputModeCell.style.color = '#666';
    }

    inputModeRow.appendChild(inputModeCell);
  }

  table.appendChild(inputModeRow);

  // Action rows
  const actions = [
    { key: 'left', label: 'Move Left' },
    { key: 'right', label: 'Move Right' },
    { key: 'up', label: 'Move Up (Z+)' },
    { key: 'down', label: 'Move Down (Z-)' },
    { key: 'jump', label: 'Jump' },
    { key: 'attack', label: 'Attack' }
  ];

  actions.forEach(action => {
    const row = document.createElement('tr');

    // Action label
    const actionCell = document.createElement('td');
    actionCell.textContent = action.label;
    actionCell.style.padding = '8px';
    actionCell.style.border = '1px solid #444';
    actionCell.style.color = '#fff';
    row.appendChild(actionCell);

    // 4 Player control cells
    for (let i = 1; i <= 4; i++) {
      const player = `player${i}`;
      const controlCell = document.createElement('td');
      controlCell.style.padding = '8px';
      controlCell.style.border = '1px solid #444';
      controlCell.style.textAlign = 'center';

      if (window.controls[player]) {
        const keySpan = document.createElement('span');
        keySpan.id = `key-${player}-${action.key}`;
        keySpan.className = rebindingAction === `${player}-${action.key}` ? 'rebinding' : '';
        keySpan.textContent = window.controls[player][action.key];
        keySpan.style.marginRight = '10px';
        keySpan.style.color = rebindingAction === `${player}-${action.key}` ? 'yellow' : '#fff';

        const changeBtn = document.createElement('button');
        changeBtn.textContent = 'Change';
        changeBtn.setAttribute('onclick', `startRebinding('${player}', '${action.key}')`);

        controlCell.appendChild(keySpan);
        controlCell.appendChild(changeBtn);
      } else {
        controlCell.textContent = 'N/A';
        controlCell.style.color = '#666';
      }

      row.appendChild(controlCell);
    }

    table.appendChild(row);
  });

  controlsList.appendChild(table);
}

function startRebinding(player, action) {
  rebindingAction = `${player}-${action}`;
  updateControlsDisplay();

  const handler = (e) => {
    e.preventDefault();
    window.controls[player][action] = e.key;
    rebindingAction = null;
    saveControls();
    updateControlsDisplay();
    document.removeEventListener('keydown', handler);
  };

  document.addEventListener('keydown', handler);
}

// Make functions global for onclick
window.startRebinding = startRebinding;
