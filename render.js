// Rendering functions
function render() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Apply camera transform for scrolling levels
  let cameraApplied = false;
  if (window.cameraController && window.cameraController.applyTransform) {
    window.cameraController.applyTransform();
    cameraApplied = true;
  }

  // DEBUG Z LINES - използвай реалния canvas размер и spawn позиция като baseline
  const realCanvasHeight = ctx.canvas.height; // Използвай реалния canvas размер
  const baselineY = realCanvasHeight - 600; // Spawn позиция спрямо реалния размер

  ctx.strokeStyle = "#00FF00";
  ctx.beginPath();
  ctx.moveTo(0, baselineY - Z_MIN * 1.0);
  ctx.lineTo(ctx.canvas.width, baselineY - Z_MIN * 1.0);
  ctx.stroke();

  ctx.strokeStyle = "#FF00FF";
  ctx.beginPath();
  ctx.moveTo(0, baselineY - Z_MAX * 1.0);
  ctx.lineTo(ctx.canvas.width, baselineY - Z_MAX * 1.0);
  ctx.stroke();

  // Get sorted entities using game logic (moved from render.js to game.js)
  const entities = getSortedEntitiesForRendering(window.gameState, window.players, window.enemy, window.ally);

  // Render ALL entities in correct Z-order using centralized AnimationRenderer
  if (window.animationSystem?.renderer) {
    // Pass camera offsets to renderer if camera is active
    const cameraX = cameraApplied && window.cameraController ? window.cameraController.x : 0;
    const cameraY = cameraApplied && window.cameraController ? window.cameraController.y : 0;

    window.animationSystem.renderer.drawAnimatedEntitiesWithCamera(entities, cameraX, cameraY);
  }

  // Render damage numbers
  if (window.damageNumberManager) {
    window.damageNumberManager.render(ctx);
  }

  // Render entity labels on top of everything (preserves Z-order visibility)
  entities.forEach((entity, index) => {
    renderEntityLabels(entity, index);
  });

  // Restore camera transform if it was applied
  if (cameraApplied && window.cameraController && window.cameraController.restoreTransform) {
    window.cameraController.restoreTransform();
  }

  // Render camera effects (flash, etc.) - must be after camera transform restore
  if (window.cameraController && window.cameraController.renderEffects) {
    window.cameraController.renderEffects();
  }

  // Render exit points (must be after camera transform restore)
  if (window.levelManager?.exitPointManager) {
    const cameraX = window.cameraController ? window.cameraController.x : 0;
    const cameraY = window.cameraController ? window.cameraController.y : 0;
    window.levelManager.exitPointManager.render(ctx, cameraX, cameraY);
  }

  // Render camera debug info (must be after camera transform restore)
  if (window.cameraController && window.cameraController.drawDebug) {
    window.cameraController.drawDebug(ctx);
  }

  // Render level transition effects (fade overlays, etc.)
  renderTransitionEffects(ctx);

  // Render UI on top of everything else
  if (window.UISystem) {
    window.UISystem.renderPlayerPortraits(ctx);
  }
}

// =========================
// TRANSITION EFFECTS SYSTEM
// =========================

/**
 * Render level transition effects (fade in/out, loading screens, etc.)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
function renderTransitionEffects(ctx) {
  if (!window.levelManager) return;

  const transitionState = window.levelManager.transitionState;

  switch (transitionState) {
    case 'fading_out':
      console.log(`[VISUAL] Rendering Fade Out`);
      renderFadeTransition(ctx, 'out');
      break;

    // case 'showing_ui':
    //   console.log(`[VISUAL] Rendering Full Black Overlay (showing_ui)`);
    //   // Full black overlay during UI transition to prevent flash
    //   ctx.save();
    //   ctx.globalAlpha = 1.0;
    //   ctx.fillStyle = '#000000';
    //   ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    //   ctx.restore();
    //   break;

    case 'fading_in':
      console.log(`[VISUAL] Rendering Fade In`);
      renderFadeTransition(ctx, 'in');
      break;

    case 'loading':
      console.log(`[VISUAL] Rendering Loading Screen`);
      renderLoadingScreen(ctx);
      break;
  }
}

/**
 * Render fade in/out transition overlay
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} direction - 'in' or 'out'
 */
function renderFadeTransition(ctx, direction) {
  if (!window.levelManager) return;

  // Calculate elapsed time using LevelManager's transitionStartTime
  const elapsed = performance.now() - window.levelManager.transitionStartTime;
  const totalDuration = window.levelManager.totalTransitionDuration || 5000;

  // Calculate fade progress (0-1)
  let progress;
  let alpha;
  if (direction === 'out') {
    // Fade out: gradually increase opacity during fade out phase
    progress = Math.min(elapsed / window.levelManager.fadeDuration, 1);

    // When fade out is complete, render full black overlay to prevent flash
    alpha = (progress >= 1.0) ? 1.0 : progress;
  } else {
    // Fade in: gradually decrease opacity during fade in phase
    const fadeInStart = window.levelManager.fadeDuration + window.levelManager.loadingDuration;
    const fadeInElapsed = elapsed - fadeInStart;
    progress = Math.max(0, 1 - (fadeInElapsed / window.levelManager.fadeDuration));
    alpha = progress;
  }

  // Ensure alpha is between 0 and 1
  alpha = Math.max(0, Math.min(1, alpha));

  // Render fade overlay
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#000000'; // Black fade
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.restore();

  // Render transition text
  if (progress > 0.3) {
    renderTransitionText(ctx, progress);
  }
}

