/**
 * Enemy AI Module
 * Handles all enemy AI behavior coordination, FSM control, and BT integration
 * Extracted from BaseEnemy class to improve separation of concerns
 */

// ===========================================
// AI BEHAVIOR COORDINATION
// ===========================================

/**
 * FSM-based behavior control - consults BT for strategic decisions
 * @param {BaseEnemy} enemy - The enemy instance
 * @param {Array} players - Array of player entities
 * @param {number} dt - Delta time
 */
function updateFSMBehavior(enemy, players, dt) {
    if (!enemy.stateMachine) {
        console.log('[BASE ENEMY FSM] No stateMachine available');
        return;
    }

    // Check if this is the first update cycle and we need to start thinking
    if (!enemy.hasStarted && enemy.isThinking) {
        enemy.hasStarted = true;
        const behaviors = enemy.aiContext?.behaviors || {};
        enemy.startThinkingPhase(behaviors);
        return; // Don't process normal behavior this frame
    }

    const currentState = enemy.stateMachine.getCurrentStateName();
    const behaviors = enemy.aiContext?.behaviors || {};

    //console.log(`[BASE ENEMY FSM] Current state: ${currentState}, aiTimer: ${enemy.aiTimer}, vx: ${enemy.vx}`);

    // State-specific behavior logic
    switch (currentState) {
        case 'enemy_idle':
            enemy.updateIdleBehavior(players, dt, behaviors);
            break;

        case 'enemy_walking':
            window.EnemyMovement.updateWalkingBehavior(enemy, players, dt, behaviors);
            break;

        case 'enemy_running':
            window.EnemyMovement.updateRunningBehavior(enemy, players, dt, behaviors);
            break;

        case 'enemy_attack':
        case 'enemy_attack_light':
        case 'enemy_attack_medium':
        case 'enemy_attack_heavy':
            window.EnemyCombat.updateAttackBehavior(enemy, players, dt, behaviors);
            break;

        case 'enemy_dead':
            window.EnemyDeath.updateDeath(enemy, dt);
            break;

        default:
            // Unknown state, go to idle
            //console.log(`[BASE ENEMY FSM] Unknown state ${currentState}, going to enemy_idle`);
            enemy.stateMachine.changeState('enemy_idle');
            break;
    }
}

// ===========================================
// BEHAVIOR TREE INTEGRATION
// ===========================================

/**
 * Consult BT for strategic behavior decision with context
 * @param {BaseEnemy} enemy - The enemy instance
 * @param {Array} players - Array of player entities
 * @param {Object} context - Context information for BT decision
 * @returns {Object} BT command/result
 */
function consultBTForBehavior(enemy, players, context = {}) {
    // Script system debug logging commented out for cleaner console
    // console.log(`%c[BT_DEBUG] consultBTForBehavior called for ${enemy.constructor.name}`, 'color: #ffa500; font-weight: bold;');
    // console.log('[BT_DEBUG] Has activeScript:', !!enemy.activeScript);
    // console.log('[BT_DEBUG] scriptConfig:', enemy.scriptConfig);
    // console.log('[BT_DEBUG] Context reason:', context.reason);

    // if (enemy.activeScript) {
    //   console.log('[BT_DEBUG] Script type:', enemy.scriptConfig?.type);
    //   console.log('[BT_DEBUG] Script details:', enemy.activeScript);

    //   if (enemy.scriptConfig?.type === window.enemyAIConfig?.SCRIPT_TYPE?.FULL) {
    //     console.log('%c[BT_DEBUG] FULL SCRIPT OVERRIDE - should use script BT', 'color: #ff00ff; font-weight: bold;');
    //   }
    // } else {
    //   console.log('%c[BT_DEBUG] NO ACTIVE SCRIPT - using base BT system', 'color: #ff0000; font-weight: bold;');
    // }

    // SCRIPT SYSTEM: Handle script integration based on type (PHASE 4)
    if (enemy.activeScript) {
        // FULL script: Complete override - ignore base system entirely
        if (enemy.scriptConfig.type === window.enemyAIConfig.SCRIPT_TYPE.FULL) {
            const scriptCommand = getScriptCommand(enemy, context);
            if (scriptCommand) {
                //console.log(`%c[SCRIPT_OVERRIDE] ${enemy.constructor.name} using FULL script: ${scriptCommand.type}`, 'color: #ff00ff; font-weight: bold; font-size: 14px;');
                return scriptCommand;
            }
            // Script didn't provide command - this shouldn't happen for FULL scripts
            //console.warn(`[SCRIPT_SYSTEM] FULL script didn't provide command, falling back to base system`);
        }

        // PARTIAL/BONUS script: Always consult both script and base system, then merge
        if (enemy.scriptConfig.type === window.enemyAIConfig.SCRIPT_TYPE.PARTIAL ||
            enemy.scriptConfig.type === window.enemyAIConfig.SCRIPT_TYPE.BONUS) {

            const scriptCommand = getScriptCommand(enemy, context);
            const baseCommand = getBaseCommand(enemy, players, context);

            // Merge script and base commands
            const mergedCommand = window.mergeCommands(baseCommand, scriptCommand, enemy.scriptConfig.type);

            // if (scriptCommand) {
            //   console.log(`%c[SCRIPT_MERGE] ${enemy.constructor.name} merging ${enemy.scriptConfig.type.toUpperCase()} script (${scriptCommand.type}) with base (${baseCommand?.type || 'none'})`, 'color: #00ff88; font-weight: bold; font-size: 14px;');
            // }

            return mergedCommand;
        }
    }

    // No script or unsupported script type - use base BT system only
    return getBaseCommand(enemy, players, context);
}

