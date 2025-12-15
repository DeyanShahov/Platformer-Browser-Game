// UI System for Platformer Game
// Character status display in upper left corner

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
  if (!window.players || window.players.length === 0) return;

  // Define half-screen positions for up to 4 players
  const halfPositions = [
    { x: 40, y: 10 },           // Top-left half (Player 1)
    { x: CANVAS_WIDTH/2 - 100, y: 10 },    // Top-right half (Player 2) - moved left for larger UI
    { x: 40, y: 950 },          // Player 3 - moved up slightly for larger UI
    { x: CANVAS_WIDTH/2 - 100, y: 950 }   // Player 4 - moved left and up for larger UI
  ];

  window.players.forEach((player, index) => {
    if (index < halfPositions.length) {
      const position = halfPositions[index];
      renderCharacterStatusUI(ctx, player, position.x, position.y);
    }
  });
}

// Export functions for use in other files
window.UISystem = {
  renderPlayerPortraits,
  renderCharacterStatusUI,
  renderCharacterPortrait,
  renderStatusBar
};
