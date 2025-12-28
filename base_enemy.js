/* =========================
   BASE ENEMY CLASS
   Universal AI system with idle thinking as transitional state
   All enemy types should inherit from this class
   ========================= */

class BaseEnemy {
  constructor(x, y, z, config = {}) {
    // Position and dimensions (must be overridden by subclasses)
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = config.w || 100;  // Visual width
    this.h = config.h || 100;  // Visual height
    this.collisionW = config.collisionW || 50;  // Collision width
    this.collisionH = config.collisionH || 50;  // Collision height
    this.zThickness = config.zThickness || 3;   // Z thickness for 2.5D collision
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.onGround = false;

    // Entity type
    this.entityType = 'enemy';

    // Enemy stats (should be overridden by subclasses)
    this.level = config.level || 1;
    this.maxHealth = config.maxHealth || 100;
    this.health = this.maxHealth;
    this.baseAttack = config.baseAttack || 10;
    this.baseDefense = config.baseDefense || 5;
    this.speed = config.speed || 50;

    // Combat flags
    this.hit = false;
    this.damageDealt = false;
    this.isDying = false;
    this.deathTimer = 0;
    this.blinkCount = 0;
    this.visible = true;

    // Character info for combat system
    this.characterInfo = new CharacterInfo('enemy');
    this.characterInfo.baseAttack = this.baseAttack;
    this.characterInfo.baseDefense = this.baseDefense;
    this.characterInfo.strength = config.strength || 5;
    this.characterInfo.criticalChance = config.criticalChance || 0.03;

    // AI behavior - legacy system (for fallback)
    this.aiState = 'idle'; // idle, patrol, chase, attack, flee
    this.aiTimer = 0;
    this.detectionRange = 300; // Distance to detect player
    this.attackRange = 100;    // Distance to attack player
    this.patrolDirection = 1;  // 1 = right, -1 = left
    this.patrolDistance = 200; // How far to patrol
    this.startX = x;           // Original spawn position

    // BT AI Properties (universal system)
    this.rarity = config.rarity || 'common';        // BT rarity level
    this.intelligence = config.intelligence || 'basic';   // BT intelligence level

    // Script system properties (PHASE 4)
    this.scriptConfig = config.scriptConfig || null;  // Script configuration
    this.activeScript = null;                         // Loaded script instance

    // Pending command system for smooth transitions
    this.pendingCommand = null;    // Command waiting to be executed after thinking phase
    this.isThinking = true;        // Whether currently in thinking (IDLE) phase - start thinking
    this.hasStarted = false;       // Whether this is the first update cycle

    // Animation entity type (must be overridden by subclasses)
    this.animationEntityType = config.animationEntityType || 'enemy';

    // Animation system - will be set by animation system after registration
    this.animation = null;
    this.stateMachine = null; // Will be created after animation registration

    // Initialize BT AI System (universal)
    this.initializeBT();

    // Initialize script system if specified (PHASE 4)
    if (this.scriptConfig?.scriptId) {
      this.initializeScript();
    }

    // Register with combat system
    if (window.enemyCombatManager) {
      window.enemyCombatManager.registerEnemy(this);
    }

    console.log(`[BASE ENEMY] Created ${this.constructor.name} (Level ${this.level}) at (${x}, ${y}) with ${this.maxHealth} HP${this.activeScript ? ` [SCRIPT: ${this.activeScript.name}]` : ''}`);
  }

  // Initialize Behavior Tree AI System (universal system)
  initializeBT() {
    if (!window.createUniversalEnemyBehaviorTree || !window.tickEnemyAI || !window.createAttackProfile) {
      console.warn('[BASE ENEMY] Universal BT system not loaded, using fallback AI');
      return;
    }

    // Create BT context using rarity/intelligence system
    this.aiContext = {
      name: `${this.constructor.name}_${this.level}`,
      rarity: this.rarity,
      intelligence: this.intelligence,
      self: { hp: this.health, maxHp: this.maxHealth, x: this.x, y: this.y },
      targets: [], // Will be updated in updateAI
      capabilities: { canBlock: false, canEvade: false },
      attackProfile: this.createAttackProfile(), // Subclasses can override
      intelligence: { blockChance: 0, evadeChance: 0.1, aggression: 0.3 },
      behaviors: window.ENEMY_BEHAVIORS?.[this.rarity]?.[this.intelligence], // Rarity/intelligence config
      phaseSpecialAvailable: false, // Override for boss enemies
      command: null,
    };

    // Create BT tree using universal factory
    this.aiContext.behaviorTree = window.createUniversalEnemyBehaviorTree(this.rarity, this.intelligence);

    console.log(`[BASE ENEMY] Universal BT AI system initialized: ${this.rarity}/${this.intelligence}`);
  }

  // Create attack profile (can be overridden by subclasses)
  createAttackProfile() {
    return window.createAttackProfile ? window.createAttackProfile(["light"]) : null;
  }

  // PHASE 4: Initialize script system if specified
  async initializeScript() {
    if (!this.scriptConfig?.scriptId) {
      console.log(`[SCRIPT_INIT] No script config for ${this.constructor.name}, using base system`);
      return;
    }

    try {
      console.log(`[SCRIPT_INIT] Initializing ${this.scriptConfig.scriptId} for ${this.constructor.name}`);

      // Load script through manager
      if (window.enemyScriptManager && window.enemyScriptManager.loadScript) {
        this.activeScript = await window.enemyScriptManager.loadScript(this.scriptConfig.scriptId);

        // Validate script type matches configuration
        if (this.activeScript.type !== this.scriptConfig.type) {
          throw new Error(`Script type mismatch: config says ${this.scriptConfig.type}, script is ${this.activeScript.type}`);
        }

        console.log(`[SCRIPT_INIT] Successfully loaded: ${this.activeScript.name} (${this.activeScript.type})`);
      } else {
        console.warn(`[SCRIPT_INIT] Script manager not available, falling back to base system`);
      }

    } catch (error) {
      console.error(`[SCRIPT_INIT] Failed to load ${this.scriptConfig.scriptId}:`, error);
      // Continue without script (fallback to base system)
      this.scriptConfig = null;
      this.activeScript = null;
    }
  }

