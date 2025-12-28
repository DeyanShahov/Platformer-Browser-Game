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
