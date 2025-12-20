// Resource Manager System for Platformer Game
// Implements Resource Manager Pattern with Observer Pattern for UI updates
// Centralizes all resource operations (health, mana, energy) for players and enemies

class ResourceManager {
  constructor(entity) {
    this.entity = entity;
    this.listeners = []; // UI update listeners

    // Resource types
    this.RESOURCE_TYPES = {
      HEALTH: 'health',
      MANA: 'mana',
      ENERGY: 'energy'
    };

    // Regeneration rates (per second)
    this.regenerationRates = {
      [this.RESOURCE_TYPES.HEALTH]: 0,    // No auto regen for health
      [this.RESOURCE_TYPES.MANA]: 2,      // 2 mana per second
      [this.RESOURCE_TYPES.ENERGY]: 5     // 5 energy per second
    };

    // Bind methods
    this.modifyResource = this.modifyResource.bind(this);
    this.canAfford = this.canAfford.bind(this);
    this.getResource = this.getResource.bind(this);
    this.getMaxResource = this.getMaxResource.bind(this);
    this.addListener = this.addListener.bind(this);
    this.removeListener = this.removeListener.bind(this);
    this.notifyListeners = this.notifyListeners.bind(this);
    this.updateRegeneration = this.updateRegeneration.bind(this);
  }

  // Add UI listener for resource updates
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Remove UI listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // Notify all listeners about resource changes
  notifyListeners(resourceType, oldValue, newValue) {
    this.listeners.forEach(callback => {
      try {
        callback(resourceType, oldValue, newValue, this.entity);
      } catch (error) {
        console.error('[RESOURCE MANAGER] Listener error:', error);
      }
    });
  }

  // Get current resource value
  getResource(resourceType) {
    switch (resourceType) {
      case this.RESOURCE_TYPES.HEALTH:
        return this.entity.health || 0;
      case this.RESOURCE_TYPES.MANA:
        // Check both player and characterInfo for mana
        return this.entity.mana || (this.entity.characterInfo && this.entity.characterInfo.mana) || 0;
      case this.RESOURCE_TYPES.ENERGY:
        // Check both player and characterInfo for energy
        return this.entity.energy || (this.entity.characterInfo && this.entity.characterInfo.energy) || 0;
      default:
        console.warn(`[RESOURCE MANAGER] Unknown resource type: ${resourceType}`);
        return 0;
    }
  }

  // Get maximum resource value
  getMaxResource(resourceType) {
    switch (resourceType) {
      case this.RESOURCE_TYPES.HEALTH:
        return this.entity.maxHealth || 100;
      case this.RESOURCE_TYPES.MANA:
        return this.entity.maxMana || 30;
      case this.RESOURCE_TYPES.ENERGY:
        return this.entity.maxEnergy || 50;
      default:
        console.warn(`[RESOURCE MANAGER] Unknown resource type: ${resourceType}`);
        return 100;
    }
  }

  // Check if entity can afford resource cost
  canAfford(resourceType, cost) {
    const current = this.getResource(resourceType);
    return current >= cost;
  }

  // Modify resource value (positive = increase, negative = decrease)
  modifyResource(resourceType, amount, reason = 'unknown') {
    const oldValue = this.getResource(resourceType);
    let newValue = oldValue + amount;

    // Clamp to valid range
    const maxValue = this.getMaxResource(resourceType);
    newValue = Math.max(0, Math.min(maxValue, newValue));

    // Apply the change
    switch (resourceType) {
      case this.RESOURCE_TYPES.HEALTH:
        this.entity.health = newValue;
        break;
      case this.RESOURCE_TYPES.MANA:
        // Update both player and characterInfo
        this.entity.mana = newValue;
        if (this.entity.characterInfo) {
          this.entity.characterInfo.mana = newValue;
        }
        break;
      case this.RESOURCE_TYPES.ENERGY:
        // Update both player and characterInfo
        this.entity.energy = newValue;
        if (this.entity.characterInfo) {
          this.entity.characterInfo.energy = newValue;
        }
        break;
      default:
        console.warn(`[RESOURCE MANAGER] Unknown resource type: ${resourceType}`);
        return false;
    }

    // Log the change
    //console.log(`[RESOURCE MANAGER] ${this.entity.characterInfo?.getDisplayName() || 'Entity'} ${resourceType}: ${oldValue} → ${newValue} (${amount > 0 ? '+' : ''}${amount}) [${reason}]`);

    // Notify listeners (UI updates)
    this.notifyListeners(resourceType, oldValue, newValue);

    return true;
  }