  // PHASE 4: Runtime script switching (for boss phases)
  async switchScript(newScriptId) {
    if (!newScriptId) {
      console.log(`[SCRIPT_SWITCH] Disabling script for ${this.constructor.name}, reverting to base system`);
      this.scriptConfig = null;
      this.activeScript = null;
      // Recreate base BT
      if (window.createUniversalEnemyBehaviorTree) {
        this.aiContext.behaviorTree = window.createUniversalEnemyBehaviorTree(this.rarity, this.intelligence);
      }
      return;
    }

    try {
      console.log(`[SCRIPT_SWITCH] Switching ${this.constructor.name} to script: ${newScriptId}`);

      if (window.enemyScriptManager && window.enemyScriptManager.switchScript) {
        const newScript = await window.enemyScriptManager.switchScript(this, newScriptId);
        console.log(`[SCRIPT_SWITCH] Switched to: ${newScript.name}`);

        // Update BT context with new script BT
        if (this.aiContext) {
          this.aiContext.behaviorTree = newScript.behaviorTree;
        }
      } else {
        throw new Error('Script manager not available');
      }

    } catch (error) {
      console.error(`[SCRIPT_SWITCH] Failed to switch script for ${this.constructor.name}:`, error);
      // Fallback to base system
      this.scriptConfig = null;
      this.activeScript = null;
    }
  }

  // AI Update - FSM controls execution, BT provides strategic decisions
  updateAI(players, dt) {
    if (this.isDying) return;

    // Update BT context with current game state (for when BT is consulted)
    this.updateBTContext(players);

    // FSM handles all movement and animation logic
    // BT is consulted only for strategic decisions (behavior transitions)
    this.updateFSMBehavior(players, dt);
  }

  // FSM-based behavior control - consults BT for strategic decisions
  updateFSMBehavior(players, dt) {
    if (!this.stateMachine) {
      console.log('[BASE ENEMY FSM] No stateMachine available');
      return;
    }

    // Check if this is the first update cycle and we need to start thinking
    if (!this.hasStarted && this.isThinking) {
      this.hasStarted = true;
      const behaviors = this.aiContext?.behaviors || {};
      this.startThinkingPhase(behaviors);
      return; // Don't process normal behavior this frame
    }

    const currentState = this.stateMachine.getCurrentStateName();
    const behaviors = this.aiContext?.behaviors || {};

    //console.log(`[BASE ENEMY FSM] Current state: ${currentState}, aiTimer: ${this.aiTimer}, vx: ${this.vx}`);

    // State-specific behavior logic
    switch(currentState) {
      case 'enemy_idle':
        this.updateIdleBehavior(players, dt, behaviors);
        break;

      case 'enemy_walking':
        this.updateWalkingBehavior(players, dt, behaviors);
        break;

      case 'enemy_running':
        this.updateRunningBehavior(players, dt, behaviors);
        break;

      case 'enemy_attack':
      case 'enemy_attack_light':
      case 'enemy_attack_medium':
      case 'enemy_attack_heavy':
        this.updateAttackBehavior(players, dt, behaviors);
        break;

      default:
        // Unknown state, go to idle
        console.log(`[BASE ENEMY FSM] Unknown state ${currentState}, going to enemy_idle`);
        this.stateMachine.changeState('enemy_idle');
        break;
    }
  }

  // Idle behavior: wait for duration, then consult BT for next action or execute pending command
  updateIdleBehavior(players, dt, behaviors) {
    //console.log(`[DEBUG] ${this.constructor.name} #${this.level} updateIdleBehavior: START - isThinking=${this.isThinking}, aiTimer=${this.aiTimer}, pendingCommand=`, this.pendingCommand);

    // Handle negative timer (thinking phase)
    if (this.aiTimer < 0) {
      // Check for interruptions during thinking phase FIRST (before timer increment)
      const closestPlayer = this.getClosestPlayer(players);
      const chaseRadius = behaviors.chase?.radiusX || 300;
      //console.log(`[DEBUG] Thinking interruption check: aiTimer=${this.aiTimer}, hasPlayer=${!!closestPlayer}, distance=${closestPlayer?.distance}, chaseRadius=${chaseRadius}, condition=${!!(closestPlayer && closestPlayer.distance <= chaseRadius)}`);
      if (closestPlayer && closestPlayer.distance <= chaseRadius) {
        console.log(`[BASE ENEMY THINKING] Player detected during thinking, interrupting - distance: ${closestPlayer.distance} <= ${chaseRadius}`);
        // Player detected - interrupt thinking and handle immediately
        this.isThinking = false;
        // DON'T clear pendingCommand - transitionToBehavior() will overwrite it if needed

        const nextBehavior = this.consultBTForBehavior(players, { reason: 'player_detected', playerDistance: closestPlayer.distance });
        this.transitionToBehavior(nextBehavior, behaviors);
        return;
      }
      //console.log(`[DEBUG] No thinking interruption, continuing thinking phase`);

      // Thinking phase - count up from negative to 0
      this.aiTimer += dt;
      this.vx = 0; // No movement

      const thinkingDuration = Math.abs(this.aiTimer); // Original negative value
      //console.log(`[BASE ENEMY THINKING] Timer: ${this.aiTimer}/${thinkingDuration}, vx: ${this.vx}`);

      if (this.aiTimer >= 0 || Math.abs(this.aiTimer) < 0.001) {
        console.log(`[BASE ENEMY THINKING] Thinking phase complete (aiTimer: ${this.aiTimer}), executing pending command`);
        console.log(`[DEBUG] updateIdleBehavior: checking pendingCommand, value =`, this.pendingCommand, 'exists =', !!this.pendingCommand);

        // Thinking phase complete - execute pending command if available
        if (this.pendingCommand) {
          this.executePendingCommand(behaviors);
        } else {
          // No pending command - consult BT for new behavior
          console.log(`[DEBUG] ELSE BLOCK: Consulting BT for idle_timeout`);
          const nextBehavior = this.consultBTForBehavior(players, { reason: 'idle_timeout' });
          console.log(`[BASE ENEMY THINKING] BT returned:`, nextBehavior);
          this.transitionToBehavior(nextBehavior, behaviors);
        }
        this.aiTimer = 0; // Reset timer after thinking
        return; // Exit - don't process normal idle behavior
      }
      return; // Still in thinking phase
    }

    // Normal idle behavior (only when NOT in thinking phase and no pending command)
    if (this.isThinking || this.pendingCommand) {
      return; // Don't interfere with thinking phase or pending commands
    }

    this.aiTimer += dt;
    this.vx = 0; // No movement

    const idleDuration = behaviors.idle?.duration || 2000;
    //console.log(`[BASE ENEMY IDLE] Timer: ${this.aiTimer}/${idleDuration}, vx: ${this.vx}`);

    if (this.aiTimer >= idleDuration) {
      console.log(`[BASE ENEMY IDLE] Timer expired, consulting BT for next behavior`);
      // Idle duration expired - consult BT for next behavior
      const nextBehavior = this.consultBTForBehavior(players, { reason: 'idle_timeout' });
      console.log(`[BASE ENEMY IDLE] BT returned:`, nextBehavior);
      this.transitionToBehavior(nextBehavior, behaviors);
      this.aiTimer = 0;
    }
  }

