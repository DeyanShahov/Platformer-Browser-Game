# Behavior Tree AI System за Platformer Game

## 📋 Системен Overview

Behavior Tree (BT) системата предоставя интелигентно AI поведение за врагове в платформер играта. Системата е модулна, scalable и лесна за разширение, като използва стандартни BT patterns за decision making.

### 🎯 Основни Принципи
- **Decision Logic отделена от Execution** - BT взима решения, FSM изпълнява действия
- **Data-driven конфигурация** - лесно създаване на различни enemy типове
- **Priority-based behavior** - Selector pattern за йерархични решения
- **Modular architecture** - компоненти могат да се комбинират

---

## 🏗️ Архитектура

### Core Components

#### 1. BT Engine (`enemyAI_BT.js`)
```javascript
BT Nodes:
├── Composites: Selector, Sequence
├── Decorators: Cooldown
├── Leaves: Condition, Action
└── Context: Enemy state, targets, capabilities, behavior constraints
```

#### 2. Universal Enemy Behaviors (`ENEMY_BEHAVIORS`)
```javascript
Rarity Levels: common, elite, boss
Intelligence: basic, normal, advanced

Universal Config Structure:
├── idle: { duration, transitions }
├── patrol: { radiusX, speed, directionLogic, interruptHandling }
├── targetSelection: { strategy, awarenessRadius }
├── chase: { radiusX, speed }
├── attack: { lightChance, mediumChance, heavyChance }
├── block/evade: { useChance }
└── special: { available, cooldown }
```

#### 3. Behavior Constraints System
```javascript
Physical Constraints:
├── Screen boundaries (X/Z limits)
├── Entity collisions
├── Movement restrictions
└── Dynamic behavior filtering
```

#### 4. Integration Layer
```
Enemy Type → Rarity/Intelligence → BT Config → Universal BT Logic
    ↓
BT System → Context-aware Decision → Movement System → FSM Actions
    ↓
Physical Constraints ← Environment State ← Collision Detection
```

### 📊 Data Flow

1. **Context Update** - Събиране на game state (player positions, distances, HP, etc.)
2. **BT Tick** - Изпълнение на behavior tree за decision making
3. **Command Output** - BT връща COMMAND (idle, patrol, chase, attack, etc.)
4. **Movement Execution** - Movement system интерпретира командата
5. **FSM Integration** - Animation FSM получава action commands

---

## ⚔️ Enemy Types и Behaviors

### Rarity Levels

#### 🟢 Common Enemies
- **Basic AI**: Simple patrol, basic attacks
- **Normal AI**: Better target selection, defensive behaviors
- **Advanced AI**: Complex tactics, special abilities

#### 🟡 Elite Enemies
- **Basic AI**: Coordinated attacks, environmental awareness
- **Normal AI**: Advanced positioning, combo attacks
- **Advanced AI**: Boss-like behaviors, multiple phases

#### 🔴 Boss Enemies
- **Basic AI**: Large scale attacks, area control
- **Normal AI**: Phase transitions, special mechanics
- **Advanced AI**: Adaptive AI, player prediction

### Universal Patrol System

**Patrol Behavior Flow:**
1. **Spawn Idle** → Initial idle period (configured per enemy type)
2. **Idle Timeout** → BT consultation for patrol direction
3. **Direction Selection** → Constraint-based (left/right/both/none)
4. **Patrol Execution** → Movement with continuous constraint checking
5. **Interrupt Handling** → Boundary/Entity/Player/Distance triggers
6. **BT Re-consultation** → Context-aware response to interruption

**Patrol Configuration Structure:**
```javascript
patrol: {
  radiusX: 200,        // Patrol distance
  speed: 50,          // Movement speed
  directionLogic: 'constraint_based', // How to choose direction
  interruptHandling: { // What triggers patrol interruption
    onBoundary: 'reverse',   // Hit screen edge → reverse direction
    onEntity: 'idle',        // Hit entity → idle briefly
    onPlayer: 'chase',       // Player detected → chase
    onDistance: true         // Max distance reached → reverse
  }
}
```

### Blue Slime (Universal Implementation)

