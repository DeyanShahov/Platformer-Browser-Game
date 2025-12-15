// Animation Renderer
// Handles canvas drawing operations for animated sprites

class AnimationRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
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

    if (!frameRect || !spriteSheetInfo) {
      // Fallback if sprite not loaded
      this.drawFallbackRectangle(entity);
      return;
    }

    // Calculate drawing position with Z-depth offset
    const zOffset = entity.z * 1.0;
    const drawX = entity.x;
    const drawY = entity.y - entity.h - zOffset;

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
      this.drawFallbackRectangle(entity);
    }

    // Debug: Draw collision boxes for player (always visible during development)
    if (entity.entityType === 'player' && animation) {
      // Get current animation frame dimensions
      const frameRect = animation.getCurrentFrameRect();
      const originalFrameWidth = frameRect ? frameRect.width : entity.collisionW;
      const originalFrameHeight = frameRect ? frameRect.height : entity.collisionH;

      // Scale frame dimensions to match the visual size of the entity
      // Original entity size was 250x250, now it's 500x500 (2x scale)
      const scaleX = entity.w / 250;
      const scaleY = entity.h / 250;
      const frameWidth = originalFrameWidth * scaleX;
      const frameHeight = originalFrameHeight * scaleY;

      // Yellow border = Frame size (what gets extracted from sprite sheet) - SCALED
      // Anchor to bottom-left like collision box
      this.ctx.strokeStyle = 'yellow';
      this.ctx.lineWidth = 2;
      const frameX = drawX; // Left edge of sprite
      const frameY = drawY + entity.h - frameHeight; // Bottom edge of sprite
      this.ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);

      // Orange border = Collision box size (collisionW x collisionH)
      // Anchor collision box to bottom-left of sprite
      this.ctx.strokeStyle = 'orange';
      this.ctx.lineWidth = 2;
      const collisionX = drawX; // Left edge of sprite
      const collisionY = drawY + entity.h - entity.collisionH; // Bottom edge of sprite
      this.ctx.strokeRect(collisionX, collisionY, entity.collisionW, entity.collisionH);

      // Draw dimensions text (two lines close to character)
      this.ctx.fillStyle = 'yellow';
      this.ctx.font = '10px Arial';
      this.ctx.fillText(`Frame: ${Math.round(frameWidth)}x${Math.round(frameHeight)}`, drawX - 60, frameY - 5);

      this.ctx.fillStyle = 'orange';
      this.ctx.font = '10px Arial';
      this.ctx.fillText(`Collision: ${entity.collisionW}x${entity.collisionH}`, drawX - 60, frameY - 20);
    }

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