  // Vertical movement behavior: move exactly 50 units up/down, then return to idle
  updateVerticalMovementBehavior(players, dt, behaviors) {
    if (this.targetZ === undefined) {
      console.log(`[BASE ENEMY VERTICAL] ERROR: targetZ not set, exiting vertical movement`);
      this.transitionToBehavior({ type: 'idle', duration: 0.5 }, behaviors);
      return;
    }

    // Calculate distance moved so far
    const distanceMoved = Math.abs(this.z - this.verticalMovementStartZ);
    const targetDistance = 50; // Exactly 50 units

    console.log(`[BASE ENEMY VERTICAL] Moving: current=${this.z.toFixed(1)}, target=${this.targetZ.toFixed(1)}, moved=${distanceMoved.toFixed(1)}, targetDistance=${targetDistance}`);

    // Check if we've reached or exceeded the target distance
    if (distanceMoved >= targetDistance) {
      console.log(`[BASE ENEMY VERTICAL] Target distance reached (${distanceMoved.toFixed(1)} >= ${targetDistance}), stopping movement`);

      // Apply boundary enforcement to ensure we're within limits
      const boundaryResult = window.applyScreenBoundaries ? window.applyScreenBoundaries(this) : { wasLimited: false };
      if (boundaryResult.wasLimited) {
        console.log(`[BASE ENEMY VERTICAL] Boundary enforced after movement`);
      }

      // Stop movement and clear vertical movement state
      this.vz = 0;
      this.targetZ = undefined;
      delete this.verticalMovementStartZ;

      // Go to idle (thinking phase) for next decision
      this.transitionToBehavior({ type: 'idle', duration: 0.5 }, behaviors);
      return;
    }

    // Continue moving - apply velocity
    this.z += this.vz * dt;

    // Apply boundary enforcement during movement (safety check)
    const boundaryResult = window.applyScreenBoundaries ? window.applyScreenBoundaries(this) : { wasLimited: false };
    if (boundaryResult.wasLimited) {
      console.log(`[BASE ENEMY VERTICAL] Boundary hit during movement, stopping early`);
      // Stop movement if we hit a boundary
      this.vz = 0;
      this.targetZ = undefined;
      delete this.verticalMovementStartZ;
      this.transitionToBehavior({ type: 'idle', duration: 0.5 }, behaviors);
      return;
    }

    console.log(`[BASE ENEMY VERTICAL] Continuing movement: vz=${this.vz}, new_z=${this.z.toFixed(1)}`);
  }

