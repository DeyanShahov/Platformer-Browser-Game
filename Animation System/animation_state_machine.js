// Animation State Machine
// Implements State Design Pattern for character animation states
// Provides clean, scalable FSM for managing animation transitions

// ===========================================
// BASE STATE CLASS
// ===========================================

class AnimationState {
  constructor(name) {
    this.name = name;
    this.lastTransitionTime = 0;
    this.justEntered = false;
  }

  // Called when entering this state
  enter(entity) {
    // console.log(`[FSM] Entering state: ${this.name}`); // Reduced spam
    this.justEntered = true;
  }

  // Called when exiting this state
  exit(entity) {
    // console.log(`[FSM] Exiting state: ${this.name}`); // Reduced spam
  }

  // Called every frame while in this state
  update(entity, dt) {
    // Skip transition on the first update after entering
    if (this.justEntered) {
      this.justEntered = false;
      return null;
    }

    // Transition to idle if no movement, but prevent immediate oscillation
    if (!this.hasMovementInput(entity) && performance.now() - this.lastTransitionTime > 100) {
      console.log(`[FSM] Walking: no movement detected, vx=${entity.vx}, vz=${entity.vz}, transitioning to idle`);
      return 'idle';
    }

    // Check for running (higher speed)
    const speed = this.getMovementSpeed(entity);
    const runThreshold = window.SPEED * 0.7;
    if (speed >= runThreshold && performance.now() - this.lastTransitionTime > 100) {
      return 'running';
    }
  }

  // Check if can transition to another state
  canTransitionTo(newStateName) {
    // Override in subclasses for transition validation
    return true;
  }

  // Helper to get movement speed
  getMovementSpeed(entity) {
    return Math.sqrt(entity.vx * entity.vx + entity.vz * entity.vz);
  }

  // Helper to check if entity has movement input
  hasMovementInput(entity) {
    return Math.abs(entity.vx) > 0.1 || Math.abs(entity.vz) > 0.1;
  }
}

// ===========================================
// CONCRETE STATE CLASSES
// ===========================================

class IdleState extends AnimationState {
  constructor() {
    super('idle');
  }

  enter(entity) {
    super.enter(entity);
    entity.animation.setAnimation(window.ANIMATION_TYPES.IDLE, true); // Force animation
  }

  update(entity, dt) {
    // Skip transition on the first update after entering
    if (this.justEntered) {
      this.justEntered = false;
      return null;
    }

    // Check for movement transitions every frame, but prevent immediate oscillation
    if (this.hasMovementInput(entity) && performance.now() - this.lastTransitionTime > 100) {
      return 'walking';
    }
  }

  handleAction(entity, actionType) {
    switch (actionType) {
      case 'jump':
        return 'jumping';
      case 'attack_light':
        return 'attack_light';
      case 'attack_medium':
        return 'attack_medium';
      case 'attack_heavy':
        return 'attack_heavy';
      case 'secondary_attack_light':
        return 'secondary_attack_light';
      case 'secondary_attack_medium':
        return 'secondary_attack_medium';
      case 'secondary_attack_heavy':
        return 'secondary_attack_heavy';
    }
    return null;
  }
}

class WalkingState extends AnimationState {
  constructor() {
    super('walking');
  }

  enter(entity) {
    super.enter(entity);
    entity.animation.setAnimation(window.ANIMATION_TYPES.WALK, true); // Force animation
  }

  update(entity, dt) {
    // Skip transition on the first update after entering
    if (this.justEntered) {
      this.justEntered = false;
      return null;
    }

    // Transition to idle if no movement, but prevent immediate oscillation
    if (!this.hasMovementInput(entity) && performance.now() - this.lastTransitionTime > 100) {
      console.log(`[FSM] Walking: no movement detected, vx=${entity.vx}, vz=${entity.vz}, transitioning to idle`);
      return 'idle';
    }

    // Check for running (higher speed)
    const speed = this.getMovementSpeed(entity);
    const runThreshold = window.SPEED * 0.7;
    if (speed >= runThreshold && performance.now() - this.lastTransitionTime > 100) {
      return 'running';
    }
  }

