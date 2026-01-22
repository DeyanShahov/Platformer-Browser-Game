// Combat Resolver - moved from combat_system.js
class CombatResolver {
    constructor() {
        this.combatCalculator = new CombatCalculator();
        this.combatLog = [];
        this.maxLogEntries = 50;
    }

    // Check if player can perform a skill (resources, cooldowns, etc.) - without consuming
    canPlayerPerformSkill(player, skillType) {
        // Skip for enemies
        if (player.entityType === 'enemy') return true;

        // Check resources
        return this.canAffordSkill(player, skillType);
    }

    // Resolve an attack from attacker to defender (with resource consumption)
    resolveAttack(attacker, defender, skillType) {
        return this.resolveAttackInternal(attacker, defender, skillType, true);
    }

    // Resolve an attack without resource consumption (for cases where resources were already checked)
    resolveAttackNoResourceCheck(attacker, defender, skillType) {
        return this.resolveAttackInternal(attacker, defender, skillType, false);
    }

    // Internal attack resolution
    resolveAttackInternal(attacker, defender, skillType, consumeResources = true) {
        if (!defender) {
            console.warn('No defender for attack resolution');
            return null;
        }

        // For player attacks, consume resources at the start (not just when hitting)
        // For enemy attacks, consume resources only when hitting (consumeResources = true)
        if (consumeResources && attacker.entityType !== 'enemy') {
            // Player attacks consume resources at the start of the attack animation
            if (!this.checkAndConsumeSkillResources(attacker, skillType)) {
                return null; // Attack failed due to insufficient resources
            }
        } else if (consumeResources && attacker.entityType === 'enemy') {
            // Enemy attacks consume resources when hitting (legacy behavior)
            if (!this.checkAndConsumeSkillResources(attacker, skillType)) {
                return null; // Attack failed due to insufficient resources
            }
        }

        // Check accuracy and dodge
        const accuracyResult = this.checkAccuracyAndDodge(attacker, defender, skillType);
        if (!accuracyResult.hit) {
            // Attack missed
            console.log(`[COMBAT] ${attacker.characterInfo?.getDisplayName() || 'Attacker'} missed ${defender.characterInfo?.getDisplayName() || 'Defender'} with ${skillType} (${accuracyResult.reason})`);

            // Create miss event
            const missEvent = {
                timestamp: Date.now(),
                attacker: attacker,
                defender: defender,
                skillType: skillType,
                damageResult: { damage: 0, isCritical: false, attackPower: 0, defense: 0, skillModifier: 0 },
                actualDamage: 0,
                defenderDied: false,
                missed: true,
                missReason: accuracyResult.reason
            };

            this.logCombatEvent(missEvent);
            return missEvent;
        }

        // Calculate damage using the combat calculator
        const damageResult = this.combatCalculator.calculateDamage(attacker, defender, skillType);

        // Apply damage to defender
        const actualDamage = this.applyDamage(defender, damageResult.damage);

        // Check for enemy defeat - работи за всички противници, не само за window.enemy
        const defenderDied = defender.health <= 0;
        if (defenderDied && defender.entityType === 'enemy' && !defender.isDying) {
            // Enemy was defeated - award experience to attacker IMMEDIATELY
            if (attacker && attacker.characterInfo) {
                const experienceReward = 200; // 200 XP for enemy defeat
                attacker.characterInfo.addExperience(experienceReward, attacker);
                console.log(`[COMBAT] ${attacker.characterInfo.getDisplayName()} gained ${experienceReward} experience!`);
            }

            // Enemy was defeated - update level completion status IMMEDIATELY
            if (window.levelManager) {
                window.levelManager.completionStatus.defeatedEnemies = (window.levelManager.completionStatus.defeatedEnemies || 0) + 1;
                console.log(`[COMPLETION] Enemy defeated! Total defeated: ${window.levelManager.completionStatus.defeatedEnemies}`);

                // Check if level completion conditions are now met
                window.levelManager.checkCompletionConditions();
            }

            // Enemy was defeated - call enemy.die() FIRST for FSM transition and animation
            defender.die(); // ← НОВО: Извикай enemy death логика за анимация и FSM

            // EnemyDeath.updateDeath() will handle removal when animation completes
            // DO NOT call startEnemyDeathSequence here - it removes enemy immediately
        }

        // Create combat event
        const combatEvent = {
            timestamp: Date.now(),
            attacker: attacker,
            defender: defender,
            skillType: skillType,
            damageResult: damageResult,
            actualDamage: actualDamage,
            defenderDied: defenderDied
        };

        // Log the event
        this.logCombatEvent(combatEvent);

        // Console logging for debugging
        //console.log(`[COMBAT] ${attacker.characterInfo?.getDisplayName() || 'Unknown'} attacked ${defender.characterInfo?.getDisplayName() || 'Unknown'} with ${skillType}`);
        //console.log(`[COMBAT] Attack Power: ${damageResult.attackPower}, Defense: ${damageResult.defense}, Damage: ${actualDamage}${damageResult.isCritical ? ' (CRITICAL!)' : ''}`);
        // if (defenderDied) {
        //   console.log(`[COMBAT] ${defender.characterInfo?.getDisplayName() || 'Enemy'} was defeated!`);
        // }

        return combatEvent;
    }

