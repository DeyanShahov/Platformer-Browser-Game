/* =========================
   LEVEL MANAGER SYSTEM
   Core level management for browser arcade RPG
   Handles level loading, entity spawning, completion tracking
   ========================= */

class LevelManager {
    constructor(gameState, animationSystem, combatSystem, collisionSystem) {
        // Game Mode
        this.gameMode = 'story'; // 'story' or 'endless'
        this.currentStage = 0;

        // Dependency injection for clean architecture
        this.gameState = gameState;
        this.animationSystem = animationSystem;
        this.combatSystem = combatSystem;
        this.collisionSystem = collisionSystem;

        // Level registry system - use shared instance
        this.levelRegistry = null;
        if (window.LevelRegistry) {
            this.levelRegistry = window.LevelRegistry.getInstance();
            console.log(`[LevelManager] Using shared LevelRegistry with ${this.levelRegistry.levels.size} registered levels`);
        } else {
            console.warn('[LevelManager] LevelRegistry not available, falling back to mock data');
        }

        // Exit point system
        this.exitPointManager = null;
        if (window.ExitPointManager) {
            this.exitPointManager = new window.ExitPointManager(this);
        }

        // Trigger-based spawning system
        this.triggerSpawner = null;
        if (window.TriggerSpawner) {
            this.triggerSpawner = new window.TriggerSpawner(this);
        }

        // Dynamic entity management system
        this.dynamicEntityManager = null;
        if (window.DynamicEntityManager) {
            this.dynamicEntityManager = new window.DynamicEntityManager(this.gameState, this);
        }

        // Core level state
        this.currentLevel = null;
        this.levelProgress = {};
        this.spawnedEntities = new Set(); // Track entities created by this level

        // Transition system - Two-phase design
        this.transitionState = 'none'; // 'none', 'fading_out', 'showing_ui', 'loading', 'hiding_ui', 'fading_in'
        this.transitionStartTime = 0;
        this.fadeDuration = 2000;      // Phase 1: Screen dimming (2 seconds)
        this.loadingDuration = 3000;   // Phase 2: Loading screen (3 seconds)
        this.totalTransitionDuration = this.fadeDuration + this.loadingDuration;

        // Game pause during transitions
        this.gamePaused = false;

        // Completion tracking - per-level using Map
        this.completionConditions = [];
        this.completionStatus = {};
        this.levelCompletions = new Map(); // levelId -> completed status

        console.log('[LevelManager] Initialized with dependency injection');
    }

    // =========================
    // LEVEL LOADING SYSTEM
    // =========================

    /**
     * Load a level by ID with full initialization sequence
     * @param {string} levelId - The level identifier to load
     */
    async loadLevel(levelId) {
        console.log(`[LevelManager] Loading level: ${levelId}`);

        try {
            // Validate level exists
            const levelData = this.getLevelData(levelId);
            if (!levelData) {
                throw new Error(`Level ${levelId} not found in registry`);
            }

            // Start transition if coming from another level
            if (this.currentLevel) {
                await this.startTransition(levelId, 'fade');
                return;
            }

            // Direct load for first level
            await this.performLevelLoad(levelData);

        } catch (error) {
            console.error(`[LevelManager] Failed to load level ${levelId}:`, error);
            throw error; // Re-throw for caller handling
        }
    }

    /**
     * Perform the actual level loading sequence
     * @param {Object} levelData - The level configuration data
     */
    async performLevelLoad(levelData) {
        console.log(`[LevelManager] Performing level load sequence for: ${levelData.id}`);

        // Special handling for end game level
        if (levelData.type === 'end_game') {
            console.log(`[LevelManager] End game level detected - showing end game screen`);
            this.showEndGameScreen(levelData);
            return;
        }

        // Phase 1: Cleanup previous level
        this.unloadCurrentLevel();

        // Phase 2: Set new level context
        this.currentLevel = levelData;
        this.initializeLevelContext(levelData);

        // Phase 3: Load and spawn entities
        await this.spawnLevelEntities(levelData);

        // Phase 4: Initialize level-specific systems
        this.initializeLevelSystems(levelData);

        // Phase 5: Setup completion tracking
        this.setupCompletionTracking(levelData.completionConditions);

        // Phase 6: Load exit points
        if (this.exitPointManager && levelData.exitPoints) {
            this.exitPointManager.loadFromLevelData(levelData.exitPoints);
        }

        // Phase 7: Load trigger spawners
        if (this.triggerSpawner && levelData.triggers) {
            this.triggerSpawner.loadFromLevelData(levelData.triggers);
        }

        console.log(`[LevelManager] Level ${levelData.id} loaded successfully`);
    }

