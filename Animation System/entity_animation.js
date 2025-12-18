// Entity Animation
// Handles animation state and timing for individual entities

class EntityAnimation {
  constructor(entityType, entity) {
    this.entityType = entityType;
    this.entity = entity; // Reference to the entity this animation belongs to

    this.currentAnimation = null;
    this.currentFrame = 0;
    this.animationTime = 0;
    this.isPlaying = false;
    this.isLooping = false;
    this.facingDirection = 'right'; // 'left' or 'right'

    this.animationQueue = []; // Queue for animation sequences
    this.onAnimationEnd = null; // Callback when animation ends

    // Animation state tracking
    this.lastMovementState = 'idle'; // 'idle', 'walking', 'running'
    this.forceAnimation = false; // For forced animations (attacks, etc.)

    // Movement state machine
    this.movementStates = {
      IDLE: 'idle',
      WALKING: 'walking',
      RUNNING: 'running'
    };
  }

  // Set the current animation
  setAnimation(animationType, force = false, onEnd = null) {
    const definition = window.getAnimationDefinition(this.entityType, animationType);
    if (!definition) {
      console.warn(`[EntityAnimation] No definition found for ${this.entityType}:${animationType}`);
      return false;
    }

    // Check priority if not forced
    if (!force && this.currentAnimation) {
      const currentPriority = window.getAnimationPriority(this.currentAnimation);
      const newPriority = window.getAnimationPriority(animationType);

      if (newPriority <= currentPriority) {
        // Lower or equal priority - don't interrupt
        return false;
      }
    }

    // Set new animation
    this.currentAnimation = animationType;
    this.animationDefinition = definition;
    this.currentFrame = 0;
    this.animationTime = 0;
    this.isPlaying = true;
    this.isLooping = definition.loop;
    this.onAnimationEnd = onEnd;
    this.forceAnimation = force;

    console.log(`[EntityAnimation] Set animation: ${this.entityType}:${animationType}`);
    return true;
  }

  // Update animation state
  update(dt) {
    if (!this.isPlaying || !this.animationDefinition) {
      return;
    }

    this.animationTime += dt;

    // Check if animation has individual frame durations
    if (this.animationDefinition.frameDurations) {
      this.updateWithVariableFrameTiming(dt);
    } else {
      this.updateWithFixedFrameTiming(dt);
    }
  }

  // Update with fixed frame duration (original logic)
  updateWithFixedFrameTiming(dt) {
    // Calculate current frame based on time
    const frameDuration = this.animationDefinition.duration / this.animationDefinition.frames;
    const totalFrames = Math.floor(this.animationTime / frameDuration);

    if (this.isLooping) {
      this.currentFrame = totalFrames % this.animationDefinition.frames;
    } else {
      this.currentFrame = Math.min(totalFrames, this.animationDefinition.frames - 1);

      // Check if animation has ended
      if (this.currentFrame >= this.animationDefinition.frames - 1) {
        this.onAnimationComplete();
      }
    }
  }

  // Update with variable frame durations
  updateWithVariableFrameTiming(dt) {
    const frameDurations = this.animationDefinition.frameDurations;
    let accumulatedTime = 0;
    const prevFrame = this.currentFrame;

    // Find which frame we should be on based on accumulated time
    for (let frame = 0; frame < frameDurations.length; frame++) {
      accumulatedTime += frameDurations[frame];
      if (this.animationTime < accumulatedTime) {
        this.currentFrame = frame;
        if (this.currentFrame !== prevFrame) {
          console.log(`[ANIMATION] Variable timing: Frame ${prevFrame} → ${this.currentFrame}, time: ${this.animationTime.toFixed(3)}s`);
        }
        return; // Still on this frame
      }
    }

    // Animation has ended
    this.currentFrame = frameDurations.length - 1;
    if (prevFrame !== this.currentFrame) {
      console.log(`[ANIMATION] Variable timing: Reached final frame ${this.currentFrame}, time: ${this.animationTime.toFixed(3)}s`);
    }
    if (!this.isLooping) {
      console.log(`[ANIMATION] Animation completed, calling onAnimationComplete`);
      this.onAnimationComplete();
    } else {
      // For looping animations with variable timing, wrap around
      this.animationTime = this.animationTime % this.animationDefinition.duration;
      this.updateWithVariableFrameTiming(0); // Recalculate current frame
    }
  }