/**
 * Get command from active script
 * @param {BaseEnemy} enemy - The enemy instance
 * @param {Object} context - Context information
 * @returns {Object|null} Script command or null
 */
function getScriptCommand(enemy, context) {
    if (!enemy.activeScript?.behaviorTree) {
        return null;
    }

    // Create script execution context
    const scriptContext = createScriptContext(enemy, context);

    // Execute script BT
    enemy.activeScript.behaviorTree.tick(scriptContext);

    return scriptContext.command;
}

/**
 * Get command from base BT system
 * @param {BaseEnemy} enemy - The enemy instance
 * @param {Array} players - Array of player entities
 * @param {Object} context - Context information
 * @returns {Object} BT command
 */
function getBaseCommand(enemy, players, context) {
    // Get fresh behavior constraints based on current physical environment
    // Include dynamic blocked behaviors for interruption-aware decisions
    const constraints = window.getBehaviorConstraints ? window.getBehaviorConstraints(enemy, enemy.dynamicBlocked) : null;
    if (constraints) {
        context.behaviorConstraints = constraints;
        console.log(`[BT_CONSTRAINTS] ${enemy.constructor.name} #${enemy.instanceId} constraints: blocked=[${Array.from(constraints.blocked).join(', ')}], dynamic=[${Array.from(constraints.dynamicBlocked || []).join(', ')}]`);
    }

    // Green log - enemy asking BT for decision
    const situationText = getSituationText(context);
    console.log(`%c[BT_QUERY] ${enemy.constructor.name} #${enemy.instanceId}: "${situationText}"`, 'color: #00ff00; font-weight: bold; font-size: 14px;');

    // console.log('[BASE ENEMY BT] consultBTForBehavior called with context:', context, 'aiContext:', !!enemy.aiContext, 'behaviorTree:', !!enemy.aiContext?.behaviorTree, 'tickEnemyAI:', !!window.tickEnemyAI);

    if (!enemy.aiContext || !enemy.aiContext.behaviorTree) {
        //console.log('[BASE ENEMY BT] BT not available, using fallback');
        // BT not available - fallback decisions
        return fallbackBehaviorDecision(enemy, players, context);
    }

    // Add context to aiContext for BT decision making
    enemy.aiContext.consultationContext = context;

    //console.log('[BASE ENEMY BT] Consulting BT for decision with context...');
    //console.log('[BASE ENEMY BT] Context targets:', enemy.aiContext.targets);
    //console.log('[BASE ENEMY BT] Consultation context:', context);

    // Update boss phase if needed
    if (enemy.aiContext.rarity === "boss" && enemy.aiContext.bossPhaseManager) {
        enemy.aiContext.bossPhaseManager.update(enemy.aiContext);
    }

    // Tick BT for decision
    const command = window.tickEnemyAI(enemy.aiContext.behaviorTree, enemy.aiContext);
    // console.log('[BASE ENEMY BT] BT returned command:', command);

    // Red log - BT decision
    const decisionText = getDecisionText(command, context);
    console.log(`%c[BT_DECISION] ${enemy.constructor.name} #${enemy.instanceId} from "${situationText}" → ${decisionText}`, 'color: #ff0000; font-weight: bold; font-size: 14px;');

    // Clear context after consultation
    delete enemy.aiContext.consultationContext;

    return command;
}

