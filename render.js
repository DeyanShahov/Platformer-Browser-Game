// Rendering functions
function drawEntity(e) {
  const zOffset = e.z * 1.0;
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
  const entities = [...players, enemy, ally];
  entities.sort((a, b) => (a.y - a.z) - (b.y - b.z)); // Sort by effective bottom Y ascending
  entities.forEach((entity, index) => {
    drawEntity(entity);
    // Debug text
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
