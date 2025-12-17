// Rendering functions
function drawEntity(e) {
  const zOffset = e.z * 1.0;

  // Debug logging for enemy rendering
  if (e === window.enemy) {
    console.log('[DRAW] Drawing enemy:', {
      isDying: e.isDying,
      visible: e.visible,
      x: e.x,
      y: e.y,
      color: e.color,
      zOffset: zOffset,
      drawX: e.x,
      drawY: e.y - e.h - zOffset,
      drawW: e.w,
      drawH: e.h,
      willDraw: !(e.isDying && !e.visible)
    });
  }

  // Handle death animation visibility
  if (e.isDying && !e.visible) {
    return; // Don't draw entity if it's dying and invisible
  }

  // Use animation system if available and entity has animation
  if (window.animationSystem && e.animation) {
    // Animation system will handle drawing
    return;
  }

  // Fallback: Draw the normal entity rectangle for entities without animation
  ctx.fillStyle = e.color;
  ctx.fillRect(e.x, e.y - e.h - zOffset, e.w, e.h);

  // Debug: Draw yellow collision box border for player (always visible during development)
  if (e.entityType === 'player') {
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 3;
    ctx.strokeRect(e.x, e.y - e.h - zOffset, e.w, e.h);

    // Draw collision box dimensions text
    ctx.fillStyle = 'yellow';
    ctx.font = '12px Arial';
    ctx.fillText(`${e.w}x${e.h}`, e.x + e.w/2 - 20, e.y - e.h - zOffset - 5);
  }

  // Attack visualizations now handled by FSM AnimationRenderer



  if (e.hit) {
    ctx.strokeStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(e.x + e.w/2, e.y - e.h/2 - zOffset, 40, 0, Math.PI*2);
    ctx.stroke();
  }
}

function render() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // DEBUG Z LINES - използвай реалния canvas размер и spawn позиция като baseline
  const realCanvasHeight = ctx.canvas.height; // Използвай реалния canvas размер
  const baselineY = realCanvasHeight - 600; // Spawn позиция спрямо реалния размер

  ctx.strokeStyle = "#00FF00";
  ctx.beginPath();
  ctx.moveTo(0, baselineY - Z_MIN*1.0);
  ctx.lineTo(ctx.canvas.width, baselineY - Z_MIN*1.0);
  ctx.stroke();

  ctx.strokeStyle = "#FF00FF";
  ctx.beginPath();
  ctx.moveTo(0, baselineY - Z_MAX*1.0);
  ctx.lineTo(ctx.canvas.width, baselineY - Z_MAX*1.0);
  ctx.stroke();

  // Взимане на всички елементи от game state или fallback към старата система
  const entities = window.gameState ? window.gameState.getAllEntities() :
                   [...players, window.enemy, window.ally].filter(e => e !== null && e !== undefined);

  // Debug logging for backwards compatibility
  if (!window.gameState && window.enemy && window.enemy.isDying) {
    console.log('[RENDER] Enemy dying status (legacy):', {
      enemyExists: window.enemy !== null,
      isDying: window.enemy.isDying,
      deathTimer: window.enemy.deathTimer,
      defeatHandled: window.enemy.defeatHandled,
      visible: window.enemy.visible,
      entitiesCount: entities.length,
      enemyInEntities: entities.includes(window.enemy)
    });
  }

  // Sort ALL entities by Z-order (effective Y position)
  entities.sort((a, b) => (a.y - a.z) - (b.y - b.z)); // Sort by effective bottom Y ascending

  // Render ALL entities in correct Z-order (single loop)
  entities.forEach((entity, index) => {
    if (entity.animation && window.animationSystem && window.animationSystem.isInitialized) {
      // Render animated entity
      const animatedEntities = [entity]; // Single entity array for animation system
      window.animationSystem.renderSorted(animatedEntities);
    } else {
      // Render non-animated entity
      drawEntity(entity);
    }
  });

  // Render damage numbers
  if (window.damageNumberManager) {
    window.damageNumberManager.render(ctx);
  }

  // Render entity labels on top of everything (preserves Z-order visibility)
  entities.forEach((entity, index) => {
    renderEntityLabels(entity, index);
  });

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
  const healthPercent = entity.maxHealth > 0 ? (entity.health / entity.maxHealth) * 100 : 0;
  const healthStatus = entity.health <= 0 ? '[Мъртъв]' :
                      healthPercent > 60 ? '[Жив]' :
                      healthPercent > 30 ? '[Ранен]' : '[Критично]';

  // Color based on health
  const healthColor = entity.health <= 0 ? '#FF0000' :  // Dead - red
                     healthPercent > 60 ? '#00FF00' :   // Healthy - green
                     healthPercent > 30 ? '#FFFF00' :   // Wounded - yellow
                     '#FF8800'; // Critical - orange

  // Enemy info line
  ctx.fillStyle = healthColor;
  ctx.font = "14px Arial";
  ctx.fillText(`${enemyInfo.displayName} (Lv.${enemyInfo.level}) - ${entity.health}/${entity.maxHealth} HP ${healthStatus}`,
               entity.x, entity.y - entity.h - entity.z - 40);
}

function renderDebugLabels(entity, index) {
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "12px Arial";
  const effectiveY = entity.y - entity.z;
  // Move Z debug text closer to character (above the character)
  ctx.fillText(`Z:${entity.z.toFixed(1)} EffY:${effectiveY.toFixed(1)} Order:${index+1}`,
               entity.x, entity.y - entity.h - entity.z + 80);
}
