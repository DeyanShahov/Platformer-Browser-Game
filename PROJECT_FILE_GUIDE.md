# 🎮 Platformer Browser Game - Project File Guide

## 📋 Document Overview

This comprehensive guide documents every file in the Platformer Browser Game project. It serves as a reference for developers to understand existing systems and avoid creating duplicate functionality when adding new features.

**Last Updated:** January 2026 (Combat System Unification)
**Purpose:** Prevent code duplication, improve maintainability, guide feature development

---

## 🏗️ RECENT ARCHITECTURAL CHANGES (January 2026)

### AI System Distance Calculation & Stability Fixes - COMPLETED ✅ **[CRITICAL IMPROVEMENT]**
**Fixed premature enemy attacks and distance calculation issues with unified measurement system**

#### Problem Solved:
- **Before:** Enemies attacked from unrealistic distances (~117px) due to inconsistent distance calculations
- **Issue:** Behavior Tree used "shortened" object data without physical dimensions, animation system timing issues
- **Impact:** Enemies attacked too early, undefined entity errors in constraint system, awareness radius too small (300px)

#### Solution Implemented:
- **Unified Distance Calculation:** Single `calculateEntityDistance()` function with 3D support and intelligent fallbacks
- **BT Context Enrichment:** Added physical dimensions (`w`, `h`, `collisionW`, `collisionH`, `zThickness`) to BT context
- **Animation System Integration:** Real-time hitbox access during BT execution with readiness checks
- **Constraint Safety:** Null checks and error handling for undefined entity references
- **Awareness Expansion:** Increased detection radius from 300px to 1000px for realistic enemy behavior

#### Key Changes:
1. **`base_enemy.js`**: Added physical dimensions and animation system link to BT context
2. **`collision.js`**: Enhanced distance calculation with entity-specific fallbacks and 3D support
3. **`Behavior Tree/enemyAI_BT.js`**: Added constraint safety checks and expanded awareness radius
4. **System-wide**: Unified distance measurements across all AI components

#### Technical Implementation:
- **Per-frame Hitboxes:** Primary distance method when animation system is ready
- **Intelligent Fallbacks:** Entity-specific collision dimensions (Player: 65x260, Enemy: 80x60)
- **3D Distance Support:** Includes depth (Z-axis) for accurate 2.5D gameplay
- **Animation Readiness Checks:** Prevents calculations before system initialization
- **Null Safety:** Protected constraint operations against undefined entities

#### Benefits Achieved:
- **Accurate Attack Ranges:** Enemies attack only when truly in range using consistent measurements
- **Stable AI System:** Eliminated undefined entity errors and crashes in constraint system
- **Realistic Detection:** Enemies detect players from appropriate distances (1000px awareness radius)
- **Performance Reliability:** Reduced console spam with meaningful diagnostic information
- **Cross-system Consistency:** Same distance calculations used by AI "brain" and "body" systems
- **Future-proof Design:** Extensible fallback system for new entity types

#### Files Affected:
- `base_enemy.js` - BT context enrichment with physical dimensions
- `collision.js` - Unified distance calculation with 3D support and fallbacks
- `Behavior Tree/enemyAI_BT.js` - Constraint safety and expanded detection radius
- `AI_SYSTEM_CHANGES_SUMMARY.md` - Comprehensive documentation of changes

#### Architectural Benefits Achieved:
- **Unified Measurement System:** Single distance calculation eliminates inconsistencies across AI systems
- **Animation System Integration:** Real-time hitbox data access during BT decision making
- **Entity Type Awareness:** Different fallback dimensions for players vs enemies vs generic entities
- **Error Resilience:** Graceful handling of animation system initialization timing issues
- **Maintainable Codebase:** Clear fallback hierarchy prevents future distance calculation bugs
- **Performance Optimized:** Readiness checks prevent unnecessary calculations during startup

---

## 🏗️ RECENT ARCHITECTURAL CHANGES (January 2026)

### Combat System Unification - COMPLETED ✅ **[MAJOR IMPROVEMENT]**
**Unified combat resolution for all entities - eliminated separate enemy damage logic**

#### Problem Solved:
- **Before:** Players used `CombatResolver` with resource consumption, enemies applied damage directly
- **Issue:** Multiple damage application bugs, inconsistent balance, code duplication
- **Impact:** Enemy attacks were hitting multiple times, combat balance was broken

#### Solution Implemented:
- **Unified Pipeline:** All attacks now go through `CombatResolver.resolveAttackNoResourceCheck()`
- **Skill Type Mapping:** Enemy animation types ('ATTACK_1') map to combat skill types ('basic_attack_light')
- **Resource Abstraction:** Players consume resources, enemies skip resource checks
- **FSM Improvements:** Enemy attack states properly transition to prevent infinite loops
- **BT Cooldowns:** 1.5 second cooldown between enemy attacks to prevent spam

#### Key Changes:
1. **combat_system.js**: Added `resolveAttackNoResourceCheck()` for enemy attacks
2. **game.js**: Enemy attacks now use unified combat system with skill mapping
3. **Animation System/animation_state_machine.js**: Fixed EnemyAttackState transitions
4. **Behavior Tree/enemyAI_BT.js**: Added attack cooldown decorators

