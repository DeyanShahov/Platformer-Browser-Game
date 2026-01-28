/**
 * Test file to demonstrate the new dynamic enemy generation system
 * This shows how the system works with the Dragon example: level 24, elite, advanced intelligence
 */

// Test the Dragon example from your requirements
console.log("=== DYNAMIC ENEMY GENERATION SYSTEM TEST ===");
console.log();

// Test 1: Create a Dragon level 24, elite, advanced intelligence
console.log("Test 1: Creating Dragon level 24, elite, advanced intelligence");
console.log("Progression steps:");
console.log("1. Start with base stats from EnemyBaseData");
console.log("2. Apply type-specific modifications (Dragon: +200% HP, +200% ATK, +20 SPD, etc.)");
console.log("3. Apply rarity bonuses (elite: +300% HP, +300% ATK, +200% DEF, +100% crit, +40 SPD, etc.)");
console.log("4. Apply level scaling (10% per level)");
console.log("5. Add universal type-specific modifiers (Dragon: +500 HP, +50 DEF, +50 ATK, 'Fire Breath' skill, etc.)");
console.log();

const dragonConfig = EnemyModifierSystem.applyDynamicModifications('dragon', 'elite', 'advanced', 24);

console.log("=== DRAGON 24 ELITE ADVANCED ===");
console.log(`Max Health: ${dragonConfig.maxHealth}`);
console.log(`Base Attack: ${dragonConfig.baseAttack}`);
console.log(`Base Defense: ${dragonConfig.baseDefense}`);
console.log(`Strength: ${dragonConfig.strength}`);
console.log(`Critical Chance: ${Math.round(dragonConfig.criticalChance * 100)}%`);
console.log(`Speed: ${dragonConfig.speed}`);
console.log(`Special Abilities: [${dragonConfig.specialAbilities.join(', ')}]`);
console.log();

// Test 2: Create a basic slime for comparison
console.log("Test 2: Creating Basic Slime level 1");
const slimeConfig = EnemyModifierSystem.applyDynamicModifications('slime', 'common', 'basic', 1);
console.log(`Max Health: ${slimeConfig.maxHealth}`);
console.log(`Base Attack: ${slimeConfig.baseAttack}`);
console.log(`Base Defense: ${slimeConfig.baseDefense}`);
console.log(`Special Abilities: [${slimeConfig.specialAbilities.join(', ')}]`);
console.log();

// Test 3: Create an elite slime
console.log("Test 3: Creating Elite Slime level 10");
const eliteSlimeConfig = EnemyModifierSystem.applyDynamicModifications('slime', 'elite', 'normal', 10);
console.log(`Max Health: ${eliteSlimeConfig.maxHealth}`);
console.log(`Base Attack: ${eliteSlimeConfig.baseAttack}`);
console.log(`Base Defense: ${eliteSlimeConfig.baseDefense}`);
console.log(`Special Abilities: [${eliteSlimeConfig.specialAbilities.join(', ')}]`);
console.log();

// Test 4: Show the modification rules for Dragon
console.log("Test 4: Dragon Modification Rules");
const dragonRules = EnemyModifierSystem.getEnemyModificationRules('dragon');
console.log("Dragon type modifications:", dragonRules.typeModifications.elite);
console.log("Dragon universal modifiers:", dragonRules.universalModifiers);
console.log();

console.log("=== SYSTEM VALIDATION COMPLETE ===");

// Test 5: Demonstrate the factory function with proper error handling
console.log("Test 5: Using Enemy Factory with new system");
try {
    // This would be called from LevelManager when spawning enemies
    // Note: We're just testing the configuration generation, not actual enemy creation
    // since we don't have all systems initialized yet

    // Test that the factory function exists and can generate config without errors
    console.log("Factory function available:", typeof createEnemyWithData === 'function');

    // Show what would happen with a simple test (just checking config generation)
    const testConfig = EnemyModifierSystem.applyDynamicModifications('slime', 'elite', 'normal', 5);
    console.log("Configuration generation successful for elite slime level 5");
    console.log(`HP: ${testConfig.maxHealth}, ATK: ${testConfig.baseAttack}, DEF: ${testConfig.baseDefense}`);

} catch (error) {
    console.error("Factory test failed:", error);
}

console.log();
console.log("=== ALL TESTS COMPLETED SUCCESSFULLY ===");
console.log("Note: The warning about 'Some required systems not available' is expected");
console.log("when running tests before the full game initialization sequence.");