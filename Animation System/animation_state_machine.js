// Animation State Machine
// Implements State Design Pattern for character animation states
// Provides clean, scalable FSM for managing animation transitions
// Phase 2: State management unification - integrate with AnimationSystem

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

    // For enemy entities, let AI control transitions - don't auto-transition
    if (entity.entityType === 'enemy') {
      return null;
    }

    // Player logic: Transition to idle if no movement, but prevent immediate oscillation
    if (!this.hasMovementInput(entity) && performance.now() - this.lastTransitionTime > 100) {
      console.log(`[FSM] Walking: no movement detected, vx=${entity.vx}, vz=${entity.vz}, transitioning to idle`);
      return 'idle';
    }

    // Check for running (higher speed)
    const speed = this.getMovementSpeed(entity);
    const runThreshold = window.SPEED * 1.1; // Increased to 1.1 so regular keyboard speed (1.0) is WALK
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
    entity.animation.setAnimation(window.ANIMATION_TYPES.IDLE, true);
    // Always reset damage dealt flag when entering idle (finished attacking)
    entity.damageDealt = false;
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
    // DEBUG: Добави тези логи
    console.log(`[WALKING UPDATE] vx=${entity.vx}, vz=${entity.vz}, targetZ=${entity.targetZ}`);
    const hasMovement = this.hasMovementInput(entity);
    console.log(`[WALKING UPDATE] hasMovementInput=${hasMovement}`);

    // Skip transition on the first update after entering
    if (this.justEntered) {
      this.justEntered = false;
      return null;
    }

    // Transition to idle if no movement, but prevent immediate oscillation
    if (!hasMovement && performance.now() - this.lastTransitionTime > 100) {
      console.log(`[FSM] Walking: no movement detected, vx=${entity.vx}, vz=${entity.vz}, transitioning to idle`);
      return 'idle';
    }

    // Check for running (higher speed)
    const speed = this.getMovementSpeed(entity);
    const runThreshold = window.SPEED * 1.1; // Increased to 1.1 so regular keyboard speed (1.0) is WALK
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
    if (this.justEntered) {
      this.justEntered = false;
      return null;
    }

    // Check for transitions back to walking or idle based on speed
    const speed = this.getMovementSpeed(entity);
    const runThreshold = window.SPEED * 1.1;

    if (speed < runThreshold && performance.now() - this.lastTransitionTime > 100) {
      if (this.hasMovementInput(entity)) {
        return 'walking';
      } else {
        return 'idle';
      }
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
      // Reset damage dealt flag for next attacks
      entity.damageDealt = false;
      console.log(`[FSM] Attack light completed (def.duration: ${entity.animation.animationDefinition.duration}s, animTime: ${entity.animation.animationTime}s), returning to movement`);
      // Return to appropriate movement state
      if (this.hasMovementInput(entity)) {
        return 'walking';
      } else {
        return 'idle';
      }
    }

    // Generate hitbox on LAST frame dynamically
    const currentFrame = entity.animation ? entity.animation.currentFrame : 0;
    const totalFrames = entity.animation?.animationDefinition?.frames || 0;

    if (totalFrames > 0 && currentFrame === totalFrames - 1) {
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
    try {
      console.log(`[DEBUG ATTACK_3] AttackMediumState enter - setting ATTACK_3 animation`);
      entity.animation.setAnimation(window.ANIMATION_TYPES.ATTACK_3, true);

      console.log(`[DEBUG ATTACK_3] AttackMediumState enter - damageDealt was: ${entity.damageDealt}`);
      entity.damageDealt = false;
      console.log(`[DEBUG ATTACK_3] AttackMediumState enter - damageDealt set to: false`);

      console.log(`[DEBUG ATTACK_3] AttackMediumState enter - consuming resources`);
      if (entity.entityType !== 'enemy') {
        const resourceManager = window.getResourceManager(entity);
        resourceManager.consumeSkillResources('basic_attack_medium');
        console.log(`[DEBUG ATTACK_3] AttackMediumState enter - resources consumed successfully`);
      }

      console.log(`[DEBUG ATTACK_3] AttackMediumState enter completed successfully`);
    } catch (error) {
      console.error(`[DEBUG ATTACK_3] Error in AttackMediumState.enter:`, error);
      console.error(`[DEBUG ATTACK_3] Error stack:`, error.stack);
    }
  }

  update(entity, dt) {
    // Skip transition on the first update after entering
    if (this.justEntered) {
      this.justEntered = false;
      return null;
    }

    //console.log(`[DEBUG UPDATE] AttackMediumState.update called`);
    //console.log(`[DEBUG UPDATE] entity.animation exists: ${!!entity.animation}`);

    if (entity.animation) {
      // Check if animation has completed (frame-based, not time-based)
      const currentFrame = entity.animation.currentFrame;
      const totalFrames = entity.animation.animationDefinition?.frames || 0;

      if (currentFrame >= totalFrames - 1) {
        //console.log(`[DEBUG ATTACK_3] Animation completed! damageDealt reset to false`);
        // Reset damage dealt flag for next attacks
        entity.damageDealt = false;

        const hasMovement = this.hasMovementInput(entity);
        //console.log(`[DEBUG ATTACK_3] hasMovementInput: ${hasMovement}, vx: ${entity.vx}, vz: ${entity.vz}`);

        if (hasMovement) {
          //console.log(`[DEBUG ATTACK_3] Transitioning to: walking`);
          return 'walking';
        } else {
          //console.log(`[DEBUG ATTACK_3] Transitioning to: idle`);
          return 'idle';
        }
      } else {
        // console.log(`[DEBUG UPDATE] Animation not completed yet`);
      }
    } else {
      console.log(`[DEBUG UPDATE] No entity.animation - cannot check completion`);
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
      // Reset damage dealt flag for next attacks
      entity.damageDealt = false;

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
      // Reset damage dealt flag for next attacks
      entity.damageDealt = false;

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
      // Reset damage dealt flag for next attacks
      entity.damageDealt = false;

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
      // Reset damage dealt flag for next attacks
      entity.damageDealt = false;

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
      // Reset damage dealt flag for next attacks
      entity.damageDealt = false;

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

    //console.log(`[FSM] Changed to state: ${newStateName}`);
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
// ENEMY STATE CLASSES
// ===========================================

// Generic enemy states that work with any enemy type
class EnemyIdleState extends AnimationState {
  constructor() {
    super('enemy_idle');
  }

  enter(entity) {
    super.enter(entity);
    console.log(`[DEBUG] EnemyIdleState.enter: START - isThinking=${entity.isThinking}, aiTimer=${entity.aiTimer}, pendingCommand=`, entity.pendingCommand);

    // Protect thinking phase from interruptions OR preserve pending commands
    const shouldProtect = (entity.isThinking && entity.aiTimer < 0) || entity.pendingCommand;
    console.log(`[DEBUG] EnemyIdleState.enter: shouldProtect calculation: (${entity.isThinking} && ${entity.aiTimer < 0}) || ${!!entity.pendingCommand} = ${shouldProtect}`);

    if (shouldProtect) {
      console.log(`[ENEMY IDLE] Protecting thinking phase OR pending command (aiTimer: ${entity.aiTimer}, hasPending: ${!!entity.pendingCommand})`);
      console.log(`[DEBUG] EnemyIdleState.enter: state preserved, pendingCommand =`, entity.pendingCommand);
      // Don't change animation or reset damage flags - preserve state
      return;
    }

    console.log(`[DEBUG] EnemyIdleState.enter: normal idle logic, preserving pendingCommand`);
    // Normal idle enter logic - preserve any pending commands
    // entity.pendingCommand = null; // REMOVED: Don't clear pending commands
    entity.isThinking = false;

    const idleType = this.getEntityAnimationType(entity, 'IDLE');
    if (entity.animation && idleType) {
      entity.animation.setAnimation(idleType, true);
    }
    entity.damageDealt = false;
  }

  update(entity, dt) {
    if (this.justEntered) {
      this.justEntered = false;
      return null;
    }

    // Check for movement transitions
    if (this.hasMovementInput(entity) && performance.now() - this.lastTransitionTime > 100) {
      return 'enemy_walking';
    }
  }

  // Helper to get animation type for entity
  getEntityAnimationType(entity, baseType) {
    const entityType = entity.animationEntityType || 'enemy';

    // Use the entity's animation definitions
    const animDefinitions = window.ANIMATION_DEFINITIONS[entityType];
    if (!animDefinitions) return null;

    // For entities with custom animation types (like BlueSlime)
    if (entityType === 'blue_slime') {
      return window.BLUE_SLIME_ANIMATION_TYPES?.[baseType] || null;
    }

    // For standard entities, return the animation type directly
    return window.ANIMATION_TYPES?.[baseType.toLowerCase()] || null;
  }
}

class EnemyWalkingState extends AnimationState {
  constructor() {
    super('enemy_walking');
  }

  enter(entity) {
    super.enter(entity);
    const walkType = this.getEntityAnimationType(entity, 'WALK');
    if (entity.animation && walkType) {
      entity.animation.setAnimation(walkType, true);
    }

    // DEBUG: Добави тези логи
    console.log(`[ENEMY WALKING ENTER] targetZ=${entity.targetZ}, vz before=${entity.vz}`);

    // Don't reset vz if we're in vertical movement mode (has targetZ)
    // This allows vertical movement commands to work properly
    if (!entity.targetZ) {
      entity.vz = 0;
      console.log(`[ENEMY WALKING ENTER] Reset vz to 0 (no targetZ)`);
    } else {
      console.log(`[ENEMY WALKING ENTER] Kept vz=${entity.vz} (has targetZ)`);
    }
  }

  update(entity, dt) {
    if (this.justEntered) {
      this.justEntered = false;
      return null;
    }

    // For AI enemies, transitions are handled by BT system
    // Don't do speed-based transitions - let BT decide
    return null;
  }

  getEntityAnimationType(entity, baseType) {
    if (entity.constructor.name === 'BlueSlime') {
      return window.BLUE_SLIME_ANIMATION_TYPES?.[baseType] || null;
    }
    return window.ANIMATION_TYPES?.[baseType.toLowerCase()] || null;
  }
}

class EnemyRunningState extends AnimationState {
  constructor() {
    super('enemy_running');
  }

  enter(entity) {
    super.enter(entity);
    const runType = this.getEntityAnimationType(entity, 'RUN');
    if (entity.animation && runType) {
      entity.animation.setAnimation(runType, true);
    }
  }

  update(entity, dt) {
    if (this.justEntered) {
      this.justEntered = false;
      return null;
    }

    // Transition to walking if speed drops
    const speed = this.getMovementSpeed(entity);
    const runThreshold = 30;
    if (speed < runThreshold && performance.now() - this.lastTransitionTime > 100) {
      if (this.hasMovementInput(entity)) {
        return 'enemy_walking';
      } else {
        return 'enemy_idle';
      }
    }
  }

  getEntityAnimationType(entity, baseType) {
    if (entity.constructor.name === 'BlueSlime') {
      return window.BLUE_SLIME_ANIMATION_TYPES?.[baseType] || null;
    }
    return window.ANIMATION_TYPES?.[baseType.toLowerCase()] || null;
  }
}

class EnemyAttackState extends AnimationState {
  constructor(attackType = 'ATTACK_1') {
    super('enemy_attack');
    this.attackType = attackType; // 'ATTACK_1', 'ATTACK_2', 'ATTACK_3', 'RUN_ATTACK'
  }

  enter(entity) {
    super.enter(entity);
    const animType = this.getEntityAnimationType(entity, this.attackType);
    if (entity.animation && animType) {
      entity.animation.setAnimation(animType, true);
    }
    entity.damageDealt = false;
  }

  update(entity, dt) {
    if (this.justEntered) {
      this.justEntered = false;
      return null;
    }

    // Check if animation has completed (DURATION-based)
    // FIX: Using duration check instead of frame index to allow last frame to play fully
    if (entity.animation && entity.animation.animationDefinition) {
      if (entity.animation.animationTime >= entity.animation.animationDefinition.duration) {
        // Animation completed full duration, reset damage flag
        entity.damageDealt = false;

        // Transition to idle state (like player attacks do)
        // This prevents enemy from staying in attack state indefinitely
        return 'enemy_idle';
      }
    }
  }

  getEntityAnimationType(entity, baseType) {
    if (entity.constructor.name === 'BlueSlime') {
      return window.BLUE_SLIME_ANIMATION_TYPES?.[baseType] || null;
    }
    return window.ANIMATION_TYPES?.[baseType.toLowerCase()] || null;
  }
}

class EnemyHurtState extends AnimationState {
  constructor() {
    super('enemy_hurt');
  }

  enter(entity) {
    super.enter(entity);
    const hurtType = this.getEntityAnimationType(entity, 'HURT');
    if (entity.animation && hurtType) {
      entity.animation.setAnimation(hurtType, true);
    }
  }

  update(entity, dt) {
    if (this.justEntered) {
      this.justEntered = false;
      return null;
    }

    // Hurt animation is usually short, transition back quickly
    if (entity.animation) {
      const currentFrame = entity.animation.currentFrame;
      const totalFrames = entity.animation.animationDefinition?.frames || 0;

      if (currentFrame >= totalFrames - 1) {
        // Hurt animation completed
        if (this.hasMovementInput(entity)) {
          return 'enemy_walking';
        } else {
          return 'enemy_idle';
        }
      }
    }
  }

  getEntityAnimationType(entity, baseType) {
    if (entity.constructor.name === 'BlueSlime') {
      return window.BLUE_SLIME_ANIMATION_TYPES?.[baseType] || null;
    }
    return window.ANIMATION_TYPES?.[baseType.toLowerCase()] || null;
  }
}

class EnemyDeadState extends AnimationState {
  constructor() {
    super('enemy_dead');
  }

  enter(entity) {
    super.enter(entity);
    const deadType = this.getEntityAnimationType(entity, 'DEAD');
    if (entity.animation && deadType) {
      entity.animation.setAnimation(deadType, true);
    }
  }

  update(entity, dt) {
    // Dead state doesn't transition - entity will be removed
    return null;
  }

  getEntityAnimationType(entity, baseType) {
    if (entity.constructor.name === 'BlueSlime') {
      return window.BLUE_SLIME_ANIMATION_TYPES?.[baseType] || null;
    }
    return window.ANIMATION_TYPES?.[baseType.toLowerCase()] || null;
  }
}

// ===========================================
// ENEMY FSM CLASS
// ===========================================

class EnemyAnimationStateMachine extends AnimationStateMachine {
  constructor(entity) {
    // Call super but prevent the unwanted changeState('idle') call
    const originalChangeState = AnimationStateMachine.prototype.changeState;
    let skipBaseInit = true;

    AnimationStateMachine.prototype.changeState = function (stateName) {
      if (skipBaseInit && stateName === 'idle') {
        // Skip the base constructor's changeState('idle') call
        return true;
      }
      return originalChangeState.call(this, stateName);
    };

    super(entity);
    skipBaseInit = false;

    // Restore original method
    AnimationStateMachine.prototype.changeState = originalChangeState;

    // Clear player states and add enemy states
    this.states.clear();
    this.addState('enemy_idle', EnemyIdleState);
    this.addState('enemy_walking', EnemyWalkingState);
    this.addState('enemy_running', EnemyRunningState);
    this.addState('enemy_attack', EnemyAttackState);
    this.addState('enemy_hurt', EnemyHurtState);
    this.addState('enemy_dead', EnemyDeadState);

    // Start in enemy_idle state
    this.changeState('enemy_idle');
  }

  // Override to handle enemy-specific attack types
  handleAction(actionType) {
    if (!this.currentState) return;

    let transitionResult = null;

    switch (actionType) {
      case 'attack_1':
        transitionResult = 'enemy_attack';
        // Set attack type for the attack state
        this.pendingAttackType = 'ATTACK_1';
        break;
      case 'attack_2':
        transitionResult = 'enemy_attack';
        this.pendingAttackType = 'ATTACK_2';
        break;
      case 'attack_3':
        transitionResult = 'enemy_attack';
        this.pendingAttackType = 'ATTACK_3';
        break;
      case 'run_attack':
        transitionResult = 'enemy_attack';
        this.pendingAttackType = 'RUN_ATTACK';
        break;
      case 'hurt':
        transitionResult = 'enemy_hurt';
        break;
      case 'die':
        transitionResult = 'enemy_dead';
        break;
    }

    if (transitionResult) {
      this.changeState(transitionResult);
    }
  }

  // Override changeState to handle attack type setting
  changeState(newStateName) {
    // If transitioning to attack state, update the attack type
    if (newStateName === 'enemy_attack' && this.pendingAttackType) {
      const attackState = this.states.get('enemy_attack');
      if (attackState) {
        attackState.attackType = this.pendingAttackType;
      }
      this.pendingAttackType = null;
    }

    // Call parent changeState
    return super.changeState(newStateName);
  }

  // Check if enemy is in attack state
  isInAttackState() {
    return this.currentState && this.currentState.name === 'enemy_attack';
  }

  // Get current attack type
  getCurrentAttackType() {
    if (this.currentState && this.currentState.name === 'enemy_attack') {
      return this.currentState.attackType;
    }
    return null;
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
window.EnemyAnimationStateMachine = EnemyAnimationStateMachine;
window.AnimationInput = AnimationInput;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AnimationStateMachine, AnimationInput };
}
