# 📋 Platformer Browser Game - System Architecture Guide

This comprehensive guide documents the current directory structure and system organization of the Platformer Browser Game project. It serves as a reference for developers to understand existing systems and quickly orient themselves when working on new features.

## 🏗️ Core System Directories

### Combat System
**Purpose:** Unified combat resolution engine handling all game entities' attacks and damage calculations.

#### Directory Structure
```
Combat System/
├── index.js              # System orchestrator and global exports
├── combat_attributes.js  # Character stat management and defaults
├── combat_calculator.js  # Damage calculations, critical hits, modifiers
├── combat_resolver.js    # Attack resolution, resource consumption, logging
├── enemy_combat.js       # Enemy attack coordination and cooldown management
├── damage_display.js     # Visual damage number display system
└── combat_utils.js       # Shared helper functions for hit box positioning, mapping, defeat handling
```

#### Key Files and Functions
- **combat_attributes.js**: Manages character stats (health, attack power, defense)
  - `initializeForCharacter(characterInfo)`: Initialize combat attributes for a character
  - `getCriticalChanceDisplay(characterInfo)`: Get critical chance display text
  - `getMagicResistanceDisplay(characterInfo)`: Get magic resistance display values

- **combat_calculator.js**: Calculates damage with critical hit chance and modifiers
  - `calculateAttackPower(attacker, skillType)`: Calculate total attack power for an attacker
  - `calculateDefense(defender)`: Calculate total defense for a defender
  - `calculateDamage(attacker, defender, skillType)`: Calculate final damage from attacker to defender
  - `checkCriticalHit(attacker)`: Check if attack is a critical hit
  - `getEquipmentAttackBonus(entity)`: Get equipment attack bonus
  - `getEquipmentDefenseBonus(entity)`: Get equipment defense bonus

- **combat_resolver.js**: Resolves attacks, handles resource consumption and combat events
  - `resolveAttack(attacker, defender, skillType)`: Resolve an attack from attacker to defender (with resource consumption)
  - `resolveAttackNoResourceCheck(attacker, defender, skillType)`: Resolve an attack without resource consumption
  - `applyDamage(defender, damage)`: Apply damage to a defender
  - `canAffordSkill(attacker, skillType)`: Check if attacker can afford skill (without consuming)
  - `checkAccuracyAndDodge(attacker, defender, skillType)`: Check accuracy and dodge for an attack

- **enemy_combat.js**: Coordinates enemy attacks with cooldowns and timing
  - `updateEnemyAttacks(enemy, dt)`: Update enemy attack behavior
  - `startEnemyAttack(enemy)`: Start enemy attack sequence
  - `checkEnemyCooldown(enemy)`: Check if enemy is ready to attack

- **damage_display.js**: Handles visual display of damage numbers on screen
  - `showDamageNumber(target, damage, isCritical)`: Display damage number for target
  - `updateDamageNumbers(dt)`: Update damage number positions and visibility
  - `clearDamageNumbers()`: Clear all active damage numbers

- **combat_utils.js**: Shared utilities for hit box calculations and skill mapping
  - `getHitBoxPosition(entity)`: Get current hit box position for entity
  - `mapSkillToAttackType(skillType)`: Map skill type to attack type
  - `calculateDistance(entity1, entity2)`: Calculate distance between two entities

### Animation System
**Purpose:** Centralized animation management for all game entities with sprite handling and state machine integration.

#### Directory Structure
```
Animation System/
├── animation_data.js     # Animation data definitions and asset references
├── animation_system.js   # Core animation system orchestration
├── animation_renderer.js # Entity rendering and drawing logic
├── animation_state_machine.js # State management for animations
├── animation_utils.js    # Utility functions for animation calculations
└── sprite_manager.js     # Asset management and sprite handling
```

#### Key Files and Functions
- **animation_system.js**: Main orchestration of animation operations
  - `initialize(canvas)`: Initialize the animation system
  - `registerEntity(entity, entityType)`: Register an entity for animation
  - `unregisterEntity(entity)`: Unregister an entity
  - `update(dt)`: Update all animations
  - `render()`: Render all animated entities
  - `setEntityAnimation(entity, animationType, force = false)`: Set animation for specific entity
  - `forceEntityAnimation(entity, animationType, onEnd = null)`: Force animation for specific entity

- **animation_renderer.js**: Renders entities with their current animation states
  - `drawAnimatedEntities(entities, skipSorting = false)`: Draw animated entities in proper order
  - `drawAnimationDebug(entity, animation, x, y)`: Draw debug information for an animation
  - `calculateBoxPosition(entity, boxData, type)`: Calculate position of hit boxes or attack boxes

