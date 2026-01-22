// Combat Helper Functions - moved from combat_system.js

// Check if player can perform action (skill unlocked + resources) - moved from skills.js
function canPlayerPerformSkill(player, actionType) {
    // First check if skill is unlocked
    if (!window.skillTreeManager.hasSkill(player, actionType)) return false;

    // Check resource requirements
    const skill = window.skillTreeManager.getSkillInfo(actionType);
    if (skill.resourceType === RESOURCE_TYPES.NONE) return true;

    if (skill.resourceType === RESOURCE_TYPES.MANA) {
        return player.mana >= skill.resourceCost;
    }

    if (skill.resourceType === RESOURCE_TYPES.ENERGY) {
        return player.energy >= skill.resourceCost;
    }

    return false;
}

// Calculate hit box position using the same logic as AnimationRenderer - MOVED FROM game.js
function calculateHitBoxPosition(entity, animationSystem) {
    // Calculate Z-depth offset
    const zOffset = entity.z * 1.0;

    // Drawing position (same as AnimationRenderer)
    const drawX = entity.x;
    const drawY = entity.y - entity.h - zOffset;

    // Try to use per-frame hit box data (same as AnimationRenderer)
    if (entity.animation?.animationDefinition?.frameData) {
        const currentFrame = entity.animation.currentFrame;
        const frameData = entity.animation.animationDefinition.frameData[currentFrame];
        if (frameData?.hitBox) {
            // Use per-frame hit box data
            const hitBox = frameData.hitBox;

            // Calculate hit box position (same logic as AnimationRenderer.calculateBoxPosition)
            let boxX = drawX + hitBox.x;
            let boxY;

            // Different positioning for different entity types (same as AnimationRenderer)
            if (entity.animationEntityType !== 'blue_slime') {
                // SPRITE ENTITIES (players) - position relative to sprite coordinates
                boxY = drawY + entity.h / 2 - hitBox.y;
            } else {
                // RECTANGLE ENTITIES (Blue Slime) - position at bottom
                boxY = drawY + entity.h - hitBox.height;
            }

            return {
                x: boxX,
                y: boxY,
                width: hitBox.width,
                height: hitBox.height
            };
        }
    }

    // Fallback to standard collision dimensions if no animation data
    return {
        x: drawX,
        y: drawY + entity.h - (entity.collisionH || entity.h),
        width: entity.collisionW || entity.w,
        height: entity.collisionH || entity.h
    };
}

// Centralized damage number positioning function - now uses hit box coordinates - MOVED FROM game.js
function addDamageNumberToTarget(attacker, target, damage, isCritical = false, damageNumberManager) {
    // Get hit box position using the same calculation as collision system
    const hitBoxPos = calculateHitBoxPosition(target, window.animationSystem);

    // Position damage number above the top of the hit box, centered horizontally
    const damageX = hitBoxPos.x + hitBoxPos.width / 2;  // Center of hit box
    const damageY = hitBoxPos.y - 15;                   // 15px above top of hit box

    // Debug logging
    //console.log(`[DAMAGE_NUMBER] Target: ${target.entityType}, HitBox: x=${hitBoxPos.x.toFixed(1)}, y=${hitBoxPos.y.toFixed(1)}, w=${hitBoxPos.width}, h=${hitBoxPos.height}`);
    //console.log(`[DAMAGE_NUMBER] Damage position: x=${damageX.toFixed(1)}, y=${damageY.toFixed(1)}, damage=${damage}, critical=${isCritical}`);

    // Use the damage number manager parameter
    if (damageNumberManager) {
        damageNumberManager.addDamageNumber(damageX, damageY, damage, isCritical);
    } else {
        console.warn('[COMBAT] No damageNumberManager provided for damage number');
    }
}

// Map enemy animation attack types to combat skill types - MOVED FROM game.js
function getCombatSkillType(enemyAttackType) {
    switch (enemyAttackType) {
        case 'ATTACK_1':
            return 'basic_attack_light'; // Use player's basic attack for damage calculation
        case 'ATTACK_2':
            return 'secondary_attack_light';
        case 'ATTACK_3':
        case 'RUN_ATTACK':
            return 'basic_attack_medium';
        default:
            return 'basic_attack_light'; // Default fallback
    }
}