/**
 * Create script execution context
 * @param {BaseEnemy} enemy - The enemy instance
 * @param {Object} context - Base context
 * @returns {Object} Script context
 */
function createScriptContext(enemy, baseContext) {
    return {
        ...baseContext,
        self: enemy.aiContext?.self || { hp: enemy.health, maxHp: enemy.maxHp, x: enemy.x, y: enemy.y, z: enemy.z },
        targets: enemy.aiContext?.targets || [],
        behaviors: enemy.activeScript.behaviors,
        command: null
    };
}

// ===========================================
// BEHAVIOR TRANSITION METHODS
// ===========================================

/**
 * Transition to new behavior based on BT command (execute immediately - arcade style)
 * @param {BaseEnemy} enemy - The enemy instance
 * @param {Object} command - BT command
 * @param {Object} behaviors - Behavior configuration
 */
function transitionToBehavior(enemy, command, behaviors) {
    if (!command) return;

    // console.log(`[DEBUG] transitionToBehavior: executing command immediately -`, command.type);
    enemy.pendingCommand = command;
    executePendingCommand(enemy, behaviors);
}

/**
 * Start thinking phase when no pending command exists
 * @param {BaseEnemy} enemy - The enemy instance
 * @param {Object} behaviors - Behavior configuration
 */
function startThinkingPhase(enemy, behaviors) {
    // REMOVED: Don't clear pending command - preserve it
    // enemy.pendingCommand = null;

    // Transition to IDLE thinking phase
    enemy.stateMachine.changeState('enemy_idle');
    enemy.vx = 0;
    enemy.isThinking = true;

    // Set thinking duration based on rarity/intelligence
    const thinkingDuration = getThinkingDuration(enemy, behaviors);
    enemy.aiTimer = -thinkingDuration; // Negative to count up to 0

    // Orange log - enemy is thinking
    // console.log(`%c[BASE ENEMY THINKING] ${enemy.constructor.name} is in thinking state for ${thinkingDuration} seconds`, 'color: #ffa500; font-weight: bold; font-size: 14px;');
}

/**
 * Execute pending command (called from updateIdleBehavior when thinking is done)
 * @param {BaseEnemy} enemy - The enemy instance
 * @param {Object} behaviors - Behavior configuration
 * @returns {boolean} Success status
 */