- **animation_state_machine.js**: Manages animation state transitions and logic
  - `createStateMachineForEntity(entity, isEnemy = false)`: Create and attach state machine to entity
  - `transitionEntityToState(entity, stateName)`: Transition entity to specific animation state
  - `handleEntityAction(entity, actionType)`: Handle action for entity (unified interface)
  - `isEntityInState(entity, stateName)`: Check if entity is in specific state

- **sprite_manager.js**: Handles asset loading, categorization, and memory tracking
  - `preloadEntitySprites(entityType)`: Preload sprites for specific entity type
  - `getSprite(entityType, animationType)`: Get sprite for entity and animation type
  - `getCachedSpriteCount()`: Get count of cached sprites
  - `clearCache()`: Clear all cached sprites

### Collision System
**Purpose:** Comprehensive collision detection and response handling for all game entities.

#### Directory Structure
```
Collision System/
├── index.js           # System orchestrator and global exports
├── collision_core.js  # Basic collision primitives and math functions
├── collision_utils.js # Utility functions and distance calculations
├── entity_collision.js # Entity-to-entity collision detection and resolution
├── collision_correction.js # Collision response and position correction
├── player_movement.js # Player-specific movement physics and collision handling
└── ai_constraints.js  # AI behavior constraints and screen boundary management
```

#### Key Files and Functions
- **collision_core.js**: Basic collision math and primitive functions
  - `checkCollision(x1, y1, z1, w1, h1, d1, x2, y2, z2, w2, h2, d2)`: Check if two 3D boxes collide
  - `checkCollisionWithBuffer(x1, y1, z1, w1, h1, d1, x2, y2, z2, w2, h2, d2, zTolerance, buffer)`: Check collision with buffer and Z tolerance
  - `calculateDistance(x1, y1, z1, x2, y2, z2)`: Calculate distance between two points in 3D space

- **entity_collision.js**: Core entity collision detection with unified API
  - `checkEntityCollision(entity1, entity2, collisionType, params)`: Main unified collision function
  - `checkHitboxCollision(attacker, target, params)`: Unified attack collision function
  - `canMoveTo(entity, proposedX, proposedY, proposedZ)`: Check if entity can move to position
  - `handleEntityMovement(entity, dt, canvasHeight, gravity, zMin, zMax, options)`: Unified entity movement function

- **collision_correction.js**: Position correction and separation vector calculations
  - `applyCollisionCorrection(entity, proposedX, proposedY, proposedZ, axis)`: Apply collision correction to entity
  - `calculateSeparationVector(entity1, entity2)`: Calculate separation vector for two entities
  - `resolveCollision(entity1, entity2)`: Resolve collision between two entities

- **player_movement.js**: Player-specific physics and movement handling
  - `handlePlayerMovement(player, dt, canvasHeight, gravity, zMin, zMax)`: Handle player-specific movement
  - `applyMovementConstraints(player)`: Apply movement constraints to player
  - `updatePlayerPhysics(player, dt)`: Update player physics calculations

- **ai_constraints.js**: AI behavior constraints and boundary checking
  - `checkBoundaryConstraints(entity, boundaries)`: Check if entity respects boundary constraints
  - `enforceScreenBoundaries(entity)`: Enforce screen boundary restrictions
  - `applyBehaviorConstraints(entity, aiContext)`: Apply AI behavior constraints

### AI System
**Purpose:** Behavior tree-based artificial intelligence for enemy entities with strategic decision making.

#### Directory Structure
```
Behavior Tree/
├── enemy_ai_config.js    # AI configuration and settings
├── enemy_ai_utils.js     # Utility functions for AI operations
├── enemy_script_manager.js # Script management for AI behaviors
├── enemy_scripts.js      # Predefined AI behavior scripts
└── enemyAI_BT.js         # Main behavior tree implementation
```

#### Key Files and Functions
- **enemyAI_BT.js**: Core behavior tree logic with decision making
  - `createUniversalEnemyBehaviorTree(enemy)`: Create unified behavior tree for enemy
  - `createScriptEnabledBT(enemy, scriptName)`: Create behavior tree with script enabled
  - `updateEnemyAI(enemy, dt)`: Update enemy AI behavior tree
  - `evaluateCondition(condition, context)`: Evaluate condition in behavior tree
  - `executeAction(action, context)`: Execute action in behavior tree

- **enemy_ai_config.js**: Configuration settings for AI behaviors
  - `getEnemyAISettings(enemyType)`: Get AI configuration for specific enemy type
  - `updateAIDifficultySettings(difficultyLevel)`: Update AI difficulty settings
  - `getBehaviorWeights()`: Get weights for different AI behaviors

