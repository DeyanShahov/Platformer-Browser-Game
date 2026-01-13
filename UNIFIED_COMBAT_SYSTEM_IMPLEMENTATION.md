# 🎯 UNIFIED COMBAT SYSTEM IMPLEMENTATION PLAN

## 📋 Overview
This document outlines the implementation plan for unifying the combat system between players and enemies in the Platformer Browser Game. The goal is to create a single, consistent combat calculation system while maintaining the complexity for players and simplicity for enemies.

**Status:** Planning Phase - Ready for Review and Approval
**Estimated Implementation Time:** 2-3 hours
**Risk Level:** Medium (affects core gameplay mechanics)

---

## 🎯 Current State Analysis

### **Players Combat System:**
- **Attack Calculation**: `baseAttack + strength + equipment + buffs - debuffs + skillModifier`
- **Skill Types**: SKILL_TYPES constants (`BASIC_ATTACK_LIGHT`, `BASIC_ATTACK_MEDIUM`, etc.)
- **Modifiers**: Equipment bonuses, skill tree modifiers, buffs/debuffs, critical hits (10%)
- **Complexity**: High - full RPG system

### **Enemies Combat System:**
- **Attack Calculation**: `baseAttack` (simple, no modifiers)
- **Skill Types**: Raw strings (`'ATTACK_1'`, `'ATTACK_2'`, `'ATTACK_3'`)
- **Modifiers**: None (no equipment, buffs, debuffs), critical hits (5%)
- **Complexity**: Low - arcade style

### **Problems Identified:**
1. **Inconsistent attack power** - Different properties used (`baseAttack` vs `attackPower`)
2. **Different skill type formats** - Players use SKILL_TYPES, enemies use raw strings
3. **Enemies have no attack differentiation** - All attacks deal same damage
4. **Animation data not utilized** - Attack box widths could determine attack strength

---

## 🎯 Implementation Plan

### **Core Architecture Changes**

#### **1. Unified Attack Power Calculation**
**File:** `combat_system.js` - `CombatCalculator.calculateAttackPower()`
**Status:** [ ] Not Started

**Current Code:**
```javascript
// Handle enemy attackers (simple fixed attack power)
if (attacker.entityType === 'enemy') {
  const baseAttack = attacker.attackPower || attacker.enemyData?.attackPower || 5;
  return Math.max(0, baseAttack);
}
```

**New Unified Code:**
```javascript
calculateAttackPower(attacker, skillType) {
  // 1. Get unified base attack
  let attackPower = this.getBaseAttack(attacker);

  // 2. Apply entity-specific modifiers
  if (attacker.entityType === 'enemy') {
    // Simple enemy system with attack multipliers
    attackPower *= this.getEnemyAttackMultiplier(attacker, skillType);
  } else {
    // Complex player system (unchanged)
    attackPower += this.getPlayerAttackModifiers(attacker, skillType);
  }

  return Math.max(0, attackPower);
}
```

**New Helper Methods:**
```javascript
getBaseAttack(attacker) {
  // Unified base attack retrieval
  return attacker.baseAttack ||
         attacker.characterInfo?.baseAttack ||
         (attacker.entityType === 'enemy' ? 10 : 5);
}

getEnemyAttackMultiplier(attacker, skillType) {
  // Get attack multiplier from animation data
  const attackBox = this.getCurrentAttackBox(attacker, skillType);
  if (attackBox) {
    // Width-based multiplier (30px = 1.0x baseline)
    return Math.max(0.5, Math.min(2.5, attackBox.width / 30));
  }

  // Fallback multipliers
  const fallbacks = {
    'enemy_attack_light': 1.5,
    'enemy_attack_medium': 1.0,
    'enemy_attack_heavy': 1.3,
    'enemy_run_attack': 1.2
  };
  return fallbacks[skillType] || 1.0;
}
```

#### **2. Enemy Attack Multipliers Based on Animation Data**
**File:** `combat_system.js` - New method `getCurrentAttackBox()`
**Status:** [ ] Not Started

**Implementation:**
```javascript
getCurrentAttackBox(attacker, skillType) {
  // Get attack box from current animation frame
  if (!attacker.animation?.animationDefinition) return null;

  const currentFrame = attacker.animation.currentFrame;
  const frameData = attacker.animation.animationDefinition.frameData?.[currentFrame];

  return frameData?.attackBox || null;
}
```

**Current Blue Slime Attack Box Data:**
- **ATTACK_1**: `width: 55` → **1.83x multiplier** (strongest)
- **ATTACK_2**: `width: 30` → **1.0x multiplier** (baseline)
- **ATTACK_3**: `width: 30` → **1.0x multiplier** (baseline)
- **RUN_ATTACK**: `width: 30` → **1.0x multiplier** (baseline)