function executePendingCommand(enemy, behaviors) {
    // console.log(`[DEBUG] executePendingCommand: START - pendingCommand=`, enemy.pendingCommand);
    if (!enemy.pendingCommand) {
        // console.log(`[DEBUG] executePendingCommand: no pendingCommand, returning false`);
        return false;
    }

    const command = enemy.pendingCommand;
    // console.log(`[DEBUG] executePendingCommand: clearing pendingCommand (was: ${JSON.stringify(enemy.pendingCommand)})`);
    enemy.pendingCommand = null;
    // console.log(`[DEBUG] executePendingCommand: pendingCommand cleared, setting isThinking=false`);
    enemy.isThinking = false;

    // console.log(`[BASE ENEMY THINKING] Executing pending command:`, command);
    // console.log(`[DEBUG] executePendingCommand: command=${command.type}, stateMachine exists=${!!enemy.stateMachine}`);

    switch (command.type) {
        case 'idle':
            console.log(`%c[COMMAND START] Idle ${command.duration ? `for ${command.duration}s` : '(thinking phase)'}`, 'color: #0088ff; font-weight: bold; font-size: 14px;');

            // IMPORTANT: Set timer BEFORE changing state, as state.enter/update might check it immediately
            enemy.isThinking = true;
            if (command.duration) {
                enemy.aiTimer = -command.duration; // Negative to count up to 0
                enemy.isThinking = false; // Important: NOT thinking for idle command, just waiting

                // Set interruption flag based on command property (default to true if undefined)
                enemy.thinkingPhaseInterrupted = command.canInterrupt !== undefined ? command.canInterrupt : true;
            } else {
                // If no duration, it's a thinking phase? No, idle command usuall has duration.
                // If no duration, maybe treat as 0?
                enemy.aiTimer = 0;
                enemy.thinkingPhaseInterrupted = true;
            }

            if (enemy.stateMachine) {
                enemy.stateMachine.changeState('enemy_idle');
            }
            enemy.vx = 0;
            enemy.vz = 0; // Stop vertical movement too
            break;

        case 'patrol':
        case 'patrol_left':
        case 'patrol_right':
            //console.log(`%c[COMMAND START] Patrol ${command.type.replace('patrol_', '') || 'auto'} (direction: ${command.type === 'patrol_left' ? -1 : command.type === 'patrol_right' ? 1 : 'auto'})`, 'color: #0088ff; font-weight: bold; font-size: 14px;');
            // console.log(`[DEBUG] executePendingCommand: executing patrol command`);
            if (enemy.stateMachine) {
                // const result = enemy.stateMachine.changeState('enemy_walking');
                // console.log(`[DEBUG] executePendingCommand: patrol changeState result =`, result);
                // console.log(`[DEBUG] executePendingCommand: current state after patrol change =`, enemy.stateMachine.getCurrentStateName());
                enemy.stateMachine.changeState('enemy_walking');
            } else {
                console.log(`[DEBUG] executePendingCommand: ERROR - no stateMachine for patrol!`);
            }
            // Set patrol direction based on command type
            if (command.type === 'patrol_left') {
                enemy.patrolDirection = -1; // Go left
            } else if (command.type === 'patrol_right') {
                enemy.patrolDirection = 1;  // Go right
            } else {
                // Default 'patrol' command - use constraint-based logic
                enemy.patrolDirection = 1; // Default to right
            }
            enemy.startX = enemy.x; // Reset patrol center
            enemy.skipCollisionCheckThisFrame = true; // Skip collision checks for first frame
            // console.log(`[BASE ENEMY TRANSITION] Starting patrol with direction: ${enemy.patrolDirection} (command: ${command.type})`);
            break;

        case 'reverse_patrol':
            // Stay in walking state but reverse direction
            enemy.stateMachine.changeState('enemy_walking');
            enemy.patrolDirection *= -1; // Reverse current direction
            //console.log(`[BASE ENEMY TRANSITION] Reversing patrol direction to: ${enemy.patrolDirection}`);
            break;

        case 'move_up':
            //console.log(`[DEBUG] executePendingCommand: executing move_up command`);
            if (enemy.stateMachine) {
                const result = enemy.stateMachine.changeState('enemy_walking');
                //console.log(`[DEBUG] executePendingCommand: move_up changeState result =`, result);
            }
            // Move up by command displacement using command speed
            enemy.targetZ = enemy.z + command.displacement; // Use dynamic displacement
            enemy.vz = command.speed; // Movement velocity (positive Z = up)
            enemy.verticalMovementStartZ = enemy.z; // Track starting position
            //console.log(`[BASE ENEMY VERTICAL] Starting move_up: from ${enemy.z} to ${enemy.targetZ}`);
            break;

        case 'move_down':
            //console.log(`[DEBUG] executePendingCommand: executing move_down command`);
            // Move down by command displacement using command speed
            enemy.targetZ = enemy.z - command.displacement; // Use dynamic displacement
            enemy.vz = -command.speed; // Movement velocity (negative Z = down)
            enemy.verticalMovementStartZ = enemy.z; // Track starting position
            //console.log(`[VZ_DEBUG] executePendingCommand set vz=${enemy.vz}, command.speed=${command.speed}`);
            //console.log(`[BASE ENEMY VERTICAL] Starting move_down: from ${enemy.z} to ${enemy.targetZ}`);

            // Change state AFTER setting targetZ (so EnemyWalkingState.enter() sees it)
            if (enemy.stateMachine) {
                const result = enemy.stateMachine.changeState('enemy_walking');
                //console.log(`[DEBUG] executePendingCommand: move_down changeState result =`, result);
            }
            break;

        case 'chase':
            //console.log(`%c[COMMAND START] Chase player`, 'color: #0088ff; font-weight: bold; font-size: 14px;');
            enemy.stateMachine.changeState('enemy_running');
            // vx will be set in updateRunningBehavior
            break;

        case 'attack':
            //console.log(`%c[COMMAND START] Attack ${command.attackType || 'light'}`, 'color: #0088ff; font-weight: bold; font-size: 14px;');
            // Map attack type to enemy FSM action
            const attackNumber = command.attackType === 'light' ? '1' :
                command.attackType === 'medium' ? '2' :
                    command.attackType === 'heavy' ? '3' : '1';
            enemy.stateMachine.handleAction(`attack_${attackNumber}`);
            enemy.vx = 0; // Stop moving during attack
            enemy.vz = 0; // Stop vertical movement during attack
            break;

        default:
            enemy.stateMachine.changeState('enemy_idle');
            enemy.vx = 0;
            enemy.vz = 0;
            break;
    }

    return true;
}