  handleAction(entity, actionType) {
    switch (actionType) {
      case 'jump':
        return 'jumping';
      case 'attack_light':
        return 'attack_light';
      case 'attack_medium':
        return 'attack_medium';
      case 'attack_heavy':
        return 'attack_heavy';
      case 'secondary_attack_light':
        return 'secondary_attack_light';
      case 'secondary_attack_medium':
        return 'secondary_attack_medium';
      case 'secondary_attack_heavy':
        return 'secondary_attack_heavy';
    }
    return null;
  }
}

class RunningState extends AnimationState {
  constructor() {
    super('running');
  }

  enter(entity) {
    super.enter(entity);
    entity.animation.setAnimation(window.ANIMATION_TYPES.RUN, true); // Force animation
  }

  update(entity, dt) {
    // Skip transition on the first update after entering
    if (this.justEntered) {
      this.justEntered = false;
      return null;
    }

    // Transition to walking if speed drops
    const speed = this.getMovementSpeed(entity);
    const runThreshold = window.SPEED * 0.7;

    if (speed < runThreshold) {
      if (this.hasMovementInput(entity)) {
        return 'walking';
      } else {
        return 'idle';
      }
    }
  }

  handleAction(entity, actionType) {
    switch (actionType) {
      case 'jump':
        return 'jumping';
      case 'attack_light':
      case 'attack_medium':
      case 'attack_heavy':
        return 'run_attack'; // Running attacks are special
    }
    return null;
  }
}

class JumpingState extends AnimationState {
  constructor() {
    super('jumping');
  }

  enter(entity) {
    super.enter(entity);
    // Force jump animation
    entity.animation.forceAnimationType(window.ANIMATION_TYPES.JUMP, () => {
      console.log(`[FSM] Jump animation completed, checking landing state`);
      // Animation completed - check if we should transition
      // This will be handled by landing detection in game.js
    });
  }

  update(entity, dt) {
    // Check if landed during jump animation
    if (entity.onGround) {
      console.log(`[FSM] Landed during jump animation, transitioning to movement state`);
      // Determine next state based on movement
      if (this.hasMovementInput(entity)) {
        return 'walking';
      } else {
        return 'idle';
      }
    }
  }

  // Jumping state doesn't handle input - physics handles jumping
  handleInput(entity, input) {
    // Can't interrupt jump with other actions
    return null;
  }
}

class AttackLightState extends AnimationState {
  constructor() {
    super('attack_light');
  }

  enter(entity) {
    super.enter(entity);
    entity.animation.setAnimation(window.ANIMATION_TYPES.ATTACK_1, true);
    // Reset damage flag when starting attack
    entity.damageDealt = false;
  }

  // Track animation frame for hitbox generation and completion
  update(entity, dt) {
    // Skip transition on the first update after entering
    if (this.justEntered) {
      this.justEntered = false;
      return null;
    }

    // Check if animation has completed (played full duration)
    if (entity.animation && entity.animation.animationTime >= entity.animation.animationDefinition.duration) {
      console.log(`[FSM] Attack light completed (duration: ${entity.animation.animationDefinition.duration}s), returning to movement`);
      // Return to appropriate movement state
      if (this.hasMovementInput(entity)) {
        return 'walking';
      } else {
        return 'idle';
      }
    }

    // Generate hitbox on frame 5 (last frame, 0-indexed as frame 4)
    const currentFrame = entity.animation ? entity.animation.currentFrame : 0;
    if (currentFrame === 4) { // 5th frame (0-indexed)
      // Hitbox generation will be handled in collision.js based on animation frame
      // The collision system will check currentFrame instead of currentAction
    }
  }

