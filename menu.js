// Menu system for Platformer Game
let menuActive = false;
let currentMenu = 'main'; // 'main', 'controls'
let controls = {
  left: 'ArrowLeft',
  right: 'ArrowRight',
  up: 'ArrowUp',
  down: 'ArrowDown',
  jump: 'w',
  attack: 'q'
};
let rebindingAction = null;

// Load controls from localStorage
function loadControls() {
  const saved = localStorage.getItem('platformerControls');
  if (saved) {
    controls = JSON.parse(saved);
  }
}

// Save controls to localStorage
function saveControls() {
  localStorage.setItem('platformerControls', JSON.stringify(controls));
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
      <button id="changeControlsBtn">Change Controls</button>
      <button id="backToGameBtn">Back to Game</button>
    </div>
    <div id="controlsMenu" class="menu" style="display:none;">
      <h2>Change Controls</h2>
      <div id="controlsList"></div>
      <button id="backToMainBtn">Back</button>
    </div>
  `;
  menuDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    font-family: Arial, sans-serif;
    color: white;
  `;
  document.body.appendChild(menuDiv);

  // Menu styles
  const style = document.createElement('style');
  style.textContent = `
    .menu { text-align: center; }
    .menu h2 { margin-bottom: 20px; }
    .menu button {
      display: block;
      margin: 10px auto;
      padding: 10px 20px;
      background: #444;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    .menu button:hover { background: #666; }
    .control-item {
      margin: 10px 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .control-item span { margin: 0 10px; }
    .rebinding { color: yellow; }
  `;
  document.head.appendChild(style);

  // Event listeners
  document.getElementById('changeControlsBtn').addEventListener('click', showControlsMenu);
  document.getElementById('backToGameBtn').addEventListener('click', hideMenu);
  document.getElementById('backToMainBtn').addEventListener('click', showMainMenu);

  // Menu toggle
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (menuActive) {
        hideMenu();
      } else {
        showMenu();
      }
    }
  });

  updateControlsDisplay();
}

function showMenu() {
  menuActive = true;
  currentMenu = 'main';
  document.getElementById('gameMenu').style.display = 'flex';
  document.getElementById('mainMenu').style.display = 'block';
  document.getElementById('controlsMenu').style.display = 'none';
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

  Object.keys(controls).forEach(action => {
    const div = document.createElement('div');
    div.className = 'control-item';
    div.innerHTML = `
      <span>${action.toUpperCase()}:</span>
      <span id="key-${action}" class="${rebindingAction === action ? 'rebinding' : ''}">${controls[action]}</span>
      <button onclick="startRebinding('${action}')">Change</button>
    `;
    controlsList.appendChild(div);
  });
}

function startRebinding(action) {
  rebindingAction = action;
  updateControlsDisplay();

  const handler = (e) => {
    e.preventDefault();
    controls[action] = e.key;
    rebindingAction = null;
    saveControls();
    updateControlsDisplay();
    document.removeEventListener('keydown', handler);
  };

  document.addEventListener('keydown', handler);
}

// Make functions global for onclick
window.startRebinding = startRebinding;
