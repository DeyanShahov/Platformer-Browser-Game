// ===========================================
// SKILL TREE STATIC DATA
// All static skill definitions and constants
// ===========================================

// Skill page constants (for tab navigation)
const SKILL_PAGES = {
  MAIN: 'main',
  SECONDARY: 'secondary'
};

// Skill type constants
const SKILL_TYPES = {
  BASIC_ATTACK_LIGHT: 'basic_attack_light',
  BASIC_ATTACK_MEDIUM: 'basic_attack_medium',
  BASIC_ATTACK_HEAVY: 'basic_attack_heavy',

  SECONDARY_ATTACK_LIGHT: 'secondary_attack_light',
  SECONDARY_ATTACK_MEDIUM: 'secondary_attack_medium',
  SECONDARY_ATTACK_HEAVY: 'secondary_attack_heavy',

  // Движения
  JUMP: 'jump',

  // Passive skills
  ENHANCED_ATTACK: 'enhanced_attack',
  STRONG_ATTACK: 'strong_attack',
  ULTIMATE_ATTACK: 'ultimate_attack',

  // Defense skills
  BASIC_DEFENSE: 'basic_defense',
  COMBAT_STANCE: 'combat_stance',
  COMBAT_SENSE: 'combat_sense',

  // Elemental protection skills
  WATER_PROTECTION: 'water_protection',
  FIRE_PROTECTION: 'fire_protection',
  AIR_PROTECTION: 'air_protection',
  EARTH_PROTECTION: 'earth_protection',
  MASS_RESISTANCE: 'mass_resistance',

  // Body enhancement skills
  STRONG_BODY: 'strong_body',

  // Synergy skill
  SYNERGY: 'synergy',

  // Micro skills for BASIC_ATTACK_LIGHT (standard micro tree)
  BASIC_ATTACK_LIGHT_POWERFUL: 'basic_attack_light_powerful',
  BASIC_ATTACK_LIGHT_BALANCED: 'basic_attack_light_balanced',
  BASIC_ATTACK_LIGHT_EFFICIENT: 'basic_attack_light_efficient',
  BASIC_ATTACK_LIGHT_FAST: 'basic_attack_light_fast',
  BASIC_ATTACK_LIGHT_VERY_FAST: 'basic_attack_light_very_fast',
  BASIC_ATTACK_LIGHT_CONTROLLED: 'basic_attack_light_controlled',
  BASIC_ATTACK_LIGHT_CRITICAL: 'basic_attack_light_critical',
  BASIC_ATTACK_LIGHT_DOUBLE: 'basic_attack_light_double',
  BASIC_ATTACK_LIGHT_ENERGY: 'basic_attack_light_energy',
  BASIC_ATTACK_LIGHT_ULTIMATE: 'basic_attack_light_ultimate',
  BASIC_ATTACK_LIGHT_PERFECT: 'basic_attack_light_perfect',
  BASIC_ATTACK_LIGHT_MASTER: 'basic_attack_light_master',

  // Test placeholder skills for main page grid (6x5 = 30 total)
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
  SKILL_06_01: 'skill_06_01', SKILL_06_02: 'skill_06_02', SKILL_06_03: 'skill_06_03', SKILL_06_04: 'skill_06_04', SKILL_06_05: 'skill_06_05',

  // Secondary page skills (6x5 = 30 total)
  // Row 1
  SEC_SKILL_01_01: 'sec_skill_01_01', SEC_SKILL_01_02: 'sec_skill_01_02', SEC_SKILL_01_03: 'sec_skill_01_03', SEC_SKILL_01_04: 'sec_skill_01_04', SEC_SKILL_01_05: 'sec_skill_01_05',
  // Row 2
  SEC_SKILL_02_01: 'sec_skill_02_01', SEC_SKILL_02_02: 'sec_skill_02_02', SEC_SKILL_02_03: 'sec_skill_02_03', SEC_SKILL_02_04: 'sec_skill_02_04', SEC_SKILL_02_05: 'sec_skill_02_05',
  // Row 3
  SEC_SKILL_03_01: 'sec_skill_03_01', SEC_SKILL_03_02: 'sec_skill_03_02', SEC_SKILL_03_03: 'sec_skill_03_03', SEC_SKILL_03_04: 'sec_skill_03_04', SEC_SKILL_03_05: 'sec_skill_03_05',
  // Row 4
  SEC_SKILL_04_01: 'sec_skill_04_01', SEC_SKILL_04_02: 'sec_skill_04_02', SEC_SKILL_04_03: 'sec_skill_04_03', SEC_SKILL_04_04: 'sec_skill_04_04', SEC_SKILL_04_05: 'sec_skill_04_05',
  // Row 5
  SEC_SKILL_05_01: 'sec_skill_05_01', SEC_SKILL_05_02: 'sec_skill_05_02', SEC_SKILL_05_03: 'sec_skill_05_03', SEC_SKILL_05_04: 'sec_skill_05_04', SEC_SKILL_05_05: 'sec_skill_05_05',
  // Row 6
  SEC_SKILL_06_01: 'sec_skill_06_01', SEC_SKILL_06_02: 'sec_skill_06_02', SEC_SKILL_06_03: 'sec_skill_06_03', SEC_SKILL_06_04: 'sec_skill_06_04', SEC_SKILL_06_05: 'sec_skill_06_05'
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

const SKILL_USAGE_TYPES = {
  ACTIVE: 'active',
  PASSIVE: 'passive',
  ACTIVE_PASSIVE: 'active_passive'
}

// Skill tree definition with prerequisites, resource costs, and icon coordinates
const SKILL_TREE = {
  [SKILL_TYPES.BASIC_ATTACK_LIGHT]: {
    name: 'Лека основна атака',
    description: 'Бърза лека атака без ресурсни изисквания',
    usageType: SKILL_USAGE_TYPES.ACTIVE,   // Active skill - manually activated
    damageModifier: 0,           // Сила на атаката - модифицира се от микро скилове
    damageType: DAMAGE_TYPES.PHYSICAL,      // physical/magical/special
    rangeType: RANGE_TYPES.MELEE,          // melee/range
    targetType: TARGET_TYPES.SINGLE_TARGET, // singletarget/aoe
    // Timing properties (data-driven instead of constants)
    executionTime: 0.15,         // ⏱️ Време за изпълнение в секунди
    cooldownTime: 0.5,           // 🔄 Време за презареждане в секунди
    // Additional properties for micro skill modifications
    executionTimeModifier: 1.0,   // Модифицира се от микро скилове за скорост
    cooldownModifier: 1.0,        // Модифицира се от микро скилове за cooldown
    criticalChanceModifier: 0.0,  // Модифицира се от микро скилове за критичен удар
    targetCountModifier: 0,       // Модифицира се от микро скилове за множество цели
    energyCostModifier: 0,        // Модифицира се от микро скилове за енергийна цена
    accuracyModifier: 0.0,        // Модифицира се от микро скилове за точност
    resourceCostModifier: 1.0,    // Модифицира се от микро скилове за ресурсна цена
    unlocked: true, // Always available
    prerequisites: [],
    levelCosts: [0],  // No skill points needed (always available)
    resourceType: RESOURCE_TYPES.MANA,
    resourceCost: 0,
    iconRow: 5,  // Row in sprite sheet (1-5)
    iconCol: 6,   // Column in sprite sheet (1-10)
    // Micro skill tree for specializations - One Per Row system
    microTree: {
      type: 'standard',
      progressionSystem: 'one_per_row',
      title: "Специализации - Лека основна атака",
      description: "Избери една специализация от всеки ред за персонализиране на атаката",
      skills: [
        // Ред 1: Мощност (позиции 0-2)
        SKILL_TYPES.BASIC_ATTACK_LIGHT_POWERFUL,
        SKILL_TYPES.BASIC_ATTACK_LIGHT_BALANCED,
        SKILL_TYPES.BASIC_ATTACK_LIGHT_EFFICIENT,

        // Ред 2: Скорост (позиции 3-5)
        SKILL_TYPES.BASIC_ATTACK_LIGHT_FAST,
        SKILL_TYPES.BASIC_ATTACK_LIGHT_VERY_FAST,
        SKILL_TYPES.BASIC_ATTACK_LIGHT_CONTROLLED,

        // Ред 3: Специални ефекти (позиции 6-8)
        SKILL_TYPES.BASIC_ATTACK_LIGHT_CRITICAL,
        SKILL_TYPES.BASIC_ATTACK_LIGHT_DOUBLE,
        SKILL_TYPES.BASIC_ATTACK_LIGHT_ENERGY,

        // Ред 4: Ултимативни способности (позиции 9-11)
        SKILL_TYPES.BASIC_ATTACK_LIGHT_ULTIMATE,
        SKILL_TYPES.BASIC_ATTACK_LIGHT_PERFECT,
        SKILL_TYPES.BASIC_ATTACK_LIGHT_MASTER
      ],
      requirements: {
        skillPointCost: 1
      }
    }
  },
  [SKILL_TYPES.BASIC_ATTACK_MEDIUM]: {
    name: 'Средна основна атака',
    description: 'Средна атака, изисква 10 мана',
    usageType: SKILL_USAGE_TYPES.ACTIVE,
    damageModifier: 0,           // Сила на атаката
    damageType: DAMAGE_TYPES.PHYSICAL,      // physical/magical/special
    rangeType: RANGE_TYPES.MELEE,          // melee/range
    targetType: TARGET_TYPES.SINGLE_TARGET, // singletarget/aoe
    // Timing properties (data-driven instead of constants)
    executionTime: 0.3,          // ⏱️ Време за изпълнение в секунди
    cooldownTime: 1.0,           // 🔄 Време за презареждане в секунди
    unlocked: false,
    prerequisites: [
      {
        type: "skill_level",
        skill: SKILL_TYPES.BASIC_ATTACK_LIGHT,
        level: 1,
        displayText: "Лека основна атака"
      }
    ],
    maxLevel: 1,       // Single level skill
    levelCosts: [1],   // Cost to unlock (level 0 → 1)
    levelEffects: [
      { description: 'Отключва средна основна атака' } // Effect when unlocked
    ],
    resourceType: RESOURCE_TYPES.MANA,
    resourceCost: 10,
    iconRow: 5,
    iconCol: 5,
    // Micro skill tree for specializations
    microTree: {
      title: "Специализации - Средна основна атака",
      description: "Избери специализации за подобряване на средната атака",
      skills: [
        // Placeholder skills - to be populated later
      ]
    }
  },
  [SKILL_TYPES.BASIC_ATTACK_HEAVY]: {
    name: 'Тежка основна атака',
    description: 'Мощна тежка атака, изисква 20 енергия',
    usageType: SKILL_USAGE_TYPES.ACTIVE,
    damageModifier: 0,           // Сила на атаката
    damageType: DAMAGE_TYPES.PHYSICAL,      // physical/magical/special
    rangeType: RANGE_TYPES.MELEE,          // melee/range
    targetType: TARGET_TYPES.SINGLE_TARGET, // singletarget/aoe
    // Timing properties (data-driven instead of constants)
    executionTime: 0.6,          // ⏱️ Време за изпълнение в секунди
    cooldownTime: 2.0,           // 🔄 Време за презареждане в секунди
    unlocked: false,
    prerequisites: [
      {
        type: "skill_level",
        skill: SKILL_TYPES.BASIC_ATTACK_MEDIUM,
        level: 1,
        displayText: "Средна основна атака"
      }
    ],
    maxLevel: 1,       // Single level skill
    levelCosts: [1],   // Cost to unlock (level 0 → 1)
    levelEffects: [
      { description: 'Отключва тежка основна атака' } // Effect when unlocked
    ],
    resourceType: RESOURCE_TYPES.ENERGY,
    resourceCost: 20,
    iconRow: 5,
    iconCol: 3,
    // Micro skill tree for specializations
    microTree: {
      title: "Специализации - Тежка основна атака",
      description: "Избери специализации за подобряване на тежката атака",
      skills: [
        // Placeholder skills - to be populated later
      ]
    }
  },
  [SKILL_TYPES.SECONDARY_ATTACK_LIGHT]: {
    name: 'Лека допълнителна атака',
    description: 'Бърза допълнителна атака без ресурсни изисквания',
    usageType: SKILL_USAGE_TYPES.ACTIVE,
    damageModifier: 0,           // Сила на атаката
    damageType: DAMAGE_TYPES.PHYSICAL,      // physical/magical/special
    rangeType: RANGE_TYPES.MELEE,          // melee/range
    targetType: TARGET_TYPES.SINGLE_TARGET, // singletarget/aoe
    // Timing properties (data-driven instead of constants)
    executionTime: 0.2,          // ⏱️ Време за изпълнение в секунди
    cooldownTime: 0.8,           // 🔄 Време за презареждане в секунди
    unlocked: true, // Always available
    prerequisites: [],
    levelCosts: [0],  // No skill points needed (always available)
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 3,
    iconCol: 2,
    // Micro skill tree for specializations
    microTree: {
      title: "Специализации - Лека допълнителна атака",
      description: "Избери специализации за подобряване на леката допълнителна атака",
      skills: [
        // Placeholder skills - to be populated later
      ]
    }
  },
  [SKILL_TYPES.SECONDARY_ATTACK_MEDIUM]: {
    name: 'Средна допълнителна атака',
    description: 'Средна допълнителна атака, изисква 10 мана',
    usageType: SKILL_USAGE_TYPES.ACTIVE,
    damageModifier: 0,           // Сила на атаката
    damageType: DAMAGE_TYPES.PHYSICAL,      // physical/magical/special
    rangeType: RANGE_TYPES.MELEE,          // melee/range
    targetType: TARGET_TYPES.SINGLE_TARGET, // singletarget/aoe
    // Timing properties (data-driven instead of constants)
    executionTime: 0.4,          // ⏱️ Време за изпълнение в секунди
    cooldownTime: 1.5,           // 🔄 Време за презареждане в секунди
    unlocked: false,
    prerequisites: [
      {
        type: "skill_level",
        skill: SKILL_TYPES.SECONDARY_ATTACK_LIGHT,
        level: 1,
        displayText: "Лека допълнителна атака"
      }
    ],
    maxLevel: 1,       // Single level skill
    levelCosts: [1],   // Cost to unlock (level 0 → 1)
    levelEffects: [
      { description: 'Отключва средна допълнителна атака' } // Effect when unlocked
    ],
    resourceType: RESOURCE_TYPES.MANA,
    resourceCost: 10,
    iconRow: 3,
    iconCol: 1,
    // Micro skill tree for specializations
    microTree: {
      title: "Специализации - Средна допълнителна атака",
      description: "Избери специализации за подобряване на средната допълнителна атака",
      skills: [
        // Placeholder skills - to be populated later
      ]
    }
  },
  [SKILL_TYPES.SECONDARY_ATTACK_HEAVY]: {
    name: 'Тежка допълнителна атака',
    description: 'Мощна тежка допълнителна атака, изисква 20 енергия',
    usageType: SKILL_USAGE_TYPES.ACTIVE,
    damageModifier: 0,           // Сила на атаката
    damageType: DAMAGE_TYPES.PHYSICAL,      // physical/magical/special
    rangeType: RANGE_TYPES.MELEE,          // melee/range
    targetType: TARGET_TYPES.SINGLE_TARGET, // singletarget/aoe
    // Timing properties (data-driven instead of constants)
    executionTime: 0.8,          // ⏱️ Време за изпълнение в секунди
    cooldownTime: 3.0,           // 🔄 Време за презареждане в секунди
    unlocked: false,
    prerequisites: [
      {
        type: "skill_level",
        skill: SKILL_TYPES.SECONDARY_ATTACK_MEDIUM,
        level: 1,
        displayText: "Средна допълнителна атака"
      }
    ],
    maxLevel: 1,       // Single level skill
    levelCosts: [1],   // Cost to unlock (level 0 → 1)
    levelEffects: [
      { description: 'Отключва тежка допълнителна атака' } // Effect when unlocked
    ],
    resourceType: RESOURCE_TYPES.ENERGY,
    resourceCost: 20,
    iconRow: 3,
    iconCol: 3,
    // Micro skill tree for specializations
    microTree: {
      title: "Специализации - Тежка допълнителна атака",
      description: "Избери специализации за подобряване на тежката допълнителна атака",
      skills: [
        // Placeholder skills - to be populated later
      ]
    }
  },

  // Jump skill
  [SKILL_TYPES.JUMP]: {
    name: 'Скок',
    description: 'Бърз скок без ресурсни изисквания',
    usageType: SKILL_USAGE_TYPES.ACTIVE,
    damageModifier: 0,           // Not a damage skill
    damageType: DAMAGE_TYPES.PHYSICAL,
    rangeType: RANGE_TYPES.MELEE,          // melee/range
    targetType: TARGET_TYPES.SINGLE_TARGET, // singletarget/aoe
    // Timing properties (data-driven instead of constants)
    executionTime: 0.0,          // ⏱️ Инстантно - няма време за изпълнение
    cooldownTime: 0.0,           // 🔄 Няма cooldown
    unlocked: true, // Always available
    prerequisites: [],
    levelCosts: [0],  // No skill points needed (always available)
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 1,  // Placeholder icon position
    iconCol: 1
  },

  // Defense skills
  [SKILL_TYPES.BASIC_DEFENSE]: {
    name: 'Базова защита',
    description: 'Увеличава базовата защита с 10 точки',
    usageType: SKILL_USAGE_TYPES.PASSIVE,
    passiveEffect: { stat: 'characterInfo.baseDefense', statDisplay: 'защита', value: 10 }, // Пасивен ефект
    unlocked: false,
    prerequisites: [
      {
        type: "player_level",
        level: 3,
        displayText: "Ниво на героя 3+"
      }
    ],
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 3,  // Спрайт шит позиция 3-5
    iconCol: 5,

    // Single level skill - 1 точка за отключване
    maxLevel: 1,
    levelCosts: [1],  // 1 skill point to unlock
    levelEffects: [
      [ { stat: 'characterInfo.baseDefense', value: 10, description: '+10 защита' } ]    // Level 1
    ]
  },

  // Combat stance skill - multiple stat bonuses
  [SKILL_TYPES.COMBAT_STANCE]: {
    name: 'Бойна стойка',
    description: 'Мощна бойна стойка която подобрява всички бойни умения',
    usageType: SKILL_USAGE_TYPES.ACTIVE_PASSIVE,
    // Timing properties (data-driven instead of constants)
    executionTime: 0.0,   // ⏱️ Инстантно - няма време за изпълнение
    cooldownTime: 0.0,     // 🔄 Няма cooldown
    passiveEffect: {
      stat: 'maxHealth',  // Primary stat for display
      statDisplay: 'бойни умения',
      value: 50
    },
    unlocked: false,
    prerequisites: [],  // No prerequisites - available from start
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 2,  // Sprite sheet position 2-5
    iconCol: 5,

    // Single level skill - 1 точка за отключване
    maxLevel: 1,
    levelCosts: [1],  // Cost to unlock
    levelEffects: [
      // Level 1: Array of multiple effects applied simultaneously
      [
        { stat: 'maxHealth', value: 50, description: '+50 живот' },
        { stat: 'baseAttack', value: 10, description: '+10 атака' },
        { stat: 'characterInfo.baseDefense', value: 10, description: '+10 защита' },
        { stat: 'characterInfo.blockChance', value: 0.05, description: '+5% блок' }
      ]
    ]
  },

  // Combat sense skill - improves combat perception
  [SKILL_TYPES.COMBAT_SENSE]: {
    name: 'Боен усет',
    description: 'Подобрява бойните сетива и увеличава шансовете за успех в битка',
    usageType: SKILL_USAGE_TYPES.PASSIVE,
    passiveEffect: {
      stat: 'characterInfo.hitChance',  // Primary stat for display
      statDisplay: 'бойни сетива',
      value: 0.05
    },
    unlocked: false,
    prerequisites: [],  // No prerequisites - available from start
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 2,  // Sprite sheet position 2-4
    iconCol: 4,

    // Single level skill - 1 точка за отключване
    maxLevel: 1,
    levelCosts: [1],  // Cost to unlock
    levelEffects: [
      // Level 1: Array of multiple effects applied simultaneously
      [
        { stat: 'characterInfo.hitChance', value: 0.05, description: '+5% шанс за удар' },
        { stat: 'characterInfo.dodgeChance', value: 0.05, description: '+5% шанс за отбягване' },
        { stat: 'characterInfo.criticalChance', value: 0.05, description: '+5% критичен удар' }
      ]
    ]
  },

  // Elemental protection skills
  [SKILL_TYPES.WATER_PROTECTION]: {
    name: 'Водна защита',
    description: 'Увеличава резистанса към водни магии',
    usageType: SKILL_USAGE_TYPES.PASSIVE,
    passiveEffect: {
      stat: 'characterInfo.magicResistance.water',
      statDisplay: 'водна резистанс',
      value: 2
    },
    unlocked: false,
    prerequisites: [],  // No prerequisites - available from start
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 4,  // Sprite sheet position 4-6
    iconCol: 6,

    // 5 levels - each level gives +2 water resistance
    maxLevel: 5,
    levelCosts: [1, 1, 1, 1, 1],  // 1 point per level
    levelEffects: [
      [ { stat: 'characterInfo.magicResistance.water', value: 2, description: '+2% водна резистанс' } ],
      [ { stat: 'characterInfo.magicResistance.water', value: 2, description: '+2% водна резистанс' } ],
      [ { stat: 'characterInfo.magicResistance.water', value: 2, description: '+2% водна резистанс' } ],
      [ { stat: 'characterInfo.magicResistance.water', value: 2, description: '+2% водна резистанс' } ],
      [ { stat: 'characterInfo.magicResistance.water', value: 2, description: '+2% водна резистанс' } ]
    ]
  },

  [SKILL_TYPES.FIRE_PROTECTION]: {
    name: 'Огнена защита',
    description: 'Увеличава резистанса към огнени магии',
    usageType: SKILL_USAGE_TYPES.PASSIVE,
    passiveEffect: {
      stat: 'characterInfo.magicResistance.fire',
      statDisplay: 'огнена резистанс',
      value: 2
    },
    unlocked: false,
    prerequisites: [],  // No prerequisites - available from start
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 4,  // Sprite sheet position 4-7
    iconCol: 7,

    // 5 levels - each level gives +2 fire resistance
    maxLevel: 5,
    levelCosts: [1, 1, 1, 1, 1],  // 1 point per level
    levelEffects: [
      [ { stat: 'characterInfo.magicResistance.fire', value: 2, description: '+2% огнена резистанс' } ],
      [ { stat: 'characterInfo.magicResistance.fire', value: 2, description: '+2% огнена резистанс' } ],
      [ { stat: 'characterInfo.magicResistance.fire', value: 2, description: '+2% огнена резистанс' } ],
      [ { stat: 'characterInfo.magicResistance.fire', value: 2, description: '+2% огнена резистанс' } ],
      [ { stat: 'characterInfo.magicResistance.fire', value: 2, description: '+2% огнена резистанс' } ]
    ]
  },

  [SKILL_TYPES.AIR_PROTECTION]: {
    name: 'Въздушна защита',
    description: 'Увеличава резистанса към въздушни магии',
    usageType: SKILL_USAGE_TYPES.PASSIVE,
    passiveEffect: {
      stat: 'characterInfo.magicResistance.air',
      statDisplay: 'въздушна резистанс',
      value: 2
    },
    unlocked: false,
    prerequisites: [],  // No prerequisites - available from start
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 4,  // Sprite sheet position 4-9
    iconCol: 9,

    // 5 levels - each level gives +2 air resistance
    maxLevel: 5,
    levelCosts: [1, 1, 1, 1, 1],  // 1 point per level
    levelEffects: [
      [ { stat: 'characterInfo.magicResistance.air', value: 2, description: '+2% въздушна резистанс' } ],
      [ { stat: 'characterInfo.magicResistance.air', value: 2, description: '+2% въздушна резистанс' } ],
      [ { stat: 'characterInfo.magicResistance.air', value: 2, description: '+2% въздушна резистанс' } ],
      [ { stat: 'characterInfo.magicResistance.air', value: 2, description: '+2% въздушна резистанс' } ],
      [ { stat: 'characterInfo.magicResistance.air', value: 2, description: '+2% въздушна резистанс' } ]
    ]
  },

  [SKILL_TYPES.EARTH_PROTECTION]: {
    name: 'Земна защита',
    description: 'Увеличава резистанса към земни магии',
    usageType: SKILL_USAGE_TYPES.PASSIVE,
    passiveEffect: {
      stat: 'characterInfo.magicResistance.earth',
      statDisplay: 'земна резистанс',
      value: 2
    },
    unlocked: false,
    prerequisites: [],  // No prerequisites - available from start
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 4,  // Sprite sheet position 4-10
    iconCol: 10,

    // 5 levels - each level gives +2 earth resistance
    maxLevel: 5,
    levelCosts: [1, 1, 1, 1, 1],  // 1 point per level
    levelEffects: [
      [ { stat: 'characterInfo.magicResistance.earth', value: 2, description: '+2% земна резистанс' } ],
      [ { stat: 'characterInfo.magicResistance.earth', value: 2, description: '+2% земна резистанс' } ],
      [ { stat: 'characterInfo.magicResistance.earth', value: 2, description: '+2% земна резистанс' } ],
      [ { stat: 'characterInfo.magicResistance.earth', value: 2, description: '+2% земна резистанс' } ],
      [ { stat: 'characterInfo.magicResistance.earth', value: 2, description: '+2% земна резистанс' } ]
    ]
  },

  // Mass resistance skill - boosts all elemental resistances
  [SKILL_TYPES.MASS_RESISTANCE]: {
    name: 'Масов резистанс',
    description: 'Увеличава всички магически резистанси едновременно',
    usageType: SKILL_USAGE_TYPES.PASSIVE,
    passiveEffect: {
      stat: 'characterInfo.magicResistance.water',  // Primary stat for display
      statDisplay: 'всички резистанси',
      value: 1
    },
    unlocked: false,
    prerequisites: [
      {
        type: "skill_level",
        skill: SKILL_TYPES.WATER_PROTECTION,
        level: 2,
        displayText: "Водна защита (ниво 2+)"
      },
      {
        type: "skill_level",
        skill: SKILL_TYPES.FIRE_PROTECTION,
        level: 2,
        displayText: "Огнена защита (ниво 2+)"
      },
      {
        type: "skill_level",
        skill: SKILL_TYPES.AIR_PROTECTION,
        level: 2,
        displayText: "Въздушна защита (ниво 2+)"
      },
      {
        type: "skill_level",
        skill: SKILL_TYPES.EARTH_PROTECTION,
        level: 2,
        displayText: "Земна защита (ниво 2+)"
      }
    ],
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 4,  // Sprite sheet position 4-4
    iconCol: 4,

    // 5 levels - each level gives +1 to all four resistances
    maxLevel: 5,
    levelCosts: [1, 1, 1, 1, 1],  // 1 point per level
    levelEffects: [
      // Level 1: +1 to all resistances
      [
        { stat: 'characterInfo.magicResistance.water', value: 1, description: '+1% водна резистанс' },
        { stat: 'characterInfo.magicResistance.fire', value: 1, description: '+1% огнена резистанс' },
        { stat: 'characterInfo.magicResistance.air', value: 1, description: '+1% въздушна резистанс' },
        { stat: 'characterInfo.magicResistance.earth', value: 1, description: '+1% земна резистанс' }
      ],
      // Level 2: +1 to all resistances
      [
        { stat: 'characterInfo.magicResistance.water', value: 1, description: '+1% водна резистанс' },
        { stat: 'characterInfo.magicResistance.fire', value: 1, description: '+1% огнена резистанс' },
        { stat: 'characterInfo.magicResistance.air', value: 1, description: '+1% въздушна резистанс' },
        { stat: 'characterInfo.magicResistance.earth', value: 1, description: '+1% земна резистанс' }
      ],
      // Level 3: +1 to all resistances
      [
        { stat: 'characterInfo.magicResistance.water', value: 1, description: '+1% водна резистанс' },
        { stat: 'characterInfo.magicResistance.fire', value: 1, description: '+1% огнена резистанс' },
        { stat: 'characterInfo.magicResistance.air', value: 1, description: '+1% въздушна резистанс' },
        { stat: 'characterInfo.magicResistance.earth', value: 1, description: '+1% земна резистанс' }
      ],
      // Level 4: +1 to all resistances
      [
        { stat: 'characterInfo.magicResistance.water', value: 1, description: '+1% водна резистанс' },
        { stat: 'characterInfo.magicResistance.fire', value: 1, description: '+1% огнена резистанс' },
        { stat: 'characterInfo.magicResistance.air', value: 1, description: '+1% въздушна резистанс' },
        { stat: 'characterInfo.magicResistance.earth', value: 1, description: '+1% земна резистанс' }
      ],
      // Level 5: +1 to all resistances
      [
        { stat: 'characterInfo.magicResistance.water', value: 1, description: '+1% водна резистанс' },
        { stat: 'characterInfo.magicResistance.fire', value: 1, description: '+1% огнена резистанс' },
        { stat: 'characterInfo.magicResistance.air', value: 1, description: '+1% въздушна резистанс' },
        { stat: 'characterInfo.magicResistance.earth', value: 1, description: '+1% земна резистанс' }
      ]
    ]
  },

  // Strong body skill - enhances core attributes
  [SKILL_TYPES.STRONG_BODY]: {
    name: 'Здраво тяло',
    description: 'Подобрява физическото тяло и увеличава основните характеристики',
    usageType: SKILL_USAGE_TYPES.PASSIVE,
    passiveEffect: {
      stat: 'characterInfo.strength',  // Primary stat for display
      statDisplay: 'основни характеристики',
      value: 5
    },
    unlocked: false,
    prerequisites: [],  // No prerequisites - available from start
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 5,  // Sprite sheet position 5-8
    iconCol: 8,

    // 3 levels - each level gives +5 to strength, speed, and intelligence
    maxLevel: 3,
    levelCosts: [1, 1, 1],  // 1 point per level
    levelEffects: [
      // Level 1: +5 to all three core attributes
      [
        { stat: 'characterInfo.strength', value: 5, description: '+5 сила' },
        { stat: 'characterInfo.speed', value: 5, description: '+5 бързина' },
        { stat: 'characterInfo.intelligence', value: 5, description: '+5 интелект' }
      ],
      // Level 2: +5 to all three core attributes
      [
        { stat: 'characterInfo.strength', value: 5, description: '+5 сила' },
        { stat: 'characterInfo.speed', value: 5, description: '+5 бързина' },
        { stat: 'characterInfo.intelligence', value: 5, description: '+5 интелект' }
      ],
      // Level 3: +5 to all three core attributes
      [
        { stat: 'characterInfo.strength', value: 5, description: '+5 сила' },
        { stat: 'characterInfo.speed', value: 5, description: '+5 бързина' },
        { stat: 'characterInfo.intelligence', value: 5, description: '+5 интелект' }
      ]
    ]
  },

  // Synergy skill - increases max mana and energy
  [SKILL_TYPES.SYNERGY]: {
    name: 'Синергия',
    description: 'Увеличава максималната мана и енергия, подобрявайки общата ефективност',
    usageType: SKILL_USAGE_TYPES.PASSIVE,
    passiveEffect: {
      stat: 'maxMana',  // Primary stat for display
      statDisplay: 'мана и енергия',
      value: 10
    },
    unlocked: false,
    prerequisites: [],  // No prerequisites - available from start
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 5,  // Sprite sheet position 5-10
    iconCol: 10,

    // 5 levels - each level gives +10 max mana and +10 max energy
    maxLevel: 5,
    levelCosts: [1, 1, 1, 1, 1],  // 1 point per level
    levelEffects: [
      // Level 1: +10 max mana and +10 max energy
      [
        { stat: 'maxMana', value: 10, description: '+10 максимална мана' },
        { stat: 'maxEnergy', value: 10, description: '+10 максимална енергия' }
      ],
      // Level 2: +10 max mana and +10 max energy
      [
        { stat: 'maxMana', value: 10, description: '+10 максимална мана' },
        { stat: 'maxEnergy', value: 10, description: '+10 максимална енергия' }
      ],
      // Level 3: +10 max mana and +10 max energy
      [
        { stat: 'maxMana', value: 10, description: '+10 максимална мана' },
        { stat: 'maxEnergy', value: 10, description: '+10 максимална енергия' }
      ],
      // Level 4: +10 max mana and +10 max energy
      [
        { stat: 'maxMana', value: 10, description: '+10 максимална мана' },
        { stat: 'maxEnergy', value: 10, description: '+10 максимална енергия' }
      ],
      // Level 5: +10 max mana and +10 max energy
      [
        { stat: 'maxMana', value: 10, description: '+10 максимална мана' },
        { stat: 'maxEnergy', value: 10, description: '+10 максимална енергия' }
      ]
    ]
  },


  //------------------------------------------ MICRO SKILLS FOR BASIC_ATTACK_LIGHT ------------------------------------------//

  // Micro skills for BASIC_ATTACK_LIGHT (full passive skills)
  [SKILL_TYPES.BASIC_ATTACK_LIGHT_POWERFUL]: {
    name: 'Мощна лека атака',
    description: 'Увеличава щетите на леката атака с 20%',
    usageType: SKILL_USAGE_TYPES.PASSIVE,
    passiveEffect: {
      stat: 'parentSkill.damageModifier',
      statDisplay: 'щета на лека атака',
      value: 0.2
    },
    unlocked: false,
    prerequisites: [],
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 1,
    iconCol: 1,
    maxLevel: 1,
    levelCosts: [1],
    levelEffects: [[{
      stat: 'parentSkill.damageModifier',
      value: 0.2,
      description: '+20% щета на лека атака'
    }]]
  },

  [SKILL_TYPES.BASIC_ATTACK_LIGHT_BALANCED]: {
    name: 'Балансирана лека атака',
    description: 'Увеличава щетите с 15% и намалява cooldown с 10%',
    usageType: SKILL_USAGE_TYPES.PASSIVE,
    passiveEffect: {
      stat: 'parentSkill.damageModifier',
      statDisplay: 'щета и скорост',
      value: 0.15
    },
    unlocked: false,
    prerequisites: [],
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 1,
    iconCol: 2,
    maxLevel: 1,
    levelCosts: [1],
    levelEffects: [[
      {
        stat: 'parentSkill.damageModifier',
        value: 0.15,
        description: '+15% щета на лека атака'
      },
      {
        stat: 'parentSkill.cooldownModifier',
        value: -0.1,
        description: '-10% cooldown на лека атака'
      }
    ]]
  },

  [SKILL_TYPES.BASIC_ATTACK_LIGHT_EFFICIENT]: {
    name: 'Ефикасна лека атака',
    description: 'Увеличава щетите с 10% и намалява ресурсната цена с 15%',
    usageType: SKILL_USAGE_TYPES.PASSIVE,
    passiveEffect: {
      stat: 'parentSkill.damageModifier',
      statDisplay: 'щета и ефективност',
      value: 0.1
    },
    unlocked: false,
    prerequisites: [],
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 1,
    iconCol: 3,
    maxLevel: 1,
    levelCosts: [1],
    levelEffects: [[
      {
        stat: 'parentSkill.damageModifier',
        value: 0.1,
        description: '+10% щета на лека атака'
      },
      {
        stat: 'parentSkill.resourceCostModifier',
        value: -0.15,
        description: '-15% ресурсна цена'
      }
    ]]
  },

  [SKILL_TYPES.BASIC_ATTACK_LIGHT_FAST]: {
    name: 'Бърза лека атака',
    description: 'Намалява времето за изпълнение на леката атака с 25%',
    usageType: SKILL_USAGE_TYPES.PASSIVE,
    passiveEffect: {
      stat: 'parentSkill.executionTimeModifier',
      statDisplay: 'скорост на атака',
      value: -0.25
    },
    unlocked: false,
    prerequisites: [],
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 1,
    iconCol: 4,
    maxLevel: 1,
    levelCosts: [1],
    levelEffects: [[{
      stat: 'parentSkill.executionTimeModifier',
      value: -0.25,
      description: '-25% време за изпълнение'
    }]]
  },

  [SKILL_TYPES.BASIC_ATTACK_LIGHT_VERY_FAST]: {
    name: 'Много бърза лека атака',
    description: 'Намалява времето за изпълнение с 35%, но +10% ресурсна цена',
    usageType: SKILL_USAGE_TYPES.PASSIVE,
    passiveEffect: {
      stat: 'parentSkill.executionTimeModifier',
      statDisplay: 'екстремна скорост',
      value: -0.35
    },
    unlocked: false,
    prerequisites: [],
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 1,
    iconCol: 5,
    maxLevel: 1,
    levelCosts: [1],
    levelEffects: [[
      {
        stat: 'parentSkill.executionTimeModifier',
        value: -0.35,
        description: '-35% време за изпълнение'
      },
      {
        stat: 'parentSkill.resourceCostModifier',
        value: 0.1,
        description: '+10% ресурсна цена'
      }
    ]]
  },

  [SKILL_TYPES.BASIC_ATTACK_LIGHT_CONTROLLED]: {
    name: 'Контролирана лека атака',
    description: 'Намалява времето за изпълнение с 15% и увеличава точността с 10%',
    usageType: SKILL_USAGE_TYPES.PASSIVE,
    passiveEffect: {
      stat: 'parentSkill.executionTimeModifier',
      statDisplay: 'контрол и скорост',
      value: -0.15
    },
    unlocked: false,
    prerequisites: [],
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 1,
    iconCol: 6,
    maxLevel: 1,
    levelCosts: [1],
    levelEffects: [[
      {
        stat: 'parentSkill.executionTimeModifier',
        value: -0.15,
        description: '-15% време за изпълнение'
      },
      {
        stat: 'parentSkill.accuracyModifier',
        value: 0.1,
        description: '+10% точност'
      }
    ]]
  },

  [SKILL_TYPES.BASIC_ATTACK_LIGHT_CRITICAL]: {
    name: 'Критичен удар',
    description: 'Увеличава шанса за критичен удар с 15%',
    usageType: SKILL_USAGE_TYPES.PASSIVE,
    passiveEffect: {
      stat: 'parentSkill.criticalChanceModifier',
      statDisplay: 'критичен удар',
      value: 0.15
    },
    unlocked: false,
    prerequisites: [],
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 2,
    iconCol: 1,
    maxLevel: 1,
    levelCosts: [1],
    levelEffects: [[{
      stat: 'parentSkill.criticalChanceModifier',
      value: 0.15,
      description: '+15% критичен удар'
    }]]
  },

  [SKILL_TYPES.BASIC_ATTACK_LIGHT_DOUBLE]: {
    name: 'Двоен удар',
    description: 'Леката атака удря до 2 противника едновременно',
    usageType: SKILL_USAGE_TYPES.PASSIVE,
    passiveEffect: {
      stat: 'parentSkill.targetCountModifier',
      statDisplay: 'множество цели',
      value: 1
    },
    unlocked: false,
    prerequisites: [],
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 2,
    iconCol: 2,
    maxLevel: 1,
    levelCosts: [1],
    levelEffects: [[{
      stat: 'parentSkill.targetCountModifier',
      value: 1,
      description: 'Удря до 2 противника едновременно'
    }]]
  },

  [SKILL_TYPES.BASIC_ATTACK_LIGHT_ENERGY]: {
    name: 'Енергийна вълна',
    description: 'Удвоява щетите но изразходва 10 енергия',
    usageType: SKILL_USAGE_TYPES.PASSIVE,
    passiveEffect: {
      stat: 'parentSkill.damageModifier',
      statDisplay: 'енергийна мощ',
      value: 1.0
    },
    unlocked: false,
    prerequisites: [],
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 2,
    iconCol: 3,
    maxLevel: 1,
    levelCosts: [1],
    levelEffects: [[
      {
        stat: 'parentSkill.damageModifier',
        value: 1.0,
        description: '+100% щета'
      },
      {
        stat: 'parentSkill.energyCostModifier',
        value: 10,
        description: '+10 енергия цена'
      }
    ]]
  },

  [SKILL_TYPES.BASIC_ATTACK_LIGHT_ULTIMATE]: {
    name: 'Ултимативен удар',
    description: 'Максимални щети но с 5 секунди cooldown',
    usageType: SKILL_USAGE_TYPES.PASSIVE,
    passiveEffect: {
      stat: 'parentSkill.damageModifier',
      statDisplay: 'ултимативна мощ',
      value: 2.0
    },
    unlocked: false,
    prerequisites: [],
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 2,
    iconCol: 4,
    maxLevel: 1,
    levelCosts: [1],
    levelEffects: [[
      {
        stat: 'parentSkill.damageModifier',
        value: 2.0,
        description: '+200% щета'
      },
      {
        stat: 'parentSkill.cooldownModifier',
        value: 5.0,
        description: '+5 секунди cooldown'
      }
    ]]
  },

  [SKILL_TYPES.BASIC_ATTACK_LIGHT_PERFECT]: {
    name: 'Перфектен удар',
    description: '100% шанс за критичен удар, но само при пълно здраве',
    usageType: SKILL_USAGE_TYPES.PASSIVE,
    passiveEffect: {
      stat: 'parentSkill.criticalChanceModifier',
      statDisplay: 'перфектен критичен удар',
      value: 1.0
    },
    unlocked: false,
    prerequisites: [],
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 2,
    iconCol: 5,
    maxLevel: 1,
    levelCosts: [1],
    levelEffects: [[{
      stat: 'parentSkill.criticalChanceModifier',
      value: 1.0,
      description: '100% критичен удар при пълно здраве'
    }]]
  },

  [SKILL_TYPES.BASIC_ATTACK_LIGHT_MASTER]: {
    name: 'Майстор на атаката',
    description: 'Комбинира всички предишни бонуси с 50% ефективност',
    usageType: SKILL_USAGE_TYPES.PASSIVE,
    passiveEffect: {
      stat: 'parentSkill.damageModifier',
      statDisplay: 'майсторска мощ',
      value: 0.5
    },
    unlocked: false,
    prerequisites: [],
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 2,
    iconCol: 6,
    maxLevel: 1,
    levelCosts: [1],
    levelEffects: [[
      {
        stat: 'parentSkill.damageModifier',
        value: 0.5,
        description: '+50% щета'
      },
      {
        stat: 'parentSkill.executionTimeModifier',
        value: -0.125,
        description: '-12.5% време за изпълнение'
      },
      {
        stat: 'parentSkill.criticalChanceModifier',
        value: 0.075,
        description: '+7.5% критичен удар'
      }
    ]]
  },




  //------------------------------------------ PASSIVE SKILLS FOR GENERAL USE ------------------------------------------//

  // Passive skills
  [SKILL_TYPES.ENHANCED_ATTACK]: {
    name: 'Засилена атака',
    description: 'Перманентно увеличава основната атака',
    usageType: SKILL_USAGE_TYPES.PASSIVE,
    passiveEffect: { stat: 'baseAttack', statDisplay: 'атака', value: 2 }, // Пасивен ефект
    unlocked: false,
    prerequisites: [],
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 3,  // Спрайт шит позиция 3-6
    iconCol: 6,

    // Нова leveling система
    maxLevel: 3,  // Максимум 3 нива
    levelCosts: [1, 1, 2],  // Level 1: 1pt, Level 2: 1pt, Level 3: 2pt
    levelEffects: [
      [ { stat: 'baseAttack', value: 2, description: '+2 атака' } ],    // Level 1
      [ { stat: 'baseAttack', value: 3, description: '+3 атака' } ],    // Level 2 (допълнително)
      [ { stat: 'baseAttack', value: 10, description: '+10 атака' } ]   // Level 3 (допълнително)
    ]
  },
  [SKILL_TYPES.STRONG_ATTACK]: {
    name: 'Силна атака',
    description: 'Мощна атака която увеличава базовата атака',
    usageType: SKILL_USAGE_TYPES.PASSIVE,
    passiveEffect: { stat: 'baseAttack', statDisplay: 'атака', value: 2 }, // Пасивен ефект
    unlocked: false,
    prerequisites: [
      {
        type: "skill_level",
        skill: SKILL_TYPES.ENHANCED_ATTACK,
        level: 2,
        displayText: "Засилена атака (ниво 2+)"
      }
    ],
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 3,  // Спрайт шит позиция 3-10
    iconCol: 10,

    // Leveling система - 5 нива по 1 точка всеки
    maxLevel: 5,
    levelCosts: [1, 1, 1, 1, 1],  // 1 point per level
    levelEffects: [
      [ { stat: 'baseAttack', value: 2, description: '+2 атака' } ],    // Level 1
      [ { stat: 'baseAttack', value: 2, description: '+2 атака' } ],    // Level 2
      [ { stat: 'baseAttack', value: 2, description: '+2 атака' } ],    // Level 3
      [ { stat: 'baseAttack', value: 2, description: '+2 атака' } ],    // Level 4
      [ { stat: 'baseAttack', value: 2, description: '+2 атака' } ]     // Level 5
    ]
  },
  [SKILL_TYPES.ULTIMATE_ATTACK]: {
    name: 'Ултимативна атака',
    description: 'Мощна ултимативна атака с огромна сила',
    usageType: SKILL_USAGE_TYPES.PASSIVE,
    passiveEffect: { stat: 'baseAttack', statDisplay: 'атака', value: 50 }, // Пасивен ефект
    unlocked: false,
    prerequisites: [
      {
        type: "player_level",
        level: 5,
        displayText: "Ниво на героя 5+"
      },
      {
        type: "skill_level",
        skill: SKILL_TYPES.ENHANCED_ATTACK,
        level: 3,
        displayText: "Засилена атака (максимално ниво)"
      },
      {
        type: "skill_level",
        skill: SKILL_TYPES.STRONG_ATTACK,
        level: 5,
        displayText: "Силна атака (максимално ниво)"
      }
    ],
    resourceType: RESOURCE_TYPES.NONE,
    resourceCost: 0,
    iconRow: 4,  // Спрайт шит позиция 4-2
    iconCol: 2,

    // Single level skill - 1 точка за отключване
    maxLevel: 1,
    levelCosts: [1],  // 1 skill point to unlock
    levelEffects: [
      [ { stat: 'baseAttack', value: 50, description: '+50 атака' } ]    // Level 1
    ]
  },

  // Test placeholder skills for large grid
  // Row 1
  [SKILL_TYPES.SKILL_01_01]: { name: 'Test 1-1', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_01_02]: { name: 'Test 1-2', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_01_04]: { name: 'Test 1-4', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_01_05]: { name: 'Test 1-5', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },

  // Row 2
  [SKILL_TYPES.SKILL_02_03]: { name: 'Test 2-3', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_02_04]: { name: 'Test 2-4', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_02_05]: { name: 'Test 2-5', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },

  // Row 3
  [SKILL_TYPES.SKILL_03_03]: { name: 'Test 3-3', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_03_04]: { name: 'Test 3-4', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_03_05]: { name: 'Test 3-5', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },

  // Row 4
  [SKILL_TYPES.SKILL_04_01]: { name: 'Test 4-1', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_04_02]: { name: 'Test 4-2', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_04_03]: { name: 'Test 4-3', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_04_04]: { name: 'Test 4-4', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_04_05]: { name: 'Test 4-5', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },

  // Row 5
  [SKILL_TYPES.SKILL_05_01]: { name: 'Test 5-1', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_05_02]: { name: 'Test 5-2', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_05_03]: { name: 'Test 5-3', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_05_04]: { name: 'Test 5-4', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_05_05]: { name: 'Test 5-5', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },

  // Row 6
  [SKILL_TYPES.SKILL_06_01]: { name: 'Test 6-1', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_06_02]: { name: 'Test 6-2', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_06_03]: { name: 'Test 6-3', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_06_04]: { name: 'Test 6-4', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SKILL_06_05]: { name: 'Test 6-5', description: 'Placeholder skill', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },

  // Secondary page skills (6x5 = 30 total)
  // Row 1
  [SKILL_TYPES.SEC_SKILL_01_01]: { name: 'Вторично умение 1-1', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SEC_SKILL_01_02]: { name: 'Вторично умение 1-2', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SEC_SKILL_01_03]: { name: 'Вторично умение 1-3', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SEC_SKILL_01_04]: { name: 'Вторично умение 1-4', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SEC_SKILL_01_05]: { name: 'Вторично умение 1-5', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  // Row 2
  [SKILL_TYPES.SEC_SKILL_02_01]: { name: 'Вторично умение 2-1', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SEC_SKILL_02_02]: { name: 'Вторично умение 2-2', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SEC_SKILL_02_03]: { name: 'Вторично умение 2-3', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SEC_SKILL_02_04]: { name: 'Вторично умение 2-4', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SEC_SKILL_02_05]: { name: 'Вторично умение 2-5', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  // Row 3
  [SKILL_TYPES.SEC_SKILL_03_01]: { name: 'Вторично умение 3-1', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SEC_SKILL_03_02]: { name: 'Вторично умение 3-2', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SEC_SKILL_03_03]: { name: 'Вторично умение 3-3', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SEC_SKILL_03_04]: { name: 'Вторично умение 3-4', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SEC_SKILL_03_05]: { name: 'Вторично умение 3-5', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  // Row 4
  [SKILL_TYPES.SEC_SKILL_04_01]: { name: 'Вторично умение 4-1', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SEC_SKILL_04_02]: { name: 'Вторично умение 4-2', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SEC_SKILL_04_03]: { name: 'Вторично умение 4-3', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SEC_SKILL_04_04]: { name: 'Вторично умение 4-4', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SEC_SKILL_04_05]: { name: 'Вторично умение 4-5', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  // Row 5
  [SKILL_TYPES.SEC_SKILL_05_01]: { name: 'Вторично умение 5-1', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SEC_SKILL_05_02]: { name: 'Вторично умение 5-2', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SEC_SKILL_05_03]: { name: 'Вторично умение 5-3', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SEC_SKILL_05_04]: { name: 'Вторично умение 5-4', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SEC_SKILL_05_05]: { name: 'Вторично умение 5-5', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  // Row 6
  [SKILL_TYPES.SEC_SKILL_06_01]: { name: 'Вторично умение 6-1', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SEC_SKILL_06_02]: { name: 'Вторично умение 6-2', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SEC_SKILL_06_03]: { name: 'Вторично умение 6-3', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SEC_SKILL_06_04]: { name: 'Вторично умение 6-4', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 },
  [SKILL_TYPES.SEC_SKILL_06_05]: { name: 'Вторично умение 6-5', description: 'Placeholder skill от вторична страница', unlocked: false, prerequisites: [], levelCosts: [0], resourceType: RESOURCE_TYPES.NONE, resourceCost: 0, iconRow: 1, iconCol: 1 }
};

// Export all constants and data for use in other files
window.SKILL_TYPES = SKILL_TYPES;
window.SKILL_PAGES = SKILL_PAGES;
window.RESOURCE_TYPES = RESOURCE_TYPES;
window.DAMAGE_TYPES = DAMAGE_TYPES;
window.RANGE_TYPES = RANGE_TYPES;
window.TARGET_TYPES = TARGET_TYPES;
window.SKILL_TREE = SKILL_TREE;