  // Walking behavior: patrol movement with intelligent collision handling OR vertical movement
  updateWalkingBehavior(players, dt, behaviors) {
    // Check if we're in vertical movement mode (has targetZ set)
    if (this.targetZ !== undefined) {
      return this.updateVerticalMovementBehavior(players, dt, behaviors);
    }

    const patrolSpeed = behaviors.patrol?.speed || 50;
    const patrolRadius = behaviors.patrol?.radiusX || 200;

    // Initialize patrol if needed
    if (this.patrolDirection === undefined) {
      this.patrolDirection = 1; // Start right
      this.startX = this.x; // Patrol center
    }

    // Skip collision checks for first frame after state change (allows smooth transition)
    if (this.skipCollisionCheckThisFrame) {
      this.skipCollisionCheckThisFrame = false; // Reset flag
      console.log(`[BASE ENEMY PATROL] Skipping collision checks for first frame after transition`);

      // Continue with patrol movement without collision checks
      const proposedX = this.x + (this.patrolDirection * patrolSpeed * dt);
      this.x = proposedX;
      this.vx = this.patrolDirection * patrolSpeed;
      return;
    }

    // Check if boundary was hit during movement (set by handleEnemyMovement)
    if (this.boundaryInterrupted) {
      this.boundaryInterrupted = false; // Reset flag
      console.log(`%c[COMMAND INTERRUPTED] Patrol blocked by screen boundary - going to idle (thinking phase)`, 'color: #00ffff; font-weight: bold; font-size: 14px;');
      // Consult BT with context about screen boundary collision
      const nextBehavior = this.consultBTForBehavior(players, {
        reason: 'screen_boundary',
        blockedMovement: true
      });
      this.transitionToBehavior(nextBehavior, behaviors);
      return;
    }

    // Calculate proposed movement
    const proposedX = this.x + (this.patrolDirection * patrolSpeed * dt);

    //console.log(`[AI COLLISION DEBUG] === ${this.constructor.name} Patrol Check ===`);
    //console.log(`[AI COLLISION DEBUG] Position: x=${this.x.toFixed(1)}, direction=${this.patrolDirection}, speed=${patrolSpeed.toFixed(1)}, dt=${dt.toFixed(3)}`);
    //console.log(`[AI COLLISION DEBUG] Proposed movement: ${this.x.toFixed(1)} → ${proposedX.toFixed(1)} (delta: ${(proposedX - this.x).toFixed(1)})`);

    // Use unified collision system with buffer for AI (more tolerant than player movement)
    const aiBuffer = 8; // Allow 8px overlap for smoother AI movement
    //console.log(`[AI COLLISION DEBUG] Using AI buffer: ${aiBuffer}px`);

    const correctedX = window.applyCollisionCorrection ?
      window.applyCollisionCorrection(this, proposedX, this.y, this.z, 'x', { buffer: aiBuffer }) :
      proposedX;

    const correctionDelta = correctedX - proposedX;
    const hasSignificantCorrection = Math.abs(correctionDelta) > aiBuffer + 1;

    // console.log(`[AI COLLISION DEBUG] Collision correction result:`);
    // console.log(`[AI COLLISION DEBUG] - Proposed X: ${proposedX.toFixed(1)}`);
    // console.log(`[AI COLLISION DEBUG] - Corrected X: ${correctedX.toFixed(1)}`);
    // console.log(`[AI COLLISION DEBUG] - Correction delta: ${correctionDelta.toFixed(1)}px`);
    // console.log(`[AI COLLISION DEBUG] - Significant correction (> ${aiBuffer + 1}px): ${hasSignificantCorrection}`);

    // Check all entities for potential collisions
    if (window.gameState) {
      const allEntities = window.gameState.getAllEntities();
      const nearbyEntities = allEntities.filter(e =>
        e !== this &&
        Math.abs(e.x - this.x) < 200 && // Within 200px horizontally
        Math.abs(e.z - this.z) < 100    // Within 100 units vertically
      );

      //console.log(`[AI COLLISION DEBUG] Nearby entities (${nearbyEntities.length}):`);
      nearbyEntities.forEach((entity, index) => {
        const distance = Math.sqrt(Math.pow(entity.x - this.x, 2) + Math.pow(entity.z - this.z, 2));
        console.log(`[AI COLLISION DEBUG]   ${index + 1}. ${entity.entityType} at (${entity.x.toFixed(1)}, ${entity.z.toFixed(1)}) - distance: ${distance.toFixed(1)}px`);
      });

      // if (nearbyEntities.length === 0) {
      //   console.log(`[AI COLLISION DEBUG] ⚠️  NO nearby entities found - collision might be false positive!`);
      // }
    }

    // Check if movement was blocked by collision (with buffer consideration)
    if (hasSignificantCorrection) {
      console.log(`[BASE ENEMY PATROL] 🚫 Movement significantly blocked by collision (${correctionDelta.toFixed(1)}px correction), going to idle (thinking phase)`);
      // Go to idle state first (thinking phase) before consulting BT
      this.transitionToBehavior({ type: 'idle', duration: 0.5 }, behaviors);
      return;
    } else if (correctedX !== proposedX) {
      console.log(`[AI COLLISION DEBUG] ✅ Small correction applied (${correctionDelta.toFixed(1)}px), continuing patrol`);
    } else {
      console.log(`[AI COLLISION DEBUG] ✅ No collision detected, moving freely`);
    }

    // Check patrol radius boundaries - go to idle first (thinking phase)
    if (Math.abs(this.x - this.startX) >= patrolRadius) {
      console.log(`[BASE ENEMY PATROL] Reached patrol radius boundary, going to idle (thinking phase)`);
      // Go to idle state first (thinking phase) before consulting BT
      this.transitionToBehavior({ type: 'idle', duration: 0.5 }, behaviors);
      return;
    }

    // Check for player detection during patrol
    const closestPlayer = this.getClosestPlayer(players);
    if (closestPlayer && closestPlayer.distance <= (behaviors.chase?.radiusX || 300)) {
      console.log(`[BASE ENEMY PATROL] Player detected during patrol, consulting BT`);
      // Player detected - consult BT for chase decision
      const nextBehavior = this.consultBTForBehavior(players, { reason: 'player_detected', playerDistance: closestPlayer.distance });
      if (nextBehavior.type === 'chase') {
        this.transitionToBehavior(nextBehavior, behaviors);
        return;
      }
    }

    // Continue patrol movement - no issues detected
    this.x = correctedX; // Apply corrected movement
    this.vx = this.patrolDirection * patrolSpeed;
  }

  // Running behavior: chase player, check distance and attack range
  updateRunningBehavior(players, dt, behaviors) {
    const closestPlayer = this.getClosestPlayer(players);

    if (!closestPlayer) {
      // No players - consult BT for next behavior
      const nextBehavior = this.consultBTForBehavior(players);
      this.transitionToBehavior(nextBehavior, behaviors);
      return;
    }

    const chaseSpeed = behaviors.chase?.speed || 80;
    const attackRange = behaviors.attack ? 100 : 100; // Use attack range from BT config

    if (closestPlayer.distance <= attackRange) {
      // In attack range - stop chasing and attack
      this.vx = 0; // Stop moving!
      const nextBehavior = this.consultBTForBehavior(players);
      if (nextBehavior.type === 'attack') {
        this.transitionToBehavior(nextBehavior, behaviors);
        return;
      }
    }

    if (closestPlayer.distance > (behaviors.chase?.radiusX || 300) * 1.5) {
      // Player too far - consult BT for next behavior
      const nextBehavior = this.consultBTForBehavior(players);
      this.transitionToBehavior(nextBehavior, behaviors);
      return;
    }

    // Continue chasing
    const direction = this.x < closestPlayer.x ? 1 : -1;
    this.vx = direction * chaseSpeed;
  }

  // Attack behavior: check for animation completion and consult BT
  updateAttackBehavior(players, dt, behaviors) {
    // Check if attack animation has completed
    if (this.stateMachine && !this.stateMachine.isInAttackState()) {
      // Attack animation completed - consult BT for next action
      console.log(`[BASE ENEMY ATTACK] Attack animation completed, consulting BT for next action`);
      const nextBehavior = this.consultBTForBehavior(players, { reason: 'attack_complete' });
      this.transitionToBehavior(nextBehavior, behaviors);
      return;
    }

    // Attack animation still playing - continue with attack logic
    // Movement logic during attack is handled by FSM staying in attack state
  }

