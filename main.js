// Main initialization
let ctx;
let gameState = 'start'; // 'start', 'playing'

// Character definitions
const characters = [
  { id: 'blue', name: 'Hero 1', color: '#3AA0FF', position: 0 },
  { id: 'orange', name: 'Hero 2', color: '#FFA500', position: 30 },
  { id: 'green', name: 'Hero 3', color: '#00FF00', position: 60 },
  { id: 'red', name: 'Hero 4', color: '#FF0000', position: 90 }
];

// Player selections
let playerSelections = {};
let detectedPlayers = 1; // Keyboard always available

// Start screen key tracking
let startScreenKeys = {};
let startScreenKeysPressed = {};

function initStartScreen() {
  // Setup canvas
  const canvas = document.getElementById("game");
  ctx = canvas.getContext("2d");

  // Create start screen HTML
  createStartScreen();

  // Update player detection
  updatePlayerDetection();

  // Setup start screen input handling
  setupStartScreenInput();

  // Start render loop for start screen
  requestAnimationFrame(startScreenLoop);
}

function setupStartScreenInput() {
  // Add keyboard event listeners for start screen
  document.addEventListener('keydown', handleStartScreenKeyDown);
  document.addEventListener('keyup', handleStartScreenKeyUp);
}

function handleStartScreenKeyDown(e) {
  if (gameState === 'start') {
    startScreenKeys[e.key] = true;
    if (!startScreenKeysPressed[e.key]) {
      startScreenKeysPressed[e.key] = true;
    }
  }
}

function handleStartScreenKeyUp(e) {
  if (gameState === 'start') {
    startScreenKeys[e.key] = false;
    startScreenKeysPressed[e.key] = false;
  }
}

function isStartScreenKeyPressed(key) {
  return startScreenKeysPressed[key];
}

function createStartScreen() {
  const startScreen = document.createElement('div');
  startScreen.id = 'startScreen';
  startScreen.innerHTML = `
    <div class="start-screen">
      <h1 class="game-title">Demo Game</h1>
      <div class="player-status" id="playerStatus">Detecting players...</div>
      <div class="character-grid">
        ${characters.map(char => `
          <div class="character-option" data-char="${char.id}">
            <div class="character-square" style="background-color: ${char.color}"></div>
            <div class="character-name">${char.name}</div>
            <div class="selection-indicator" id="selection-${char.id}"></div>
          </div>
        `).join('')}
      </div>
      <button id="startGameBtn" class="start-button" disabled>Start Game</button>
      <div class="instructions">Use keyboard/controller to select characters</div>
    </div>
  `;
  document.body.appendChild(startScreen);

  // Event listeners
  document.getElementById('startGameBtn').addEventListener('click', startGame);
}

function updatePlayerDetection() {
  const gamepads = navigator.getGamepads();
  let controllerCount = 0;
  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) controllerCount++;
  }
  detectedPlayers = 1 + controllerCount; // Keyboard + controllers

  const statusEl = document.getElementById('playerStatus');
  statusEl.textContent = `${detectedPlayers} player${detectedPlayers > 1 ? 's' : ''} detected`;
}

function startScreenLoop() {
  if (gameState === 'start') {
    renderStartScreen();
    requestAnimationFrame(startScreenLoop);
  }
}

function renderStartScreen() {
  // Clear canvas
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Render title and instructions on canvas as well
  ctx.fillStyle = '#fff';
  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Demo Game', CANVAS_WIDTH / 2, 100);

  ctx.font = '24px Arial';
  ctx.fillText(`${detectedPlayers} player${detectedPlayers > 1 ? 's' : ''} detected`, CANVAS_WIDTH / 2, 150);

  // Render character options
  characters.forEach((char, index) => {
    const x = 150 + (index * 200);
    const y = CANVAS_HEIGHT / 2;

    // Draw character square
    ctx.fillStyle = char.color;
    ctx.fillRect(x - 25, y - 25, 50, 50);

    // Draw selection indicator
    if (playerSelections[char.id]) {
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.fillText(`P${playerSelections[char.id]}`, x, y + 50);
    }
  });

  // Check for input
  handleStartScreenInput();
}

