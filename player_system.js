// ===========================================
// PLAYER UPDATE SYSTEM
// ===========================================


/**
 * Updates a single player entity with combat logic, input processing, and physics
 * @param {Player} player - The player entity to update
 * @param {number} playerIndex - Index of the player (for controller input)
 * @param {number} dt - Delta time for frame-based calculations
 */
function updatePlayer(player, playerIndex, dt) {
    //console.log('[UPDATE_PLAYER] Called with player:', player, 'index:', playerIndex, 'type:', typeof player);

    // Safety check for undefined/null players
    if (!player || typeof player !== 'object') {
        //console.warn('[UPDATE_PLAYER] Invalid player, returning early');
        return;
    }

    //console.log('[UPDATE_PLAYER] Player properties - currentAction:', player.currentAction, 'controls:', !!player.controls);

    player.vx = 0;
    player.vz = 0;

    const inputMode = player.controls.inputMode || 'keyboard';

    // Движения и действия
    if (inputMode === 'keyboard') {
        handleKeyboardInput(player);
    } else if (inputMode === 'controller') {
        handleControllerInput(player, playerIndex);
    }

    // Физика и колизии - use unified collision system
    //console.log(`[PLAYER_MOVEMENT] Before: pos(${player.x.toFixed(1)}, ${player.z.toFixed(1)}), vel(${player.vx.toFixed(1)}, ${player.vz.toFixed(1)})`);
    window.handlePlayerMovement(player, dt, CANVAS_HEIGHT, GRAVITY, Z_MIN, Z_MAX);
    //console.log(`[PLAYER_MOVEMENT] After: pos(${player.x.toFixed(1)}, ${player.z.toFixed(1)}), vel(${player.vx.toFixed(1)}, ${player.vz.toFixed(1)})`);

    // Проверка за удар с врагове - FSM-based damage dealing
    if (player.stateMachine && player.stateMachine.isInAttackState() && !player.damageDealt) {
        //console.log(`[ATTACK] Player in attack state: ${player.stateMachine.getCurrentStateName()}, damage not yet dealt`);

        // Проверка за сблъсък с всички противници
        const enemies = window.gameState ? window.gameState.getEntitiesByType('enemy') : [window.enemy].filter(e => e);
        //console.log(`[ATTACK] Found ${enemies.length} enemies to check`);

        for (const enemy of enemies) {
            if (!enemy) continue;

            //console.log(`[ATTACK] Checking collision with enemy at (${enemy.x}, ${enemy.y})`);
            const hit = checkHitboxCollision(player, enemy, {
                zTolerance: 10
            });

            //console.log(`[ATTACK] Collision result: ${hit}`);

            if (hit) {
                // Use combat system to calculate and apply damage
                const currentAttackType = player.stateMachine.getCurrentAttackType();
                //console.log(`[ATTACK] Current attack type: ${currentAttackType}`);
                //console.log(`[ATTACK] Player health before attack: ${player.health}`);

                if (currentAttackType) {
                    //console.log(`[ATTACK] Resolving attack with combat system...`);
                    //console.log(`[ATTACK] Enemy health before attack: ${enemy.health}`);
                    const combatEvent = window.combatResolver.resolveAttackNoResourceCheck(player, enemy, currentAttackType);
                    //console.log(`[ATTACK] Combat event result:`, combatEvent);
                    //console.log(`[ATTACK] Enemy health after attack: ${enemy.health}`);
                    //console.log(`[ATTACK] Damage dealt: ${combatEvent?.actualDamage || 0}`);

                    // Add damage number for visual feedback
                    if (combatEvent && combatEvent.actualDamage > 0) {
                        //console.log(`[ATTACK] Applying ${combatEvent.actualDamage} damage`);
                        // Damage numbers appear centered above the target (enemy)
                        window.addDamageNumberToTarget(player, enemy, combatEvent.actualDamage, combatEvent.damageResult.isCritical, window.damageNumberManager);
                    } else {
                        //console.log(`[ATTACK] No damage applied - combat event:`, combatEvent);
                    }

                    // Mark damage as dealt for this attack and set visual hit flag
                    // Only set damageDealt if we actually applied damage
                    if (combatEvent && combatEvent.actualDamage > 0) {
                        player.damageDealt = true;
                        enemy.hit = true;
                        //console.log(`[ATTACK] Damage dealt (${combatEvent.actualDamage}), setting damageDealt flag`);
                    } else {
                        //console.log(`[ATTACK] No damage applied, keeping damageDealt false for potential retry`);
                    }
                    break; // Само един удар на атака
                } else {
                    //console.log(`[ATTACK] No current attack type found`);
                }
            }
        }
    }

    // Enemy attacks using FSM system
    // Check if any enemy is attacking this player
    const enemyEntities = window.gameState ? window.gameState.getEntitiesByType('enemy') : [window.enemy].filter(e => e);

    // Count attacking enemies first to avoid spam
    const attackingEnemies = enemyEntities.filter(enemy =>
        enemy && enemy.stateMachine && enemy.stateMachine.isInAttackState() && !enemy.damageDealt
    );

    // Only log if there are actively attacking enemies
    // if (attackingEnemies.length > 0) {
    //   console.log(`[ENEMY_ATTACK_DEBUG] ${attackingEnemies.length} enemies actively attacking player`);

    for (const enemy of attackingEnemies) {
        // console.log(`[ENEMY_ATTACK_DEBUG] Enemy ${enemy?.id || 'unknown'}:`);
        // console.log(`  - currentState: ${enemy?.stateMachine?.getCurrentStateName() || 'none'}`);
        // console.log(`  - isInAttackState: ${enemy?.stateMachine?.isInAttackState() || false}`);
        // console.log(`  - damageDealt: ${enemy?.damageDealt || false}`);
        // console.log(`  - animation.currentFrame: ${enemy?.animation?.currentFrame || 'no animation'}`);
        // console.log(`  - animation.type: ${enemy?.animation?.currentAnimation || 'no animation'}`);

        // console.log(`[ENEMY_ATTACK_DEBUG] Enemy ${enemy.id} checking collision...`);
        // console.log(`[ENEMY_ATTACK_DEBUG] damageDealt before collision check: ${enemy.damageDealt}`);

        // Check collision for enemy attack
        const hit = checkHitboxCollision(enemy, player, {
            zTolerance: 10
        });

        //console.log(`[ENEMY_ATTACK_DEBUG] Collision result: ${hit}`);

        // Debug attack box position
        if (enemy.animation && enemy.animation.animationDefinition) {
            const currentFrame = enemy.animation.currentFrame;
            const frameData = enemy.animation.animationDefinition.frameData?.[currentFrame];
            // console.log(`[ENEMY_ATTACK_DEBUG] Frame data:`, {
            //   frame: currentFrame,
            //   hasAttackBox: !!frameData?.attackBox,
            //   attackBox: frameData?.attackBox
            // });
        }

        if (hit) {
            //console.log(`[ENEMY_ATTACK_DEBUG] HIT DETECTED! Getting attack type...`);
            // Use combat system to calculate and apply damage
            const enemyAttackType = enemy.stateMachine.getCurrentAttackType();
            //console.log(`[ENEMY_ATTACK_DEBUG] Attack type: ${enemyAttackType}`);

            if (enemyAttackType) {
                //console.log(`[ENEMY_ATTACK_DEBUG] Resolving attack with combat system...`);

                // Map enemy animation attack types to combat skill types
                let combatSkillType;
                switch (enemyAttackType) {
                    case 'ATTACK_1':
                        combatSkillType = 'basic_attack_light'; // Use player's basic attack for damage calculation
                        break;
                    case 'ATTACK_2':
                        combatSkillType = 'secondary_attack_light';
                        break;
                    case 'ATTACK_3':
                    case 'RUN_ATTACK':
                        combatSkillType = 'basic_attack_medium';
                        break;
                    default:
                        combatSkillType = 'basic_attack_light'; // Default fallback
                }

                //console.log(`[ENEMY_ATTACK_DEBUG] Mapped ${enemyAttackType} to combat skill: ${combatSkillType}`);
                const combatEvent = window.combatResolver.resolveAttackNoResourceCheck(enemy, player, combatSkillType);
                //console.log(`[ENEMY_ATTACK_DEBUG] Combat event:`, combatEvent);

                // Add damage number for visual feedback
                if (combatEvent && combatEvent.actualDamage > 0) {
                    // Damage numbers appear centered above the target (player)
                    window.addDamageNumberToTarget(enemy, player, combatEvent.actualDamage, combatEvent.damageResult.isCritical, window.damageNumberManager);
                }

                // Set damageDealt flag to prevent multiple damage per attack (unified with player system)
                if (combatEvent && combatEvent.actualDamage > 0) {
                    enemy.damageDealt = true;
                    //console.log(`[ENEMY_ATTACK_DEBUG] Damage applied (${combatEvent.actualDamage}), set damageDealt=true`);
                } else {
                    //console.log(`[ENEMY_ATTACK_DEBUG] No damage applied, keeping damageDealt=false`);
                }

                // Set visual hit flag for player
                player.hit = true;
                //console.log(`[ENEMY_ATTACK_DEBUG] Player hit flag set to true`);
                break; // Only one enemy attack per player per frame
            } else {
                //console.log(`[ENEMY_ATTACK_DEBUG] No attack type found, skipping damage`);
            }
        } else {
            //console.log(`[ENEMY_ATTACK_DEBUG] No collision detected, enemy attack missed`);
        }
    }
}

