/* =========================
   EXIT POINT SYSTEM
   Handles level completion triggers and transition points
   Supports area-based triggers, visual indicators, and auto-transitions
   ========================= */

class ExitPoint {
    /**
     * Create an exit point for level transitions
     * @param {Object} config - Exit point configuration
     */
    constructor(config) {
        // Basic properties
        this.id = config.id || `exit_${Date.now()}`;
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.z = config.z || 0;
        this.width = config.width || 100;
        this.height = config.height || 100;
        this.depth = config.depth || 50;

        // Visual properties
        this.color = config.color || '#00FF00';
        this.opacity = config.opacity || 0.7;
        this.pulseEffect = config.pulseEffect !== false; // Enable pulse by default
        this.pulseSpeed = config.pulseSpeed || 2;
        this.pulseMin = config.pulseMin || 0.3;
        this.pulseMax = config.pulseMax || 1.0;

        // Trigger properties
        this.triggerType = config.triggerType || 'area_enter'; // 'area_enter', 'area_touch', 'manual'
        this.autoActivate = config.autoActivate !== false; // Auto-activate when conditions met
        this.activationDelay = config.activationDelay || 0; // Delay before activation
        this.activationMode = config.activationMode || 'always'; // 'always', 'after_completion', 'never'

        // Transition properties
        this.targetLevelId = config.targetLevelId || null;
        this.transitionType = config.transitionType || 'fade';
        this.transitionDirection = config.transitionDirection || 'right';

        // State
        this.isActive = config.isActive !== false; // Active by default
        this.isTriggered = false;
        this.activationTime = 0;
        this.pulsePhase = 0;

        // Entity type for game state
        this.entityType = 'exit_point';

        console.log(`[ExitPoint] Created exit point: ${this.id} at (${this.x}, ${this.y})`);
    }

    // =========================
    // TRIGGER LOGIC
    // =========================

    /**
     * Check if players are triggering this exit point
     * @param {Array} players - Array of player entities
     */
    checkTrigger(players) {
        if (!this.isActive || this.isTriggered) return false;

        for (const player of players) {
            if (this.isPlayerInTriggerArea(player)) {
                this.trigger(player);
                return true;
            }
        }

        return false;
    }

    /**
     * Check if a player is in the trigger area
     * @param {Object} player - Player entity
     */
    isPlayerInTriggerArea(player) {
        // Use accurate hit box coordinates (same as combat system and damage numbers)
        const playerHitBox = window.calculateHitBoxPosition ?
            window.calculateHitBoxPosition(player) :
            {
                x: player.x - (player.collisionW || player.w) / 2,
                y: player.y - (player.collisionH || player.h),
                width: player.collisionW || player.w,
                height: player.collisionH || player.h
            };

        const playerLeft = playerHitBox.x;
        const playerRight = playerHitBox.x + playerHitBox.width;
        const playerTop = playerHitBox.y;
        const playerBottom = playerHitBox.y + playerHitBox.height;

        const exitLeft = this.x - this.width / 2;
        const exitRight = this.x + this.width / 2;
        const exitTop = this.y - this.height;
        const exitBottom = this.y;

        // Check horizontal overlap
        const xOverlap = playerRight > exitLeft && playerLeft < exitRight;

        // Check vertical overlap
        const yOverlap = playerBottom > exitTop && playerTop < exitBottom;

        // Check Z overlap (for 2.5D levels)
        const zOverlap = Math.abs(player.z - this.z) <= this.depth / 2;

        // Debug logging for collision detection
        // console.log(`[ExitPoint] Collision check for ${this.id}:`);
        // console.log(`  Player hitbox: x=${playerLeft.toFixed(1)}-${playerRight.toFixed(1)}, y=${playerTop.toFixed(1)}-${playerBottom.toFixed(1)}, z=${player.z.toFixed(1)}`);
        // console.log(`  Exit area: x=${exitLeft.toFixed(1)}-${exitRight.toFixed(1)}, y=${exitTop.toFixed(1)}-${exitBottom.toFixed(1)}, z=${this.z.toFixed(1)}`);
        // console.log(`  Overlaps: X=${xOverlap}, Y=${yOverlap}, Z=${zOverlap}, Total=${xOverlap && yOverlap && zOverlap}`);

        return xOverlap && yOverlap && zOverlap;
    }

