# 📈 Maximum Progress Mode Implementation Plan

## 1. Overview
The objective is to create a new game mode called **"Maximum Progress"** (or Endless Mode), which runs parallel to the standard tutorial levels. This mode utilizes a single universal map (arena) where enemies are dynamically generated with increasing difficulty.

## 2. System Architecture

### A. New Components
1.  **`ProceduralLevelGenerator` (Class)**
    *   **Responsibility:** Generates a `LevelData` object at runtime based on the current stage index.
    *   **Logic:** Calculates the number and level of enemies according to a predefined formula.
    *   **Output:** Returns a configuration object compatible with the `LevelManager`.

2.  **`EndlessArenaTemplate` (Data)**
    *   **Responsibility:** Contains static level data (boundaries, background, music, player spawn zone) that does not change between rounds.

### B. Modifications to Existing Systems
1.  **`LevelManager`**
    *   Add a flag or state `gameMode` ('story' | 'endless').
    *   Implement a `loadNextEndlessStage()` method that calls the generator.
    *   Modify the level completion logic: instead of looking for a `nextLevelId`, it checks the game mode and generates the next stage.

2.  **`Menu System`**
    *   Add an option to select the game mode in the main menu.

---

## 3. Progression Logic

The system uses a counter, `currentStage`, starting from 1.

### Generation Formulas

1.  **Enemy Count:**
    *   Cycles through: 1 -> 2 -> 3 -> 1 -> 2 -> 3...
    *   **Formula:** `count = ((currentStage - 1) % 3) + 1`

2.  **Enemy Level:**
    *   Increases by 1 every 3 rounds.
    *   **Formula:** `level = Math.floor((currentStage - 1) / 3) + 1`

### Example Progression Table
| Stage | Enemy Count | Enemy Level | Description |
| :--- | :---: | :---: | :--- |
| **1** | 1 | 1 | Start |
| **2** | 2 | 1 | +1 Enemy |
| **3** | 3 | 1 | Max enemies for Level 1 |
| **4** | 1 | 2 | Reset count, Level Up |
| **5** | 2 | 2 | |
| **6** | 3 | 2 | |
| **7** | 1 | 3 | Reset count, Level Up |

### Enemy Types
*   **Initial:** Only `blue_slime`.
*   **Future Development:** At certain milestones (e.g., every 5th or 10th stage), Elite or Boss enemy types could be introduced.

---

## 4. Spawning and Positioning

The functionality of `TriggerSpawner` for `randomPosition` will be used, but with boundaries dynamically provided by the generator.

*   **Zone:** The entire allowed area of the level (its boundaries).
*   **Validation:** The generator must ensure that the `spawnArea` does not overlap with the player's starting point to prevent enemies from spawning on top of the player.

---

## 5. UI and Visualization

*   **Transition Screen:** When loading a new stage, the text should be dynamic:
    *   `"Maximum Progress - Stage ${currentStage}"`
*   **HUD:** (Optional) Add a counter for the current stage to the in-game interface.

---

## 6. Implementation Steps

### Step 1: Data Preparation
- [x] Create the file `Level System/levels/templates/endless_arena.js`.
- [x] Define the static boundaries and art assets for the arena.

### Step 2: Create the Generator
- [x] Create the file `Level System/procedural_generator.js`.
- [x] Implement the `ProceduralLevelGenerator` class.
- [x] Implement the formulas for `count` and `level`.
- [x] Implement a method to generate the `enemies` array with `randomPosition: true`.

### Step 3: `LevelManager` Integration
- [x] Add a `currentStage` variable to the `LevelManager`.
- [x] Implement the `startEndlessMode()` method.
- [x] Implement the `loadNextEndlessStage()` method.
- [x] Modify `checkCompletionConditions` to handle the endless loop.

### Step 4: UI Integration
- [x] Add a button in the main menu to start Endless Mode.
- [x] Test the transition screen text.

---

## 7. Generated Config Example

```javascript
// Example of what the generator returns for Stage 5:
{
    id: 'endless_stage_5',
    type: 'static', // The arena is a static room
    name: 'Maximum Progress - Stage 5',
    
    // Copied from the endless_arena template
    boundaries: { left: 0, right: 2000, top: 0, bottom: 1000, zMin: -200, zMax: 200 },
    backgrounds: { /* ... */ },
    playerSpawns: [{ x: 100, y: 800, z: 0 }], // Fixed player start position

    // Dynamically generated
    enemies: [
        {
            type: 'blue_slime',
            level: 2,
            spawnTrigger: 'immediate',
            randomPosition: true // TriggerSpawner will pick an X/Y/Z within the boundaries
        },
        {
            type: 'blue_slime',
            level: 2,
            spawnTrigger: 'immediate',
            randomPosition: true
        }
    ],

    completionConditions: {
        type: 'enemies_defeated',
        targetCount: 2
    }
}
```