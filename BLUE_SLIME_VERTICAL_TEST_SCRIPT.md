# 🎮 Blue Slime Vertical Ping-Pong Test Script

## 📋 Script Specification

**Script ID**: `blue_slime_vertical_test`
**Type**: FULL Script (100% override)
**Purpose**: Test vertical Z-axis movement mechanics
**Behavior**: Continuous up/down movement with boundary-based direction changes

---

## 🎯 Core Concept

Blue Slime performs a "ping-pong" movement pattern on the Z-axis (depth):
- Moves **up** until reaching `Z_MAX - displacement` (top boundary)
- Automatically switches to **down** movement
- Moves **down** until reaching `Z_MIN + displacement` (bottom boundary)
- Automatically switches to **up** movement
- Repeats indefinitely

This creates a smooth, predictable vertical bouncing behavior perfect for testing the new Z-axis movement system.

---

## 🔧 Technical Implementation

### **Script Definition**

```javascript
// File: Behavior Tree/enemy_scripts.js
const TEST_SCRIPTS = {
  blueSlimeVerticalPingPong: {
    id: "blue_slime_vertical_test",
    type: SCRIPT_TYPE.FULL,
    name: "Blue Slime - Vertical Ping-Pong Test",

    behaviors: {
      verticalPingPong: {
        // Movement parameters
        displacement: 50,           // Units to move each time (exactly 50 as requested)
        speed: Z_SPEED,            // Use player movement speed (200 units/sec)

        // Boundary settings
        boundaries: {
          min: Z_MIN,             // -450 (bottom limit)
          max: Z_MAX              // 200 (top limit)
        },

        // Movement logic
        directionLogic: "boundary_based",  // Auto-switch at boundaries
        hysteresis: 10,           // Prevent rapid switching near boundaries
      }
    },

    // Behavior Tree - single action that determines movement direction
    behaviorTree: new Selector([
      new Action(ctx => {
        const config = ctx.behaviors.verticalPingPong;
        const currentZ = ctx.self.z;

        // Calculate effective boundaries with displacement
        const topBoundary = config.boundaries.max - config.displacement;
        const bottomBoundary = config.boundaries.min + config.displacement;

        // Determine movement direction based on current position
        let direction;

        if (currentZ >= topBoundary) {
          // At or near top boundary - move down
          direction = "down";
          console.log(`[VERTICAL_TEST] At top boundary (${currentZ.toFixed(1)}), switching to DOWN`);
        } else if (currentZ <= bottomBoundary) {
          // At or near bottom boundary - move up
          direction = "up";
          console.log(`[VERTICAL_TEST] At bottom boundary (${currentZ.toFixed(1)}), switching to UP`);
        } else {
          // In middle zone - continue current direction or choose based on position
          const middlePoint = (config.boundaries.max + config.boundaries.min) / 2;
          direction = currentZ > middlePoint ? "down" : "up";
          console.log(`[VERTICAL_TEST] In middle zone (${currentZ.toFixed(1)}), continuing ${direction.toUpperCase()}`);
        }

        // Return movement command
        return {
          type: direction === "up" ? COMMAND.MOVE_UP : COMMAND.MOVE_DOWN,
          displacement: config.displacement,
          speed: config.speed,
          boundaries: config.boundaries
        };
      })
    ])
  }
};
```

### **Blue Slime Integration**

```javascript
// File: base_enemy.js - BlueSlime class modification
class BlueSlime extends BaseEnemy {
  constructor(x, y, z, level = 1) {
    super(x, y, z, {
      // Existing config...
      rarity: 'common',
      intelligence: 'basic',

      // NEW: Test script configuration
      scriptConfig: {
        scriptId: 'blue_slime_vertical_test',
        type: SCRIPT_TYPE.FULL
      }
    });

    // Override: This enemy now ONLY does vertical ping-pong movement
    // All other behaviors (attack, patrol, chase) are disabled by FULL script
  }

  // Optional: Custom logging for test purposes
  updateAI(players, dt) {
    console.log(`[BLUE_SLIME_TEST] Position: x=${this.x.toFixed(1)}, z=${this.z.toFixed(1)}, vz=${this.vz.toFixed(1)}`);
    super.updateAI(players, dt);
  }
}
```

### **Movement Execution Logic**

```javascript
// File: base_enemy.js - executePendingCommand additions
case 'move_up':
  console.log(`[VERTICAL_TEST] Executing MOVE_UP command`);
  if (this.stateMachine) {
    this.stateMachine.changeState('enemy_walking');
  }

  // Calculate target position (current + displacement, clamped to boundaries)
  this.targetZ = Math.min(this.z + command.displacement, Z_MAX);
  this.vz = command.speed; // Positive Z = up
  this.verticalMovementStartZ = this.z;

  console.log(`[VERTICAL_TEST] Moving UP: ${this.z.toFixed(1)} → ${this.targetZ.toFixed(1)}`);
  break;

case 'move_down':
  console.log(`[VERTICAL_TEST] Executing MOVE_DOWN command`);
  if (this.stateMachine) {
    this.stateMachine.changeState('enemy_walking');
  }

  // Calculate target position (current - displacement, clamped to boundaries)
  this.targetZ = Math.max(this.z - command.displacement, Z_MIN);
  this.vz = -command.speed; // Negative Z = down
  this.verticalMovementStartZ = this.z;

  console.log(`[VERTICAL_TEST] Moving DOWN: ${this.z.toFixed(1)} → ${this.targetZ.toFixed(1)}`);
  break;
```

