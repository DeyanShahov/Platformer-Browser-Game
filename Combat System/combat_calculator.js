// Combat Calculator - moved from combat_system.js
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

// Export globally for traditional JavaScript approach
window.CombatCalculator = CombatCalculator;
