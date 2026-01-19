/* =========================
   CAMERA CONTROLLER SYSTEM
   Handles camera movement and viewport management for scrolling levels
   Supports player following, dead zones, and smooth camera transitions
   ========================= */

class CameraController {
    constructor(canvas, levelBounds = null) {
        // Canvas and viewport settings
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.viewportWidth = canvas.width;
        this.viewportHeight = canvas.height;

        // Level boundaries (world coordinates)
        this.levelBounds = levelBounds || {
            left: 0,
            right: canvas.width,
            top: 0,
            bottom: canvas.height,
            zMin: -50,
            zMax: 50
        };

        // Camera position and target
        this.x = 0; // World X position of camera top-left
        this.y = 0; // World Y position of camera top-left
        this.targetX = 0;
        this.targetY = 0;

        // Camera settings
        this.lerpSpeed = 0.05; // Smooth following speed (0-1)
        this.deadZoneX = 200; // Pixels from screen edge before camera moves
        this.deadZoneY = 150;

        // Camera modes
        this.mode = 'follow_player'; // 'follow_player', 'fixed', 'lerp_to_target'
        this.followTarget = null; // Entity to follow

        // Camera shake effect
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;

        // Camera bounds (prevent camera from going outside level)
        this.enableBounds = true;

        console.log('[CameraController] Initialized with viewport:', this.viewportWidth, 'x', this.viewportHeight);
    }

    // =========================
    // CAMERA POSITIONING
    // =========================

    /**
     * Set camera position directly (immediate, no lerping)
     * @param {number} x - World X coordinate
     * @param {number} y - World Y coordinate
     */
    setPosition(x, y) {
        this.x = this.clampToBounds(x, y).x;
        this.y = this.clampToBounds(x, y).y;
        this.targetX = this.x;
        this.targetY = this.y;
    }

