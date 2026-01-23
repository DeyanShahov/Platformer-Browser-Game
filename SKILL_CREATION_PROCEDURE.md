# Skill Creation Procedure for Platformer Game

## Overview
This document outlines the complete procedure for adding new skills to the skill tree system. The process involves multiple files and requires careful attention to detail to maintain system consistency.

## Required Information for New Skills

Before creating a skill, gather the following information:

### Basic Information
- **Skill Name** (string): Display name in Bulgarian (e.g., "Базова защита")
- **Description** (string): Brief description of what the skill does
- **Skill Page**: Which skill tree page to add to ("main" or "secondary")
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

### Step 1: Determine Skill Location
Choose where the skill will be placed:
- **Main Skill Tree**: Add to main/secondary skill pages (6x5 grids)
- **Micro Skill Tree**: Add to existing ACTIVE skill's microTree specialization grid (3x4 grid)

### Step 2: Add Skill Type Constant (if needed)
**File**: `data/skill-data.js`

For new skills, add the skill type to the `SKILL_TYPES` object:

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
  usageType: SKILL_USAGE_TYPES.PASSIVE,  // ACTIVE, PASSIVE, or ACTIVE_PASSIVE
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
          statDisplay: 'display name',  // e.g., '+10 защита'
          value: 10
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
**File**: `Menu System/skills/skill_tree_core.js`

Add the skill to the `SKILL_GRID_LAYOUTS` array at the correct position:

```javascript
const SKILL_GRID_LAYOUT = [
  // Row 1
  [SKILL_TYPES.SKILL_1_1, SKILL_TYPES.SKILL_1_2, SKILL_TYPES.SKILL_1_3, SKILL_TYPES.NEW_SKILL, SKILL_TYPES.SKILL_1_5],
  // ... other rows
];
```

**Note**: Convert visual position (e.g., "1-4") to array indices (row 0, column 3).

### Step 4: Update Connection Lines (if needed)
**File**: `Menu System/skills/skill_tree_core.js`

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

## Micro Skill Tree Creation Procedure

### Overview
Micro skill trees are specialization grids (3x4 = 12 positions) that appear when you unlock ACTIVE skills. They allow players to choose specific upgrades for their abilities.

### Step 1: Locate Parent ACTIVE Skill
Find an existing ACTIVE skill in `SKILL_TREE` that will have specializations:

```javascript
[SKILL_TYPES.BASIC_ATTACK_LIGHT]: {
  // ... existing skill properties
  microTree: {
    // Add micro tree here
  }
}
```

### Step 2: Add Micro Tree Structure
Add the microTree object to the ACTIVE skill:

```javascript
microTree: {
  title: "Специализации - [Skill Name]",
  description: "Избери специализации за подобряване на [skill description]",
  skills: [
    // Array of 12 micro skills (3x4 grid)
    // Position 0-11 corresponds to grid positions
  ]
}
```

### Step 3: Create Micro Skills
Each micro skill in the array has this structure:

```javascript
{
  name: "Specialization Name",
  description: "What this specialization does",
  effects: ["+20% damage boost", "Additional effects"],
  iconRow: 1,    // From sprite sheet
  iconCol: 2     // From sprite sheet
}
```

### Step 4: Micro Skill Effects
Micro skills can have various effects:
- **Stat modifiers**: `"+20% damage boost"`
- **New mechanics**: `"Hits up to 2 enemies simultaneously"`
- **Resource costs**: `"+100% damage but costs 10 energy"`
- **Cooldowns**: `"Massive damage but 5 second cooldown"`

### Step 5: Grid Positioning
Micro skills are arranged in a 3x4 grid (3 columns, 4 rows):
- Position 0: Row 1, Column 1
- Position 1: Row 1, Column 2
- Position 2: Row 1, Column 3
- Position 3: Row 2, Column 1
- ... up to Position 11: Row 4, Column 3

### Example: Micro Skills for Basic Attack Light

```javascript
microTree: {
  title: "Специализации - Лека основна атака",
  description: "Избери специализации за подобряване на леката атака",
  skills: [
    {
      name: "Мощна лека атака",
      description: "Увеличава щетите на леката атака с 20%",
      effects: ["+20% damage boost"],
      iconRow: 1,
      iconCol: 2
    },
    {
      name: "Бърза лека атака",
      description: "Намалява времето за изпълнение на леката атака с 25%",
      effects: ["-25% attack execution time"],
      iconRow: 1,
      iconCol: 2
    },
    // ... 10 more specializations
  ]
}
```

### Step 6: Implementation Notes
- **Icon Position**: All test skills use `iconRow: 1, iconCol: 2`
- **Grid Size**: Always 12 positions (some can be empty)
- **Selection**: Only one micro skill can be chosen per parent skill
- **Effects**: Applied immediately when selected
- **No Prerequisites**: Micro skills are always available for selection

### Step 7: Testing
After adding micro skills:
- [ ] Unlock the parent ACTIVE skill
- [ ] Press ENTER on the skill to open micro tree
- [ ] Verify all 12 positions display correctly
- [ ] Test skill selection and effect application
- [ ] Confirm icons load from sprite sheet position 1-2

This procedure ensures micro skill trees are created consistently with proper integration into the skill system.

## Usage Instructions

When creating micro skills:

1. **Choose parent ACTIVE skill** that needs specializations
2. **Design 6-12 meaningful upgrades** with different effects
3. **Use consistent icon positioning** (row 1, col 2 for testing)
4. **Test the complete flow**: Unlock → Enter → Select → Apply effects
5. **Balance the power levels** to provide meaningful choices

This procedure ensures consistent, error-free micro skill creation across the entire skill tree system.
+++++++ REPLACE</parameter>