#### Benefits Achieved:
- **Single Combat System:** No more separate damage application logic
- **Consistent Balance:** All entities use skill tree parameters for damage calculation
- **Bug Elimination:** Fixed multiple damage hits per attack
- **Maintainability:** One place to modify combat balance
- **Extensibility:** Easy to add new combat mechanics for any entity type

#### Files Affected:
- `combat_system.js` - Added unified combat resolution
- `game.js` - Enemy attack integration and skill mapping
- `Animation System/animation_state_machine.js` - FSM state transition fixes
- `Behavior Tree/enemyAI_BT.js` - Attack cooldown system
- `PROJECT_FILE_GUIDE.md` - Comprehensive documentation update

#### Architectural Benefits Achieved:
- **Unified Combat Pipeline:** Single entry point for all damage calculations eliminates code duplication
- **Consistent Balance:** All entities use skill tree parameters for damage modifiers and critical hits
- **Entity Type Abstraction:** Clean separation between players (with resources) and enemies (resource-free)
- **Maintainable Codebase:** Combat balance changes made in one location affect entire game
- **Future-Proof Design:** Easy to add new combat mechanics for any entity type
- **Debug Capabilities:** Enhanced logging and combat event tracking across all systems

---

## 🏗️ RECENT ARCHITECTURAL CHANGES (December 2025)

### Animation System Refactoring - COMPLETED ✅
**5-Phase Refactoring Completed Successfully**

#### Phase 1: Data Consolidation ✅
- Moved all animation logic functions to `animation_utils.js`
- Converted `animation_data.js` to pure data definitions
- Removed Blue Slime duplication from main data structures
- Centralized animation data management

#### Phase 2: State Management Unification ✅
- Integrated AnimationStateMachine tightly with AnimationSystem
- Added unified state machine creation methods
- Enhanced state transition handling
- Cleaner API for state management

#### Phase 3: Asset Management Clarification ✅
- Enhanced SpriteManager with asset categorization
- Added asset statistics and memory tracking
- Improved asset validation and error handling
- Better asset lifecycle management

#### Phase 4: Generic Entity Support ✅
- Enhanced AnimationRenderer with generic entity drawing
- Added support for different entity types (sprites, shapes, etc.)
- Improved transformation handling
- Better batch rendering capabilities

#### Phase 5: Clean Integration Points ✅
- Updated all integration points across the codebase
- Cleaned up function exports and imports
- Improved cross-module communication
- Enhanced documentation and API consistency

### Entity Rendering Refactor:
- **AnimationRenderer** now handles all game entity drawing (animated and non-animated)
- **render.js** simplified to UI coordination only
- Centralized Z-depth calculations across all rendering with `getZOffset()` method
- Eliminated duplicate rectangle drawing logic
- Unified debug visualization system
- Single source of truth for entity rendering

### Benefits Achieved:
- **No duplication**: Z calculations and rectangle drawing on one place
- **Centralized logic**: All entity drawing features in AnimationRenderer
- **Maintainable**: Changes made in single location
- **Consistent**: Unified visual effects and debug systems
- **Performance**: Optimized rendering pipeline
- **Modular**: Clean separation of concerns across animation system

### Files Affected:
- `Animation System/` - Complete refactoring of all 6 files
- `game.js` - Integration updates
- `PROJECT_FILE_GUIDE.md` - Comprehensive documentation update

---

## 📁 Project Structure Overview

```
Platformer Browser Game/
├── 🎮 Core Systems (Game loop, state, rendering)
├── 👥 Character Systems (Players, stats, progression)
├── ⚔️ Combat Systems (Damage, abilities, balance)
├── 🎯 Skills & Abilities (Trees, animations, effects)
├── 🤖 AI Systems (Enemies, behavior trees, pathfinding)
├── 🎨 UI Systems (Menus, HUD, interfaces)
├── 📦 Resources & Assets (Loading, management)
├── 🔧 Utilities & Helpers (Math, collision, debugging)
└── 📚 Documentation (Guidelines, procedures)
```

---

## 🎮 CORE GAME SYSTEMS

### `main.js` - Game Initialization & Entry Point
**Purpose:** Main entry point that initializes and starts the game engine
**Responsibilities:**
- Canvas setup and configuration
- Game loop initialization
- Global event listeners
- Asset preloading coordination
**Key Functions:**
- `init()` - Game initialization
- `startGameLoop()` - Begins main game loop
**Dependencies:** `game.js`, `render.js`, `constants.js`
**Integration Points:** Called once at game start

