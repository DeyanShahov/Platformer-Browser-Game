// Combat System Orchestrator - Main entry point for the modular combat system

// Note: Individual modules export their classes/functions to window.* globally
// This file just instantiates the main instances for backward compatibility

// Create global combat system instances for backward compatibility
// (Classes are already exported globally by their respective modules)
window.combatCalculator = new window.CombatCalculator();
window.combatResolver = new window.CombatResolver();
window.enemyCombatManager = new window.EnemyCombatManager();
window.damageNumberManager = new window.DamageNumberManager();
window.combatAttributes = new window.CombatAttributes();

// Log successful initialization
console.log('[COMBAT SYSTEM] Modular combat system initialized successfully');
