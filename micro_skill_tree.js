// ===========================================
// MICRO SKILL TREE UI FUNCTIONS
// ===========================================

// Micro skill tree state variables
let currentMicroSkillParent = null; // The parent ACTIVE skill
let microSkillCursorRow = 0;
let microSkillCursorCol = 0;

// Show micro skill tree for a specific ACTIVE skill
function showMicroTreeForSkill(skillType) {
  if (window.MenuSystem.currentSkillTreePlayer === null) return;

  const skillInfo = SKILL_TREE[skillType];
  if (!skillInfo.microTree) {
    console.error(`Skill ${skillType} has no micro tree defined`);
    return;
  }

  currentMicroSkillParent = skillType;

  // Update modal title
  document.getElementById('microTreeTitle').textContent = skillInfo.microTree.title;

  // Update system description
  const descriptionEl = document.getElementById('microTreeDescription');
  descriptionEl.textContent = getMicroTreeSystemDescription(skillInfo.microTree);

  // Reset micro cursor
  microSkillCursorRow = 0;
  microSkillCursorCol = 0;

  // Render micro skills
  renderMicroSkillTree();

  // Show modal
  document.getElementById('microTreeModal').style.display = 'flex';
  currentMenu = 'microTree';

  // Update cursor position
  setTimeout(() => {
    updateMicroCursorPosition();
  }, 0);

  // Setup input handling
  setupMicroSkillTreeInput();

  console.log(`Opened micro tree for skill: ${skillInfo.name}`);
}

// Hide micro skill tree modal
function hideMicroTree() {
  document.getElementById('microTreeModal').style.display = 'none';
  currentMenu = 'skills';
  currentMicroSkillParent = null;

  // Cleanup input handling
  cleanupMicroSkillTreeInput();

  console.log('Closed micro tree');
}

// Render micro skill tree grid
function renderMicroSkillTree() {
  if (!currentMicroSkillParent) return;

  const gridEl = document.getElementById('microSkillGrid');
  if (!gridEl) return;

  gridEl.innerHTML = '';

  const skillInfo = SKILL_TREE[currentMicroSkillParent];
  const microSkills = skillInfo.microTree.skills;

  // Create 3x4 grid (12 positions)
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      const skillIndex = row * 3 + col;
      const microSkillType = microSkills[skillIndex]; // SKILL_TYPES constant (string)
      const microSkill = SKILL_TREE[microSkillType]; // Actual skill object

      const skillIcon = document.createElement('div');
      skillIcon.className = 'micro-skill-icon';
      skillIcon.dataset.skillIndex = skillIndex;

      if (microSkill) {
        // Check selection status
        const isSelected = window.microSkillTreeManager.isMicroSkillSelected(window.MenuSystem.currentSkillTreePlayer, currentMicroSkillParent, skillIndex);
        const canSelect = window.microSkillTreeManager.canSelectMicroSkill(window.MenuSystem.currentSkillTreePlayer, currentMicroSkillParent, skillIndex);

        if (isSelected) {
          skillIcon.classList.add('unlocked'); // Green border like main skill tree
        } else if (canSelect) {
          skillIcon.classList.add('available');
        } else {
          skillIcon.classList.add('locked');
        }

        // Use CSS clipping to show the correct icon from sprite sheet
        const { x, y } = getIconPosition(microSkill.iconRow, microSkill.iconCol);

        skillIcon.innerHTML = `<img src="Assets/Swordsman-Skill-Icons.webp"
          style="
            width: 100%;
            height: 100%;
            object-fit: none;
            object-position: -${x}px -${y}px;
            border-radius: 6px;
          "
          onerror="this.style.display='none'; this.nextSibling.style.display='block';"
        ><div style="display:none; font-size:10px; text-align:center; color:yellow; line-height:64px;">${microSkill.iconRow}-${microSkill.iconCol}</div>`;
      } else {
        // Empty slot
        skillIcon.classList.add('locked');
        skillIcon.innerHTML = `<div style="width:100%; height:100%; background:#222; border-radius:4px;"></div>`;
      }

      gridEl.appendChild(skillIcon);
    }
  }

  // Update selected micro skill info
  updateSelectedMicroSkillInfo();
}