// Handle enemy defeat
function handleEnemyDefeat(attacker, defeatedEnemy, levelManager) {
    console.log(`[COMBAT] handleEnemyDefeat called with attacker:`, attacker, `defeatedEnemy:`, defeatedEnemy);

    console.log(`[COMBAT] Enemy defeated! ${attacker ? `Awarding experience to ${attacker.characterInfo?.getDisplayName() || 'Player'}` : 'Experience already awarded'}`);

    // Award experience to the attacker (only if attacker is provided)
    if (attacker && attacker.characterInfo) {
        const experienceReward = 200; // 200 XP for enemy defeat
        attacker.characterInfo.addExperience(experienceReward, attacker);
        console.log(`[COMBAT] ${attacker.characterInfo.getDisplayName()} gained ${experienceReward} experience!`);
    }

    // Level completion status is now updated in resolveAttackInternal when enemy dies
    // DO NOT update it here to avoid double counting

    // Remove enemy from the game world via game state
    removeEnemyFromGame(defeatedEnemy, window.gameState, window.enemy);

    // Trigger any post-defeat effects
    onEnemyDefeated(attacker, defeatedEnemy);
}

// Remove enemy from the game
function removeEnemyFromGame(defeatedEnemy, gameState, legacyEnemy) {
    console.log(`[COMBAT] Removing enemy from game world...`);

    // Remove from game state if available
    if (gameState) {
        const entityId = gameState.getEntityId(defeatedEnemy);
        if (entityId) {
            gameState.removeEntity(entityId);
            console.log(`[COMBAT] Enemy removed from game state (ID: ${entityId})`);
        }
    } else {
        // Fallback for backwards compatibility
        if (legacyEnemy === defeatedEnemy) {
            console.log(`[COMBAT] Setting window.enemy to null (legacy mode)`);
            window.enemy = null;
        }
    }

    console.log(`[COMBAT] Enemy removal complete`);
}

// Post-defeat effects and events
function onEnemyDefeated(attacker, defeatedEnemy) {
    // Future: trigger quest updates, loot drops, achievements, etc.
    console.log(`[COMBAT] Enemy defeat processing complete`);

    // LEGACY RESPAWN SYSTEM - COMMENTED OUT
    // Now level system handles respawning through triggers
    /*
    // For now, trigger respawn after a short delay
    setTimeout(() => {
        respawnEnemy();
    }, 2000); // 2 second delay before respawn
    */
}

// Respawn enemy (for testing purposes)
function respawnEnemy(gameState, enemy, createEnemyWithData, animationSystem, AnimationStateMachine) {
    console.log(`[COMBAT] Checking respawn conditions...`);

    // Check if we need to respawn (no enemies in game state or window.enemy is null)
    const shouldRespawn = gameState ?
        gameState.getEntitiesByType('enemy').length === 0 :
        enemy === null;

    if (shouldRespawn) {
        console.log(`[COMBAT] Respawning enemy...`);

        // Create new enemy
        const newEnemy = createEnemyWithData('basic', 1);

        // Register enemy with animation system (same as in main.js)
        if (animationSystem && animationSystem.isInitialized) {
            const enemyAnimation = animationSystem.registerEntity(newEnemy, 'enemy');
            console.log(`[COMBAT RESPAWN] Enemy registered with animation system:`, enemyAnimation ? 'SUCCESS' : 'FAILED');

            // Initialize FSM after animation is registered
            if (AnimationStateMachine) {
                newEnemy.stateMachine = new AnimationStateMachine(newEnemy);
                console.log(`[COMBAT RESPAWN] Enemy FSM initialized:`, newEnemy.stateMachine.getCurrentStateName());
            }
        } else {
            console.warn(`[COMBAT RESPAWN] Animation system not ready for respawned enemy`);
        }

        // Register with enemy combat manager
        if (window.enemyCombatManager) {
            window.enemyCombatManager.registerEnemy(newEnemy);
            console.log(`[COMBAT RESPAWN] Enemy registered with combat manager`);
        }

        // Add to game state if available
        if (gameState) {
            gameState.addEntity(newEnemy, 'enemy');
            console.log(`[COMBAT] Enemy respawned and added to game state with ${newEnemy.health}/${newEnemy.maxHealth} HP (ID: ${newEnemy.id})`);
        } else {
            // Fallback for backwards compatibility
            window.enemy = newEnemy;
            console.log(`[COMBAT] Enemy respawned with ${window.enemy.health}/${window.enemy.maxHealth} HP (legacy mode)`);
        }
    } else {
        console.log(`[COMBAT] Respawn not needed - enemies still present`);
    }
}

// Export functions globally for traditional JavaScript approach
window.canPlayerPerformSkill = canPlayerPerformSkill;
window.calculateHitBoxPosition = calculateHitBoxPosition;
window.addDamageNumberToTarget = addDamageNumberToTarget;
window.getCombatSkillType = getCombatSkillType;
window.handleEnemyDefeat = handleEnemyDefeat;
window.removeEnemyFromGame = removeEnemyFromGame;
window.onEnemyDefeated = onEnemyDefeated;
window.respawnEnemy = respawnEnemy;