#### **3. Standardized Enemy Skill Types**
**File:** `Animation System/animation_state_machine.js` - `EnemyAnimationStateMachine.getCurrentAttackType()`
**Status:** [ ] Not Started

**Current Code:**
```javascript
getCurrentAttackType() {
  if (this.currentState && this.currentState.name === 'enemy_attack') {
    return this.currentState.attackType; // Returns 'ATTACK_1', 'ATTACK_2', etc.
  }
  return null;
}
```

**New Code:**
```javascript
// Enemy skill type mapping
const ENEMY_ATTACK_TYPE_MAPPING = {
  'ATTACK_1': 'enemy_attack_light',
  'ATTACK_2': 'enemy_attack_medium',
  'ATTACK_3': 'enemy_attack_heavy',
  'RUN_ATTACK': 'enemy_run_attack'
};

getCurrentAttackType() {
  if (this.currentState && this.currentState.name === 'enemy_attack') {
    const rawType = this.currentState.attackType;
    return ENEMY_ATTACK_TYPE_MAPPING[rawType] || 'enemy_attack_light';
  }
  return null;
}
```

#### **4. Unified Defense Calculation**
**File:** `combat_system.js` - `CombatCalculator.calculateDefense()`
**Status:** [ ] Not Started

**Current Code:** Only works for players with characterInfo

**New Unified Code:**
```javascript
calculateDefense(defender) {
  // Base defense (unified for all entities)
  let defense = defender.characterInfo?.baseDefense || 0;

  if (defender.entityType === 'enemy') {
    // Enemies get simple level-based defense bonus
    defense += (defender.level - 1) * 2;
  } else {
    // Players get full modifier system (unchanged)
    defense += this.getEquipmentDefenseBonus(defender);
    defense += this.getBuffDefenseBonus(defender);
    defense -= this.getDebuffDefensePenalty(defender);
  }

  return Math.max(0, defense);
}
```

#### **5. Skill Tree Integration Bypass for Enemies**
**File:** `combat_system.js` - `calculateAttackPower()`
**Status:** [ ] Not Started

**Current Issue:** Code tries to find skill info for enemy attacks
```javascript
const skillInfo = window.skillTreeManager ? window.skillTreeManager.getSkillInfo(skillType) : null;
```

**Fix:** Skip skill tree lookup for enemy attacks
```javascript
// Skip skill tree modifiers for enemies
if (attacker.entityType === 'enemy') {
  return attackPower; // No skill modifiers for enemies
}

// Player skill modifiers (unchanged)
const skillInfo = window.skillTreeManager ? window.skillTreeManager.getSkillInfo(skillType) : null;
```

---

## 🧪 Testing Requirements

### **Enemy Attack Testing**
- [ ] **Blue Slime ATTACK_1**: Deals ~18-22 damage (10 baseAttack * 1.83 multiplier)
- [ ] **Blue Slime ATTACK_2/3**: Deals ~10 damage (10 baseAttack * 1.0 multiplier)
- [ ] **Damage numbers display**: All enemy attacks show damage numbers
- [ ] **Player health reduction**: Player health decreases when hit by enemies

### **Player Attack Testing**
- [ ] **Existing modifiers work**: Equipment, buffs, skill tree bonuses apply
- [ ] **Critical hits work**: 10% crit chance maintained
- [ ] **Complex calculations preserved**: No regression in player damage

### **Defense Testing**
- [ ] **Enemy defense**: Level-based bonuses work (level 2 enemy gets +2 defense)
- [ ] **Player defense**: Equipment/buff system unchanged
- [ ] **Base defense**: Works for both entity types

---

## 📋 Implementation Checklist

### **Phase 1: Core Attack System Unification**
- [ ] Modify `calculateAttackPower()` to use unified `getBaseAttack()`
- [ ] Add `getEnemyAttackMultiplier()` method with attackBox width logic
- [ ] Implement `getCurrentAttackBox()` helper method
- [ ] Test enemy attack multipliers work correctly

### **Phase 2: Skill Type Standardization**
- [ ] Add `ENEMY_ATTACK_TYPE_MAPPING` constant
- [ ] Modify `EnemyAnimationStateMachine.getCurrentAttackType()` to return standardized types
- [ ] Update `game.js` enemy attack calls to use new skill types
- [ ] Verify enemy attacks still trigger with new skill types

### **Phase 3: Defense System Unification**
- [ ] Modify `calculateDefense()` to handle both players and enemies
- [ ] Add level-based defense bonuses for enemies
- [ ] Test defense calculations for both entity types

