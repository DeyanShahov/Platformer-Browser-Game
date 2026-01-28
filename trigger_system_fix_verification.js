/* =========================
   TRIGGER SYSTEM FIX VERIFICATION
   Test file to verify the trigger system fixes
   ========================= */

// Test the fixed trigger system
function testTriggerSystemFix() {
    console.log('🧪 [TEST] Starting Trigger System Fix Verification...');

    // Test 1: Verify one-time trigger handling for area triggers
    console.log('\n📋 [TEST 1] One-Time Trigger Handling:');

    // Create a minimal mock level manager
    const mockLevelManager = {
        spawnEntity: async (config) => {
            console.log(`🎯 Mock spawn: ${config.type} at (${config.x}, ${config.y})`);
            return `entity_${Date.now()}`;
        },
        gameState: {
            getEntity: () => null,
            removeEntity: () => { }
        }
    };

    // Create trigger spawner
    const triggerSpawner = new TriggerSpawner(mockLevelManager);
    console.log('✅ TriggerSpawner created successfully');

    // Test one-time area trigger
    const oneTimeTrigger = triggerSpawner.createTrigger({
        id: 'test_one_time',
        type: 'area_enter',
        area: { x: 100, y: 100, width: 50, height: 50 },
        oneTime: true,
        entities: [{ type: 'enemy', enemyType: 'blue_slime' }]
    });

    console.log('One-time trigger created with state:', oneTimeTrigger.state);
    console.log('One-time trigger triggered property:', oneTimeTrigger.triggered);

    // Simulate player entering area (should trigger)
    const mockPlayer = {
        x: 125,
        y: 125,
        collisionW: 32,
        collisionH: 64
    };

    const conditionMet = triggerSpawner.evaluateAreaEnterTrigger(oneTimeTrigger, [mockPlayer]);
    console.log('Condition met for one-time trigger (should be true):', conditionMet);

    // Execute the trigger
    triggerSpawner.executeTrigger(oneTimeTrigger, [mockPlayer]);
    console.log('After execution - triggered property:', oneTimeTrigger.triggered);
    console.log('After execution - state:', oneTimeTrigger.state);

    // Try to evaluate again (should not trigger)
    const conditionMetAgain = triggerSpawner.evaluateAreaEnterTrigger(oneTimeTrigger, [mockPlayer]);
    console.log('Condition met for one-time trigger (should be false after first trigger):', conditionMetAgain);

    // Test 2: Verify time delay trigger with max count
    console.log('\n📋 [TEST 2] Time Delay Trigger with Max Count:');

    const timeTrigger = triggerSpawner.createTrigger({
        id: 'test_time_delay',
        type: 'time_delay',
        delay: 1000,
        interval: 1000,
        maxCount: 3,
        entities: [{ type: 'enemy', enemyType: 'blue_slime' }]
    });

    console.log('Time trigger created with state:', timeTrigger.state);
    console.log('Time trigger spawnCount:', timeTrigger.spawnCount);
    console.log('Time trigger maxCount:', timeTrigger.maxCount);

    // Test evaluation logic
    const evaluateResult = triggerSpawner.evaluateTimeDelayTrigger(timeTrigger);
    console.log('Time trigger evaluation result (should be true):', evaluateResult);

    // Simulate executing the trigger multiple times to test max count
    for (let i = 0; i < 5; i++) {
        console.log(`\n--- Executing trigger ${i + 1} ---`);
        if (i < 3) {
            // Execute normally
            triggerSpawner.executeTrigger(timeTrigger, [mockPlayer]);
            console.log(`After execution ${i + 1} - spawnCount: ${timeTrigger.spawnCount}, state: ${timeTrigger.state}`);
        } else {
            // Try to execute after max count reached (should not execute)
            console.log('Attempting to execute after max count reached...');
            triggerSpawner.executeTrigger(timeTrigger, [mockPlayer]);
            console.log(`After execution ${i + 1} - spawnCount: ${timeTrigger.spawnCount}, state: ${timeTrigger.state}`);
        }
    }

    console.log('\n✅ [TEST] Trigger System Fix Verification Complete!');
    console.log('🎯 One-time triggers should only execute once');
    console.log('🎯 Max count should prevent exceeding configured limit');
    console.log('🎯 State transitions should work correctly');
}

// Run the test when the script loads
if (typeof window !== 'undefined' && window.TriggerSpawner) {
    testTriggerSystemFix();
} else {
    console.log('⚠️ [TEST] Waiting for TriggerSpawner to be defined...');
    // Wait a bit and try again
    setTimeout(testTriggerSystemFix, 100);
}

// Export for manual testing
window.testTriggerSystemFix = testTriggerSystemFix;