    /**
     * Unload current level and cleanup all entities
     */
    unloadCurrentLevel() {
        if (!this.currentLevel) return;

        console.log(`[LevelManager] Unloading level: ${this.currentLevel.id}`);

        // Remove all entities spawned by this level
        this.spawnedEntities.forEach(entityId => {
            this.gameState.removeEntity(entityId);
        });
        this.spawnedEntities.clear();

        // Reset completion tracking
        this.completionConditions = [];
        this.completionStatus = {};

        // Cleanup level-specific resources
        this.cleanupLevelResources();

        this.currentLevel = null;
    }

    // =========================
    // ENDLESS MODE LOGIC
    // =========================

    /**
     * Starts the Endless Mode.
     */
    startEndlessMode() {
        console.log('[LevelManager] Starting Endless Mode');
        this.gameMode = 'endless';
        this.currentStage = 0; // Will be incremented to 1 by loadNextEndlessStage
        this.loadNextEndlessStage();
    }

    /**
     * Loads the next stage in Endless Mode.
     */
    loadNextEndlessStage() {
        this.currentStage++;
        console.log(`[LevelManager] Loading Endless Stage: ${this.currentStage}`);
        // The 'endless_next' ID is a special signal for getLevelData
        this.loadLevel('endless_next');
    }

    // =========================
    // ENTITY SPAWNING SYSTEM
    // =========================

    /**
     * Spawn all entities for a level
     * @param {Object} levelData - Level configuration with entities
     */
    async spawnLevelEntities(levelData) {
        console.log(`[LevelManager] Spawning ${levelData.entities?.length || 0} entities`);

        if (!levelData.entities || !Array.isArray(levelData.entities)) {
            console.warn('[LevelManager] No entities defined for level');
            return;
        }

        // Spawn each entity based on its configuration
        for (const entityConfig of levelData.entities) {
            try {
                await this.spawnEntity(entityConfig);
            } catch (error) {
                console.error(`[LevelManager] Failed to spawn entity:`, entityConfig, error);
                // Continue with other entities
            }
        }
    }

    /**
     * Spawn a single entity based on configuration
     * @param {Object} config - Entity spawn configuration
     */
    async spawnEntity(config) {
        let entity;

        // Create the actual entity object based on type
        if (config.type === 'enemy') {
            if (config.enemyType === 'blue_slime') {
                // **Dynamic position adjustment** if randomPosition is requested
                if (config.randomPosition && this.currentLevel?.boundaries) {
                    const boundaries = this.currentLevel.boundaries;
                    config.x = boundaries.left + Math.random() * (boundaries.right - boundaries.left);
                    config.y = boundaries.top + Math.random() * (boundaries.bottom - boundaries.top);
                    config.z = boundaries.zMin + Math.random() * (boundaries.zMax - boundaries.zMin);
                    console.log(`[LevelManager] Generated random position for ${config.enemyType}: (${config.x.toFixed(1)}, ${config.y.toFixed(1)}, ${config.z.toFixed(1)})`);
                }

                // Create real BlueSlime object using the existing function
                entity = createBlueSlime(
                    config.x || config.position?.x || 0,
                    config.y || config.position?.y || 0,
                    config.z || config.position?.z || 0,
                    config.level || 1
                );
                console.log(`[LevelManager] Created BlueSlime at (${entity.x}, ${entity.y})`);
            } else {
                console.warn(`[LevelManager] Unknown enemy type: ${config.enemyType}`);
                return null;
            }
        } else {
            console.warn(`[LevelManager] Unknown entity type: ${config.type}`);
            return null;
        }

        // Add the real entity object to game state with proper type
        const entityId = this.gameState.addEntity(entity, 'enemy');

        // Track spawned entity
        this.spawnedEntities.add(entityId);

        // Initialize entity through existing systems
        if (config.type === 'enemy') {
            await this.initializeEnemyEntity(entityId, config);
        }

        console.log(`[LevelManager] Spawned ${config.type} entity: ${entityId}`);
        return entityId;
    }

