// Skill Helpers System
// Shared helper functions for skill tree operations

// Helper function to calculate total passive effect from all skill levels
function calculateTotalPassiveEffect(skillInfo, player, skillType) {
    const currentLevel = getSkillLevel(player, skillType);

    if (!skillInfo.levelEffects || currentLevel === 0) {
        // No leveling or level 0 - return base passive effect
        return skillInfo.passiveEffect;
    }

    // Sum all level effects up to current level
    const totalValue = skillInfo.levelEffects
        .slice(0, currentLevel)
        .reduce((sum, effect) => sum + effect.value, 0);

    return {
        stat: skillInfo.passiveEffect.stat,
        value: totalValue
    };
}

// Helper function to get skill level display text (current/max)
function getSkillLevelDisplay(player, skillType) {
    const skill = window.SKILL_TREE[skillType];
    if (!skill) return '0/0';

    const currentLevel = getSkillLevel(player, skillType);
    const maxLevel = skill.maxLevel || 1; // Default to 1 for non-leveling skills

    return `${currentLevel}/${maxLevel}`;
}

// Helper function to get current effect display text
function getCurrentEffectDisplay(player, skillType, skillInfo) {
    const currentLevel = getSkillLevel(player, skillType);

    if (currentLevel === 0) {
        return "Ненаучен скил";
    }

    // Calculate total effect from all levels up to current
    if (skillInfo.passiveEffect && skillInfo.levelEffects) {
        // For single-level skills with multiple effects, show all effects
        if (currentLevel === 1 && skillInfo.maxLevel === 1 && Array.isArray(skillInfo.levelEffects[0])) {
            const effects = skillInfo.levelEffects[0];
            return effects.map(effect => effect.description).join(', ');
        }

        // For multi-level skills with single effects per level, accumulate values
        const totalValue = skillInfo.levelEffects
            .slice(0, currentLevel)
            .reduce((sum, effect) => {
                // Handle both single effects and arrays of effects
                if (Array.isArray(effect)) {
                    return sum + effect.reduce((subSum, subEffect) => subSum + subEffect.value, 0);
                }
                return sum + (effect.value || 0);
            }, 0);

        const displayName = skillInfo.passiveEffect.statDisplay || skillInfo.passiveEffect.stat;
        return `+${totalValue} ${displayName}`;
    }

    // For non-leveling skills or active skills
    return skillInfo.description;
}

// Helper function to get next effect display text
function getNextEffectDisplay(player, skillType, skillInfo) {
    const currentLevel = getSkillLevel(player, skillType);
    const maxLevel = skillInfo.maxLevel || 1;

    if (currentLevel >= maxLevel) {
        return "Максимално развитие";
    }

    if (currentLevel === 0) {
        // First time unlocking
        if (skillInfo.levelEffects && skillInfo.levelEffects[0]) {
            const levelEffects = skillInfo.levelEffects[0];
            if (Array.isArray(levelEffects)) {
                // Multiple effects - show all descriptions
                return levelEffects.map(effect => effect.description).join(', ');
            } else {
                // Single effect
                return levelEffects.description;
            }
        }
        return skillInfo.description;
    }

    // Upgrading to next level
    if (skillInfo.levelEffects && skillInfo.levelEffects[currentLevel]) {
        const nextLevelEffects = skillInfo.levelEffects[currentLevel];

        if (Array.isArray(nextLevelEffects)) {
            // Multiple effects - show all descriptions
            const descriptions = nextLevelEffects.map(effect => effect.description);
            return `${descriptions.join(', ')}`;
        } else {
            // Single effect - calculate total
            const totalAfterUpgrade = skillInfo.levelEffects
                .slice(0, currentLevel + 1)
                .reduce((sum, effect) => sum + effect.value, 0);

            return `${nextLevelEffects.description} (общо +${totalAfterUpgrade} ${skillInfo.passiveEffect.statDisplay || skillInfo.passiveEffect.stat})`;
        }
    }

    return "Няма допълнителен ефект";
}

// Helper function to get skill point cost for next level
function getSkillPointCost(player, skillType) {
    const skill = window.SKILL_TREE[skillType];
    if (!skill) return 0;

    const currentLevel = getSkillLevel(player, skillType);
    const maxLevel = skill.maxLevel || 1;

    // If already at max level, return 0 (can't upgrade)
    if (currentLevel >= maxLevel) {
        return 0;
    }

    // For leveling skills, get cost from levelCosts array
    if (skill.levelCosts && skill.levelCosts[currentLevel] !== undefined) {
        return skill.levelCosts[currentLevel];
    }

    // Fallback for non-leveling skills
    return skill.levelCosts ? skill.levelCosts[0] : 0;
}

// Helper function to get formatted prerequisites display with level requirements
function getPrerequisitesDisplay(skillInfo) {
    if (skillInfo.prerequisites.length === 0) return 'Няма';

    return skillInfo.prerequisites.map(prereq => {
        // Use custom display text if provided, otherwise generate automatically
        if (prereq.displayText) {
            return prereq.displayText;
        }

        // Generate display text based on prerequisite type
        switch (prereq.type) {
            case "skill_level":
                const skillName = window.SKILL_TREE[prereq.skill].name;
                return `${skillName} (ниво ${prereq.level}+)`;

            case "player_level":
                return `Ниво на героя ${prereq.level}+`;

            case "quest_completed":
                return `Завършена мисия: ${prereq.questId}`;

            case "achievement_unlocked":
                return `Отключено постижение: ${prereq.achievementId}`;

            default:
                return `Неизвестно изискване: ${prereq.type}`;
        }
    }).join(', ');
}

// Helper function to get resource display
function getResourceDisplay(skillInfo) {
    if (skillInfo.resourceType === window.RESOURCE_TYPES.NONE) {
        return 'None';
    } else if (skillInfo.resourceType === window.RESOURCE_TYPES.MANA) {
        return `${skillInfo.resourceCost} Mana`;
    } else if (skillInfo.resourceType === window.RESOURCE_TYPES.ENERGY) {
        return `${skillInfo.resourceCost} Energy`;
    }
    return 'Unknown';
}

// Helper function to get skill level (wrapper around skillTreeManager)
function getSkillLevel(player, skillType) {
    if (window.skillTreeManager && window.skillTreeManager.getSkillLevel) {
        return window.skillTreeManager.getSkillLevel(player, skillType);
    }
    return 0;
}

// Helper function to get skill type display text
function getSkillTypeDisplayText(usageType) {
    switch (usageType) {
        case window.SKILL_USAGE_TYPES.ACTIVE:
            return 'Активно';
        case window.SKILL_USAGE_TYPES.PASSIVE:
            return 'Пасивно';
        case window.SKILL_USAGE_TYPES.ACTIVE_PASSIVE:
            return 'Активно-пасивно';
        default:
            return 'Неизвестен тип';
    }
}

// Global exports for backward compatibility
window.SkillHelpers = {
    calculateTotalPassiveEffect,
    getSkillLevelDisplay,
    getCurrentEffectDisplay,
    getNextEffectDisplay,
    getSkillPointCost,
    getPrerequisitesDisplay,
    getResourceDisplay,
    getSkillLevel,
    getSkillTypeDisplayText
};
