# Skill Tree System Documentation

## 🎯 Преглед
Тази документация описва цялостната skill tree система на платформър играта, включително текущата имплементация, механики и предложения за развитие.

## 📊 Текуща Архитектура

### 1. Data Layer (`skills.js`)
**Основни компоненти:**
- `SKILL_TYPES` - Константи за всички типове умения
- `SKILL_TREE` - Основен обект с дефинициите на уменията
- `SkillTreeManager` - Клас за управление на логика

**Структура на умение:**
```javascript
{
  name: "Име на умението",
  description: "Описание",
  damageModifier: 1.0,           // Множител за щета
  damageType: DAMAGE_TYPES.PHYSICAL,
  rangeType: RANGE_TYPES.MELEE,
  targetType: TARGET_TYPES.SINGLE_TARGET,
  unlocked: true/false,          // Първоначално отключено
  prerequisites: [],             // Зависими умения
  skillPointsCost: 1,            // Цена в skill points
  resourceType: RESOURCE_TYPES.MANA,
  resourceCost: 10,              // Цена в ресурси
  iconRow: 1, iconCol: 1,        // Позиция в sprite sheet
  // Leveling система
  maxLevel: 3,
  levelCosts: [1, 1, 2],
  levelEffects: [...]
}
```

**Типове умения:**
- **Основни атаки**: Лека/Средна/Тежка основна атака
- **Допълнителни атаки**: Лека/Средна/Тежка допълнителна атака
- **Пасивни**: Засилена атака (постоянни бонуси)

### 2. Icon System (`load_skill_icon.js`)
**Спецификации:**
- Sprite sheet: `Assets/Swordsman-Skill-Icons.webp`
- Размери: 5 реда × 10 колони
- Icon размер: 64×64 пиксела
- Margin: 30px, Spacing: 25px (между редове), 1px (между колони)

**Функции:**
- `getIconPosition(row, col)` - Изчислява позиция в sprite sheet
- `loadSkillIcon(row, col)` - Зарежда icon като canvas елемент

### 3. UI Visualization (`menu.js`)
**Layout:**
- **Split Container**: Лява панел (grid) + Дясна панел (детайли)
- **Grid**: 6×5 (30 позиции) за уменията
- **Cursor**: Жълта рамка с glow ефект за навигация

**Навигация:**
- WASD/Стрелки за движение
- Enter/Space за unlock
- Escape за затваряне

**Визуални състояния:**
- 🔓 **Available**: Син цвят - може да се отключи
- ✅ **Unlocked**: Зелен цвят - отключено
- 🔒 **Locked**: Сив цвят - заключено

**Skill Info Panel:**
- Име и описание
- Prerequisites
- Resource costs
- Skill points cost
- Status (Available/Locked/Unlocked)
- Unlock/Upgrade бутон

### 4. Game Integration (`game.js`)
**Контроли:**
- Player 1: Клавиш `5`
- Player 2: Клавиш `6`
- Player 3: Клавиш `7`
- Player 4: Клавиш `8`

**Особености:**
- Паузира играта при отворено меню
- Индивидуални skill trees за всеки играч
- Debounce защита срещу бързо превключване

### 5. Styling (`styles.css`)
**Основни класове:**
- `#skillTreeMenu` - Главен контейнер
- `#skillGrid` - Grid с 5 колони × 6 реда
- `.skill-icon` - Индивидуални icons (64×64px)
- `.skill-cursor` - Курсор за навигация
- `.unlocked/.available/.locked` - Състояния на уменията

## 🎮 Механики

### Unlocking System
1. **Prerequisites Check**: Проверка на зависими умения
2. **Skill Points**: Необходими skill points
3. **Resource Costs**: Mana/Energy за използване
4. **Leveling**: Progressive upgrade система

### Resource System
- **Mana**: За магически умения
- **Energy**: За физически умения
- **None**: Без ресурсни изисквания

### Combat Integration
- Уменията се интегрират с combat система
- Damage modifiers се прилагат към базовата атака
- Passive effects се прилагат постоянно

## 🚀 Предложения за Развитие

### 1. 🔗 Връзки между уменията (Connection Lines)
**Цел:** Визуални линии свързващи prerequisites
**Имплементация:**
- SVG paths между свързани умения
- Различни цветове за различни типове връзки
- Анимирани линии при unlock
- Curved connections за по-добра визуализация

### 2. 📈 Прогресивни визуали (Progressive Visuals)
**Цел:** Skill paths, branches и special effects
**Функционалности:**
- Branching visualization за различни development paths
- Progress indicators за skill progression
- Visual feedback за skill dependencies
- Dynamic highlighting на available paths

### 3. 🎨 Подобрени анимации (Enhanced Animations)
**Цел:** Hover effects и unlock animations
**Ефекти:**
- Smooth hover transitions
- Unlock animations с particle effects
- Cursor movement animations
- State transition animations (locked→available→unlocked)

### 4. 📱 По-добра responsive дизайн (Better Responsive Design)
**Цел:** Поддръжка за различни екрани
**Подобрения:**
- Mobile-friendly touch controls
- Adaptive layout за tablets и phones
- Scalable UI elements
- Touch gestures за navigation

