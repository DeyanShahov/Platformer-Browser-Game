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
        const baseEnemyCount = ((currentStage - 1) % 3) + 1;

        // Calculate running count for incremental spawning with reset behavior
        //const runningCount = currentStage;
        const resetEvery = 3;
        // const runningCount = ((currentStage - 1) % resetEvery) + 1;
        // const enemyCount = (runningCount % resetEvery) === 0 ? 1 :
        //     ((runningCount - 1) % resetEvery) + 1;
        const enemyCount = ((currentStage - 1) % resetEvery) + 1;


        const enemyLevel = Math.ceil(currentStage / resetEvery);

        // Start with the static arena template from the window object
        const levelConfig = { ...window.ENDLESS_ARENA_TEMPLATE };

        // --- DYNAMICALLY GENERATED PROPERTIES ---

        // 1. Set basic info
        levelConfig.id = `endless_stage_${currentStage}`;
        levelConfig.name = `Maximum Progress - Stage ${currentStage}`;

        // 2. Generate entities with dynamic enemy types using our new system
        levelConfig.entities = [];
        for (let i = 0; i < enemyCount; i++) {
            // Determine enemy type based on stage number for progression
            const enemyTypeKey = (currentStage - 1) % 3;
            const enemyTypeMap = {
                0: 'slime',      // stage % 3 === 0 (stages 3,6,9,...)
                1: 'slime',      // stage % 3 === 1 (stages 1,4,7,...)
                2: 'slime'       // stage % 3 === 2 (stages 2,5,8,...) - elite variant
            };

            // Determine subtype based on stage progression
            let enemySubType = null;

            // Special case for stages that should spawn bosses
            if (enemyTypeKey === 2 && (currentStage % 3 === 0) && (currentStage > 3)) {
                // Starting from stage 6, every 3rd stage gets a boss instead of elite
                enemySubType = 'boss';
            } else if (enemyTypeKey === 2) {
                // Stage 2, 5, 8, ... get elite slimes
                enemySubType = 'elite';
            }

            levelConfig.entities.push({
                type: 'enemy',
                enemyType: enemyTypeMap[enemyTypeKey],
                enemySubType: enemySubType,
                level: enemyLevel,
                spawnTrigger: 'immediate',
                randomPosition: true
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