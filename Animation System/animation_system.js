// Animation System
// Central manager for all animations in the game

class AnimationSystem {
  constructor() {
    this.entities = new Map(); // entity -> EntityAnimation mapping
    this.renderer = null;
    this.isInitialized = false;
    this.debugMode = false;
  }

  // Initialize the animation system
  async initialize(canvas) {
    console.log('[AnimationSystem] Initializing...');

    // Create renderer
    this.renderer = new AnimationRenderer(canvas);

    // Set pixelated rendering for crisp sprites
    this.renderer.setImageSmoothing(false);

    // Preload all sprites
    await this.preloadSprites();

    this.isInitialized = true;
    console.log('[AnimationSystem] Initialized successfully');
  }

  // Preload all required sprites
  async preloadSprites() {
    if (!window.spriteManager) {
      throw new Error('SpriteManager not found. Make sure sprite_manager.js is loaded.');
    }

    // Preload Knight sprites
    await window.spriteManager.preloadEntitySprites('knight');

    // Add callbacks for other entity types as they are added
    console.log('[AnimationSystem] All sprites preloaded');
  }

  // Register an entity for animation
  registerEntity(entity, entityType = 'knight') {
    if (!entity) {
      console.warn('[AnimationSystem] Cannot register null/undefined entity');
      return null;
    }

    if (this.entities.has(entity)) {
      console.warn('[AnimationSystem] Entity already registered');
      return this.entities.get(entity);
    }

    // Create animation instance for this entity
    const animation = new EntityAnimation(entityType, entity);
    entity.animation = animation; // Attach to entity for easy access

    this.entities.set(entity, animation);

    // Set initial animation
    animation.setAnimation(window.ANIMATION_TYPES.IDLE);

    console.log(`[AnimationSystem] Registered entity of type: ${entityType}`);
    return animation;
  }

  // Unregister an entity
  unregisterEntity(entity) {
    if (this.entities.has(entity)) {
      const animation = this.entities.get(entity);
      animation.stopAnimation();
      delete entity.animation; // Remove reference
      this.entities.delete(entity);
      console.log('[AnimationSystem] Unregistered entity');
    }
  }

  // Update all animations
  update(dt) {
    if (!this.isInitialized) return;

    this.entities.forEach((animation, entity) => {
      // Update facing direction based on movement
      animation.updateFacingDirection();

      // Update state machine if entity has one
      if (entity.stateMachine) {
        entity.stateMachine.update(dt);
      } else {
        // Fallback to old system for entities without state machine
        animation.updateMovementState();
      }

      // Update animation timing
      animation.update(dt);
    });
  }

  // Render all animated entities
  render() {
    if (!this.isInitialized || !this.renderer) return;

    // Get all entities with animations
    const animatedEntities = Array.from(this.entities.keys());

    // Render them using the animation renderer
    this.renderer.drawAnimatedEntities(animatedEntities);

    // Debug rendering
    if (this.debugMode) {
      this.renderDebug();
    }
  }

  // Render animated entities from a pre-sorted list (for Z-ordering)
  renderSorted(sortedEntities) {
    if (!this.isInitialized || !this.renderer) return;

    // Filter only entities that have animations and are registered
    const animatedEntities = sortedEntities.filter(entity => this.entities.has(entity));

    // Render them in the correct Z order (skip internal sorting)
    this.renderer.drawAnimatedEntities(animatedEntities, true); // skipSorting = true

    // Debug rendering
    if (this.debugMode) {
      this.renderDebug();
    }
  }

  // Render debug information
  renderDebug() {
    if (!this.renderer) return;

    let debugY = 10;
    this.entities.forEach((animation, entity) => {
      this.renderer.drawAnimationDebug(entity, animation, 10, debugY);
      debugY += 60; // Space for debug info
    });
  }

  // Force animation for specific entity
  forceEntityAnimation(entity, animationType, onEnd = null) {
    const animation = this.entities.get(entity);
    if (animation) {
      return animation.forceAnimationType(animationType, onEnd);
    }
    return false;
  }

  // Set animation for specific entity
  setEntityAnimation(entity, animationType, force = false, onEnd = null) {
    const animation = this.entities.get(entity);
    if (animation) {
      return animation.setAnimation(animationType, force, onEnd);
    }
    return false;
  }