  // Consult BT for strategic behavior decision with context
  consultBTForBehavior(players, context = {}) {
    // SCRIPT SYSTEM: Handle script integration based on type (PHASE 4)
    if (this.activeScript) {
      // FULL script: Complete override - ignore base system entirely
      if (this.scriptConfig.type === window.enemyAIConfig.SCRIPT_TYPE.FULL) {
        const scriptCommand = this.getScriptCommand(context);
        if (scriptCommand) {
          console.log(`%c[SCRIPT_OVERRIDE] ${this.constructor.name} using FULL script: ${scriptCommand.type}`, 'color: #ff00ff; font-weight: bold; font-size: 14px;');
          return scriptCommand;
        }
        // Script didn't provide command - this shouldn't happen for FULL scripts
        console.warn(`[SCRIPT_SYSTEM] FULL script didn't provide command, falling back to base system`);
      }

      // PARTIAL/BONUS script: Always consult both script and base system, then merge
      if (this.scriptConfig.type === window.enemyAIConfig.SCRIPT_TYPE.PARTIAL ||
          this.scriptConfig.type === window.enemyAIConfig.SCRIPT_TYPE.BONUS) {

        const scriptCommand = this.getScriptCommand(context);
        const baseCommand = this.getBaseCommand(context);

        // Merge script and base commands
        const mergedCommand = window.mergeCommands(baseCommand, scriptCommand, this.scriptConfig.type);

        if (scriptCommand) {
          console.log(`%c[SCRIPT_MERGE] ${this.constructor.name} merging ${this.scriptConfig.type.toUpperCase()} script (${scriptCommand.type}) with base (${baseCommand?.type || 'none'})`, 'color: #00ff88; font-weight: bold; font-size: 14px;');
        }

        return mergedCommand;
      }
    }

    // No script or unsupported script type - use base BT system only
    return this.getBaseCommand(context);
  }

  // Get command from active script
  getScriptCommand(context) {
    if (!this.activeScript?.behaviorTree) {
      return null;
    }

    // Create script execution context
    const scriptContext = this.createScriptContext(context);

    // Execute script BT
    this.activeScript.behaviorTree.tick(scriptContext);

    return scriptContext.command;
  }

  // Get command from base BT system
  getBaseCommand(context) {
    // Get fresh behavior constraints based on current physical environment
    const constraints = window.getBehaviorConstraints ? window.getBehaviorConstraints(this) : null;
    if (constraints) {
      context.behaviorConstraints = constraints;
      console.log(`[BT_CONSTRAINTS] Fresh constraints for ${context.reason || 'general'}:`, {
        blocked: Array.from(constraints.blocked),
        allowed: Array.from(constraints.allowed),
        reasons: constraints.reasons
      });
    }

    // Green log - enemy asking BT for decision
    const situationText = this.getSituationText(context);
    console.log(`%c[BT_QUERY] ${this.constructor.name} #${this.level}: "${situationText}"`, 'color: #00ff00; font-weight: bold; font-size: 14px;');

    console.log('[BASE ENEMY BT] consultBTForBehavior called with context:', context, 'aiContext:', !!this.aiContext, 'behaviorTree:', !!this.aiContext?.behaviorTree, 'tickEnemyAI:', !!window.tickEnemyAI);

    if (!this.aiContext || !this.aiContext.behaviorTree) {
      console.log('[BASE ENEMY BT] BT not available, using fallback');
      // BT not available - fallback decisions
      return this.fallbackBehaviorDecision(players, context);
    }

    // Add context to aiContext for BT decision making
    this.aiContext.consultationContext = context;

    //console.log('[BASE ENEMY BT] Consulting BT for decision with context...');
    //console.log('[BASE ENEMY BT] Context targets:', this.aiContext.targets);
    //console.log('[BASE ENEMY BT] Consultation context:', context);

    // Update boss phase if needed
    if (this.aiContext.rarity === "boss" && this.aiContext.bossPhaseManager) {
      this.aiContext.bossPhaseManager.update(this.aiContext);
    }

    // Tick BT for decision
    const command = window.tickEnemyAI(this.aiContext.behaviorTree, this.aiContext);
    console.log('[BASE ENEMY BT] BT returned command:', command);

    // Red log - BT decision
    const decisionText = this.getDecisionText(command, context);
    console.log(`%c[BT_DECISION] ${this.constructor.name} #${this.level} from ${situationText} → ${decisionText}`, 'color: #ff0000; font-weight: bold; font-size: 14px;');

    // Clear context after consultation
    delete this.aiContext.consultationContext;

    return command;
  }

  // Create script execution context
  createScriptContext(baseContext) {
    return {
      ...baseContext,
      self: this.aiContext?.self || { hp: this.health, maxHp: this.maxHealth, x: this.x, y: this.y, z: this.z },
      targets: this.aiContext?.targets || [],
      behaviors: this.activeScript.behaviors,
      command: null
    };
  }

  // Transition to new behavior based on BT command (execute immediately - arcade style)
  transitionToBehavior(command, behaviors) {
    if (!command) return;

    console.log(`[DEBUG] transitionToBehavior: executing command immediately -`, command.type);
    this.pendingCommand = command;
    this.executePendingCommand(behaviors);
  }

  // Start thinking phase when no pending command exists
  startThinkingPhase(behaviors) {
    // REMOVED: Don't clear pending command - preserve it
    // this.pendingCommand = null;

    // Transition to IDLE thinking phase
    this.stateMachine.changeState('enemy_idle');
    this.vx = 0;
    this.isThinking = true;

    // Set thinking duration based on rarity/intelligence
    const thinkingDuration = this.getThinkingDuration(behaviors);
    this.aiTimer = -thinkingDuration; // Negative to count up to 0

    // Orange log - enemy is thinking
    console.log(`%c[BASE ENEMY THINKING] ${this.constructor.name} is in thinking state for ${thinkingDuration} seconds`, 'color: #ffa500; font-weight: bold; font-size: 14px;');
  }

