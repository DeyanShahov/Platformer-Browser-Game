# 🎮 Level System Specification - Browser Arcade RPG

## 📋 Document Overview

This specification outlines a comprehensive level system for the browser-based arcade RPG game. The system supports progression through predefined levels with various completion conditions, entity spawning, and smooth transitions between levels.

**Target Game Style:** Browser Arcade RPG with Co-op Multiplayer
**Architecture:** Data-driven level definitions with modular systems
**Key Features:** Static rooms, scrolling levels, progression tracking, save/load system

---

## 🎯 Core Requirements Analysis

### **Level Types**
The system must support two fundamental level types:

#### **1. Static Levels (Room-Based)**
- **Description:** Fixed screen that cannot be exited until completion conditions are met
- **Examples:** Classic arcade rooms, puzzle chambers, boss arenas
- **Movement:** Players can move freely within screen boundaries
- **Completion:** Must fulfill specific conditions before progressing
- **Use Cases:** Enemy combat rooms, puzzle solving, time-based challenges

#### **2. Scrolling Levels (Side-Scrolling)**
- **Description:** Screen moves with player movement to reveal new areas
- **Directions:** Horizontal (right), Vertical (up/down), potentially diagonal
- **Completion:** Reach end point or fulfill conditions while moving
- **Use Cases:** Exploration levels, chase sequences, platforming challenges

### **Transition Mechanisms**
Multiple ways to move between levels:

#### **Visual Indicators**
- **Directional Arrows:** Appear when conditions are met, point to exit direction
- **Exit Portals:** Interactive objects that trigger level transition
- **Screen Edges:** Automatic transition when reaching screen boundaries

#### **Transition Effects**
- **Fade Transitions:** Screen fades to black with countdown timer
- **Loading Simulation:** Brief "loading" period with progress indication
- **Instant Transitions:** Immediate level switch for fast-paced gameplay

### **Entity Management**
Comprehensive entity spawning and management:

#### **Enemy Spawning**
- **Position-based:** Fixed coordinates for static levels
- **Trigger-based:** Spawn when entering areas (scrolling levels)
- **Wave-based:** Sequential enemy waves with delays
- **Dynamic:** Spawn based on player actions or time

#### **Neutral Objects**
- **Interactive:** Chests, levers, switches, doors
- **Destructible:** Breakable objects, environmental hazards
- **Collectibles:** Coins, power-ups, keys
- **Decorative:** Background elements, scenery

---

## 🏛️ Architecture Decisions

### **Core Design Choices**

#### **LevelManager: Instance Pattern**
- **Decision:** Instance-based architecture with dependency injection
- **Rationale:** Consistency with existing codebase, better testability, explicit dependencies
- **Implementation:** Single LevelManager instance created in game.js with injected dependencies
- **Benefits:** Clear dependency management, easy mocking for tests, maintainable code structure

#### **Level Loading Sequence**
- **Decision:** Sequential loading: entities → hero positioning → game activation
- **Rationale:** Prevents race conditions, ensures complete initialization before gameplay
- **States:** `'loading'` → `'ready'` → `'active'` (waiting for player input)
- **Benefits:** Predictable loading behavior, no incomplete game states

#### **Error Handling: Strict Approach**
- **Decision:** Hard errors for corrupted level data during development
- **Rationale:** Surface problems immediately rather than masking them with fallbacks
- **Implementation:** `throw new Error()` for missing level data, invalid configurations
- **Future:** Graceful degradation for production builds with user-friendly messages

#### **GameState: Player Persistence**
- **Decision:** Players persist between levels, non-player entities are cleaned up
- **Rationale:** Player progression and state should be maintained, level entities are temporary
- **Implementation:** Player entities remain in GameState, level entities tracked and removed
- **Benefits:** Seamless level transitions, preserved player progress

#### **Performance Limits**
- **Decision:** Maximum 30 entities (4 players + 15 enemies + 10 decorative objects)
- **Rationale:** Browser performance constraints, maintain 60 FPS target
- **Monitoring:** GameState provides real-time entity counts and debugging info
- **Benefits:** Predictable performance, easier optimization

#### **Multiplayer: Local Co-op**
- **Decision:** Local multiplayer with single screen and unified rendering
- **Rationale:** Simplified architecture, no networking complexity, local play focus
- **Implementation:** All players share same GameState, single rendering pipeline
- **Benefits:** Lower complexity, easier debugging, better performance

---

## 🔗 System Integration Architecture

### **Integration with Existing Systems**

#### **GameState Integration**
The LevelManager integrates deeply with the existing GameState system for entity management:

```javascript
class LevelManager {
  constructor(gameState, animationSystem, combatSystem, collisionSystem) {
    this.gameState = gameState; // Reference to centralized entity storage
    this.animationSystem = animationSystem;
    this.combatSystem = combatSystem;
    this.collisionSystem = collisionSystem;

    this.currentLevel = null;
    this.levelProgress = {};
    this.spawnedEntities = new Set(); // Track entities created by this level
    this.transitionState = 'none';
    this.transitionTimer = 0;
  }

  // Entity management through GameState
  async loadLevel(levelId) {
    const levelData = LEVEL_REGISTRY[levelId];
    if (!levelData) throw new Error(`Level ${levelId} not found`);

    // Clean up previous level entities
    this.unloadCurrentLevel();

    // Load level data and spawn entities via GameState
    this.currentLevel = levelData;
    await this.spawnLevelEntities(levelData);

    // Initialize level-specific systems
    this.initializeLevelSystems(levelData);
  }

  unloadCurrentLevel() {
    if (!this.currentLevel) return;

    // Remove all entities spawned by this level
    this.spawnedEntities.forEach(entityId => {
      this.gameState.removeEntity(entityId);
    });
    this.spawnedEntities.clear();

    // Clean up level-specific resources
    this.cleanupLevelResources();
  }

  async spawnLevelEntities(levelData) {
    // Spawn enemies through GameState
    for (const enemyConfig of levelData.enemies) {
      if (enemyConfig.spawnTrigger === 'immediate') {
        const enemyId = await this.spawnEnemy(enemyConfig);
        this.spawnedEntities.add(enemyId);
      }
    }

    // Spawn neutral objects
    for (const objectConfig of levelData.neutralObjects) {
      const objectId = this.spawnNeutralObject(objectConfig);
      this.spawnedEntities.add(objectId);
    }
  }

  async spawnEnemy(config) {
    const enemyId = this.gameState.addEntity({
      type: 'enemy',
      enemyType: config.type,
      x: config.position.x,
      y: config.position.y,
      z: config.position.z,
      level: config.level,
      aiConfig: config.aiBehavior || 'default'
    });

    // Initialize enemy through existing systems
    await this.animationSystem.initializeEntityAnimation(enemyId, config.type);
    await this.initializeEnemyAI(enemyId, config);

    return enemyId;
  }
}
```

