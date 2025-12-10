// Skill Tree System for Platformer Game
// Manages skill unlocking, prerequisites, and resource requirements

// Skill type constants
const SKILL_TYPES = {
  BASIC_ATTACK_LIGHT: 'basic_attack_light',
  BASIC_ATTACK_MEDIUM: 'basic_attack_medium',
  BASIC_ATTACK_HEAVY: 'basic_attack_heavy',

  SECONDARY_ATTACK_LIGHT: 'secondary_attack_light',
  SECONDARY_ATTACK_MEDIUM: 'secondary_attack_medium',
  SECONDARY_ATTACK_HEAVY: 'secondary_attack_heavy',

  // Passive skills
  ENHANCED_ATTACK: 'enhanced_attack',

  // Test skills for large grid (6x5 = 30 total)
  // Row 1
  SKILL_01_01: 'skill_01_01', SKILL_01_02: 'skill_01_02', SKILL_01_03: 'skill_01_03', SKILL_01_04: 'skill_01_04', SKILL_01_05: 'skill_01_05',
  // Row 2
  SKILL_02_01: 'skill_02_01', SKILL_02_02: 'skill_02_02', SKILL_02_03: 'skill_02_03', SKILL_02_04: 'skill_02_04', SKILL_02_05: 'skill_02_05',
  // Row 3
  SKILL_03_01: 'skill_03_01', SKILL_03_02: 'skill_03_02', SKILL_03_03: 'skill_03_03', SKILL_03_04: 'skill_03_04', SKILL_03_05: 'skill_03_05',
  // Row 4
  SKILL_04_01: 'skill_04_01', SKILL_04_02: 'skill_04_02', SKILL_04_03: 'skill_04_03', SKILL_04_04: 'skill_04_04', SKILL_04_05: 'skill_04_05',
  // Row 5
  SKILL_05_01: 'skill_05_01', SKILL_05_02: 'skill_05_02', SKILL_05_03: 'skill_05_03', SKILL_05_04: 'skill_05_04', SKILL_05_05: 'skill_05_05',
  // Row 6
  SKILL_06_01: 'skill_06_01', SKILL_06_02: 'skill_06_02', SKILL_06_03: 'skill_06_03', SKILL_06_04: 'skill_06_04', SKILL_06_05: 'skill_06_05'
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
  },

  // Passive skills
  [SKILL_TYPES.ENHANCED_ATTACK]: {
    name: 'Засилена атака',
    description: 'Перманентно увеличава основната атака',
    passiveEffect: { stat: 'baseAttack', value: 2 }, // Пасивен ефект (старият формат за обратна съвместимост)
    unlocked: false,
    prerequisites: [],
    skillPointsCost: 1,
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 3,  // Спрайт шит позиция 3-6
    iconCol: 6,

    // Нова leveling система
    maxLevel: 3,  // Максимум 3 нива
    levelCosts: [1, 1, 2],  // Level 1: 1pt, Level 2: 1pt, Level 3: 2pt
    levelEffects: [
      { stat: 'baseAttack', value: 2, description: '+2 атака' },    // Level 1
      { stat: 'baseAttack', value: 3, description: '+3 атака' },    // Level 2 (допълнително)
      { stat: 'baseAttack', value: 10, description: '+10 атака' }   // Level 3 (допълнително)
    ]
  },

  // Test placeholder skills for large grid
  // Row 1
  [SKILL_TYPES.SKILL_01_01]: { name: 'Test 1-1', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_01_02]: { name: 'Test 1-2', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_01_04]: { name: 'Test 1-4', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_01_05]: { name: 'Test 1-5', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },

  // Row 2
  [SKILL_TYPES.SKILL_02_03]: { name: 'Test 2-3', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_02_04]: { name: 'Test 2-4', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_02_05]: { name: 'Test 2-5', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },

  // Row 3
  [SKILL_TYPES.SKILL_03_03]: { name: 'Test 3-3', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_03_04]: { name: 'Test 3-4', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_03_05]: { name: 'Test 3-5', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },

  // Row 4
  [SKILL_TYPES.SKILL_04_01]: { name: 'Test 4-1', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_04_02]: { name: 'Test 4-2', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_04_03]: { name: 'Test 4-3', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_04_04]: { name: 'Test 4-4', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_04_05]: { name: 'Test 4-5', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },

  // Row 5
  [SKILL_TYPES.SKILL_05_01]: { name: 'Test 5-1', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_05_02]: { name: 'Test 5-2', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_05_03]: { name: 'Test 5-3', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_05_04]: { name: 'Test 5-4', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_05_05]: { name: 'Test 5-5', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },

  // Row 6
  [SKILL_TYPES.SKILL_06_01]: { name: 'Test 6-1', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_06_02]: { name: 'Test 6-2', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_06_03]: { name: 'Test 6-3', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_06_04]: { name: 'Test 6-4', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_06_05]: { name: 'Test 6-5', description: 'Placeholder skill', unlocked: false, prerequisites: [], skillPointsCost: 0, resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 }
};