    /**
     * Initialize enemy entity with animation and AI systems
     * @param {string} entityId - The entity ID to initialize
     * @param {Object} config - Enemy configuration
     */
    async initializeEnemyEntity(entityId, config) {
        console.log(`[LevelManager] Initializing enemy entity ${entityId} with config:`, config);

        // Get the actual entity object from game state
        const entity = this.gameState.getEntity(entityId);
        console.log(`[LevelManager] Retrieved entity from gameState:`, entity ? 'FOUND' : 'NOT FOUND', entity);

        if (!entity) {
            console.error(`[LevelManager] Cannot initialize enemy - entity ${entityId} not found in gameState`);
            return;
        }

        // Initialize animation system
        console.log(`[LevelManager] Animation system available:`, !!this.animationSystem);
        console.log(`[LevelManager] initializeEntityAnimation method:`, !!this.animationSystem?.initializeEntityAnimation);

        if (window.animationSystem?.registerEntity) {
            console.log(`[LevelManager] Calling animation system registerEntity for ${config.enemyType || config.type}`);
            try {
                await window.animationSystem.registerEntity(entity, config.enemyType || config.type);
                console.log(`[LevelManager] Animation registration completed for ${entityId}`);
            } catch (error) {
                console.error(`[LevelManager] Animation registration failed for ${entityId}:`, error);
            }
        } else {
            console.warn(`[LevelManager] Animation system registerEntity not available for enemy ${entityId}`);
        }

        // Initialize FSM (Finite State Machine) - REQUIRED for enemy behavior
        console.log(`[LevelManager] EnemyAnimationStateMachine available:`, !!window.EnemyAnimationStateMachine);

        if (window.EnemyAnimationStateMachine) {
            try {
                entity.stateMachine = new window.EnemyAnimationStateMachine(entity);
                console.log(`[LevelManager] FSM initialized for enemy ${entityId}:`, entity.stateMachine.getCurrentStateName());
            } catch (error) {
                console.error(`[LevelManager] FSM initialization failed for ${entityId}:`, error);
            }
        } else {
            console.warn(`[LevelManager] EnemyAnimationStateMachine not available for enemy ${entityId}`);
        }

        // Register with enemy combat manager (BT AI system) - REQUIRED for AI behavior
        console.log(`[LevelManager] EnemyCombatManager available:`, !!window.enemyCombatManager);

        if (window.enemyCombatManager) {
            try {
                window.enemyCombatManager.registerEnemy(entity);
                console.log(`[LevelManager] Enemy registered with combat manager for AI`);
            } catch (error) {
                console.error(`[LevelManager] Enemy combat manager registration failed for ${entityId}:`, error);
            }
        } else {
            console.warn(`[LevelManager] EnemyCombatManager not available for enemy ${entityId}`);
        }

        // BT AI is already initialized in BaseEnemy constructor
        // No additional initialization needed
        console.log(`[LevelManager] BT AI already initialized in constructor for ${entityId}`);

        console.log(`[LevelManager] Enemy entity ${entityId} initialization complete`);
    }

    // =========================
    // COMPLETION SYSTEM
    // =========================

    /**
     * Setup completion condition monitoring
     * @param {Array} conditions - Array of completion conditions
     */
    setupCompletionTracking(conditions) {
        if (!conditions || !Array.isArray(conditions)) {
            console.log('[LevelManager] No completion conditions defined');
            return;
        }

        this.completionConditions = conditions.map(condition => ({
            ...condition,
            met: false,
            progress: 0
        }));

        this.completionStatus = {};
        console.log(`[LevelManager] Setup ${conditions.length} completion conditions`);
    }