### **Phase 4: Skill Tree Integration**
- [ ] Add enemy check to skip skill tree modifiers in `calculateAttackPower()`
- [ ] Verify player skill modifiers still work
- [ ] Test that enemy attacks don't break skill tree lookups

### **Phase 5: Comprehensive Testing**
- [ ] Full enemy attack testing (all attack types)
- [ ] Player attack regression testing
- [ ] Defense system testing
- [ ] Damage number display verification
- [ ] Performance testing (no FPS drops)

---

## 🔧 Technical Details

### **Files Modified:**
1. `combat_system.js` - Core calculation methods
2. `Animation System/animation_state_machine.js` - Enemy skill type mapping
3. `game.js` - Enemy attack resolution calls
4. `base_enemy.js` - Enemy properties verification

### **New Constants:**
```javascript
// In animation_state_machine.js
const ENEMY_ATTACK_TYPE_MAPPING = {
  'ATTACK_1': 'enemy_attack_light',
  'ATTACK_2': 'enemy_attack_medium',
  'ATTACK_3': 'enemy_attack_heavy',
  'RUN_ATTACK': 'enemy_run_attack'
};
```

### **New Methods:**
- `CombatCalculator.getBaseAttack(attacker)`
- `CombatCalculator.getEnemyAttackMultiplier(attacker, skillType)`
- `CombatCalculator.getCurrentAttackBox(attacker, skillType)`

### **Modified Methods:**
- `CombatCalculator.calculateAttackPower(attacker, skillType)`
- `CombatCalculator.calculateDefense(defender)`
- `EnemyAnimationStateMachine.getCurrentAttackType()`

---

## ⚠️ Risks and Mitigations

### **High Risk Issues:**
1. **Player Combat Regression** - Complex player system could break
   - **Mitigation:** Comprehensive player testing before/after changes

2. **Enemy Attack Balance** - New multipliers could make enemies too strong/weak
   - **Mitigation:** Start with conservative multipliers, test and adjust

3. **Skill Tree Conflicts** - Enemy skill types might conflict with player skills
   - **Mitigation:** Use 'enemy_' prefix for all enemy skill types

### **Medium Risk Issues:**
1. **Animation Data Dependency** - Relies on attackBox width data
   - **Mitigation:** Fallback multipliers for missing animation data

2. **Performance Impact** - Additional calculations per attack
   - **Mitigation:** Minimal calculations, cache where possible

---

## 🎯 Expected Results

### **Enemies:**
- **Differentiated damage**: ATTACK_1 deals ~83% more damage than ATTACK_2/3
- **Animation-driven balance**: Stronger attacks have wider attack boxes
- **Consistent damage numbers**: Always display damage dealt
- **Proper player damage**: Player health decreases correctly

### **Players:**
- **No changes**: All existing modifiers, skills, equipment work unchanged
- **Critical hits**: 10% chance maintained
- **Skill tree bonuses**: All skill modifiers apply correctly

### **System Benefits:**
- ✅ **Unified codebase**: Single combat calculation system
- ✅ **Animation integration**: Attack strength based on visual attack boxes
- ✅ **Scalable**: Easy to add new enemy types with different attack strengths
- ✅ **Maintainable**: Single source of truth for all combat calculations
- ✅ **Backwards compatible**: Existing player features preserved

---

## ❓ Open Questions & Decisions

1. **Enemy base attack scaling**: Should `baseAttack` scale with level?
   - Current: `baseAttack` is fixed, only multipliers vary
   - Alternative: `baseAttack + (level-1) * 2`

2. **Critical hit differences**: Keep separate crit chances (players 10%, enemies 5%)?
   - Current: Different rates maintained
   - Alternative: Unified 10% for all

3. **Defense scaling for enemies**: Beyond level bonuses?
   - Current: Only level-based (+2 per level)
   - Alternative: Rarity-based multipliers

4. **Attack multiplier bounds**: Current 0.5x - 2.5x range appropriate?
   - Current: Conservative range to prevent balance issues
   - Alternative: Wider range (0.3x - 3.0x)

---

## 📝 Approval Checklist

- [ ] **Plan Review Complete**: All team members have reviewed the implementation plan
- [ ] **Risk Assessment Done**: All risks identified and mitigations planned
- [ ] **Testing Strategy Approved**: Comprehensive testing plan in place
- [ ] **Backup Plan Ready**: Rollback strategy if issues arise
- [ ] **Timeline Approved**: 2-3 hour implementation window acceptable
- [ ] **Resource Allocation**: Developer time allocated for implementation

---

*Document Version: 1.0*
*Last Updated: January 1, 2026*
*Next Review: Before implementation begins*
