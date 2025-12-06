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
- [x] Character status UI system. Display health, energy, and mana bars with character portraits in upper left corner. Current status: IMPLEMENTED.

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
- [ ] Dialog system for interactive conversations
  - Implement object interaction system for triggering dialogs (pressing action button near NPCs/objects)
  - Create text display windows with typewriter effect for immersive storytelling
  - Add player choice system with branching conversation paths that affect gameplay
  - Support for multiple dialog types (NPC conversations, story events, tutorials, quests)
  - Implement dialog state persistence across game sessions
  - Add localization support for multiple languages
  - Create visual styling system for different dialog window appearances
- [ ] Save/Load system for game progress and character state
  - Implement session-based save system for current game progress (position, inventory, quests)
  - Create abstract persistence layer with CRUD operations for character data
  - Add multiple storage backends (JSON files, local database, cloud storage)
  - Support character restoration on game restart with full state recovery
  - Implement save slots system for multiple game saves
  - Add automatic save checkpoints at key game moments
  - Create data migration system for save file compatibility across versions