#### **AnimationSystem Integration**
LevelManager coordinates with the existing AnimationSystem for comprehensive entity rendering and animation management, with **CRITICAL emphasis on Z-depth sorting for authentic 2.5D gameplay**:

```javascript
class LevelManager {
  // AnimationSystem integration methods
  async initializeEntityAnimation(entityId, enemyType) {
    // Initialize animation data for newly spawned entities
    await this.animationSystem.initializeEntityAnimation(entityId, enemyType);

    // Ensure animation system is ready before level starts
    if (!this.animationSystem.isAnimationSystemReadyForEntity(entityId)) {
      console.warn(`Animation system not ready for entity ${entityId}`);
    }
  }

  updateEntityAnimations(dt) {
    // Update all active entity animations
    this.gameState.getAllEntities().forEach(entity => {
      if (entity.type === 'enemy' || entity.type === 'player') {
        this.animationSystem.updateEntityAnimation(entity.id, dt);
      }
    });
  }

  // 🎯 CRITICAL: Z-depth sorting for 2.5D visual integrity
  renderLevelEntities() {
    // Get Z-sorted entities for proper 2.5D rendering order
    const sortedEntities = this.getSortedEntitiesForRendering();

    // Render all entities through AnimationRenderer in correct depth order
    sortedEntities.forEach(entity => {
      this.animationSystem.renderAnimatedEntity(entity);
    });
  }

  // 🎯 CRITICAL: Z-depth sorting algorithm - FOUNDATION of 2.5D gameplay
  getSortedEntitiesForRendering() {
    const entities = this.gameState.getAllEntities();

    return entities.sort((a, b) => {
      // Calculate effective Y position including Z-depth offset
      const aEffectiveY = a.y - this.animationSystem.getZOffset(a);
      const bEffectiveY = b.y - this.animationSystem.getZOffset(b);

      // Lower effective Y = rendered later = appears in front
      // This ensures proper depth layering for 2.5D gameplay
      return aEffectiveY - bEffectiveY;
    });
  }

  // Handle animation state during level transitions
  pauseEntityAnimations() {
    this.gameState.getAllEntities().forEach(entity => {
      this.animationSystem.pauseEntityAnimation(entity.id);
    });
  }

  resumeEntityAnimations() {
    this.gameState.getAllEntities().forEach(entity => {
      this.animationSystem.resumeEntityAnimation(entity.id);
    });
  }
}
```

## 🎯 **CRITICAL: Z-Depth Sorting System - Foundation of 2.5D Gameplay**

The Z-depth sorting system is **ABSOLUTELY CRITICAL** for maintaining visual integrity in 2.5D gameplay. Without proper depth sorting, players would see entities rendered in incorrect order, breaking the immersion and making combat/conflict resolution confusing.

### **Z-Depth Sorting Principles:**
- **Rendering Order:** Back-to-front based on effective Y position
- **Effective Y Calculation:** `entity.y - zOffset` where lower values render in front
- **Real-time Updates:** Sorting occurs every frame to handle movement
- **Animation Integration:** Z-offsets can change based on animation states (jumping, hurt, etc.)

### **Depth Layering Rules:**
1. **Background Elements** (Z = -∞) - Always rendered first
2. **Far Entities** (high effective Y) - Rendered behind
3. **Mid-ground Entities** (medium effective Y) - Standard depth
4. **Near Entities** (low effective Y) - Rendered in front
5. **Foreground Elements** (Z = +∞) - Always rendered last

### **Z-Offset Examples:**
- **Player Entities:** Z = 0 (neutral depth baseline)
- **Enemies:** Z = -10 to +10 (level-based depth variation)
- **Projectiles:** Z = +5 (always appear in front of characters)
- **Particles/Effects:** Dynamic Z based on context
- **Death Animations:** Z adjustments during animation playback

**Key Integration Points:**
- **Entity Initialization:** Animation data loading during enemy spawning
- **Per-Frame Updates:** Animation state progression in game loop
- **Rendering Pipeline:** Centralized entity drawing through AnimationRenderer
- **🎯 Z-Depth Sorting:** **CRITICAL** proper layering for 2.5D gameplay - **FOUNDATION OF VISUAL INTEGRITY**
- **Transition Handling:** Animation pause/resume during level changes
- **Collision Data:** Real-time hit box access via `getCurrentHitBoxPosition()`
- **Sprite Management:** Asset caching and memory optimization

#### **CombatSystem Integration**
LevelManager integrates with CombatSystem for comprehensive combat mechanics and progression tracking:

```javascript
class LevelManager {
  // CombatSystem integration methods
  initializeCombatForLevel(levelData) {
    // Reset combat tracking for new level
    this.combatStats = {
      enemiesDefeated: 0,
      damageDealt: 0,
      damageTaken: 0,
      experienceGained: 0,
      goldCollected: 0,
      completionTime: 0,
      levelStartTime: Date.now()
    };

    // Set up completion condition monitoring
    this.setupCompletionTracking(levelData.completionConditions);
  }

  updateCombatTracking(dt) {
    // Update level timer
    this.combatStats.completionTime = Date.now() - this.combatStats.levelStartTime;

    // Check for defeated enemies and update tracking
    this.updateEnemyDefeatTracking();

    // Monitor completion conditions in real-time
    this.checkCompletionConditions();
  }

  onEnemyDefeated(enemyId, enemyData) {
    // Update combat statistics
    this.combatStats.enemiesDefeated++;
    this.combatStats.experienceGained += enemyData.experienceReward;
    this.combatStats.goldCollected += enemyData.goldReward;

    // Award experience and gold through CombatSystem
    this.combatSystem.awardExperience(this.combatStats.experienceGained);
    this.combatSystem.awardGold(this.combatStats.goldCollected);

    // Check if this affects completion conditions
    this.checkEnemyDefeatCompletion();
  }

  // Damage number positioning above hit boxes
  calculateDamageNumberPosition(attacker, target, damage) {
    // Get current hit box position for accurate placement
    const hitBox = this.animationSystem.getCurrentHitBoxPosition(target.id);
    if (hitBox) {
      return {
        x: target.x + hitBox.x + hitBox.width / 2,
        y: target.y + hitBox.y - 15, // 15px above hit box
        z: target.z
      };
    }

    // Fallback positioning
    return {
      x: target.x + target.collisionW / 2,
      y: target.y - 30,
      z: target.z
    };
  }

  // Completion condition checking through combat events
  checkEnemyDefeatCompletion() {
    const completionCondition = this.currentLevel.completionConditions;

    if (completionCondition.type === COMPLETION_TYPES.ENEMIES_DEFEATED) {
      const defeatedCount = this.combatStats.enemiesDefeated;
      const targetCount = completionCondition.targetCount;

      if (defeatedCount >= targetCount) {
        this.markCompletionConditionMet('enemies_defeated');
      }
    }
  }

  // Experience and rewards calculation
  calculateLevelRewards() {
    const baseXP = this.currentLevel.baseExperience || 100;
    const timeBonus = this.calculateTimeBonus();
    const difficultyMultiplier = this.currentLevel.difficultyMultiplier || 1;

    return {
      experience: Math.floor(baseXP * timeBonus * difficultyMultiplier),
      gold: Math.floor(this.combatStats.goldCollected * difficultyMultiplier),
      bonusItems: this.calculateBonusItems()
    };
  }

  calculateTimeBonus() {
    const parTime = this.currentLevel.parTime || 300000; // 5 minutes default
    const actualTime = this.combatStats.completionTime;

    if (actualTime <= parTime) {
      return 1.5; // 50% bonus for completing under par time
    } else if (actualTime <= parTime * 1.5) {
      return 1.2; // 20% bonus for reasonable time
    }

    return 1.0; // No bonus for slow completion
  }
}
```