    /**
     * Trigger the exit point
     * @param {Object} triggeringPlayer - Player who triggered it
     */
    trigger(triggeringPlayer) {
        if (this.isTriggered) return;

        console.log(`[ExitPoint] Triggered by player at (${triggeringPlayer.x.toFixed(1)}, ${triggeringPlayer.y.toFixed(1)})`);

        this.isTriggered = true;
        this.activationTime = Date.now();

        // Handle activation based on type
        if (this.autoActivate) {
            if (this.activationDelay > 0) {
                setTimeout(() => {
                    this.activate(triggeringPlayer);
                }, this.activationDelay);
            } else {
                this.activate(triggeringPlayer);
            }
        }
    }

    /**
     * Activate the exit point (perform transition)
     * @param {Object} triggeringPlayer - Player who triggered it
     */
    activate(triggeringPlayer) {
        console.log(`[ExitPoint] Activating exit point: ${this.id} with mode: ${this.activationMode}`);

        // DEBUG: Check all critical values
        console.log(`[ExitPoint] DEBUG - levelManager exists: ${!!window.levelManager}`);
        console.log(`[ExitPoint] DEBUG - targetLevelId: ${this.targetLevelId}`);
        console.log(`[ExitPoint] DEBUG - transitionType: ${this.transitionType}`);
        console.log(`[ExitPoint] DEBUG - triggeringPlayer: ${triggeringPlayer ? 'EXISTS' : 'NULL'}`);

        // Check activation mode and level completion
        const levelCompleted = window.levelManager ?
            window.levelManager.getLevelCompleted() : false;

        console.log(`[ExitPoint] Level completed: ${levelCompleted}, activation mode: ${this.activationMode}`);

        switch (this.activationMode) {
            case 'always':
                // Always active - proceed with transition
                console.log(`[ExitPoint] ${this.id} is always active - proceeding with transition`);
                break;

            case 'after_completion':
                if (!levelCompleted) {
                    console.log(`[ExitPoint] ${this.id} requires level completion first - blocking transition`);
                    return; // Don't activate if level not completed
                }
                console.log(`[ExitPoint] ${this.id} level completed - proceeding with transition`);
                break;

            case 'never':
                console.log(`[ExitPoint] ${this.id} is never activatable - blocking transition`);
                return; // Never activate

            default:
                console.warn(`[ExitPoint] Unknown activation mode: ${this.activationMode} - blocking transition`);
                return;
        }

        // Proceed with transition
        if (window.levelManager && this.targetLevelId) {
            console.log(`[ExitPoint] Starting transition to: ${this.targetLevelId}`);
            window.levelManager.startTransition(this.targetLevelId, this.transitionType);
        } else {
            console.warn(`[ExitPoint] Cannot start transition - levelManager or targetLevelId missing`);
        }

        // Camera flash removed - transition system handles visual effects

        // Play sound effect (placeholder)
        // TODO: Integrate with audio system when available
        console.log(`[ExitPoint] Transition initiated to level: ${this.targetLevelId}`);

        // Emit event for UI updates
        if (window.eventSystem) {
            window.eventSystem.emit('exit_point_activated', {
                exitPoint: this,
                triggeringPlayer: triggeringPlayer
            });
        }
    }

    // =========================
    // VISUAL RENDERING
    // =========================

