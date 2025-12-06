# Development Guidelines for Platformer Browser Game Framework

This project is a base Framework/Engine for creating browser-based platformer games. It will serve as a foundation for future projects.

## Core Components

- [x] Initial page with game name and character selection system. Currently available characters: blue, orange, green, and red squares. For future projects, these will be replaced with respective heroes. Current status: IMPLEMENTED.
- [x] Basic level for demonstrating mechanics. Current status: IMPLEMENTED.
- [x] Collision system for objects on screen. Current status: IMPLEMENTED.
- [x] Character control system. Movement: left, right, up, down, jump. Current status: IMPLEMENTED.
- [x] Skill/ability activation system using input commands. System includes 6 types of attacks/mechanics for testing, each with its own animation and mechanics for animation and reuse conditions. Current status: IMPLEMENTED.
- [x] System for changing basic button settings. Current status: IMPLEMENTED.
- [x] System for using Xbox 360 and PS3 controllers. Device recognition and selection option. Current status: IMPLEMENTED.
- [x] Local multiplayer/coop mode system for multiple players on one machine, with command recognition for each object. Current status: IMPLEMENTED.

## Future Enhancements

- [ ] Leveling system with experience point accumulation
  - Implement experience point gain from task completion, defeating enemies, or using special items
  - Add level progression when sufficient experience points are accumulated
  - Levels provide skill points for distribution in the skill tree system
- [ ] Skill tree system with prerequisites
  - Create a tree structure with multiple levels of skills
  - First-level skills require only "skill distribution points"
  - Higher-level skills (level 2 and above) require previous skills to be learned/unlocked
  - Implement point distribution system for unlocking skills
- [ ] Items system for equipping and collecting
  - Define different types of items (equipment, consumables, etc.)
  - Implement item properties and effects on characters
  - Add item collection and management mechanics
- [ ] Inventory system for storing collected items
  - Implement item collection from rewards and enemy defeats
  - Create inventory storage system with capacity management
  - Add access and usage interface for stored items
- [ ] Character equipment system for stat modification
  - Define equipment slots/positions (weapon, armor, accessories, etc.)
  - Implement one-item-per-slot equipping mechanism
  - Add character parameter modification based on equipped items
  - Create interface for changing equipment at player's discretion
- [ ] Level navigation system with branching paths
  - Implement basic left-to-right movement with screen transitions on task completion
  - Add interaction with doors/gates for entering hidden levels
  - Create branching path logic with choice points (signposts) leading to different zones
  - Implement return mechanism from additional levels back to main path
