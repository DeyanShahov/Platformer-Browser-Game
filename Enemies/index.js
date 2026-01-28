/**
 * Enemy System Index
 * Main entry point for the modular enemy system
 * Coordinates all enemy modules and provides unified exports
 */

// ===========================================
// DEPENDENCY CHECKS
// ===========================================

// Ensure all required systems are available before initializing enemies
const requiredSystems = [
    'window.createEntity',
    'window.CharacterInfo',
    // 'window.EnemyData',
    'window.createAttackProfile',
    'window.tickEnemyAI',
    'window.enemyCombatManager',
    'window.applyScreenBoundaries',
    'window.applyCollisionCorrection',
    'window.calculateEntityDistance',
    'window.checkEntityCollision',
    'window.getBehaviorConstraints',
    'window.mergeCommands',
    'window.handleEnemyDefeat'
];

const missingSystems = requiredSystems.filter(system => {
    try {
        return !eval(system);
    } catch (e) {
        return true;
    }
});

if (missingSystems.length > 0) {
    console.warn('[ENEMY SYSTEM] Some required systems not available:', missingSystems);
    console.warn('[ENEMY SYSTEM] Enemy functionality may be limited');
}

// ===========================================
// MODULE IMPORTS (VIA SCRIPT LOADING)
// ===========================================

// Note: In a proper module system, these would be ES6 imports
// For now, we rely on script loading order in HTML

// Core modules
// window.EnemyMovement - loaded via Enemies/EnemyMovement.js
// window.EnemyDeath - loaded via Enemies/EnemyDeath.js
// window.EnemyCombat - loaded via Enemies/EnemyCombat.js
// window.EnemyAI - loaded via Enemies/EnemyAI.js

// Specialized modules
// window.BlueSlime, window.createBlueSlime - loaded via Enemies/EnemyTypes/BlueSlime.js
// window.createEnemyWithData - loaded via Enemies/EnemyFactory.js

// ===========================================
// BASE ENEMY CLASS
// ===========================================

/**
 * Base Enemy Class
 * Foundation class for all enemy types with modular functionality
 * Coordinates behavior through specialized modules
 */
class BaseEnemy {
    // Static counter for unique instance IDs
    static instanceCounter = 0;

    constructor(x, y, z, config = {}) {
        // Assign unique instance ID
        this.instanceId = ++BaseEnemy.instanceCounter;

        // Position and dimensions (must be overridden by subclasses)
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = config.w || 100;  // Visual width
        this.h = config.h || 100;  // Visual height
        this.collisionW = config.collisionW || 50;  // Collision width
        this.collisionH = config.collisionH || 50;  // Collision height
        this.zThickness = config.zThickness || 3;   // Z thickness for 2.5D collision
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.onGround = false;

        // Entity type
        this.entityType = 'enemy';

        // Enemy stats (should be overridden by subclasses)
        this.level = config.level || 1;
        this.maxHealth = config.maxHealth || 100;
        this.health = this.maxHealth;
        this.baseAttack = config.baseAttack || 10;
        this.baseDefense = config.baseDefense || 5;
        this.speed = config.speed || 50;

        // Combat flags
        this.hit = false;
        this.damageDealt = false;
        this.isDying = false;
        this.deathTimer = 0;
        this.blinkCount = 0;
        this.visible = true;

        // Character info for combat system
        this.characterInfo = new window.CharacterInfo('enemy');
        this.characterInfo.baseAttack = this.baseAttack;
        this.characterInfo.baseDefense = this.baseDefense;
        this.characterInfo.strength = config.strength || 5;
        this.characterInfo.criticalChance = config.criticalChance || 0.03;

        // AI behavior - legacy system (for fallback)
        this.aiState = 'idle'; // idle, patrol, chase, attack, flee
        this.aiTimer = 0;
        this.detectionRange = 300; // Distance to detect player
        this.attackRange = 60;     // Precise edge-to-edge attack distance
        this.patrolDirection = 1;  // 1 = right, -1 = left
        this.patrolDistance = 200; // How far to patrol
        this.startX = x;           // Original spawn position

        // BT AI Properties (universal system)
        this.rarity = config.rarity || 'common';        // BT rarity level
        this.intelligence = config.intelligence || 'basic';   // BT intelligence level

        // Script system properties (PHASE 4)
        this.scriptConfig = config.scriptConfig || null;  // Script configuration
        this.activeScript = null;                         // Loaded script instance

        // Pending command system for smooth transitions
        this.pendingCommand = null;    // Command waiting to be executed after thinking phase
        this.isThinking = true;        // Whether currently in thinking (IDLE) phase - start thinking
        this.hasStarted = false;       // Whether this is the first update cycle

        // Dynamic blocked behaviors system for BT memory
        this.dynamicBlocked = new Set(); // Currently blocked behaviors from interruptions

        // Animation entity type (must be overridden by subclasses)
        this.animationEntityType = config.animationEntityType || 'enemy';

        // Animation system - will be set by animation system after registration
        this.animation = null;
        this.stateMachine = null; // Will be created after animation registration

        // Initialize core properties and systems
        this.initializeCoreProperties();
        this.initializeBT();
        this.initializeScript();
        this.registerWithSystems();
    }