---

## 📊 Movement Pattern Analysis

### **Boundary-Based Direction Logic**

```
Z Position Ranges:
┌─────────────────────────────────────┐ Z = 200 (Z_MAX)
│         ↑ FORCED DOWN ZONE ↑         │ Z = 200 - 50 = 150
├─────────────────────────────────────┤
│       ↕ FREE MOVEMENT ZONE ↕        │ Z = 150 to -400
├─────────────────────────────────────┤
│        ↓ FORCED UP ZONE ↓           │ Z = -450 + 50 = -400
└─────────────────────────────────────┘ Z = -450 (Z_MIN)
```

**Movement Rules:**
1. **When Z ≥ 150**: Always choose DOWN (approaching top boundary)
2. **When Z ≤ -400**: Always choose UP (approaching bottom boundary)
3. **When -400 < Z < 150**: Choose based on middle point (Z = -125)

### **Example Movement Sequence**

```
Start: Z = 0 (middle)
1. Z = 0 < middle (-125) → Choose UP → Move to Z = 50
2. Z = 50 < middle (-125) → Choose UP → Move to Z = 100
3. Z = 100 < middle (-125) → Choose UP → Move to Z = 150
4. Z = 150 ≥ 150 → Choose DOWN → Move to Z = 100
5. Z = 100 > middle (-125) → Choose DOWN → Move to Z = 50
6. Z = 50 > middle (-125) → Choose DOWN → Move to Z = 0
7. Z = 0 < middle (-125) → Choose UP → Move to Z = 50
... (repeats)
```

---

## 🧪 Testing & Validation

### **Console Debug Output**
```
[VERTICAL_TEST] At top boundary (150.0), switching to DOWN
[VERTICAL_TEST] Moving DOWN: 150.0 → 100.0
[VERTICAL_TEST] Executing MOVE_DOWN command
[BLUE_SLIME_TEST] Position: x=400.0, z=150.0, vz=-200.0
[BLUE_SLIME_TEST] Position: x=400.0, z=100.0, vz=0.0
[VERTICAL_TEST] In middle zone (100.0), continuing DOWN
[VERTICAL_TEST] Moving DOWN: 100.0 → 50.0
```

### **Expected Behavior**
- ✅ Smooth vertical bouncing between Z_MIN and Z_MAX
- ✅ 50-unit displacement per movement
- ✅ Automatic direction changes at boundaries
- ✅ No horizontal movement (X remains constant)
- ✅ Ignores all combat/player interactions
- ✅ Works within existing Z-axis movement system

### **Debug Commands**
```javascript
// Spawn test Blue Slime
const testSlime = new BlueSlime(400, 300, 0, 1);
window.gameState.addEntity(testSlime);

// Force script on existing enemy
window.enemyScriptManager.switchScript(existingEnemy, 'blue_slime_vertical_test');

// Monitor position
setInterval(() => {
  console.log(`Blue Slime Z: ${testSlime.z.toFixed(1)}`);
}, 1000);
```

---

## 🔧 Integration Requirements

### **Dependencies**
- ✅ `SCRIPT_TYPE.FULL` defined in `enemy_ai_config.js`
- ✅ `COMMAND.MOVE_UP`, `COMMAND.MOVE_DOWN` defined in `enemyAI_BT.js`
- ✅ Vertical movement logic in `base_enemy.js`
- ✅ Script manager in `enemy_script_manager.js`
- ✅ Script registry in `enemy_scripts.js`

### **Files to Modify**
1. `Behavior Tree/enemy_scripts.js` - Add TEST_SCRIPTS section
2. `base_enemy.js` - BlueSlime constructor modification
3. `Behavior Tree/enemy_script_manager.js` - Loading logic
4. `Behavior Tree/enemy_ai_config.js` - Script type validation

### **Testing Checklist**
- [ ] Blue Slime spawns with vertical movement only
- [ ] Movement stays within Z_MIN (-450) and Z_MAX (200)
- [ ] Direction changes correctly at boundaries
- [ ] 50-unit displacement per movement
- [ ] Smooth animation using Z_SPEED (200)
- [ ] No interference from other AI systems
- [ ] Console logging shows correct decision making

---

## 🎯 Success Criteria

**Functional Requirements:**
- Blue Slime moves only vertically in ping-pong pattern
- Respects Z-axis boundaries perfectly
- Uses exactly 50-unit displacements
- Automatic direction changes work flawlessly

**Technical Requirements:**
- Integrates with existing script system architecture
- Maintains performance (<5ms execution time)
- Provides comprehensive debug logging
- Easy to enable/disable for testing

**User Experience:**
- Predictable, testable vertical movement
- Clear visual feedback of boundary changes
- No unexpected behavior or crashes
- Easy to observe and verify correct functioning

---

**Script Author:** Deyan Shahov
**Test Case:** Blue Slime Vertical Z-Axis Movement
**Status:** Ready for Implementation

*This script provides a perfect test case for the new vertical movement mechanics while demonstrating the power of the FULL script system.*