```javascript
Current Config: ENEMY_BEHAVIORS.common.basic
{
  idle: { duration: 3 },
  patrol: {
    radiusX: 200, speed: 50,
    directionLogic: 'constraint_based',
    interruptHandling: {
      onBoundary: 'reverse',
      onEntity: 'idle',
      onPlayer: 'chase'
    }
  },
  targetSelection: { strategy: "firstHit" },
  chase: { radiusX: 300, speed: 80 },
  attack: { lightChance: 1.0, mediumChance: 0, heavyChance: 0 },
  meta: { awarenessRadius: 150 }
}
```

**Behavior Flow:**
- **Spawn** → IDLE 3 секунди
- **Idle Timeout** → BT пита за посока (constraint-based)
- **Patrol Start** → Движение с interrupt monitoring
- **Interrupt** → BT преоценява ситуацията
- **Response** → Reverse/Idle/Chase базирано на interrupt тип

---

## 🎯 Attack System Integration

### Attack Type Mapping

BT атаките се map-ват към съществуващите animation системи:

```javascript
BT ATTACK_TYPE → Game ATTACK_TYPE → Animation → FSM Action
LIGHT          → BASIC_ATTACK_LIGHT → Attack_1   → attack_light
MEDIUM         → BASIC_ATTACK_MEDIUM→ Attack_3   → attack_medium
HEAVY          → BASIC_ATTACK_HEAVY → Attack_3   → attack_heavy
```

### Attack Profiles

Всеки enemy има attack profile според rarity/intelligence:

```javascript
// Common/Basic
attack: { lightChance: 1.0, mediumChance: 0, heavyChance: 0 }

// Elite/Advanced
attack: { lightChance: 0.3, mediumChance: 0.4, heavyChance: 0.3 }

// Boss/Advanced
attack: { lightChance: 0.2, mediumChance: 0.4, heavyChance: 0.4 }
```

### Combat Integration

1. **BT Decision**: Избира attack type според profile и situation
2. **Range Check**: Проверява дали target е в attack range (100px)
3. **FSM Trigger**: Изпраща `attack_light/medium/heavy` към FSM
4. **Animation**: FSM изпълнява съответната attack animation
5. **Damage**: Combat system прилага damage при collision

---

## 🎮 Game Integration

### Context Structure

```javascript
Enemy Context = {
  // Self state
  self: { hp, maxHp, x, y, vx, vy },

  // Targets (players)
  targets: [{ distance, hpPercent, damageDone }],

  // Capabilities
  capabilities: { canBlock, canEvade },

  // Behaviors config
  behaviors: ENEMY_BEHAVIORS[rarity][intelligence],

  // Current command output
  command: null
}
```

### Movement System Commands

```javascript
COMMAND.IDLE   → Stop movement, play idle animation
COMMAND.PATROL → Move in patrol pattern around spawn point
COMMAND.CHASE  → Move towards target at chase speed
COMMAND.ATTACK → Stop movement, trigger attack animation
```

### Collision Integration

- **Obstacle Detection**: Raycasting или collision checks за препятствия
- **Pathfinding**: Simple A* или waypoint system за complex navigation
- **Terrain Awareness**: Различни behaviors за различни terrain типове

---

## 🚀 Implementation Roadmap

### Phase 1: Universal BT Architecture ✅
- [x] BT system core implementation with node types
- [x] Rarity/Intelligence-based configurations
- [x] Universal patrol system with constraint awareness
- [x] Context-aware patrol interruption handling
- [x] Dynamic command generation based on physical constraints
- [x] Behavior constraints system integration
- [x] Blue Slime using common/basic configuration

### Phase 2: Enhanced Patrol Behaviors
- [x] Constraint-based direction selection
- [x] Patrol interruption handling (boundary/entity/player/distance)
- [x] Dynamic patrol command generation
- [ ] **NEXT**: Advanced patrol patterns (circular, waypoint-based)

### Phase 3: Combat Enhancement
- [ ] Attack type selection (Light/Medium/Heavy) profiles
- [ ] Defensive behaviors (Block/Evade) integration
- [ ] Combo attack sequences
- [ ] Special ability integration with cooldowns

### Phase 4: Multiple Enemy Types
- [ ] Skeleton warriors (melee focused - elite/normal config)
- [ ] Skeleton archers (ranged attacks - elite/advanced config)
- [ ] Elite knights (advanced tactics - boss/basic config)
- [ ] Boss enemies (phase mechanics - boss/normal/advanced)