    /**
     * Check if level completion conditions are met
     */
    checkCompletionConditions() {
        if (!this.completionConditions.length) return false;

        // Only log detailed info when conditions actually change
        let allMet = true;
        let hasChanges = false;

        for (const condition of this.completionConditions) {
            const wasMet = condition.met;
            const isMet = this.evaluateCompletionCondition(condition);
            condition.met = isMet;

            if (wasMet !== isMet) {
                hasChanges = true;
                console.log(`[COMPLETION] Condition ${condition.type}: ${isMet ? 'MET' : 'NOT MET'}`);
            }

            if (!isMet) allMet = false;
        }

        const levelCompleted = this.getLevelCompleted();
        const shouldComplete = allMet && !levelCompleted;

        // Log summary only when there are changes or completion happens
        if (hasChanges || shouldComplete) {
            console.log(`[COMPLETION] All conditions met: ${allMet}, levelCompleted: ${levelCompleted}`);
        }

        if (shouldComplete) {
            this.setLevelCompleted(this.currentLevel.id, true);
            console.log(`[COMPLETION] Level ${this.currentLevel.id} COMPLETED! Triggering completion logic...`);
            this.onLevelCompleted();
        }

        return allMet;
    }

    /**
     * Evaluate a single completion condition
     * @param {Object} condition - The condition to evaluate
     */
    evaluateCompletionCondition(condition) {
        switch (condition.type) {
            case 'enemies_defeated':
                return this.checkEnemiesDefeatedCondition(condition);

            case 'time_survival':
                return this.checkTimeSurvivalCondition(condition);

            case 'area_reached':
                return this.checkAreaReachedCondition(condition);

            default:
                console.warn(`[LevelManager] Unknown completion condition type: ${condition.type}`);
                return false;
        }
    }

    /**
     * Check enemies defeated condition
     */
    checkEnemiesDefeatedCondition(condition) {
        const defeatedCount = this.getDefeatedEnemyCount();
        const targetCount = condition.targetCount || 0;
        return defeatedCount >= targetCount;
    }

    /**
     * Check time survival condition
     */
    checkTimeSurvivalCondition(condition) {
        const currentTime = Date.now() - (this.levelStartTime || Date.now());
        const targetTime = condition.targetTime || 0;
        return currentTime >= targetTime;
    }

    /**
     * Check area reached condition
     */
    checkAreaReachedCondition(condition) {
        // Check if any player is in the target area
        const players = this.gameState.getAllPlayers();
        const targetArea = condition.targetArea;

        return players.some(player => {
            return player.x >= targetArea.x &&
                player.x <= (targetArea.x + targetArea.width) &&
                player.y >= targetArea.y &&
                player.y <= (targetArea.y + targetArea.height);
        });
    }

    // =========================
    // LEVEL CONTEXT MANAGEMENT
    // =========================

    /**
     * Initialize level-specific context and boundaries
     * @param {Object} levelData - Level configuration
     */
    initializeLevelContext(levelData) {
        // Set collision boundaries
        if (levelData.boundaries && this.collisionSystem?.setLevelBoundaries) {
            this.collisionSystem.setLevelBoundaries(levelData.boundaries);
        }

        // Set level start time for timing conditions
        this.levelStartTime = Date.now();
        this.levelCompleted = false;

        console.log(`[LevelManager] Level context initialized for: ${levelData.id}`);
    }

    /**
     * Initialize level-specific systems
     * @param {Object} levelData - Level configuration
     */
    initializeLevelSystems(levelData) {
        // Initialize combat tracking
        if (this.combatSystem?.initializeLevelCombat) {
            this.combatSystem.initializeLevelCombat(levelData);
        }

        // Initialize UI elements if needed
        if (levelData.ui && window.uiSystem?.initializeLevelUI) {
            window.uiSystem.initializeLevelUI(levelData.ui);
        }
    }

    /**
     * Cleanup level-specific resources
     */
    cleanupLevelResources() {
        // Cleanup combat system
        if (this.combatSystem?.cleanupLevelCombat) {
            this.combatSystem.cleanupLevelCombat();
        }

        // Cleanup UI elements
        if (window.uiSystem?.cleanupLevelUI) {
            window.uiSystem.cleanupLevelUI();
        }
    }

    // =========================
    // TRANSITION SYSTEM
    // =========================

