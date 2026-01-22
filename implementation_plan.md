# Implementation Plan

[Overview]
Refactor the monolithic combat_system.js file into a modular Combat System directory structure. The current 1000+ line file contains 6+ distinct responsibilities (combat attributes, damage calculation, combat resolution, enemy coordination, visual effects, and utilities) which violates single responsibility principle and exceeds recommended file size limits. This refactoring will create focused modules following the project's established patterns (similar to Collision System/, Animation System/, Enemies/).

The refactoring must maintain zero functional changes - identical combat behavior before and after. All existing global exports (window.combat*) must be preserved for backward compatibility. The new architecture will use dependency injection via parameters rather than global dependencies.

[Types]
No new types or data structures are being introduced. All existing classes and functions are being redistributed across modules without modification to their interfaces or behavior.

[Files]
New files to be created:
- Combat System/index.js - System orchestrator and global exports
- Combat System/combat_attributes.js - CombatAttributes class for character stat management
- Combat System/combat_calculator.js - CombatCalculator class for damage calculations and modifiers
- Combat System/combat_resolver.js - CombatResolver class for attack resolution and logging
- Combat System/enemy_combat.js - EnemyCombatManager class for enemy attack coordination
- Combat System/damage_display.js - DamageNumberManager class for visual damage numbers
- Combat System/combat_utils.js - Shared helper functions (hit box positioning, skill mapping, enemy defeat)

Existing files to be modified:
- combat_system.js - Replace with import statements and minimal orchestration code
- js_platformer_z_depth_demo.html - Update script loading order for new Combat System/ directory

Files to remain unchanged:
- PROJECT_FILE_GUIDE.md - Will be updated after successful refactoring

[Functions]
No new functions are being created. All existing functions are being moved between files without interface changes:

New function locations:
- CombatAttributes class → Combat System/combat_attributes.js
- CombatCalculator class → Combat System/combat_calculator.js
- CombatResolver class → Combat System/combat_resolver.js
- EnemyCombatManager class → Combat System/enemy_combat.js
- DamageNumberManager class → Combat System/damage_display.js
- Helper functions (calculateHitBoxPosition, addDamageNumberToTarget, getCombatSkillType, handleEnemyDefeat, etc.) → Combat System/combat_utils.js

Global exports remain identical - no breaking changes to existing API.

[Classes]
No new classes are being created. All existing classes are being redistributed:

New class locations:
- CombatAttributes → Combat System/combat_attributes.js
- CombatCalculator → Combat System/combat_calculator.js
- CombatResolver → Combat System/combat_resolver.js
- EnemyCombatManager → Combat System/enemy_combat.js
- DamageNumberManager → Combat System/damage_display.js

Class interfaces and behavior remain completely unchanged.

[Dependencies]
No new external dependencies are introduced. Internal dependencies between modules:

Combat System/index.js imports from:
- ./combat_attributes.js
- ./combat_calculator.js
- ./combat_resolver.js
- ./enemy_combat.js
- ./damage_display.js
- ./combat_utils.js

combat_system.js imports from:
- ./Combat System/index.js

All other existing dependencies (character_info.js, game_state.js, etc.) remain unchanged.

[Testing]
Testing approach focuses on functional verification:

Pre-refactoring baseline:
- Record combat behavior with various attack types, critical hits, enemy attacks
- Document damage calculations, resource consumption, visual effects
- Verify enemy defeat sequences and XP awarding

Post-refactoring verification:
- Compare all combat interactions against baseline
- Ensure identical damage numbers, critical hit chances, enemy behavior
- Verify visual damage numbers appear correctly
- Confirm resource consumption and skill cooldowns work
- Test enemy combat manager coordination

Automated testing not available - manual verification required for each combat scenario:
- Player attacks (basic, medium, heavy, special skills)
- Enemy attacks on player
- Critical hits and damage modifiers
- Resource consumption (mana, energy)
- Visual effects (damage numbers)
- Enemy defeat and level progression

[Implementation Order]
1. Create Combat System/ directory structure
2. Extract CombatAttributes class to combat_attributes.js
3. Extract CombatCalculator class to combat_calculator.js
4. Extract CombatResolver class to combat_resolver.js
5. Extract EnemyCombatManager class to enemy_combat.js
6. Extract DamageNumberManager class to damage_display.js
7. Extract helper functions to combat_utils.js
8. Create index.js orchestrator with global exports
9. Update combat_system.js to import from new modules
10. Update HTML script loading for Combat System/
11. Comprehensive testing of all combat functionality
12. Update PROJECT_FILE_GUIDE.md documentation