  // Handle animation completion
  onAnimationComplete() {
    this.isPlaying = false;

    // Call completion callback
    if (this.onAnimationEnd) {
      this.onAnimationEnd();
      this.onAnimationEnd = null;
    }

    // Check for queued animations
    if (this.animationQueue.length > 0) {
      const nextAnimation = this.animationQueue.shift();
      this.setAnimation(nextAnimation.type, nextAnimation.force, nextAnimation.onEnd);
    } else if (!this.forceAnimation) {
      // Return to default animation based on movement state
      this.updateMovementAnimation();
    }
  }

  // Queue an animation to play after current one
  queueAnimation(animationType, force = false, onEnd = null) {
    this.animationQueue.push({ type: animationType, force, onEnd });
  }

  // Update facing direction based on movement
  updateFacingDirection() {
    if (this.entity.vx > 0) {
      this.facingDirection = 'right';
    } else if (this.entity.vx < 0) {
      this.facingDirection = 'left';
    }
    // Keep current direction if vx === 0
  }

  // Update movement state machine - called every frame
  updateMovementState() {
    // Allow movement animations to interrupt each other, even if forced
    // Only block if it's a non-movement forced animation (attacks, jumps, etc.)
    const isMovementAnimation = this.currentAnimation === window.ANIMATION_TYPES?.IDLE ||
                               this.currentAnimation === window.ANIMATION_TYPES?.WALK ||
                               this.currentAnimation === window.ANIMATION_TYPES?.RUN;

    if (this.forceAnimation && this.isPlaying && !isMovementAnimation) {
      // Don't interrupt non-movement forced animations (attacks, jumps, etc.)
      return;
    }

    const entity = this.entity;
    const speed = Math.sqrt(entity.vx * entity.vx + entity.vz * entity.vz);
    let newMovementState = this.movementStates.IDLE;

    // Determine current movement state
    if (speed > 0) {
      const runThreshold = window.SPEED * 0.7; // 70% of max speed
      newMovementState = speed >= runThreshold ? this.movementStates.RUNNING : this.movementStates.WALKING;
    }

    // Check if movement state changed
    if (newMovementState !== this.lastMovementState) {
      // Update animation based on new movement state
      let newAnimation = null;
      switch (newMovementState) {
        case this.movementStates.IDLE:
          newAnimation = window.ANIMATION_TYPES?.IDLE;
          break;
        case this.movementStates.WALKING:
          newAnimation = window.ANIMATION_TYPES?.WALK;
          break;
        case this.movementStates.RUNNING:
          newAnimation = window.ANIMATION_TYPES?.RUN;
          break;
      }

      if (newAnimation && newAnimation !== this.currentAnimation) {
        // Force movement animations - they should always override each other
        this.setAnimation(newAnimation, true);
      }

      this.lastMovementState = newMovementState;
    }
  }

  // Update animation based on entity movement and state
  updateMovementAnimation() {
    if (this.forceAnimation && this.isPlaying) {
      // Don't interrupt forced animations
      return;
    }

    const entity = this.entity;
    let newAnimation = null;

    // Check action-based animations first (highest priority)
    if (entity.currentAction) {
      switch (entity.currentAction) {
        case window.SKILL_TYPES?.JUMP:
          newAnimation = window.ANIMATION_TYPES?.JUMP;
          break;
        case window.SKILL_TYPES?.BASIC_ATTACK_LIGHT:
          newAnimation = window.ANIMATION_TYPES?.ATTACK_1;
          break;
        case window.SKILL_TYPES?.BASIC_ATTACK_MEDIUM:
          //newAnimation = window.ANIMATION_TYPES?.ATTACK_2;
          break;
        case window.SKILL_TYPES?.BASIC_ATTACK_HEAVY:
          //newAnimation = window.ANIMATION_TYPES?.ATTACK_3;
          break;
        case window.SKILL_TYPES?.SECONDARY_ATTACK_LIGHT:
          newAnimation = window.ANIMATION_TYPES?.ATTACK_2;
          break;
        case window.SKILL_TYPES?.SECONDARY_ATTACK_MEDIUM:
          //newAnimation = window.ANIMATION_TYPES?.ATTACK_2;
          break;
        case window.SKILL_TYPES?.SECONDARY_ATTACK_HEAVY:
          //newAnimation = window.ANIMATION_TYPES?.ATTACK_3;
          break;
      }
    }

    // If no action animation, check movement
    if (!newAnimation) {
      const speed = Math.sqrt(entity.vx * entity.vx + entity.vz * entity.vz);

      if (speed > 0) {
        // Determine if running or walking based on speed
        const runThreshold = window.SPEED * 0.7; // 70% of max speed
        if (speed >= runThreshold) {
          newAnimation = window.ANIMATION_TYPES?.RUN;
        } else {
          newAnimation = window.ANIMATION_TYPES?.WALK;
        }
      } else {
        // Not moving - idle
        newAnimation = window.ANIMATION_TYPES?.IDLE;
      }
    }

    // Set the animation if it's different from current
    if (newAnimation && newAnimation !== this.currentAnimation) {
      // Force action animations to interrupt movement
      const isActionAnimation = entity.currentAction !== null;
      console.log(`[ANIMATION] Setting ${newAnimation} animation (forced: ${isActionAnimation})`);
      this.setAnimation(newAnimation, isActionAnimation);
    }
  }

