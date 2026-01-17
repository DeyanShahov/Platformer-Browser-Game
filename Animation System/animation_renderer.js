// Animation Renderer
// Handles canvas drawing operations for animated sprites
// Phase 4: Generic entity support - enhanced entity type handling and rendering flexibility ✅

class AnimationRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  // Centralized Z-depth offset calculation
  getZOffset(entity) {
    return entity.z * 1.0;
  }

  // Calculate box position (centralized logic for rendering and collision)
  calculateBoxPosition(entity, boxData, boxType = 'attack') {
    // Calculate drawing position with Z-depth offset
    const zOffset = this.getZOffset(entity);
    const drawX = entity.x;
    const drawY = entity.y - entity.h - zOffset;

    let boxX, boxY, boxW, boxH;

    if (boxType === 'attack') {
      // Attack box positioning (extends from right side of entity)
      // Note: Data is assumed to be in world pixels
      boxX = drawX + entity.w + boxData.x;
      boxY = drawY + (boxData.yRatio * entity.h);
      boxW = boxData.width;
      boxH = boxData.heightRatio * entity.h;
    } else if (boxType === 'hit') {
      // Hit box positioning - standardized for sprites vs rectangles
      boxX = drawX + boxData.x;

      const animDef = entity.animation?.animationDefinition;
      if (animDef?.spriteSheet && entity.animationEntityType !== 'blue_slime') {
        // SPRITE ENTITIES (players) - position relative to sprite coordinates
        boxY = drawY + entity.h / 2 - boxData.y;
      } else {
        // RECTANGLE ENTITIES (enemies, Blue Slime) - position at bottom
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

    // Check debug flags before drawing any boxes
    if (!DEBUG_MODE.SHOW_HITBOXES) return;

    // Use per-frame data whenever available in the animation definition
    const currentStateName = entity.stateMachine ? entity.stateMachine.getCurrentStateName() : null;
    const currentFrame = entity.animation ? entity.animation.currentFrame : 0;
    const animationDef = entity.animation ? entity.animation.animationDefinition : null;

    // Check if current animation frame has hit box data
    const hasPerFrameHitBox = animationDef && animationDef.frameData &&
      animationDef.frameData[currentFrame] &&
      animationDef.frameData[currentFrame].hitBox;

    const usePerFrameData = hasPerFrameHitBox;

    // Debug logging for Blue Slime hit box issues
    // if (entity.animationEntityType === 'blue_slime') {
    //   console.log(`[DEBUG BLUE SLIME] Entity type: ${entity.animationEntityType}, State: ${currentStateName}, usePerFrameData: ${usePerFrameData}`);
    // }

    // Debug logging for hurt box visibility
    // console.log(`[DEBUG HURTBOX] Entity: ${entity.id} (${entity.entityType}), State: ${currentStateName}, HasAnimation: ${!!entity.animation}, usePerFrameData: ${usePerFrameData}`);
    // if (entity.animation) {
    //   console.log(`[DEBUG HURTBOX] Animation currentFrame: ${entity.animation.currentFrame}, animationDef: ${!!entity.animation.animationDefinition}`);
    //   if (entity.animation.animationDefinition) {
    //     console.log(`[DEBUG HURTBOX] frameData exists: ${!!entity.animation.animationDefinition.frameData}, frameData length: ${entity.animation.animationDefinition.frameData ? entity.animation.animationDefinition.frameData.length : 'N/A'}`);
    //     if (entity.animation.animationDefinition.frameData && entity.animation.animationDefinition.frameData[entity.animation.currentFrame]) {
    //       console.log(`[DEBUG HURTBOX] Current frame data:`, entity.animation.animationDefinition.frameData[entity.animation.currentFrame]);
    //     }
    //   }
    // }

    let hurtBoxPos = null;

    if (usePerFrameData) {
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

    // Orange border = Hurt box (dynamic during attacks/idle, constant otherwise)
    if (DEBUG_MODE.SHOW_HURT_BOXES) {
      this.ctx.strokeStyle = 'orange';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(hurtBoxPos.x, hurtBoxPos.y, hurtBoxPos.width, hurtBoxPos.height);
    }

    // Draw dimensions text
    this.ctx.fillStyle = 'orange';
    this.ctx.font = '10px Arial';
    let boxType = 'Hurt';
    if (usePerFrameData) {
      if (entity.stateMachine && entity.stateMachine.isInAttackState()) {
        boxType = 'Attack';
      } else if (currentStateName === 'walking' || currentStateName === 'enemy_walking') {
        boxType = 'Walk';
      } else if (currentStateName === 'running' || currentStateName === 'enemy_running') {
        boxType = 'Run';
      } else if (currentStateName === 'idle' || currentStateName === 'enemy_idle') {
        boxType = 'Idle';
      } else if (currentStateName === 'jumping') {
        boxType = 'Jump';
      }
    }
    this.ctx.fillText(`${boxType}: ${Math.round(hurtBoxPos.width)}x${Math.round(hurtBoxPos.height)}`, hurtBoxPos.x - 60, hurtBoxPos.y - 5);

    // Draw attack box if entity is attacking
    if (DEBUG_MODE.SHOW_ATTACK_BOXES && entity.stateMachine && entity.stateMachine.isInAttackState() && entity.animation?.animationDefinition) {
      const currentFrame = entity.animation.currentFrame;
      const animationDef = entity.animation.animationDefinition;

      if (animationDef.frameData && animationDef.frameData[currentFrame]?.attackBox) {
        const attackBoxPos = this.calculateBoxPosition(entity, animationDef.frameData[currentFrame].attackBox, 'attack');

        // Red outline for attack box
        this.ctx.strokeStyle = "#FF0000";
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(attackBoxPos.x, attackBoxPos.y, attackBoxPos.width, attackBoxPos.height);
      }
    }
  }

  // Universal entity drawing method (handles both animated and non-animated entities)
  drawEntity(entity) {
    // Debug logging for enemy rendering
    if (entity === window.enemy) {
      console.log('[DRAW] Drawing enemy:', {
        isDying: entity.isDying,
        visible: entity.visible,
        x: entity.x,
        y: entity.y,
        color: entity.color,
        z: entity.z,
        drawX: entity.x,
        drawY: entity.y - entity.h - (entity.z * 1.0),
        drawW: entity.w,
        drawH: entity.h,
        willDraw: !(entity.isDying && !entity.visible)
      });
    }

    // Handle death animation visibility
    if (entity.isDying && !entity.visible) {
      return; // Don't draw entity if it's dying and invisible
    }

    // Calculate Z-depth offset
    const zOffset = this.getZOffset(entity);

    // If entity has animation, delegate to animated drawing
    if (entity.animation) {
      this.drawAnimatedEntity(entity, entity.animation);
    } else {
      // Fallback: Draw the normal entity rectangle for entities without animation
      this.ctx.fillStyle = entity.color;
      this.ctx.fillRect(entity.x, entity.y - entity.h - zOffset, entity.w, entity.h);
    }

    // Debug: Draw yellow collision box border for player
    if (DEBUG_MODE.SHOW_PLAYER_BOX && entity.entityType === 'player') {
      this.ctx.strokeStyle = 'yellow';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(entity.x, entity.y - entity.h - zOffset, entity.w, entity.h);

      // Draw collision box dimensions text
      this.ctx.fillStyle = 'yellow';
      this.ctx.font = '12px Arial';
      this.ctx.fillText(`${entity.w}x${entity.h}`, entity.x + entity.w / 2 - 20, entity.y - entity.h - zOffset - 5);
    }

    // Hit visualizations (controlled by debug flag)
    if (DEBUG_MODE.SHOW_HIT_EFFECTS && entity.hit) {
      // Get current hit box position using the same logic as debug boxes
      let hitBoxCenter = { x: entity.x + entity.w / 2, y: entity.y - entity.h / 2 - zOffset };

      // Try to use dynamic hit box position if available
      if (entity.animation) {
        // Use per-frame data whenever available
        const currentFrame = entity.animation ? entity.animation.currentFrame : 0;
        const animationDef = entity.animation ? entity.animation.animationDefinition : null;
        const hasPerFrameHitBox = animationDef && animationDef.frameData &&
          animationDef.frameData[currentFrame] &&
          animationDef.frameData[currentFrame].hitBox;

        const usePerFrameData = hasPerFrameHitBox;

        if (usePerFrameData) {
          if (animationDef && animationDef.frameData && animationDef.frameData[currentFrame] && animationDef.frameData[currentFrame].hitBox) {
            const hitBoxPos = this.calculateBoxPosition(entity, animationDef.frameData[currentFrame].hitBox, 'hit');
            hitBoxCenter = {
              x: hitBoxPos.x + hitBoxPos.width / 2,
              y: hitBoxPos.y + hitBoxPos.height / 2
            };
          }
        }
      }

      this.ctx.strokeStyle = "#FFFFFF";
      this.ctx.beginPath();
      this.ctx.arc(hitBoxCenter.x, hitBoxCenter.y, 20, 0, Math.PI * 2); // Smaller radius for better visibility
      this.ctx.stroke();
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
    const zOffset = this.getZOffset(entity);

    // FIX REGRESSION: Revert to using entity.x to respect manual offsets (like Player's -60)
    // We will handle centering via the FLIP TRANSFORMATION instead
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
      // FIX UNIVERSAL: Flip around the ACTUAL PHYSICAL CENTER
      // This works for both:
      // 1. Enemies (Centered Hitbox): Pivot is center of sprite
      // 2. Player (Offset Hitbox): Pivot is center of hitbox, preserving the offset visually

      let centerX;

      // Try to get precise hitbox center from current frame
      if (animation.animationDefinition &&
        animation.animationDefinition.frameData &&
        animation.animationDefinition.frameData[animation.currentFrame] &&
        animation.animationDefinition.frameData[animation.currentFrame].hitBox) {

        const hitBoxData = animation.animationDefinition.frameData[animation.currentFrame].hitBox;

        // Calculate absolute hitbox X position
        const hitBoxX = drawX + hitBoxData.x;
        centerX = hitBoxX + hitBoxData.width / 2;

      } else {
        // Fallback: Use standard collision width
        const collisionW = entity.collisionW || entity.w;
        centerX = entity.x + collisionW / 2;
      }

      // Apply 3-Step Flip: Translate to Center -> Flip -> Translate Back
      this.ctx.translate(centerX, 0);
      this.ctx.scale(-1, 1);
      this.ctx.translate(-centerX, 0);
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
      // FIX UNIVERSAL: Flip around the ACTUAL PHYSICAL CENTER
      let centerX;

      // Fallback logic mostly applies here as rectangles usually imply simple shapes
      const collisionW = entity.collisionW || entity.w;
      centerX = entity.x + collisionW / 2;

      this.ctx.translate(centerX, 0);
      this.ctx.scale(-1, 1);
      this.ctx.translate(-centerX, 0);
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
    const zOffset = this.getZOffset(entity);
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
        const aEffectiveY = a.y - this.getZOffset(a);
        const bEffectiveY = b.y - this.getZOffset(b);
        return aEffectiveY - bEffectiveY;
      });
    }

    // Draw each entity using the universal drawEntity method
    entitiesToDraw.forEach(entity => {
      this.drawEntity(entity);
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
    const entityTop = entity.y - entity.h - this.getZOffset(entity) - cameraY;
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

  // ===========================================
  // GENERIC ENTITY SUPPORT METHODS - Phase 4
  // ===========================================

  // Generic entity renderer that adapts to entity type
  drawGenericEntity(entity, options = {}) {
    const entityType = this.getEntityType(entity);

    switch (entityType) {
      case 'animated_sprite':
        return this.drawAnimatedEntity(entity, entity.animation);

      case 'static_sprite':
        return this.drawStaticSprite(entity, options);

      case 'colored_rectangle':
        return this.drawColoredRectangle(entity, entity.x, entity.y - entity.h - this.getZOffset(entity));

      case 'custom_shape':
        return this.drawCustomShape(entity, options);

      default:
        // Fallback to universal method
        return this.drawEntity(entity);
    }
  }

  // Determine entity rendering type
  getEntityType(entity) {
    if (entity.animation && entity.animation.currentAnimation) {
      return 'animated_sprite';
    }
    if (entity.spritePath && window.spriteManager?.getSprite(entity.spritePath)) {
      return 'static_sprite';
    }
    if (entity.color && !entity.spritePath) {
      return 'colored_rectangle';
    }
    if (entity.shape) {
      return 'custom_shape';
    }
    return 'unknown';
  }

  // Draw static sprite (non-animated)
  drawStaticSprite(entity, options = {}) {
    if (!entity.spritePath || !window.spriteManager) return;

    const sprite = window.spriteManager.getSprite(entity.spritePath);
    if (!sprite) return;

    const zOffset = this.getZOffset(entity);
    const drawX = entity.x;
    const drawY = entity.y - entity.h - zOffset;

    // Save context for transformations
    this.ctx.save();

    // Apply transformations
    this.applyEntityTransformations(entity, drawX, drawY);

    // Draw sprite
    try {
      this.ctx.drawImage(
        sprite,
        options.sourceX || 0,
        options.sourceY || 0,
        options.sourceWidth || sprite.width,
        options.sourceHeight || sprite.height,
        drawX, drawY,
        entity.w || sprite.width,
        entity.h || sprite.height
      );
    } catch (error) {
      console.warn(`[AnimationRenderer] Failed to draw static sprite for ${entity.id}`, error);
    }

    // Draw debug boxes if needed
    if (options.debug) {
      this.drawDebugBoxes(entity, drawX, drawY);
    }

    this.ctx.restore();
  }

  // Draw custom shapes (circles, polygons, etc.)
  drawCustomShape(entity, options = {}) {
    const zOffset = this.getZOffset(entity);
    const drawX = entity.x;
    const drawY = entity.y - entity.h - zOffset;

    this.ctx.save();

    // Apply transformations
    this.applyEntityTransformations(entity, drawX, drawY);

    // Set style
    this.ctx.fillStyle = entity.color || options.fillColor || '#FFFFFF';
    this.ctx.strokeStyle = entity.strokeColor || options.strokeColor || '#000000';
    this.ctx.lineWidth = entity.lineWidth || options.lineWidth || 1;

    // Draw based on shape type
    switch (entity.shape) {
      case 'circle':
        this.drawCircle(entity, drawX, drawY);
        break;
      case 'triangle':
        this.drawTriangle(entity, drawX, drawY);
        break;
      case 'polygon':
        this.drawPolygon(entity, drawX, drawY);
        break;
      default:
        // Default to rectangle
        this.ctx.fillRect(drawX, drawY, entity.w, entity.h);
        break;
    }

    this.ctx.restore();
  }

  // Helper methods for custom shapes
  drawCircle(entity, drawX, drawY) {
    const centerX = drawX + (entity.w || entity.radius * 2) / 2;
    const centerY = drawY + (entity.h || entity.radius * 2) / 2;
    const radius = entity.radius || Math.min(entity.w, entity.h) / 2;

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();
    if (entity.strokeColor) this.ctx.stroke();
  }

  drawTriangle(entity, drawX, drawY) {
    const centerX = drawX + entity.w / 2;
    const bottomY = drawY + entity.h;
    const topY = drawY;

    this.ctx.beginPath();
    this.ctx.moveTo(centerX, topY);
    this.ctx.lineTo(drawX, bottomY);
    this.ctx.lineTo(drawX + entity.w, bottomY);
    this.ctx.closePath();
    this.ctx.fill();
    if (entity.strokeColor) this.ctx.stroke();
  }

  drawPolygon(entity, drawX, drawY) {
    if (!entity.points || entity.points.length < 3) return;

    this.ctx.beginPath();
    entity.points.forEach((point, index) => {
      const x = drawX + point.x;
      const y = drawY + point.y;
      if (index === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });
    this.ctx.closePath();
    this.ctx.fill();
    if (entity.strokeColor) this.ctx.stroke();
  }

  // Apply common entity transformations
  applyEntityTransformations(entity, drawX, drawY) {
    // Facing direction
    if (entity.facing === 'left' || (entity.animation && entity.animation.facingDirection === 'left')) {
      this.ctx.scale(-1, 1);
      this.ctx.translate(-drawX * 2 - (entity.collisionW || entity.w), 0);
    }

    // Rotation
    if (entity.rotation) {
      const centerX = drawX + entity.w / 2;
      const centerY = drawY + entity.h / 2;
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(entity.rotation * Math.PI / 180);
      this.ctx.translate(-centerX, -centerY);
    }

    // Scale
    if (entity.scaleX || entity.scaleY) {
      const scaleX = entity.scaleX || 1;
      const scaleY = entity.scaleY || 1;
      const centerX = drawX + entity.w / 2;
      const centerY = drawY + entity.h / 2;
      this.ctx.translate(centerX, centerY);
      this.ctx.scale(scaleX, scaleY);
      this.ctx.translate(-centerX, -centerY);
    }
  }

  // Enhanced batch drawing with entity type detection
  drawGenericEntities(entities, options = {}) {
    if (!entities || entities.length === 0) return;

    let entitiesToDraw = entities;

    // Sort by effective Y position unless disabled
    if (!options.skipSorting) {
      entitiesToDraw = entities.sort((a, b) => {
        const aEffectiveY = a.y - this.getZOffset(a);
        const bEffectiveY = b.y - this.getZOffset(b);
        return aEffectiveY - bEffectiveY;
      });
    }

    // Apply camera offset if provided
    const cameraX = options.cameraX || 0;
    const cameraY = options.cameraY || 0;

    // Draw each entity based on its type
    entitiesToDraw.forEach(entity => {
      // Skip invisible entities
      if (entity.visible === false) return;

      // Apply camera offset
      const adjustedEntity = {
        ...entity,
        x: entity.x - cameraX,
        y: entity.y - cameraY
      };

      // Check visibility if camera is used
      if (cameraX !== 0 || cameraY !== 0) {
        if (!this.isEntityVisible(adjustedEntity, 0, 0)) return;
      }

      // Draw based on entity type
      this.drawGenericEntity(adjustedEntity, options);
    });
  }

  // Batch draw multiple entities with camera
  drawAnimatedEntitiesWithCamera(entities, cameraX = 0, cameraY = 0) {
    if (!entities || entities.length === 0) return;

    // Sort by effective Y position
    const sortedEntities = entities.sort((a, b) => {
      const aEffectiveY = a.y - this.getZOffset(a);
      const bEffectiveY = b.y - this.getZOffset(b);
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
