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

    // Unified logic for all skills (both single-level and multi-level)
    if (skill.maxLevel && skill.levelCosts) {
      const currentLevel = player.skillLevels.get(skillType) || 0;
      if (currentLevel >= skill.maxLevel) return false; // Max level reached

      const nextLevelCost = skill.levelCosts[currentLevel];
      if (player.skillPoints < nextLevelCost) return false;

      // Check prerequisites (only for level 1 - unlocking)
      if (currentLevel === 0) {
        if (!this.checkPrerequisites(player, skillType)) return false;
      }

      return true;
    }

    console.error(`Skill ${skillType} is missing maxLevel or levelCosts!`);
    return false;
  }

  // Check prerequisites using data-driven approach
  checkPrerequisites(player, skillType) {
    const skill = this.skillTree[skillType];

    for (const prereq of skill.prerequisites) {
      switch (prereq.type) {
        case "skill_level":
          // Check if prerequisite skill is unlocked and at required level
          if (!player.unlockedSkills.has(prereq.skill)) return false;
          const currentLevel = player.skillLevels.get(prereq.skill) || 0;
          if (currentLevel < prereq.level) return false;
          break;

        // Future prerequisite types can be added here
        case "player_level":
          if (player.level < prereq.level) return false;
          break;

        case "quest_completed":
          // Check if quest is completed (placeholder for future implementation)
          if (!player.completedQuests?.has(prereq.questId)) return false;
          break;

        case "achievement_unlocked":
          // Check if achievement is unlocked (placeholder for future implementation)
          if (!player.unlockedAchievements?.has(prereq.achievementId)) return false;
          break;

        default:
          console.warn(`Unknown prerequisite type: ${prereq.type}`);
          return false;
      }
    }

    return true;
  }

  // Unlock/upgrade a skill for a player
  unlockSkill(player, skillType) {
    if (!this.canUnlockSkill(player, skillType)) return false;

    const skill = this.skillTree[skillType];

    // Unified logic for all skills (both single-level and multi-level)
    if (skill.maxLevel && skill.levelCosts) {
      const currentLevel = player.skillLevels.get(skillType) || 0;
      const nextLevelCost = skill.levelCosts[currentLevel];

      player.skillPoints -= nextLevelCost;
      player.skillLevels.set(skillType, currentLevel + 1);

      // Mark as unlocked for backwards compatibility
      player.unlockedSkills.add(skillType);

      // Apply level effects (support both single effect and array of effects)
      if (skill.levelEffects && skill.levelEffects[currentLevel]) {
        const levelEffects = skill.levelEffects[currentLevel];

        // Check if level has multiple effects (array) or single effect
        if (Array.isArray(levelEffects)) {
          // Multiple effects per level
          levelEffects.forEach(effect => {
            this.applyPassiveEffect(player, effect);
          });
        } else {
          // Single effect (backwards compatibility)
          this.applyPassiveEffect(player, levelEffects);
        }
      }

      console.log(`Player ${currentLevel === 0 ? 'unlocked' : 'upgraded'} ${skill.name} to level ${currentLevel + 1}`);
      return true;
    }

    console.error(`Skill ${skillType} is missing maxLevel or levelCosts!`);
    return false;
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
        const levelEffects = skill.levelEffects[currentLevel];
        if (Array.isArray(levelEffects)) {
          // Multiple effects - show count and first effect description
          nextLevelEffect = `${levelEffects.length} effects (${levelEffects[0].description})`;
        } else {
          // Single effect - show description directly
          nextLevelEffect = levelEffects.description;
        }
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
      // Support nested properties with dot notation (e.g., 'characterInfo.baseDefense')
      const statPath = effect.stat.split('.');
      let target = player;
      let currentPath = '';

      // Navigate to the nested property
      for (let i = 0; i < statPath.length - 1; i++) {
        currentPath += (currentPath ? '.' : '') + statPath[i];
        if (!target[statPath[i]]) {
          console.error(`Cannot access nested property ${currentPath} on player`);
          return;
        }
        target = target[statPath[i]];
      }

      const finalProp = statPath[statPath.length - 1];
      const oldValue = target[finalProp] || 0;
      target[finalProp] += effect.value;

      console.log(`Applied passive effect: ${effect.stat} ${oldValue} -> ${target[finalProp]} (+${effect.value})`);
    }
  }

  // Check if player has a skill unlocked
  hasSkill(player, skillType) {
    return player.unlockedSkills.has(skillType);
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

// ===========================================
// MICRO SKILL TREE PROGRESSION SYSTEMS - moved from micro_skill_tree.js
// ===========================================

class OnePerRowSystem {
  canSelectMicroSkill(player, parentSkillType, skillIndex, microTree, manager) {
    const row = Math.floor(skillIndex / 3);

    // Check if row is unlocked (previous rows must have selected skills)
    if (!this.isRowUnlocked(player, parentSkillType, row, manager)) {
      return false;
    }

    // Check if player has enough skill points (1 point per skill)
    if (player.skillPoints < 1) {
      return false;
    }

    // Check if skill slot is already taken in this row
    const selectedSkills = manager.getSelectedMicroSkillsForPlayer(player, parentSkillType);
    const rowStart = row * 3;
    const rowEnd = rowStart + 3;

    for (let i = rowStart; i < rowEnd; i++) {
      if (selectedSkills.has(i)) return false;
    }

    return true;
  }

  selectMicroSkill(player, parentSkillType, skillIndex, microTree, manager) {
    // Spend 1 skill point
    player.skillPoints -= 1;

    // Add to selected skills
    const selectedSkills = manager.getSelectedMicroSkillsForPlayer(player, parentSkillType);
    selectedSkills.add(skillIndex);

    // Apply effect to parent skill
    this.applyMicroSkillEffect(player, parentSkillType, skillIndex, microTree);

    return true;
  }

  isRowUnlocked(player, parentSkillType, row, manager) {
    if (row === 0) return true; // First row always unlocked

    const selectedSkills = manager.getSelectedMicroSkillsForPlayer(player, parentSkillType);
    const prevRowStart = (row - 1) * 3;
    const prevRowEnd = prevRowStart + 3;

    // Check if any skill from previous row is selected
    for (let i = prevRowStart; i < prevRowEnd; i++) {
      if (selectedSkills.has(i)) return true;
    }

    return false;
  }

  applyMicroSkillEffect(player, parentSkillType, skillIndex, microTree) {
    const microSkills = microTree.skills;
    const microSkillType = microSkills[skillIndex];
    const microSkill = SKILL_TREE[microSkillType];

    if (microSkill && microSkill.levelEffects && microSkill.levelEffects[0]) {
      const effects = microSkill.levelEffects[0];
      const effectArray = Array.isArray(effects) ? effects : [effects];

      effectArray.forEach(effect => {
        if (effect.stat && effect.stat.startsWith('parentSkill.')) {
          // Apply to parent skill modifiers
          const modifierKey = effect.stat.replace('parentSkill.', '');
          const parentSkill = SKILL_TREE[parentSkillType];

          if (parentSkill[modifierKey] !== undefined) {
            parentSkill[modifierKey] += effect.value;
            console.log(`Applied micro skill effect: ${parentSkill.name}.${modifierKey} += ${effect.value}`);
          }
        }
      });
    }
  }
}

class LevelBasedSystem {
  canSelectMicroSkill(player, parentSkillType, skillIndex, microTree, manager) {
    // Skills unlock at specific player levels, no skill points needed
    const requiredLevel = this.getRequiredLevelForSkill(skillIndex);
    return player.level >= requiredLevel;
  }

  selectMicroSkill(player, parentSkillType, skillIndex, microTree, manager) {
    // Add to selected skills (no skill point cost)
    const selectedSkills = manager.getSelectedMicroSkillsForPlayer(player, parentSkillType);
    selectedSkills.add(skillIndex);

    // Apply effect to parent skill
    this.applyMicroSkillEffect(player, parentSkillType, skillIndex, microTree);

    return true;
  }

  getRequiredLevelForSkill(skillIndex) {
    // Row 0: Level 3, Row 1: Level 5, Row 2: Level 7, Row 3: Level 10
    const row = Math.floor(skillIndex / 3);
    const levelRequirements = [3, 5, 7, 10];
    return levelRequirements[row] || 1;
  }

  applyMicroSkillEffect(player, parentSkillType, skillIndex, microTree) {
    // Same as OnePerRowSystem
    const onePerRow = new OnePerRowSystem();
    onePerRow.applyMicroSkillEffect(player, parentSkillType, skillIndex, microTree);
  }
}

class AbsoluteSystem {
  canSelectMicroSkill(player, parentSkillType, skillIndex, microTree, manager) {
    // Can learn all skills by spending 1 point each, no row restrictions
    return player.skillPoints >= 1;
  }

  selectMicroSkill(player, parentSkillType, skillIndex, microTree, manager) {
    // Spend 1 skill point
    player.skillPoints -= 1;

    // Add to selected skills
    const selectedSkills = manager.getSelectedMicroSkillsForPlayer(player, parentSkillType);
    selectedSkills.add(skillIndex);

    // Apply effect to parent skill
    this.applyMicroSkillEffect(player, parentSkillType, skillIndex, microTree);

    return true;
  }

  applyMicroSkillEffect(player, parentSkillType, skillIndex, microTree) {
    // Same as OnePerRowSystem
    const onePerRow = new OnePerRowSystem();
    onePerRow.applyMicroSkillEffect(player, parentSkillType, skillIndex, microTree);
  }
}

class InstantSystem {
  canSelectMicroSkill(player, parentSkillType, skillIndex, microTree, manager) {
    const row = Math.floor(skillIndex / 3);

    // Check if row is unlocked (previous rows must have selected skills)
    if (!this.isRowUnlocked(player, parentSkillType, row, manager)) {
      return false;
    }

    // Check if skill slot is already taken in this row (no skill point cost)
    const selectedSkills = manager.getSelectedMicroSkillsForPlayer(player, parentSkillType);
    const rowStart = row * 3;
    const rowEnd = rowStart + 3;

    for (let i = rowStart; i < rowEnd; i++) {
      if (selectedSkills.has(i)) return false;
    }

    return true;
  }

  selectMicroSkill(player, parentSkillType, skillIndex, microTree, manager) {
    // Add to selected skills (no skill point cost)
    const selectedSkills = manager.getSelectedMicroSkillsForPlayer(player, parentSkillType);
    selectedSkills.add(skillIndex);

    // Apply effect to parent skill
    this.applyMicroSkillEffect(player, parentSkillType, skillIndex, microTree);

    return true;
  }

  isRowUnlocked(player, parentSkillType, row, manager) {
    if (row === 0) return true; // First row always unlocked

    const selectedSkills = manager.getSelectedMicroSkillsForPlayer(player, parentSkillType);
    const prevRowStart = (row - 1) * 3;
    const prevRowEnd = prevRowStart + 3;

    // Check if any skill from previous row is selected
    for (let i = prevRowStart; i < prevRowEnd; i++) {
      if (selectedSkills.has(i)) return true;
    }

    return false;
  }

  applyMicroSkillEffect(player, parentSkillType, skillIndex, microTree) {
    // Same as OnePerRowSystem
    const onePerRow = new OnePerRowSystem();
    onePerRow.applyMicroSkillEffect(player, parentSkillType, skillIndex, microTree);
  }
}

// ===========================================
// MICRO SKILL TREE SYSTEM - moved from micro_skill_tree.js
// Completely separate from main skill tree system
// ===========================================

class MicroSkillTreeManager {
  constructor() {
    // Initialize progression systems
    this.progressionSystems = {
      'one_per_row': new OnePerRowSystem(),
      'level_based': new LevelBasedSystem(),
      'absolute': new AbsoluteSystem(),
      'instant': new InstantSystem()
    };
  }

  // Initialize micro skill tracking for a player
  initializePlayerMicroSkills(player) {
    if (!player.selectedMicroSkills) {
      player.selectedMicroSkills = new Map();
    }
  }

  // Check if a micro skill can be selected (delegates to progression system)
  canSelectMicroSkill(playerIndex, parentSkillType, skillIndex) {
    const microTree = SKILL_TREE[parentSkillType].microTree;
    const progressionSystem = microTree.progressionSystem;
    const system = this.progressionSystems[progressionSystem];

    if (!system) {
      console.error(`Unknown progression system: ${progressionSystem}`);
      return false;
    }

    return system.canSelectMicroSkill(window.gameState.players[playerIndex], parentSkillType, skillIndex, microTree, this);
  }

  // Select a micro skill for a player (delegates to progression system)
  selectMicroSkill(playerIndex, parentSkillType, skillIndex) {
    const microTree = SKILL_TREE[parentSkillType].microTree;
    const progressionSystem = microTree.progressionSystem;
    const system = this.progressionSystems[progressionSystem];

    if (!system) {
      console.error(`Unknown progression system: ${progressionSystem}`);
      return false;
    }

    return system.selectMicroSkill(window.gameState.players[playerIndex], parentSkillType, skillIndex, microTree, this);
  }

  // Check if a micro skill is selected
  isMicroSkillSelected(playerIndex, parentSkillType, skillIndex) {
    const player = window.gameState.players[playerIndex];
    this.initializePlayerMicroSkills(player);
    const selectedSkills = player.selectedMicroSkills.get(parentSkillType) || new Set();

    return selectedSkills.has(skillIndex);
  }

  // Get status text for micro skill
  getMicroSkillStatus(playerIndex, parentSkillType, skillIndex) {
    if (this.isMicroSkillSelected(playerIndex, parentSkillType, skillIndex)) {
      return 'Status: Selected';
    } else if (this.canSelectMicroSkill(playerIndex, parentSkillType, skillIndex)) {
      return 'Status: Available for selection';
    } else {
      const microTree = SKILL_TREE[parentSkillType].microTree;
      const progressionSystem = microTree.progressionSystem;

      if (progressionSystem === 'level_based') {
        const levelSystem = this.progressionSystems.level_based;
        const requiredLevel = levelSystem.getRequiredLevelForSkill(skillIndex);
        return `Status: Requires player level ${requiredLevel}`;
      } else if (progressionSystem === 'one_per_row' || progressionSystem === 'absolute' || progressionSystem === 'instant') {
        return 'Status: Not available (row restriction or insufficient points)';
      }

      return 'Status: Not available';
    }
  }

  // Get selected micro skills for a player (helper method for progression systems)
  getSelectedMicroSkillsForPlayer(player, parentSkillType) {
    this.initializePlayerMicroSkills(player);
    if (!player.selectedMicroSkills.has(parentSkillType)) {
      player.selectedMicroSkills.set(parentSkillType, new Set());
    }
    return player.selectedMicroSkills.get(parentSkillType);
  }

  // Get all selected micro skills for a parent skill
  getSelectedMicroSkills(playerIndex, parentSkillType) {
    const player = window.gameState.players[playerIndex];
    this.initializePlayerMicroSkills(player);
    if (!player.selectedMicroSkills.has(parentSkillType)) {
      player.selectedMicroSkills.set(parentSkillType, new Set());
    }
    return player.selectedMicroSkills.get(parentSkillType);
  }
}

// Global micro skill tree manager instance
window.microSkillTreeManager = new MicroSkillTreeManager();

// Global skill tree manager instance
window.skillTreeManager = new SkillTreeManager();

// Export for use in other files
window.SKILL_TYPES = SKILL_TYPES;
window.RESOURCE_TYPES = RESOURCE_TYPES;
window.DAMAGE_TYPES = DAMAGE_TYPES;
window.RANGE_TYPES = RANGE_TYPES;
window.TARGET_TYPES = TARGET_TYPES;
window.SKILL_TREE = SKILL_TREE;