  // Force a specific animation (for special cases)
  forceAnimationType(animationType, onEnd = null) {
    return this.setAnimation(animationType, true, onEnd);
  }

  // Stop current animation
  stopAnimation() {
    this.isPlaying = false;
    this.currentAnimation = null;
    this.animationDefinition = null;
    this.onAnimationEnd = null;
    this.forceAnimation = false;
  }

  // Get current frame rectangle for rendering
  getCurrentFrameRect() {
    if (!this.animationDefinition || !window.spriteManager) {
      return null;
    }

    // Use frame data from animation definition
    const frameWidth = this.animationDefinition.frameWidth || 128;
    const frameHeight = this.animationDefinition.frameHeight || 128;
    const frameStarts = this.animationDefinition.frameStarts;

    if (frameStarts && frameStarts.length > this.currentFrame) {
      // Use explicit frame start positions
      const startX = frameStarts[this.currentFrame];
      return {
        x: startX,
        y: 0, // Assuming horizontal sprite sheet
        width: frameWidth,
        height: frameHeight
      };
    } else {
      // Fallback to automatic calculation if no frameStarts defined
      const totalFrames = this.animationDefinition.frames || 1;
      const spriteSheetInfo = window.spriteManager.createSpriteSheetInfo(
        this.animationDefinition.spriteSheet,
        {
          frameWidth,
          frameHeight,
          scale: 1,
          framesPerRow: totalFrames
        }
      );

      if (!spriteSheetInfo) {
        return null;
      }

      return window.spriteManager.getFrameRect(spriteSheetInfo, this.currentFrame);
    }
  }

  // Get current sprite sheet info
  getCurrentSpriteSheetInfo() {
    if (!this.animationDefinition || !window.spriteManager) {
      return null;
    }

    const config = window.getSpriteConfig(this.entityType);
    return window.spriteManager.createSpriteSheetInfo(
      this.animationDefinition.spriteSheet,
      config
    );
  }

  // Check if animation is currently playing
  isAnimationPlaying(animationType = null) {
    if (animationType) {
      return this.isPlaying && this.currentAnimation === animationType;
    }
    return this.isPlaying;
  }

  // Get animation progress (0-1)
  getAnimationProgress() {
    if (!this.animationDefinition || !this.isPlaying) {
      return 0;
    }

    const frameDuration = this.animationDefinition.duration / this.animationDefinition.frames;
    const currentFrameTime = this.currentFrame * frameDuration;
    const progressInCurrentFrame = (this.animationTime - currentFrameTime) / frameDuration;

    return Math.min((this.currentFrame + progressInCurrentFrame) / this.animationDefinition.frames, 1);
  }

  // Reset animation to beginning
  resetAnimation() {
    this.currentFrame = 0;
    this.animationTime = 0;
  }

  // Debug information
  getDebugInfo() {
    return {
      entityType: this.entityType,
      currentAnimation: this.currentAnimation,
      currentFrame: this.currentFrame,
      animationTime: this.animationTime,
      isPlaying: this.isPlaying,
      isLooping: this.isLooping,
      facingDirection: this.facingDirection,
      forceAnimation: this.forceAnimation,
      queueLength: this.animationQueue.length
    };
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EntityAnimation;
}