    /**
     * Render the exit point
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} cameraX - Camera X offset
     * @param {number} cameraY - Camera Y offset
     */
    render(ctx, cameraX = 0, cameraY = 0) {
        if (!this.isActive) return;

        // Convert to screen coordinates
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;

        // Check if visible on screen
        const canvas = ctx.canvas;
        if (screenX + this.width / 2 < 0 ||
            screenX - this.width / 2 > canvas.width ||
            screenY + this.height < 0 ||
            screenY > canvas.height) {
            return; // Not visible
        }

        ctx.save();

        // Apply pulse effect if enabled
        let currentOpacity = this.opacity;
        if (this.pulseEffect) {
            this.pulsePhase += 0.05; // Update pulse phase
            const pulseRange = this.pulseMax - this.pulseMin;
            const pulseValue = Math.sin(this.pulsePhase * this.pulseSpeed) * 0.5 + 0.5;
            currentOpacity = this.pulseMin + pulseValue * pulseRange;
        }

        ctx.globalAlpha = currentOpacity;

        // Draw exit point indicator based on activation state
        let indicatorColor, fillColor, lineWidth;

        if (this.isTriggered) {
            // Triggered state - more vibrant
            indicatorColor = '#FFFF00';
            fillColor = 'rgba(255, 255, 0, 0.3)';
            lineWidth = 4;
        } else {
            // Check if exit point is activatable based on activation mode
            const levelCompleted = window.levelManager ?
                window.levelManager.getLevelCompleted() : false;
            const canActivate = this.activationMode === 'always' ||
                (this.activationMode === 'after_completion' && levelCompleted);

            if (canActivate) {
                // Active state - normal green
                indicatorColor = this.color;
                fillColor = 'rgba(0, 255, 0, 0.2)';
                lineWidth = 2;
            } else {
                // Inactive state - red/gray to show it's not yet available
                indicatorColor = '#FF4444';
                fillColor = 'rgba(255, 68, 68, 0.1)';
                lineWidth = 2;
            }
        }

        ctx.strokeStyle = indicatorColor;
        ctx.lineWidth = lineWidth;
        ctx.fillStyle = fillColor;

        // Draw main rectangle
        ctx.fillRect(
            screenX - this.width / 2,
            screenY - this.height,
            this.width,
            this.height
        );

        ctx.strokeRect(
            screenX - this.width / 2,
            screenY - this.height,
            this.width,
            this.height
        );

        // Draw direction arrow
        this.drawDirectionArrow(ctx, screenX, screenY);

        // Draw activation indicator
        if (this.isTriggered && this.activationDelay > 0) {
            this.drawActivationProgress(ctx, screenX, screenY);
        }

        ctx.restore();
    }

    /**
     * Draw direction arrow indicating exit direction
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} centerX - Center X position
     * @param {number} centerY - Center Y position
     */
    drawDirectionArrow(ctx, centerX, centerY) {
        const arrowSize = 20;
        let arrowX = centerX;
        let arrowY = centerY - this.height / 2 - 10;

        ctx.save();
        ctx.strokeStyle = this.isTriggered ? '#FFFF00' : this.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Adjust arrow position based on direction
        switch (this.transitionDirection) {
            case 'right':
                arrowX = centerX + this.width / 2 + 15;
                break;
            case 'left':
                arrowX = centerX - this.width / 2 - 15;
                break;
            case 'up':
                arrowY = centerY - this.height - 15;
                arrowX = centerX;
                break;
            case 'down':
                arrowY = centerY + 15;
                arrowX = centerX;
                break;
        }

        // Draw arrow based on direction
        ctx.beginPath();
        if (this.transitionDirection === 'right') {
            ctx.moveTo(arrowX - arrowSize, arrowY);
            ctx.lineTo(arrowX, arrowY - arrowSize / 2);
            ctx.lineTo(arrowX, arrowY + arrowSize / 2);
            ctx.closePath();
        } else if (this.transitionDirection === 'left') {
            ctx.moveTo(arrowX + arrowSize, arrowY);
            ctx.lineTo(arrowX, arrowY - arrowSize / 2);
            ctx.lineTo(arrowX, arrowY + arrowSize / 2);
            ctx.closePath();
        } else if (this.transitionDirection === 'up') {
            ctx.moveTo(arrowX, arrowY + arrowSize);
            ctx.lineTo(arrowX - arrowSize / 2, arrowY);
            ctx.lineTo(arrowX + arrowSize / 2, arrowY);
            ctx.closePath();
        } else if (this.transitionDirection === 'down') {
            ctx.moveTo(arrowX, arrowY - arrowSize);
            ctx.lineTo(arrowX - arrowSize / 2, arrowY);
            ctx.lineTo(arrowX + arrowSize / 2, arrowY);
            ctx.closePath();
        }

        ctx.stroke();
        ctx.restore();
    }