- **enemy_scripts.js**: Predefined behavior patterns and scripts
  - `getEnemyScript(enemyType, scriptName)`: Get predefined AI script for enemy
  - `registerEnemyScript(scriptName, scriptFunction)`: Register new enemy AI script
  - `executeEnemyScript(enemy, scriptName)`: Execute registered enemy AI script

### Level System
**Purpose:** Procedural level generation and management with multiple template systems.

#### Directory Structure
```
Level System/
├── level_data.js         # Level configuration data and templates
├── level_loader.js       # Loading and initialization of levels
├── level_manager.js      # Main level management and orchestration
├── level_registry.js     # Registry for available levels and templates
├── level_utils.js        # Utility functions for level operations
└── levels/               # Level-specific directories
    ├── templates/        # Template systems for different level types
    │   └── endless_arena.js # Endless arena template system
    └── combat/           # Combat-focused level implementations
```

#### Key Files and Functions
- **level_manager.js**: Main orchestration of level loading and management
  - `loadLevel(levelId)`: Load a level by ID with full initialization sequence
  - `performLevelLoad(levelData)`: Perform the actual level loading sequence
  - `spawnLevelEntities(levelData)`: Spawn all entities for a level
  - `initializeEnemyEntity(entityId, config)`: Initialize enemy entity with animation and AI systems
  - `checkCompletionConditions()`: Check if level completion conditions are met

- **endless_arena.js**: Template for endless arena level generation
  - `generateStage(stageNumber)`: Generate a new stage for endless mode
  - `createEndlessRoom(roomSize, enemyDensity)`: Create endless room with specified parameters
  - `calculateSpawnPoints(stageNumber)`: Calculate spawn points for enemies

- **level_loader.js**: Handles level file loading and initialization
  - `loadLevelFromFile(levelPath)`: Load level from file path
  - `parseLevelData(jsonData)`: Parse level data from JSON
  - `initializeLevelEntities(levelData)`: Initialize entities from level data

### Character System
**Purpose:** Player character management with progression, stats, and skill systems.

#### Directory Structure
```
Character System/
├── index.js              # System orchestrator and global exports
├── core/                 # Core character functionality
│   ├── character_core.js # Basic character structure and properties
│   └── character_info.js # Character metadata and identification
├── combat/               # Combat-related character features
│   └── character_combat.js # Character combat mechanics
└── progression/          # Progression and leveling systems
    ├── experience_system.js # Experience tracking and level up logic
    └── stat_distribution.js # Stat allocation and distribution
```

#### Key Files and Functions
- **character_info.js**: Manages character metadata and identification
  - `getDisplayName()`: Get character display name
  - `getCharacterType()`: Get character type (player, enemy, npc)
  - `addExperience(amount, source)`: Add experience points to character
  - `isLevelUpAvailable()`: Check if level up is available

- **experience_system.js**: Handles XP tracking, level progression, and stat increases
  - `calculateXPForNextLevel(currentLevel)`: Calculate XP needed for next level
  - `awardExperience(attacker, defender)`: Award experience points to attacker
  - `checkLevelUp()`: Check if character should level up
  - `getLevelProgress()`: Get current level progress information

- **stat_distribution.js**: Manages stat allocation and distribution systems
  - `distributeStatPoints(character, statType, amount)`: Distribute stat points to character
  - `calculateStatBonuses(character)`: Calculate stat bonuses for character
  - `getAvailableStatPoints(character)`: Get available stat points for character

### Enemy System
**Purpose:** Base enemy management with specialized enemy types and behavior patterns.

#### Directory Structure
```
Enemies/
├── EnemyAI.js            # AI logic for enemies
├── EnemyCombat.js        # Combat mechanics for enemies
├── EnemyDeath.js         # Death sequence and animation handling
├── EnemyFactory.js       # Factory pattern for creating different enemy types
├── EnemyMovement.js      # Movement patterns for enemies
└── EnemyTypes/           # Specific enemy type implementations
    ├── BlueSlime.js      # Basic blue slime enemy
    ├── EliteSlime.js     # Enhanced slime enemy
    └── BossSlime.js      # Boss-level slime enemy
```

#### Key Files and Functions
- **EnemyFactory.js**: Factory pattern for creating enemy instances
  - `createEnemyWithData(enemyType, level)`: Create enemy instance with stats
  - `getEnemyStats(enemyType, level)`: Get stats for specific enemy type and level

