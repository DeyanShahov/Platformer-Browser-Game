// RPG Combat System for Platformer Game
// Handles damage calculation, combat resolution, and battle mechanics
// Works alongside the existing Skill System (timers, cooldowns, resources)

class CombatCalculator {
  constructor() {
    // Damage modifiers are now read from SKILL_TREE in skills.js
  }

  // Calculate total attack power for an attacker
  calculateAttackPower(attacker, skillType) {
    // Handle player attackers (have characterInfo and dynamic stats)
    if (attacker.characterInfo) {
      const baseAttack = attacker.baseAttack || attacker.characterInfo.baseAttack || 0;
      const strength = attacker.characterInfo.strength || 0;

      // Future: equipment bonuses, buffs, debuffs
      const equipmentBonus = this.getEquipmentAttackBonus(attacker);
      const buffBonus = this.getBuffAttackBonus(attacker);
      const debuffPenalty = this.getDebuffAttackPenalty(attacker);

      // Read damage modifier from skill tree instead of local skillModifiers
      const skillInfo = window.skillTreeManager ? window.skillTreeManager.getSkillInfo(skillType) : null;
      const skillModifier = skillInfo ? skillInfo.damageModifier || 0 : 0;

      const totalAttack = baseAttack + strength + equipmentBonus + buffBonus - debuffPenalty + skillModifier;

      return Math.max(0, totalAttack);
    }

    // Handle enemy attackers (simple fixed attack power)
    if (attacker.entityType === 'enemy') {
      const baseAttack = attacker.attackPower || attacker.enemyData?.attackPower || 5; // Default enemy attack
      return Math.max(0, baseAttack);
    }

    // Fallback for unknown attacker types
    console.warn('Unknown attacker type:', attacker);
    return 0;
  }

  // Calculate total defense for a defender
  calculateDefense(defender) {
    if (!defender.characterInfo) {
      console.warn('Defender has no characterInfo:', defender);
      return 0;
    }

    const baseDefense = defender.characterInfo.baseDefense;

    // Future: equipment bonuses, buffs, debuffs
    const equipmentBonus = this.getEquipmentDefenseBonus(defender);
    const buffBonus = this.getBuffDefenseBonus(defender);
    const debuffPenalty = this.getDebuffDefensePenalty(defender);

    const totalDefense = baseDefense + equipmentBonus + buffBonus - debuffPenalty;

    return Math.max(0, totalDefense);
  }

  // Calculate final damage from attacker to defender
  calculateDamage(attacker, defender, skillType) {
    const attackPower = this.calculateAttackPower(attacker, skillType);
    const defense = this.calculateDefense(defender);

      // Get skill info for damage modifier
      const skillInfo = window.skillTreeManager ? window.skillTreeManager.getSkillInfo(skillType) : null;
      if (skillType === 'basic_attack_medium') {
        console.log(`[DEBUG ATTACK_3] Skill tree manager lookup for ${skillType}:`, window.skillTreeManager ? 'EXISTS' : 'NULL');
        console.log(`[DEBUG ATTACK_3] Skill info for ${skillType}:`, skillInfo);
      }
      const skillModifier = skillInfo ? skillInfo.damageModifier || 0 : 0;

    // console.log(`[DAMAGE CALC] Attacker: ${attacker.characterInfo?.getDisplayName() || 'Unknown'}, Skill: ${skillType}`);
    // console.log(`[DAMAGE CALC] Attack Power: ${attackPower}, Defense: ${defense}, Skill Modifier: ${skillModifier}`);

    // Base damage = attack - defense (minimum 0)
    let damage = Math.max(0, attackPower - defense);
    // console.log(`[DAMAGE CALC] Base damage (attack-defense): ${damage}`);

    // Apply skill modifier as damage multiplier (not added to attack power)
    if (skillModifier > 0) {
      const originalDamage = damage;
      damage *= (1 + skillModifier); // skillModifier is percentage (e.g., 0.2 = +20%)
      // console.log(`[DAMAGE CALC] After skill modifier ${(skillModifier*100).toFixed(1)}%: ${originalDamage} → ${damage}`);
    }

    // Critical hit check
    const isCritical = this.checkCriticalHit(attacker);
    if (isCritical) {
      const originalDamage = damage;
      damage *= 2; // Double damage on crit
      // console.log(`[DAMAGE CALC] CRITICAL HIT: ${originalDamage} → ${damage}`);
    }

    // console.log(`[DAMAGE CALC] Final damage: ${damage}`);

    return {
      damage: damage,
      isCritical: isCritical,
      attackPower: attackPower,
      defense: defense,
      skillModifier: skillModifier
    };
  }