**Key Integration Points:**
- **Real-time Tracking:** Combat statistics updated as battles progress
- **Completion Monitoring:** Automatic checking of defeat-based conditions
- **Reward System:** Experience and gold awards through CombatSystem
- **Damage Visualization:** Precise positioning above hit boxes for feedback
- **Performance Metrics:** Time tracking, damage ratios, combo counting
- **Event-driven Updates:** Combat events trigger level progression checks

**Damage Number Positioning Logic:**
```javascript
// Precise damage number placement above hit boxes
function positionDamageNumber(targetEntity, damageAmount) {
  const hitBox = animationSystem.getCurrentHitBoxPosition(targetEntity.id);

  if (hitBox) {
    // Position above the actual hit box for visual accuracy
    const position = {
      x: targetEntity.x + hitBox.x + (hitBox.width / 2),
      y: targetEntity.y + hitBox.y - DAMAGE_NUMBER_OFFSET,
      z: targetEntity.z
    };

    combatSystem.createDamageNumber(damageAmount, position);
  }
}
```

**Completion Condition Integration:**
- **Enemy Defeat Tracking:** Real-time counting through combat events
- **Time-based Conditions:** Level timer integration with combat system
- **Score-based Completion:** Damage dealt/ratio calculations
- **Multi-condition Logic:** AND/OR combinations for complex objectives

#### **CollisionSystem Integration**
LevelManager coordinates with the existing CollisionSystem to provide level-specific Z-depth boundaries and dynamic collision rules:

```javascript
class LevelManager {
  // CollisionSystem integration for level-specific boundaries
  setLevelCollisionContext(levelData) {
    // Configure collision system for level-specific boundaries
    this.collisionSystem.setLevelContext({
      boundaries: levelData.boundaries,
      collisionRules: this.parseLevelCollisionRules(levelData),
      entityInteractions: levelData.entityInteractionRules || 'default'
    });
  }

  parseLevelCollisionRules(levelData) {
    // Parse level-specific collision behavior
    return {
      zTolerance: levelData.collisionRules?.zTolerance || 30,
      allowStacking: levelData.collisionRules?.allowStacking || false,
      strictBoundaries: levelData.collisionRules?.strictBoundaries || true,
      entityInteractionMode: levelData.collisionRules?.entityInteractionMode || 'normal'
    };
  }

  // Level-aware collision checking
  checkLevelCollision(entity1, entity2, collisionType) {
    // Apply level-specific collision rules through existing system
    return this.collisionSystem.checkEntityCollision(
      entity1, entity2, collisionType,
      {
        levelContext: this.currentLevel.collisionRules,
        zBoundaries: this.currentLevel.boundaries
      }
    );
  }

  // Dynamic boundary updates (for moving platforms, changing environments)
  updateLevelBoundaries(newBoundaries) {
    this.currentLevel.boundaries = { ...this.currentLevel.boundaries, ...newBoundaries };
    this.collisionSystem.updateLevelBoundaries(this.currentLevel.boundaries);
  }
}
```

**Dynamic Level Boundaries Extension:**
The CollisionSystem will be extended to support dynamic level boundary configuration, allowing levels to change their Z-depth constraints during gameplay (e.g., moving platforms, collapsing caves, rising water levels).

**Key Integration Points:**
- **Level Context Setting:** `collisionSystem.setLevelContext()` configures level-specific rules
- **Dynamic Boundaries:** `updateLevelBoundaries()` allows runtime boundary changes
- **Level-Aware Collision:** All collision functions respect level-specific Z-depth rules
- **Boundary Enforcement:** `applyScreenBoundaries()` uses level boundaries instead of global constants
- **AI Constraints:** `getBehaviorConstraints()` considers level-specific movement limitations

#### **AI System Integration**
LevelManager integrates deeply with the Behavior Tree AI system for intelligent enemy behavior and dynamic level challenges:

```javascript
class LevelManager {
  // AI System integration methods
  async initializeEnemyAI(entityId, config) {
    // Initialize AI based on level configuration
    const aiConfig = {
      enemyType: config.type,
      level: config.level,
      behaviorOverride: config.aiBehavior,
      intelligence: this.calculateEnemyIntelligence(config.level),
      scriptConfig: config.scriptConfig || null
    };

    // Create appropriate AI factory based on enemy type and level
    const aiFactory = this.selectAIFactory(aiConfig);
    await aiFactory.createAIForEntity(entityId, aiConfig);

    // Initialize BT Memory system for adaptive behavior
    this.initializeBTMemoryForEntity(entityId, config);
  }

  selectAIFactory(aiConfig) {
    // Choose appropriate AI factory based on enemy type and level
    if (aiConfig.scriptConfig) {
      return this.scriptEnabledAIFactory; // For complex scripted behaviors
    } else if (aiConfig.enemyType === 'blue_slime') {
      return this.universalEnemyAIFactory; // Standard BT + FSM
    } else {
      return this.basicEnemyAIFactory; // Simple FSM fallback
    }
  }

  initializeBTMemoryForEntity(entityId, config) {
    // Set up BT Memory for adaptive enemy behavior
    const btMemory = {
      dynamicBlocked: new Set(),
      instanceId: this.generateEnemyInstanceId(config.type),
      levelContext: {
        levelType: this.currentLevel.type,
        difficulty: this.calculateLevelDifficulty(),
        playerCount: this.gameState.getPlayerCount()
      }
    };

    // Store BT memory in entity
    const entity = this.gameState.getEntity(entityId);
    entity.btMemory = btMemory;
  }

  calculateEnemyIntelligence(level) {
    // Scale enemy intelligence based on level
    const baseIntelligence = 1.0;
    const intelligenceGrowth = 0.2; // 20% increase per level
    return baseIntelligence + (level - 1) * intelligenceGrowth;
  }

  updateEnemyAI(dt) {
    // Update all enemy AI systems
    this.gameState.getAllEntities().forEach(entity => {
      if (entity.type === 'enemy') {
        this.updateEntityAI(entity, dt);
      }
    });
  }

  updateEntityAI(entity, dt) {
    // Update BT context with current game state
    const btContext = this.buildBTContext(entity);

    // Execute AI decision making
    if (entity.aiSystem?.bt) {
      entity.aiSystem.bt.execute(btContext, dt);
    }

    // Update FSM state
    if (entity.aiSystem?.fsm) {
      entity.aiSystem.fsm.update(dt);
    }
  }

  buildBTContext(entity) {
    // Build comprehensive BT context for decision making
    const players = this.gameState.getAllPlayers();
    const nearestPlayer = this.findNearestPlayer(entity, players);

    return {
      self: {
        id: entity.id,
        x: entity.x,
        y: entity.y,
        z: entity.z,
        w: entity.collisionW || entity.w,
        h: entity.collisionH || entity.h,
        zThickness: entity.zThickness,
        health: entity.health,
        maxHealth: entity.maxHealth,
        level: entity.level
      },
      targets: players.map(player => ({
        id: player.id,
        x: player.x,
        y: player.y,
        z: player.z,
        w: player.collisionW || player.w,
        h: player.collisionH || player.h,
        zThickness: player.zThickness,
        distance: this.collisionSystem.calculateEntityDistance(entity, player)
      })),
      nearestTarget: nearestPlayer ? {
        id: nearestPlayer.id,
        distance: this.collisionSystem.calculateEntityDistance(entity, nearestPlayer),
        x: nearestPlayer.x,
        y: nearestPlayer.y,
        z: nearestPlayer.z
      } : null,
      levelContext: {
        boundaries: this.currentLevel.boundaries,
        type: this.currentLevel.type,
        difficulty: this.calculateLevelDifficulty()
      },
      btMemory: entity.btMemory
    };
  }

  findNearestPlayer(entity, players) {
    let nearest = null;
    let minDistance = Infinity;

    players.forEach(player => {
      const distance = this.collisionSystem.calculateEntityDistance(entity, player);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = player;
      }
    });

    return nearest;
  }

  // Dynamic AI behavior based on level type
  adjustAIForLevelType(entity, levelType) {
    switch (levelType) {
      case 'static':
        // Static levels: More aggressive, less movement
        entity.btMemory.dynamicBlocked.add('patrol_long');
        break;
      case 'scrolling_horizontal':
        // Scrolling levels: Follow player movement, area-based behaviors
        entity.aiConfig.scrollBehavior = 'follow_player';
        break;
      case 'scrolling_vertical':
        // Vertical levels: Z-axis movement priority
        entity.aiConfig.verticalPriority = true;
        break;
    }
  }

  // BT Memory integration for adaptive behavior
  handleBTMemoryUpdate(entityId, blockedCommand) {
    const entity = this.gameState.getEntity(entityId);
    if (entity?.btMemory?.dynamicBlocked) {
      entity.btMemory.dynamicBlocked.add(blockedCommand);

      // Log for debugging
      console.log(`[BT_MEMORY] ${entity.btMemory.instanceId}: Blocked ${blockedCommand}`);
    }
  }

  // Multi-enemy coordination
  coordinateEnemiesInLevel() {
    const enemies = this.gameState.getEntitiesByType('enemy');

    // Group enemies by type and area for coordination
    const enemyGroups = this.groupEnemiesByArea(enemies);

    // Apply coordination logic
    enemyGroups.forEach(group => {
      this.applyGroupCoordination(group);
    });
  }

  groupEnemiesByArea(enemies) {
    const groups = {};
    const areaSize = 400; // 400px areas

    enemies.forEach(enemy => {
      const areaX = Math.floor(enemy.x / areaSize);
      const areaY = Math.floor(enemy.y / areaSize);
      const areaKey = `${areaX}_${areaY}`;

      if (!groups[areaKey]) {
        groups[areaKey] = [];
      }
      groups[areaKey].push(enemy);
    });

    return groups;
  }

  applyGroupCoordination(enemyGroup) {
    if (enemyGroup.length > 1) {
      // Apply swarm behavior or coordinated attacks
      const coordinationType = this.selectCoordinationType(enemyGroup);
      enemyGroup.forEach(enemy => {
        enemy.aiConfig.coordination = coordinationType;
      });
    }
  }
}
```

**Key Integration Points:**
- **Behavior Tree Context:** Rich context building for intelligent decision making
- **BT Memory System:** Dynamic blocked behaviors for adaptive enemy behavior
- **Level-Aware AI:** Different behaviors based on static vs scrolling levels
- **Multi-Enemy Coordination:** Area-based grouping and coordinated behaviors
- **Instance Tracking:** Unique IDs for debugging and behavior analysis
- **Intelligence Scaling:** Enemy difficulty increases with level progression

**AI Behavior Types by Level:**
- **Static Levels:** Aggressive patrol patterns, ambush behaviors, room defense
- **Scrolling Levels:** Player following, trigger-based activation, wave spawning
- **Boss Levels:** Phased behaviors, complex attack patterns, environmental interaction

**BT Memory Integration:**
```javascript
// Dynamic adaptation based on failed actions
function handleBTMemoryUpdate(entity, failedCommand) {
  entity.btMemory.dynamicBlocked.add(failedCommand);

  // Prevent infinite loops by remembering what doesn't work
  switch (failedCommand) {
    case 'patrol_right':
      // Try alternative directions
      entity.btMemory.preferredDirection = 'left';
      break;
    case 'move_up':
      // Avoid vertical movement at boundaries
      entity.btMemory.verticalMovementBlocked = true;
      break;
  }
}
```

#### **LevelAssetManager Integration**
Comprehensive level asset management system for loading and coordinating all resources needed for a level:

```javascript
class LevelAssetManager {
  constructor(spriteManager, resourceManager, audioManager) {
    this.spriteManager = spriteManager;
    this.resourceManager = resourceManager;
    this.audioManager = audioManager; // Placeholder for future audio system
    this.loadedAssets = new Set();
  }

  // Main level loading orchestration
  async loadLevelAssets(levelId) {
    const levelData = STAGE_DATA[levelId];
    if (!levelData) {
      throw new Error(`Level ${levelId} not found in STAGE_DATA!`);
    }

    // Validate all required assets exist
    this.validateLevelAssets(levelData);

    // Load multi-layer backgrounds
    await this.loadBackgroundLayers(levelData.backgrounds);

    // Load entity sprites
    await this.loadEntitySprites(levelData.entities);

    // Load audio assets (placeholder)
    await this.loadAudioAssets(levelData.audio);

    // Track loaded assets for cleanup
    this.trackLoadedAssets(levelData);
  }

  // Validate asset existence (strict - throw errors for missing assets)
  validateLevelAssets(levelData) {
    const requiredAssets = this.collectRequiredAssets(levelData);

    for (const assetPath of requiredAssets) {
      if (!this.assetExists(assetPath)) {
        throw new Error(`Required level asset not found: ${assetPath}`);
      }
    }
  }

  // Multi-layer background system (3 horizontal zones)
  async loadBackgroundLayers(backgrounds) {
    const zones = {
      upper: { y: 0, height: CANVAS_HEIGHT * 0.3 },
      middle: { y: CANVAS_HEIGHT * 0.3, height: CANVAS_HEIGHT * 0.4 },
      lower: { y: CANVAS_HEIGHT * 0.7, height: CANVAS_HEIGHT * 0.3 }
    };

    // Load upper zone background
    if (backgrounds.upper) {
      await this.spriteManager.loadSprite(`assets/backgrounds/${backgrounds.upper}`);
      this.setBackgroundLayer('upper', backgrounds.upper, zones.upper);
    }

    // Load middle zone background
    if (backgrounds.middle) {
      await this.spriteManager.loadSprite(`assets/backgrounds/${backgrounds.middle}`);
      this.setBackgroundLayer('middle', backgrounds.middle, zones.middle);
    }

    // Load lower zone background
    if (backgrounds.lower) {
      await this.spriteManager.loadSprite(`assets/backgrounds/${backgrounds.lower}`);
      this.setBackgroundLayer('lower', backgrounds.lower, zones.lower);
    }
  }

  // Load sprites for level-specific entities
  async loadEntitySprites(entities) {
    const spritePaths = new Set();

    // Collect unique sprite paths from entities
    entities.forEach(entity => {
      const spritePath = this.getEntitySpritePath(entity);
      if (spritePath) {
        spritePaths.add(spritePath);
      }
    });

    // Load all required sprites
    for (const spritePath of spritePaths) {
      await this.spriteManager.loadSprite(spritePath);
    }
  }

  // Audio asset loading (placeholder system)
  async loadAudioAssets(audioConfig) {
    // Placeholder for future audio system
    if (audioConfig.music) {
      console.log(`[LevelAssetManager] Music asset placeholder: ${audioConfig.music}`);
      // TODO: Integrate with audio system when implemented
    }

    if (audioConfig.ambient) {
      console.log(`[LevelAssetManager] Ambient audio placeholder: ${audioConfig.ambient}`);
      // TODO: Integrate with audio system when implemented
    }
  }

  // Player resource restoration (optional)
  restorePlayerResourcesIfNeeded(levelData, players) {
    if (levelData.playerState?.restoreResources) {
      players.forEach(player => {
        // Use ResourceManager only when needed for restoration
        const resourceManager = this.resourceManager.getResourceManager(player);
        resourceManager.restoreResource('health', 'level_restore');
        resourceManager.restoreResource('mana', 'level_restore');
        resourceManager.restoreResource('energy', 'level_restore');
      });
    }
  }

  // Asset cleanup between levels
  unloadLevelAssets(previousLevelData) {
    if (!previousLevelData) return;

    // Unload backgrounds
    if (previousLevelData.backgrounds) {
      Object.values(previousLevelData.backgrounds).forEach(bg => {
        if (bg) this.spriteManager.unloadAsset(`assets/backgrounds/${bg}`);
      });
    }

    // Clear loaded assets tracking
    this.loadedAssets.clear();
  }

  // Utility methods
  assetExists(assetPath) {
    // Check if asset file exists (basic check)
    // In production, this would check actual file system
    return true; // Placeholder - will be implemented based on asset registry
  }

  getEntitySpritePath(entity) {
    // Map entity types to sprite paths
    const spriteMap = {
      'blue_slime': './Enemies/Blue_Slime/',
      'skeleton': './Enemies/Skeleton/',
      'barrel': './Objects/Barrel.png'
      // Add more mappings as needed
    };

    return spriteMap[entity.type];
  }
}
```

**Level Data Definition System (stage_data.js):**
The system uses a comprehensive `stage_data.js` file containing detailed level definitions:

```javascript
// stage_data.js - Complete level definitions
const STAGE_DATA = {
  'dark_forest_level_1': {
    // Level metadata
    name: 'Тъмна гора',
    level: 1,
    requiresPrevious: false,  // Can be played immediately
    unlocksNext: 'dark_forest_level_2',

    // Completion conditions
    completionType: 'defeat_all_enemies',
    timeLimit: null,  // No time limit

    // Entity definitions
    entities: [
      { type: 'skeleton', level: 1, x: 100, y: 150 },
      { type: 'skeleton', level: 1, x: 200, y: 150 },
      { type: 'skeleton', level: 2, x: 300, y: 150 },
      { type: 'barrel', x: 20, y: 20 }
    ],

    // Multi-layer background system
    backgrounds: {
      upper: 'sun_and_clouds.png',      // Upper third of screen
      middle: 'field_with_path.png',     // Middle third of screen
      lower: 'close_plan_trees.png'      // Lower third of screen
    },

    // Audio assets (placeholder)
    audio: {
      music: 'audio_set1.mp3',
      ambient: null
    },

    // Player state management
    playerState: {
      restoreResources: true,  // Full health/mana/energy restore
      restorePosition: false   // Keep current position
    }
  }
};

// Level progression tree
const LEVEL_PROGRESSION = {
  'dark_forest_level_1': { next: 'dark_forest_level_2', requirements: [] },
  'dark_forest_level_2': { next: 'cave_level_1', requirements: ['dark_forest_level_1'] }
};
```