  // Prevent interrupting attacks with other attacks
  handleAction(entity, actionType) {
    // During attack animation, don't allow other attack actions
    switch (actionType) {
      case 'attack_light':
      case 'attack_medium':
      case 'attack_heavy':
      case 'secondary_attack_light':
      case 'secondary_attack_medium':
      case 'secondary_attack_heavy':
        return null; // Block attack actions during attack
      default:
        return null; // Block all actions during attack for simplicity
    }
  }
}

class AttackMediumState extends AnimationState {
  constructor() {
    super('attack_medium');
  }

  enter(entity) {
    super.enter(entity);
    entity.animation.setAnimation(window.ANIMATION_TYPES.ATTACK_2, true);
    // Reset damage flag when starting attack
    entity.damageDealt = false;
  }

  update(entity, dt) {
    // Skip transition on the first update after entering
    if (this.justEntered) {
      this.justEntered = false;
      return null;
    }

    // Check if animation has completed
    if (entity.animation && entity.animation.animationTime >= entity.animation.animationDefinition.duration) {
      if (this.hasMovementInput(entity)) {
        return 'walking';
      } else {
        return 'idle';
      }
    }
  }

  // Prevent interrupting attacks
  handleAction(entity, actionType) {
    switch (actionType) {
      case 'attack_light':
      case 'attack_medium':
      case 'attack_heavy':
      case 'secondary_attack_light':
      case 'secondary_attack_medium':
      case 'secondary_attack_heavy':
        return null;
      default:
        return null;
    }
  }
}

class AttackHeavyState extends AnimationState {
  constructor() {
    super('attack_heavy');
  }

  enter(entity) {
    super.enter(entity);
    entity.animation.setAnimation(window.ANIMATION_TYPES.ATTACK_3, true);
    // Reset damage flag when starting attack
    entity.damageDealt = false;
  }

  update(entity, dt) {
    // Skip transition on the first update after entering
    if (this.justEntered) {
      this.justEntered = false;
      return null;
    }

    // Check if animation has completed
    if (entity.animation && entity.animation.animationTime >= entity.animation.animationDefinition.duration) {
      if (this.hasMovementInput(entity)) {
        return 'walking';
      } else {
        return 'idle';
      }
    }
  }

  // Prevent interrupting attacks
  handleAction(entity, actionType) {
    switch (actionType) {
      case 'attack_light':
      case 'attack_medium':
      case 'attack_heavy':
      case 'secondary_attack_light':
      case 'secondary_attack_medium':
      case 'secondary_attack_heavy':
        return null;
      default:
        return null;
    }
  }
}

// Secondary attacks
class SecondaryAttackLightState extends AnimationState {
  constructor() {
    super('secondary_attack_light');
  }

  enter(entity) {
    super.enter(entity);
    entity.animation.setAnimation(window.ANIMATION_TYPES.ATTACK_2, true);
    entity.damageDealt = false; // Reset damage flag when starting attack
  }

  update(entity, dt) {
    if (this.justEntered) {
      this.justEntered = false;
      return null;
    }

    if (entity.animation && entity.animation.animationTime >= entity.animation.animationDefinition.duration) {
      if (this.hasMovementInput(entity)) {
        return 'walking';
      } else {
        return 'idle';
      }
    }
  }

  handleAction(entity, actionType) {
    switch (actionType) {
      case 'attack_light':
      case 'attack_medium':
      case 'attack_heavy':
      case 'secondary_attack_light':
      case 'secondary_attack_medium':
      case 'secondary_attack_heavy':
        return null;
      default:
        return null;
    }
  }
}

class SecondaryAttackMediumState extends AnimationState {
  constructor() {
    super('secondary_attack_medium');
  }

  enter(entity) {
    super.enter(entity);
    entity.animation.setAnimation(window.ANIMATION_TYPES.ATTACK_2, true);
  }