function handleStartScreenInput() {
  // Keyboard input for player 1
  if (isStartScreenKeyPressed('ArrowLeft') || isStartScreenKeyPressed('a')) {
    selectCharacter(1, 'previous');
    startScreenKeysPressed['ArrowLeft'] = false; // Reset to prevent continuous input
    startScreenKeysPressed['a'] = false;
  } else if (isStartScreenKeyPressed('ArrowRight') || isStartScreenKeyPressed('d')) {
    selectCharacter(1, 'next');
    startScreenKeysPressed['ArrowRight'] = false;
    startScreenKeysPressed['d'] = false;
  } else if (isStartScreenKeyPressed('Enter') || isStartScreenKeyPressed(' ')) {
    confirmSelection(1);
    startScreenKeysPressed['Enter'] = false;
    startScreenKeysPressed[' '] = false;
  }

  // Controller inputs for additional players
  const gamepads = navigator.getGamepads();
  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      const playerId = i + 2; // Player 2, 3, 4...
      const gp = gamepads[i];

      // D-pad left/right for selection
      if (gp.buttons[14].pressed) { // D-pad left
        selectCharacter(playerId, 'previous');
      } else if (gp.buttons[15].pressed) { // D-pad right
        selectCharacter(playerId, 'next');
      }

      // Jump button to confirm
      if (gp.buttons[7].pressed) { // R2
        confirmSelection(playerId);
      }
    }
  }
}

function selectCharacter(playerId, direction) {
  // Find current selection for this player
  let currentIndex = -1;
  for (let charId in playerSelections) {
    if (playerSelections[charId] === playerId) {
      currentIndex = characters.findIndex(c => c.id === charId);
      break;
    }
  }

  // Calculate new index
  if (direction === 'next') {
    currentIndex = (currentIndex + 1) % characters.length;
  } else if (direction === 'previous') {
    currentIndex = currentIndex <= 0 ? characters.length - 1 : currentIndex - 1;
  }

  // Clear previous selection
  for (let charId in playerSelections) {
    if (playerSelections[charId] === playerId) {
      delete playerSelections[charId];
      updateSelectionUI(charId);
    }
  }

  // Set new selection (temporarily highlight)
  const newChar = characters[currentIndex];
  playerSelections[newChar.id] = playerId;
  updateSelectionUI(newChar.id);
}

function confirmSelection(playerId) {
  // Find if player has a selection
  let selectedChar = null;
  for (let charId in playerSelections) {
    if (playerSelections[charId] === playerId) {
      selectedChar = charId;
      break;
    }
  }

  if (selectedChar) {
    // Mark as confirmed (permanent)
    const indicator = document.getElementById(`selection-${selectedChar}`);
    if (indicator) {
      indicator.textContent = `Player ${playerId}`;
      indicator.classList.add('confirmed');
    }

    // Check if we can start the game
    updateStartButton();
  }
}

function updateSelectionUI(charId) {
  const indicator = document.getElementById(`selection-${charId}`);
  if (indicator) {
    const playerId = playerSelections[charId];
    if (playerId) {
      indicator.textContent = `P${playerId}`;
      indicator.classList.remove('confirmed');
    } else {
      indicator.textContent = '';
    }
  }
}

function updateStartButton() {
  const startBtn = document.getElementById('startGameBtn');
  const hasSelections = Object.keys(playerSelections).length > 0;
  startBtn.disabled = !hasSelections;
  startBtn.textContent = hasSelections ? 'Start Game' : 'Select Characters First';
}

function startGame() {
  // Hide start screen
  const startScreen = document.getElementById('startScreen');
  if (startScreen) {
    startScreen.style.display = 'none';
  }

  // Set game state
  gameState = 'playing';

  // Initialize actual game with selected characters
  initGameWithSelections();
}

function initGameWithSelections() {
  // Setup canvas
  const canvas = document.getElementById("game");
  ctx = canvas.getContext("2d");

  // Create players based on selections
  const selectedChars = Object.keys(playerSelections);
  selectedChars.forEach((charId, index) => {
    const char = characters.find(c => c.id === charId);
    const playerId = playerSelections[charId];
    const playerKey = `player${playerId}`;

    if (window.controls[playerKey]) {
      const x = 100 + (index * 100);
      players.push(new Player(window.controls[playerKey], x, CANVAS_HEIGHT - 100, char.position, char.color));
    }
  });

  // Create NPCs
  enemy = createEntity(450, CANVAS_HEIGHT - 100, 50, 60, 60, "#FF3020");
  enemy.maxHealth = 200;
  enemy.health = enemy.maxHealth;
  enemy.currentAction = null;
  enemy.executionTimer = 0;
  enemy.hit = false;

  ally = createEntity(520, CANVAS_HEIGHT - 100, 90, 50, 50, "#00FF00");

  // Initialize menu
  initMenu();

  // Start game loop
  requestAnimationFrame(loop);
}

function initGame() {
  // Legacy function - redirects to new system
  initStartScreen();
}