    // ===========================================
    // INITIALIZATION METHODS
    // ===========================================

    /**
     * Initialize core enemy properties
     */
    initializeCoreProperties() {
        // Set up collision detection helper
        this.getBlockedDirectionsFromCollision = function (proposedX, proposedY, proposedZ) {
            const correction = { x: this.x - proposedX, z: this.z - proposedZ };
            const blocked = new Set();

            if (Math.abs(correction.x) > 5) {
                blocked.add(correction.x > 0 ? 'patrol_left' : 'patrol_right');
            }
            if (Math.abs(correction.z) > 5) {
                blocked.add(correction.z > 0 ? 'move_down' : 'move_up');
            }

            return blocked;
        };

        // Initialize patrol state
        if (this.patrolDirection === undefined) {
            this.patrolDirection = 1;
            this.startX = this.x;
        }

        // Initialize chase state
        this.chaseState = { zFailCount: 0, lastZFailTime: 0 };
    }

    /**
     * Initialize Behavior Tree AI System
     */
    initializeBT() {
        if (!window.createUniversalEnemyBehaviorTree || !window.tickEnemyAI || !window.createAttackProfile) {
            //console.warn('[BASE ENEMY] Universal BT system not loaded, using fallback AI');
            return;
        }

        // Create BT context using rarity/intelligence system
        this.aiContext = {
            name: `${this.constructor.name}_${this.level}`,
            rarity: this.rarity,
            intelligence: this.intelligence,
            self: {
                hp: this.health, maxHp: this.maxHp, x: this.x, y: this.y, z: this.z,
                w: this.w, h: this.h, collisionW: this.collisionW, collisionH: this.collisionH, zThickness: this.zThickness
            },
            targets: [], // Will be updated in updateAI
            capabilities: { canBlock: false, canEvade: false },
            attackProfile: this.createAttackProfile(), // Subclasses can override
            intelligence: { blockChance: 0, evadeChance: 0.1, aggression: 0.3 },
            behaviors: window.ENEMY_BEHAVIORS?.[this.rarity]?.[this.intelligence], // Rarity/intelligence config
            phaseSpecialAvailable: false, // Override for boss enemies
            animationSystem: window.animationSystem, // Link to animation system for real-time hitbox access
            command: null,
        };

        // Create BT tree using universal factory
        this.aiContext.behaviorTree = window.createUniversalEnemyBehaviorTree(this.rarity, this.intelligence);

        //console.log(`[BASE ENEMY] Universal BT AI system initialized: ${this.rarity}/${this.intelligence}`);
    }

    /**
     * Create attack profile (can be overridden by subclasses)
     */
    createAttackProfile() {
        return window.createAttackProfile ? window.createAttackProfile(["light"]) : null;
    }

    /**
     * Initialize script system if specified
     */
    async initializeScript() {
        if (!this.scriptConfig?.scriptId) {
            //console.log(`[SCRIPT_INIT] No script config for ${this.constructor.name}, using base system`);
            return;
        }

        try {
            //console.log(`[SCRIPT_INIT] Initializing ${this.scriptConfig.scriptId} for ${this.constructor.name}`);

            // Load script through manager
            if (window.enemyScriptManager && window.enemyScriptManager.loadScript) {
                this.activeScript = await window.enemyScriptManager.loadScript(this.scriptConfig.scriptId);

                // Validate script type matches configuration
                if (this.activeScript.type !== this.scriptConfig.type) {
                    throw new Error(`Script type mismatch: config says ${this.scriptConfig.type}, script is ${this.activeScript.type}`);
                }

                //console.log(`[SCRIPT_INIT] Successfully loaded: ${this.activeScript.name} (${this.activeScript.type})`);
            } else {
                console.warn(`[SCRIPT_INIT] Script manager not available, falling back to base system`);
            }

        } catch (error) {
            console.error(`[SCRIPT_INIT] Failed to load ${this.scriptConfig.scriptId}:`, error);
            // Continue without script (fallback to base system)
            this.scriptConfig = null;
            this.activeScript = null;
        }
    }

    /**
     * Register with external systems
     */
    registerWithSystems() {
        // Register with combat system
        if (window.enemyCombatManager) {
            window.enemyCombatManager.registerEnemy(this);
        }
    }