### `game.js` - Main Game Loop & Core Logic **[RECENTLY ENHANCED]**
**Purpose:** Central game logic coordinator, main update/render loop, and core game mechanics
**Responsibilities:**
- Player updates, physics, and entity management
- Enemy AI coordination and **unified combat system integration**
- Input processing and controller support
- Collision resolution and boundary enforcement
- Game state transitions and entity lifecycle
- Player character class and behavior **[MOVED HERE]**
- **Enemy attack resolution with skill type mapping** **[NEW - UNIFIED COMBAT]**
**Key Functions:**
- `update(dt)` - Main update loop
- `handleMovement(player, dt)` - Player physics
- `checkHitboxCollision(attacker, target, params)` - Attack collision **[MOVED HERE]**
- `canMoveTo(entity, proposedX, proposedY, proposedZ)` - Movement validation **[MOVED HERE]**
- `getBehaviorConstraints(entity)` - AI decision boundaries **[MOVED HERE]**
- `applyScreenBoundaries(entity)` - Boundary enforcement **[MOVED HERE]**
- `initGameWithSelections()` - Game initialization **[MOVED HERE]**
- `showSkillTreeForPlayer(playerIndex)` - Skill tree display **[MOVED HERE]**
- `showCharacterStatsForPlayer(playerIndex)` - Stats display **[MOVED HERE]**
- **Enemy attack processing with damageDealt flag management** **[NEW - UNIFIED COMBAT]**
- **Skill type mapping for enemy attacks ('ATTACK_1' → 'basic_attack_light')** **[NEW - UNIFIED COMBAT]**
**Key Classes:**
- `Player` - Complete player character class **[MOVED FROM entities.js]**
**Key Features:**
- **Unified Combat Integration:** Enemy attacks use `CombatResolver.resolveAttackNoResourceCheck()` **[NEW]**
- **Skill Type Mapping:** Maps enemy animation types to combat skill types for consistent damage **[NEW]**
- **DamageDealt Protection:** Prevents multiple hits per attack animation **[NEW]**
- **Debug Logging:** Enhanced enemy attack logging with collision and combat details **[NEW]**
**Dependencies:** `game_state.js`, `input.js`, `collision.js`, `combat_system.js`, `menu.js`
**Integration Points:** Core of game loop, called every frame; main game initialization
**Note:** Recent unification (Jan 2026) integrated enemy attacks into unified combat system, eliminating separate damage logic

### `game_state.js` - Global State Management
**Purpose:** Centralized storage and management of all game state
**Responsibilities:**
- Player array management
- Enemy entity tracking
- Game world state
- Multiplayer coordination
- Entity lifecycle management
**Key Functions:**
- `addPlayer(player)` - Player registration
- `getEntitiesByType(type)` - Entity querying
- `getAllEntities()` - Complete entity list
- `updateEntity(entity)` - State updates
**Dependencies:** `entities.js`, `base_enemy.js`
**Integration Points:** Used by all systems needing entity access

### `constants.js` - Game Constants & Configuration
**Purpose:** Centralized definition of game constants and magic numbers
**Responsibilities:**
- Physics constants (gravity, speeds)
- UI dimensions and positions
- Game balance values
- Performance thresholds
**Key Constants:**
- `SPEED`, `JUMP_FORCE`, `GRAVITY` - Physics
- `CANVAS_WIDTH`, `CANVAS_HEIGHT` - Display
- `Z_MIN`, `Z_MAX` - 3D depth bounds
**Dependencies:** None (fundamental constants)
**Integration Points:** Imported by most game systems

### `render.js` - UI Rendering Coordinator **[RECENTLY REFACTORED]**
**Purpose:** Orchestrates UI rendering and coordinates game rendering pipeline
**Responsibilities:**
- Canvas clearing and debug visualization (Z-lines)
- Entity rendering delegation to AnimationRenderer
- UI overlay rendering (damage numbers, entity labels)
- Rendering order coordination
- Game world orientation elements
**Key Functions:**
- `render()` - Main render coordinator
- `renderEntityLabels()` - Entity status displays
- `renderEnemyLabels()`, `renderDebugLabels()` - Label rendering
**Dependencies:** `Animation System/animation_renderer.js`, `game_state.js`
**Integration Points:** Called every frame after update
**Note:** Entity drawing logic moved to AnimationRenderer; now focuses on UI and coordination

---

## 👥 CHARACTER & PLAYER SYSTEMS

### `entities.js` - Entity Management Utilities **[RECENTLY REFACTORED]**
**Purpose:** Basic entity creation utilities and shared entity variables
**Responsibilities:**
- Entity creation helper functions
- Global entity variable management
- Basic entity initialization
**Key Functions:**
- `createEntity()` - Entity instantiation utility
**Dependencies:** None (basic utilities)
**Integration Points:** Used by game state system for entity creation
**Note:** Player class moved to `game.js`, enemy classes moved to `base_enemy.js`

### `character_info.js` - Character Statistics & Progression **[RECENTLY REFACTORED]**
**Purpose:** Manages character stats, leveling, and progression systems
**Responsibilities:**
- Experience and leveling calculations
- Stat growth and bonuses
- Character progression tracking
- Equipment stat modifications
**Key Functions:**
- `addExperience(amount)` - XP management
- `calculateStatBonus()` - Stat computations
- `getLevelProgress()` - Progression tracking
- `modifyStrength(amount)`, `modifySpeed(amount)`, `modifyIntelligence(amount)` - Stat modifications **[MOVED HERE]**
**Dependencies:** `constants.js`, `combat_system.js`
**Integration Points:** Used by all character-related systems
**Note:** UI display methods moved to `character_stats_ui.js`, combat attributes moved to `combat_system.js`

### `character_stats_ui.js` - Character Stats Interface
**Purpose:** UI components for displaying character statistics
**Responsibilities:**
- Stats panel rendering
- Progress bar displays
- Character info overlays
- Real-time stat updates
**Key Functions:**
- `renderStatsPanel(player)` - Stats display
- `updateStatDisplay()` - Live updates
**Dependencies:** `render.js`, `character_info.js`
**Integration Points:** Called during UI rendering phase

---

## ⚔️ COMBAT SYSTEMS

