# Combat System Specifications

## Общ преглед
Бойната система е разделена на **четири основни фази** с **mandatory gate** система:

### Combat Flow (с Hit/Miss като gatekeeper):
1. **Фаза 1: Hit/Miss check** - **MANDATORY GATE**
   - Ако **fail** → Края на атаката ("избягване" или "пропускане")
   - Ако **success** → Продължава към Фаза 2

2. **Фаза 2: Block Check** - Ако уцели, редуцира attack power (damage absorption)
3. **Фаза 3: Parry Check** - Ако block fail, редуцира attack power (damage redirection)
4. **Фаза 4: Damage Calculation** - Изчислява финалните щети от reduced attack power

### Key Mechanics:
- **Hit/Miss as Gate**: Без успешно попадане няма block/parry/damage
- **Block vs Parry**: Mutually exclusive - ако block успее, няма parry check
- **Attack Power Reduction**: Block/Parry редуцират attack power преди damage calculation
- **Final Damage Reduction**: Допълнителни редукции преди apply to health

## Фаза 1: Hit/Miss изчисление

### Основни правила
- **Максимален шанс за удар: 95%** (винаги има 5% шанс да се пропусне)
- **Твърд лимит**: Не може да се надвиши дори с предмети/скилове
- **Две независими системи**: Collision (визуално) + Hit chance формула
- **Врагове имат отделна логика**: По-прости правила за AI

### Формула за hit chance

#### Raw Calculation (може да надвишава лимити):
```
rawHitChance = baseHitChance + attackerBonuses - defenderDodge + levelModifier
```

#### Компоненти:
- `baseHitChance = 95%` - Базов шанс за удар
- `attackerBonuses` - Бонуси от skills, items (accuracy, etc.) - **могат да доведат до >95%**
- `defenderDodge` - Шанс за отбягване (max 80%)
- `levelModifier = (attackerLevel - defenderLevel) × 2%`

#### Level modifier правила:
- Ако `attackerLevel > defenderLevel`: **+2%** за удар на всеки level разлика
- Ако `defenderLevel > attackerLevel`: **+2%** за отбягване на всеки level разлика
- Максимално ±40% при 20 levels разлика

#### Final Roll Chance (clamp-ната):
```
finalHitChance = clamp(rawHitChance, 5%, 95%)
```
- **Минимум**: 5% (винаги шанс да уцели)
- **Максимум**: 95% (винаги 5% шанс да пропусне)

### Финално решение:
1. Изчисли `rawHitChance` (може да е >95% от skills/equipment)
2. Капни `finalHitChance` в диапазона 5%-95%
3. Random roll: 1-100
4. Ако `roll ≤ finalHitChance` → **HIT** (премини към Фаза 2)
5. Ако `roll > finalHitChance` → **MISS** (край на атаката)

### Пример:
```
Нападател: level 10, +10% от skills
Защитник: level 5, 10% dodge
Сметка: 95 + 10 - 10 + (10-5)×2 = 105%
Капнато: min(95%, 105%) = 95%
Roll 1-95 = HIT, 96-100 = MISS
```

## Фаза 2: Block Check

### Основни правила
- **Block mechanics**: Абсорбира щети към защитника (50%-100% според екипировка)
- **Block types**: Shield, one-handed weapon, two-handed weapon
- **Максимален block шанс: 75%**
- **Random roll**: 1-100 system

### Block Chance Calculation

#### Raw Calculation (може да надвишава 75%):
```
rawBlockChance = equipmentBase + weaponStats + skillBonuses
```

#### Equipment Base Bonuses:
- **Any melee weapon equipped** (except bow): +5% block chance
- **Shield equipped**: +25% block chance (and up depending on equipment)
- **Dual wielding**: 2 × weapon bonus (10%) + additional 10% = 20% block chance
- **Unarmed**: No base bonuses (0%)
- **Ranged weapons**: Block chance = 0%

#### Weapon Stats:
- Weapons can have additional `blockChance` stat
- Example: Sword with +10% block chance

#### Skill Bonuses:
- Passive and active skills can modify block chance (могат да доведат до >75%)

#### Final Roll Chance (clamp-ната):
```
finalBlockChance = max(0%, min(75%, rawBlockChance))
```
- **Минимум**: 0% (няма смисъл от negative block)
- **Максимум**: 75% (твърд лимит за rolls)

