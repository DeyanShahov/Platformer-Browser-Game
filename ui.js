// UI System for Platformer Game
// Character status display in upper left corner

// Start screen input tracking - original system restored
let startScreenKeys = {};
let startScreenKeysPressed = {};
let startScreenCodes = {};
let startScreenCodesPressed = {};

// ===========================================
// CHARACTER SELECTION SYSTEM - moved from game.js
// ===========================================

// Character selection state variables - moved from game.js
let playerSelections = {}; // Temporary selections
let confirmedSelections = {}; // Confirmed/final selections
let activePlayers = new Set(); // Track which players have joined
let detectedPlayers = 1; // Keyboard always available

// Character selection functions - moved from game.js with parameter modifications
function updatePlayerDetection(detectedPlayersRef) {
  const gamepads = navigator.getGamepads();
  let controllerCount = 0;
  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) controllerCount++;
  }
  detectedPlayersRef.value = 1 + controllerCount; // Keyboard + controllers

  // Update status with joined players info
  updatePlayerStatus(activePlayers, detectedPlayersRef.value);
}

function updatePlayerStatus(activePlayers, detectedPlayers) {
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

function joinPlayer(playerId, activePlayers, playerSelections, detectedPlayersRef) {
  //console.log(`[DEBUG] joinPlayer(${playerId}) called`);
  if (!activePlayers.has(playerId)) {
    //console.log(`[DEBUG] Adding player ${playerId} to activePlayers`);
    activePlayers.add(playerId);
    //console.log(`Player ${playerId} joined!`);

    // Auto-assign first available character
    assignFirstAvailableCharacter(playerId, window.characters, playerSelections);

    // Auto-confirm for Players 3 & 4 (console testing only)
    if (playerId >= 3) {
      confirmSelection(playerId, playerSelections, confirmedSelections);
    }

    updatePlayerStatus(activePlayers, detectedPlayersRef.value);

    // Reset start button state - new player needs to confirm selection
    updateStartButton(activePlayers, confirmedSelections);
  } else {
    //console.log(`[DEBUG] Player ${playerId} already active`);
  }
}

function removePlayer(playerId, activePlayers, playerSelections, confirmedSelections) {
  if (activePlayers.has(playerId)) {
    activePlayers.delete(playerId);

    // Clean up selections for this player
    for (let charId in playerSelections) {
      if (playerSelections[charId] === playerId) {
        delete playerSelections[charId];
        updateSelectionUI(charId, playerSelections);
      }
    }

    for (let charId in confirmedSelections) {
      if (confirmedSelections[charId] === playerId) {
        delete confirmedSelections[charId];
        updateSelectionUI(charId, playerSelections);
      }
    }

    updatePlayerStatus(activePlayers, detectedPlayers);

    updateStartButton(activePlayers, confirmedSelections);

    //console.log(`Player ${playerId} removed!`);
  }
}

function assignFirstAvailableCharacter(playerId, characters, playerSelections) {
  // Find first available character (not taken by any player)
  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    if (!isCharacterTaken(char.id, null, playerSelections)) { // null = check if taken by anyone
      playerSelections[char.id] = playerId;
      updateSelectionUI(char.id, playerSelections);
      //console.log(`Player ${playerId} auto-assigned to ${char.name}`);
      break;
    }
  }
}

function selectCharacter(playerId, direction, characters, playerSelections, confirmedSelections) {
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
  } while (isCharacterTaken(characters[newIndex].id, playerId, playerSelections) && attempts < characters.length);

  // If we couldn't find an available character, don't change selection
  if (isCharacterTaken(characters[newIndex].id, playerId, playerSelections)) {
    return;
  }

  // Clear previous selection and confirmed selection for this player
  for (let charId in playerSelections) {
    if (playerSelections[charId] === playerId) {
      delete playerSelections[charId];
      updateSelectionUI(charId, playerSelections);
    }
  }

  // Remove any confirmed selections for this player (they must reconfirm)
  for (let charId in confirmedSelections) {
    if (confirmedSelections[charId] === playerId) {
      delete confirmedSelections[charId];
      // Update UI for the old confirmed character
      updateSelectionUI(charId, playerSelections);
      //console.log(`Player ${playerId} changed selection, removed confirmed choice`);
      break; // Should only have one confirmed selection per player
    }
  }

  // Set new selection (temporarily highlight)
  const newChar = characters[newIndex];
  playerSelections[newChar.id] = playerId;
  updateSelectionUI(newChar.id, playerSelections);

  // Update start button since confirmed selections may have changed
  updateStartButton(activePlayers, confirmedSelections);
}