// Skill Tree Manager Class
class SkillTreeManager {
  constructor() {
    this.skillTree = SKILL_TREE;
    this.skillTypes = SKILL_TYPES;
    this.resourceTypes = RESOURCE_TYPES;
  }

  // Check if a skill can be unlocked/upgraded
  canUnlockSkill(player, skillType) {
    const skill = this.skillTree[skillType];
    if (!skill) return false;

    // For leveling skills, check if can upgrade to next level
    if (skill.maxLevel && skill.levelCosts) {
      const currentLevel = player.skillLevels.get(skillType) || 0;
      if (currentLevel >= skill.maxLevel) return false; // Max level reached

      const nextLevelCost = skill.levelCosts[currentLevel];
      if (player.skillPoints < nextLevelCost) return false;

      // Check prerequisites (only for level 1)
      if (currentLevel === 0) {
        for (const prereq of skill.prerequisites) {
          if (!player.unlockedSkills.has(prereq)) return false;
        }
      }

      return true;
    }

    // Legacy unlock logic for non-leveling skills
    if (player.unlockedSkills.has(skillType)) return false;
    if (player.skillPoints < skill.skillPointsCost) return false;

    for (const prereq of skill.prerequisites) {
      if (!player.unlockedSkills.has(prereq)) return false;
    }

    return true;
  }

  // Unlock/upgrade a skill for a player
  unlockSkill(player, skillType) {
    if (!this.canUnlockSkill(player, skillType)) return false;

    const skill = this.skillTree[skillType];

    // Handle leveling skills
    if (skill.maxLevel && skill.levelCosts) {
      const currentLevel = player.skillLevels.get(skillType) || 0;
      const nextLevelCost = skill.levelCosts[currentLevel];

      player.skillPoints -= nextLevelCost;
      player.skillLevels.set(skillType, currentLevel + 1);

      // Mark as unlocked for backwards compatibility
      player.unlockedSkills.add(skillType);

      // Apply level effect if exists
      if (skill.levelEffects && skill.levelEffects[currentLevel]) {
        this.applyPassiveEffect(player, skill.levelEffects[currentLevel]);
      }

      console.log(`Player upgraded ${skill.name} to level ${currentLevel + 1}`);
      return true;
    }

    // Legacy unlock logic
    player.skillPoints -= skill.skillPointsCost;
    player.unlockedSkills.add(skillType);

    if (skill.passiveEffect) {
      this.applyPassiveEffect(player, skill.passiveEffect);
    }

    console.log(`Player unlocked skill: ${skill.name}`);
    return true;
  }

  // Get current level of a skill
  getSkillLevel(player, skillType) {
    return player.skillLevels.get(skillType) || 0;
  }

  // Get next level cost for a skill
  getNextLevelCost(skillType, currentLevel) {
    const skill = this.skillTree[skillType];
    if (!skill || !skill.levelCosts || currentLevel >= skill.maxLevel) return null;
    return skill.levelCosts[currentLevel];
  }

  // Get skill upgrade info for UI
  getSkillUpgradeInfo(player, skillType) {
    const skill = this.skillTree[skillType];
    if (!skill) return null;

    const currentLevel = this.getSkillLevel(player, skillType);
    const maxLevel = skill.maxLevel || 1;
    const canUpgrade = currentLevel < maxLevel && this.canUnlockSkill(player, skillType);

    let nextLevelCost = null;
    let nextLevelEffect = null;

    if (canUpgrade) {
      nextLevelCost = this.getNextLevelCost(skillType, currentLevel);
      if (skill.levelEffects && skill.levelEffects[currentLevel]) {
        nextLevelEffect = skill.levelEffects[currentLevel].description;
      }
    }

    return {
      currentLevel,
      maxLevel,
      canUpgrade,
      nextLevelCost,
      nextLevelEffect
    };
  }

  // Apply passive effect to player
  applyPassiveEffect(player, effect) {
    if (effect.stat && typeof effect.value === 'number') {
      const oldValue = player[effect.stat] || 0;
      player[effect.stat] += effect.value;
      console.log(`Applied passive effect: ${effect.stat} ${oldValue} -> ${player[effect.stat]} (+${effect.value})`);
    }
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
