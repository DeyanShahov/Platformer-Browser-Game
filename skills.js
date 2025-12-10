// Skill Tree System for Platformer Game
// Manages skill unlocking, prerequisites, and resource requirements

// Skill type constants
const SKILL_TYPES = {
  BASIC_ATTACK_LIGHT: 'basic_attack_light',
  BASIC_ATTACK_MEDIUM: 'basic_attack_medium',
  BASIC_ATTACK_HEAVY: 'basic_attack_heavy',

  SECONDARY_ATTACK_LIGHT: 'secondary_attack_light',
  SECONDARY_ATTACK_MEDIUM: 'secondary_attack_medium',
  SECONDARY_ATTACK_HEAVY: 'secondary_attack_heavy'
};

// Resource types for skills
const RESOURCE_TYPES = {
  NONE: 'none',
  MANA: 'mana',
  ENERGY: 'energy'
};

// Damage types for skills
const DAMAGE_TYPES = {
  PHYSICAL: 'physical',
  MAGICAL: 'magical',
  SPECIAL: 'special'
};

// Range types for skills
const RANGE_TYPES = {
  MELEE: 'melee',
  RANGE: 'range'
};

// Target types for skills
const TARGET_TYPES = {
  SINGLE_TARGET: 'singletarget',
  AOE: 'aoe'
};

// Skill tree definition with prerequisites, resource costs, and icon coordinates
const SKILL_TREE = {
  [SKILL_TYPES.BASIC_ATTACK_LIGHT]: {
    name: 'Лека основна атака',
    description: 'Бърза лека атака без ресурсни изисквания',
    damageModifier: 1,           // Сила на атаката
    damageType: DAMAGE_TYPES.PHYSICAL,      // physical/magical/special
    rangeType: RANGE_TYPES.MELEE,          // melee/range
    targetType: TARGET_TYPES.SINGLE_TARGET, // singletarget/aoe
    unlocked: true, // Always available
    prerequisites: [],
    skillPointsCost: 0,
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 5,  // Row in sprite sheet (1-5)
    iconCol: 6   // Column in sprite sheet (1-10)
  },
  [SKILL_TYPES.BASIC_ATTACK_MEDIUM]: {
    name: 'Средна основна атака',
    description: 'Средна атака, изисква 10 мана',
    damageModifier: 3,           // Сила на атаката
    damageType: DAMAGE_TYPES.PHYSICAL,      // physical/magical/special
    rangeType: RANGE_TYPES.MELEE,          // melee/range
    targetType: TARGET_TYPES.SINGLE_TARGET, // singletarget/aoe
    unlocked: false,
    prerequisites: [SKILL_TYPES.BASIC_ATTACK_LIGHT],
    skillPointsCost: 1,
    resourceType: RESOURCE_TYPES.MANA,
    resourceCost: 10,
    iconRow: 5,
    iconCol: 5
  },
  [SKILL_TYPES.BASIC_ATTACK_HEAVY]: {
    name: 'Тежка основна атака',
    description: 'Мощна тежка атака, изисква 20 енергия',
    damageModifier: 5,           // Сила на атаката
    damageType: DAMAGE_TYPES.PHYSICAL,      // physical/magical/special
    rangeType: RANGE_TYPES.MELEE,          // melee/range
    targetType: TARGET_TYPES.SINGLE_TARGET, // singletarget/aoe
    unlocked: false,
    prerequisites: [SKILL_TYPES.BASIC_ATTACK_MEDIUM],
    skillPointsCost: 1,
    resourceType: RESOURCE_TYPES.ENERGY,
    resourceCost: 20,
    iconRow: 5,
    iconCol: 3
  },
  [SKILL_TYPES.SECONDARY_ATTACK_LIGHT]: {
    name: 'Лека допълнителна атака',
    description: 'Бърза допълнителна атака без ресурсни изисквания',
    damageModifier: 3,           // Сила на атаката
    damageType: DAMAGE_TYPES.PHYSICAL,      // physical/magical/special
    rangeType: RANGE_TYPES.MELEE,          // melee/range
    targetType: TARGET_TYPES.SINGLE_TARGET, // singletarget/aoe
    unlocked: true, // Always available
    prerequisites: [],
    skillPointsCost: 0,
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 3,
    iconCol: 2
  },
  [SKILL_TYPES.SECONDARY_ATTACK_MEDIUM]: {
    name: 'Средна допълнителна атака',
    description: 'Средна допълнителна атака, изисква 10 мана',
    damageModifier: 6,           // Сила на атаката
    damageType: DAMAGE_TYPES.PHYSICAL,      // physical/magical/special
    rangeType: RANGE_TYPES.MELEE,          // melee/range
    targetType: TARGET_TYPES.SINGLE_TARGET, // singletarget/aoe
    unlocked: false,
    prerequisites: [SKILL_TYPES.SECONDARY_ATTACK_LIGHT],
    skillPointsCost: 1,
    resourceType: RESOURCE_TYPES.MANA,
    resourceCost: 10,
    iconRow: 3,
    iconCol: 1
  },
  [SKILL_TYPES.SECONDARY_ATTACK_HEAVY]: {
    name: 'Тежка допълнителна атака',
    description: 'Мощна тежка допълнителна атака, изисква 20 енергия',
    damageModifier: 9,           // Сила на атаката
    damageType: DAMAGE_TYPES.PHYSICAL,      // physical/magical/special
    rangeType: RANGE_TYPES.MELEE,          // melee/range
    targetType: TARGET_TYPES.SINGLE_TARGET, // singletarget/aoe
    unlocked: false,
    prerequisites: [SKILL_TYPES.SECONDARY_ATTACK_MEDIUM],
    skillPointsCost: 1,
    resourceType: RESOURCE_TYPES.ENERGY,
    resourceCost: 20,
    iconRow: 3,
    iconCol: 3
  }
};