  // Check if attack is a critical hit
  checkCriticalHit(attacker) {
    // Players have critical chance from characterInfo
    if (attacker.characterInfo && attacker.characterInfo.criticalChance !== undefined) {
      const critChance = attacker.characterInfo.criticalChance / 100; // Convert percentage to decimal
      return Math.random() < critChance;
    }

    // Enemies have a small chance for critical hits
    if (attacker.entityType === 'enemy') {
      return Math.random() < 0.05; // 5% chance for enemy crits
    }

    return false;
  }

  // Equipment bonus methods
  getEquipmentAttackBonus(entity) {
    if (!entity.characterInfo) return 0;

    // Check for equipped weapon attack bonus
    const weaponBonus = entity.characterInfo.equippedWeapon?.attackBonus || 0;

    // Check for armor attack bonuses (some armor might give attack bonuses)
    const armorBonus = entity.characterInfo.equippedArmor?.attackBonus || 0;

    return weaponBonus + armorBonus;
  }

  getEquipmentDefenseBonus(entity) {
    if (!entity.characterInfo) return 0;

    // Check for equipped armor defense bonus
    const armorBonus = entity.characterInfo.equippedArmor?.defenseBonus || 0;

    // Check for shield defense bonus
    const shieldBonus = entity.characterInfo.equippedShield?.defenseBonus || 0;

    return armorBonus + shieldBonus;
  }

  // Buff bonus methods (temporary positive effects)
  getBuffAttackBonus(entity) {
    if (!entity.characterInfo) return 0;

    let totalBonus = 0;

    // Check active buffs
    if (entity.characterInfo.activeBuffs) {
      entity.characterInfo.activeBuffs.forEach(buff => {
        if (buff.type === 'attack' && buff.remainingTime > 0) {
          totalBonus += buff.value || 0;
        }
      });
    }

    return totalBonus;
  }

  getBuffDefenseBonus(entity) {
    if (!entity.characterInfo) return 0;

    let totalBonus = 0;

    // Check active buffs
    if (entity.characterInfo.activeBuffs) {
      entity.characterInfo.activeBuffs.forEach(buff => {
        if (buff.type === 'defense' && buff.remainingTime > 0) {
          totalBonus += buff.value || 0;
        }
      });
    }

    return totalBonus;
  }

  // Debuff penalty methods (temporary negative effects)
  getDebuffAttackPenalty(entity) {
    if (!entity.characterInfo) return 0;

    let totalPenalty = 0;

    // Check active debuffs
    if (entity.characterInfo.activeDebuffs) {
      entity.characterInfo.activeDebuffs.forEach(debuff => {
        if (debuff.type === 'attack' && debuff.remainingTime > 0) {
          totalPenalty += debuff.value || 0;
        }
      });
    }

    return totalPenalty;
  }

