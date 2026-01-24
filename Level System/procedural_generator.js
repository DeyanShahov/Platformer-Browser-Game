/**
 * Generates procedural level data for the "Maximum Progress" (Endless) mode.
 */
class ProceduralLevelGenerator {
    /**
     * Generates a complete level configuration for a given stage.
     * @param {number} currentStage - The current stage number (starting from 1).
     * @returns {object} A level configuration object compatible with the LevelManager.
     */
    generateStage(currentStage) {
        // Calculate enemy count and level based on the formulas
        const enemyCount = ((currentStage - 1) % 3) + 1;
        const enemyLevel = Math.floor((currentStage - 1) / 3) + 1;

        // Start with the static arena template from the window object
        const levelConfig = { ...window.ENDLESS_ARENA_TEMPLATE };

        // --- DYNAMICALLY GENERATED PROPERTIES ---

        // 1. Set basic info
        levelConfig.id = `endless_stage_${currentStage}`;
        levelConfig.name = `Maximum Progress - Stage ${currentStage}`;

        // 2. Generate entities
        levelConfig.entities = [];
        for (let i = 0; i < enemyCount; i++) {
            levelConfig.entities.push({
                type: 'enemy',
                enemyType: 'blue_slime',
                level: enemyLevel,
                spawnTrigger: 'immediate',
                randomPosition: true // LevelManager will handle positioning
            });
        }

        // 3. Set completion conditions
        levelConfig.completionConditions = [{
            type: 'enemies_defeated',
            targetCount: enemyCount
        }];

        // 4. Ensure no exit points from the template are carried over
        levelConfig.exitPoints = [];

        // 5. Set transition mode for endless progression
        //levelConfig.transitionMode = 'auto_on_completion';
        levelConfig.transitionMode = 'automatic';
        levelConfig.nextLevelId = 'endless_next'; // A special identifier for the LevelManager

        return levelConfig;
    }
}

window.proceduralGenerator = new ProceduralLevelGenerator();