**Asset Management Strategy:**
- **Strict Validation:** Missing assets throw immediate errors (no fallback logic)
- **Direct Project Assets:** Assets located directly in project structure like existing sprites
- **Multi-layer Backgrounds:** Screen divided into 3 horizontal zones with independent backgrounds
- **Entity Sprite Loading:** Automatic loading of sprites based on entity types in level data
- **Resource Manager Integration:** Only used for optional player resource restoration

**Key Integration Points:**
- **SpriteManager:** Primary asset loading and caching for backgrounds and sprites
- **ResourceManager:** Optional player resource restoration (only when level requires it)
- **Audio System:** Placeholder methods for future music/ambient audio integration
- **GameState:** Entity spawning coordination after asset loading completes

#### **UI System Integration**
LevelManager integrates with the existing UI system to provide level selection and progress tracking interfaces:

```javascript
class LevelManager {
  // UI System integration methods
  showLevelSelectionMenu() {
    // Display level selection grid using existing menu.js architecture
    // Follows skill tree navigation patterns (WASD/Enter/Escape)
    this.uiSystem.showLevelSelection(this.getAvailableLevels());
  }

  showGlobalProgressMap() {
    // Display overall game progress (main menu option)
    // Shows reached level with simple text-based indicators
    this.uiSystem.showProgressMap(this.getGameProgress());
  }

  updateLevelProgressIndicators(levelId, completionData) {
    // Update progress displays after level completion
    // Text-based progress tracking (no save/load initially)
    this.uiSystem.updateProgressIndicators(levelId, completionData);
  }

  handlePlayerDeath() {
    // Arcade-style game over - reset to reached level
    // No save system - restart progress from beginning
    const reachedLevel = this.getLastCompletedLevel();
    this.resetToLevel(reachedLevel);
    this.uiSystem.showGameOverScreen(reachedLevel);
  }
}
```

**Level Selection Interface:**
- **Grid Navigation:** Uses existing menu.js grid navigation patterns (6x5 layout like skill trees)
- **Controller Support:** Primary input method (gamepad buttons for navigation/selection)
- **Preview Panel:** Shows level info, requirements, and progress status
- **Player Activation:** Initial player selection (1-4 players) at game start
- **Menu Integration:** Level selection as main menu option

**Progress Tracking System:**
- **Text-Based Display:** Simple text indicators for level completion status
- **Leaderboard Style:** Points and achievements list for main levels
- **Level Progression:** Dark Forest 1.0 → 1.1 → 1.2 → 1.3 (boss) → Deep Dungeon 2.0 → etc.
- **No Persistence:** Arcade-style gameplay - restart from beginning on death
- **Global Map:** Simple progress overview showing reached level (main menu option)

**UI Architecture Integration:**
- **Extends menu.js:** Adds `levelSelection` and `progressMap` to menu states
- **Follows Patterns:** Grid navigation, preview panels, controller input like skill trees
- **Multiplayer Ready:** Supports 1-4 player activation and progress tracking
- **Minimal Complexity:** Text-based progress, no complex save systems initially

**Key Integration Points:**
- **Menu System/:** Level selection menu using existing navigation patterns
- **ui.js:** Progress indicators and status displays
- **Input System:** Controller/gamepad primary, keyboard secondary
- **Game Flow:** Level selection → gameplay → death/restart cycle

---

## 🏗️ System Architecture

### **Core Components**

#### **1. LevelManager Class**
```javascript
class LevelManager {
  constructor() {
    this.currentLevel = null;
    this.levelProgress = {};
    this.transitionState = 'none'; // 'none', 'fading_out', 'loading', 'fading_in'
    this.transitionTimer = 0;
  }

  // Core methods
  loadLevel(levelId);
  unloadCurrentLevel();
  checkCompletionConditions();
  startTransition(targetLevelId, transitionType);
  updateTransition(dt);
  saveProgress();
  loadProgress();
}
```

#### **2. LevelData Structure**
```javascript
class LevelData {
  constructor(config) {
    // Basic info
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.type = config.type; // 'static', 'scrolling_horizontal', 'scrolling_vertical'

    // Visual settings
    this.backgroundImages = config.backgroundImages; // Array of image paths
    this.musicTrack = config.musicTrack;
    this.ambientEffects = config.ambientEffects;

    // Entity definitions
    this.enemies = config.enemies; // Array of enemy spawn configs
    this.neutralObjects = config.neutralObjects; // Array of object configs
    this.playerSpawns = config.playerSpawns; // Array of spawn points

    // Level mechanics
    this.boundaries = config.boundaries; // Movement limits
    this.scrollSettings = config.scrollSettings; // For scrolling levels
    this.completionConditions = config.completionConditions;

    // Transition settings
    this.exitPoints = config.exitPoints; // Where players can exit
    this.nextLevelId = config.nextLevelId;
    this.transitionType = config.transitionType; // 'arrow', 'fade', 'instant'
  }
}
```

#### **3. Entity Spawn Configuration**
```javascript
// Enemy spawn config
{
  type: 'blue_slime',
  level: 2,
  position: { x: 500, y: 300, z: 0 },
  spawnTrigger: 'immediate', // 'immediate', 'area_enter', 'time_delay', 'wave'
  spawnDelay: 0, // For delayed spawns
  aiBehavior: 'patrol', // Default behavior override
  dropTable: ['coin', 'health_potion'] // Optional loot
}

// Neutral object config
{
  type: 'chest',
  position: { x: 800, y: 250, z: 0 },
  properties: {
    locked: false,
    lootTable: ['sword_upgrade', 'gold_coins'],
    interactionType: 'open_on_contact'
  }
}
```

#### **4. Completion Conditions System**
```javascript
// Completion condition types
const COMPLETION_TYPES = {
  ENEMIES_DEFEATED: 'enemies_defeated',
  TIME_SURVIVAL: 'time_survival',
  OBJECT_INTERACTION: 'object_interaction',
  PUZZLE_SOLVED: 'puzzle_solved',
  AREA_REACHED: 'area_reached',
  SCORE_ACHIEVED: 'score_achieved',
  MULTIPLE: 'multiple' // Combination of conditions
};

// Example completion condition
{
  type: COMPLETION_TYPES.ENEMIES_DEFEATED,
  targetCount: 5, // Kill 5 enemies
  requiredTypes: ['blue_slime'], // Specific enemy types
  timeLimit: null // No time limit
}

{
  type: COMPLETION_TYPES.MULTIPLE,
  conditions: [
    { type: COMPLETION_TYPES.ENEMIES_DEFEATED, targetCount: 3 },
    { type: COMPLETION_TYPES.OBJECT_INTERACTION, objectId: 'treasure_chest' }
  ],
  logic: 'AND' // All conditions must be met
}
```