  update(entity, dt) {
    if (this.justEntered) {
      this.justEntered = false;
      return null;
    }

    if (entity.animation && entity.animation.animationTime >= entity.animation.animationDefinition.duration) {
      if (this.hasMovementInput(entity)) {
        return 'walking';
      } else {
        return 'idle';
      }
    }
  }

  handleAction(entity, actionType) {
    switch (actionType) {
      case 'attack_light':
      case 'attack_medium':
      case 'attack_heavy':
      case 'secondary_attack_light':
      case 'secondary_attack_medium':
      case 'secondary_attack_heavy':
        return null;
      default:
        return null;
    }
  }
}

class SecondaryAttackHeavyState extends AnimationState {
  constructor() {
    super('secondary_attack_heavy');
  }

  enter(entity) {
    super.enter(entity);
    entity.animation.setAnimation(window.ANIMATION_TYPES.ATTACK_3, true);
  }

  update(entity, dt) {
    if (this.justEntered) {
      this.justEntered = false;
      return null;
    }

    if (entity.animation && entity.animation.animationTime >= entity.animation.animationDefinition.duration) {
      if (this.hasMovementInput(entity)) {
        return 'walking';
      } else {
        return 'idle';
      }
    }
  }

  handleAction(entity, actionType) {
    switch (actionType) {
      case 'attack_light':
      case 'attack_medium':
      case 'attack_heavy':
      case 'secondary_attack_light':
      case 'secondary_attack_medium':
      case 'secondary_attack_heavy':
        return null;
      default:
        return null;
    }
  }
}

class RunAttackState extends AnimationState {
  constructor() {
    super('run_attack');
  }

  enter(entity) {
    super.enter(entity);
    entity.animation.setAnimation(window.ANIMATION_TYPES.RUN_ATTACK, true);
  }

  update(entity, dt) {
    if (this.justEntered) {
      this.justEntered = false;
      return null;
    }

    if (entity.animation && entity.animation.animationTime >= entity.animation.animationDefinition.duration) {
      const speed = this.getMovementSpeed(entity);
      const runThreshold = window.SPEED * 0.7;

      if (speed >= runThreshold) {
        return 'running';
      } else if (this.hasMovementInput(entity)) {
        return 'walking';
      } else {
        return 'idle';
      }
    }
  }

  handleAction(entity, actionType) {
    switch (actionType) {
      case 'attack_light':
      case 'attack_medium':
      case 'attack_heavy':
      case 'secondary_attack_light':
      case 'secondary_attack_medium':
      case 'secondary_attack_heavy':
        return null;
      default:
        return null;
    }
  }
}

// ===========================================
// STATE MACHINE CLASS
// ===========================================

class AnimationStateMachine {
  constructor(entity) {
    this.entity = entity;
    this.currentState = null;
    this.states = new Map();
    this.pendingTransition = null;

    // Register all states
    this.addState('idle', IdleState);
    this.addState('walking', WalkingState);
    this.addState('running', RunningState);
    this.addState('jumping', JumpingState);
    this.addState('attack_light', AttackLightState);
    this.addState('attack_medium', AttackMediumState);
    this.addState('attack_heavy', AttackHeavyState);
    this.addState('secondary_attack_light', SecondaryAttackLightState);
    this.addState('secondary_attack_medium', SecondaryAttackMediumState);
    this.addState('secondary_attack_heavy', SecondaryAttackHeavyState);
    this.addState('run_attack', RunAttackState);

    // Start in idle state
    this.changeState('idle');
  }

  addState(stateName, stateClass) {
    this.states.set(stateName, new stateClass());
  }