### `combat_system.js` - Unified Combat Resolution Engine **[RECENTLY UNIFIED]**
**Purpose:** Single combat system for all entities (players and enemies) - handles all damage calculations and resolution
**Responsibilities:**
- Unified attack/defense calculations for all entity types
- Critical hit determination and damage mitigation
- Resource management for players (mana/energy consumption)
- Resource-free combat for enemies (no mana/energy costs)
- Skill-based damage modifiers through skill tree integration
- Combat event processing and damage application
- Death sequence handling and experience rewards
**Key Functions:**
- `resolveAttack(attacker, defender, skillType)` - Full combat resolution with resource consumption
- `resolveAttackNoResourceCheck(attacker, defender, skillType)` - Combat without resource checks (for enemies)
- `calculateDamage(attacker, defender, skillType)` - Unified damage computation with skill modifiers
- `calculateAttackPower(attacker, skillType)` - Attack power with entity type branching (player vs enemy)
- `applyDamage(defender, damage)` - Damage application and hit feedback
**Key Features:**
- **Entity Type Branching:** Different logic for players (with resources) vs enemies (no resources)
- **Skill Tree Integration:** All attacks use skill tree parameters for consistent balance
- **Resource Abstraction:** Clean separation between combat calculation and resource management
- **Unified Pipeline:** Single damage calculation system eliminates code duplication
**Dependencies:** `character_info.js`, `entities.js`, `game_state.js`
**Integration Points:** Core combat system called by all attack interactions
**Note:** Recent unification (Jan 2026) eliminated separate enemy damage logic, now all entities use this unified system

### `skills.js` - Skill Progression & Implementation **[RECENTLY REFACTORED]**
**Purpose:** Contains skill progression systems and individual skill implementations
**Responsibilities:**
- Skill execution logic and effects
- Effect calculations and application
- Skill cooldown management
- Multi-target skill handling
- Skill leveling and progression **[MOVED HERE]**
- Micro skill tree management **[MOVED HERE]**
**Key Functions:**
- `executeSkill(skillId, caster, targets)` - Skill activation
- `calculateSkillDamage(skill, caster)` - Skill-specific calculations
- `OnePerRowSystem` - Micro skill progression system **[MOVED HERE]**
- `LevelBasedSystem` - Skill leveling system **[MOVED HERE]**
**Dependencies:** `combat_system.js`, `character_info.js`
**Integration Points:** Called by skill tree system
**Note:** Combat resource checks moved to `combat_system.js`

---

## 🎯 SKILLS & ABILITIES SYSTEMS

### `SKILL_TREE_SYSTEM.md` - Skill Tree Documentation
**Purpose:** Comprehensive documentation of the skill tree system
**Responsibilities:**
- System architecture explanation
- Usage guidelines and examples
- Integration patterns
- Future development roadmap
**Content:** Detailed technical documentation
**Integration Points:** Reference for skill tree development

### `micro_skill_tree.js` - Compact Skill Tree UI
**Purpose:** Lightweight skill tree interface for quick access
**Responsibilities:**
- Minimal skill tree display
- Quick skill activation
- Compact UI design
- Performance-optimized rendering
**Key Functions:**
- `renderMicroTree()` - Compact display
- `handleMicroTreeInput()` - Input processing
**Dependencies:** `skills.js`, `render.js`
**Integration Points:** Alternative to full skill tree

### `SKILL_ANIMATION_PROCEDURE.md` - Animation Guidelines
**Purpose:** Documentation for skill animation implementation
**Responsibilities:**
- Animation creation procedures
- Timing and synchronization guidelines
- Performance considerations
- Integration with combat system
**Content:** Step-by-step animation guides
**Integration Points:** Reference for new skill development

### `Animation System/animation_system.js` - Animation Coordinator **[REFACTORED]**
**Purpose:** Central animation management and playback system with unified state machine integration
**Responsibilities:**
- Animation state management and entity registration
- Frame timing and sequencing with state machine coordination
- Entity animation coordination with enhanced API
- Performance optimization and batch operations
- State machine integration (Phase 2: State management unification ✅)
**Key Functions:**
- `update(dt)` - Animation and state machine updates
- `registerEntity(entity, entityType)` - Entity registration with animation
- `createStateMachineForEntity(entity, isEnemy)` - State machine creation **[NEW]**
- `transitionEntityToState(entity, stateName)` - Unified state transitions **[NEW]**
- `getEntityCurrentState(entity)` - State queries **[NEW]**
**Key Classes:**
- `AnimationSystem` - Main coordinator class
**Dependencies:** All Animation System files, state machines
**Integration Points:** Core animation system, called by game.js and render.js
**Note:** Enhanced with state machine integration methods for cleaner API

### `Animation System/animation_data.js` - Animation Definitions
**Purpose:** Storage of animation frame data and sequences
**Responsibilities:**
- Animation frame definitions
- Timing configurations
- Sprite sheet mappings
- Animation metadata
**Key Structures:**
- Animation frame arrays
- Timing configurations
- Entity type mappings
**Dependencies:** None (data definitions)
**Integration Points:** Loaded by animation system