    /**
     * Draw activation progress indicator
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} centerX - Center X position
     * @param {number} centerY - Center Y position
     */
    drawActivationProgress(ctx, centerX, centerY) {
        const progress = Math.min(1, (Date.now() - this.activationTime) / this.activationDelay);
        const radius = 15;

        ctx.save();
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 3;

        // Draw progress arc
        ctx.beginPath();
        ctx.arc(centerX, centerY - this.height / 2 - 30, radius, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
        ctx.stroke();

        // Draw progress text
        ctx.fillStyle = '#FFFF00';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(progress * 100)}%`, centerX, centerY - this.height / 2 - 25);

        ctx.restore();
    }

    // =========================
    // STATE MANAGEMENT
    // =========================

    /**
     * Deactivate the exit point
     */
    deactivate() {
        this.isActive = false;
        this.isTriggered = false;
        this.activationTime = 0;
        console.log(`[ExitPoint] Deactivated: ${this.id}`);
    }

    /**
     * Reset the exit point state
     */
    reset() {
        this.isTriggered = false;
        this.activationTime = 0;
        this.pulsePhase = 0;
    }

    // =========================
    // UTILITY METHODS
    // =========================

    /**
     * Get exit point bounds
     */
    getBounds() {
        return {
            left: this.x - this.width / 2,
            right: this.x + this.width / 2,
            top: this.y - this.height,
            bottom: this.y,
            front: this.z - this.depth / 2,
            back: this.z + this.depth / 2
        };
    }

    /**
     * Get debug information
     */
    getDebugInfo() {
        return {
            id: this.id,
            position: { x: this.x, y: this.y, z: this.z },
            size: { width: this.width, height: this.height, depth: this.depth },
            active: this.isActive,
            triggered: this.isTriggered,
            targetLevel: this.targetLevelId,
            direction: this.transitionDirection
        };
    }

    /**
     * Check if exit point is visible on screen
     * @param {number} cameraX - Camera X position
     * @param {number} cameraY - Camera Y position
     * @param {number} screenWidth - Screen width
     * @param {number} screenHeight - Screen height
     */
    isVisible(cameraX, cameraY, screenWidth, screenHeight) {
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;

        return screenX + this.width / 2 >= 0 &&
            screenX - this.width / 2 <= screenWidth &&
            screenY >= 0 &&
            screenY - this.height <= screenHeight;
    }
}

// =========================
// EXIT POINT MANAGER
// =========================

class ExitPointManager {
    constructor(levelManager) {
        this.levelManager = levelManager;
        this.exitPoints = new Map();
        console.log('[ExitPointManager] Initialized');
    }

    /**
     * Add an exit point to the manager
     * @param {ExitPoint} exitPoint - Exit point to add
     */
    addExitPoint(exitPoint) {
        this.exitPoints.set(exitPoint.id, exitPoint);
        console.log(`[ExitPointManager] Added exit point: ${exitPoint.id}`);
    }

    /**
     * Remove an exit point
     * @param {string} exitPointId - ID of exit point to remove
     */
    removeExitPoint(exitPointId) {
        if (this.exitPoints.delete(exitPointId)) {
            console.log(`[ExitPointManager] Removed exit point: ${exitPointId}`);
        }
    }

    /**
     * Get exit point by ID
     * @param {string} exitPointId - Exit point ID
     */
    getExitPoint(exitPointId) {
        return this.exitPoints.get(exitPointId) || null;
    }

    /**
     * Update all exit points
     * @param {Array} players - Array of player entities
     * @param {number} dt - Delta time
     */
    update(players, dt) {
        for (const exitPoint of this.exitPoints.values()) {
            exitPoint.checkTrigger(players);
        }
    }

    /**
     * Render all exit points
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} cameraX - Camera X offset
     * @param {number} cameraY - Camera Y offset
     */
    render(ctx, cameraX = 0, cameraY = 0) {
        for (const exitPoint of this.exitPoints.values()) {
            exitPoint.render(ctx, cameraX, cameraY);
        }
    }

    /**
     * Clear all exit points
     */
    clear() {
        this.exitPoints.clear();
        console.log('[ExitPointManager] Cleared all exit points');
    }

    /**
     * Load exit points from level data
     * @param {Array} exitPointConfigs - Array of exit point configurations
     */
    loadFromLevelData(exitPointConfigs) {
        this.clear();

        if (!exitPointConfigs || !Array.isArray(exitPointConfigs)) return;

        for (const config of exitPointConfigs) {
            const exitPoint = new ExitPoint(config);
            this.addExitPoint(exitPoint);
        }

        console.log(`[ExitPointManager] Loaded ${exitPointConfigs.length} exit points from level data`);
    }

    /**
     * Get all exit points
     */
    getAllExitPoints() {
        return Array.from(this.exitPoints.values());
    }

    /**
     * Get debug information for all exit points
     */
    getDebugInfo() {
        const info = {};
        for (const [id, exitPoint] of this.exitPoints) {
            info[id] = exitPoint.getDebugInfo();
        }
        return info;
    }
}

// =========================
// GLOBAL EXPORTS
// =========================

window.ExitPoint = ExitPoint;
window.ExitPointManager = ExitPointManager;