    // Apply damage to a defender
    applyDamage(defender, damage) {
        if (!defender.health) {
            console.warn('Defender has no health property:', defender);
            return 0;
        }

        const oldHealth = defender.health;
        defender.health = Math.max(0, defender.health - damage);
        const actualDamage = oldHealth - defender.health;

        // Mark as hit for visual feedback
        defender.hit = true;

        return actualDamage;
    }

    // Log combat events
    logCombatEvent(event) {
        this.combatLog.push(event);

        // Keep log size manageable
        if (this.combatLog.length > this.maxLogEntries) {
            this.combatLog.shift();
        }

        // Trigger any UI updates for combat log
        this.notifyCombatLogUpdate(event);
    }

    // Get recent combat events
    getRecentEvents(count = 10) {
        return this.combatLog.slice(-count);
    }

    // MOVED TO game.js - Game logic for enemy defeat handling

    // Start enemy death sequence
    startEnemyDeathSequence(attacker, defeatedEnemy) {
        console.log(`[COMBAT] Starting enemy death sequence for ${defeatedEnemy.enemyData?.getDisplayName() || 'Enemy'}`);

        // Set enemy to dying state
        defeatedEnemy.isDying = true;
        defeatedEnemy.deathTimer = 0;
        defeatedEnemy.blinkCount = 0;
        defeatedEnemy.visible = true;

        // Handle the full enemy defeat process (XP awarding, level completion, removal)
        handleEnemyDefeat(attacker, defeatedEnemy, window.levelManager);
    }

    // Update enemy death sequence (called from game loop)
    updateEnemyDeath(defeatedEnemy, dt) {
        if (!defeatedEnemy.isDying) return false;

        defeatedEnemy.deathTimer += dt;

        // Wait for death animation to complete (handled by enemy.updateDeath())
        // No more legacy blink effect - animation system handles visual death sequence

        return false; // Enemy still dying (animation system will handle cleanup)
    }

    // Check if attacker can afford skill (without consuming)
    canAffordSkill(attacker, skillType) {
        const resourceManager = window.getResourceManager(attacker);
        const skillInfo = window.skillTreeManager ? window.skillTreeManager.getSkillInfo(skillType) : null;
        if (!skillInfo) {
            console.warn(`[COMBAT] No skill info for ${skillType}`);
            return true; // Allow if skill not found
        }

        const resourceType = skillInfo.resourceType;
        const resourceCost = skillInfo.resourceCost || 0;

        if (!resourceType || resourceCost <= 0) {
            return true; // No cost required
        }

        // Convert resource type to ResourceManager constants
        let rmResourceType;
        switch (resourceType) {
            case 'mana':
                rmResourceType = resourceManager.RESOURCE_TYPES.MANA;
                break;
            case 'energy':
                rmResourceType = resourceManager.RESOURCE_TYPES.ENERGY;
                break;
            default:
                console.warn(`[COMBAT] Unknown resource type: ${resourceType}`);
                return false;
        }

        return resourceManager.canAfford(rmResourceType, resourceCost);
    }

    // Consume skill resources using ResourceManager
    consumeSkillResources(attacker, skillType) {
        const resourceManager = window.getResourceManager(attacker);
        return resourceManager.consumeSkillResources(skillType);
    }

    // Check and consume skill resources (legacy method - now uses ResourceManager)
    checkAndConsumeSkillResources(attacker, skillType) {
        const resourceManager = window.getResourceManager(attacker);
        return resourceManager.consumeSkillResources(skillType);
    }

    // Check accuracy and dodge for an attack
    checkAccuracyAndDodge(attacker, defender, skillType) {
        // Enemies always hit (for now) - they have perfect accuracy
        if (attacker.entityType === 'enemy' || skillType === 'enemy_attack') {
            return { hit: true };
        }

        // Get skill info for accuracy modifier
        const skillInfo = window.skillTreeManager ? window.skillTreeManager.getSkillInfo(skillType) : null;
        const accuracyModifier = skillInfo ? skillInfo.accuracyModifier || 0 : 0;

        // Base accuracy (70% for players)
        let accuracy = 0.7;

        // Apply accuracy modifier from skill (can be positive or negative)
        accuracy += accuracyModifier;

        // Clamp accuracy between 5% and 95%
        accuracy = Math.max(0.05, Math.min(0.95, accuracy));

        // Get defender's dodge chance
        let dodgeChance = 0;
        if (defender.characterInfo && defender.characterInfo.dodgeChance !== undefined) {
            dodgeChance = defender.characterInfo.dodgeChance / 100; // Convert from percentage
        }

        // Clamp dodge chance between 0% and 50%
        dodgeChance = Math.max(0, Math.min(0.5, dodgeChance));

        // Calculate hit chance: accuracy vs dodge
        const hitChance = accuracy * (1 - dodgeChance);

        // Roll for hit
        const hitRoll = Math.random();
        const hit = hitRoll < hitChance;

        if (!hit) {
            // Determine miss reason
            let reason = 'miss';
            if (hitRoll < accuracy) {
                reason = 'dodged';
            } else {
                reason = 'inaccurate';
            }

            return { hit: false, reason: reason };
        }

        return { hit: true };
    }

    // Placeholder for UI notifications
    notifyCombatLogUpdate(event) {
        // Future: trigger UI updates, damage numbers, etc.
        // For now, just console logging is handled above
    }
}

// Export globally for traditional JavaScript approach
window.CombatResolver = CombatResolver;