// ===========================================
// INPUT HANDLING SYSTEM
// ===========================================

/**
 * Handles keyboard input for player movement and actions
 * @param {Player} player - The player entity
 */
function handleKeyboardInput(player) {
    const controls = getCurrentControls(player);

    // Движения
    if (window.keys[controls.left]) {
        player.vx = -SPEED;
    }
    if (window.keys[controls.right]) {
        player.vx = SPEED;
    }
    if (window.keys[controls.up]) {
        player.vz = Z_SPEED;
    }
    if (window.keys[controls.down]) {
        player.vz = -Z_SPEED;
    }

    // Скок - FSM-based
    if (window.keys[controls.jump] && player.onGround && player.stateMachine) {
        logAction(0, 'клавиатура', controls.jump.toUpperCase(), 'jump');
        player.vy = JUMP_FORCE;
        player.onGround = false;
        player.stateMachine.handleAction('jump');
    }

    // Основни атаки - FSM-based
    if (window.keys[controls.basicAttackLight] && player.stateMachine && !player.stateMachine.isInAttackState()) {
        logAction(0, 'клавиатура', controls.basicAttackLight.toUpperCase(), 'attack_light');
        player.stateMachine.handleAction('attack_light');
    }
    if (window.keys[controls.basicAttackMedium] && player.stateMachine && !player.stateMachine.isInAttackState()) {
        // Check if player can perform skill (resources, etc.) - centralized in combat_system.js
        if (window.combatResolver.canPlayerPerformSkill(player, 'basic_attack_medium')) {
            logAction(0, 'клавиатура', controls.basicAttackMedium.toUpperCase(), 'attack_medium');
            player.stateMachine.handleAction('attack_medium');
        } else {
            // TODO: Show "not enough mana" feedback to player
        }
    }
    // if (window.keys[controls.basicAttackHeavy] && player.stateMachine && !player.stateMachine.isInAttackState()) {
    //   logAction(0, 'клавиатура', controls.basicAttackHeavy.toUpperCase(), 'attack_heavy');
    //   player.stateMachine.handleAction('attack_heavy');
    // }

    // Допълнителни атаки - FSM-based (when implemented)
    // For now, secondary attacks use the same as primary
    if (window.keys[controls.secondaryAttackLight] && player.stateMachine && !player.stateMachine.isInAttackState()) {
        logAction(0, 'клавиатура', controls.secondaryAttackLight.toUpperCase(), 'attack_light');
        player.stateMachine.handleAction('attack_light');
    }
    // if (window.keys[controls.secondaryAttackMedium] && player.stateMachine && !player.stateMachine.isInAttackState()) {
    //   logAction(0, 'клавиатура', controls.secondaryAttackMedium.toUpperCase(), 'attack_medium');
    //   player.stateMachine.handleAction('secondary_attack_medium');
    // }
    // if (window.keys[controls.secondaryAttackHeavy] && player.stateMachine && !player.stateMachine.isInAttackState()) {
    //   logAction(0, 'клавиатура', controls.secondaryAttackHeavy.toUpperCase(), 'attack_heavy');
    //   player.stateMachine.handleAction('secondary_attack_heavy');
    // }
}

