// Rendering functions
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

  // Debug drawing removed - was causing duplicate red objects

  // Draw the normal entity rectangle for all entities
  ctx.fillStyle = e.color;
  ctx.fillRect(e.x, e.y - e.h - zOffset, e.w, e.h);

  if (e.currentAction && isAttackAction(e.currentAction)) {
    // Основни атаки - вертикални линии вдясно
    if (e.currentAction === ACTION_TYPES.BASIC_ATTACK_LIGHT) {
      // Лека основна атака: 1 червена черта вдясно
      ctx.strokeStyle = "#FF0000";
      ctx.strokeRect(e.x + e.w + 5, e.y - e.h - zOffset, 1, e.h);
    } else if (e.currentAction === ACTION_TYPES.BASIC_ATTACK_MEDIUM) {
      // Средна основна атака: 2 червени черти вдясно
      ctx.strokeStyle = "#FF0000";
      ctx.strokeRect(e.x + e.w + 5, e.y - e.h - zOffset, 1, e.h);
      ctx.strokeRect(e.x + e.w + 15, e.y - e.h - zOffset, 1, e.h);
    } else if (e.currentAction === ACTION_TYPES.BASIC_ATTACK_HEAVY) {
      // Тежка основна атака: 3 червени черти вдясно
      ctx.strokeStyle = "#FF0000";
      ctx.strokeRect(e.x + e.w + 5, e.y - e.h - zOffset, 1, e.h);
      ctx.strokeRect(e.x + e.w + 15, e.y - e.h - zOffset, 1, e.h);
      ctx.strokeRect(e.x + e.w + 25, e.y - e.h - zOffset, 1, e.h);
    }

    // Допълнителни атаки - очертания около героя
    else if (e.currentAction === ACTION_TYPES.SECONDARY_ATTACK_LIGHT) {
      // Лека допълнителна атака: единично жълто очертание
      ctx.strokeStyle = "#FFFF00";
      ctx.strokeRect(e.x - 5, e.y - e.h - zOffset - 5, e.w + 10, e.h + 10);
    } else if (e.currentAction === ACTION_TYPES.SECONDARY_ATTACK_MEDIUM) {
      // Средна допълнителна атака: двойно жълто очертание
      ctx.strokeStyle = "#FFFF00";
      ctx.strokeRect(e.x - 5, e.y - e.h - zOffset - 5, e.w + 10, e.h + 10);
      ctx.strokeRect(e.x - 10, e.y - e.h - zOffset - 10, e.w + 20, e.h + 20);
    } else if (e.currentAction === ACTION_TYPES.SECONDARY_ATTACK_HEAVY) {
      // Тежка допълнителна атака: тройно жълто очертание
      ctx.strokeStyle = "#FFFF00";
      ctx.strokeRect(e.x - 5, e.y - e.h - zOffset - 5, e.w + 10, e.h + 10);
      ctx.strokeRect(e.x - 10, e.y - e.h - zOffset - 10, e.w + 20, e.h + 20);
      ctx.strokeRect(e.x - 15, e.y - e.h - zOffset - 15, e.w + 30, e.h + 30);
    }
  }

  if (e.hit) {
    ctx.strokeStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(e.x + e.w/2, e.y - e.h/2 - zOffset, 40, 0, Math.PI*2);
    ctx.stroke();
  }
}

function render() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // DEBUG Z LINES
  ctx.strokeStyle = "#00FF00";
  ctx.beginPath();
  ctx.moveTo(0, 400 - Z_MIN*1.0);
  ctx.lineTo(CANVAS_WIDTH, 400 - Z_MIN*1.0);
  ctx.stroke();

  ctx.strokeStyle = "#FF00FF";
  ctx.beginPath();
  ctx.moveTo(0, 400 - Z_MAX*1.0);
  ctx.lineTo(CANVAS_WIDTH, 400 - Z_MAX*1.0);
  ctx.stroke();

  // Draw entities in Z order based on bottom position (lower effective Y = background, higher effective Y = foreground)
  const rawEntities = [...players, window.enemy, window.ally];
  const entities = rawEntities.filter(e => e !== null && e !== undefined); // Filter out null/undefined entities

  // Debug logging for enemy status
  if (window.enemy && window.enemy.isDying) {
    console.log('[RENDER] Enemy dying status:', {
      enemyExists: window.enemy !== null,
      isDying: window.enemy.isDying,
      deathTimer: window.enemy.deathTimer,
      defeatHandled: window.enemy.defeatHandled,
      visible: window.enemy.visible,
      entitiesCount: entities.length,
      enemyInEntities: entities.includes(window.enemy)
    });
  }

  // Debug logging for enemy removal (only once per enemy defeat)
  if (rawEntities.length !== entities.length && !window.enemyDefeatLogged) {
    console.log('[RENDER] Enemy defeated and filtered from entities:', {
      raw: rawEntities.map(e => e ? (e === window.enemy ? 'ENEMY' : e.characterInfo?.getDisplayName() || 'ALLY') : 'NULL'),
      filtered: entities.map(e => e === window.enemy ? 'ENEMY' : e.characterInfo?.getDisplayName() || 'ALLY'),
      enemyNull: window.enemy === null
    });
    window.enemyDefeatLogged = true;

    // Reset flag after a short delay to allow for next enemy
    setTimeout(() => {
      window.enemyDefeatLogged = false;
    }, 100);
  }

  entities.sort((a, b) => (a.y - a.z) - (b.y - b.z)); // Sort by effective bottom Y ascending
  entities.forEach((entity, index) => {
    drawEntity(entity);

    // Enemy info display (only for enemy entities that exist and have data)
    if (entity === window.enemy && entity && entity.enemyData) {
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

    // Debug text (technical info - keep unchanged)
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "12px Arial";
    const effectiveY = entity.y - entity.z;
    ctx.fillText(`Z:${entity.z.toFixed(1)} EffY:${effectiveY.toFixed(1)} Order:${index+1}`, entity.x, entity.y - entity.h - entity.z - 20);
  });

  // Render damage numbers
  if (window.damageNumberManager) {
    window.damageNumberManager.render(ctx);
  }

  // Render UI on top of everything else
  if (window.UISystem) {
    window.UISystem.renderPlayerPortraits(ctx);
  }
}