- **BaseEnemy.js**: Base enemy class with core functionality
  - `update(dt)`: Update enemy behavior and state
  - `takeDamage(damage)`: Handle damage taken by enemy
  - `die()`: Handle enemy death sequence
  - `isAlive()`: Check if enemy is still alive

- **EnemyTypes/**: Specific implementations for different enemy types
  - **BlueSlime.js**: Basic blue slime enemy with standard behavior
  - **EliteSlime.js**: Enhanced slime enemy with increased stats and abilities
  - **BossSlime.js**: Boss-level slime enemy with special abilities and mechanics

### Menu System
**Purpose:** User interface management with menus, controls, and skill tree integration.

#### Directory Structure
```
Menu System/
├── index.js              # System orchestrator and global exports
├── core/                 # Core menu functionality
│   ├── menu_core.js    # Basic menu structure and logic
│   └── menu_ui.js      # Menu user interface components
├── controls/             # Input and control management
│   ├── controls_manager.js # Control configuration and mapping
│   └── controls_ui.js    # Control display and UI elements
└── skills/               # Skill tree and ability systems
    ├── skill_helpers.js  # Helper functions for skill operations
    ├── skill_tree_core.js # Core skill tree logic
    └── skill_tree_ui.js   # Skill tree user interface components
```

#### Key Files and Functions
- **menu_core.js**: Main menu orchestration and structure
  - `showMainMenu()`: Show main game menu
  - `hideMenu()`: Hide current menu
  - `updateMenu(dt)`: Update menu state and input handling
  - `handleMenuInput(key)`: Handle input for menu navigation

- **skill_tree_core.js**: Core skill tree functionality and progression
  - `showSkillTreeForPlayer(playerIndex)`: Show skill tree for specific player
  - `renderSkillTree(player)`: Render skill tree UI for player
  - `tryUnlockSelectedSkill()`: Attempt to unlock selected skill
  - `switchSkillTreePage(page)`: Switch between skill tree pages

- **controls_manager.js**: Input handling and control configuration
  - `getControlMapping(controlType)`: Get control mapping for specific action
  - `updateControls(dt)`: Update control state and input handling
  - `saveControlSettings()`: Save current control settings to storage

### Resource Management
**Purpose:** Asset loading, caching, and management for all game resources.

#### Directory Structure
```
resource_manager.js       # Main resource management system
Assets/                   # Asset directory structure
├── Sprites/              # Sprite assets
├── Audio/                # Audio assets  
└── UI/                   # User interface assets
```

#### Key Files and Functions
- **resource_manager.js**: Centralized asset loading and caching
  - `loadAsset(assetPath)`: Load asset from path
  - `getLoadedAsset(assetPath)`: Get already loaded asset
  - `preloadAssets(assetList)`: Preload multiple assets
  - `unloadAsset(assetPath)`: Unload specific asset
  - `isAssetLoaded(assetPath)`: Check if asset is loaded

### Utility Systems
**Purpose:** Supporting systems and utility files that provide essential functionality.

#### Directory Structure
```
camera_controller.js      # Camera management system
dynamic_entity_manager.js # Dynamic entity handling
entities.js               # Base entity definitions
game_state.js             # Game state management
main.js                   # Main application entry point
load_skill_icon.js        # Skill icon loading functionality
trigger_spawner.js        # Trigger-based spawning system
micro_skill_tree.js       # Micro skill tree implementation
```

#### Key Files and Functions

- **camera_controller.js**: Manages camera behavior and positioning
  - `initializeCamera()`: Initialize camera system
  - `updateCameraPosition(targetEntity)`: Update camera position based on target
  - `followEntity(entity)`: Set camera to follow specific entity
  - `lockCameraToPosition(x, y, z)`: Lock camera to specific coordinates

- **dynamic_entity_manager.js**: Handles dynamic entity creation and management
  - `createDynamicEntity(type, x, y, z)`: Create a new dynamic entity
  - `updateDynamicEntities(dt)`: Update all dynamic entities
  - `removeDynamicEntity(entityId)`: Remove a dynamic entity
  - `getActiveEntities()`: Get list of currently active dynamic entities

- **entities.js**: Base entity definitions and properties
  - `createBaseEntity(x, y, z, width, height)`: Create base entity with basic properties
  - `updateEntityPosition(entity, x, y, z)`: Update entity position
  - `setEntityProperties(entity, properties)`: Set entity properties
  - `getEntityBounds(entity)`: Get entity collision bounds

- **game_state.js**: Manages overall game state and progression
  - `initializeGameState()`: Initialize game state variables
  - `updateGameTime(dt)`: Update game time tracking
  - `setGameState(state)`: Set current game state
  - `getGameState()`: Get current game state

- **main.js**: Main application entry point and initialization
  - `initializeGame()`: Main game initialization function
  - `startGameLoop()`: Start the main game loop
  - `handleWindowResize()`: Handle window resize events
  - `loadGameResources()`: Load all required game resources

- **load_skill_icon.js**: Handles skill icon loading and display
  - `loadSkillIcon(skillType)`: Load icon for specific skill type
  - `displaySkillIcon(skillType, x, y)`: Display skill icon at position
  - `getSkillIconPath(skillType)`: Get file path for skill icon
  - `preloadAllSkillIcons()`: Preload all skill icons

- **trigger_spawner.js**: Manages trigger-based entity spawning
  - `initializeTriggerSystem()`: Initialize trigger system
  - `registerTrigger(triggerConfig)`: Register a new trigger
  - `checkTriggerConditions(entity, trigger)`: Check if trigger conditions are met
  - `spawnEntitiesFromTrigger(trigger)`: Spawn entities based on trigger

- **micro_skill_tree.js**: Implements micro skill tree functionality
  - `initializeMicroSkillTree()`: Initialize micro skill tree system
  - `updateMicroSkills(dt)`: Update micro skill states
  - `activateMicroSkill(skillType)`: Activate specific micro skill
  - `getMicroSkillStatus(skillType)`: Get status of micro skill

### Specialized Components

#### Level System/exit_system/exit_point.js
**Purpose:** Exit point management for level transitions
- `createExitPoint(x, y, z, targetLevelId)`: Create exit point with target level
- `activateExitPoint(exitPoint, player)`: Activate exit point for player
- `checkExitCollision(player, exitPoint)`: Check if player collides with exit point
- `updateExitPoint(exitPoint, dt)`: Update exit point state

#### Character System/ui/character_stats_ui.js
**Purpose:** Character stats user interface components
- `renderCharacterStats(character)`: Render character stats UI
- `updateStatDisplay(statType, value)`: Update specific stat display
- `showStatChangeAnimation(statType, oldValue, newValue)`: Show stat change animation
- `initializeCharacterStatsUI()`: Initialize character stats UI elements

#### Menu System/input/input.js
**Purpose:** Input handling and processing for menu system
- `handleMenuInput(event)`: Handle input events for menu navigation
- `processMenuControls()`: Process current menu control states
- `mapInputToAction(inputType)`: Map input to specific menu actions
- `registerMenuInputHandler(handlerFunction)`: Register input handler function

#### Menu System/core/menu_ui.js
**Purpose:** Core menu user interface components
- `createMenuElement(menuType)`: Create menu UI element
- `updateMenuDisplay()`: Update menu display elements
- `showMenu(menuName)`: Show specific menu
- `hideMenu(menuName)`: Hide specific menu

#### Menu System/controls/controls_ui.js
**Purpose:** Controls configuration and display UI
- `renderControlsMenu()`: Render controls configuration UI
- `updateControlBinding(controlType, key)`: Update control binding
- `saveControlSettings()`: Save current control settings
- `loadDefaultControls()`: Load default control settings

#### Behavior Tree/enemy_ai_utils.js
**Purpose:** Utility functions for AI operations
- `calculateDistanceToPlayer(enemy, player)`: Calculate distance to player entity
- `isEntityVisible(enemy, target)`: Check if target is visible to enemy
- `findNearestEnemy(target)`: Find nearest enemy to target
- `getRandomDirection()`: Get random movement direction

## 🔄 Integration Points

### Game Loop Integration
```javascript
// Add to game.js update() function  
function update(dt) {
  // ... existing updates ...
  combatSystem.update(dt);
  animationSystem.update(dt);
  collisionSystem.update(dt);
}

// Add to render.js render() function  
function render() {
  // ... existing rendering ...
  animationSystem.render();
  uiSystem.render();
}
```

### Entity System Integration
```javascript
// Extend base classes  
class MyNewEnemy extends BaseEnemy { 
  // Custom behavior here
}
```

## 📚 Documentation Standards

### Adding New Features - Checklist:
1. **Check Existing Systems First:** Review this guide for similar functionality
2. **Choose Appropriate File:** Select the correct system directory based on feature type
3. **Follow Integration Patterns:** Add to appropriate update/render loops
4. **Update Documentation:** Document new files and integration points

### Common Integration Points:
- **Game Loop:** All systems integrate through main game update and render functions
- **Entity System:** New entities extend base classes in their respective directories
- **UI System:** Interface components integrate with ui.js for rendering

---
*Guide Version: 1.0*
*Last Updated: January 2026*
*Purpose: Quick developer orientation and system reference*