# 🎮 Platformer Browser Game - Project File Guide

## 📋 Document Overview

This comprehensive guide documents every file in the Platformer Browser Game project. It serves as a reference for developers to understand existing systems and avoid creating duplicate functionality when adding new features.

**Last Updated:** December 2025
**Purpose:** Prevent code duplication, improve maintainability, guide feature development

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

### `game.js` - Main Game Loop & Logic
**Purpose:** Central game logic coordinator and main update/render loop
**Responsibilities:**
- Player updates and physics
- Enemy AI coordination
- Input processing and controller support
- Collision resolution
- Game state transitions
**Key Functions:**
- `update(dt)` - Main update loop
- `handleMovement(player, dt)` - Player physics
- `getBehaviorConstraints(entity)` - AI decision boundaries **[RECENTLY REFACTORED]**
- `applyScreenBoundaries(entity)` - Boundary enforcement
**Dependencies:** `game_state.js`, `input.js`, `collision.js`, `combat_system.js`
**Integration Points:** Core of game loop, called every frame

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

### `render.js` - Rendering Engine
**Purpose:** Handles all visual output and canvas drawing operations
**Responsibilities:**
- Canvas clearing and setup
- Entity rendering coordination
- UI overlay rendering
- Camera management
- Performance optimization for drawing
**Key Functions:**
- `render()` - Main render function
- `drawEntity(entity)` - Individual entity drawing
- `renderUI()` - Interface elements
**Dependencies:** `entities.js`, `animation_system.js`
**Integration Points:** Called every frame after update

---

## 👥 CHARACTER & PLAYER SYSTEMS

### `entities.js` - Player Entity Definitions
**Purpose:** Base player character classes and shared entity functionality
**Responsibilities:**
- Player character templates
- Basic entity properties (position, health, etc.)
- Shared character behaviors
- Entity serialization/deserialization
**Key Classes:**
- `Player` - Base player class
- `CharacterStats` - Stat management
**Dependencies:** `constants.js`, `character_info.js`
**Integration Points:** Extended by specific character classes

### `character_info.js` - Character Statistics & Progression
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
**Dependencies:** `constants.js`, `combat_system.js`
**Integration Points:** Used by all character-related systems

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

### `combat_system.js` - Combat Resolution Engine
**Purpose:** Handles all combat calculations and damage resolution
**Responsibilities:**
- Attack/defense calculations
- Critical hit determination
- Damage application and mitigation
- Combat result processing
- Death and defeat handling
**Key Functions:**
- `resolveAttack(attacker, defender, attackType)` - Main combat resolution
- `calculateDamage(attacker, defender)` - Damage computation
- `applyCombatResult(result)` - Result application
**Dependencies:** `character_info.js`, `entities.js`
**Integration Points:** Called whenever combat occurs

### `skills.js` - Individual Skill Implementations
**Purpose:** Contains specific skill logic and effects
**Responsibilities:**
- Skill execution logic
- Effect calculations and application
- Skill cooldown management
- Multi-target skill handling
**Key Functions:**
- `executeSkill(skillId, caster, targets)` - Skill activation
- `calculateSkillDamage(skill, caster)` - Skill-specific calculations
**Dependencies:** `combat_system.js`, `character_info.js`
**Integration Points:** Called by skill tree system

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

### `Animation System/animation_system.js` - Animation Coordinator
**Purpose:** Central animation management and playback system
**Responsibilities:**
- Animation state management
- Frame timing and sequencing
- Entity animation coordination
- Performance optimization
**Key Functions:**
- `update(dt)` - Animation updates
- `playAnimation(entity, animationName)` - Animation triggering
- `registerAnimation(entity, data)` - Animation registration
**Dependencies:** `Animation System/animation_data.js`
**Integration Points:** Core animation system

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

### `Animation System/animation_renderer.js` - Animation Drawing
**Purpose:** Handles the actual drawing of animated entities
**Responsibilities:**
- Frame selection and rendering
- Sprite positioning and scaling
- Animation interpolation
- Visual effect overlays
**Key Functions:**
- `renderAnimatedEntity(entity)` - Animation drawing
- `getCurrentFrame(entity)` - Frame calculation
**Dependencies:** `render.js`, `Animation System/animation_data.js`
**Integration Points:** Called during render phase

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

### `Behavior Tree/enemyAI_BT.js` - Behavior Tree Implementation **[RECENTLY REFACTORED]**
**Purpose:** Behavior Tree system for enemy AI decision making
**Responsibilities:**
- BT node implementations (Selector, Sequence, etc.)
- Enemy behavior coordination
- Decision tree execution
- Context-aware AI behavior **[ENHANCED]**
**Key Classes:**
- `BTNode` - Base node class
- `Selector`, `Sequence` - Composite nodes
- `Condition`, `Action` - Leaf nodes
**Key Functions:**
- `tickEnemyAI(tree, context)` - BT execution **[USES UTILS]**
- `selectTarget(ctx)` - Target selection **[NOW USES UTILS]**
**Dependencies:** `Behavior Tree/enemy_ai_utils.js`, `base_enemy.js`
**Integration Points:** Enemy AI decision making

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

### `Behavior Tree/enemy_ai_config.js` - AI Configuration **[NEWLY CREATED]**
**Purpose:** Centralized AI configuration and constants
**Responsibilities:**
- AI timing configurations
- Behavior parameters
- Performance settings
- Rarity/intelligence multipliers **[NEW SYSTEM]**
**Key Features:**
- `calculateThinkingDuration()` - Dynamic timing **[NEW]**
- Intelligence/rarity multipliers
- Caching configurations
**Dependencies:** None (configuration)
**Integration Points:** Used by all AI systems

### `base_enemy.js` - Enemy Base Class **[RECENTLY ENHANCED]**
**Purpose:** Foundation class for all enemy types
**Responsibilities:**
- Common enemy behaviors
- AI integration points
- Combat participation
- Animation coordination
**Key Functions:**
- `updateAI(players, dt)` - AI update cycle
- `updateFSMBehavior()` - Behavior state management
- `getThinkingDuration()` - AI timing **[NOW USES CONFIG]**
- `consultBTForBehavior()` - BT integration **[USES UTILS]**
**Dependencies:** `Behavior Tree/enemyAI_BT.js`, `combat_system.js`
**Integration Points:** Extended by specific enemy types

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

### `ui.js` - General UI Management
**Purpose:** Core UI system coordination
**Responsibilities:**
- UI state management
- Component coordination
- Input handling for UI
- Accessibility features
**Key Functions:**
- `initUI()` - UI initialization
- `handleUIInput()` - UI interactions
- `renderUI()` - UI drawing
**Dependencies:** `render.js`
**Integration Points:** Main UI coordinator

### `menu.js` - Menu System
**Purpose:** Game menus and navigation
**Responsibilities:**
- Main menu display
- Pause menu functionality
- Settings management
- Menu state transitions
**Key Functions:**
- `showMainMenu()` - Menu display
- `handleMenuInput()` - Menu navigation
- `togglePauseMenu()` - Pause functionality
**Dependencies:** `ui.js`, `game_state.js`
**Integration Points:** Game state transitions

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

### `collision.js` - Collision Detection System
**Purpose:** Advanced collision detection and resolution
**Responsibilities:**
- 3D collision detection with Z-depth
- Collision buffer systems
- Entity intersection calculations
- Collision response coordination
**Key Functions:**
- `checkCollisionWithBuffer()` - Main collision check
- `resolveCollision()` - Collision response
- `getCollisionBounds(entity)` - Boundary calculation
**Dependencies:** `entities.js`, `constants.js`
**Integration Points:** Physics and combat systems

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