    // ===========================================
    // MAIN UPDATE METHODS
    // ===========================================

    /**
     * Main AI update method - coordinates all AI behavior through modules
     */
    updateAI(players, dt) {
        if (this.isDying) {
            // For dying enemies, handle death animation directly
            window.EnemyDeath.updateDeath(this, dt);
            return;
        }

        // Update BT context with current game state
        this.updateBTContext(players);

        // FSM handles all movement and animation logic for living enemies
        window.EnemyAI.updateFSMBehavior(this, players, dt);
    }

    /**
     * Handle enemy physics and movement
     */
    handleMovement(dt, canvasHeight, gravity) {
        window.EnemyMovement.handleMovement(this, dt, canvasHeight, gravity);
    }

    /**
     * Check if entity is currently in collision
     */
    checkIfInCollision(gameState, players, enemy) {
        return window.EnemyMovement.checkIfInCollision(this, gameState, players);
    }

    // ===========================================
    // UTILITY METHODS
    // ===========================================

    /**
     * Update BT context with current game state
     */
    updateBTContext(players) {
        if (!this.aiContext) return;

        // Update self state
        this.aiContext.self.hp = this.health;
        this.aiContext.self.maxHp = this.maxHealth;
        this.aiContext.self.x = this.x;
        this.aiContext.self.y = this.y;
        this.aiContext.self.z = this.z;

        // Update targets (players)
        this.aiContext.targets = players.map(player => ({
            entity: player,
            distance: window.calculateEntityDistance ? window.calculateEntityDistance(this, player) :
                Math.sqrt(Math.pow(this.x - player.x, 2) + Math.pow(this.z - player.z, 2)),
            hpPercent: (player.health / (player.maxHealth || 100)) * 100,
            damageDone: 0,
            w: player.w,
            h: player.h,
            collisionW: player.collisionW,
            collisionH: player.collisionH,
            zThickness: player.zThickness
        }));
    }

    /**
     * Helper: Detect which entity caused the collision at proposed position
     * NOW USES ONLY COLLISION SYSTEM - NO OWN COLLISION LOGIC!
     */
    detectCollidedEntity(proposedX, proposedY, proposedZ) {
        // Get all entities using Collision System approach
        const allEntities = window.gameState ? window.gameState.getAllEntities() :
            [...window.players || [], window.enemy, window.ally].filter(e => e !== null && e !== undefined);

        // console.log(`[COLLISION_DEBUG] detectCollidedEntity checking against ${allEntities.length} entities using Collision System`);

        for (const entity of allEntities) {
            if (entity === this) continue;

            // USE COLLISION SYSTEM ONLY - no custom logic!
            const hasCollision = window.checkEntityCollision ?
                window.checkEntityCollision(this, entity, 'movement', {
                    entity1Pos: { x: proposedX, y: proposedY, z: proposedZ },
                    buffer: 0 // No buffer for precise collision check
                }) : false;

            if (hasCollision) {
                // USE COLLISION SYSTEM DISTANCE CALCULATION - no custom Math.abs!
                const distance = window.calculateEntityDistance ? window.calculateEntityDistance(this, entity) : 0;
                //console.log(`[COLLISION_DEBUG] Collision found with ${entity.entityType} (${entity.constructor.name}) at distance: ${distance.toFixed(1)} (enemy: ${this.x.toFixed(1)}, ${entity.entityType}: ${entity.x.toFixed(1)})`);
                //console.log(`[COLLISION_DEBUG] Enemy: ${this.constructor.name} pos(${this.x.toFixed(1)}, ${this.z.toFixed(1)}) | ${entity.entityType}: pos(${entity.x.toFixed(1)}, ${entity.z.toFixed(1)})`);
                return entity;
            }
        }
        return null;
    }

    // ===========================================
    // BEHAVIOR DELEGATION METHODS
    // ===========================================
    // These methods delegate to the appropriate modules to maintain interface compatibility

    /**
     * Update idle behavior (delegates to EnemyAI module)
     */
    updateIdleBehavior(players, dt, behaviors) {
        // Import the idle behavior logic from EnemyAI module
        if (window.EnemyAI && window.EnemyAI.updateIdleBehavior) {
            window.EnemyAI.updateIdleBehavior(this, players, dt, behaviors);
        }
    }

    /**
     * Consult BT for behavior decision (delegates to EnemyAI module)
     */
    consultBTForBehavior(players, context = {}) {
        if (window.EnemyAI && window.EnemyAI.consultBTForBehavior) {
            return window.EnemyAI.consultBTForBehavior(this, players, context);
        }
        return null;
    }