  getDebuffDefensePenalty(entity) {
    if (!entity.characterInfo) return 0;

    let totalPenalty = 0;

    // Check active debuffs
    if (entity.characterInfo.activeDebuffs) {
      entity.characterInfo.activeDebuffs.forEach(debuff => {
        if (debuff.type === 'defense' && debuff.remainingTime > 0) {
          totalPenalty += debuff.value || 0;
        }
      });
    }

    return totalPenalty;
  }
}

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
      // Enemy was defeated - start death sequence instead of immediate removal
      this.startEnemyDeathSequence(attacker, defender);
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
    console.log(`[COMBAT] ${attacker.characterInfo?.getDisplayName() || 'Unknown'} attacked ${defender.characterInfo?.getDisplayName() || 'Unknown'} with ${skillType}`);
    console.log(`[COMBAT] Attack Power: ${damageResult.attackPower}, Defense: ${damageResult.defense}, Damage: ${actualDamage}${damageResult.isCritical ? ' (CRITICAL!)' : ''}`);
    if (defenderDied) {
      console.log(`[COMBAT] ${defender.characterInfo?.getDisplayName() || 'Enemy'} was defeated!`);
    }

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

  // Handle enemy defeat
  handleEnemyDefeat(attacker, defeatedEnemy) {
    console.log(`[COMBAT] handleEnemyDefeat called with attacker:`, attacker, `defeatedEnemy:`, defeatedEnemy);

    console.log(`[COMBAT] Enemy defeated! ${attacker ? `Awarding experience to ${attacker.characterInfo?.getDisplayName() || 'Player'}` : 'Experience already awarded'}`);

    // Award experience to the attacker (only if attacker is provided)
    if (attacker && attacker.characterInfo) {
      const experienceReward = 200; // 200 XP for enemy defeat
      attacker.characterInfo.addExperience(experienceReward, attacker);
      console.log(`[COMBAT] ${attacker.characterInfo.getDisplayName()} gained ${experienceReward} experience!`);
    }

    // Remove enemy from the game world via game state
    this.removeEnemyFromGame(defeatedEnemy);

    // Trigger any post-defeat effects
    this.onEnemyDefeated(attacker, defeatedEnemy);
  }

  // Remove enemy from the game
  removeEnemyFromGame(defeatedEnemy) {
    console.log(`[COMBAT] Removing enemy from game world...`);

    // Remove from game state if available
    if (window.gameState) {
      const entityId = window.gameState.getEntityId(defeatedEnemy);
      if (entityId) {
        window.gameState.removeEntity(entityId);
        console.log(`[COMBAT] Enemy removed from game state (ID: ${entityId})`);
      }
    } else {
      // Fallback for backwards compatibility
      if (window.enemy === defeatedEnemy) {
        console.log(`[COMBAT] Setting window.enemy to null (legacy mode)`);
        window.enemy = null;
      }
    }

    console.log(`[COMBAT] Enemy removal complete`);
  }

  // Post-defeat effects and events
  onEnemyDefeated(attacker, defeatedEnemy) {
    // Future: trigger quest updates, loot drops, achievements, etc.
    console.log(`[COMBAT] Enemy defeat processing complete`);

    // For now, trigger respawn after a short delay
    setTimeout(() => {
      this.respawnEnemy();
    }, 2000); // 2 second delay before respawn
  }

  // Respawn enemy (for testing purposes)
  respawnEnemy() {
    console.log(`[COMBAT] Checking respawn conditions...`);

    // Check if we need to respawn (no enemies in game state or window.enemy is null)
    const shouldRespawn = window.gameState ?
      window.gameState.getEntitiesByType('enemy').length === 0 :
      window.enemy === null;

    if (shouldRespawn) {
      console.log(`[COMBAT] Respawning enemy...`);

      // Create new enemy
      const newEnemy = window.createEnemyWithData('basic', 1);

      // Register enemy with animation system (same as in main.js)
      if (window.animationSystem && window.animationSystem.isInitialized) {
        const enemyAnimation = window.animationSystem.registerEntity(newEnemy, 'enemy');
        console.log(`[COMBAT RESPAWN] Enemy registered with animation system:`, enemyAnimation ? 'SUCCESS' : 'FAILED');

        // Initialize FSM after animation is registered
        if (window.AnimationStateMachine) {
          newEnemy.stateMachine = new window.AnimationStateMachine(newEnemy);
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
      if (window.gameState) {
        window.gameState.addEntity(newEnemy, 'enemy');
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

  // Start enemy death sequence
  startEnemyDeathSequence(attacker, defeatedEnemy) {
    console.log(`[COMBAT] Starting enemy death sequence for ${defeatedEnemy.enemyData?.getDisplayName() || 'Enemy'}`);

    // Set enemy to dying state
    defeatedEnemy.isDying = true;
    defeatedEnemy.deathTimer = 0;
    defeatedEnemy.blinkCount = 0;
    defeatedEnemy.visible = true;

    // Award experience immediately
    const experienceReward = 200; // 200 XP for enemy defeat
    if (attacker.characterInfo) {
      attacker.characterInfo.addExperience(experienceReward, attacker);
      console.log(`[COMBAT] ${attacker.characterInfo.getDisplayName()} gained ${experienceReward} experience!`);
    }
  }

  // Update enemy death sequence (called from game loop)
  updateEnemyDeath(defeatedEnemy, dt) {
    if (!defeatedEnemy.isDying) return false;

    defeatedEnemy.deathTimer += dt;

    // 3 blinks total, each blink is 0.5 seconds (0.25 visible, 0.25 invisible)
    const blinkDuration = 0.5; // 0.5 seconds per blink
    const totalDeathTime = blinkDuration * 3; // 1.5 seconds total

    if (defeatedEnemy.deathTimer >= totalDeathTime && !defeatedEnemy.defeatHandled) {
      // Death animation complete - remove enemy (only once)
      defeatedEnemy.defeatHandled = true;
      this.handleEnemyDefeat(null, defeatedEnemy); // Pass null for attacker since rewards already given
      return true; // Enemy is dead and removed
    }

    // Calculate blink state
    const currentBlink = Math.floor(defeatedEnemy.deathTimer / blinkDuration);
    const timeInBlink = defeatedEnemy.deathTimer % blinkDuration;

    // Alternate visibility every 0.25 seconds within each blink
    defeatedEnemy.visible = (timeInBlink < 0.25);

    return false; // Enemy still dying
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

// Enemy Combat Manager for arcade-style RPG combat
// Manages enemy attack cooldowns and multi-enemy simultaneous attacks
class EnemyCombatManager {
  constructor() {
    this.enemyAttackCooldowns = new Map(); // enemy -> current cooldown time
    this.defaultAttackCooldown = 1.0; // 1 second between attacks per enemy
  }

  // Register an enemy for combat management
  registerEnemy(enemy) {
    this.enemyAttackCooldowns.set(enemy, 0);
    //console.log(`[ENEMY COMBAT] Registered enemy for combat:`, enemy);
  }

  // Unregister enemy (when defeated or removed)
  unregisterEnemy(enemy) {
    this.enemyAttackCooldowns.delete(enemy);
    //console.log(`[ENEMY COMBAT] Unregistered enemy from combat:`, enemy);
  }

  // Check if enemy can attack (cooldown expired)
  canEnemyAttack(enemy) {
    const cooldown = this.enemyAttackCooldowns.get(enemy);
    return cooldown !== undefined && cooldown <= 0;
  }

  // Perform enemy attack on player
  performEnemyAttack(enemy, player) {
    if (!this.canEnemyAttack(enemy)) {
      return false;
    }

    // Execute the attack
    const attackResult = window.combatResolver.resolveAttack(enemy, player, 'enemy_attack');

    // Set attack cooldown for this enemy
    this.enemyAttackCooldowns.set(enemy, this.defaultAttackCooldown);

    //console.log(`[ENEMY COMBAT] Enemy attacked player. Cooldown set to ${this.defaultAttackCooldown}s`);
    return attackResult !== null;
  }

  // Update all enemy attack cooldowns
  updateCooldowns(dt) {
    let updatedCount = 0;
    for (let [enemy, cooldown] of this.enemyAttackCooldowns) {
      if (cooldown > 0) {
        this.enemyAttackCooldowns.set(enemy, cooldown - dt);
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      console.log(`[ENEMY COMBAT] Updated ${updatedCount} enemy cooldowns`);
    }
  }

  // Get current cooldown for an enemy
  getEnemyCooldown(enemy) {
    return this.enemyAttackCooldowns.get(enemy) || 0;
  }

  // Force reset cooldown for an enemy (for testing or special cases)
  resetEnemyCooldown(enemy) {
    this.enemyAttackCooldowns.set(enemy, 0);
    //console.log(`[ENEMY COMBAT] Reset cooldown for enemy:`, enemy);
  }

  // Get all registered enemies
  getRegisteredEnemies() {
    return Array.from(this.enemyAttackCooldowns.keys());
  }

  // Get combat-ready enemies (cooldown <= 0)
  getReadyEnemies() {
    const ready = [];
    for (let [enemy, cooldown] of this.enemyAttackCooldowns) {
      if (cooldown <= 0) {
        ready.push(enemy);
      }
    }
    return ready;
  }
}

class DamageNumberManager {
  constructor() {
    this.activeNumbers = [];
    this.canvas = null;
  }

  init(canvas) {
    this.canvas = canvas;
  }

  // Add a damage number to display
  addDamageNumber(x, y, damage, isCritical = false) {
    if (!this.canvas) return;

    const number = {
      x: x,
      y: y,
      damage: damage,
      isCritical: isCritical,
      lifetime: 0,
      maxLifetime: 2.0, // seconds
      velocityY: -50, // pixels per second upward
      velocityX: (Math.random() - 0.5) * 20, // slight horizontal drift
      scale: isCritical ? 1.5 : 1.0
    };

    this.activeNumbers.push(number);
  }

  // Update all damage numbers
  update(dt) {
    this.activeNumbers = this.activeNumbers.filter(number => {
      number.lifetime += dt;
      number.y += number.velocityY * dt;
      number.x += number.velocityX * dt;

      // Fade out over time
      const fadeProgress = number.lifetime / number.maxLifetime;
      number.alpha = Math.max(0, 1 - fadeProgress);

      return number.lifetime < number.maxLifetime;
    });
  }

  // Render damage numbers
  render(ctx) {
    if (!ctx) return;

    this.activeNumbers.forEach(number => {
      ctx.save();

      // Set color based on damage type
      if (number.isCritical) {
        ctx.fillStyle = `rgba(255, 255, 0, ${number.alpha})`; // Yellow for crits
        ctx.strokeStyle = `rgba(255, 165, 0, ${number.alpha})`; // Orange outline
        ctx.lineWidth = 2;
      } else {
        ctx.fillStyle = `rgba(255, 0, 0, ${number.alpha})`; // Red for normal
        ctx.strokeStyle = `rgba(139, 0, 0, ${number.alpha})`; // Dark red outline
        ctx.lineWidth = 1;
      }

      ctx.font = `${32 * number.scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Draw text with outline for better visibility
      if (number.isCritical) {
        ctx.strokeText(number.damage.toString(), number.x, number.y);
      }
      ctx.fillText(number.damage.toString(), number.x, number.y);

      ctx.restore();
    });
  }
}

// Global combat system instances
window.combatCalculator = new CombatCalculator();
window.combatResolver = new CombatResolver();
window.enemyCombatManager = new EnemyCombatManager();
window.damageNumberManager = new DamageNumberManager();

// Export for use in other files
window.CombatCalculator = CombatCalculator;
window.CombatResolver = CombatResolver;
window.EnemyCombatManager = EnemyCombatManager;
window.DamageNumberManager = DamageNumberManager;