---

## 🎮 Level Types Detailed Specification

### **Static Levels**

#### **Characteristics**
- Fixed camera position
- Players cannot exit until conditions are met
- All entities spawn at level start
- Focus on combat, puzzles, or time-based challenges

#### **Configuration Example**
```javascript
{
  id: 'level_1_combat_room',
  type: 'static',
  name: 'The First Challenge',
  description: 'Defeat all enemies to proceed',

  boundaries: {
    left: 0,
    right: CANVAS_WIDTH,
    top: 0,
    bottom: CANVAS_HEIGHT,
    zMin: Z_MIN,
    zMax: Z_MAX
  },

  enemies: [
    { type: 'blue_slime', level: 1, position: { x: 300, y: 300, z: 0 } },
    { type: 'blue_slime', level: 1, position: { x: 600, y: 300, z: 0 } },
    { type: 'blue_slime', level: 1, position: { x: 900, y: 300, z: 0 } }
  ],

  completionConditions: {
    type: COMPLETION_TYPES.ENEMIES_DEFEATED,
    targetCount: 3
  },

  exitPoints: [
    {
      position: { x: CANVAS_WIDTH - 50, y: CANVAS_HEIGHT / 2 },
      direction: 'right',
      visualIndicator: 'arrow_right',
      activated: false // Becomes true when conditions are met
    }
  ]
}
```

#### **Exit Point System**
- **Activation:** Exit points become active only after completion conditions are met
- **Visual Indicators:** Arrows, portals, or highlighted areas
- **Interaction:** Player must move to exit point to trigger transition

### **Scrolling Levels**

#### **Characteristics**
- Camera follows player movement
- Dynamic entity spawning based on progress
- Larger level areas revealed gradually
- Can scroll in multiple directions

#### **Configuration Example**
```javascript
{
  id: 'level_3_scroll_challenge',
  type: 'scrolling_horizontal',
  name: 'The Long Journey',
  description: 'Navigate through the level and defeat enemies along the way',

  scrollSettings: {
    direction: 'right', // 'right', 'left', 'up', 'down'
    speed: 1.0, // Camera follow speed multiplier
    deadzone: 200, // Pixels from screen edge before scrolling
    bounds: {
      startX: 0,
      endX: 3000, // Total level width
      minY: 0,
      maxY: CANVAS_HEIGHT
    }
  },

  // Trigger-based enemy spawning
  enemies: [
    // Immediate spawns
    { type: 'blue_slime', level: 1, position: { x: 400, y: 300, z: 0 }, spawnTrigger: 'immediate' },

    // Area-triggered spawns
    { type: 'blue_slime', level: 2, position: { x: 1200, y: 300, z: 0 }, spawnTrigger: 'area_enter', triggerArea: { x: 1000, width: 200 } },

    // Time-delayed spawns
    { type: 'blue_slime', level: 3, position: { x: 2000, y: 300, z: 0 }, spawnTrigger: 'time_delay', spawnDelay: 5000 }
  ],

  completionConditions: {
    type: COMPLETION_TYPES.AREA_REACHED,
    targetArea: { x: 2800, y: 0, width: 200, height: CANVAS_HEIGHT }
  }
}
```

#### **Scroll Direction Support**
- **Horizontal Right:** Classic side-scrolling (Mario, Sonic style)
- **Horizontal Left:** Reverse scrolling for special levels
- **Vertical Up:** Climbing levels (metroidvania style)
- **Vertical Down:** Descent levels (cave exploration)
- **Potential:** Diagonal scrolling for complex level designs

---

## 🔄 Transition System

### **Transition Types**

#### **1. Arrow-Guided Transitions**
- **Activation:** Arrows appear when level is completed
- **Visual:** Animated arrows pointing to exit direction
- **Interaction:** Player must move toward arrow to trigger transition
- **Use Case:** Clear visual indication of progress path

#### **2. Fade Transitions**
- **Sequence:** Fade to black → Show countdown → Fade in new level
- **Duration:** 2-3 seconds total transition time
- **Feedback:** Loading progress or level name display
- **Use Case:** Classic arcade feel with loading simulation

#### **3. Instant Transitions**
- **Immediate:** Direct level switch without effects
- **Positioning:** Players respawn at new level start positions
- **Use Case:** Fast-paced gameplay or seamless areas

### **Player Respawn Logic**
```javascript
// Respawn system considerations
class PlayerRespawnSystem {
  // Handle player positioning after level transition
  respawnPlayersForLevel(levelData) {
    const spawnPoints = levelData.playerSpawns;

    // Multiplayer support: assign players to available spawn points
    activePlayers.forEach((playerId, index) => {
      const spawnPoint = spawnPoints[index] || spawnPoints[0]; // Fallback to first spawn
      const player = gameState.getPlayer(playerId);

      player.x = spawnPoint.x;
      player.y = spawnPoint.y;
      player.z = spawnPoint.z || 0;

      // Reset player state
      player.health = player.maxHealth;
      player.energy = player.maxEnergy;
      player.mana = player.maxMana;
    });
  }
}
```

---

## 💾 Progression & Save System

### **Progress Tracking**
```javascript
class ProgressionSystem {
  constructor() {
    this.unlockedLevels = new Set(['level_1']); // Starting levels
    this.completedLevels = new Set();
    this.levelScores = {}; // levelId -> { score, time, stars }
    this.playerStats = {
      totalPlayTime: 0,
      totalEnemiesDefeated: 0,
      totalCoinsCollected: 0,
      bestTimes: {}
    };
  }

  // Level completion tracking
  completeLevel(levelId, completionData) {
    this.completedLevels.add(levelId);
    this.levelScores[levelId] = {
      score: completionData.score,
      time: completionData.time,
      stars: this.calculateStars(completionData),
      completionDate: new Date()
    };

    // Unlock next level
    this.unlockNextLevel(levelId);

    // Update global stats
    this.updateGlobalStats(completionData);
  }

  // Star rating system (0-3 stars)
  calculateStars(completionData) {
    let stars = 1; // Base completion

    // Time bonus
    if (completionData.time <= completionData.parTime) stars++;

    // Score bonus
    if (completionData.score >= completionData.targetScore) stars++;

    // Perfect run bonus
    if (completionData.perfectRun) stars++;

    return Math.min(stars, 3);
  }
}
```