### Block Resolution:
1. Изчисли `rawBlockChance` (може да е >75% от skills/equipment)
2. Капни `finalBlockChance` в диапазона 0%-75%
3. Random roll: 1-100
4. Ако `roll ≤ finalBlockChance` → **BLOCKED** (damage absorption)
5. Ако `roll > finalBlockChance` → преминава към Фаза 3

### Blocked Attack Mechanics:

#### Attack Power Reduction Formula:
```
reducedAttackPower = originalAttackPower × (1 - absorptionRate)
absorptionRate = min(100%, 50% + equipmentBonus + skillBuffBonus)
```

#### Absorption Components:
- **Base absorption**: 50% of attack power
- **Equipment bonus**: Additional reduction from shield stats (damageReduction property)
- **Skill/Buff bonus**: Additional reduction from skills/buffs
- **Maximum absorption**: 100% (complete mitigation)

#### Resolution:
- **Reduced attack power** се използва в damage calculation: `max(0, reducedAttack - defense)`
- **No parry check**: Block и parry са mutually exclusive
- Ако `reducedAttack ≤ defense` → **FULLY BLOCKED** (0 damage)

#### Example:
```
Original attack power: 100
Base absorption: 50% (reduces to 50)
Shield bonus: +20% absorption (reduces to 30)
Final damage: max(0, 30 - defenderDefense)
```

## Фаза 3: Parry Check

### Основни правила
- **Parry mechanics**: Пренасочва щети (до 50% redirection)
- **Requirements**: One weapon equipped
- **Максимален parry шанс: 75%**
- **Random roll**: 1-100 system

### Parry Chance Calculation

#### Raw Calculation (може да надвишава 75%):
```
rawParryChance = equipmentBase + weaponStats + skillBonuses
```

#### Equipment Base Bonuses:
- **One weapon equipped**: +5% parry chance
- **Dual wielding**: 2 × weapon bonus = 10% parry chance (no extra bonus)
- **Unarmed**: No base bonuses (0%)
- **Ranged weapons**: Parry chance = 0%

#### Weapon Stats:
- Weapons can have additional `parryChance` stat
- Example: Sword with +10% parry chance

#### Skill Bonuses:
- Passive and active skills can modify parry chance (могат да доведат до >75%)

#### Final Roll Chance (clamp-ната):
```
finalParryChance = max(0%, min(75%, rawParryChance))
```
- **Минимум**: 0% (няма смисъл от negative parry)
- **Максимум**: 75% (твърд лимит за rolls)

### Parry Resolution:
1. Изчисли `rawParryChance` (може да е >75% от skills/equipment)
2. Капни `finalParryChance` в диапазона 0%-75%
3. Random roll: 1-100
4. Ако `roll ≤ finalParryChance` → **PARRIED** (damage redirection)
5. Ако `roll > finalParryChance` → **HIT** (normal damage in Фаза 4)

### Parried Attack Mechanics:

#### Attack Power Reduction Formula:
```
reducedAttackPower = originalAttackPower × (1 - redirectionRate)
redirectionRate = 50%  // Fixed rate for parry
```

#### Mechanics:
- **Fixed reduction**: 50% of attack power is redirected
- **Remaining attack power**: The other 50% goes to damage calculation
- **No absorption**: Unlike block, parry redirects rather than absorbs
- **Possible counter-attack**: May deal damage back to attacker (future feature)

#### Resolution:
- **Reduced attack power** се използва в damage calculation: `max(0, reducedAttack - defense)`
- **Always partial**: Parry never fully mitigates (unlike block)
- **Standard damage**: Remaining attack power follows normal damage calculation
- **Visual feedback**: Special parry animation/effect

#### Example:
```
Original attack power: 100
Parry redirection: 50% (reduces to 50)
Final damage: max(0, 50 - defenderDefense)
```

#### Difference from Block:
- **Block**: Absorption (variable 50%-100%) - can fully mitigate
- **Parry**: Redirection (fixed 50%) - always partial mitigation

## Допълнителни правила

### Dual Wielding Penalties:
- **Hit chance penalty**: -25% (95% → 70% base)
- **Must be compensated**: Through skills and stats
- **Trade-off**: More attacks possible

### Equipment Integration:
- Block/Parry chances derived from equipment
- Not separate character stats
- All entities (players & enemies) can block/parry

## Фаза 4: Damage Calculation

### Comprehensive Modifier System (RPG-style):