    /**
     * Set camera target position (lerps to target)
     * @param {number} x - Target world X coordinate
     * @param {number} y - Target world Y coordinate
     */
    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.mode = 'lerp_to_target';
    }

    /**
     * Set camera to follow an entity
     * @param {Object} entity - Entity to follow
     */
    followEntity(entity) {
        this.followTarget = entity;
        this.mode = 'follow_player';

        if (entity) {
            // Center camera on entity initially
            this.centerOnEntity(entity);
        }
    }

    /**
     * Stop following current entity
     */
    stopFollowing() {
        this.followTarget = null;
        this.mode = 'fixed';
    }

    /**
     * Center camera on entity immediately
     * @param {Object} entity - Entity to center on
     */
    centerOnEntity(entity) {
        const centerX = entity.x - this.viewportWidth / 2;
        const centerY = entity.y - this.viewportHeight / 2;
        this.setPosition(centerX, centerY);
    }

    /**
     * Check if entity is within camera dead zone
     * @param {Object} entity - Entity to check
     */
    isEntityInDeadZone(entity) {
        const entityScreenX = entity.x - this.x;
        const entityScreenY = entity.y - this.y;

        const leftDeadZone = this.deadZoneX;
        const rightDeadZone = this.viewportWidth - this.deadZoneX;
        const topDeadZone = this.deadZoneY;
        const bottomDeadZone = this.viewportHeight - this.deadZoneY;

        return entityScreenX >= leftDeadZone &&
            entityScreenX <= rightDeadZone &&
            entityScreenY >= topDeadZone &&
            entityScreenY <= bottomDeadZone;
    }

    // =========================
    // CAMERA UPDATES
    // =========================

    /**
     * Update camera position based on current mode
     * @param {number} dt - Delta time
     */
    update(dt) {
        switch (this.mode) {
            case 'follow_player':
                this.updateFollowPlayer(dt);
                break;
            case 'lerp_to_target':
                this.updateLerpToTarget(dt);
                break;
            case 'fixed':
                // No movement
                break;
        }

        // Update camera shake
        this.updateShake(dt);

        // Apply bounds clamping
        if (this.enableBounds) {
            const clamped = this.clampToBounds(this.x, this.y);
            this.x = clamped.x;
            this.y = clamped.y;
        }
    }

    /**
     * Update camera when following player with dead zone
     * @param {number} dt - Delta time
     */
    updateFollowPlayer(dt) {
        if (!this.followTarget) return;

        const entity = this.followTarget;
        let newTargetX = this.targetX;
        let newTargetY = this.targetY;

        // Check if entity is outside dead zone
        const entityScreenX = entity.x - this.x;
        const entityScreenY = entity.y - this.y;

        // Horizontal dead zone check
        if (entityScreenX < this.deadZoneX) {
            // Entity is too far left, move camera left
            newTargetX = entity.x - this.deadZoneX;
        } else if (entityScreenX > this.viewportWidth - this.deadZoneX) {
            // Entity is too far right, move camera right
            newTargetX = entity.x - (this.viewportWidth - this.deadZoneX);
        }

        // Vertical dead zone check
        if (entityScreenY < this.deadZoneY) {
            // Entity is too far up, move camera up
            newTargetY = entity.y - this.deadZoneY;
        } else if (entityScreenY > this.viewportHeight - this.deadZoneY) {
            // Entity is too far down, move camera down
            newTargetY = entity.y - (this.viewportHeight - this.deadZoneY);
        }

        // Update target if it changed
        if (newTargetX !== this.targetX || newTargetY !== this.targetY) {
            this.targetX = newTargetX;
            this.targetY = newTargetY;
        }

        // Smooth lerp to target
        this.x += (this.targetX - this.x) * this.lerpSpeed;
        this.y += (this.targetY - this.y) * this.lerpSpeed;
    }

    /**
     * Update camera lerping to target position
     * @param {number} dt - Delta time
     */
    updateLerpToTarget(dt) {
        this.x += (this.targetX - this.x) * this.lerpSpeed;
        this.y += (this.targetY - this.y) * this.lerpSpeed;

        // Check if close enough to target
        const dx = Math.abs(this.x - this.targetX);
        const dy = Math.abs(this.y - this.targetY);

        if (dx < 1 && dy < 1) {
            this.x = this.targetX;
            this.y = this.targetY;
            this.mode = 'fixed';
        }
    }

    /**
     * Update camera shake effect
     * @param {number} dt - Delta time
     */
    updateShake(dt) {
        if (this.shakeDuration > 0) {
            this.shakeDuration -= dt;

            // Generate random shake offsets
            this.shakeOffsetX = (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeOffsetY = (Math.random() - 0.5) * this.shakeIntensity;

            if (this.shakeDuration <= 0) {
                this.shakeOffsetX = 0;
                this.shakeOffsetY = 0;
                this.shakeIntensity = 0;
            }
        }
    }

    // =========================
    // CAMERA EFFECTS
    // =========================

    /**
     * Apply camera shake effect
     * @param {number} intensity - Shake intensity
     * @param {number} duration - Shake duration in seconds
     */
    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }

    /**
     * Apply screen flash effect (for dramatic moments)
     * @param {string} color - Flash color
     * @param {number} duration - Flash duration in seconds
     */
    flash(color = '#FFFFFF', duration = 0.1) {
        // Store flash parameters for rendering
        this.flashColor = color;
        this.flashDuration = duration;
        this.flashTimer = duration;
    }

    // =========================
    // CAMERA BOUNDS & CONSTRAINTS
    // =========================

    /**
     * Clamp camera position to level bounds
     * @param {number} x - Desired X position
     * @param {number} y - Desired Y position
     */
    clampToBounds(x, y) {
        let clampedX = x;
        let clampedY = y;

        // Calculate maximum camera positions (camera shouldn't show area beyond level bounds)
        const maxX = this.levelBounds.right - this.viewportWidth;
        const maxY = this.levelBounds.bottom - this.viewportHeight;

        // Clamp to bounds
        clampedX = Math.max(this.levelBounds.left, Math.min(clampedX, maxX));
        clampedY = Math.max(this.levelBounds.top, Math.min(clampedY, maxY));

        return { x: clampedX, y: clampedY };
    }

    /**
     * Update level bounds (useful for dynamic levels)
     * @param {Object} bounds - New level bounds
     */
    setLevelBounds(bounds) {
        this.levelBounds = { ...this.levelBounds, ...bounds };
        console.log('[CameraController] Level bounds updated:', this.levelBounds);
    }

    /**
     * Enable/disable camera bounds clamping
     * @param {boolean} enabled - Whether to enable bounds
     */
    setBoundsEnabled(enabled) {
        this.enableBounds = enabled;
    }

    // =========================
    // COORDINATE CONVERSION
    // =========================

    /**
     * Convert world coordinates to screen coordinates
     * @param {number} worldX - World X coordinate
     * @param {number} worldY - World Y coordinate
     */
    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x + this.shakeOffsetX,
            y: worldY - this.y + this.shakeOffsetY
        };
    }

    /**
     * Convert screen coordinates to world coordinates
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     */
    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.x - this.shakeOffsetX,
            y: screenY + this.y - this.shakeOffsetY
        };
    }

    /**
     * Check if world position is visible on screen
     * @param {number} worldX - World X coordinate
     * @param {number} worldY - World Y coordinate
     * @param {number} width - Object width (optional)
     * @param {number} height - Object height (optional)
     */
    isVisible(worldX, worldY, width = 0, height = 0) {
        const screenX = worldX - this.x;
        const screenY = worldY - this.y;

        return screenX + width >= 0 &&
            screenX <= this.viewportWidth &&
            screenY + height >= 0 &&
            screenY <= this.viewportHeight;
    }

    // =========================
    // CAMERA SETTINGS
    // =========================

    /**
     * Set camera lerp speed (0-1, higher = faster following)
     * @param {number} speed - Lerp speed
     */
    setLerpSpeed(speed) {
        this.lerpSpeed = Math.max(0, Math.min(1, speed));
    }

    /**
     * Set dead zone size (pixels from screen edge)
     * @param {number} deadZoneX - Horizontal dead zone
     * @param {number} deadZoneY - Vertical dead zone
     */
    setDeadZone(deadZoneX, deadZoneY) {
        this.deadZoneX = deadZoneX;
        this.deadZoneY = deadZoneY;
    }

    // =========================
    // DEBUG & VISUALIZATION
    // =========================

    /**
     * Draw camera debug information
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawDebug(ctx) {
        if (!DEBUG_MODE.SHOW_CAMERA_DEBUG) return;

        ctx.save();
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;

        // Draw camera bounds
        ctx.strokeRect(
            -this.x,
            -this.y,
            this.levelBounds.right - this.levelBounds.left,
            this.levelBounds.bottom - this.levelBounds.top
        );

        // Draw dead zone
        ctx.strokeStyle = '#FFFF00';
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
            this.deadZoneX,
            this.deadZoneY,
            this.viewportWidth - this.deadZoneX * 2,
            this.viewportHeight - this.deadZoneY * 2
        );
        ctx.setLineDash([]);

        // Draw camera info text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.fillText(`Camera: (${Math.round(this.x)}, ${Math.round(this.y)})`, 10, 30);
        ctx.fillText(`Target: (${Math.round(this.targetX)}, ${Math.round(this.targetY)})`, 10, 50);
        ctx.fillText(`Mode: ${this.mode}`, 10, 70);

        if (this.followTarget) {
            ctx.fillText(`Following: ${this.followTarget.entityType || 'entity'}`, 10, 90);
        }

        ctx.restore();
    }

    // =========================
    // RENDERING INTEGRATION
    // =========================

    /**
     * Apply camera transform to rendering context
     * Call before rendering world entities
     */
    applyTransform() {
        this.ctx.save();
        this.ctx.translate(-this.x + this.shakeOffsetX, -this.y + this.shakeOffsetY);
    }

    /**
     * Restore camera transform after rendering
     * Call after rendering world entities
     */
    restoreTransform() {
        this.ctx.restore();
    }

    /**
     * Render camera effects (flash, etc.)
     */
    renderEffects() {
        // Handle flash effect
        if (this.flashTimer > 0) {
            this.flashTimer -= 1 / 60; // Assume 60 FPS

            const alpha = Math.min(1, this.flashTimer / (this.flashDuration * 0.3));
            this.ctx.save();
            this.ctx.globalAlpha = alpha * 0.7;
            this.ctx.fillStyle = this.flashColor;
            this.ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);
            this.ctx.restore();
        }
    }

    // =========================
    // UTILITY METHODS
    // =========================

    /**
     * Get camera state for debugging/serialization
     */
    getDebugInfo() {
        return {
            position: { x: this.x, y: this.y },
            target: { x: this.targetX, y: this.targetY },
            mode: this.mode,
            bounds: this.levelBounds,
            following: !!this.followTarget,
            shake: {
                intensity: this.shakeIntensity,
                duration: this.shakeDuration
            }
        };
    }

    /**
     * Reset camera to initial state
     */
    reset() {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.mode = 'fixed';
        this.followTarget = null;
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.flashTimer = 0;

        console.log('[CameraController] Reset to initial state');
    }
}