  changeState(newStateName) {
    if (!this.states.has(newStateName)) {
      console.error(`[FSM] Unknown state: ${newStateName}`);
      return false;
    }

    // Check if transition is allowed
    if (this.currentState && !this.currentState.canTransitionTo(newStateName)) {
      console.warn(`[FSM] Transition to ${newStateName} not allowed from ${this.currentState.name}`);
      return false;
    }

    // Exit current state
    if (this.currentState) {
      this.currentState.exit(this.entity);
    }

    // Enter new state
    const newState = this.states.get(newStateName);
    this.currentState = newState;
    newState.lastTransitionTime = performance.now();
    newState.enter(this.entity);

    console.log(`[FSM] Changed to state: ${newStateName}`);
    return true;
  }

  update(dt) {
    if (!this.currentState) return;

    // Update current state and check for transition
    const transitionResult = this.currentState.update(this.entity, dt);
    if (transitionResult) {
      console.log(`[FSM] State ${this.currentState.name} requesting transition to: ${transitionResult}`);
      this.changeState(transitionResult);
    }
  }

  handleInput(input) {
    if (!this.currentState) return;

    // Let current state handle input
    const transitionResult = this.currentState.handleInput(this.entity, input);
    if (transitionResult) {
      this.changeState(transitionResult);
    }
  }

  getCurrentStateName() {
    return this.currentState ? this.currentState.name : 'none';
  }

  isInState(stateName) {
    return this.currentState && this.currentState.name === stateName;
  }

  // Check if current state is an attack state (prevents movement during attacks)
  isInAttackState() {
    return this.currentState && (
      this.currentState.name === 'attack_light' ||
      this.currentState.name === 'attack_medium' ||
      this.currentState.name === 'attack_heavy' ||
      this.currentState.name === 'secondary_attack_light' ||
      this.currentState.name === 'secondary_attack_medium' ||
      this.currentState.name === 'secondary_attack_heavy' ||
      this.currentState.name === 'run_attack'
    );
  }

  // Get current attack type from FSM state (automatic parsing) - now uses SKILL_TYPES
  getCurrentAttackType() {
    const stateName = this.currentState?.name || '';

    // Basic attacks
    if (stateName.startsWith('attack_')) {
      const attackLevel = stateName.split('_')[1]; // 'light', 'medium', 'heavy'
      const skillTypeKey = `BASIC_ATTACK_${attackLevel.toUpperCase()}`;
      return window.SKILL_TYPES?.[skillTypeKey] || null;
    }

    // Secondary attacks
    if (stateName.startsWith('secondary_attack_')) {
      const attackLevel = stateName.split('_')[2]; // 'light', 'medium', 'heavy'
      const skillTypeKey = `SECONDARY_ATTACK_${attackLevel.toUpperCase()}`;
      return window.SKILL_TYPES?.[skillTypeKey] || null;
    }

    // Run attack
    if (stateName === 'run_attack') {
      return window.SKILL_TYPES?.RUN_ATTACK || null;
    }

    return null;
  }

  // Handle discrete actions (jump, attack, etc.)
  handleAction(actionType) {
    if (!this.currentState) return;

    // Let current state handle the action
    const transitionResult = this.currentState.handleAction(this.entity, actionType);
    if (transitionResult) {
      this.changeState(transitionResult);
    }
  }

  // Force transition (for special cases)
  forceState(stateName) {
    if (this.currentState) {
      this.currentState.exit(this.entity);
    }

    const newState = this.states.get(stateName);
    if (newState) {
      this.currentState = newState;
      newState.enter(this.entity);
      console.log(`[FSM] Force changed to state: ${stateName}`);
      return true;
    }
    return false;
  }
}

// ===========================================
// INPUT HELPER
// ===========================================

class AnimationInput {
  constructor() {
    this.jumpPressed = false;
    this.attackPressed = false;
    this.attackType = null;
    this.hasMovement = false;
  }

  reset() {
    this.jumpPressed = false;
    this.attackPressed = false;
    this.attackType = null;
  }
}

// Global instances
window.AnimationStateMachine = AnimationStateMachine;
window.AnimationInput = AnimationInput;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AnimationStateMachine, AnimationInput };
}