// Update micro skill cursor position
function updateMicroCursorPosition() {
  const cursorEl = document.getElementById('microSkillCursor');
  const leftPanelEl = document.getElementById('microTreeLeftPanel');

  if (!cursorEl || !leftPanelEl) return;

  // Find the currently selected micro skill icon by calculating its position in the grid
  const selectedIcon = document.querySelectorAll('.micro-skill-icon')[microSkillCursorRow * 3 + microSkillCursorCol];

  if (selectedIcon) {
    // Get positions relative to the left panel
    const iconRect = selectedIcon.getBoundingClientRect();
    const panelRect = leftPanelEl.getBoundingClientRect();

    // Calculate cursor position to center it over the icon
    const iconCenterX = iconRect.left + iconRect.width / 2 - panelRect.left;
    const iconCenterY = iconRect.top + iconRect.height / 2 - panelRect.top;

    // Position cursor so its center aligns with icon center
    // Micro cursor is 56x56px, so subtract 28px (half) from center
    const cursorX = iconCenterX - 33;
    const cursorY = iconCenterY - 31;

    cursorEl.style.left = `${cursorX}px`;
    cursorEl.style.top = `${cursorY}px`;
  }

  // Update selected class on micro skill icons
  document.querySelectorAll('.micro-skill-icon').forEach((icon, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    if (row === microSkillCursorRow && col === microSkillCursorCol) {
      icon.classList.add('selected');
    } else {
      icon.classList.remove('selected');
    }
  });
}

// Update selected micro skill info panel
function updateSelectedMicroSkillInfo() {
  if (!currentMicroSkillParent || window.MenuSystem.currentSkillTreePlayer === null) return;

  const player = window.players[window.MenuSystem.currentSkillTreePlayer];
  const parentSkillInfo = SKILL_TREE[currentMicroSkillParent];
  const microSkills = parentSkillInfo.microTree.skills;
  const skillIndex = microSkillCursorRow * 3 + microSkillCursorCol;
  const microSkillType = microSkills[skillIndex]; // SKILL_TYPES constant (string)
  const microSkill = SKILL_TREE[microSkillType]; // Actual skill object

  const nameEl = document.getElementById('microSkillInfoName');
  const requirementsEl = document.getElementById('microSkillRequirements');
  const selectBtn = document.getElementById('selectMicroSkillBtn');

  if (microSkill) {
    // Update skill name
    nameEl.textContent = microSkill.name;

    // Update requirements section with detailed information
    const prereqText = getMicroPrerequisitesDisplay(microSkill);

    // Resource cost (micro skills typically don't have resource costs)
    const resourceText = getMicroResourceDisplay(microSkill);

    // Skill point cost for micro skills (typically 1 point)
    const skillPointCost = getMicroSkillPointCost(parentSkillInfo.microTree);

    // Status (for micro skills, it's about selection availability)
    const statusText = window.microSkillTreeManager.getMicroSkillStatus(window.MenuSystem.currentSkillTreePlayer, currentMicroSkillParent, skillIndex);

    // Current Effect vs Next Effect display (for micro skills, current shows if selected, next shows the effect)
    const currentEffect = getMicroCurrentEffect(window.MenuSystem.currentSkillTreePlayer, currentMicroSkillParent, skillIndex, microSkill);
    const nextEffect = getMicroNextEffect(microSkill);

    const effectsHTML = `
      <div class="skill-effects">
        <div class="current-effect">
          <h4>Текущ ефект:</h4>
          <p>${currentEffect}</p>
        </div>
        <div class="next-effect">
          <h4>Ефект при избор:</h4>
          <p>${nextEffect}</p>
        </div>
      </div>
    `;

    const fullInfo = `
      <div id="microPrerequisites">Prerequisites: ${prereqText}</div>
      <div id="microResourceCost">Resource Cost: ${resourceText}</div>
      <div id="microSkillPointCost">Skill Points: ${skillPointCost}</div>
      <div id="microSkillStatus">${statusText}</div>
      ${effectsHTML}
    `;

    requirementsEl.innerHTML = fullInfo;

    // Update select button
    const canSelect = window.microSkillTreeManager.canSelectMicroSkill(window.MenuSystem.currentSkillTreePlayer, currentMicroSkillParent, skillIndex);
    selectBtn.style.display = canSelect ? 'block' : 'none';
    selectBtn.textContent = 'Избери микро умение';
    selectBtn.disabled = !canSelect;

  } else {
    // Empty slot
    nameEl.textContent = 'Празна позиция';
    requirementsEl.innerHTML = `
      <div id="microPrerequisites">Prerequisites: N/A</div>
      <div id="microResourceCost">Resource Cost: N/A</div>
      <div id="microSkillPointCost">Skill Points: N/A</div>
      <div id="microSkillStatus">Status: Empty slot</div>
    `;
    selectBtn.style.display = 'none';
  }
}