### 5. 🔍 Детайлни tooltips (Detailed Tooltips)
**Цел:** Повече информация при hover
**Функционалности:**
- Extended skill descriptions
- Prerequisite chains visualization
- Resource cost breakdowns
- Level progression details
- Combat stat previews

### 6. 🎪 Специални ефекти (Special Effects)
**Цел:** Particles и glows за unlocked skills
**Ефекти:**
- Particle systems за unlock animations
- Glow effects за available/highlighted skills
- Screen effects за major unlocks
- Visual feedback за skill activation

### 7. 🗺️ Skill Paths (Skill Paths)
**Цел:** Визуални пътеки за различни класове/специализации
**Имплементация:**
- Warrior Path (физически damage focus)
- Mage Path (магически damage focus)
- Hybrid Path (балансирани умения)
- Visual path indicators и color coding
- Path progression tracking

### 8. 🎯 Smart Layout System
**Цел:** Динамично позициониране
**Функционалности:**
- Auto-arrangement базирано на prerequisites
- Branching visualization
- Zoom и pan за големи trees
- Minimap за навигация

### 9. 📱 Enhanced UI/UX
**Цел:** По-добра използваемост
**Подобрения:**
- Drag & drop за планиране
- Quick unlock за multiple skills
- Search и filter функции
- Keyboard shortcuts
- Mobile touch support

### 10. 🎪 Special Effects & Feedback
**Цел:** По-имерсивно преживяване
**Идеи:**
- Sound effects при unlock
- Screen shake за важни unlocks
- Achievement notifications
- Skill preview animations

### 11. 🔧 Advanced Features
**Цел:** Допълнителна функционалност
**Функции:**
- Skill reset/respec система
- Temporary skill boosts
- Skill combinations
- Cross-class skills

## 🛠️ Технически Подробности

### File Structure
```
data/
└── skill-data.js      - Static skill definitions and constants

skills.js              - Skill tree logic (SkillTreeManager)
load_skill_icon.js     - Icon loading utilities
menu.js                - UI implementation
game.js                - Game integration

css/
├── styles.css         - Основни стилове (game, menus, character stats)
└── skill-tree.css     - Skill tree специфични стилове

js_platformer_z_depth_demo.html - HTML с линкове към CSS и JS файлове
```

### Key Classes & Functions
- `SkillTreeManager` - Core logic
- `showSkillTreeForPlayer()` - Menu display
- `renderSkillTree()` - Grid rendering
- `updateSelectedSkillInfo()` - Info panel updates

### Current Limitations
1. **Static Grid**: Няма dynamic layout
2. **No Connections**: Липсват визуални връзки
3. **Basic Styling**: Ограничени visual effects
4. **Few Skills**: Повечето са placeholder
5. **No Animations**: Static presentation

## 🎯 Roadmap за Развитие

### ✅ Phase 0: Level Indicators (COMPLETED)
- [x] Добави level indicators на skill icons (current/max format)
- [x] Поддръжка за leveling и non-leveling skills
- [x] CSS styling за top-right corner positioning
- [x] Dynamic updates при unlock/upgrade

### ✅ Phase 0.5: Current vs Next Effect Display (COMPLETED)
- [x] Имплементирай Current Effect vs Next Effect система
- [x] Зелен box за текущи ефекти, син за следващи
- [x] Автоматично изчисляване на кумулативни ефекти
- [x] Поддръжка за leveling и non-leveling skills
- [x] Правилно показване за locked, available, max level състояния

### ✅ Phase 0.6: Dynamic Skill Point Costs (COMPLETED)
- [x] Премахни статичната skillPointsCost от всички skills
- [x] Добави levelCosts array за всички skills (non-leveling = [cost])
- [x] Създай getSkillPointCost() функция за динамично изчисляване
- [x] Обнови UI да показва "Нужни точки за развитие: X"
- [x] Правилни цени за leveling skills (levelCosts[currentLevel])

### Phase 1: Core Improvements
- [ ] Добави connection lines
- [ ] Подобри visual feedback
- [ ] Добави hover effects

### Phase 2: Advanced Features
- [ ] Имплементирай skill paths
- [ ] Добави animations
- [ ] Подобри responsive design

### Phase 3: Polish & UX
- [ ] Добави search/filter
- [ ] Имплементирай drag & drop
- [ ] Добави sound effects

### Phase 4: Advanced Systems
- [ ] Skill respec система
- [ ] Temporary boosts
- [ ] Cross-class combinations

## 📝 Implementation Notes

### Connection Lines Implementation
```javascript
function drawConnectionLines(canvas, skills, prerequisites) {
  // Calculate positions
  // Draw curved SVG paths
  // Apply animations
}
```

### Skill Path System
```javascript
const SKILL_PATHS = {
  WARRIOR: ['basic_attack_light', 'basic_attack_medium', ...],
  MAGE: ['secondary_attack_light', 'secondary_attack_medium', ...],
  HYBRID: ['enhanced_attack', ...]
};
```

### Animation System
```javascript
function playUnlockAnimation(skillElement) {
  // Particle effects
  // Glow animations
  // Sound playback
}
```

---

**Последна актуализация:** 12/10/2025
**Версия:** 1.0
**Статус:** Active Development