### `Animation System/animation_renderer.js` - Universal Entity Renderer **[RECENTLY ENHANCED]**
**Purpose:** Handles drawing of all game entities (animated and non-animated) with centralized rendering logic
**Responsibilities:**
- Universal entity drawing for all game objects
- Sprite animation rendering and sprite sheet management
- Debug visualization (hurt boxes, attack boxes, collision borders)
- Z-depth calculation and management
- Hit effects and visual feedback
- Camera support and viewport culling
- Performance optimizations for entity rendering
**Key Functions:**
- `drawEntity(entity)` - Universal entity drawing **[NEW]**
- `drawAnimatedEntity(entity, animation)` - Animated sprite rendering
- `getZOffset(entity)` - Centralized Z-depth calculation **[NEW]**
- `drawDebugBoxes(entity, drawX, drawY)` - Debug visualization
- `calculateBoxPosition()` - Collision box calculations
- `drawAnimatedEntities(entities, skipSorting)` - Batch entity rendering
**Key Features:**
- Centralized Z-depth logic with `getZOffset()` method
- Unified drawing pipeline for all entity types
- Debug visualizations for development
- Hit effects and player collision borders
- Camera and viewport management
**Dependencies:** `Animation System/animation_data.js`, `constants.js`
**Integration Points:** Core entity rendering system, called by render.js
**Note:** Now handles ALL entity types, not just animated ones; centralized rendering logic

### `Animation System/entity_animation.js` - Entity Animation Bridge
**Purpose:** Connects entities with animation system
**Responsibilities:**
- Entity animation state tracking
- Animation transition handling
- State machine integration
- Animation event callbacks
**Key Functions:**
- `setEntityAnimation(entity, state)` - Animation assignment
- `updateEntityAnimation(entity, dt)` - State updates
**Dependencies:** `Animation System/animation_system.js`, `entities.js`
**Integration Points:** Entity update cycle

### `Animation System/animation_state_machine.js` - Animation State Control
**Purpose:** Finite state machine for animation transitions
**Responsibilities:**
- Animation state transitions
- Condition-based switching
- Animation queuing and blending
- State validation
**Key Classes:**
- `AnimationStateMachine` - Main controller
- State transition logic
**Dependencies:** `Animation System/animation_data.js`
**Integration Points:** Animation system core

---

## 🤖 AI & BEHAVIOR SYSTEMS

### `BEHAVIOR_TREE_AI_SYSTEM.md` - AI System Documentation
**Purpose:** Comprehensive documentation of AI and behavior systems
**Responsibilities:**
- AI architecture explanation
- Behavior tree patterns
- Implementation guidelines
- Performance considerations
**Content:** Technical AI documentation
**Integration Points:** Reference for AI development

### `Behavior Tree/enemyAI_BT.js` - Behavior Tree Implementation **[RECENTLY ENHANCED - AI CONSTRAINT FIXES]**
**Purpose:** Behavior Tree system for enemy AI decision making with constraint safety and expanded awareness
**Responsibilities:**
- BT node implementations (Selector, Sequence, etc.)
- Enemy behavior coordination
- Decision tree execution
- Context-aware AI behavior **[ENHANCED]**
- **Constraint safety checks and awareness expansion** **[NEW - AI FIXES]**
**Key Classes:**
- `BTNode` - Base node class
- `Selector`, `Sequence` - Composite nodes
- `Condition`, `Action` - Leaf nodes
**Key Functions:**
- `tickEnemyAI(tree, context)` - BT execution **[USES UTILS]**
- `selectTarget(ctx)` - Target selection **[NOW USES UTILS]**
- `createPatrolDecisionSubtree()` - **Enhanced with null safety checks** **[NEW - AI FIXES]**
**Key Features:**
- **Constraint Safety:** Null checks prevent undefined entity errors in constraint operations **[NEW]**
- **Expanded Awareness:** Increased detection radius from 300px to 1000px for realistic enemy behavior **[NEW]**
- **Error Resilience:** Graceful handling of undefined contexts and missing animation data **[NEW]**
**Dependencies:** `Behavior Tree/enemy_ai_utils.js`, `base_enemy.js`
**Integration Points:** Enemy AI decision making
**Note:** Recent AI fixes (Jan 2026) added constraint safety and expanded enemy awareness radius

### `Behavior Tree/enemy_ai_utils.js` - AI Utility Functions **[RECENTLY REFACTORED]**
**Purpose:** Shared utility functions for AI operations
**Responsibilities:**
- Collision detection utilities
- Boundary checking functions
- Pathfinding helpers
- Distance and range calculations **[ENHANCED WITH OPTIMIZATIONS]**
**Key Functions:**
- `checkScreenBoundaries(entity)` - Boundary detection
- `detectEntityCollisions()` - Collision checking
- `getEntitiesInRange()` - Range queries
- `calculateDistanceOptimized()` - Performance distance calc **[NEW]**
- `batchCollisionDetection()` - Efficient batch processing **[NEW]**
**Dependencies:** `Behavior Tree/enemy_ai_config.js`
**Integration Points:** Used by BT system and game logic **[INTEGRATED]**

### `Behavior Tree/enemy_scripts.js` - Script Definitions **[NEW FILE]**
**Purpose:** Registry and definitions for all enemy behavior scripts
**Responsibilities:**
- Script storage in Map-based registry
- Boss, elite, and mini-boss script templates
- Test scripts for development
- Auto-initialization and validation
**Key Features:**
- `ENEMY_SCRIPTS` - Map registry for all scripts
- `BOSS_SCRIPTS` - Phase-based boss behaviors
- `ELITE_SCRIPTS` - Advanced enemy behaviors
- `TEST_SCRIPTS` - Development testing scripts
- Auto-registration on load
**Dependencies:** `Behavior Tree/enemy_ai_config.js` (SCRIPT_TYPE)
**Integration Points:** Loaded by script manager, used by enemy initialization

