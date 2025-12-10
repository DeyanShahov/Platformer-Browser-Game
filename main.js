// Main initialization
let ctx;
let gameState = 'start'; // 'start', 'playing'

// Character definitions
const characters = [
  { id: 'blue', name: 'Син герой', color: '#3AA0FF', position: 0 },
  { id: 'orange', name: 'Оранжев герой', color: '#FFA500', position: 30 },
  { id: 'green', name: 'Зелен герой', color: '#00FF00', position: 60 },
  { id: 'red', name: 'Червен герой', color: '#FF0000', position: 90 }
];

// Player selections and active players
let playerSelections = {}; // Temporary selections
let confirmedSelections = {}; // Confirmed/final selections
let activePlayers = new Set(); // Track which players have joined
let detectedPlayers = 1; // Keyboard always available

// Start screen key/code tracking
let startScreenKeys = {};
let startScreenKeysPressed = {};
let startScreenCodes = {};
let startScreenCodesPressed = {};

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
    // Track both key and code
    startScreenKeys[e.key] = true;
    startScreenCodes[e.code] = true;

    if (!startScreenKeysPressed[e.key]) {
      startScreenKeysPressed[e.key] = true;
    }
    if (!startScreenCodesPressed[e.code]) {
      startScreenCodesPressed[e.code] = true;
    }
  }
}

function handleStartScreenKeyUp(e) {
  if (gameState === 'start') {
    // Clear both key and code
    startScreenKeys[e.key] = false;
    startScreenCodes[e.code] = false;

    startScreenKeysPressed[e.key] = false;
    startScreenCodesPressed[e.code] = false;
  }
}

function isStartScreenKeyPressed(key) {
  return startScreenKeysPressed[key];
}

function isStartScreenCodePressed(code) {
  return startScreenCodesPressed[code];
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
      <div class="instructions">Press 1-4 to join as Player X, then select unique character</div>
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

  // Update status with joined players info
  updatePlayerStatus();
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

  // Show joined players count on canvas
  const joinedCount = activePlayers.size;
  if (joinedCount > 0) {
    ctx.font = '24px Arial';
    ctx.fillText(`${joinedCount} player${joinedCount > 1 ? 's' : ''} joined`, CANVAS_WIDTH / 2, 150);
  }

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
  // Player join keys (1-4) - ONLY main keyboard, not numpad
  if (isStartScreenCodePressed('Digit1')) {
    joinPlayer(1);
    startScreenCodesPressed['Digit1'] = false;
  } else if (isStartScreenCodePressed('Digit2')) {
    joinPlayer(2);
    startScreenCodesPressed['Digit2'] = false;
  } else if (isStartScreenCodePressed('Digit3')) {
    joinPlayer(3);
    startScreenCodesPressed['Digit3'] = false;
  } else if (isStartScreenCodePressed('Digit4')) {
    joinPlayer(4);
    startScreenCodesPressed['Digit4'] = false;
  }

  // Character selection for active players
  activePlayers.forEach(playerId => {
    if (playerId === 1) {
      // Player 1 controls (main keyboard)
      if (isStartScreenKeyPressed('ArrowLeft') || isStartScreenKeyPressed('a')) {
        selectCharacter(1, 'previous');
        startScreenKeysPressed['ArrowLeft'] = false;
        startScreenKeysPressed['a'] = false;
      } else if (isStartScreenKeyPressed('ArrowRight') || isStartScreenKeyPressed('d')) {
        selectCharacter(1, 'next');
        startScreenKeysPressed['ArrowRight'] = false;
        startScreenKeysPressed['d'] = false;
      } else if (isStartScreenCodePressed('Enter') || isStartScreenKeyPressed(' ')) {
        confirmSelection(1);
        startScreenCodesPressed['Enter'] = false;
        startScreenKeysPressed[' '] = false;
      }
    } else if (playerId === 2) {
      // Player 2 controls (numpad)
      if (isStartScreenCodePressed('Numpad4')) { // Numpad 4 (left)
        selectCharacter(2, 'previous');
        startScreenCodesPressed['Numpad4'] = false;
      } else if (isStartScreenCodePressed('Numpad6')) { // Numpad 6 (right)
        selectCharacter(2, 'next');
        startScreenCodesPressed['Numpad6'] = false;
      } else if (isStartScreenCodePressed('Numpad0') || isStartScreenCodePressed('NumpadEnter')) { // Numpad 0 or Enter
        confirmSelection(2);
        startScreenCodesPressed['Numpad0'] = false;
        startScreenCodesPressed['NumpadEnter'] = false;
      }
    }
    // Players 3-4 would use controller input
  });

  // Controller inputs for joined players
  const gamepads = navigator.getGamepads();
  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      const playerId = i + 2; // Player 2, 3, 4...
      if (activePlayers.has(playerId)) {
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
}

function joinPlayer(playerId) {
  if (!activePlayers.has(playerId)) {
    activePlayers.add(playerId);
    console.log(`Player ${playerId} joined!`);

    // Auto-assign first available character
    assignFirstAvailableCharacter(playerId);

    // Auto-confirm for Players 3 & 4 (console testing only)
    if (playerId >= 3) {
      confirmSelection(playerId);
    }

    updatePlayerStatus();

    // Reset start button state - new player needs to confirm selection
    updateStartButton();
  }
}

function removePlayer(playerId) {
  if (activePlayers.has(playerId)) {
    activePlayers.delete(playerId);

    // Clean up selections for this player
    for (let charId in playerSelections) {
      if (playerSelections[charId] === playerId) {
        delete playerSelections[charId];
        updateSelectionUI(charId);
      }
    }

    for (let charId in confirmedSelections) {
      if (confirmedSelections[charId] === playerId) {
        delete confirmedSelections[charId];
        updateSelectionUI(charId);
      }
    }

    updatePlayerStatus();
    updateStartButton();

    console.log(`Player ${playerId} removed!`);
  }
}

// Make functions globally accessible for testing
window.joinPlayer = joinPlayer;
window.removePlayer = removePlayer;

function assignFirstAvailableCharacter(playerId) {
  // Find first available character (not taken by any player)
  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    if (!isCharacterTaken(char.id, null)) { // null = check if taken by anyone
      playerSelections[char.id] = playerId;
      updateSelectionUI(char.id);
      console.log(`Player ${playerId} auto-assigned to ${char.name}`);
      break;
    }
  }
}

