// Character Info System for Platformer Game
// Manages character statistics, level, and experience

class CharacterInfo {
  constructor(characterId) {
    this.characterId = characterId; // 'blue', 'orange', 'green', 'red'

    // Basic info
    this.level = 1;
    this.experience = 0;
    this.experienceToNext = this.calculateExperienceToNext();

    // Main stats (can be upgraded, start with 10 points each)
    this.strength = 10;
    this.speed = 10;
    this.intelligence = 10;

    // Free points available for manual distribution
    this.freePoints = 0;

    // Initialize combat attributes using the combat system
    if (window.combatAttributes) {
      window.combatAttributes.initializeForCharacter(this);
    }

    // Display names for characters
    this.displayNames = {
      'blue': 'Син герой',
      'orange': 'Оранжев герой',
      'green': 'Зелен герой',
      'red': 'Червен герой'
    };
  }

  getDisplayName() {
    return this.displayNames[this.characterId] || this.characterId;
  }

  // Calculate experience needed for next level (increases with level)
  calculateExperienceToNext() {
    return this.level * 100; // Simple formula: level * 100 XP
  }

  // Add experience and check for level up
  addExperience(amount, player = null) {
    this.experience += amount;
    console.log(`${this.getDisplayName()} получи ${amount} опит. Общо: ${this.experience}`);

    // Check for level up
    while (this.experience >= this.experienceToNext) {
      this.levelUp(player);
    }
  }

  // Level up the character
  levelUp(player = null) {
    this.experience -= this.experienceToNext;
    this.level++;
    this.experienceToNext = this.calculateExperienceToNext();

    // Auto-increase main stats by 1 each
    this.strength += 1;
    this.speed += 1;
    this.intelligence += 1;

    // Give 5 free points for manual distribution (stats)
    this.freePoints += 5;

    // Give 2 skill points for unlocking abilities
    if (player) {
      player.skillPoints += 2;
      console.log(`${this.getDisplayName()} получи 2 точки за умения! Общо: ${player.skillPoints}`);
    }

    // Restore all resources to 100% on level up
    if (player) {
      player.health = player.maxHealth;
      player.mana = player.maxMana;
      player.energy = player.maxEnergy;
      console.log(`${this.getDisplayName()} - Ресурсите са възстановени до 100%!`);
    }

    console.log(`${this.getDisplayName()} се изкачи до ниво ${this.level}!`);
    console.log(`Автоматично увеличение - Сила: ${this.strength}, Бързина: ${this.speed}, Интелект: ${this.intelligence}`);
    console.log(`Свободни точки за разпределение: ${this.freePoints}`);
  }

  // Get total stat points available
  getTotalStatPoints() {
    return this.strength + this.speed + this.intelligence;
  }

  // Manual point distribution methods
  increaseStrength() {
    if (this.freePoints > 0) {
      this.strength += 1;
      this.freePoints -= 1;
      return true;
    }
    return false;
  }

  decreaseStrength() {
    // Allow decreasing back to the auto-level minimum
    const minStrength = 10 + this.level - 1; // Base 10 + auto increases
    if (this.strength > minStrength) {
      this.strength -= 1;
      this.freePoints += 1;
      return true;
    }
    return false;
  }

  increaseSpeed() {
    if (this.freePoints > 0) {
      this.speed += 1;
      this.freePoints -= 1;
      return true;
    }
    return false;
  }

  decreaseSpeed() {
    const minSpeed = 10 + this.level - 1;
    if (this.speed > minSpeed) {
      this.speed -= 1;
      this.freePoints += 1;
      return true;
    }
    return false;
  }

  increaseIntelligence() {
    if (this.freePoints > 0) {
      this.intelligence += 1;
      this.freePoints -= 1;
      return true;
    }
    return false;
  }

  decreaseIntelligence() {
    const minIntelligence = 10 + this.level - 1;
    if (this.intelligence > minIntelligence) {
      this.intelligence -= 1;
      this.freePoints += 1;
      return true;
    }
    return false;
  }

  // UI interaction methods - moved from character_stats_ui.js
  modifyStrength(amount) {
    if (amount > 0 && this.freePoints > 0) {
      this.strength += amount;
      this.freePoints -= amount;
      return true;
    } else if (amount < 0) {
      const minStrength = 10 + this.level - 1;
      if (this.strength > minStrength) {
        this.strength += amount; // amount is negative
        this.freePoints -= amount; // subtracting negative = adding
        return true;
      }
    }
    return false;
  }

  modifySpeed(amount) {
    if (amount > 0 && this.freePoints > 0) {
      this.speed += amount;
      this.freePoints -= amount;
      return true;
    } else if (amount < 0) {
      const minSpeed = 10 + this.level - 1;
      if (this.speed > minSpeed) {
        this.speed += amount;
        this.freePoints -= amount;
        return true;
      }
    }
    return false;
  }

  modifyIntelligence(amount) {
    if (amount > 0 && this.freePoints > 0) {
      this.intelligence += amount;
      this.freePoints -= amount;
      return true;
    } else if (amount < 0) {
      const minIntelligence = 10 + this.level - 1;
      if (this.intelligence > minIntelligence) {
        this.intelligence += amount;
        this.freePoints -= amount;
        return true;
      }
    }
    return false;
  }
}

// Export for use in other files
window.CharacterInfo = CharacterInfo;
