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
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`${label}: ${Math.floor(current)}/${max}`, x + width + 10, y + height - 2);
}

// Render character portrait/icon
function renderCharacterPortrait(ctx, player, x, y, size = 40) {
  // Player number - now positioned to the left of portrait
  ctx.fillStyle = '#fff';
  ctx.font = '16px Arial';
  ctx.textAlign = 'right';
  const playerIndex = window.players.indexOf(player) + 1;
  ctx.fillText(`P${playerIndex}`, x - 10, y + size/2 + 6);

  // Portrait background
  ctx.fillStyle = '#222';
  ctx.fillRect(x, y, size, size);

  // Character color square
  ctx.fillStyle = player.color;
  ctx.fillRect(x + 5, y + 5, size - 10, size - 10);

  // Border
  ctx.strokeStyle = '#666';
  ctx.strokeRect(x, y, size, size);
}

// Render complete status UI for a single player
function renderCharacterStatusUI(ctx, player, x, y) {
  const barWidth = 120;
  const barHeight = 16;
  const spacing = 25;

  // Character portrait
  renderCharacterPortrait(ctx, player, x, y);

  let currentX = x + 50; // Position bars to the right of portrait
  const barStartY = y; // Align bars with top of portrait

  // Health bar (red)
  renderStatusBar(ctx, 'HP', player.health, player.maxHealth, currentX, barStartY, barWidth, barHeight, '#ff0000');

  // Energy bar (yellow/orange)
  renderStatusBar(ctx, 'EN', player.energy, player.maxEnergy, currentX, barStartY + spacing, barWidth, barHeight, '#ffa500');

  // Mana bar (blue)
  renderStatusBar(ctx, 'MP', player.mana, player.maxMana, currentX, barStartY + spacing * 2, barWidth, barHeight, '#0088ff');
}

// Main UI rendering function - renders all player status UIs in screen halves
function renderPlayerPortraits(ctx) {
  if (!window.players || window.players.length === 0) return;

  // Define half-screen positions for up to 4 players
  const halfPositions = [
    { x: 30, y: 10 },           // Top-left half (Player 1) - moved left to account for P# label
    { x: CANVAS_WIDTH/2 + 30, y: 10 },    // Top-right half (Player 2) - moved left to account for P# label
    { x: 20, y: CANVAS_HEIGHT - 100 },  // Bottom-left half (Player 3)
    { x: CANVAS_WIDTH/2 + 20, y: CANVAS_HEIGHT - 100 }  // Bottom-right half (Player 4)
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