function updatePlayerStatus() {
  const statusEl = document.getElementById('playerStatus');
  const joinedPlayers = Array.from(activePlayers).sort();

  if (joinedPlayers.length === 0) {
    // No players joined yet - show join instructions
    statusEl.textContent = 'Press 1-4 to join as Player X';
  } else {
    // Show joined players and device detection
    const joinedText = `Players joined: ${joinedPlayers.join(', ')}`;
    const deviceText = detectedPlayers > 1 ? ` | ${detectedPlayers} devices detected` : '';
    statusEl.textContent = joinedText + deviceText;
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

  // Calculate new index (skip taken characters)
  let attempts = 0;
  let newIndex = currentIndex;

  do {
    if (direction === 'next') {
      newIndex = (newIndex + 1) % characters.length;
    } else if (direction === 'previous') {
      newIndex = newIndex <= 0 ? characters.length - 1 : newIndex - 1;
    }
    attempts++;
  } while (isCharacterTaken(characters[newIndex].id, playerId) && attempts < characters.length);

  // If we couldn't find an available character, don't change selection
  if (isCharacterTaken(characters[newIndex].id, playerId)) {
    return;
  }

  // Clear previous selection and confirmed selection for this player
  for (let charId in playerSelections) {
    if (playerSelections[charId] === playerId) {
      delete playerSelections[charId];
      updateSelectionUI(charId);
    }
  }

  // Remove any confirmed selections for this player (they must reconfirm)
  for (let charId in confirmedSelections) {
    if (confirmedSelections[charId] === playerId) {
      delete confirmedSelections[charId];
      // Update UI for the old confirmed character
      updateSelectionUI(charId);
      console.log(`Player ${playerId} changed selection, removed confirmed choice`);
      break; // Should only have one confirmed selection per player
    }
  }

  // Set new selection (temporarily highlight)
  const newChar = characters[newIndex];
  playerSelections[newChar.id] = playerId;
  updateSelectionUI(newChar.id);

  // Update start button since confirmed selections may have changed
  updateStartButton();
}

function isCharacterTaken(charId, excludePlayerId) {
  // Check if character is selected by another player
  for (let selectedCharId in playerSelections) {
    if (selectedCharId === charId && playerSelections[selectedCharId] !== excludePlayerId) {
      return true;
    }
  }
  return false;
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
    // Move from temporary to confirmed selections
    confirmedSelections[selectedChar] = playerId;

    // Mark as confirmed (permanent)
    const indicator = document.getElementById(`selection-${selectedChar}`);
    if (indicator) {
      indicator.textContent = `Player ${playerId}`;
      indicator.classList.add('confirmed');
    } 

    console.log(`Player ${playerId} confirmed selection of ${characters.find(c => c.id === selectedChar).name}`);

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

  // Check if all joined players have confirmed their selections
  const joinedPlayers = Array.from(activePlayers);
  const allConfirmed = joinedPlayers.every(playerId => {
    // Check if this player has a confirmed selection
    return Object.values(confirmedSelections).includes(playerId);
  });

  const hasSelections = Object.keys(confirmedSelections).length > 0;

  if (joinedPlayers.length === 1) {
    // Single player - just needs any selection
    startBtn.disabled = !hasSelections;
    startBtn.textContent = hasSelections ? 'Start Game' : 'Select Character First';
  } else {
    // Multiple players - all must confirm
    startBtn.disabled = !allConfirmed;
    startBtn.textContent = allConfirmed ? 'Start Game' : 'All Players Must Confirm Selection';
  }
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

  // Initialize damage number manager
  if (window.damageNumberManager) {
    window.damageNumberManager.init(canvas);
  }

  // Инициализация на game state система
  window.gameState = new GameState();
  console.log('[MAIN] Game state initialized');

  // Clear global arrays for backwards compatibility
  window.players = [];
  console.log('[MAIN] window.players cleared and set to:', window.players);

  // Create players based on confirmed selections (sorted by player ID for consistent ordering)
  const selectedChars = Object.keys(confirmedSelections).sort((a, b) =>
    confirmedSelections[a] - confirmedSelections[b]
  );
  console.log('[MAIN] Creating players for selectedChars:', selectedChars);
  selectedChars.forEach((charId, index) => {
    const char = characters.find(c => c.id === charId);
    const playerId = confirmedSelections[charId];
    const playerKey = `player${playerId}`;

    console.log(`[MAIN] Creating player ${playerId} with key ${playerKey}, controls exist:`, !!window.controls[playerKey]);

    if (window.controls[playerKey]) {
      const x = 100 + (index * 100);
      const player = new Player(window.controls[playerKey], x, CANVAS_HEIGHT - 100, char.position, char.color, char.id);

      // Give some skill points for testing (remove in production)
      player.skillPoints = 5;

      console.log(`[MAIN] Player ${playerId} created:`, player);

      // Добавяне в game state вместо директно в players
      window.gameState.addEntity(player, 'player');
      console.log(`[MAIN] Player ${playerId} added to game state`);
    } else {
      console.warn(`No controls found for player ${playerId} (${playerKey})`);
    }
  });
  console.log('[MAIN] Final game state debug:', window.gameState.getDebugInfo());

  // Create NPCs using the new enemy data system
  const enemy = createEnemyWithData('basic', 1); // Basic enemy, level 1
  window.gameState.addEntity(enemy, 'enemy');
  console.log('Enemy 1 added to game state:', enemy.id);

  // Добавяне на втори противник за тест на множество противници
  const enemy2 = createEnemyWithData('elite', 2); // Elite enemy, level 2
  enemy2.x = 550; // Позициониране вдясно
  enemy2.z = 30; // Различна Z позиция
  window.gameState.addEntity(enemy2, 'enemy');
  console.log('Enemy 2 added to game state:', enemy2.id);

  // Добавяне на съюзник
  const ally = createEntity(520, CANVAS_HEIGHT - 100, 90, 50, 50, "#00FF00");
  window.gameState.addEntity(ally, 'ally');
  console.log('Ally added to game state:', ally.id);

  // За backwards compatibility - players array се поддържа автоматично от game state
  window.players = window.gameState.players;

  // Initialize menu
  initMenu();

  // Start game loop
  requestAnimationFrame(loop);
}

function initGame() {
  // Legacy function - redirects to new system
  initStartScreen();
}