// Skill Tree Manager Class
class SkillTreeManager {
  constructor() {
    this.skillTree = SKILL_TREE;
    this.skillTypes = SKILL_TYPES;
    this.resourceTypes = RESOURCE_TYPES;
  }

  // Check if a skill can be unlocked
  canUnlockSkill(player, skillType) {
    const skill = this.skillTree[skillType];
    if (!skill) return false;

    // Check if already unlocked
    if (player.unlockedSkills.has(skillType)) return false;

    // Check skill points
    if (player.skillPoints < skill.skillPointsCost) return false;

    // Check prerequisites
    for (const prereq of skill.prerequisites) {
      if (!player.unlockedSkills.has(prereq)) return false;
    }

    return true;
  }

  // Unlock a skill for a player
  unlockSkill(player, skillType) {
    if (!this.canUnlockSkill(player, skillType)) return false;

    const skill = this.skillTree[skillType];
    player.skillPoints -= skill.skillPointsCost;
    player.unlockedSkills.add(skillType);

    console.log(`Player unlocked skill: ${skill.name}`);
    return true;
  }

  // Check if player has a skill unlocked
  hasSkill(player, skillType) {
    return player.unlockedSkills.has(skillType);
  }

  // Check if player can perform action (skill unlocked + resources)
  canPerformActionWithResources(player, actionType) {
    // First check if skill is unlocked
    if (!this.hasSkill(player, actionType)) return false;

    // Check resource requirements
    const skill = this.skillTree[actionType];
    if (skill.resourceType === RESOURCE_TYPES.NONE) return true;

    if (skill.resourceType === RESOURCE_TYPES.MANA) {
      return player.mana >= skill.resourceCost;
    }

    if (skill.resourceType === RESOURCE_TYPES.ENERGY) {
      return player.energy >= skill.resourceCost;
    }

    return false;
  }

  // Consume resources for action
  consumeResources(player, actionType) {
    const skill = this.skillTree[actionType];
    if (skill.resourceType === RESOURCE_TYPES.NONE) return true;

    if (skill.resourceType === RESOURCE_TYPES.MANA) {
      if (player.mana >= skill.resourceCost) {
        player.mana -= skill.resourceCost;
        return true;
      }
    }

    if (skill.resourceType === RESOURCE_TYPES.ENERGY) {
      if (player.energy >= skill.resourceCost) {
        player.energy -= skill.resourceCost;
        return true;
      }
    }

    return false;
  }

  // Add skill points to player
  addSkillPoints(player, amount) {
    player.skillPoints += amount;
    console.log(`Player gained ${amount} skill points. Total: ${player.skillPoints}`);
  }

  // Get skill info for UI
  getSkillInfo(skillType) {
    return this.skillTree[skillType];
  }

  // Get all skills
  getAllSkills() {
    return Object.keys(this.skillTree);
  }
}

// Global skill tree manager instance
window.skillTreeManager = new SkillTreeManager();

// Export for use in other files
window.SKILL_TYPES = SKILL_TYPES;
window.RESOURCE_TYPES = RESOURCE_TYPES;
window.DAMAGE_TYPES = DAMAGE_TYPES;
window.RANGE_TYPES = RANGE_TYPES;
window.TARGET_TYPES = TARGET_TYPES;
window.SKILL_TREE = SKILL_TREE;
