// ===========================================
// SKILL TREE SYSTEM LOGIC
// Manages skill unlocking and leveling logic
// Static data is imported from data/skill-data.js
// ===========================================

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
        if (!this.checkPrerequisites(player, skillType)) return false;
      }

      return true;
    }

    // Legacy unlock logic for non-leveling skills
    if (player.unlockedSkills.has(skillType)) return false;
    const unlockCost = skill.levelCosts ? skill.levelCosts[0] : 0;
    if (player.skillPoints < unlockCost) return false;

    if (!this.checkPrerequisites(player, skillType)) return false;

    return true;
  }

  // Check prerequisites including special level requirements
  checkPrerequisites(player, skillType) {
    const skill = this.skillTree[skillType];

    for (const prereq of skill.prerequisites) {
      // Check if prerequisite skill is unlocked
      if (!player.unlockedSkills.has(prereq)) return false;

      // Special level requirements
      if (prereq === SKILL_TYPES.ENHANCED_ATTACK) {
        const enhancedLevel = player.skillLevels.get(SKILL_TYPES.ENHANCED_ATTACK) || 0;
        // STRONG_ATTACK requires ENHANCED_ATTACK level 2+
        if (skillType === SKILL_TYPES.STRONG_ATTACK && enhancedLevel < 2) return false;
      }
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

    // Legacy unlock logic for non-leveling skills
    const unlockCost = skill.levelCosts ? skill.levelCosts[0] : 0;
    player.skillPoints -= unlockCost;
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