#### Core Architecture:
```javascript
// Universal modifier object for any stat
const statModifiers = {
  statName: {
    base: number,                    // Base value
    flatBonuses: number[],          // [+10, +15, +5] from items/skills/buffs
    percentBonuses: number[],       // [0.2, 0.1] = +20%, +10% from effects
    multipliers: number[]           // [1.1, 1.05] = ×1.1, ×1.05 from effects
  }
}

// Unified calculation function
function getModifiedStat(statName, entity) {
  const mods = entity.modifiers[statName];

  // Start with base value
  let value = mods.base;

  // Apply flat bonuses (additive)
  value += mods.flatBonuses.reduce((sum, bonus) => sum + bonus, 0);

  // Apply percentage bonuses (additive percentages)
  const percentTotal = mods.percentBonuses.reduce((sum, bonus) => sum + bonus, 0);
  value *= (1 + percentTotal);

  // Apply multipliers (multiplicative)
  const multiplierTotal = mods.multipliers.reduce((product, mult) => product * mult, 1);
  value *= multiplierTotal;

  return Math.max(0, value);
}
```

#### Modifier Sources (Dynamic):
- **Equipment**: Weapons, armor, accessories provide flat/percent bonuses
- **Skills**: Passive skills provide ongoing modifiers
- **Buffs**: Temporary positive effects (potions, spells)
- **Debuffs**: Temporary negative effects (curses, poisons)
- **Status Effects**: Ongoing conditions (berserk, weakened)
- **Environmental**: Zone effects, weather, etc.

#### Stats That Can Be Modified:
- `attackPower` - Physical/magical attack strength
- `defense` - Physical/magical defense
- `hitChance` - Accuracy for attacks
- `dodgeChance` - Chance to avoid attacks
- `blockChance` - Chance to block attacks
- `parryChance` - Chance to parry attacks
- `criticalChance` - Chance for critical hits
- `criticalMultiplier` - Critical hit damage multiplier
- `damageReduction` - Flat damage reduction %
- `magicResistance.fire` - Elemental resistances
- `magicResistance.cold` - etc.
- `maxHealth` - Health pool modifications
- `healthRegen` - Health regeneration
- `movementSpeed` - Movement modifications

#### Calculation Pipeline:
```javascript
// Example: Attack Power Calculation
const attackPower = getModifiedStat('attackPower', attacker);

// Example: Hit Chance Calculation
const rawHitChance = getModifiedStat('hitChance', attacker);
const dodgeChance = getModifiedStat('dodgeChance', defender);
const finalHitChance = Math.min(95, Math.max(5, rawHitChance - dodgeChance));

// Example: Damage Calculation
const damage = Math.max(0, attackPower - getModifiedStat('defense', defender));
const critChance = getModifiedStat('criticalChance', attacker);
const isCritical = Math.random() < critChance;
const critMultiplier = isCritical ? getModifiedStat('criticalMultiplier', attacker) : 1;
const finalDamage = damage * critMultiplier;
```

#### Stacking Examples:
```javascript
// Sword (+10 attack) + Strength buff (+20% attack) + Berserk (×1.2 attack)
attackPower = (100 + 10) × (1 + 0.2) × 1.2 = 110 × 1.2 × 1.2 = 158.4

// Leather armor (20% damage reduction) + Shield skill (+15% damage reduction)
damageReduction = (0 + 0) × (1 + 0.2 + 0.15) × 1 = 35%

// Base 10% crit + Crit mastery (+5%) + Lucky charm (×1.1 crit chance)
criticalChance = (0.1 + 0) × (1 + 0 + 0) × 1.1 = 11%
```

### Legacy Formula (Current - will be upgraded):
```
attackPower = baseAttack + strength + equipmentBonus + buffBonus - debuffPenalty + skillModifier
defense = baseDefense + equipmentBonus + buffBonus - debuffPenalty
baseDamage = max(0, attackPower - defense)
finalDamage = baseDamage × (1 + skillModifier) × (isCritical ? 2 : 1)
```

## TODO: За добавяне

### Фаза 1 - Hit/Miss:
- [ ] Потвърди дали baseHitChance е 95% за всички
- [ ] Кои фактори включва attackerBonuses
- [ ] Специфична логика за enemy attacks

### Фаза 2 - Damage:
- [ ] Elemental damage types
- [ ] Armor penetration
- [ ] Critical hit multipliers
- [ ] Damage over time effects

### Общи системи:
- [ ] Status effects (poison, stun, bleed)
- [ ] Combat states (blocking, dodging)
- [ ] Multi-target attacks
- [ ] Area of effect damage

### Баланс:
- [ ] Level scaling формули
- [ ] Equipment stat ranges
- [ ] Skill power progression