/**
 * Handles controller input for player movement and actions
 * @param {Player} player - The player entity
 * @param {number} playerIndex - Index of the player for controller identification
 */
function handleControllerInput(player, playerIndex) {
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[playerIndex];
    const controls = getCurrentControls(player);

    if (gamepad) {
        // Движения
        if (Math.abs(gamepad.axes[0]) > 0.1) {
            player.vx = gamepad.axes[0] * SPEED;
        }
        if (Math.abs(gamepad.axes[1]) > 0.1) {
            player.vz = -gamepad.axes[1] * Z_SPEED;
        }

        // D-pad движения
        if (gamepad.buttons[12].pressed) {
            logAction(playerIndex, 'контролер', 'D-pad ↑', 'движение нагоре');
            player.vz = Z_SPEED;
        }
        if (gamepad.buttons[13].pressed) {
            logAction(playerIndex, 'контролер', 'D-pad ↓', 'движение надолу');
            player.vz = -Z_SPEED;
        }
        if (gamepad.buttons[14].pressed) {
            logAction(playerIndex, 'контролер', 'D-pad ←', 'движение наляво');
            player.vx = -SPEED;
        }
        if (gamepad.buttons[15].pressed) {
            logAction(playerIndex, 'контролер', 'D-pad →', 'движение надясно');
            player.vx = SPEED;
        }

        // Скок - FSM-based
        if (isButtonPressed(gamepad, controls.jump) && player.onGround && player.stateMachine) {
            //console.log(`[JUMP] Jump started - player on ground, triggering FSM jump`);
            const buttonName = getButtonName(controls.jump);
            logAction(playerIndex, 'контролер', buttonName, 'jump');
            player.vy = JUMP_FORCE;
            player.onGround = false;
            player.stateMachine.handleAction('jump');
        }

        // Основни атаки - FSM-based
        if (isButtonPressed(gamepad, controls.basicAttackLight) && player.stateMachine && !player.stateMachine.isInAttackState()) {
            const buttonName = getButtonName(controls.basicAttackLight);
            logAction(playerIndex, 'контролер', buttonName, 'attack_light');
            player.stateMachine.handleAction('attack_light');
        }
        if (isButtonPressed(gamepad, controls.basicAttackMedium) && player.stateMachine && !player.stateMachine.isInAttackState()) {
            const buttonName = getButtonName(controls.basicAttackMedium);
            logAction(playerIndex, 'контролер', buttonName, 'attack_medium');
            player.stateMachine.handleAction('attack_medium');
        }
        if (isButtonPressed(gamepad, controls.basicAttackHeavy) && player.stateMachine && !player.stateMachine.isInAttackState()) {
            const buttonName = getButtonName(controls.basicAttackHeavy);
            logAction(playerIndex, 'контролер', buttonName, 'attack_heavy');
            player.stateMachine.handleAction('attack_heavy');
        }

        // Допълнителни атаки - FSM-based (for now use same as primary)
        if (isButtonPressed(gamepad, controls.secondaryAttackLight) && player.stateMachine && !player.stateMachine.isInAttackState()) {
            const buttonName = getButtonName(controls.secondaryAttackLight);
            logAction(playerIndex, 'контролер', buttonName, 'attack_light');
            player.stateMachine.handleAction('attack_light');
        }
        if (isButtonPressed(gamepad, controls.secondaryAttackMedium) && player.stateMachine && !player.stateMachine.isInAttackState()) {
            const buttonName = getButtonName(controls.secondaryAttackMedium);
            logAction(playerIndex, 'контролер', buttonName, 'attack_medium');
            player.stateMachine.handleAction('attack_medium');
        }
        if (isButtonPressed(gamepad, controls.secondaryAttackHeavy) && player.stateMachine && !player.stateMachine.isInAttackState()) {
            const buttonName = getButtonName(controls.secondaryAttackHeavy);
            logAction(playerIndex, 'контролер', buttonName, 'attack_heavy');
            player.stateMachine.handleAction('attack_heavy');
        }
    }
}