### **Save/Load System**
```javascript
class SaveSystem {
  // Local storage persistence
  saveGameData() {
    const saveData = {
      version: GAME_VERSION,
      timestamp: new Date(),
      progression: progressionSystem.serialize(),
      playerStats: playerStats,
      settings: gameSettings
    };

    localStorage.setItem('platformerRPG_save', JSON.stringify(saveData));
  }

  loadGameData() {
    const saveString = localStorage.getItem('platformerRPG_save');
    if (!saveString) return null;

    try {
      const saveData = JSON.parse(saveString);

      // Version compatibility check
      if (saveData.version !== GAME_VERSION) {
        return this.migrateSaveData(saveData);
      }

      return saveData;
    } catch (error) {
      console.error('Failed to load save data:', error);
      return null;
    }
  }
}
```

---

## 🎨 Visual & Audio Design

### **Background System**
```javascript
class BackgroundSystem {
  // Multi-layer background support
  renderBackground(levelData) {
    levelData.backgroundImages.forEach((bgImage, index) => {
      const layer = bgImage.layer || 0;

      // Parallax scrolling for scrolling levels
      let offsetX = 0;
      let offsetY = 0;

      if (levelData.type.includes('scrolling')) {
        const scrollFactor = bgImage.parallaxFactor || 0.5;
        offsetX = camera.x * scrollFactor * (index + 1);
        offsetY = camera.y * scrollFactor * (index + 1);
      }

      // Render background layer
      this.renderBackgroundLayer(bgImage, offsetX, offsetY, layer);
    });
  }
}
```

### **Audio Management**
- **Background Music:** Level-specific tracks
- **Ambient Sounds:** Environmental audio
- **Transition Audio:** Sound effects for level changes
- **Dynamic Audio:** Intensity changes based on level progress

---

## 🎯 Advanced Features

### **Score & Bonus System**
```javascript
class ScoreSystem {
  // Multiplicative scoring
  calculateScore(completionData) {
    let baseScore = completionData.enemiesDefeated * 100;
    let timeBonus = Math.max(0, 10000 - completionData.time); // Faster = more points
    let comboMultiplier = completionData.maxCombo || 1;
    let difficultyMultiplier = completionData.levelDifficulty || 1;

    return (baseScore + timeBonus) * comboMultiplier * difficultyMultiplier;
  }

  // Bonus objectives
  checkBonusObjectives(levelId, playerActions) {
    const bonuses = LEVEL_BONUSES[levelId] || [];

    return bonuses.filter(bonus => {
      switch (bonus.type) {
        case 'time_limit':
          return playerActions.totalTime <= bonus.target;
        case 'no_damage':
          return playerActions.damageTaken === 0;
        case 'perfect_accuracy':
          return playerActions.missedAttacks === 0;
        case 'secret_found':
          return playerActions.secretsFound.includes(bonus.secretId);
      }
    });
  }
}
```

### **Time Attack Mode**
- **Speedrun Support:** Separate leaderboards for fastest completions
- **Time Bonuses:** Score multipliers for quick level clears
- **Checkpoint System:** For long scrolling levels

### **Secret Areas & Easter Eggs**
- **Hidden Paths:** Accessible through specific actions
- **Secret Levels:** Unlocked through finding hidden items
- **Alternate Endings:** Different paths through level sets

### **Co-op Specific Features**
- **Shared Progress:** Team completion requirements
- **Individual Stats:** Personal achievements within co-op
- **Respawn Coordination:** Co-op respawn points and mechanics

---

## 🛠️ Implementation Roadmap

### **Phase 1: Core Infrastructure (Week 1-2)**
- [ ] Create LevelManager and LevelData classes
- [ ] Implement basic static level loading
- [ ] Add entity spawning system
- [ ] Create completion condition checking

### **Phase 2: Level Types (Week 3-4)**
- [ ] Implement scrolling level mechanics
- [ ] Add camera following system
- [ ] Create exit point and transition system
- [ ] Add fade transition effects

### **Phase 3: Progression & Save (Week 5-6)**
- [ ] Implement progression tracking
- [ ] Add save/load functionality
- [ ] Create level selection UI
- [ ] Add star rating system

### **Phase 4: Advanced Features (Week 7-8)**
- [ ] Implement score and bonus systems
- [ ] Add time attack mode
- [ ] Create secret area system
- [ ] Add level editor foundation

### **Phase 5: Polish & Balance (Week 9-10)**
- [ ] Balance difficulty progression
- [ ] Add visual effects and audio
- [ ] Create tutorial levels
- [ ] Performance optimization

---

## 📊 Data Structure Examples

### **Level Registry**
```javascript
// levels/level_registry.js
const LEVEL_REGISTRY = {
  'level_1_tutorial': {
    // LevelData object
  },
  'level_2_combat': {
    // LevelData object
  },
  // ... more levels
};
```

### **Level Progression Tree**
```javascript
const LEVEL_PROGRESSION = {
  'level_1': { next: 'level_2', unlocks: [] },
  'level_2': { next: 'level_3', unlocks: ['secret_level_1'] },
  'level_3': {
    next: 'boss_1',
    unlocks: ['secret_level_2', 'bonus_level_1'],
    requirements: ['level_2_completed']
  }
};
```

---

## 🔧 Technical Considerations

### **Performance Optimizations**
- **Entity Pooling:** Reuse entity objects to avoid GC spikes
- **Spatial Partitioning:** Efficient collision detection for large levels
- **Lazy Loading:** Load level assets on demand
- **Background Caching:** Preload frequently used backgrounds

### **Memory Management**
- **Level Cleanup:** Properly dispose of entities and resources
- **Asset Unloading:** Free unused sprites and sounds
- **State Reset:** Clear level-specific state between transitions

### **Error Handling**
- **Level Loading Failures:** Graceful fallback to previous level
- **Entity Spawn Errors:** Skip problematic entities with logging
- **Transition Failures:** Retry mechanism with user feedback

---

## 🎮 Usage Examples

### **Creating a New Level**
```javascript
// Define level data
const tutorialLevel = new LevelData({
  id: 'tutorial_1',
  type: 'static',
  enemies: [
    { type: 'blue_slime', level: 1, position: { x: 500, y: 300, z: 0 } }
  ],
  completionConditions: {
    type: COMPLETION_TYPES.ENEMIES_DEFEATED,
    targetCount: 1
  }
});

// Register level
levelManager.registerLevel(tutorialLevel);

// Load level
levelManager.loadLevel('tutorial_1');
```

### **Checking Level Completion**
```javascript
// In game loop
if (levelManager.checkCompletionConditions()) {
  levelManager.startTransition('next_level', 'fade');
}
```

This specification provides a comprehensive foundation for implementing a robust level system in the browser arcade RPG. The modular design allows for easy extension and customization while maintaining clean separation of concerns.