### Phase 5: Advanced AI Features
- [ ] Co-op target selection and prioritization
- [ ] Dynamic difficulty adjustment based on player performance
- [ ] Environmental interactions (cover, terrain utilization)
- [ ] Player prediction AI and adaptive behaviors
- [ ] Group AI coordination between multiple enemies

---

## 🔧 Technical Implementation

### BT Node Types

#### Composites
- **Selector**: OR logic, изпълнява до SUCCESS/RUNNING
- **Sequence**: AND logic, изпълнява всички до FAILURE

#### Decorators
- **Cooldown**: Предотвратява прекалено чести actions

#### Conditions
- **hasTarget**: Проверява дали има налична цел
- **targetInRange**: Проверява distance до target
- **canBlock/canEvade**: Проверява capabilities и random chance

#### Actions
- **idleAction**: Връща `{ type: COMMAND.IDLE }`
- **patrolAction**: Връща `{ type: COMMAND.PATROL }`
- **attackAction**: Връща `{ type: COMMAND.ATTACK, attackType: 'light' }`

### Context Management

```javascript
function updateEnemyContext(enemy, players) {
  enemy.context.self = {
    hp: enemy.health,
    maxHp: enemy.maxHealth,
    x: enemy.x, y: enemy.y,
    vx: enemy.vx, vy: enemy.vy
  };

  enemy.context.targets = players.map(player => ({
    distance: Math.abs(enemy.x - player.x),
    hpPercent: (player.health / player.maxHealth) * 100,
    damageDone: player.damageDealt || 0
  }));

  return enemy.context;
}
```

### BT Integration

```javascript
function updateEnemyAI(enemy, dt) {
  // Update context
  const context = updateEnemyContext(enemy, players);

  // Tick BT
  const command = tickEnemyAI(enemy.behaviorTree, context);

  // Execute command
  executeBTCommand(enemy, command);
}

function executeBTCommand(enemy, command) {
  switch(command.type) {
    case COMMAND.IDLE:
      enemy.vx = 0;
      enemy.stateMachine.changeState('idle');
      break;

    case COMMAND.PATROL:
      // Implement patrol logic
      break;

    case COMMAND.CHASE:
      // Implement chase logic
      break;

    case COMMAND.ATTACK:
      enemy.stateMachine.handleAction(`attack_${command.attackType}`);
      break;
  }
}
```

---

## 🎯 Project-Specific Goals

### Short Term (1-2 седмици)
1. **Blue Slime Patrol** - Пълна интеграция на patrol behavior
2. **Movement System** - Collision detection при patrol
3. **Attack Integration** - Light/Medium/Heavy attack mapping

### Medium Term (1 месец)
1. **Multiple Enemies** - 3-4 различни enemy типа
2. **Boss Mechanics** - Phase system за босове
3. **Co-op Features** - Target selection за multiple players

### Long Term (2-3 месеца)
1. **Advanced AI** - Prediction, adaptation, complex tactics
2. **Environmental AI** - Terrain utilization, cover system
3. **Dynamic Difficulty** - AI scaling based on player performance

---

## 📈 Performance Considerations

### Optimization Strategies
- **BT Caching**: Cache BT results за няколко frames
- **Distance Culling**: Деактивирай далечни enemies
- **LOD System**: По-просто AI за далечни enemies
- **Threading**: Web Workers за complex AI calculations

### Memory Management
- **Object Pooling**: Reuse context objects
- **Garbage Collection**: Minimize allocations в update loop
- **State Persistence**: Запазвай AI state между ticks

---

## 🧪 Testing Strategy

### Unit Tests
- BT node behavior verification
- Context update accuracy
- Command execution correctness

### Integration Tests
- Full enemy AI loops
- Multi-enemy scenarios
- Performance benchmarks

### Playtesting
- Player experience validation
- Difficulty balance checks
- Edge case handling

---

## 📚 Resources и References

- **Behavior Tree Documentation**: Standard BT patterns и best practices
- **Game AI Books**: "Artificial Intelligence for Games" от Ian Millington
- **Existing Code**: `Behavior Tree/enemyAI_BT.js` implementation
- **Examples**: `Behavior Tree/example_use_of_BT.js` usage patterns

---

*Тази документация ще се обновява с напредъка на проекта и новите features.*
