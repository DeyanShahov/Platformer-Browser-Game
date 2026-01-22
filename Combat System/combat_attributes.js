// Combat Attributes Manager - moved from combat_system.js
class CombatAttributes {
    constructor() {
        // Default combat attributes for characters
        this.defaults = {
            baseAttack: 5,
            baseDefense: 0,
            criticalChance: 0.10, // 10%

            // Combat chances (as percentages 0-1)
            hitChance: 0.95,     // 95% chance to hit
            dodgeChance: 0.05,   // 5% chance to dodge
            blockChance: 0.05,   // 5% chance to block

            // Magic resistances (0-100%)
            magicResistance: {
                water: 0,
                fire: 0,
                air: 0,
                earth: 0
            }
        };
    }

    // Initialize combat attributes for a character
    initializeForCharacter(characterInfo) {
        characterInfo.baseAttack = this.defaults.baseAttack;
        characterInfo.baseDefense = this.defaults.baseDefense;
        characterInfo.criticalChance = this.defaults.criticalChance;
        characterInfo.hitChance = this.defaults.hitChance;
        characterInfo.dodgeChance = this.defaults.dodgeChance;
        characterInfo.blockChance = this.defaults.blockChance;
        characterInfo.magicResistance = { ...this.defaults.magicResistance };
    }

    // Get combat attributes display text
    getCriticalChanceDisplay(characterInfo) {
        return `${Math.round(characterInfo.criticalChance * 100)}%`;
    }

    // Get magic resistance display
    getMagicResistanceDisplay(characterInfo) {
        return {
            water: `${characterInfo.magicResistance.water}%`,
            fire: `${characterInfo.magicResistance.fire}%`,
            air: `${characterInfo.magicResistance.air}%`,
            earth: `${characterInfo.magicResistance.earth}%`
        };
    }
}

// Export globally for traditional JavaScript approach
window.CombatAttributes = CombatAttributes;