    /**
     * Start level transition
     * @param {string} targetLevelId - Target level to transition to
     * @param {string} transitionType - Type of transition ('fade', 'instant')
     */
    async startTransition(targetLevelId, transitionType = 'fade') {
        console.log(`[LevelManager] Starting transition to level: ${targetLevelId}`);

        this.transitionState = 'fading_out';
        this.transitionStartTime = performance.now(); // Use performance.now() for reliable timing
        this.targetLevelId = targetLevelId;
        this.transitionType = transitionType;

        // Pause game during transition
        this.gamePaused = true;
        console.log(`[LevelManager] Game paused during transition`);

        // Don't pause animations - it breaks dt timing
        // if (this.animationSystem?.pauseAllAnimations) {
        //     this.animationSystem.pauseAllAnimations();
        // }
    }

    /**
     * Update transition state - Two-phase system
     * @param {number} dt - Delta time
     */
    updateTransition(dt) {
        if (this.transitionState === 'none') return;

        // Use performance.now() for reliable timing
        const currentTime = performance.now();
        const elapsed = currentTime - this.transitionStartTime;
        console.log(`[TRANSITION] State: ${this.transitionState}, Elapsed: ${elapsed.toFixed(1)}ms`);

        switch (this.transitionState) {
            case 'fading_out':
                // Phase 1: Screen dimming (no UI yet)
                if (elapsed >= this.fadeDuration) {
                    console.log(`[TRANSITION] Phase 1 complete - showing loading UI`);
                    this.transitionState = 'showing_ui';
                    this.showLoadingUI();
                }
                break;

            case 'showing_ui':
                // Phase 2: Show loading screen and start level loading
                console.log(`[TRANSITION] Phase 2 - showing loading screen`);
                this.transitionState = 'loading';
                this.performTransitionLoad();
                break;

            case 'loading':
                // Phase 2: Loading screen active - wait for level load to complete
                // Level loading happens asynchronously in performTransitionLoad()
                console.log(`[TRANSITION] Phase 2 - loading level...`);
                // performTransitionLoad() will set state to 'hiding_ui' when complete
                break;

            case 'hiding_ui':
                // Phase 2: Hide loading UI and prepare for fade in
                console.log(`[TRANSITION] Phase 2 complete - hiding UI`);
                this.hideLoadingUI();
                this.transitionState = 'fading_in';
                break;

            case 'fading_in':
                // Final phase: Fade back to gameplay
                if (elapsed >= this.totalTransitionDuration) {
                    console.log(`[TRANSITION] All phases complete - transition finished`);
                    this.transitionState = 'none';
                    this.transitionStartTime = 0;

                    // Unpause game after transition completes
                    this.gamePaused = false;
                    console.log(`[LevelManager] Game unpaused after transition`);

                    console.log(`[TRANSITION] Level transition to ${this.targetLevelId} completed`);
                }
                break;
        }
    }

    /**
     * Show loading screen UI
     */
    showLoadingUI() {
        console.log(`[TRANSITION] Showing loading screen`);
        // TODO: Implement UI system integration
        if (window.uiSystem?.showLoadingScreen) {
            window.uiSystem.showLoadingScreen({
                fromLevel: this.currentLevel?.name || 'Unknown',
                toLevel: this.getLevelData(this.targetLevelId)?.name || 'Unknown',
                progress: 0
            });
        }
    }

    /**
     * Hide loading screen UI
     */
    hideLoadingUI() {
        console.log(`[TRANSITION] Hiding loading screen`);
        // TODO: Implement UI system integration
        if (window.uiSystem?.hideLoadingScreen) {
            window.uiSystem.hideLoadingScreen();
        }
    }

    /**
     * Show end game screen
     * @param {Object} levelData - End game level data
     */
    showEndGameScreen(levelData) {
        console.log(`[END_GAME] Showing end game screen for level: ${levelData.id}`);

        // Set current level to end game level
        this.currentLevel = levelData;

        // Create end game overlay
        this.createEndGameOverlay();

        // Pause game systems (no more updates)
        this.gamePaused = true;

        console.log(`[END_GAME] End game screen displayed - game complete!`);
    }