  // Get thinking duration based on enemy type and situation
  // Now uses centralized configuration for consistency
  getThinkingDuration(behaviors) {
    // Use centralized thinking duration calculation
    if (window.enemyAIConfig && window.enemyAIConfig.calculateThinkingDuration) {
      const baseDuration = window.enemyAIConfig.CONSTANTS?.THINKING_DURATION_BASE || 3000;
      const context = this.aiContext?.consultationContext?.reason;

      // Map context reasons to config situation names
      const situationMap = {
        'attack_complete': 'attack_complete',
        'player_detected': 'player_detected',
        'screen_boundary': 'screen_boundary',
        'entity_collision': 'entity_collision',
        'patrol_end': 'patrol_end',
        'idle_timeout': 'idle_timeout'
      };

      const situation = situationMap[context] || 'idle_timeout';

      return window.enemyAIConfig.calculateThinkingDuration(baseDuration, this.intelligence, this.rarity, situation);
    }

    // Fallback to original implementation if config not available
    let baseDuration;

    if (this.intelligence === 'basic') {
      baseDuration = 3000; // 3 seconds
    } else if (this.intelligence === 'advanced') {
      baseDuration = 2000; // 2 seconds
    } else if (this.intelligence === 'expert') {
      baseDuration = 1500; // 1.5 seconds
    } else {
      baseDuration = 3000; // Default fallback
    }

    // Adjust based on rarity (rarer = slightly slower thinking)
    if (this.rarity === 'common') {
      baseDuration *= 1.0; // Normal
    } else if (this.rarity === 'elite') {
      baseDuration *= 1.1; // 10% slower
    } else if (this.rarity === 'boss') {
      baseDuration *= 1.2; // 20% slower
    }

    // Situation-based adjustments
    const context = this.aiContext?.consultationContext?.reason;

    switch(context) {
      case 'attack_complete':
        // Quick decision after attack
        baseDuration *= 0.8;
        break;

      case 'player_detected':
        // Urgent response to player detection
        baseDuration *= 0.6;
        break;

      case 'screen_boundary':
      case 'entity_collision':
        // Simple navigation decisions
        baseDuration *= 0.9;
        break;

      case 'patrol_end':
        // Routine patrol decisions
        baseDuration *= 1.0;
        break;

      default:
        // Standard thinking time
        baseDuration *= 1.0;
        break;
    }

    // Guarantee minimum thinking time for fair gameplay
    return Math.max(1000, baseDuration) / 1000; // Minimum 1 second, convert to seconds
  }

  // Execute pending command (called from updateIdleBehavior when thinking is done)
  executePendingCommand(behaviors) {
    console.log(`[DEBUG] executePendingCommand: START - pendingCommand=`, this.pendingCommand);
    if (!this.pendingCommand) {
      console.log(`[DEBUG] executePendingCommand: no pendingCommand, returning false`);
      return false;
    }

    const command = this.pendingCommand;
    console.log(`[DEBUG] executePendingCommand: clearing pendingCommand (was: ${JSON.stringify(this.pendingCommand)})`);
    this.pendingCommand = null;
    console.log(`[DEBUG] executePendingCommand: pendingCommand cleared, setting isThinking=false`);
    this.isThinking = false;

    console.log(`[BASE ENEMY THINKING] Executing pending command:`, command);
    console.log(`[DEBUG] executePendingCommand: command=${command.type}, stateMachine exists=${!!this.stateMachine}`);

    switch(command.type) {
      case 'idle':
        if (this.stateMachine) {
          const result = this.stateMachine.changeState('enemy_idle');
          console.log(`[DEBUG] executePendingCommand: idle changeState result =`, result);
        }
        this.vx = 0;
        this.vz = 0; // Stop vertical movement too
        // Set idle timer for custom duration if specified
        if (command.duration) {
          this.aiTimer = -command.duration; // Negative to count up to 0
          this.isThinking = false; // Important: NOT thinking for idle command
        }
        break;

      case 'patrol':
      case 'patrol_left':
      case 'patrol_right':
        console.log(`[DEBUG] executePendingCommand: executing patrol command`);
        if (this.stateMachine) {
          const result = this.stateMachine.changeState('enemy_walking');
          console.log(`[DEBUG] executePendingCommand: patrol changeState result =`, result);
          console.log(`[DEBUG] executePendingCommand: current state after patrol change =`, this.stateMachine.getCurrentStateName());
        } else {
          console.log(`[DEBUG] executePendingCommand: ERROR - no stateMachine for patrol!`);
        }
        // Set patrol direction based on command type
        if (command.type === 'patrol_left') {
          this.patrolDirection = -1; // Go left
        } else if (command.type === 'patrol_right') {
          this.patrolDirection = 1;  // Go right
        } else {
          // Default 'patrol' command - use constraint-based logic
          this.patrolDirection = 1; // Default to right
        }
        this.startX = this.x; // Reset patrol center
        this.skipCollisionCheckThisFrame = true; // Skip collision checks for first frame
        console.log(`[BASE ENEMY TRANSITION] Starting patrol with direction: ${this.patrolDirection} (command: ${command.type})`);
        break;

      case 'reverse_patrol':
        // Stay in walking state but reverse direction
        this.stateMachine.changeState('enemy_walking');
        this.patrolDirection *= -1; // Reverse current direction
        console.log(`[BASE ENEMY TRANSITION] Reversing patrol direction to: ${this.patrolDirection}`);
        break;

      case 'move_up':
        console.log(`[DEBUG] executePendingCommand: executing move_up command`);
        if (this.stateMachine) {
          const result = this.stateMachine.changeState('enemy_walking');
          console.log(`[DEBUG] executePendingCommand: move_up changeState result =`, result);
        }
        // Move up by exactly 50 units using Z_SPEED velocity
        this.targetZ = this.z + 50; // Target position
        this.vz = Z_SPEED; // Movement velocity (positive Z = up)
        this.verticalMovementStartZ = this.z; // Track starting position
        console.log(`[BASE ENEMY VERTICAL] Starting move_up: from ${this.z} to ${this.targetZ}`);
        break;

      case 'move_down':
        console.log(`[DEBUG] executePendingCommand: executing move_down command`);
        if (this.stateMachine) {
          const result = this.stateMachine.changeState('enemy_walking');
          console.log(`[DEBUG] executePendingCommand: move_down changeState result =`, result);
        }
        // Move down by exactly 50 units using Z_SPEED velocity
        this.targetZ = this.z - 50; // Target position
        this.vz = -Z_SPEED; // Movement velocity (negative Z = down)
        this.verticalMovementStartZ = this.z; // Track starting position
        console.log(`[BASE ENEMY VERTICAL] Starting move_down: from ${this.z} to ${this.targetZ}`);
        break;

      case 'chase':
        this.stateMachine.changeState('enemy_running');
        // vx will be set in updateRunningBehavior
        break;

      case 'attack':
        // Map attack type to enemy FSM action
        const attackNumber = command.attackType === 'light' ? '1' :
                            command.attackType === 'medium' ? '2' :
                            command.attackType === 'heavy' ? '3' : '1';
        this.stateMachine.handleAction(`attack_${attackNumber}`);
        this.vx = 0; // Stop moving during attack
        this.vz = 0; // Stop vertical movement during attack
        break;

      default:
        this.stateMachine.changeState('enemy_idle');
        this.vx = 0;
        this.vz = 0;
        break;
    }

    return true;
  }

