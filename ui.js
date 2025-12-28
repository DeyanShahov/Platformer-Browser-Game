// UI System for Platformer Game
// Character status display in upper left corner

// Start screen input tracking - original system restored
let startScreenKeys = {};
let startScreenKeysPressed = {};
let startScreenCodes = {};
let startScreenCodesPressed = {};

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
  ctx.fillText(`P${playerIndex}`, x - 12, y + size/2 + 8);

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
    { x: CANVAS_WIDTH/2 - 100, y: 10 },    // Top-right half (Player 2) - moved left for larger UI
    { x: 40, y: 950 },          // Player 3 - moved up slightly for larger UI
    { x: CANVAS_WIDTH/2 - 100, y: 950 }   // Player 4 - moved left and up for larger UI
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

  // Update player detection - delegate to game logic
  if (typeof updatePlayerDetection === 'function') {
    updatePlayerDetection();
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
  console.log('[DEBUG] KeyDown:', e.key, e.code, 'gameState:', window.gameState);

  // Original key tracking system restored
  if (window.gameState === 'start') {
    console.log('[DEBUG] Processing key in start screen');
    // Track both key and code
    startScreenKeys[e.key] = true;
    startScreenCodes[e.code] = true;

    if (!startScreenKeysPressed[e.key]) {
      startScreenKeysPressed[e.key] = true;
      console.log('[DEBUG] Set startScreenKeysPressed[' + e.key + '] = true');
    }
    if (!startScreenCodesPressed[e.code]) {
      startScreenCodesPressed[e.code] = true;
      console.log('[DEBUG] Set startScreenCodesPressed[' + e.code + '] = true');
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

    // Call game initialization from game.js
    if (typeof initGameWithSelections === 'function') {
      initGameWithSelections();
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

  // Show joined players count on canvas - delegate to game logic
  const joinedCount = window.activePlayers.size;
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

    // Draw selection indicator - delegate to game logic
    if (window.playerSelections[char.id]) {
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.fillText(`P${window.playerSelections[char.id]}`, x, y + 50);
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
  console.log('[DEBUG] handleStartScreenInput called');

  // Handle keyboard input for start screen - original logic restored
  if (isStartScreenKeyPressed('1') || isStartScreenCodePressed('Digit1')) {
    console.log('[DEBUG] Key 1/Digit1 pressed, calling joinPlayer(1)');
    if (window.joinPlayer) {
      window.joinPlayer(1);
    } else {
      console.error('[DEBUG] window.joinPlayer not found!');
    }
  }
  if (isStartScreenKeyPressed('2') || isStartScreenCodePressed('Digit2')) {
    console.log('[DEBUG] Key 2/Digit2 pressed, calling joinPlayer(2)');
    if (window.joinPlayer) {
      window.joinPlayer(2);
    } else {
      console.error('[DEBUG] window.joinPlayer not found!');
    }
  }
  if (isStartScreenKeyPressed('3') || isStartScreenCodePressed('Digit3')) {
    console.log('[DEBUG] Key 3/Digit3 pressed, calling joinPlayer(3)');
    if (window.joinPlayer) {
      window.joinPlayer(3);
    } else {
      console.error('[DEBUG] window.joinPlayer not found!');
    }
  }
  if (isStartScreenKeyPressed('4') || isStartScreenCodePressed('Digit4')) {
    console.log('[DEBUG] Key 4/Digit4 pressed, calling joinPlayer(4)');
    if (window.joinPlayer) {
      window.joinPlayer(4);
    } else {
      console.error('[DEBUG] window.joinPlayer not found!');
    }
  }

  // Handle arrow keys for character selection (only key, not code - prevents double triggering)
  if (isStartScreenKeyPressed('ArrowLeft')) {
    console.log('[DEBUG] ArrowLeft pressed for character selection');
    // Find the first joined player and select previous character
    const joinedPlayers = Array.from(window.activePlayers || []);
    if (joinedPlayers.length > 0) {
      const firstPlayerId = joinedPlayers[0];
      if (window.selectCharacter) {
        window.selectCharacter(firstPlayerId, 'previous');
      }
    }
  }
  if (isStartScreenKeyPressed('ArrowRight')) {
    console.log('[DEBUG] ArrowRight pressed for character selection');
    // Find the first joined player and select next character
    const joinedPlayers = Array.from(window.activePlayers || []);
    if (joinedPlayers.length > 0) {
      const firstPlayerId = joinedPlayers[0];
      if (window.selectCharacter) {
        window.selectCharacter(firstPlayerId, 'next');
      }
    }
  }

  // Handle Enter key to confirm current player's selection
  if (isStartScreenKeyPressed('Enter') || isStartScreenCodePressed('Enter')) {
    console.log('[UI] Enter pressed (WORKING) - confirming current player selection');
    console.log('[UI] isStartScreenKeyPressed("Enter"):', isStartScreenKeyPressed('Enter'));
    console.log('[UI] isStartScreenCodePressed("Enter"):', isStartScreenCodePressed('Enter'));
    // Find the first joined player who has a selection but hasn't confirmed
    const joinedPlayers = Array.from(window.activePlayers || []);
    for (const playerId of joinedPlayers) {
      // Check if this player has a selection but not confirmed
      const hasSelection = Object.values(window.playerSelections || {}).includes(playerId);
      const hasConfirmed = Object.values(window.confirmedSelections || {}).includes(playerId);

      if (hasSelection && !hasConfirmed) {
        console.log(`[DEBUG] Confirming selection for player ${playerId}`);
        if (window.confirmSelection) {
          window.confirmSelection(playerId);
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
  initStartScreen
};
