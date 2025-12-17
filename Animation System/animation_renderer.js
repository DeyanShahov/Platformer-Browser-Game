// Animation Renderer
// Handles canvas drawing operations for animated sprites

class AnimationRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  // Calculate box position (centralized logic for rendering and collision)
  calculateBoxPosition(entity, boxData, boxType = 'attack') {
    // Calculate drawing position with Z-depth offset (same as in drawAnimatedEntity)
    const zOffset = entity.z * 1.0;
    const drawX = entity.x;
    const drawY = entity.y - entity.h - zOffset;

    let boxX, boxY, boxW, boxH;

    if (boxType === 'attack') {
      // Attack box positioning (extends from right side of entity)
      boxX = drawX + entity.w + boxData.x;
      boxY = drawY + (boxData.yRatio * entity.h);
      boxW = boxData.width;
      boxH = boxData.heightRatio * entity.h;
    } else if (boxType === 'hit') {
      // Hit box positioning - standardized for sprites vs rectangles
      boxX = drawX + boxData.x;

      // Differentiate between sprite entities and rectangle entities
      if (entity.animation?.animationDefinition?.spriteSheet) {
        // SPRITE ENTITIES (players) - position relative to sprite coordinates
        boxY = drawY + entity.h/2 - boxData.y;
      } else {
        // RECTANGLE ENTITIES (current enemies) - position at bottom like collision box
        boxY = drawY + entity.h - boxData.height;
      }

      boxW = boxData.width;
      boxH = boxData.height;
    }

    return { x: boxX, y: boxY, width: boxW, height: boxH };
  }

  // Centralized debug box drawing for all entity types
  drawDebugBoxes(entity, drawX, drawY) {
    if (!entity.animation) return;

    // Check if entity should use per-frame data (attacks, idle, walking, and jumping)
    const currentStateName = entity.stateMachine ? entity.stateMachine.getCurrentStateName() : null;
    const usePerFrameData = entity.stateMachine && entity.stateMachine.isInAttackState() ||
                           currentStateName === 'idle' ||
                           currentStateName === 'walking' ||
                           currentStateName === 'jumping';

    // Debug logging for hurt box visibility
    console.log(`[DEBUG HURTBOX] Entity: ${entity.id} (${entity.entityType}), State: ${currentStateName}, HasAnimation: ${!!entity.animation}, usePerFrameData: ${usePerFrameData}`);
    if (entity.animation) {
      console.log(`[DEBUG HURTBOX] Animation currentFrame: ${entity.animation.currentFrame}, animationDef: ${!!entity.animation.animationDefinition}`);
      if (entity.animation.animationDefinition) {
        console.log(`[DEBUG HURTBOX] frameData exists: ${!!entity.animation.animationDefinition.frameData}, frameData length: ${entity.animation.animationDefinition.frameData ? entity.animation.animationDefinition.frameData.length : 'N/A'}`);
        if (entity.animation.animationDefinition.frameData && entity.animation.animationDefinition.frameData[entity.animation.currentFrame]) {
          console.log(`[DEBUG HURTBOX] Current frame data:`, entity.animation.animationDefinition.frameData[entity.animation.currentFrame]);
        }
      }
    }

    let hurtBoxPos = null;

    if (usePerFrameData) {
      // Use per-frame hitBox data for attacks and idle
      const currentFrame = entity.animation.currentFrame;
      const animationDef = entity.animation.animationDefinition;

      if (animationDef && animationDef.frameData && animationDef.frameData[currentFrame] && animationDef.frameData[currentFrame].hitBox) {
        // Use per-frame hit box data
        hurtBoxPos = this.calculateBoxPosition(entity, animationDef.frameData[currentFrame].hitBox, 'hit');
      } else {
        // Fall back to static dimensions if no per-frame data
        hurtBoxPos = {
          x: drawX,
          y: drawY + entity.h - (entity.collisionH || entity.h),
          width: entity.collisionW || entity.w,
          height: entity.collisionH || entity.h
        };
      }
    } else {
      // During other normal states: use constant hurt box
      hurtBoxPos = {
        x: drawX,
        y: drawY + entity.h - (entity.collisionH || entity.h),
        width: entity.collisionW || entity.w,
        height: entity.collisionH || entity.h
      };
    }

    // Orange border = Hurt box (dynamic during attacks/idle, constant otherwise)
    this.ctx.strokeStyle = 'orange';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(hurtBoxPos.x, hurtBoxPos.y, hurtBoxPos.width, hurtBoxPos.height);

    // Draw dimensions text
    this.ctx.fillStyle = 'orange';
    this.ctx.font = '10px Arial';
    let boxType = 'Hurt';
    if (usePerFrameData) {
      if (entity.stateMachine.isInAttackState()) {
        boxType = 'Attack';
      } else if (currentStateName === 'walking') {
        boxType = 'Walk';
      } else if (currentStateName === 'idle') {
        boxType = 'Idle';
      } else if (currentStateName === 'jumping') {
        boxType = 'Jump';
      }
    }
    this.ctx.fillText(`${boxType}: ${Math.round(hurtBoxPos.width)}x${Math.round(hurtBoxPos.height)}`, hurtBoxPos.x - 60, hurtBoxPos.y - 5);

    // Draw attack box if entity is attacking
    if (entity.stateMachine && entity.stateMachine.isInAttackState() && entity.animation?.animationDefinition) {
      const currentFrame = entity.animation.currentFrame;
      const animationDef = entity.animation.animationDefinition;

      if (animationDef.frameData && animationDef.frameData[currentFrame]?.attackBox) {
        const attackBoxPos = this.calculateBoxPosition(entity, animationDef.frameData[currentFrame].attackBox, 'attack');

        console.log(`[RENDER] Drawing attack hitbox: frame=${currentFrame}, pos=${attackBoxPos.x}, ${attackBoxPos.y}, size=${attackBoxPos.width}x${attackBoxPos.height}`);

        // Red outline for attack box
        this.ctx.strokeStyle = "#FF0000";
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(attackBoxPos.x, attackBoxPos.y, attackBoxPos.width, attackBoxPos.height);
      }
    }
  }

  // Draw an animated entity
  drawAnimatedEntity(entity, animation) {
    if (!animation || !animation.currentAnimation) {
      // Fallback to rectangle drawing if no animation
      this.drawFallbackRectangle(entity);
      return;
    }

    const frameRect = animation.getCurrentFrameRect();
    const spriteSheetInfo = animation.getCurrentSpriteSheetInfo();

    // Calculate drawing position with Z-depth offset
    const zOffset = entity.z * 1.0;
    const drawX = entity.x;
    const drawY = entity.y - entity.h - zOffset;

    // Check if we have a valid sprite or need to draw a colored rectangle
    if (!frameRect || !spriteSheetInfo || !spriteSheetInfo.image) {
      // Draw colored rectangle for entities without sprites (like enemies)
      this.drawColoredRectangle(entity, drawX, drawY);
      return;
    }

    // Save context for transformations
    this.ctx.save();

    // Apply facing direction transformation
    if (animation.facingDirection === 'left') {
      // Flip around collision center to prevent teleportation (X only)
      this.ctx.scale(-1, 1);
      this.ctx.translate(-drawX * 2 - entity.collisionW, 0);
    }

    // Draw the sprite frame
    try {
      this.ctx.drawImage(
        spriteSheetInfo.image,
        frameRect.x, frameRect.y, frameRect.width, frameRect.height, // Source rectangle
        drawX, drawY, entity.w, entity.h // Destination rectangle
      );
    } catch (error) {
      console.warn(`[AnimationRenderer] Failed to draw sprite for ${animation.entityType}:${animation.currentAnimation}`, error);
      this.drawColoredRectangle(entity, drawX, drawY);
    }

    // Draw all debug boxes (centralized)
    this.drawDebugBoxes(entity, drawX, drawY);



    // Restore context
    this.ctx.restore();
  }

  // Draw colored rectangle for entities without sprites (like enemies)
  drawColoredRectangle(entity, drawX, drawY) {
    // Save context for transformations
    this.ctx.save();

    // Apply facing direction transformation if needed
    if (entity.animation && entity.animation.facingDirection === 'left') {
      // Flip around collision center to prevent teleportation (X only)
      this.ctx.scale(-1, 1);
      this.ctx.translate(-drawX * 2 - entity.collisionW, 0);
    }

    // Draw colored rectangle
    this.ctx.fillStyle = entity.color || '#FF0000'; // Default to red if no color
    this.ctx.fillRect(drawX, drawY, entity.w, entity.h);

    // Remove white border for better hit box visibility
    // this.ctx.strokeStyle = '#FFFFFF';
    // this.ctx.lineWidth = 2;
    // this.ctx.strokeRect(drawX, drawY, entity.w, entity.h);

    // Draw all debug boxes (centralized)
    this.drawDebugBoxes(entity, drawX, drawY);

    // Restore context
    this.ctx.restore();
  }

  // Fallback rectangle drawing (original behavior)
  drawFallbackRectangle(entity) {
    const zOffset = entity.z * 1.0;
    this.ctx.fillStyle = entity.color;
    this.ctx.fillRect(entity.x, entity.y - entity.h - zOffset, entity.w, entity.h);
  }

  // Draw multiple entities with proper Z-sorting
  drawAnimatedEntities(entities, skipSorting = false) {
    if (!entities || entities.length === 0) return;

    let entitiesToDraw = entities;

    // Only sort if not explicitly told to skip (for pre-sorted lists)
    if (!skipSorting) {
      entitiesToDraw = entities.sort((a, b) => {
        const aEffectiveY = a.y - a.z;
        const bEffectiveY = b.y - b.z;
        return aEffectiveY - bEffectiveY;
      });
    }

    // Draw each entity in the provided order
    entitiesToDraw.forEach(entity => {
      if (entity.animation) {
        this.drawAnimatedEntity(entity, entity.animation);
      } else {
        this.drawFallbackRectangle(entity);
      }
    });
  }

  // Draw debug information for animations
  drawAnimationDebug(entity, animation, x, y) {
    if (!animation) return;

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '10px Arial';

    const debugInfo = animation.getDebugInfo();
    const lines = [
      `Anim: ${debugInfo.currentAnimation || 'none'}`,
      `Frame: ${debugInfo.currentFrame}`,
      `Dir: ${debugInfo.facingDirection}`,
      `Playing: ${debugInfo.isPlaying}`,
      `Forced: ${debugInfo.forceAnimation}`
    ];

    lines.forEach((line, index) => {
      this.ctx.fillText(line, x, y + index * 12);
    });
  }

  // Draw sprite sheet preview (for debugging)
  drawSpriteSheetPreview(spritePath, x, y, scale = 0.5) {
    if (!window.spriteManager) return;

    const sprite = window.spriteManager.getSprite(spritePath);
    if (!sprite) return;

    this.ctx.save();
    this.ctx.globalAlpha = 0.7; // Semi-transparent for preview
    this.ctx.drawImage(sprite, x, y, sprite.width * scale, sprite.height * scale);
    this.ctx.restore();

    // Draw grid lines
    this.ctx.strokeStyle = '#FF0000';
    this.ctx.lineWidth = 1;

    const frameWidth = 128 * scale;
    const frameHeight = 128 * scale;

    // Vertical lines
    for (let i = 0; i <= sprite.width * scale; i += frameWidth) {
      this.ctx.beginPath();
      this.ctx.moveTo(x + i, y);
      this.ctx.lineTo(x + i, y + sprite.height * scale);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let i = 0; i <= sprite.height * scale; i += frameHeight) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, y + i);
      this.ctx.lineTo(x + sprite.width * scale, y + i);
      this.ctx.stroke();
    }
  }

  // Clear canvas area
  clear(x = 0, y = 0, width = this.canvas.width, height = this.canvas.height) {
    this.ctx.clearRect(x, y, width, height);
  }

  // Set rendering quality
  setImageSmoothing(enabled) {
    this.ctx.imageSmoothingEnabled = enabled;
  }

  // Get canvas context (for advanced operations)
  getContext() {
    return this.ctx;
  }

  // Check if entity is visible in current viewport
  isEntityVisible(entity, cameraX = 0, cameraY = 0, viewportWidth = this.canvas.width, viewportHeight = this.canvas.height) {
    const entityLeft = entity.x - cameraX;
    const entityRight = entity.x + entity.w - cameraX;
    const entityTop = entity.y - entity.h - entity.z - cameraY;
    const entityBottom = entity.y - cameraY;

    return entityRight > 0 && entityLeft < viewportWidth &&
           entityBottom > 0 && entityTop < viewportHeight;
  }

  // Advanced drawing with camera support
  drawAnimatedEntityWithCamera(entity, animation, cameraX = 0, cameraY = 0) {
    if (!this.isEntityVisible(entity, cameraX, cameraY)) {
      return; // Skip drawing if not visible
    }

    // Adjust drawing position for camera
    const adjustedEntity = {
      ...entity,
      x: entity.x - cameraX,
      y: entity.y - cameraY
    };

    this.drawAnimatedEntity(adjustedEntity, animation);
  }

  // Batch draw multiple entities with camera
  drawAnimatedEntitiesWithCamera(entities, cameraX = 0, cameraY = 0) {
    if (!entities || entities.length === 0) return;

    // Sort by effective Y position
    const sortedEntities = entities.sort((a, b) => {
      const aEffectiveY = a.y - a.z;
      const bEffectiveY = b.y - b.z;
      return aEffectiveY - bEffectiveY;
    });

    // Draw visible entities only
    sortedEntities.forEach(entity => {
      if (entity.animation) {
        this.drawAnimatedEntityWithCamera(entity, entity.animation, cameraX, cameraY);
      } else {
        // Adjust position for camera before fallback drawing
        const adjustedEntity = {
          ...entity,
          x: entity.x - cameraX,
          y: entity.y - cameraY
        };
        this.drawFallbackRectangle(adjustedEntity);
      }
    });
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnimationRenderer;
}
