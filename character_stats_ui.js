// Character Stats UI System for Platformer Game
// Manages the character statistics display interface

class CharacterStatsUI {
  constructor() {
    this.currentPlayerIndex = null;
  }

  // Get the HTML for the character stats menu (to be included in main menu)
  getMenuHTML() {
    return `
      <div id="characterStatsMenu" class="menu" style="display:none;">
        <div id="characterStatsContainer">
          <h2 id="characterStatsTitle">Статистики на героя</h2>

          <div id="characterStatsContent">
            <div id="characterPortraitSection">
              <div id="characterLargePortrait"></div>
              <div id="characterName">Име на героя</div>
            </div>

            <div id="characterStatsSection">
              <div id="characterBasicStats">
                <div class="stat-row">
                  <span class="stat-label">Ниво:</span>
                  <span id="characterLevel">1</span>
                </div>

                <div class="stat-row">
                  <span class="stat-label">Здраве:</span>
                  <div class="stat-bar">
                    <div id="healthBar" class="stat-bar-fill health-fill"></div>
                    <span id="healthText">100/100</span>
                  </div>
                </div>

                <div class="stat-row">
                  <span class="stat-label">Мана:</span>
                  <div class="stat-bar">
                    <div id="manaBar" class="stat-bar-fill mana-fill"></div>
                    <span id="manaText">30/30</span>
                  </div>
                </div>

                <div class="stat-row">
                  <span class="stat-label">Енергия:</span>
                  <div class="stat-bar">
                    <div id="energyBar" class="stat-bar-fill energy-fill"></div>
                    <span id="energyText">50/50</span>
                  </div>
                </div>

                <div class="stat-row">
                  <span class="stat-label">Опит:</span>
                  <div class="stat-bar">
                    <div id="experienceBar" class="stat-bar-fill experience-fill"></div>
                    <span id="experienceText">0/100</span>
                  </div>
                </div>
              </div>

            <div id="characterStatsFreePoints">
              <div id="freePointsDisplay">Свободни точки: <span id="freePointsValue">0</span></div>
            </div>

            <div id="characterAttributes">
              <h3>Основни характеристики</h3>
              <div class="attribute-row">
                <span class="attribute-label">Сила:</span>
                <span id="strengthValue">10</span>
                <button class="stat-btn stat-increase" onclick="window.characterStatsUI.increaseStrength()">+</button>
                <button class="stat-btn stat-decrease" onclick="window.characterStatsUI.decreaseStrength()">-</button>
              </div>
              <div class="attribute-row">
                <span class="attribute-label">Бързина:</span>
                <span id="speedValue">10</span>
                <button class="stat-btn stat-increase" onclick="window.characterStatsUI.increaseSpeed()">+</button>
                <button class="stat-btn stat-decrease" onclick="window.characterStatsUI.decreaseSpeed()">-</button>
              </div>
              <div class="attribute-row">
                <span class="attribute-label">Интелект:</span>
                <span id="intelligenceValue">10</span>
                <button class="stat-btn stat-increase" onclick="window.characterStatsUI.increaseIntelligence()">+</button>
                <button class="stat-btn stat-decrease" onclick="window.characterStatsUI.decreaseIntelligence()">-</button>
              </div>
            </div>

            <div id="characterCombatStats">
              <h3>Бойни характеристики</h3>
              <div class="attribute-row">
                <span class="attribute-label">Атака:</span>
                <span id="baseAttackValue">5</span>
              </div>
              <div class="attribute-row">
                <span class="attribute-label">Защита:</span>
                <span id="baseDefenseValue">0</span>
              </div>
              <div class="attribute-row">
                <span class="attribute-label">Критичен удар:</span>
                <span id="criticalChanceValue">10%</span>
              </div>
              <div class="attribute-row">
                <span class="attribute-label">Шанс за удар:</span>
                <span id="hitChanceValue">95%</span>
              </div>
              <div class="attribute-row">
                <span class="attribute-label">Шанс за отбягване:</span>
                <span id="dodgeChanceValue">5%</span>
              </div>
              <div class="attribute-row">
                <span class="attribute-label">Шанс за блок:</span>
                <span id="blockChanceValue">5%</span>
              </div>
            </div>

            <div id="characterMagicResistances">
              <h3>Магически резистанси</h3>
              <div class="resistance-row">
                <div class="resistance-item">
                  <span class="resistance-label">Вода:</span>
                  <span id="waterResistanceValue">0%</span>
                </div>
                <div class="resistance-item">
                  <span class="resistance-label">Огън:</span>
                  <span id="fireResistanceValue">0%</span>
                </div>
              </div>
              <div class="resistance-row">
                <div class="resistance-item">
                  <span class="resistance-label">Въздух:</span>
                  <span id="airResistanceValue">0%</span>
                </div>
                <div class="resistance-item">
                  <span class="resistance-label">Земя:</span>
                  <span id="earthResistanceValue">0%</span>
                </div>
              </div>
            </div>

            <div id="characterSkills">
              <h3>Умения на героя</h3>
              <div id="skillsList">
                <div class="skill-category">
                  <h4>Основни атаки</h4>
                  <div class="skill-item" data-skill="basic_attack_light">
                    <span class="skill-status"></span>
                    <span class="skill-name">Лека основна атака</span>
                  </div>
                  <div class="skill-item" data-skill="basic_attack_medium">
                    <span class="skill-status"></span>
                    <span class="skill-name">Средна основна атака</span>
                  </div>
                  <div class="skill-item" data-skill="basic_attack_heavy">
                    <span class="skill-status"></span>
                    <span class="skill-name">Тежка основна атака</span>
                  </div>
                </div>

                <div class="skill-category">
                  <h4>Допълнителни атаки</h4>
                  <div class="skill-item" data-skill="secondary_attack_light">
                    <span class="skill-status"></span>
                    <span class="skill-name">Лека допълнителна атака</span>
                  </div>
                  <div class="skill-item" data-skill="secondary_attack_medium">
                    <span class="skill-status"></span>
                    <span class="skill-name">Средна допълнителна атака</span>
                  </div>
                  <div class="skill-item" data-skill="secondary_attack_heavy">
                    <span class="skill-status"></span>
                    <span class="skill-name">Тежка допълнителна атака</span>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Show character stats for a specific player
  showForPlayer(playerIndex) {
    if (playerIndex < 0 || playerIndex >= window.gameState.players.length) {
      console.log(`[CHARACTER STATS] Invalid player index: ${playerIndex}`);
      return;
    }

    this.currentPlayerIndex = playerIndex;
    const player = window.gameState.players[playerIndex];

    // Update title
    const titleEl = document.getElementById('characterStatsTitle');
    titleEl.textContent = `Статистики на героя - Играч ${playerIndex + 1}`;

    // Update character info
    this.updateCharacterDisplay(player);

    // Show menu
    menuActive = true;
    currentMenu = 'characterStats';
    document.getElementById('gameMenu').style.display = 'flex';
    document.getElementById('characterStatsMenu').style.display = 'block';
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('controlsMenu').style.display = 'none';
    document.getElementById('skillTreeMenu').style.display = 'none';

    console.log(`[CHARACTER STATS] Show completed for player ${playerIndex + 1}`);
  }

  // Hide character stats menu
  hide() {
    this.currentPlayerIndex = null;
    menuActive = false;
    currentMenu = 'main';
    document.getElementById('gameMenu').style.display = 'none';
    document.getElementById('characterStatsMenu').style.display = 'none';
    console.log(`[CHARACTER STATS] Hide completed`);
  }

  // Update the character display with current player data
  updateCharacterDisplay(player) {
    if (!player.characterInfo) {
      console.error('Player does not have characterInfo!');
      return;
    }

    const info = player.characterInfo;

    // Update portrait (large colored square for now)
    const portraitEl = document.getElementById('characterLargePortrait');
    portraitEl.style.backgroundColor = player.color;
    portraitEl.style.width = '120px';
    portraitEl.style.height = '120px';
    portraitEl.style.borderRadius = '10px';
    portraitEl.style.margin = '0 auto 20px';
    portraitEl.style.border = '3px solid #fff';

    // Update name
    document.getElementById('characterName').textContent = info.getDisplayName();

    // Update level
    document.getElementById('characterLevel').textContent = info.level;

    // Update health bar
    const healthPercent = (player.health / player.maxHealth) * 100;
    document.getElementById('healthBar').style.width = `${healthPercent}%`;
    document.getElementById('healthText').textContent = `${player.health}/${player.maxHealth}`;

    // Update mana bar
    const manaPercent = (player.mana / player.maxMana) * 100;
    document.getElementById('manaBar').style.width = `${manaPercent}%`;
    document.getElementById('manaText').textContent = `${player.mana}/${player.maxMana}`;

    // Update energy bar
    const energyPercent = (player.energy / player.maxEnergy) * 100;
    document.getElementById('energyBar').style.width = `${energyPercent}%`;
    document.getElementById('energyText').textContent = `${player.energy}/${player.maxEnergy}`;

    // Update experience bar
    const expPercent = this.getExperiencePercentage(info);
    document.getElementById('experienceBar').style.width = `${expPercent}%`;
    document.getElementById('experienceText').textContent = `${info.experience}/${info.experienceToNext}`;

    // Update free points
    document.getElementById('freePointsValue').textContent = info.freePoints;

    // Update main attributes
    document.getElementById('strengthValue').textContent = info.strength;
    document.getElementById('speedValue').textContent = info.speed;
    document.getElementById('intelligenceValue').textContent = info.intelligence;

    // Update combat attributes (attack reads from player for dynamic skill updates, others from characterInfo)
    document.getElementById('baseAttackValue').textContent = player.baseAttack; // Динамично от пасивни умения
    document.getElementById('baseDefenseValue').textContent = info.baseDefense;
    document.getElementById('criticalChanceValue').textContent = this.getCriticalChanceDisplay(info);

    // Update new combat chances (read from characterInfo for dynamic skill updates)
    document.getElementById('hitChanceValue').textContent = `${Math.round(info.hitChance * 100)}%`;
    document.getElementById('dodgeChanceValue').textContent = `${Math.round(info.dodgeChance * 100)}%`;
    document.getElementById('blockChanceValue').textContent = `${Math.round(info.blockChance * 100)}%`;

    // Update magic resistances
    const resistances = this.getMagicResistanceDisplay(info);
    document.getElementById('waterResistanceValue').textContent = resistances.water;
    document.getElementById('fireResistanceValue').textContent = resistances.fire;
    document.getElementById('airResistanceValue').textContent = resistances.air;
    document.getElementById('earthResistanceValue').textContent = resistances.earth;

    // Update skills list
    this.updateSkillsDisplay(player);
  }

  // UI interaction methods - now delegate to character logic
  increaseStrength() {
    if (this.currentPlayerIndex !== null) {
      const player = window.gameState.players[this.currentPlayerIndex];
      if (player && player.characterInfo) {
        player.characterInfo.modifyStrength(1);
        this.updateCharacterDisplay(player);
      }
    }
  }

  decreaseStrength() {
    if (this.currentPlayerIndex !== null) {
      const player = window.gameState.players[this.currentPlayerIndex];
      if (player && player.characterInfo) {
        player.characterInfo.modifyStrength(-1);
        this.updateCharacterDisplay(player);
      }
    }
  }

  increaseSpeed() {
    if (this.currentPlayerIndex !== null) {
      const player = window.gameState.players[this.currentPlayerIndex];
      if (player && player.characterInfo) {
        player.characterInfo.modifySpeed(1);
        this.updateCharacterDisplay(player);
      }
    }
  }

  decreaseSpeed() {
    if (this.currentPlayerIndex !== null) {
      const player = window.gameState.players[this.currentPlayerIndex];
      if (player && player.characterInfo) {
        player.characterInfo.modifySpeed(-1);
        this.updateCharacterDisplay(player);
      }
    }
  }

  increaseIntelligence() {
    if (this.currentPlayerIndex !== null) {
      const player = window.gameState.players[this.currentPlayerIndex];
      if (player && player.characterInfo) {
        player.characterInfo.modifyIntelligence(1);
        this.updateCharacterDisplay(player);
      }
    }
  }

  decreaseIntelligence() {
    if (this.currentPlayerIndex !== null) {
      const player = window.gameState.players[this.currentPlayerIndex];
      if (player && player.characterInfo) {
        player.characterInfo.modifyIntelligence(-1);
        this.updateCharacterDisplay(player);
      }
    }
  }

  // Update skills display for the player
  updateSkillsDisplay(player) {
    const skillItems = document.querySelectorAll('.skill-item');

    skillItems.forEach(item => {
      const skillType = item.dataset.skill;
      const statusEl = item.querySelector('.skill-status');

      if (player.unlockedSkills.has(skillType)) {
        // Skill is unlocked
        statusEl.textContent = '✅';
        statusEl.style.color = '#00ff00';
        item.classList.add('skill-unlocked');
        item.classList.remove('skill-locked', 'skill-available');
      } else if (window.skillTreeManager.canUnlockSkill(player, skillType)) {
        // Skill is available to unlock
        statusEl.textContent = '🔓';
        statusEl.style.color = '#0088ff';
        item.classList.add('skill-available');
        item.classList.remove('skill-unlocked', 'skill-locked');
      } else {
        // Skill is locked
        statusEl.textContent = '🔒';
        statusEl.style.color = '#666666';
        item.classList.add('skill-locked');
        item.classList.remove('skill-unlocked', 'skill-available');
      }
    });
  }

  // Refresh the display (call this when stats change)
  refreshDisplay() {
    if (this.currentPlayerIndex !== null) {
      const player = window.gameState.players[this.currentPlayerIndex];
      if (player) {
        this.updateCharacterDisplay(player);
      }
    }
  }

  // Get formatted stats for UI display (moved from character_info.js)
  getFormattedStats(characterInfo) {
    return {
      level: characterInfo.level,
      experience: characterInfo.experience,
      experienceToNext: characterInfo.experienceToNext,
      experiencePercentage: this.getExperiencePercentage(characterInfo),
      freePoints: characterInfo.freePoints,
      strength: characterInfo.strength,
      speed: characterInfo.speed,
      intelligence: characterInfo.intelligence,
      baseAttack: characterInfo.baseAttack,
      baseDefense: characterInfo.baseDefense,
      criticalChance: Math.round(characterInfo.criticalChance * 100), // Convert to percentage
      magicResistance: { ...characterInfo.magicResistance }
    };
  }

  // Get experience percentage for UI (moved from character_info.js)
  getExperiencePercentage(characterInfo) {
    return (characterInfo.experience / characterInfo.experienceToNext) * 100;
  }

  // Get critical chance as formatted string (moved from character_info.js)
  getCriticalChanceDisplay(characterInfo) {
    return `${Math.round(characterInfo.criticalChance * 100)}%`;
  }

  // Get magic resistance as formatted strings (moved from character_info.js)
  getMagicResistanceDisplay(characterInfo) {
    return {
      water: `${characterInfo.magicResistance.water}%`,
      fire: `${characterInfo.magicResistance.fire}%`,
      air: `${characterInfo.magicResistance.air}%`,
      earth: `${characterInfo.magicResistance.earth}%`
    };
  }
}

// Global character stats UI instance
window.characterStatsUI = new CharacterStatsUI();