// ===========================================
// MICRO SKILL TREE HELPER FUNCTIONS
// ===========================================

// Helper function to get micro skill prerequisites display
function getMicroPrerequisitesDisplay(microSkill) {
  // Micro skills typically don't have prerequisites
  if (!microSkill.prerequisites || microSkill.prerequisites.length === 0) {
    return 'Няма';
  }

  return microSkill.prerequisites.map(prereq => {
    if (prereq.displayText) {
      return prereq.displayText;
    }

    // Generate display text based on prerequisite type
    switch (prereq.type) {
      case "skill_level":
        const skillName = SKILL_TREE[prereq.skill]?.name || prereq.skill;
        return `${skillName} (ниво ${prereq.level}+)`;

      case "player_level":
        return `Ниво на героя ${prereq.level}+`;

      case "quest_completed":
        return `Завършена мисия: ${prereq.questId}`;

      case "achievement_unlocked":
        return `Отключено постижение: ${prereq.achievementId}`;

      default:
        return `Неизвестно изискване: ${prereq.type}`;
    }
  }).join(', ');
}

// Helper function to get micro skill resource display
function getMicroResourceDisplay(microSkill) {
  // Micro skills typically don't have resource costs
  if (microSkill.resourceType === RESOURCE_TYPES.NONE || !microSkill.resourceType) {
    return 'None';
  } else if (microSkill.resourceType === RESOURCE_TYPES.MANA) {
    return `${microSkill.resourceCost} Mana`;
  } else if (microSkill.resourceType === RESOURCE_TYPES.ENERGY) {
    return `${microSkill.resourceCost} Energy`;
  }
  return 'Unknown';
}

// Helper function to get micro skill point cost
function getMicroSkillPointCost(microTree) {
  const system = microTree.progressionSystem;

  switch (system) {
    case 'one_per_row':
      return 1; // Costs 1 skill point per skill
    case 'absolute':
      return 1; // Costs 1 skill point per skill
    case 'level_based':
      return 0; // No skill points required
    case 'instant':
      return 0; // No skill points required
    default:
      return 1;
  }
}

// Helper function to get micro skill current effect
function getMicroCurrentEffect(playerIndex, parentSkillType, skillIndex, microSkill) {
  // Check if this micro skill is selected
  const isSelected = window.microSkillTreeManager.isMicroSkillSelected(playerIndex, parentSkillType, skillIndex);

  if (isSelected) {
    // Show the effect that's currently active
    if (microSkill.levelEffects && microSkill.levelEffects[0]) {
      const levelEffects = microSkill.levelEffects[0];
      if (Array.isArray(levelEffects)) {
        return levelEffects.map(effect => effect.description).join(', ');
      } else {
        return levelEffects.description;
      }
    }
  }

  return 'Не е избран';
}

