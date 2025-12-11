# Skill Creation Procedure for Platformer Game

## Overview
This document outlines the complete procedure for adding new skills to the skill tree system. The process involves multiple files and requires careful attention to detail to maintain system consistency.

## Required Information for New Skills

Before creating a skill, gather the following information:

### Basic Information
- **Skill Name** (string): Display name in Bulgarian (e.g., "Базова защита")
- **Description** (string): Brief description of what the skill does
- **Grid Position**: Visual position in skill tree (row-column format, e.g., "1-4")

### Effect Details
- **Stat Path** (string): Technical path to the stat (e.g., "characterInfo.baseDefense", "baseAttack")
- **Stat Display** (string): User-friendly name for display (e.g., "защита", "атака")
- **Effect Value** (number): How much the stat is modified (e.g., 10, 2)
- **Max Level** (number): Maximum level for the skill (usually 1 for single-level skills)

### Prerequisites
- **Player Level** (number): Minimum hero level required (e.g., 3)
- **Skill Prerequisites**: Array of required skills with levels

### Visual & Technical
- **Icon Position**: Row and column in sprite sheet (e.g., row 3, column 5)
- **Skill Point Cost**: Points needed to unlock/upgrade
- **Resource Type**: "none", "mana", or "energy"
- **Resource Cost**: Resource cost if applicable

## Step-by-Step Creation Procedure

### Step 1: Add Skill Type Constant
**File**: `data/skill-data.js`

Add the new skill type to the `SKILL_TYPES` object:

```javascript
const SKILL_TYPES = {
  // ... existing skills
  BASIC_DEFENSE: 'basic_defense',
  // ... add new skill here
};
```

### Step 2: Create Skill Definition
**File**: `data/skill-data.js`

Add the complete skill definition to the `SKILL_TREE` object:

```javascript
// Template for single-level passive skill
[SKILL_TYPES.NEW_SKILL]: {
  name: 'Skill Name',
  description: 'Brief description of the skill',
  passiveEffect: {
    stat: 'stat.path',           // e.g., 'characterInfo.baseDefense'
    statDisplay: 'display name',  // e.g., 'защита'
    value: 10
  },
  prerequisites: [
    {
      type: "player_level",
      level: 3,
      displayText: "Ниво на героя 3+"
    }
  ],
  resourceType: RESOURCE_TYPES.NONE,
  resourceCost: 0,
  iconRow: 3,  // Sprite sheet row
  iconCol: 5,  // Sprite sheet column
  maxLevel: 1,
  levelCosts: [1],  // Cost to unlock
    levelEffects: [
      // Level 1: Array of effects applied simultaneously
      [
        {
          stat: 'stat.path',           // e.g., 'characterInfo.baseDefense'
          value: 10,
          description: '+10 display name'  // e.g., '+10 защита'
        },
        // Add more effects for the same level
        {
          stat: 'another.stat',
          value: 5,
          description: '+5 another effect'
        }
      ],
      // Level 2: Effects for next level (if applicable)
      [
        {
          stat: 'stat.path',
          value: 15,
          description: '+15 display name'
        }
      ]
    ]

    // NOTE: All levels MUST be arrays, even if they contain only one effect
    // This ensures consistent data structure across all skills
}
```

### Step 3: Update Grid Layout
**File**: `menu.js`

Add the skill to the `SKILL_GRID_LAYOUT` array at the correct position:

```javascript
const SKILL_GRID_LAYOUT = [
  // Row 1
  [SKILL_TYPES.SKILL_1_1, SKILL_TYPES.SKILL_1_2, SKILL_TYPES.SKILL_1_3, SKILL_TYPES.NEW_SKILL, SKILL_TYPES.SKILL_1_5],
  // ... other rows
];
```

**Note**: Convert visual position (e.g., "1-4") to array indices (row 0, column 3).

### Step 4: Update Connection Lines (if needed)
**File**: `menu.js`

If the skill should connect to other skills, update the `skillChains` array in `drawConnectionLines()`:

```javascript
const skillChains = [
  // ... existing chains
  {
    skills: [SKILL_TYPES.PREREQ_SKILL, SKILL_TYPES.NEW_SKILL],
    gapColumn: 2.5  // Gap position between columns
  }
];
```

