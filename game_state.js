/* =========================
   GAME STATE MANAGEMENT SYSTEM
   Entity management + Game lifecycle states
   ========================= */

// Game State Enum - Controls game pause/resume behavior
const GAME_STATE = {
  CHARACTER_SELECTION: 'character_selection',  // Character select screen - FULL PAUSE
  PLAYING: 'playing',                          // Active gameplay - NO PAUSE
  PAUSED: 'paused',                           // Game paused (ESC menu) - FULL PAUSE
  MENU: 'menu',                               // In-game menus (skill tree) - UI PAUSE
  GAME_OVER: 'game_over'                      // Game over screen - FULL PAUSE
};

// Current game state - starts with character selection
window.currentGameState = GAME_STATE.CHARACTER_SELECTION;

// Game state transition functions
window.setGameState = function(newState, context = '') {
  const oldState = window.currentGameState;
  window.currentGameState = newState;

  console.log(`[GAME_STATE] ${oldState} → ${newState}${context ? ` (${context})` : ''}`);

  // Execute state-specific logic
  onGameStateChanged(oldState, newState);
};

// State change handler - executes appropriate logic for state transitions
function onGameStateChanged(oldState, newState) {
  switch(newState) {
    case GAME_STATE.CHARACTER_SELECTION:
      // Ensure no entities exist during character selection
      if (window.gameState) {
        console.log('[GAME_STATE] Clearing entities during character selection');
        window.gameState.clear();
      }
      // Stop any running game loop during character selection
      console.log('[GAME_STATE] Stopping game loop during character selection');
      window.gameLoopRunning = false;
      // Yellow log for pause start
      console.log('%c[PAUSE] Game paused: CHARACTER_SELECTION', 'color: #ffaa00; font-weight: bold; font-size: 16px;');
      break;

    case GAME_STATE.PLAYING:
      // Game is now active - entities can be updated
      console.log('[GAME_STATE] Game started - entities active');
      // Yellow log for pause stop
      console.log('%c[RESUME] Game resumed: PLAYING', 'color: #ffaa00; font-weight: bold; font-size: 16px;');
      break;

    case GAME_STATE.PAUSED:
      // Full pause - no entity updates
      console.log('[GAME_STATE] Game paused - entities frozen');
      // Yellow log for pause start
      console.log('%c[PAUSE] Game paused: PAUSED', 'color: #ffaa00; font-weight: bold; font-size: 16px;');
      break;

    case GAME_STATE.MENU:
      // UI pause - menus active, game entities may still animate
      console.log('[GAME_STATE] Menu opened - UI active, entities may update');
      // Yellow log for pause start (partial pause)
      console.log('%c[PAUSE] Game paused: MENU (partial)', 'color: #ffaa00; font-weight: bold; font-size: 16px;');
      break;

    case GAME_STATE.GAME_OVER:
      // Game over - full pause
      console.log('[GAME_STATE] Game over - entities frozen');
      // Yellow log for pause start
      console.log('%c[PAUSE] Game paused: GAME_OVER', 'color: #ffaa00; font-weight: bold; font-size: 16px;');
      break;
  }
}

// Pause logic based on current game state
window.shouldPauseGame = function() {
  switch(window.currentGameState) {
    case GAME_STATE.CHARACTER_SELECTION:
    case GAME_STATE.PAUSED:
    case GAME_STATE.GAME_OVER:
      return true; // Full pause - no updates

    case GAME_STATE.MENU:
      return false; // Allow some updates (menu animations)

    case GAME_STATE.PLAYING:
    default:
      return false; // Normal gameplay
  }
};

// Export game state enum for use in other files
window.GAME_STATE = GAME_STATE;

// Game State Management System
// Manages all entities on screen for a given level/game state

class GameState {
  constructor() {
    this.entities = new Map(); // Map с ID -> entity за бърз достъп
    this.players = []; // Списък с играчи (за backwards compatibility)
    this.nextEntityId = 1;
  }

  // Добавяне на елемент
  addEntity(entity, type = 'neutral') {
    const id = this.nextEntityId++;
    entity.id = id;
    entity.entityType = type;
    this.entities.set(id, entity);

    // Специална обработка за играчи
    if (type === 'player') {
      this.players.push(entity);
    }

    //console.log(`[GAME_STATE] Added ${type} entity with ID ${id}`);
    return id;
  }

  // Премахване на елемент
  removeEntity(entityId) {
    const entity = this.entities.get(entityId);
    if (entity) {
      // Специална обработка за играчи
      if (entity.entityType === 'player') {
        const index = this.players.indexOf(entity);
        if (index > -1) this.players.splice(index, 1);
      }

      this.entities.delete(entityId);
      console.log(`[GAME_STATE] Removed ${entity.entityType} entity with ID ${entityId}`);
      return true;
    }
    console.warn(`[GAME_STATE] Entity with ID ${entityId} not found`);
    return false;
  }

  // Взимане на елемент по ID
  getEntity(entityId) {
    return this.entities.get(entityId);
  }

  // Взимане на елементи по тип
  getEntitiesByType(type) {
    return Array.from(this.entities.values()).filter(e => e.entityType === type);
  }

  // Взимане на всички елементи за рендеринг
  getAllEntities() {
    return Array.from(this.entities.values());
  }

  // Проверка дали елемент съществува
  hasEntity(entityId) {
    return this.entities.has(entityId);
  }

  // Намиране на елемент по референция
  getEntityId(entity) {
    for (const [id, e] of this.entities) {
      if (e === entity) return id;
    }
    return null;
  }

  // Получаване на брой елементи по тип
  getEntityCount(type = null) {
    if (type) {
      return this.getEntitiesByType(type).length;
    }
    return this.entities.size;
  }

  // Debug информация
  getDebugInfo() {
    const types = {};
    for (const entity of this.entities.values()) {
      const type = entity.entityType || 'unknown';
      types[type] = (types[type] || 0) + 1;
    }

    return {
      totalEntities: this.entities.size,
      byType: types,
      playersCount: this.players.length
    };
  }

  // Почистване на всички елементи
  clear() {
    this.entities.clear();
    this.players = [];
    this.nextEntityId = 1;
    console.log('[GAME_STATE] All entities cleared');
  }
}

// Global instance
window.GameState = GameState;