function isCharacterTaken(charId, excludePlayerId, playerSelections) {
  // Check if character is selected by another player
  for (let selectedCharId in playerSelections) {
    if (selectedCharId === charId && playerSelections[selectedCharId] !== excludePlayerId) {
      return true;
    }
  }
  return false;
}

function confirmSelection(playerId, playerSelections, confirmedSelections) {
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

    //console.log(`Player ${playerId} confirmed selection of ${window.characters.find(c => c.id === selectedChar).name}`);

    // Check if we can start the game
    updateStartButton(activePlayers, confirmedSelections);
  }
}

function updateSelectionUI(charId, playerSelections) {
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

function updateStartButton(activePlayers, confirmedSelections) {
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

// Render status bar helper function
function renderStatusBar(ctx, label, current, max, x, y, width, height, color, bgColor = '#333') {
  // Background bar
  ctx.fillStyle = bgColor;
  ctx.fillRect(x, y, width, height);

  // Fill bar
  const fillWidth = (current / max) * (width - 4);
  ctx.fillStyle = color;
  ctx.fillRect(x + 2, y + 2, fillWidth, height - 4);

  // Border
  ctx.strokeStyle = '#666';
  ctx.strokeRect(x, y, width, height);

  // Text
  ctx.fillStyle = '#fff';
  ctx.font = '14px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`${label}: ${Math.floor(current)}/${max}`, x + width + 12, y + height - 2);
}

// Render character portrait/icon
function renderCharacterPortrait(ctx, player, x, y, size = 60) {
  // Player number - now positioned to the left of portrait
  ctx.fillStyle = '#fff';
  ctx.font = '18px Arial';
  ctx.textAlign = 'right';
  const playerIndex = window.players.indexOf(player) + 1;
  ctx.fillText(`P${playerIndex}`, x - 12, y + size / 2 + 8);

  // Portrait background
  ctx.fillStyle = '#222';
  ctx.fillRect(x, y, size, size);

  // Character color square
  ctx.fillStyle = player.color;
  ctx.fillRect(x + 7.5, y + 7.5, size - 15, size - 15);

  // Border
  ctx.strokeStyle = '#666';
  ctx.strokeRect(x, y, size, size);
}

// Render complete status UI for a single player
function renderCharacterStatusUI(ctx, player, x, y) {
  const barWidth = 150;  // Increased from 120
  const barHeight = 20;  // Increased from 16
  const spacing = 30;    // Increased from 25

  // Save current canvas state
  ctx.save();

  // Character portrait
  renderCharacterPortrait(ctx, player, x, y);

  let currentX = x + 75; // Position bars to the right of portrait (increased from 50)
  const barStartY = y; // Align bars with top of portrait

  // Health bar (red)
  renderStatusBar(ctx, 'HP', player.health, player.maxHealth, currentX, barStartY, barWidth, barHeight, '#ff0000');

  // Energy bar (yellow/orange)
  renderStatusBar(ctx, 'EN', player.energy, player.maxEnergy, currentX, barStartY + spacing, barWidth, barHeight, '#ffa500');

  // Mana bar (blue)
  renderStatusBar(ctx, 'MP', player.mana, player.maxMana, currentX, barStartY + spacing * 2, barWidth, barHeight, '#0088ff');

  // Restore canvas state
  ctx.restore();
}

// Main UI rendering function - renders all player status UIs in screen halves
function renderPlayerPortraits(ctx) {
  // Use gameState.players directly instead of window.players for reliability
  const players = window.gameState ? window.gameState.players : (window.players || []);
  if (!players || players.length === 0) return;

  // Define half-screen positions for up to 4 players
  const halfPositions = [
    { x: 40, y: 10 },           // Top-left half (Player 1)
    { x: CANVAS_WIDTH / 2 - 100, y: 10 },    // Top-right half (Player 2) - moved left for larger UI
    { x: 40, y: 950 },          // Player 3 - moved up slightly for larger UI
    { x: CANVAS_WIDTH / 2 - 100, y: 950 }   // Player 4 - moved left and up for larger UI
  ];

  players.forEach((player, index) => {
    if (index < halfPositions.length) {
      const position = halfPositions[index];
      renderCharacterStatusUI(ctx, player, position.x, position.y);
    }
  });
}

// ===========================================
// START SCREEN UI - game logic moved to game.js
// ===========================================

function initStartScreen() {
  // Setup canvas
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  // Create start screen HTML
  createStartScreen();

  // Update player detection - delegate to game logic with parameters
  if (window.UISystem && typeof window.UISystem.updatePlayerDetection === 'function') {
    window.UISystem.updatePlayerDetection({ value: window.UISystem.detectedPlayers });
  }

  // Setup start screen input handling - delegate to game logic
  setupStartScreenInput();

  // Start render loop for start screen
  requestAnimationFrame(startScreenLoop);
}

function setupStartScreenInput() {
  // Add keyboard event listeners for start screen - delegate to game logic
  document.addEventListener('keydown', handleStartScreenKeyDown);
  document.addEventListener('keyup', handleStartScreenKeyUp);
}

function handleStartScreenKeyDown(e) {
  //console.log('[DEBUG] KeyDown:', e.key, e.code, 'gameState:', window.gameState);

  // Original key tracking system restored
  if (window.gameState === 'start') {
    //console.log('[DEBUG] Processing key in start screen');
    // Track both key and code
    startScreenKeys[e.key] = true;
    startScreenCodes[e.code] = true;

    if (!startScreenKeysPressed[e.key]) {
      startScreenKeysPressed[e.key] = true;
      //console.log('[DEBUG] Set startScreenKeysPressed[' + e.key + '] = true');
    }
    if (!startScreenCodesPressed[e.code]) {
      startScreenCodesPressed[e.code] = true;
      //console.log('[DEBUG] Set startScreenCodesPressed[' + e.code + '] = true');
    }
  }
}

function handleStartScreenKeyUp(e) {
  // Original key tracking system restored
  if (window.gameState === 'start') {
    // Clear both key and code
    startScreenKeys[e.key] = false;
    startScreenCodes[e.code] = false;

    startScreenKeysPressed[e.key] = false;
    startScreenCodesPressed[e.code] = false;
  }
}

function createStartScreen() {
  const startScreen = document.createElement('div');
  startScreen.id = 'startScreen';
  startScreen.innerHTML = `
    <div class="start-screen">
      <h1 class="game-title">Demo Game</h1>
      <div class="player-status" id="playerStatus">Detecting players...</div>
      <div class="character-grid">
        ${window.characters.map(char => `
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
  document.getElementById('startGameBtn').addEventListener('click', () => {
    // Hide start screen
    const startScreen = document.getElementById('startScreen');
    if (startScreen) {
      startScreen.style.display = 'none';
    }

    // Set game state
    window.gameState = 'playing';

    // Call game initialization from main.js with parameters
    if (typeof window.initGameWithSelections === 'function') {
      window.initGameWithSelections(
        window.UISystem.activePlayers,
        window.UISystem.playerSelections,
        window.UISystem.confirmedSelections,
        window.characters
      );
    } else {
      console.error('[UI] initGameWithSelections function not found');
    }
  });
}

function startScreenLoop() {
  if (window.gameState === 'start') {
    renderStartScreen();
    requestAnimationFrame(startScreenLoop);
  }
}

function renderStartScreen() {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  // Clear canvas
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Render title and instructions on canvas as well
  ctx.fillStyle = '#fff';
  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Demo Game', CANVAS_WIDTH / 2, 100);

  // Show joined players count on canvas - use UI system state
  const joinedCount = window.UISystem.activePlayers.size;
  if (joinedCount > 0) {
    ctx.font = '24px Arial';
    ctx.fillText(`${joinedCount} player${joinedCount > 1 ? 's' : ''} joined`, CANVAS_WIDTH / 2, 150);
  }

  // Render character options
  window.characters.forEach((char, index) => {
    const x = 150 + (index * 200);
    const y = CANVAS_HEIGHT / 2;

    // Draw character square
    ctx.fillStyle = char.color;
    ctx.fillRect(x - 25, y - 25, 50, 50);

    // Draw selection indicator - use UI system state
    if (window.UISystem.playerSelections[char.id]) {
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.fillText(`P${window.UISystem.playerSelections[char.id]}`, x, y + 50);
    }
  });

  // Check for input - original system restored
  handleStartScreenInput();
}

// Original input handling functions restored
function isStartScreenKeyPressed(key) {
  const index = startScreenKeysPressed[key];
  if (index) {
    startScreenKeysPressed[key] = false; // Consume the press
    return true;
  }
  return false;
}

function isStartScreenCodePressed(code) {
  const index = startScreenCodesPressed[code];
  if (index) {
    startScreenCodesPressed[code] = false; // Consume the press
    return true;
  }
  return false;
}

function handleStartScreenInput() {
  //console.log('[DEBUG] handleStartScreenInput called');

  // Handle keyboard input for start screen - original logic restored with parameter passing
  if (isStartScreenKeyPressed('1') || isStartScreenCodePressed('Digit1')) {
    //console.log('[DEBUG] Key 1/Digit1 pressed, calling joinPlayer(1)');
    if (window.UISystem && window.UISystem.joinPlayer) {
      window.UISystem.joinPlayer(1, window.UISystem.activePlayers, window.UISystem.playerSelections, { value: window.UISystem.detectedPlayers });
    } else {
      //console.error('[DEBUG] window.UISystem.joinPlayer not found!');
    }
  }
  if (isStartScreenKeyPressed('2') || isStartScreenCodePressed('Digit2')) {
    //console.log('[DEBUG] Key 2/Digit2 pressed, calling joinPlayer(2)');
    if (window.UISystem && window.UISystem.joinPlayer) {
      window.UISystem.joinPlayer(2, window.UISystem.activePlayers, window.UISystem.playerSelections, { value: window.UISystem.detectedPlayers });
    } else {
      //console.error('[DEBUG] window.UISystem.joinPlayer not found!');
    }
  }
  if (isStartScreenKeyPressed('3') || isStartScreenCodePressed('Digit3')) {
    //console.log('[DEBUG] Key 3/Digit3 pressed, calling joinPlayer(3)');
    if (window.UISystem && window.UISystem.joinPlayer) {
      window.UISystem.joinPlayer(3, window.UISystem.activePlayers, window.UISystem.playerSelections, { value: window.UISystem.detectedPlayers });
    } else {
      //console.error('[DEBUG] window.UISystem.joinPlayer not found!');
    }
  }
  if (isStartScreenKeyPressed('4') || isStartScreenCodePressed('Digit4')) {
    //console.log('[DEBUG] Key 4/Digit4 pressed, calling joinPlayer(4)');
    if (window.UISystem && window.UISystem.joinPlayer) {
      window.UISystem.joinPlayer(4, window.UISystem.activePlayers, window.UISystem.playerSelections, { value: window.UISystem.detectedPlayers });
    } else {
      //console.error('[DEBUG] window.UISystem.joinPlayer not found!');
    }
  }

  // Handle arrow keys for character selection (only key, not code - prevents double triggering)
  if (isStartScreenKeyPressed('ArrowLeft')) {
    //console.log('[DEBUG] ArrowLeft pressed for character selection');
    // Find the first joined player and select previous character
    const joinedPlayers = Array.from(window.UISystem.activePlayers || []);
    if (joinedPlayers.length > 0) {
      const firstPlayerId = joinedPlayers[0];
      if (window.UISystem && window.UISystem.selectCharacter) {
        window.UISystem.selectCharacter(firstPlayerId, 'previous', window.characters, window.UISystem.playerSelections, window.UISystem.confirmedSelections);
      }
    }
  }
  if (isStartScreenKeyPressed('ArrowRight')) {
    //console.log('[DEBUG] ArrowRight pressed for character selection');
    // Find the first joined player and select next character
    const joinedPlayers = Array.from(window.UISystem.activePlayers || []);
    if (joinedPlayers.length > 0) {
      const firstPlayerId = joinedPlayers[0];
      if (window.UISystem && window.UISystem.selectCharacter) {
        window.UISystem.selectCharacter(firstPlayerId, 'next', window.characters, window.UISystem.playerSelections, window.UISystem.confirmedSelections);
      }
    }
  }

  // Handle Enter key to confirm current player's selection
  if (isStartScreenKeyPressed('Enter') || isStartScreenCodePressed('Enter')) {
    //console.log('[UI] Enter pressed (WORKING) - confirming current player selection');
    //console.log('[UI] isStartScreenKeyPressed("Enter"):', isStartScreenKeyPressed('Enter'));
    //console.log('[UI] isStartScreenCodePressed("Enter"):', isStartScreenCodePressed('Enter'));
    // Find the first joined player who has a selection but hasn't confirmed
    const joinedPlayers = Array.from(window.UISystem.activePlayers || []);
    for (const playerId of joinedPlayers) {
      // Check if this player has a selection but not confirmed
      const hasSelection = Object.values(window.UISystem.playerSelections || {}).includes(playerId);
      const hasConfirmed = Object.values(window.UISystem.confirmedSelections || {}).includes(playerId);

      if (hasSelection && !hasConfirmed) {
        //console.log(`[DEBUG] Confirming selection for player ${playerId}`);
        if (window.UISystem && window.UISystem.confirmSelection) {
          window.UISystem.confirmSelection(playerId, window.UISystem.playerSelections, window.UISystem.confirmedSelections);
        }
        break; // Confirm only one player per ENTER press
      }
    }
  }
}

// Export functions for use in other files
window.UISystem = {
  renderPlayerPortraits,
  renderCharacterStatusUI,
  renderCharacterPortrait,
  renderStatusBar,
  initStartScreen,

  // Character selection system functions
  updatePlayerDetection,
  updatePlayerStatus,
  joinPlayer,
  removePlayer,
  assignFirstAvailableCharacter,
  selectCharacter,
  confirmSelection,
  updateSelectionUI,
  updateStartButton,
  isCharacterTaken,

  // Character selection state
  playerSelections,
  confirmedSelections,
  activePlayers,
  detectedPlayers
};

// ===========================================
// TRANSITION UI
// ===========================================

/**
 * Shows a loading screen for level transitions.
 * @param {object} data - Data for the loading screen.
 * @param {string} data.toLevel - The name of the level being loaded.
 */
function showLoadingScreen({ toLevel }) {
    // Check if a loading screen already exists
    if (document.getElementById('loadingScreen')) {
        return;
    }

    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loadingScreen';
    loadingScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: 'Arial', sans-serif;
        font-size: 2em;
    `;
    loadingScreen.textContent = `Loading: ${toLevel}...`;

    document.body.appendChild(loadingScreen);
}

/**
 * Hides the loading screen.
 */
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.remove();
    }
}

// Add to the global UI system
window.UISystem.showLoadingScreen = showLoadingScreen;
window.UISystem.hideLoadingScreen = hideLoadingScreen;