/**
 * Gets the current control configuration for a player
 * @param {Player} player - The player entity
 * @returns {Object} Control configuration object
 */
function getCurrentControls(player) {
    //return player.controls[player.controls.inputMode];

    const mode = player.controls.inputMode || 'keyboard';
    let controls = player.controls[mode];

    // Ако контролер controls липсват, създай default
    if (mode === 'controller' && !controls) {
        //console.log('Creating default controller controls');
        controls = {
            // Движения (D-pad)
            left: 14,   // D-pad Left
            right: 15,  // D-pad Right
            up: 12,     // D-pad Up
            down: 13,   // D-pad Down
            jump: 7,    // R2 бутон

            // Основни атаки
            basicAttackLight: 2,        // □ Square бутон - лека основна атака
            basicAttackMedium: 3,       // ◯ Circle бутон - средна основна атака
            basicAttackHeavy: 4,        // △ Triangle бутон - тежка основна атака

            // Допълнителни атаки
            secondaryAttackLight: 0,    // X Cross бутон - лека допълнителна атака
            secondaryAttackMedium: 1,   // L1 бутон - средна допълнителна атака
            secondaryAttackHeavy: 5     // R1 бутон - тежка допълнителна атака
        };
        player.controls.controller = controls;
    }
    return controls;
}

