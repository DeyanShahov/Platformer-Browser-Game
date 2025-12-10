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

    console.log(`[GAME_STATE] Added ${type} entity with ID ${id}`);
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
