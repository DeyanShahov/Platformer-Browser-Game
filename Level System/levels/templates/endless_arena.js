/* =========================
   ENDLESS ARENA TEMPLATE
   A reusable template for the Endless Mode.
   Contains static data like boundaries, art, and player spawn.
   ========================= */

window.ENDLESS_ARENA_TEMPLATE = {
    // Basic info
    type: 'static',
    description: 'A universal arena for the Maximum Progress mode.',

    // Level boundaries from the plan
    boundaries: {
        left: 0,
        right: 2000,
        top: 0,
        bottom: 1000,
        zMin: -200,
        zMax: 200
    },

    // Player spawn zone
    playerSpawns: [{ x: 100, y: 800, z: 0 }],

    // Static assets (can be expanded later)
    backgrounds: {
        // Placeholder for background layers
    },
    
    // Music for the arena
    music: 'path/to/endless_mode_music.mp3', // Placeholder

    // This template won't be registered directly with the LevelManager
    // It's used by the ProceduralLevelGenerator.
};