// Helper function to get micro skill next effect
function getMicroNextEffect(microSkill) {
  // For micro skills, check if it's already selected (since they're single-level)
  const isSelected = window.microSkillTreeManager.isMicroSkillSelected(window.MenuSystem.currentSkillTreePlayer, currentMicroSkillParent, microSkillCursorRow * 3 + microSkillCursorCol);

  if (isSelected) {
    // Micro skills are single-level, so when selected, show "Максимално развитие"
    return 'Максимално развитие';
  }

  // Show the effect that will be applied when the micro skill is selected
  if (microSkill.levelEffects && microSkill.levelEffects[0]) {
    const levelEffects = microSkill.levelEffects[0];
    if (Array.isArray(levelEffects)) {
      // Multiple effects - show all descriptions
      return levelEffects.map(effect => effect.description).join(', ');
    } else {
      // Single effect
      return levelEffects.description;
    }
  }

  return microSkill.description || 'Няма ефект';
}

// Helper function to get micro tree system description
function getMicroTreeSystemDescription(microTree) {
  const system = microTree.progressionSystem;
  switch (system) {
    case 'one_per_row':
      return 'Тип на системата: One Per Row ( позволява се само един скил за развитие на ред )';
    case 'level_based':
      return 'Тип на системата: Level Based ( отключване при достигане на определено ниво )';
    case 'absolute':
      return 'Тип на системата: Absolute ( възможен е избор на всички скилове )';
    case 'instant':
      return 'Тип на системата: Instant ( директен избор без ограничения )';
    default:
      return 'Тип на системата: Неизвестен';
  }
}

// ===========================================
// MICRO SKILL TREE INPUT FUNCTIONS
// ===========================================

// Setup micro skill tree input handling
function setupMicroSkillTreeInput() {
  document.addEventListener('keydown', handleMicroSkillTreeKeyDown);
}

function cleanupMicroSkillTreeInput() {
  document.removeEventListener('keydown', handleMicroSkillTreeKeyDown);
}

// Move micro skill cursor
function moveMicroCursor(direction) {
  switch (direction) {
    case 'up':
      microSkillCursorRow = Math.max(0, microSkillCursorRow - 1);
      break;
    case 'down':
      microSkillCursorRow = Math.min(3, microSkillCursorRow + 1); // Changed from 2 to 3 (4 rows total: 0-3)
      break;
    case 'left':
      microSkillCursorCol = Math.max(0, microSkillCursorCol - 1);
      break;
    case 'right':
      microSkillCursorCol = Math.min(2, microSkillCursorCol + 1);
      break;
  }

  updateMicroCursorPosition();
  updateSelectedMicroSkillInfo();
}

// Handle micro skill tree keyboard input
function handleMicroSkillTreeKeyDown(e) {
  if (currentMenu !== 'microTree') return;

  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      e.preventDefault();
      moveMicroCursor('up');
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      e.preventDefault();
      moveMicroCursor('down');
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      e.preventDefault();
      moveMicroCursor('left');
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      e.preventDefault();
      moveMicroCursor('right');
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      handleSelectMicroSkillClick();
      break;
    case 'Escape':
      e.preventDefault();
      hideMicroTree();
      break;
  }
}

// Handle micro skill selection
function handleSelectMicroSkillClick() {
  if (!currentMicroSkillParent) return;

  const skillInfo = SKILL_TREE[currentMicroSkillParent];
  const microSkills = skillInfo.microTree.skills;
  const skillIndex = microSkillCursorRow * 3 + microSkillCursorCol;
  const microSkillType = microSkills[skillIndex];

  if (microSkillType) {
    // Try to select the micro skill
    const success = window.microSkillTreeManager.selectMicroSkill(window.MenuSystem.currentSkillTreePlayer, currentMicroSkillParent, skillIndex);

    if (success) {
      console.log(`Selected micro skill: ${microSkillType} for parent skill: ${skillInfo.name}`);
      // Re-render to show updated state
      renderMicroSkillTree();
    } else {
      console.log(`Failed to select micro skill: ${microSkillType}`);
    }
  }
}

// Make functions global
window.showMicroTreeForSkill = showMicroTreeForSkill;
window.hideMicroTree = hideMicroTree;