  // Fallback behavior decision when BT is not available
  fallbackBehaviorDecision(players, context = {}) {
    console.log('[BASE ENEMY FALLBACK] Making decision with context:', context);

    const closestPlayer = this.getClosestPlayer(players);

    // Context-aware fallback decisions
    switch(context.reason) {
      case 'screen_boundary':
        // Hit screen boundary - reverse direction
        return { type: 'reverse_patrol' };

      case 'entity_collision':
        // Hit entity - idle briefly then reverse
        return { type: 'idle', duration: 1.0 };

      case 'patrol_end':
        // Reached patrol end - reverse direction
        return { type: 'reverse_patrol' };

      case 'player_detected':
        // Player detected - chase if close enough
        if (closestPlayer && closestPlayer.distance <= 300) {
          return { type: 'chase' };
        }
        break;

      default:
        // Standard fallback logic
        if (closestPlayer && closestPlayer.distance <= 100) {
          return { type: 'attack', attackType: 'light' };
        } else if (closestPlayer && closestPlayer.distance <= 300) {
          return { type: 'chase' };
        } else {
          return { type: 'patrol' };
        }
    }

    // Default fallback
    return { type: 'patrol' };
  }

  // Helper: Get situation text for BT queries
  getSituationText(context = {}) {
    switch(context.reason) {
      case 'idle_timeout':
        return 'Свърших с idle, какво да правя?';
      case 'patrol_end':
        return 'Свърших с патрула, какво сега?';
      case 'screen_boundary':
        return 'Патрулът е прекъснат от граница, какво сега?';
      case 'entity_collision':
        return 'Блъснах се в обект, какво да правя?';
      case 'player_detected':
        return 'Засечен е играч, какво да правя?';
      case 'attack_range':
        return 'Играчът е в обсег за атака, какво сега?';
      case 'player_too_far':
        return 'Играчът е твърде далеч, какво сега?';
      case 'attack_complete':
        return 'Направих атаката, какво сега?';
      default:
        return 'Нуждая се от инструкции, какво да правя?';
    }
  }

  // Helper: Get decision text for BT responses
  getDecisionText(command, context) {
    if (!command) return 'няма решение';

    switch(command.type) {
      case 'idle':
        const duration = command.duration ? ` за ${command.duration} сек` : '';
        return `idle${duration}`;
      case 'patrol':
        return 'start_patrol';
      case 'reverse_patrol':
        return 'reverse_patrol';
      case 'chase':
        return 'chase_player';
      case 'attack':
        const attackType = command.attackType || 'light';
        return `attack_${attackType}`;
      default:
        return command.type || 'unknown';
    }
  }

  // Helper: Get closest player
  getClosestPlayer(players) {
    if (!players || players.length === 0) return null;

    return players.reduce((closest, player) => {
      // Use X-Z distance for 2.5D detection
      const distance = Math.sqrt(
        Math.pow(this.x - player.x, 2) +
        Math.pow(this.z - player.z, 2)
      );
      if (!closest || distance < closest.distance) {
        return { ...player, distance };
      }
      return closest;
    }, null);
  }

  // Update BT context with current game state
  updateBTContext(players) {
    if (!this.aiContext) return;

    // Update self state
    this.aiContext.self.hp = this.health;
    this.aiContext.self.maxHp = this.maxHealth;
    this.aiContext.self.x = this.x;
    this.aiContext.self.y = this.y;

    // Update targets (players) - Use X-Z distance for 2.5D detection
    this.aiContext.targets = players.map(player => ({
      distance: Math.sqrt(  // ✅ X-Z distance for 2.5D
        Math.pow(this.x - player.x, 2) +
        Math.pow(this.z - player.z, 2)
      ),
      hpPercent: (player.health / player.maxHealth) * 100,
      damageDone: 0 // Could track damage dealt to each player
    }));
  }

  // Take damage from player attacks
  takeDamage(damage) {
    if (this.isDying) return 0;

    this.health -= damage;
    this.hit = true;

    console.log(`[BASE ENEMY] Took ${damage} damage, health: ${this.health}/${this.maxHealth}`);

    if (this.health <= 0) {
      this.die();
      return damage; // Return full damage dealt
    }

    // Play hurt animation
    if (this.stateMachine) {
      this.stateMachine.forceState('hurt');
    }

    return damage;
  }

  // Death sequence (can be overridden by subclasses)
  die() {
    this.isDying = true;
    this.health = 0;

    console.log(`[BASE ENEMY] ${this.constructor.name} defeated!`);

    // Play death animation
    if (this.stateMachine) {
      this.stateMachine.forceState('dead');
    }

    // Remove from combat system after death animation
    setTimeout(() => {
      if (window.enemyCombatManager) {
        window.enemyCombatManager.unregisterEnemy(this);
      }
    }, 2000); // 2 second delay
  }

  // Update death animation (blink effect)
  updateDeath(dt) {
    if (!this.isDying) return;

    this.deathTimer += dt;
    this.blinkCount++;

    // Blink every 100ms
    this.visible = Math.floor(this.deathTimer * 10) % 2 === 0;

    // Remove after 2 seconds
    if (this.deathTimer > 2.0) {
      this.visible = false;
      // Entity will be removed by game cleanup
    }
  }

  // Get experience reward (should be overridden by subclasses)
  getExperienceReward() {
    return 100 + (this.level - 1) * 25;
  }

  // Get gold reward (should be overridden by subclasses)
  getGoldReward() {
    return 10 + (this.level - 1) * 2;
  }
}

// ===========================================
// ENEMY CREATION FUNCTIONS
// ===========================================