  // Set resource to specific value
  setResource(resourceType, value, reason = 'set') {
    const oldValue = this.getResource(resourceType);
    const maxValue = this.getMaxResource(resourceType);
    const clampedValue = Math.max(0, Math.min(maxValue, value));

    return this.modifyResource(resourceType, clampedValue - oldValue, reason);
  }

  // Restore resource to maximum
  restoreResource(resourceType, reason = 'restore') {
    const maxValue = this.getMaxResource(resourceType);
    return this.setResource(resourceType, maxValue, reason);
  }

  // Consume resources for skill usage
  consumeSkillResources(skillType) {
    const skillInfo = window.skillTreeManager ? window.skillTreeManager.getSkillInfo(skillType) : null;
    if (!skillInfo) {
      console.warn(`[RESOURCE MANAGER] No skill info for ${skillType}`);
      return false;
    }

    const resourceType = skillInfo.resourceType;
    const resourceCost = skillInfo.resourceCost || 0;

    if (!resourceType || resourceCost <= 0) {
      return true; // No cost to consume
    }

    if (!this.canAfford(resourceType, resourceCost)) {
      console.log(`[RESOURCE MANAGER] Cannot afford ${skillType} (${this.getResource(resourceType)}/${resourceCost} ${resourceType})`);
      return false;
    }

    // Convert resource type string to our constants
    let internalResourceType;
    switch (resourceType) {
      case 'mana':
        internalResourceType = this.RESOURCE_TYPES.MANA;
        break;
      case 'energy':
        internalResourceType = this.RESOURCE_TYPES.ENERGY;
        break;
      default:
        console.warn(`[RESOURCE MANAGER] Unknown skill resource type: ${resourceType}`);
        return false;
    }

    return this.modifyResource(internalResourceType, -resourceCost, `skill_${skillType}`);
  }

  // Update regeneration (call this every frame)
  updateRegeneration(dt) {
    // Only regenerate for players, not enemies
    if (this.entity.entityType === 'enemy') {
      return;
    }

    Object.entries(this.regenerationRates).forEach(([resourceType, ratePerSecond]) => {
      if (ratePerSecond > 0) {
        const current = this.getResource(resourceType);
        const max = this.getMaxResource(resourceType);

        // Only regenerate if not at max
        if (current < max) {
          const regenAmount = ratePerSecond * dt;
          this.modifyResource(resourceType, regenAmount, 'regeneration');
        }
      }
    });
  }

  // Get resource percentage (0-100)
  getResourcePercentage(resourceType) {
    const current = this.getResource(resourceType);
    const max = this.getMaxResource(resourceType);
    return max > 0 ? (current / max) * 100 : 0;
  }

  // Check if resource is at maximum
  isResourceFull(resourceType) {
    return this.getResource(resourceType) >= this.getMaxResource(resourceType);
  }

  // Get formatted resource string (e.g., "30/50")
  getResourceString(resourceType) {
    const current = Math.round(this.getResource(resourceType));
    const max = Math.round(this.getMaxResource(resourceType));
    return `${current}/${max}`;
  }
}

// Global resource manager instances
window.resourceManagers = new Map(); // entity -> ResourceManager

// Helper function to get or create resource manager for entity
function getResourceManager(entity) {
  if (!window.resourceManagers.has(entity)) {
    const manager = new ResourceManager(entity);
    window.resourceManagers.set(entity, manager);

    // Add UI listener for players
    if (entity.entityType !== 'enemy' && window.characterStatsUI) {
      manager.addListener((resourceType, oldValue, newValue, entity) => {
        // Trigger UI refresh if character stats menu is open
        if (window.characterStatsUI.currentPlayerIndex !== null) {
          const currentPlayer = window.players[window.characterStatsUI.currentPlayerIndex];
          if (currentPlayer === entity) {
            window.characterStatsUI.refreshDisplay();
          }
        }
      });
    }
  }

  return window.resourceManagers.get(entity);
}

// Cleanup function for removed entities
function removeResourceManager(entity) {
  window.resourceManagers.delete(entity);
}

// Global exports
window.ResourceManager = ResourceManager;
window.getResourceManager = getResourceManager;
window.removeResourceManager = removeResourceManager;