// =========================
// CAMERA PRESETS
// =========================

/**
 * Predefined camera configurations for different level types
 */
const CAMERA_PRESETS = {
    STATIC_LEVEL: {
        lerpSpeed: 0.1,
        deadZoneX: 50,
        deadZoneY: 50,
        enableBounds: false // Static levels don't need bounds
    },

    SCROLLING_HORIZONTAL: {
        lerpSpeed: 0.08,
        deadZoneX: 200,
        deadZoneY: 100,
        enableBounds: true
    },

    SCROLLING_VERTICAL: {
        lerpSpeed: 0.08,
        deadZoneX: 150,
        deadZoneY: 200,
        enableBounds: true
    },

    ACTION_INTENSE: {
        lerpSpeed: 0.15,
        deadZoneX: 100,
        deadZoneY: 80,
        enableBounds: true
    },

    CINEMATIC: {
        lerpSpeed: 0.03,
        deadZoneX: 300,
        deadZoneY: 200,
        enableBounds: true
    }
};

/**
 * Create camera with preset configuration
 * @param {HTMLCanvasElement} canvas - Game canvas
 * @param {string} presetName - Name of camera preset
 * @param {Object} levelBounds - Level boundaries
 */
function createCameraWithPreset(canvas, presetName, levelBounds = null) {
    const preset = CAMERA_PRESETS[presetName.toUpperCase()];
    if (!preset) {
        console.warn(`Unknown camera preset: ${presetName}, using default`);
        return new CameraController(canvas, levelBounds);
    }

    const camera = new CameraController(canvas, levelBounds);

    // Apply preset settings
    Object.assign(camera, preset);

    console.log(`[CameraController] Created with preset: ${presetName}`);
    return camera;
}

// =========================
// GLOBAL EXPORTS
// =========================

window.CameraController = CameraController;
window.createCameraWithPreset = createCameraWithPreset;
window.CAMERA_PRESETS = CAMERA_PRESETS;