// Create enemy instance with stats
function createEnemyWithData(enemyType = 'basic', level = 1) {
  const enemyData = new EnemyData(enemyType, level);
  const stats = enemyData.getScaledStats();

  // Create the enemy entity (using existing createEntity function)
  // Use default Y position if CANVAS_HEIGHT is not available
  // Move entities higher up - responsive to canvas size
  const enemyY = (typeof CANVAS_HEIGHT !== 'undefined') ? Math.max(200, CANVAS_HEIGHT - 600) : 300;

  // Scale X position for new canvas size
  const scaleFactor = (typeof CANVAS_WIDTH !== 'undefined') ? CANVAS_WIDTH / 900 : 1;
  const enemyX = 450 * scaleFactor;

  const enemy = window.createEntity(enemyX, enemyY, 0, 60, 60, "#FF3020");

  // Add Z thickness for 2.5D collision
  enemy.zThickness = 5;// 25;  // Enemy thickness (slightly less than player)

  // Apply stats from enemy data
  enemy.maxHealth = stats.maxHealth;
  enemy.health = stats.maxHealth;
  enemy.currentAction = null;
  enemy.executionTimer = 0;
  enemy.hit = false;

  // Entity type for combat system
  enemy.entityType = 'enemy';

  // Add character info for combat system
  enemy.characterInfo = new window.CharacterInfo('enemy');
  enemy.characterInfo.baseAttack = stats.baseAttack;
  enemy.characterInfo.baseDefense = stats.baseDefense;
  enemy.characterInfo.strength = stats.strength;
  enemy.characterInfo.criticalChance = stats.criticalChance;

  // Death state properties
  enemy.isDying = false;
  enemy.deathTimer = 0;
  enemy.blinkCount = 0;
  enemy.visible = true; // For blink animation

  // Store enemy data for reference
  enemy.enemyData = enemyData;

  // Add animation placeholder - will be registered by animation system
  enemy.animation = null;

  // FSM will be added after animation registration in main.js
  enemy.stateMachine = null;

  // Register enemy with combat system
  if (window.enemyCombatManager) {
    window.enemyCombatManager.registerEnemy(enemy);
  }

  //console.log(`[ENEMY] Created ${enemyData.getDisplayName()} (Level ${level}) with ${stats.maxHealth} HP`);

  return enemy;
}

// ===========================================
// BLUE SLIME ENEMY CLASS - moved from entities.js
// ===========================================

// Blue Slime Enemy Class - inherits universal AI from BaseEnemy
class BlueSlime extends BaseEnemy {
  constructor(x, y, z, level = 1) {
    // Blue Slime specific configuration
    const config = {
      // Dimensions (scaled for sprite)
      w: 240,  // Visual width (2x scaled sprite: 120*2)
      h: 256,  // Visual height (2x scaled sprite: 128*2)
      collisionW: 120,  // Collision width (same as sprite frame)
      collisionH: 128,  // Collision height (same as sprite frame)
      zThickness: 3,   // Z thickness for 2.5D collision

      // Stats (Blue Slime specific)
      maxHealth: 80 + (level - 1) * 20, // 80 base + 20 per level
      baseAttack: 8 + (level - 1) * 2,   // 8 base + 2 per level
      baseDefense: 2,
      speed: 40, // Slower than player

      // Character info
      strength: 5 + level,
      criticalChance: 0.03, // 3% crit chance

      // AI configuration
      rarity: 'common',        // BT rarity level
      intelligence: 'basic',   // BT intelligence level

      // Animation
      animationEntityType: 'blue_slime',

      // Level for rewards
      level: level,

      // TEST SCRIPT: Vertical ping-pong movement
      scriptConfig: {
        scriptId: 'blue_slime_vertical_test',
        type: window.enemyAIConfig?.SCRIPT_TYPE?.FULL || 'full'
      }
    };

    // Call BaseEnemy constructor with position and config
    super(x, y, z, config);

    // Blue Slime specific properties
    this.level = level;

    console.log(`[BLUE SLIME] Created Blue Slime (Level ${level}) at (${x}, ${y}) with ${this.maxHealth} HP`);
  }

  // Override attack profile for Blue Slime (only light attacks)
  createAttackProfile() {
    return window.createAttackProfile ? window.createAttackProfile(["light"]) : null;
  }

  // Take damage from player attacks
  takeDamage(damage) {
    if (this.isDying) return 0;

    this.health -= damage;
    this.hit = true;

    console.log(`[BLUE SLIME] Took ${damage} damage, health: ${this.health}/${this.maxHealth}`);

    if (this.health <= 0) {
      this.die();
      return damage; // Return full damage dealt
    }

    // Play hurt animation
    if (this.stateMachine) {
      this.stateMachine.forceState('hurt');
    }

    return damage;
  }

  // Death sequence
  die() {
    this.isDying = true;
    this.health = 0;

    console.log(`[BLUE SLIME] Blue Slime defeated!`);

    // Play death animation
    if (this.stateMachine) {
      this.stateMachine.forceState('dead');
    }

    // Remove from combat system after death animation
    setTimeout(() => {
      if (window.enemyCombatManager) {
        window.enemyCombatManager.unregisterEnemy(this);
      }
    }, 2000); // 2 second delay
  }

  // Update death animation (blink effect)
  updateDeath(dt) {
    if (!this.isDying) return;

    this.deathTimer += dt;
    this.blinkCount++;

    // Blink every 100ms
    this.visible = Math.floor(this.deathTimer * 10) % 2 === 0;

    // Remove after 2 seconds
    if (this.deathTimer > 2.0) {
      this.visible = false;
      // Entity will be removed by game cleanup
    }
  }

  // Get experience reward for defeating this enemy
  getExperienceReward() {
    return 150 + (this.level - 1) * 50; // 150 base + 50 per level
  }

  // Get gold reward
  getGoldReward() {
    return 15 + (this.level - 1) * 5; // 15 base + 5 per level
  }
}

// Factory function to create Blue Slime
function createBlueSlime(x, y, z, level = 1) {
  return new BlueSlime(x, y, z, level);
}

// ===========================================
// GLOBAL EXPORTS
// ===========================================

window.BaseEnemy = BaseEnemy;
window.createEnemyWithData = createEnemyWithData;
window.BlueSlime = BlueSlime;
window.createBlueSlime = createBlueSlime;
