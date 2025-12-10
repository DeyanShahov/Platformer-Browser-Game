// RPG Combat System for Platformer Game
// Handles damage calculation, combat resolution, and battle mechanics
// Works alongside the existing Skill System (timers, cooldowns, resources)

class CombatCalculator {
  constructor() {
    // Skill damage modifiers (separate from skill activation mechanics)
    this.skillModifiers = {
      [ACTION_TYPES.BASIC_ATTACK_LIGHT]: 1,
      [ACTION_TYPES.BASIC_ATTACK_MEDIUM]: 3,
      [ACTION_TYPES.BASIC_ATTACK_HEAVY]: 5,
      [ACTION_TYPES.SECONDARY_ATTACK_LIGHT]: 3,
      [ACTION_TYPES.SECONDARY_ATTACK_MEDIUM]: 6,
      [ACTION_TYPES.SECONDARY_ATTACK_HEAVY]: 9
    };
  }

  // Calculate total attack power for an attacker
  calculateAttackPower(attacker, skillType) {
    if (!attacker.characterInfo) {
      console.warn('Attacker has no characterInfo:', attacker);
      return 0;
    }

    const baseAttack = attacker.characterInfo.baseAttack;
    const strength = attacker.characterInfo.strength;

    // Future: equipment bonuses, buffs, debuffs
    const equipmentBonus = this.getEquipmentAttackBonus(attacker);
    const buffBonus = this.getBuffAttackBonus(attacker);
    const debuffPenalty = this.getDebuffAttackPenalty(attacker);

    const skillModifier = this.skillModifiers[skillType] || 0;

    const totalAttack = baseAttack + strength + equipmentBonus + buffBonus - debuffPenalty + skillModifier;

    return Math.max(0, totalAttack);
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

    // Base damage = attack - defense (minimum 0)
    let damage = Math.max(0, attackPower - defense);

    // Critical hit check
    const isCritical = this.checkCriticalHit(attacker);
    if (isCritical) {
      damage *= 2; // Double damage on crit
    }

    return {
      damage: damage,
      isCritical: isCritical,
      attackPower: attackPower,
      defense: defense,
      skillModifier: this.skillModifiers[skillType] || 0
    };
  }

  // Check if attack is a critical hit
  checkCriticalHit(attacker) {
    if (!attacker.characterInfo) return false;

    const critChance = attacker.characterInfo.criticalChance / 100; // Convert percentage to decimal
    return Math.random() < critChance;
  }

  // Placeholder methods for future systems
  getEquipmentAttackBonus(entity) {
    // Future: sum bonuses from equipped weapons, etc.
    return 0;
  }

  getBuffAttackBonus(entity) {
    // Future: temporary attack buffs
    return 0;
  }

  getDebuffAttackPenalty(entity) {
    // Future: temporary attack debuffs
    return 0;
  }

  getEquipmentDefenseBonus(entity) {
    // Future: sum bonuses from equipped armor, etc.
    return 0;
  }

  getBuffDefenseBonus(entity) {
    // Future: temporary defense buffs
    return 0;
  }

  getDebuffDefensePenalty(entity) {
    // Future: temporary defense debuffs
    return 0;
  }
}

class CombatResolver {
  constructor() {
    this.combatCalculator = new CombatCalculator();
    this.combatLog = [];
    this.maxLogEntries = 50;
  }

  // Resolve an attack from attacker to defender
  resolveAttack(attacker, defender, skillType) {
    if (!defender) {
      console.warn('No defender for attack resolution');
      return null;
    }

    // Calculate damage using the combat calculator
    const damageResult = this.combatCalculator.calculateDamage(attacker, defender, skillType);

    // Apply damage to defender
    const actualDamage = this.applyDamage(defender, damageResult.damage);

    // Check for enemy defeat
    const defenderDied = defender.health <= 0;
    if (defenderDied && defender === enemy && !defender.isDying) {
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

  // Placeholder for UI notifications
  notifyCombatLogUpdate(event) {
    // Future: trigger UI updates, damage numbers, etc.
    // For now, just console logging is handled above
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

      ctx.font = `${16 * number.scale}px Arial`;
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
window.damageNumberManager = new DamageNumberManager();

// Export for use in other files
window.CombatCalculator = CombatCalculator;
window.CombatResolver = CombatResolver;
window.DamageNumberManager = DamageNumberManager;