  // Queue animation for specific entity
  queueEntityAnimation(entity, animationType, force = false, onEnd = null) {
    const animation = this.entities.get(entity);
    if (animation) {
      animation.queueAnimation(animationType, force, onEnd);
      return true;
    }
    return false;
  }

  // Get animation for entity
  getEntityAnimation(entity) {
    return this.entities.get(entity);
  }

  // Check if entity has animation playing
  isEntityAnimationPlaying(entity, animationType = null) {
    const animation = this.entities.get(entity);
    return animation ? animation.isAnimationPlaying(animationType) : false;
  }

  // Toggle debug mode
  toggleDebug() {
    this.debugMode = !this.debugMode;
    console.log(`[AnimationSystem] Debug mode: ${this.debugMode ? 'ON' : 'OFF'}`);
  }

  // Get system statistics
  getStats() {
    return {
      initialized: this.isInitialized,
      registeredEntities: this.entities.size,
      debugMode: this.debugMode,
      spriteManagerStats: window.spriteManager ? {
        loadedSprites: window.spriteManager.sprites.size,
        loadingSprites: window.spriteManager.loadingPromises.size
      } : null
    };
  }

  // Cleanup method
  dispose() {
    this.entities.forEach((animation, entity) => {
      animation.stopAnimation();
      delete entity.animation;
    });
    this.entities.clear();
    this.isInitialized = false;
    console.log('[AnimationSystem] Disposed');
  }

  // Handle entity actions (called from game logic)
  onEntityAction(entity, actionType) {
    const animation = this.entities.get(entity);
    if (!animation) return;

    // Map action types to animations
    let animationType = null;
    switch (actionType) {
      case window.SKILL_TYPES?.JUMP:
        animationType = window.ANIMATION_TYPES?.JUMP;
        break;
      case window.SKILL_TYPES?.BASIC_ATTACK_LIGHT:
        animationType = window.ANIMATION_TYPES?.ATTACK_1;
        break;
      case window.SKILL_TYPES?.BASIC_ATTACK_MEDIUM:
        //animationType = window.ANIMATION_TYPES?.ATTACK_2;
        break;
      case window.SKILL_TYPES?.BASIC_ATTACK_HEAVY:
        //animationType = window.ANIMATION_TYPES?.ATTACK_3;
        break;
      case window.SKILL_TYPES?.SECONDARY_ATTACK_LIGHT:
        animationType = window.ANIMATION_TYPES?.ATTACK_2;
        break;
      case window.SKILL_TYPES?.SECONDARY_ATTACK_MEDIUM:
        //animationType = window.ANIMATION_TYPES?.ATTACK_2;
        break;
      case window.SKILL_TYPES?.SECONDARY_ATTACK_HEAVY:
        //animationType = window.ANIMATION_TYPES?.ATTACK_3;
        break;
    }

    if (animationType) {
      // Force the animation for actions
      animation.forceAnimationType(animationType);
    }
  }

  // Handle entity taking damage
  onEntityDamaged(entity) {
    const animation = this.entities.get(entity);
    if (animation) {
      // Play hurt animation if not already playing a higher priority animation
      animation.setAnimation(window.ANIMATION_TYPES.HURT, false, () => {
        // Return to movement animation after hurt
        animation.updateMovementAnimation();
      });
    }
  }

  // Handle entity death
  onEntityDeath(entity) {
    const animation = this.entities.get(entity);
    if (animation) {
      // Force death animation (highest priority)
      animation.forceAnimationType(window.ANIMATION_TYPES.DEAD);
    }
  }

  // Batch operations for performance
  updateMultipleEntities(entities, dt) {
    entities.forEach(entity => {
      const animation = this.entities.get(entity);
      if (animation) {
        animation.updateFacingDirection();
        animation.updateMovementAnimation();
        animation.update(dt);
      }
    });
  }

  // Advanced: Animation blending (for future use)
  blendAnimations(entity, fromAnimation, toAnimation, blendTime) {
    // TODO: Implement animation blending for smoother transitions
    console.log('[AnimationSystem] Animation blending not yet implemented');
  }
}

// Global instance
window.animationSystem = new AnimationSystem();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnimationSystem;
}
