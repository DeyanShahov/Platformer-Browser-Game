# Enemy Loading Process in Platformer Browser Game

This document describes the complete logical path and process for how enemies are loaded, configured, and displayed on screen in the platformer game.

## Overview

The enemy loading system follows a modular, centralized approach where enemy data flows through multiple systems to create fully functional enemies with proper stats, behaviors, and visual representation.

## Complete Enemy Loading Process

### 1. Level Definition and Entity Spawning

The process begins when a level is loaded through the `LevelManager`:

1. **Level Data Configuration**: Level files (e.g., `tutorial_1.js`, `combat_room_1.js`) define entities with their configurations
2. **Level Loading**: When `loadLevel()` is called, it triggers `spawnLevelEntities()`
3. **Entity Spawning**: For enemy entities, `spawnEntity()` is called with the configuration

### 2. Enemy Creation Through Factory System

When an enemy needs to be created:

1. **Factory Method Call**: `createEnemyWithData('blue_slime', null, config.level)` from `EnemyFactory.js`
2. **Base Data Retrieval**: Gets base data from `EnemyBaseData` for basic stats
3. **Complete Configuration**: Uses `EnemyTypeManager.getCompleteEnemyData()` to get full configuration

### 3. Centralized Configuration Management

The `EnemyTypeManager` system handles all enemy configurations:

1. **Base Configuration**: Gets from `EnemyBaseData` with base stats for different types (basic, elite, boss)
2. **Type-Specific Configs**: Applies type-specific configurations (slime, bear, skeleton)
3. **Subtype Configs**: Adds subtype configurations (elite, boss variants)
4. **Stat Scaling**: Calculates scaled stats based on level with proper multipliers
5. **Reward Generation**: Generates XP and gold rewards using centralized calculations

### 4. Complete Enemy Instantiation

The `BlueSlime` class creates the actual enemy:

1. **Inheritance**: Inherits from `BaseEnemy` which sets up core properties
2. **Stat Application**: Gets complete stats from `EnemyTypeManager.getCompleteEnemyData()`
3. **Property Setup**: Sets up entity properties like dimensions, collision boxes, health, attack power
4. **System Integration**: Initializes combat and AI systems

### 5. Animation System Integration

The enemy gets properly registered with the animation system:

1. **Entity Registration**: `animationSystem.registerEntity(entity, 'blue_slime')` is called
2. **State Machine Creation**: Animation state machine is created (`EnemyAnimationStateMachine`)
3. **Sprite Linking**: All animation data is linked to the enemy instance
4. **Visual Setup**: Enemy gets proper animation entity type for sprite loading

### 6. AI and Combat System Integration

The enemy is integrated with AI and combat systems:

1. **Combat Registration**: Registered with `enemyCombatManager` for combat coordination
2. **Behavior Tree Initialization**: BT (Behavior Tree) AI system initialized through `createUniversalEnemyBehaviorTree()`
3. **System Linking**: All core game systems are properly linked via dependency injection

### 7. Final Display on Screen

During rendering (`render.js`):

1. **Render Method Call**: `AnimationRenderer.drawEntity()` is called for each enemy
2. **Z-Depth Calculation**: Z-depth calculations performed using `getZOffset()`
3. **Visual Rendering**: Enemy is drawn as a colored rectangle or sprite based on animation availability
4. **Debug Visualization**: Debug boxes and visual effects are rendered if enabled

## Key Systems Involved

### Configuration Flow:
1. `EnemyBaseData` → Base stats for different enemy types
2. `EnemyTypeManager` → Centralized configuration with scaling logic  
3. `EnemyFactory` → Creates instances with complete stats
4. `BlueSlime.js` → Specific implementation with overrides

### Integration Points:
- **Combat System**: Enemy stats, damage calculations, XP rewards
- **Animation System**: Sprite rendering, animation states, hit boxes
- **Collision System**: Collision detection, Z-depth physics
- **AI System**: Behavior trees, movement patterns
- **Level Manager**: Entity spawning, level boundaries

## Data Flow for a Blue Slime Enemy

1. **Level Config** → `level_manager.js` spawns enemy with specific level
2. **Factory Call** → `createEnemyWithData('blue_slime', null, 1)`  
3. **Configuration** → `EnemyTypeManager.getCompleteEnemyData()` 
4. **Stats Calculation** → Scaled based on level (20% increase per level)
5. **Entity Creation** → `BlueSlime` constructor with complete stats
6. **System Registration** → Animation, AI, Combat systems all register the enemy
7. **Rendering** → `AnimationRenderer.drawEntity()` displays on screen

## Design Principles

1. **Modular Architecture**: Each enemy type is modular and can be extended without touching core systems
2. **Centralized Configuration**: All enemy data flows through `EnemyTypeManager` for consistency
3. **Scalable Stats**: Level-based scaling with proper multipliers (20% per level)
4. **Z-Depth Physics**: Proper 2.5D collision system using X, Y, Z coordinates
5. **Behavior Trees**: AI decisions made through configurable behavior trees

## Enemy Types and Configuration

### Base Enemy Types:
- **Basic**: Standard enemy with basic stats
- **Elite**: Enhanced version with improved stats
- **Boss**: High-level enemy with special abilities and mechanics

### Subtypes:
- **Slime Variants**: Elite Slime, Boss Slime
- **Bear Variants**: Black Bear
- **Skeleton Variants**: Archer Skeleton, Warrior Skeleton

### Configuration Parameters:
- **Stats**: Health, Attack Power, Defense, Strength, Critical Chance, Speed
- **Rarity**: Common, Elite, Boss (affects scaling and rewards)
- **Intelligence**: Basic, Normal, Advanced (affects AI behavior)
- **Special Abilities**: Unique skills specific to enemy types
- **Rewards**: Experience points and gold rewards scaled by level

This system provides a robust, scalable framework where new enemy types can be added by creating new classes that extend `BaseEnemy` and implementing the appropriate configuration logic in `EnemyTypeManager`.