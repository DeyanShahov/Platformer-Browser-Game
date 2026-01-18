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
  const entities = getSortedEntitiesForRendering();

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

  // Render camera debug info (must be after camera transform restore)
  if (window.cameraController && window.cameraController.drawDebug) {
    window.cameraController.drawDebug(ctx);
  }

  // Render UI on top of everything else
  if (window.UISystem) {
    window.UISystem.renderPlayerPortraits(ctx);
  }
}

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