### `Behavior Tree/enemy_script_manager.js` - Script Manager **[NEW FILE]**
**Purpose:** Loading, caching, and runtime management of enemy scripts
**Responsibilities:**
- Async script loading with caching
- Performance monitoring and optimization
- Runtime script switching for boss phases
- Memory management with LRU eviction
**Key Features:**
- `loadScript()` - Async loading with cache
- `switchScript()` - Runtime script changes
- `getPerformanceStats()` - Monitoring metrics
- `preloadScripts()` - Batch loading optimization
- Debug interface (`window.debugEnemyScripts`)
**Dependencies:** `Behavior Tree/enemy_scripts.js`, `Behavior Tree/enemy_ai_config.js`
**Integration Points:** Used by BaseEnemy for script loading/switching

### `Behavior Tree/enemyAI_BT.js` - Behavior Tree Implementation **[RECENTLY ENHANCED]**
**Purpose:** Behavior Tree system for enemy AI decision making with script integration
**Responsibilities:**
- BT node implementations (Selector, Sequence, etc.)
- Enemy behavior coordination
- Decision tree execution
- **Script-aware BT nodes and merge logic** **[NEW]**
**Key Classes:**
- `BTNode` - Base node class
- `Selector`, `Sequence` - Composite nodes
- `ScriptNode`, `ScriptSelector` - **Script-aware nodes** **[NEW]**
- `Condition`, `Action` - Leaf nodes
**Key Functions:**
- `tickEnemyAI(tree, context)` - BT execution
- `mergeCommands()` - **Script command merging** **[NEW]**
- `createScriptEnabledBT()` - **Script-integrated BT factory** **[NEW]**
**Dependencies:** `Behavior Tree/enemy_ai_utils.js`, `base_enemy.js`
**Integration Points:** Enemy AI decision making, script execution

### `Behavior Tree/enemy_ai_utils.js` - AI Utility Functions **[RECENTLY REFACTORED]**
**Purpose:** Shared utility functions for AI operations
**Responsibilities:**
- Collision detection utilities
- Boundary checking functions
- Pathfinding helpers
- Distance and range calculations **[ENHANCED WITH OPTIMIZATIONS]**
**Key Functions:**
- `checkScreenBoundaries(entity)` - Boundary detection
- `detectEntityCollisions()` - Collision checking
- `getEntitiesInRange()` - Range queries
- `calculateDistanceOptimized()` - Performance distance calc **[NEW]**
- `batchCollisionDetection()` - Efficient batch processing **[NEW]**
**Dependencies:** `Behavior Tree/enemy_ai_config.js`
**Integration Points:** Used by BT system and game logic **[INTEGRATED]**

### `Behavior Tree/enemy_ai_config.js` - AI Configuration **[RECENTLY ENHANCED]**
**Purpose:** Centralized AI configuration and constants with script system support
**Responsibilities:**
- AI timing configurations and behavior parameters
- Performance settings and rarity/intelligence multipliers
- **Script system types and validation** **[NEW]**
- **Script constants (cache size, timeouts, size limits)** **[NEW]**
**Key Features:**
- `calculateThinkingDuration()` - Dynamic timing based on enemy properties
- Intelligence/rarity multipliers for behavior complexity
- Caching configurations for performance
- **SCRIPT_TYPE enum (FULL/PARTIAL/BONUS)** **[NEW]**
- **Script validation functions** **[NEW]**
**Dependencies:** None (configuration)
**Integration Points:** Used by all AI systems and script manager

### `base_enemy.js` - Enemy Base Class **[RECENTLY ENHANCED - AI SYSTEM FIXES]**
**Purpose:** Foundation class for all enemy types with unified distance calculation and BT context enrichment
**Responsibilities:**
- Common enemy behaviors and AI coordination
- **BT context enrichment with physical dimensions** **[NEW - AI FIXES]**
- **Animation system integration for real-time hitbox access** **[NEW - AI FIXES]**
- Combat participation and animation coordination
**Key Functions:**
- `updateAI(players, dt)` - AI update cycle
- `updateFSMBehavior()` - Behavior state management
- `getThinkingDuration()` - AI timing **[NOW USES CONFIG]**
- `consultBTForBehavior()` - BT integration **[USES UTILS]**
- `updateBTContext(players)` - **BT context enrichment with physical dimensions** **[NEW - AI FIXES]**
**Key Features:**
- **Unified Distance Context:** Provides complete entity dimensions (`w`, `h`, `collisionW`, `collisionH`, `zThickness`) to BT **[NEW]**
- **Animation System Link:** Direct access to `window.animationSystem` for real-time hitbox data **[NEW]**
- **Cross-system Consistency:** Same distance measurements used by AI "brain" and "body" systems **[NEW]**
**Dependencies:** `Behavior Tree/enemyAI_BT.js`, `combat_system.js`, `collision.js`
**Integration Points:** Extended by specific enemy types
**Note:** Recent AI fixes (Jan 2026) added physical dimension context and animation system access for accurate distance calculations

