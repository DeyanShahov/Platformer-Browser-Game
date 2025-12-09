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

    // Combat attributes (base values)
    this.baseAttack = 5;
    this.baseDefense = 0;
    this.criticalChance = 0.10; // 10%

    // Magic resistances (0-100%)
    this.magicResistance = {
      water: 0,
      fire: 0,
      air: 0,
      earth: 0
    };

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
  addExperience(amount) {
    this.experience += amount;
    console.log(`${this.getDisplayName()} получи ${amount} опит. Общо: ${this.experience}`);

    // Check for level up
    while (this.experience >= this.experienceToNext) {
      this.levelUp();
    }
  }

  // Level up the character
  levelUp() {
    this.experience -= this.experienceToNext;
    this.level++;
    this.experienceToNext = this.calculateExperienceToNext();

    // Auto-increase main stats by 1 each
    this.strength += 1;
    this.speed += 1;
    this.intelligence += 1;

    // Give 5 free points for manual distribution
    this.freePoints += 5;

    console.log(`${this.getDisplayName()} се изкачи до ниво ${this.level}!`);
    console.log(`Автоматично увеличение - Сила: ${this.strength}, Бързина: ${this.speed}, Интелект: ${this.intelligence}`);
    console.log(`Свободни точки за разпределение: ${this.freePoints}`);
  }

  // Get total stat points available
  getTotalStatPoints() {
    return this.strength + this.speed + this.intelligence;
  }

  // Get experience percentage for UI
  getExperiencePercentage() {
    return (this.experience / this.experienceToNext) * 100;
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

  // Get formatted stats for UI (updated to include new attributes)
  getFormattedStats() {
    return {
      level: this.level,
      experience: this.experience,
      experienceToNext: this.experienceToNext,
      experiencePercentage: this.getExperiencePercentage(),
      freePoints: this.freePoints,
      strength: this.strength,
      speed: this.speed,
      intelligence: this.intelligence,
      baseAttack: this.baseAttack,
      baseDefense: this.baseDefense,
      criticalChance: Math.round(this.criticalChance * 100), // Convert to percentage
      magicResistance: { ...this.magicResistance }
    };
  }

  // Get critical chance as formatted string
  getCriticalChanceDisplay() {
    return `${Math.round(this.criticalChance * 100)}%`;
  }

  // Get magic resistance as formatted strings
  getMagicResistanceDisplay() {
    return {
      water: `${this.magicResistance.water}%`,
      fire: `${this.magicResistance.fire}%`,
      air: `${this.magicResistance.air}%`,
      earth: `${this.magicResistance.earth}%`
    };
  }
}

// Export for use in other files
window.CharacterInfo = CharacterInfo;
