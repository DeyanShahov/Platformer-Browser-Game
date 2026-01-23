// Main initialization - game logic moved to game.js, UI logic moved to ui.js
let ctx;
window.gameState = 'start'; // 'start', 'playing' - made global for UI access

// Initialize animation system (scripts are loaded statically in HTML)
function initializeAnimationSystem() {
  return new Promise((resolve) => {
    // Wait for animation system to be available
    const checkSystemReady = () => {
      if (window.animationSystem && window.spriteManager) {
        //console.log('[MAIN] Animation system ready, initializing...');

        // Initialize animation system
        const canvas = document.getElementById("game");
        if (canvas) {
          window.animationSystem.initialize(canvas).then(() => {
            //console.log('[MAIN] Animation system initialized successfully');
            resolve();
          }).catch(error => {
            console.error('[MAIN] Failed to initialize animation system:', error);
            resolve(); // Continue even if animation fails
          });
        } else {
          console.error('[MAIN] Canvas not found for animation system');
          resolve();
        }
      } else {
        // Check again in next frame
        setTimeout(checkSystemReady, 100);
      }
    };

    checkSystemReady();
  });
}

// Initialize the game (start screen)
function initGame() {
  // Initialize start screen (moved to ui.js) - wait for UI system to be available
  const initStartScreen = () => {
    if (window.UISystem && window.UISystem.initStartScreen) {
      window.UISystem.initStartScreen();
    } else {
      // Wait for UI system to be available
      setTimeout(initStartScreen, 100);
    }
  };

  initStartScreen();
}


// Initialize game with selected players and characters
function initGameWithSelections(activePlayers, playerSelections, confirmedSelections, characters) {
  //console.log('[MAIN] initGameWithSelections called');

  // Parameter validation
  if (!activePlayers || !playerSelections || !confirmedSelections || !characters) {
    console.error('[MAIN] Missing required parameters for game initialization');
    return;
  }

  // Hide start screen
  const startScreen = document.getElementById('startScreen');
  if (startScreen) {
    startScreen.style.display = 'none';
    //console.log('[MAIN] Start screen hidden');
  }

  // Setup canvas
  const canvas = document.getElementById("game");
  ctx = canvas.getContext("2d");
  window.ctx = ctx; // Also set window.ctx for compatibility

  // Initialize animation system first
  initializeAnimationSystem().then(() => {
    //console.log('[MAIN] Animation system initialized');

    // Initialize damage number manager
    if (window.damageNumberManager) {
      window.damageNumberManager.init(canvas);
    }

    // Initialize game state system
    window.gameState = new GameState();
    //console.log('[MAIN] Game state initialized');

    // Initialize camera controller for level system
    if (window.CameraController) {
      const canvas = document.getElementById("game");
      window.cameraController = new window.CameraController(canvas);
      console.log('[MAIN] Camera controller initialized');
    } else {
      console.warn('[MAIN] CameraController not available');
    }

    // Initialize level manager system (PHASE 1: Core Infrastructure)
    if (window.LevelManager) {
      window.levelManager = new window.LevelManager(
        window.gameState,
        window.animationSystem,
        window.combatResolver, // Combat system
        window.collisionSystem || {} // Collision system (fallback to empty object)
      );
      console.log('[MAIN] Level manager initialized');
    } else {
      console.warn('[MAIN] LevelManager not available, level system will not be initialized');
    }

    // Clear global arrays for backwards compatibility
    window.players = [];
    //console.log('[MAIN] window.players cleared and set to:', window.players);

    // Create players based on confirmed selections (sorted by player ID for consistent ordering)
    const selectedChars = Object.keys(playerSelections).sort((a, b) =>
      playerSelections[a] - playerSelections[b]
    );
    //console.log('[MAIN] Creating players for selectedChars:', selectedChars);

    selectedChars.forEach((charId, index) => {
      const char = characters.find(c => c.id === charId);
      const playerId = playerSelections[charId];
      const playerKey = `player${playerId}`;

      //console.log(`[MAIN] Creating player ${playerId} with key ${playerKey}, controls exist:`, !!window.controls[playerKey]);

      if (window.controls[playerKey]) {
        // Scale X positions for new canvas size (from 900 to 1920)
        const scaleFactor = CANVAS_WIDTH / 900; // ~2.13
        const baseX = 100 * scaleFactor; // ~213
        const spacing = 100 * scaleFactor; // ~213
        const x = baseX + (index * spacing);

        // Move entities higher up - responsive to canvas size
        const spawnY = Math.max(200, CANVAS_HEIGHT - 600); // Min 200px from top
        const player = new Player(window.controls[playerKey], x, spawnY, char.position, char.color, char.id);

        //console.log(`[MAIN] Player ${playerId} created:`, player);

        // Add to game state instead of directly to players
        window.gameState.addEntity(player, 'player');
        //console.log(`[MAIN] Player ${playerId} added to game state`);

        // Register player with animation system
        if (window.animationSystem && window.animationSystem.isInitialized) {
          const animation = window.animationSystem.registerEntity(player, 'knight');
          //console.log(`[MAIN] Player ${playerId} registered with animation system:`, animation ? 'SUCCESS' : 'FAILED');
          if (animation) {
            //console.log(`[MAIN] Player ${playerId} animation state:`, animation.getDebugInfo());
          }
        } else {
          console.warn(`[MAIN] Animation system not ready for player ${playerId}:`, {
            systemExists: !!window.animationSystem,
            isInitialized: window.animationSystem ? window.animationSystem.isInitialized : false
          });
        }

        // Initialize State Machine for player
        if (window.AnimationStateMachine) {
          player.stateMachine = new window.AnimationStateMachine(player);
          //console.log(`[MAIN] Player ${playerId} state machine initialized:`, player.stateMachine.getCurrentStateName());
        } else {
          //console.warn(`[MAIN] AnimationStateMachine not available for player ${playerId}`);
        }
      } else {
        //console.warn(`No controls found for player ${playerId} (${playerKey})`);
      }
    });

    // Initialize menu system
    if (window.initMenu) {
      window.initMenu();
    }

    // Set game state to playing
    window.gameStateString = 'playing';

    // Start game loop
    requestAnimationFrame(window.loop);

    // 1. Активирай camera following
    if (window.cameraController && window.gameState.players.length > 0) {
      window.cameraController.followEntity(window.gameState.players[0]);
      console.log('[TEST] Camera following player');
    }

    // 2. Зареди tutorial level
    if (window.levelManager) {
      window.levelManager.loadLevel('tutorial_1');
      console.log('[TEST] Loaded tutorial level with exit point');
    }

    // 3. Покажи debug информация
    setInterval(() => {
      if (window.levelManager?.exitPointManager) {
        console.log('Exit Points:', window.levelManager.exitPointManager.getDebugInfo());
      }
      if (window.levelManager?.triggerSpawner) {
        console.log('Triggers:', window.levelManager.triggerSpawner.getDebugInfo());
      }
    }, 5000);

    //console.log('[MAIN] Game initialization completed successfully');
  }).catch(error => {
    console.error('[MAIN] Failed to initialize animation system:', error);
  });
}

// Export function globally
window.initGameWithSelections = initGameWithSelections;
