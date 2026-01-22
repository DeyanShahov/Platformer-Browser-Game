// ===========================================
// COLLISION SYSTEM - Main orchestrator and global exports
// ===========================================

/**
 * Initialize the collision system
 * This function is called to set up the collision system if needed
 */
function initCollisionSystem() {
    //console.log('[COLLISION_SYSTEM] Initialized collision system with modular architecture');
}

// Export initialization function to global scope
window.initCollisionSystem = initCollisionSystem;

// Note: All other collision functions are exported directly in their respective modules
// This maintains backward compatibility while allowing modular organization

//console.log('[COLLISION_SYSTEM] Collision system orchestrator loaded');