## Skill Templates

### Single-Level Passive Skill (Defense/Utility)
```javascript
[SKILL_TYPES.BASIC_DEFENSE]: {
  name: 'Базова защита',
  description: 'Увеличава базовата защита с 10 точки',
  passiveEffect: { stat: 'characterInfo.baseDefense', statDisplay: 'защита', value: 10 },
  prerequisites: [{ type: "player_level", level: 3, displayText: "Ниво на героя 3+" }],
  resourceType: RESOURCE_TYPES.NONE,
  resourceCost: 0,
  iconRow: 3,
  iconCol: 5,
  maxLevel: 1,
  levelCosts: [1],
  levelEffects: [{ stat: 'characterInfo.baseDefense', value: 10, description: '+10 защита' }]
}
```

### Multi-Level Attack Skill
```javascript
[SKILL_TYPES.ENHANCED_ATTACK]: {
  name: 'Засилена атака',
  description: 'Перманентно увеличава основната атака',
  passiveEffect: { stat: 'baseAttack', statDisplay: 'атака', value: 2 },
  prerequisites: [],
  resourceType: RESOURCE_TYPES.NONE,
  resourceCost: 0,
  iconRow: 3,
  iconCol: 6,
  maxLevel: 3,
  levelCosts: [1, 1, 2],  // Cost for each level
  levelEffects: [
    { stat: 'baseAttack', value: 2, description: '+2 атака' },
    { stat: 'baseAttack', value: 3, description: '+3 атака' },
    { stat: 'baseAttack', value: 10, description: '+10 атака' }
  ]
}
```

### Active Attack Skill
```javascript
[SKILL_TYPES.BASIC_ATTACK_LIGHT]: {
  name: 'Лека основна атака',
  description: 'Бърза лека атака без ресурсни изисквания',
  damageModifier: 1.0,
  damageType: DAMAGE_TYPES.PHYSICAL,
  rangeType: RANGE_TYPES.MELEE,
  targetType: TARGET_TYPES.SINGLE_TARGET,
  unlocked: true,  // Always available
  prerequisites: [],
  levelCosts: [0],  // No skill points needed
  resourceType: RESOURCE_TYPES.NONE,
  resourceCost: 0,
  iconRow: 5,
  iconCol: 6
}
```

## Common Patterns

### Stat Paths
- **Attack**: `'baseAttack'` → `'атака'`
- **Defense**: `'characterInfo.baseDefense'` → `'защита'`
- **Speed**: `'characterInfo.speed'` → `'бързина'`
- **Intelligence**: `'characterInfo.intelligence'` → `'интелект'`

### Prerequisites
- **Player Level**: `{ type: "player_level", level: X, displayText: "Ниво на героя X+" }`
- **Skill Level**: `{ type: "skill_level", skill: SKILL_TYPES.XXX, level: Y, displayText: "Skill Name (ниво Y+)" }`

### Icon Positions
- Row 1-6: Different skill categories
- Column 1-10: Specific skills within category

## Validation Checklist

After creating a skill, verify:

- [ ] Skill appears in correct grid position
- [ ] Prerequisites work (skill locked until requirements met)
- [ ] Effects apply correctly when unlocked
- [ ] Visual indicators update (color, glow, level display)
- [ ] Connection lines appear if applicable
- [ ] Skill costs correct amount of points
- [ ] UI displays proper descriptions and effects
- [ ] Combat system uses updated stats
- [ ] No JavaScript errors in console

## Usage Instructions

When a user requests to create a new skill:

1. **Check provided information** against required fields
2. **Request missing information** if needed
3. **Execute procedure steps** in order
4. **Validate results** using checklist
5. **Report completion** with summary

## Examples

### Example: Create "Magic Shield" Skill

**User Request**: Add skill "Магически щит" at position 2-3, gives +15 defense, requires level 5, costs 2 points, icon at 4-2.

**Execution**:
1. Add `MAGIC_SHIELD: 'magic_shield'` to SKILL_TYPES
2. Create skill definition with defense effect
3. Place in grid at [1][2] (row 1, column 2)
4. Test that it works correctly

This procedure ensures consistent, error-free skill creation across the entire skill tree system.