/**
 * Render loading screen during level transitions
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
function renderLoadingScreen(ctx) {
  // Full opaque overlay to completely hide game during loading
  ctx.save();
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.restore();

  // Loading text
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Loading...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

  // Loading level name if available
  if (window.levelManager && window.levelManager.targetLevelId) {
    ctx.font = '18px Arial';
    ctx.fillText(`Loading ${window.levelManager.targetLevelId}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
  }

  ctx.restore();

  // Simple loading animation (dots)
  const dotCount = Math.floor(Date.now() / 300) % 4;
  const dots = '.'.repeat(dotCount);
  ctx.fillText(dots, CANVAS_WIDTH / 2 + 60, CANVAS_HEIGHT / 2 - 20);
}

/**
 * Render transition text overlay
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} opacity - Text opacity
 */
function renderTransitionText(ctx, opacity) {
  if (!window.levelManager) return;

  ctx.save();
  ctx.globalAlpha = Math.min(opacity * 2, 1); // Text appears slightly after fade

  // Level transition text
  if (window.levelManager.currentLevel && window.levelManager.targetLevelId) {
    const currentName = window.levelManager.currentLevel.name || window.levelManager.currentLevel.id;
    const targetName = window.levelManager.targetLevelId;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';

    ctx.fillText(`Leaving ${currentName}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
    ctx.fillText(`Entering ${targetName}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
  }

  // Transition progress indicator - use new timing system
  let progressPercent = 0;
  if (window.levelManager && window.levelManager.transitionState !== 'none') {
    const elapsed = performance.now() - window.levelManager.transitionStartTime;
    const totalDuration = window.levelManager.totalTransitionDuration || 5000;
    progressPercent = Math.min(100, Math.round((elapsed / totalDuration) * 100));
  }

  ctx.font = '16px Arial';
  ctx.fillText(`Loading... ${progressPercent}%`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);

  ctx.restore();
}

// =========================
// ENTITY LABELS SYSTEM
// =========================

// Универсална система за надписи
function renderEntityLabels(entity, index) {
  // За противници - показва информация
  if (entity.entityType === 'enemy' && entity.enemyData) {
    renderEnemyLabels(entity);
  }

  // За играчи - може да се добави по-късно
  if (entity.entityType === 'player') {
    // renderPlayerLabels(entity);
  }

  // Debug информация за всички елементи
  renderDebugLabels(entity, index);
}

function renderEnemyLabels(entity) {
  const enemyInfo = entity.enemyData.getEnemyInfo();

  // Use game logic function for health status and color (moved from render.js to game.js)
  const healthData = getEnemyHealthStatus(entity);

  // Enemy info line
  ctx.fillStyle = healthData.healthColor;
  ctx.font = "14px Arial";
  ctx.fillText(`${enemyInfo.displayName} (Lv.${enemyInfo.level}) - ${entity.health}/${entity.maxHealth} HP ${healthData.healthStatus}`,
    entity.x, entity.y - entity.h - entity.z - 40);
}

function renderDebugLabels(entity, index) {
  // Check debug flag before rendering entity labels
  if (!DEBUG_MODE.SHOW_ENTITY_LABELS) return;

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "12px Arial";
  const effectiveY = entity.y - entity.z;
  // Move Z debug text closer to character (above the character)
  ctx.fillText(`Z:${entity.z.toFixed(1)} EffY:${effectiveY.toFixed(1)} Order:${index + 1}`,
    entity.x, entity.y - entity.h - entity.z + 80);
}

// ===========================================
// PHASE 7: ENTITY SORTING LOGIC - moved from game.js
// ===========================================

// Get sorted entities for rendering (game logic that was in game.js)
function getSortedEntitiesForRendering(gameState, players, enemy, ally) {
  // Get all entities from game state or fallback to legacy system
  const entities = gameState ? gameState.getAllEntities() :
    [...players, enemy, ally].filter(e => e !== null && e !== undefined);

  // Debug logging for backwards compatibility
  if (!gameState && enemy && enemy.isDying) {
    console.log('[RENDER] Enemy dying status (legacy):', {
      enemyExists: enemy !== null,
      isDying: enemy.isDying,
      deathTimer: enemy.deathTimer,
      defeatHandled: enemy.defeatHandled,
      visible: enemy.visible,
      entitiesCount: entities.length,
      enemyInEntities: entities.includes(enemy)
    });
  }

  // Sort entities by Z-order (effective Y position) for proper rendering
  return entities.sort((a, b) => (a.y - a.z) - (b.y - b.z));
}

// ===========================================
// PHASE 7: ENEMY STATUS LOGIC - moved from game.js
// ===========================================

// Get enemy health status and color (game logic that was in game.js)
function getEnemyHealthStatus(entity) {
  if (!entity.enemyData) return null;

  const healthPercent = entity.maxHealth > 0 ? (entity.health / entity.maxHealth) * 100 : 0;
  const healthStatus = entity.health <= 0 ? '[Мъртъв]' :
    healthPercent > 60 ? '[Жив]' :
      healthPercent > 30 ? '[Ранен]' : '[Критично]';

  // Color based on health
  const healthColor = entity.health <= 0 ? '#FF0000' :  // Dead - red
    healthPercent > 60 ? '#00FF00' :   // Healthy - green
      healthPercent > 30 ? '#FFFF00' :   // Wounded - yellow
        '#FF8800'; // Critical - orange

  return { healthStatus, healthColor, healthPercent };
}

// ===========================================
// PHASE 7: GLOBAL EXPORTS
// ===========================================

// Export functions globally for backwards compatibility
window.getSortedEntitiesForRendering = getSortedEntitiesForRendering;
window.getEnemyHealthStatus = getEnemyHealthStatus;