### `enemy_data.js` - Enemy Definitions & Stats
**Purpose:** Static data definitions for enemy types
**Responsibilities:**
- Enemy stat templates
- Spawn configurations
- Difficulty scaling
- Loot tables
**Key Structures:**
- Enemy stat objects
- Spawn probability tables
- Level scaling formulas
**Dependencies:** `base_enemy.js`
**Integration Points:** Enemy spawning system

---

## 🎨 UI & INTERFACE SYSTEMS

### `ui.js` - UI Rendering & Display **[RECENTLY REFACTORED]**
**Purpose:** Core UI rendering and display management
**Responsibilities:**
- UI state management and coordination
- Component coordination
- Input handling for UI
- Accessibility features
**Key Functions:**
- `initUI()` - UI initialization
- `handleUIInput()` - UI interactions
- `renderUI()` - UI drawing
- `renderPlayerPortraits()` - Character selection display **[MOVED HERE]**
- `renderCharacterStatusUI()` - Status overlays **[MOVED HERE]**
**Dependencies:** `render.js`
**Integration Points:** Main UI coordinator
**Note:** Game initialization logic moved to `game.js`

### `menu.js` - Menu System **[RECENTLY REFACTORED]**
**Purpose:** Game menus and navigation with state management
**Responsibilities:**
- Main menu display and navigation
- Settings management and controls
- Menu state transitions
**Key Functions:**
- `showMainMenu()` - Menu display
- `handleMenuInput()` - Menu navigation
- `showControlsMenu()` - Controls configuration
**Dependencies:** `ui.js`, `game_state.js`
**Integration Points:** Game state transitions
**Note:** Skill tree and character stats functions moved to `game.js`

### `css/skill-tree.css` - Skill Tree Styling
**Purpose:** CSS styling for skill tree interface
**Responsibilities:**
- Skill node appearance
- Tree layout styling
- Hover and selection effects
- Responsive design
**Key Styles:**
- `.skill-node` - Individual skill styling
- `.skill-tree-container` - Layout container
- `.skill-connection` - Connection lines
**Integration Points:** Skill tree rendering

---

## 📦 RESOURCES & ASSETS SYSTEMS

### `resource_manager.js` - Asset Management
**Purpose:** Centralized loading and management of game assets
**Responsibilities:**
- Image and audio loading
- Asset caching and optimization
- Memory management
- Loading progress tracking
**Key Functions:**
- `loadAsset(type, path)` - Individual asset loading
- `preloadAssets(assetList)` - Batch loading
- `getAsset(id)` - Asset retrieval
- `unloadUnusedAssets()` - Memory cleanup
**Dependencies:** None (independent system)
**Integration Points:** Game initialization, runtime asset access

### `load_skill_icon.js` - Skill Icon Loading
**Purpose:** Specialized loader for skill icons and visual assets
**Responsibilities:**
- Skill icon sprite sheet management
- Icon coordinate mapping
- Performance optimization for icon rendering
- Fallback icon handling
**Key Functions:**
- `loadSkillIcons()` - Icon loading
- `getSkillIcon(skillId)` - Icon retrieval
- `renderSkillIcon(context, skillId, x, y)` - Icon drawing
**Dependencies:** `resource_manager.js`
**Integration Points:** Skill tree and UI rendering

### `data/skill-data.js` - Skill Definitions
**Purpose:** Static data for all skills in the game
**Responsibilities:**
- Skill property definitions
- Damage and effect calculations
- Skill requirements and prerequisites
- Balance configurations
**Key Structures:**
- Skill data objects
- Effect arrays
- Requirement objects
**Dependencies:** None (data definitions)
**Integration Points:** Skill system initialization

---

## 🔧 UTILITIES & HELPERS

### `input.js` - Input Processing System
**Purpose:** Handles all user input from keyboard, mouse, and controllers
**Responsibilities:**
- Input device detection
- Key state tracking
- Controller support
- Input buffering and debouncing
**Key Functions:**
- `updateInput()` - Input state updates
- `isKeyPressed(key)` - Key state checking
- `getControllerState(controllerId)` - Controller input
**Dependencies:** `constants.js`
**Integration Points:** Game update loop

### `collision.js` - Collision Detection System **[RECENTLY ENHANCED - AI DISTANCE FIXES]**
**Purpose:** Advanced collision detection and resolution with unified AI distance calculation system
**Responsibilities:**
- 3D collision detection with Z-depth
- Collision buffer systems
- Entity intersection calculations
- Collision response coordination
- **Unified distance calculation with intelligent fallbacks** **[NEW - AI FIXES]**
- **Animation readiness checks for accurate measurements** **[NEW - AI FIXES]**
- Attack collision detection **[MOVED HERE]**
- Movement validation **[MOVED HERE]**
- AI behavior constraints **[MOVED HERE]**
- Screen boundary enforcement **[MOVED HERE]**
**Key Functions:**
- `checkCollisionWithBuffer()` - Main collision check
- `checkHitboxCollision(attacker, target, params)` - Attack collision **[MOVED HERE]**
- `canMoveTo(entity, proposedX, proposedY, proposedZ)` - Movement validation **[MOVED HERE]**
- `getBehaviorConstraints(entity)` - AI decision boundaries **[MOVED HERE]**
- `applyScreenBoundaries(entity)` - Boundary enforcement **[MOVED HERE]**
- `calculateEntityDistance(entity1, entity2)` - **Unified distance calculation with 3D support** **[NEW - AI FIXES]**
- `isAnimationSystemReadyForEntity(entity)` - **Animation readiness validation** **[NEW - AI FIXES]**
- `resolveCollision()` - Collision response
- `getCollisionBounds(entity)` - Boundary calculation
**Key Features:**
- **Intelligent Fallbacks:** Entity-specific collision dimensions (Player: 65x260, Enemy: 80x60) when hitboxes unavailable **[NEW]**
- **Animation Readiness Checks:** Prevents calculations before system initialization **[NEW]**
- **3D Distance Support:** Includes depth (Z-axis) for accurate 2.5D gameplay **[NEW]**
- **Enhanced Logging:** Clear diagnostic information about animation system status **[NEW]**
**Global Exports:** All major collision functions exported globally for cross-module use
**Dependencies:** `entities.js`, `constants.js`
**Integration Points:** Physics, combat, AI, and game systems
**Note:** Recent AI fixes (Jan 2026) added unified distance calculation system with animation system integration