// ===========================================
// UTILITY METHODS
// ===========================================

/**
 * Get thinking duration based on enemy type and situation
 * @param {BaseEnemy} enemy - The enemy instance
 * @param {Object} behaviors - Behavior configuration
 * @returns {number} Thinking duration in seconds
 */
function getThinkingDuration(enemy, behaviors) {
    // Use centralized thinking duration calculation
    if (window.enemyAIConfig && window.enemyAIConfig.calculateThinkingDuration) {
        const baseDuration = window.enemyAIConfig.CONSTANTS?.THINKING_DURATION_BASE || 3000;
        const context = enemy.aiContext?.consultationContext?.reason;

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

        return window.enemyAIConfig.calculateThinkingDuration(baseDuration, enemy.intelligence, enemy.rarity, situation);
    }

    // Fallback to original implementation if config not available
    let baseDuration;

    if (enemy.intelligence === 'basic') {
        baseDuration = 3000; // 3 seconds
    } else if (enemy.intelligence === 'advanced') {
        baseDuration = 2000; // 2 seconds
    } else if (enemy.intelligence === 'expert') {
        baseDuration = 1500; // 1.5 seconds
    } else {
        baseDuration = 3000; // Default fallback
    }

    // Adjust based on rarity (rarer = slightly slower thinking)
    if (enemy.rarity === 'common') {
        baseDuration *= 1.0; // Normal
    } else if (enemy.rarity === 'elite') {
        baseDuration *= 1.1; // 10% slower
    } else if (enemy.rarity === 'boss') {
        baseDuration *= 1.2; // 20% slower
    }

    // Situation-based adjustments
    const context = enemy.aiContext?.consultationContext?.reason;

    switch (context) {
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

/**
 * Fallback behavior decision when BT is not available
 * @param {BaseEnemy} enemy - The enemy instance
 * @param {Array} players - Array of player entities
 * @param {Object} context - Context information
 * @returns {Object} Fallback command
 */
function fallbackBehaviorDecision(enemy, players, context = {}) {
    //console.log('[BASE ENEMY FALLBACK] Making decision with context:', context);

    const closestPlayer = window.EnemyCombat.getClosestPlayer(enemy, players);

    // Context-aware fallback decisions
    switch (context.reason) {
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

/**
 * Helper: Get situation text for BT queries
 * @param {Object} context - Context information
 * @returns {string} Situation description
 */
function getSituationText(context = {}) {
    switch (context.reason) {
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

/**
 * Helper: Get decision text for BT responses
 * @param {Object} command - BT command
 * @param {Object} context - Context information
 * @returns {string} Decision description
 */
function getDecisionText(command, context) {
    if (!command) return 'няма решение';

    switch (command.type) {
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

// ===========================================
// INDIVIDUAL BEHAVIOR METHODS
// ===========================================

/**
 * Update idle behavior (extracted from BaseEnemy for modularity)
 * @param {BaseEnemy} enemy - The enemy instance
 * @param {Array} players - Array of player entities
 * @param {number} dt - Delta time
 * @param {Object} behaviors - Behavior configuration
 */
function updateIdleBehavior(enemy, players, dt, behaviors) {
    //console.log(`[DEBUG] ${enemy.constructor.name} #${enemy.level} updateIdleBehavior: START - isThinking=${enemy.isThinking}, aiTimer=${enemy.aiTimer}, pendingCommand=`, enemy.pendingCommand);

    // Handle negative timer (thinking phase)
    if (enemy.aiTimer < 0) {
        // Check for interruptions during thinking phase FIRST (before timer increment)
        const closestPlayer = window.EnemyCombat.getClosestPlayer(enemy, players);
        const chaseRadius = behaviors.chase?.radiusX || 300;
        //console.log(`[DEBUG] Thinking interruption check: aiTimer=${enemy.aiTimer}, hasPlayer=${!!closestPlayer}, distance=${closestPlayer?.distance}, chaseRadius=${chaseRadius}, condition=${!!(closestPlayer && closestPlayer.distance <= chaseRadius)}`);
        if (closestPlayer && closestPlayer.distance <= chaseRadius) {
            // Only interrupt if this thinking phase allows interruption (default: true)
            // If we explicitly waited (e.g. pre-attack pause), don't interrupt just because player is near
            const canInterrupt = enemy.thinkingPhaseInterrupted !== false; // Check the flag set by command

            if (canInterrupt) {
                //console.log(`[BASE ENEMY THINKING] Player detected during thinking, interrupting - distance: ${closestPlayer.distance} <= ${chaseRadius}`);
                // Player detected - interrupt thinking and handle immediately
                enemy.isThinking = false;
                // DON'T clear pendingCommand - transitionToBehavior() will overwrite it if needed

                const nextBehavior = consultBTForBehavior(enemy, players, { reason: 'player_detected', playerDistance: closestPlayer.distance });
                transitionToBehavior(enemy, nextBehavior, behaviors);
                return;
            } else {
                // console.log(`[BASE ENEMY THINKING] Player detected but phase is uninterruptible`);
            }
        }
        //console.log(`[DEBUG] No thinking interruption, continuing thinking phase`);

        // Thinking phase - count up from negative to 0
        enemy.aiTimer += dt;
        enemy.vx = 0; // No movement

        const thinkingDuration = Math.abs(enemy.aiTimer); // Original negative value
        //console.log(`[BASE ENEMY THINKING] Timer: ${enemy.aiTimer}/${thinkingDuration}, vx: ${enemy.vx}`);

        if (enemy.aiTimer >= 0 || Math.abs(enemy.aiTimer) < 0.001) {
            //console.log(`[BASE ENEMY THINKING] Thinking phase complete (aiTimer: ${enemy.aiTimer}), executing pending command`);
            // console.log(`[DEBUG] updateIdleBehavior: checking pendingCommand, value =`, enemy.pendingCommand, 'exists =', !!enemy.pendingCommand);

            // Thinking phase complete - execute pending command if available
            if (enemy.pendingCommand) {
                executePendingCommand(enemy, behaviors);
            } else {
                // No pending command - consult BT for new behavior
                // console.log(`[DEBUG] ELSE BLOCK: Consulting BT for idle_timeout`);
                console.log(`%c[NORMAL BEHAVIOR] ${enemy.constructor.name} #${enemy.instanceId} idle timeout - consulting BT for next action`, 'color: #0088ff; font-weight: bold; font-size: 14px;');
                const nextBehavior = consultBTForBehavior(enemy, players, { reason: 'idle_timeout' });
                // console.log(`[BASE ENEMY THINKING] BT returned:`, nextBehavior);
                transitionToBehavior(enemy, nextBehavior, behaviors);
            }
            enemy.aiTimer = 0; // Reset timer after thinking
            return; // Exit - don't process normal idle behavior
        }
        return; // Still in thinking phase
    }

    // Normal idle behavior (only when NOT in thinking phase and no pending command)
    if (enemy.isThinking || enemy.pendingCommand) {
        return; // Don't interfere with thinking phase or pending commands
    }

    enemy.aiTimer += dt;
    enemy.vx = 0; // No movement

    const idleDuration = behaviors.idle?.duration || 2000;
    //console.log(`[BASE ENEMY IDLE] Timer: ${enemy.aiTimer}/${idleDuration}, vx: ${enemy.vx}`);

    if (enemy.aiTimer >= idleDuration) {
        //console.log(`[BASE ENEMY IDLE] Timer expired, consulting BT for next behavior`);
        // Idle duration expired - consult BT for next behavior
        const nextBehavior = consultBTForBehavior(enemy, players, { reason: 'idle_timeout' });
        //console.error(`[BASE ENEMY IDLE] BT returned:`, nextBehavior);
        transitionToBehavior(enemy, nextBehavior, behaviors);
        enemy.aiTimer = 0;
    }
}

// ===========================================
// MODULE EXPORTS
// ===========================================

window.EnemyAI = {
    updateFSMBehavior,
    updateIdleBehavior,
    consultBTForBehavior,
    transitionToBehavior,
    startThinkingPhase,
    executePendingCommand,
    getThinkingDuration
};