// ===========================================
// INPUT UTILITY FUNCTIONS
// ===========================================

/**
 * Logs player actions for debugging
 * @param {number} playerIndex - Index of the player
 * @param {string} inputDevice - Input device type
 * @param {string} button - Button pressed
 * @param {string} actionType - Type of action performed
 */
function logAction(playerIndex, inputDevice, button, actionType) {
    const playerNum = playerIndex + 1;
    const actionName = getActionDisplayName(actionType);
    //console.log(`🎮 Играч ${playerNum}, ${inputDevice}, бутон "${button}", действие ${actionName}`);
}

/**
 * Gets display name for action types
 * @param {string} actionType - The action type
 * @returns {string} Display name for the action
 */
function getActionDisplayName(actionType) {
    const names = {
        [window.SKILL_TYPES?.JUMP]: 'скок',
        [window.SKILL_TYPES?.BASIC_ATTACK_LIGHT]: 'основна лека атака',
        [window.SKILL_TYPES?.BASIC_ATTACK_MEDIUM]: 'основна средна атака',
        [window.SKILL_TYPES?.BASIC_ATTACK_HEAVY]: 'основна тежка атака',
        [window.SKILL_TYPES?.SECONDARY_ATTACK_LIGHT]: 'допълнителна лека атака',
        [window.SKILL_TYPES?.SECONDARY_ATTACK_MEDIUM]: 'допълнителна средна атака',
        [window.SKILL_TYPES?.SECONDARY_ATTACK_HEAVY]: 'допълнителна тежка атака'
    };
    return names[actionType] || actionType;
}

/**
 * Checks if a gamepad button is pressed
 * @param {Gamepad} gamepad - The gamepad object
 * @param {number} buttonIndex - Index of the button to check
 * @param {number} threshold - Pressure threshold for analog buttons
 * @returns {boolean} True if button is pressed
 */
function isButtonPressed(gamepad, buttonIndex, threshold = 0.5) {
    const button = gamepad.buttons[buttonIndex];

    if (!button) {
        //console.log(`Button ${buttonIndex} not found`);
        return false;
    }

    if (button.pressed !== undefined && button.pressed) {
        return true;
    }

    if (button.value !== undefined && button.value > threshold) {
        return true;
    }

    return false;
}

/**
 * Gets display name for gamepad buttons
 * @param {number} buttonIndex - Index of the button
 * @returns {string} Display name for the button
 */
function getButtonName(buttonIndex) {
    const buttonNames = {
        0: 'X', 1: '◯', 2: '□', 3: '△',
        4: 'L1', 5: 'R1', 6: 'L2', 7: 'R2',
        8: 'Share', 9: 'Options',
        12: 'D-pad ↑', 13: 'D-pad ↓', 14: 'D-pad ←', 15: 'D-pad →'
    };
    return buttonNames[buttonIndex] || `Button ${buttonIndex}`;
}

// ===========================================
// GLOBAL EXPORTS
// ===========================================

// Export player system functions globally for backwards compatibility
window.updatePlayer = updatePlayer;
window.handleKeyboardInput = handleKeyboardInput;
window.handleControllerInput = handleControllerInput;
window.getCurrentControls = getCurrentControls;
window.logAction = logAction;
window.getActionDisplayName = getActionDisplayName;
window.isButtonPressed = isButtonPressed;
window.getButtonName = getButtonName;