    /**
     * Transition to new behavior (delegates to EnemyAI module)
     */
    transitionToBehavior(command, behaviors) {
        if (window.EnemyAI && window.EnemyAI.transitionToBehavior) {
            window.EnemyAI.transitionToBehavior(this, command, behaviors);
        }
    }

    /**
     * Start thinking phase (delegates to EnemyAI module)
     */
    startThinkingPhase(behaviors) {
        if (window.EnemyAI && window.EnemyAI.startThinkingPhase) {
            window.EnemyAI.startThinkingPhase(this, behaviors);
        }
    }

    /**
     * Execute pending command (delegates to EnemyAI module)
     */
    executePendingCommand(behaviors) {
        if (window.EnemyAI && window.EnemyAI.executePendingCommand) {
            return window.EnemyAI.executePendingCommand(this, behaviors);
        }
        return false;
    }

    /**
     * Handle enemy death (delegates to EnemyDeath module)
     */
    die() {
        if (window.EnemyDeath && window.EnemyDeath.die) {
            window.EnemyDeath.die(this);
        }
    }

    // ===========================================
    // DYNAMIC BLOCKED BEHAVIORS MANAGEMENT
    // ===========================================

    /**
     * Add a blocked behavior
     */
    addBlockedBehavior(behavior, reason = 'unknown') {
        console.log(`[BT_MEMORY] ${this.constructor.name} blocked ${behavior} (${reason})`);
        this.dynamicBlocked.add(behavior);
    }

    /**
     * Remove a blocked behavior
     */
    removeBlockedBehavior(behavior) {
        this.dynamicBlocked.delete(behavior);
    }

    /**
     * Clear all blocked behaviors
     */
    clearBlockedBehaviors() {
        this.dynamicBlocked.clear();
    }

    // ===========================================
    // SCRIPT SYSTEM METHODS
    // ===========================================

    /**
     * Runtime script switching (for boss phases)
     */
    async switchScript(newScriptId) {
        if (!newScriptId) {
            //console.log(`[SCRIPT_SWITCH] Disabling script for ${this.constructor.name}, reverting to base system`);
            this.scriptConfig = null;
            this.activeScript = null;
            // Recreate base BT
            if (window.createUniversalEnemyBehaviorTree) {
                this.aiContext.behaviorTree = window.createUniversalEnemyBehaviorTree(this.rarity, this.intelligence);
            }
            return;
        }

        try {
            //console.log(`[SCRIPT_SWITCH] Switching ${this.constructor.name} to script: ${newScriptId}`);

            if (window.enemyScriptManager && window.enemyScriptManager.switchScript) {
                const newScript = await window.enemyScriptManager.switchScript(this, newScriptId);
                //console.log(`[SCRIPT_SWITCH] Switched to: ${newScript.name}`);

                // Update BT context with new script BT
                if (this.aiContext) {
                    this.aiContext.behaviorTree = newScript.behaviorTree;
                }
            } else {
                throw new Error('Script manager not available');
            }

        } catch (error) {
            console.error(`[SCRIPT_SWITCH] Failed to switch script for ${this.constructor.name}:`, error);
            // Fallback to base system
            this.scriptConfig = null;
            this.activeScript = null;
        }
    }
}

// ===========================================
// LEGACY COMPATIBILITY METHODS
// ===========================================

/**
 * Update enemy AI coordination (moved from game.js updateEnemyAI function)
 */
BaseEnemy.prototype.updateEnemyAI = function (dt, players, gameState) {
    if (!this) return;

    // Normal AI only runs if enemy is alive and not dying
    if (this.health > 0 && !this.isDying) {
        // Get players array for AI decision making
        const playersArray = gameState ? gameState.players : players || [];

        // Use BT-based AI if available, otherwise fallback to simple AI
        if (this.updateAI && typeof this.updateAI === 'function') {
            try {
                this.updateAI(playersArray, dt);
            } catch (error) {
                console.error(`[ENEMY_AI_DEBUG] BT AI update failed:`, error);
            }
        } else {
            // Simple fallback AI for other enemies
            if (Math.random() < 0.01) { // 1% chance per frame to attack
                if (this.stateMachine && !this.stateMachine.isInAttackState()) {
                    // Choose random attack type for FSM
                    const attackActions = ['attack_light', 'attack_medium', 'attack_heavy'];
                    const randomAttack = attackActions[Math.floor(Math.random() * attackActions.length)];

                    // Trigger FSM attack
                    this.stateMachine.handleAction(randomAttack);
                }
            }
        }
    }

    // Reset hit flag after a short time
    if (this.hit) {
        this.hit = false;
    }
};

// ===========================================
// GLOBAL EXPORTS
// ===========================================

window.BaseEnemy = BaseEnemy;

// Log successful initialization
console.log('[ENEMY SYSTEM] Modular enemy system initialized successfully');