---

## 📚 DOCUMENTATION & GUIDELINES

### `AI_AGENT_GUIDELINES.md` - AI Development Guidelines **[ANALYZED]**
**Purpose:** Guidelines for AI agents working on the project
**Content:**
- Technical standards (vanilla JS, conservative libraries)
- Development workflow (git policy, scope management)
- Game design principles (arcade RPG balance)
- Quality assurance (testing, performance)
- Communication requirements
**Integration Points:** Development process reference

### `DEVELOPMENT_GUIDELINES.md` - General Development Guide
**Purpose:** Project-wide development standards and practices
**Responsibilities:**
- Coding standards
- Project structure guidelines
- Testing procedures
- Deployment processes
**Integration Points:** New developer onboarding

### `COMBAT_SYSTEM_SPECIFICATIONS.md` - Combat System Docs
**Purpose:** Detailed combat system documentation
**Responsibilities:**
- Combat mechanics explanation
- Balance considerations
- Implementation details
- Future improvements
**Integration Points:** Combat system development

### `COMBAT_SYSTEM_IMPROVEMENTS.md` - Combat Enhancement Plans
**Purpose:** Planned improvements and feature additions
**Responsibilities:**
- Future combat features
- Balance adjustments
- Technical improvements
- Community feedback integration
**Integration Points:** Combat system roadmap

---

## 🔄 INTEGRATION PATTERNS & BEST PRACTICES

### **Adding New Features - Checklist:**

#### **1. Check Existing Systems First:**
- [ ] Review this guide for similar functionality
- [ ] Check `PROJECT_FILE_GUIDE.md` for integration points
- [ ] Examine dependencies and usage patterns

#### **2. Choose Appropriate File:**
- [ ] **New game mechanic?** → Consider `game.js` or new system file
- [ ] **New enemy type?** → Extend `base_enemy.js`
- [ ] **New skill?** → Add to `skills.js` and `data/skill-data.js`
- [ ] **New UI element?** → Use `ui.js` or create component
- [ ] **New asset?** → Use `resource_manager.js`

#### **3. Follow Integration Patterns:**
- [ ] Use existing constants from `constants.js`
- [ ] Follow naming conventions from similar systems
- [ ] Add to appropriate update/render loops
- [ ] Include error handling and logging

#### **4. Update Documentation:**
- [ ] Add new file to this guide
- [ ] Update integration points for affected systems
- [ ] Document new dependencies

### **Common Integration Points:**

#### **Game Loop Integration:**
```javascript
// Add to game.js update() function
function update(dt) {
  // ... existing updates ...
  myNewSystem.update(dt);
}

// Add to render.js render() function
function render() {
  // ... existing rendering ...
  myNewSystem.render();
}
```

#### **Entity System Integration:**
```javascript
// Extend base classes
class MyNewEnemy extends BaseEnemy {
  // Custom behavior here
}
```

#### **UI System Integration:**
```javascript
// Add to ui.js
function renderUI() {
  // ... existing UI ...
  renderMyNewInterface();
}
```

---

## 🎯 REFACTORING ROADMAP

### **Phase 1: Code Quality Improvements**
- [ ] Standardize error handling patterns
- [ ] Implement consistent logging system
- [ ] Add input validation to all public functions
- [ ] Remove dead code and unused imports

### **Phase 2: Architecture Enhancements**
- [ ] Implement proper module system
- [ ] Create plugin architecture for features
- [ ] Enhance event system for inter-module communication
- [ ] Add configuration management system

### **Phase 3: Performance Optimizations**
- [ ] Implement object pooling for entities
- [ ] Add spatial partitioning for collision detection
- [ ] Optimize rendering with dirty rectangles
- [ ] Implement asset streaming for large levels

### **Phase 4: Developer Experience**
- [ ] Create automated testing framework
- [ ] Add development debugging tools
- [ ] Implement hot-reload for assets
- [ ] Create visual debugging overlays

### **Phase 5: Feature Extensibility**
- [ ] Design modding API
- [ ] Create custom level editor
- [ ] Implement save/load system
- [ ] Add multiplayer networking layer

---

## 📞 Maintenance & Updates

**This guide should be updated when:**
- New files are added to the project
- Existing files change their primary responsibility
- New integration patterns are established
- Major refactoring changes the architecture

**For questions about specific files:** Reference the relevant section above, or check the file's header comments for additional context.

---

*Guide Version: 1.0*
*Last Comprehensive Review: December 2025*
*Next Review Due: March 2026*