    /**
     * Create end game overlay UI
     */
    createEndGameOverlay() {
        // Remove existing overlay if any
        const existingOverlay = document.getElementById('endGameOverlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // Create overlay element
        const overlay = document.createElement('div');
        overlay.id = 'endGameOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
            color: white;
        `;

        // Main content container
        const content = document.createElement('div');
        content.style.cssText = `
            text-align: center;
            max-width: 600px;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.2);
        `;

        // Title
        const title = document.createElement('h1');
        title.textContent = '🎉 GAME COMPLETE! 🎉';
        title.style.cssText = `
            font-size: 48px;
            margin: 0 0 20px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            background: linear-gradient(45deg, #FFD700, #FFA500);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        `;

        // Subtitle
        const subtitle = document.createElement('h2');
        subtitle.textContent = 'Congratulations!';
        subtitle.style.cssText = `
            font-size: 32px;
            margin: 0 0 30px 0;
            color: #FFD700;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        `;

        // Message
        const message = document.createElement('p');
        message.textContent = 'You have successfully completed the tutorial levels and learned the basics of combat in this world!';
        message.style.cssText = `
            font-size: 18px;
            line-height: 1.6;
            margin: 0 0 40px 0;
            color: #E0E0E0;
        `;

        // Stats (placeholder)
        const stats = document.createElement('div');
        stats.style.cssText = `
            font-size: 16px;
            margin: 0 0 40px 0;
            color: #B0B0B0;
        `;
        stats.innerHTML = `
            <p>Enemies Defeated: <strong style="color: #FFD700;">Multiple</strong></p>
            <p>Skills Learned: <strong style="color: #FFD700;">Combat Basics</strong></p>
            <p>Time Played: <strong style="color: #FFD700;">Variable</strong></p>
        `;

        // Buttons container
        const buttons = document.createElement('div');
        buttons.style.cssText = `
            display: flex;
            gap: 20px;
            justify-content: center;
        `;

        // Restart button
        const restartBtn = document.createElement('button');
        restartBtn.textContent = '🔄 Play Again';
        restartBtn.style.cssText = `
            padding: 15px 30px;
            font-size: 18px;
            background: linear-gradient(45deg, #4CAF50, #45a049);
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
        `;
        restartBtn.onmouseover = () => restartBtn.style.transform = 'translateY(-2px)';
        restartBtn.onmouseout = () => restartBtn.style.transform = 'translateY(0)';
        restartBtn.onclick = () => this.restartGame();

        // Main Menu button (placeholder)
        const menuBtn = document.createElement('button');
        menuBtn.textContent = '🏠 Main Menu';
        menuBtn.style.cssText = `
            padding: 15px 30px;
            font-size: 18px;
            background: linear-gradient(45deg, #2196F3, #1976D2);
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
        `;
        menuBtn.onmouseover = () => menuBtn.style.transform = 'translateY(-2px)';
        menuBtn.onmouseout = () => menuBtn.style.transform = 'translateY(0)';
        menuBtn.onclick = () => alert('Main Menu - Coming Soon!');

        // Add elements to DOM
        buttons.appendChild(restartBtn);
        buttons.appendChild(menuBtn);

        content.appendChild(title);
        content.appendChild(subtitle);
        content.appendChild(message);
        content.appendChild(stats);
        content.appendChild(buttons);

        overlay.appendChild(content);
        document.body.appendChild(overlay);

        console.log(`[END_GAME] End game overlay created and displayed`);
    }

    /**
     * Restart the game
     */
    restartGame() {
        console.log(`[END_GAME] Restarting game...`);

        // Remove overlay
        const overlay = document.getElementById('endGameOverlay');
        if (overlay) {
            overlay.remove();
        }

        // Reset game state
        this.gamePaused = false;

        // Reload first level
        this.loadLevel('tutorial_1');

        console.log(`[END_GAME] Game restarted`);
    }

    /**
     * Perform the level loading during transition
     */
    async performTransitionLoad() {
        try {
            console.log(`[TRANSITION] Starting level load for ${this.targetLevelId}`);
            const levelData = this.getLevelData(this.targetLevelId);
            await this.performLevelLoad(levelData);
            console.log(`[TRANSITION] Level load complete, moving to hiding UI phase`);
            this.transitionState = 'hiding_ui'; // Move to next phase when loading is complete
        } catch (error) {
            console.error('[LevelManager] Transition load failed:', error);
            this.transitionState = 'none'; // Cancel transition on error
        }
    }

    // =========================
    // LEVEL COMPLETION TRACKING
    // =========================

    /**
     * Get completion status for a specific level
     * @param {string} levelId - Level identifier (defaults to current level)
     * @returns {boolean} Whether the level is completed
     */
    getLevelCompleted(levelId = this.currentLevel?.id) {
        return this.levelCompletions.get(levelId) || false;
    }

    /**
     * Set completion status for a specific level
     * @param {string} levelId - Level identifier
     * @param {boolean} completed - Completion status
     */
    setLevelCompleted(levelId, completed) {
        this.levelCompletions.set(levelId, completed);
        console.log(`[LevelManager] Level ${levelId} completion status set to: ${completed}`);
    }

    // =========================
    // UTILITY METHODS
    // =========================

    /**
     * Get level data from registry
     * @param {string} levelId - Level identifier
     */
    getLevelData(levelId) {
        // Handle endless mode level generation
        if (levelId === 'endless_next') {
            return proceduralGenerator.generateStage(this.currentStage);
        }

        // Try to get from registry first
        if (this.levelRegistry) {
            const levelData = this.levelRegistry.getLevel(levelId);
            if (levelData) {
                console.log(`[LevelManager] Retrieved level ${levelId} from registry`);
                return levelData;
            }
        }

        // Fallback to mock data if registry not available or level not found
        console.warn(`[LevelManager] Level ${levelId} not found in registry, falling back to mock data`);
        return this.getMockLevelData(levelId);
    }

    /**
     * Get defeated enemy count
     */
    getDefeatedEnemyCount() {
        const defeatedCount = this.completionStatus.defeatedEnemies || 0;
        console.log(`[COMPLETION] Defeated enemies: ${defeatedCount}`);
        return defeatedCount;
    }

    /**
     * Handle level completion
     */
    onLevelCompleted() {
        console.log(`[LevelManager] Level ${this.currentLevel.id} completion logic`);

        // Award rewards through combat system
        if (this.combatSystem?.awardLevelCompletionBonus) {
            this.combatSystem.awardLevelCompletionBonus(this.currentLevel);
        }

        // Show completion UI
        if (window.uiSystem?.showLevelComplete) {
            window.uiSystem.showLevelComplete(this.currentLevel);
        }

        // Handle endless mode progression
        if (this.gameMode === 'endless') {
            console.log('[LevelManager] Endless mode: loading next stage.');
            setTimeout(() => this.loadNextEndlessStage(), 3000); // 3-second delay
            return; // Exit early
        }

        // Handle transition based on mode
        const transitionMode = this.currentLevel.transitionMode || 'manual_via_exit';
        console.log(`[LevelManager] Level ${this.currentLevel.id} transition mode: ${transitionMode}`);

        switch (transitionMode) {
            case 'automatic':
                // Automatic transition after delay
                console.log(`[LevelManager] Auto-transitioning in 3 seconds`);
                setTimeout(() => {
                    if (this.currentLevel.nextLevelId) {
                        this.startTransition(this.currentLevel.nextLevelId, 'fade');
                    }
                }, 3000); // 3 second delay
                break;

            case 'manual_via_exit':
                // Wait for player to use exit point
                console.log(`[LevelManager] Waiting for player to use exit point`);
                // Exit points will handle transition when activated
                break;

            case 'none':
                // No transition - end of game or special level
                console.log(`[LevelManager] No transition - level complete`);
                break;

            default:
                console.warn(`[LevelManager] Unknown transition mode: ${transitionMode} - defaulting to manual_via_exit`);
                break;
        }
    }

    /**
     * Update method called every frame
     * @param {number} dt - Delta time
     */
    update(dt) {
        // Update transition system
        this.updateTransition(dt);

        // Check completion conditions
        if (this.currentLevel && !this.getLevelCompleted()) {
            this.checkCompletionConditions();
        }
    }

    // =========================
    // MOCK DATA (TEMPORARY)
    // =========================

    /**
     * Temporary mock level data - will be replaced with actual registry
     */
    // getMockLevelData(levelId) {
    //     const mockLevels = {
    //         'tutorial_1': {
    //             id: 'tutorial_1',
    //             name: 'First Steps - Always Active Door',
    //             type: 'static',
    //             boundaries: { left: 0, right: 1200, top: 0, bottom: 800, zMin: -50, zMax: 50 },
    //             entities: [
    //                 { type: 'enemy', enemyType: 'blue_slime', level: 1, x: 600, y: 400, z: 0, aiBehavior: 'passive' }
    //             ],
    //             completionConditions: [{
    //                 type: 'enemies_defeated',
    //                 targetCount: 1
    //             }],
    //             exitPoints: [{
    //                 id: 'tutorial_exit',
    //                 x: 1100,
    //                 y: 400,
    //                 width: 80,
    //                 height: 80,
    //                 targetLevelId: 'combat_room_1',
    //                 transitionType: 'fade',
    //                 transitionDirection: 'right',
    //                 color: '#00FF00',
    //                 activationMode: 'after_completion'  // Type 1: Always active
    //             }],
    //             transitionMode: 'manual_via_exit',  // No automatic transition
    //             nextLevelId: 'combat_room_1'
    //         },

    //         'combat_room_1': {
    //             id: 'combat_room_1',
    //             name: 'Combat Training - Automatic Transition',
    //             type: 'static',
    //             boundaries: { left: 0, right: 1200, top: 0, bottom: 800, zMin: -50, zMax: 50 },
    //             entities: [
    //                 { type: 'enemy', enemyType: 'blue_slime', level: 1, x: 400, y: 300, z: 0 }
    //             ],
    //             triggers: [
    //                 // Area-based trigger - spawn enemy when player moves right
    //                 {
    //                     id: 'area_spawn_1',
    //                     type: 'area_enter',
    //                     area: { x: 600, y: 400, width: 100, height: 100 },
    //                     entities: [
    //                         { type: 'enemy', enemyType: 'blue_slime', level: 2, x: 800, y: 500, z: 0 }
    //                     ]
    //                 },
    //                 // Time-based trigger - spawn 5 enemies every 5 seconds with random positions
    //                 {
    //                     id: 'time_spawn_1',
    //                     type: 'time_delay',
    //                     delay: 5000,      // Първо спавнване след 5 секунди
    //                     interval: 5000,   // Повторно спавнване през 5 секунди
    //                     maxCount: 5,      // Общо 5 спавнвания
    //                     entities: [
    //                         {
    //                             type: 'enemy',
    //                             enemyType: 'blue_slime',
    //                             level: 1,
    //                             randomPosition: true  // Random позиция в границите на нивото
    //                         }
    //                     ]
    //                 }
    //             ],
    //             completionConditions: [{
    //                 type: 'enemies_defeated',
    //                 targetCount: 3 // Now 3 enemies total
    //             }],
    //             exitPoints: [], // No exit points for automatic transition
    //             transitionMode: 'automatic', // Type 3: Automatic transition
    //             nextLevelId: 'boss_level'
    //         },

    //         'boss_level': {
    //             id: 'boss_level',
    //             name: 'Boss Level - Conditional Portal',
    //             type: 'static',
    //             boundaries: { left: 0, right: 1200, top: 0, bottom: 800, zMin: -50, zMax: 50 },
    //             entities: [
    //                 { type: 'enemy', enemyType: 'blue_slime', level: 3, x: 600, y: 300, z: 0 } // Boss enemy
    //             ],
    //             completionConditions: [{
    //                 type: 'enemies_defeated',
    //                 targetCount: 1 // Kill the boss
    //             }],
    //             exitPoints: [{
    //                 id: 'boss_portal',
    //                 x: 600,
    //                 y: 500,
    //                 width: 100,
    //                 height: 100,
    //                 targetLevelId: 'end_game',
    //                 transitionType: 'fade',
    //                 transitionDirection: 'up',
    //                 color: '#FF00FF',
    //                 activationMode: 'after_completion'  // Type 2: Activates after boss defeat
    //             }],
    //             transitionMode: 'manual_via_exit', // Wait for portal activation
    //             nextLevelId: 'end_game'
    //         },

    //         'end_game': {
    //             id: 'end_game',
    //             name: 'Game Complete',
    //             type: 'end_game',  // Special level type
    //             boundaries: { left: 0, right: 1200, top: 0, bottom: 800, zMin: -50, zMax: 50 },
    //             entities: [],       // No enemies
    //             completionConditions: [], // No completion conditions
    //             exitPoints: [],     // No exit points
    //             nextLevelId: null   // End of game
    //         }
    //     };

    //     return mockLevels[levelId] || null;
    // }
}

// =========================
// GLOBAL EXPORTS
// =========================

window.LevelManager = LevelManager;
