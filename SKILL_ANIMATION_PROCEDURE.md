# Процедура за Добавяне на Анимация към Skill

## Преглед

Този документ описва стъпка по стъпка процедурата за добавяне на нова анимация към съществуващ skill в играта. Процедурата е създадена въз основа на опита с добавянето на ATTACK_2 анимацията към SECONDARY_ATTACK_LIGHT skill.

## Animation Completion Systems

Играта използва две системи за определяне кога анимация е завършила и FSM трябва да transition-ва към следващо състояние. Изборът на система зависи от типа анимация.

### Frame-Based Completion (За Attack Анимации)

**Използва се за:** Всички attack анимации (ATTACK_1, ATTACK_2, ATTACK_3, RUN_ATTACK)

**Принцип:** Анимацията завършва когато текущият кадър достигне последния кадър от анимацията.

**Предимства:**
- Надеждно - няма floating point precision проблеми
- Консистентно с визуалната анимация
- Лесно за debug и тестване

**Имплементация:**
```javascript
update(entity, dt) {
  // ... skip justEntered check

  // Check if animation has completed (frame-based)
  const currentFrame = entity.animation ? entity.animation.currentFrame : 0;
  const totalFrames = entity.animation?.animationDefinition?.frames || 0;

  if (currentFrame >= totalFrames - 1) { // Последен кадър (0-indexed)
    // Reset damage dealt flag
    entity.damageDealt = false;

    // Transition to movement state
    if (this.hasMovementInput(entity)) {
      return 'walking';
    } else {
      return 'idle';
    }
  }
}
```

**Пример:** ATTACK_3 има 4 кадъра, completion се случва на `currentFrame >= 3` (кадър 3 е последен).

### Physics-Based Completion (За Movement Анимации)

**Използва се за:** Jumping анимации и други physics-driven анимации

**Принцип:** Анимацията завършва когато physics условие е изпълнено (незавимо от време или кадри).

**Предимства:**
- Physics-driven логика
- Може да продължи по-дълго от анимацията ако е необходимо
- Реалистично поведение

**Имплементация:**
```javascript
update(entity, dt) {
  // Check physics condition
  if (entity.onGround) { // Landing detection
    // Transition to movement state
    if (this.hasMovementInput(entity)) {
      return 'walking';
    } else {
      return 'idle';
    }
  }
}
```

**Пример:** Jumping анимация продължава докато `entity.onGround` стане `true`, дори ако анимацията е свършила визуално.

### ❌ Time-Based Completion (Deprecated)

**НЕ ИЗПОЛЗВАЙТЕ!**

**Принцип:** Анимацията завършва когато `animationTime >= duration`

**Проблеми:**
- Floating point precision errors (0.799999999 >= 0.8 → false)
- Играта може да замръзне на последния кадър
- Ненадеждно поведение

```javascript
// НЕ ИЗПОЛЗВАЙТЕ ТОВА!
if (entity.animation.animationTime >= entity.animation.animationDefinition.duration) {
  // Risk of floating point precision bugs
}
```

**Кога коя система да използвате:**
- **Frame-Based:** За attack анимации с фиксиран брой кадри
- **Physics-Based:** За movement анимации зависещи от physics състояние
- **Time-Based:** Никога (deprecated поради floating point проблеми)

## Предварителни Изисквания

### 1. Анимационни файлове
- PNG sprite sheet файл в `Knight_1/` папката
- Файлът трябва да има формат `Knight_1/[AnimationName].png`
- Използвайте reference HTML файла `knight_walk_animation.html` за тестване на анимацията

### 2. Skill дефиниция
- Skill-ът трябва да съществува в `data/skill-data.js`
- Skill-ът трябва да има подходящи `executionTime`, `cooldownTime` и други свойства

### 3. Анимационни константи
- Добавете нова константа в `ANIMATION_TYPES` в `constants.js` или `animation_data.js`

## Стъпка 1: Дефиниране на Анимацията в `Animation System/animation_data.js`

### Основна структура на анимационна дефиниция:

```javascript
[ANIMATION_TYPES.YOUR_ANIMATION]: {
  spriteSheet: './Knight_1/[YourAnimationFile].png',
  frames: [NUMBER_OF_FRAMES],           // Брой кадри в анимацията (от reference HTML)
  frameWidth: 120,                      // Ширина на един кадър (обикновено 120)
  frameHeight: 128,                     // Височина на един кадър (обикновено 128)
  frameStarts: [0, 128, 256, ...],      // Начало на всеки кадър (умножено по 128)
  duration: [TOTAL_DURATION],            // Обща продължителност в секунди
  frameDurations: [0.15, 0.15, ...],    // Продължителност на всеки кадър
  frameData: [                           // Per-frame collision data
    // Frame 0
    {
      hitBox: { x: 100, y: 0, width: 120, height: 260 },
      attackBox: null  // null за кадри без атака
    },
    // Frame 1
    {
      hitBox: { x: 100, y: 0, width: 120, height: 260 },
      attackBox: null
    },
    // Frame 2 - Attack frame
    {
      hitBox: { x: 100, y: 0, width: 120, height: 260 },
      attackBox: {
        x: -278,           // Offset от дясната страна на entity
        yRatio: 0.5,       // Y позиция като ratio от entity височина
        width: 218,        // Ширина на attack box
        heightRatio: 0.52  // Височина като ratio от entity височина
      }
    },
    // ... повторете за всеки кадър
  ],
  loop: false,     // false за attack анимации
  keyframe: 'static-1-frame'
}
```

### Важни параметри:

#### `frames`
- Брой кадри в анимацията
- Проверете в `knight_walk_animation.html` reference файла

#### `frameStarts`
- Масив с начални позиции на всеки кадър
- Формула: `[0, 128, 256, 384, ...]` (умножено по 128)
- Дължина на масива трябва да е равна на `frames`

#### `duration` и `frameDurations`
- `duration`: Сума от всички `frameDurations`
- `frameDurations`: Масив с продължителността на всеки кадър в секунди
- Пример: `[0.15, 0.15, 0.15, 0.35]` за 4 кадъра

#### `frameData`
- Масив с collision data за всеки кадър
- Дължина трябва да съответства на `frames`
- `hitBox`: Collision box на героя за този кадър
- `attackBox`: Attack box ако кадърът атакува, `null` ако не

#### Attack Box Properties:
```javascript
attackBox: {
  x: -278,           // Negative = наляво от entity, positive = надясно
  yRatio: 0.5,       // 0.5 = център по височина
  width: 218,        // Ширина в пиксели
  heightRatio: 0.52  // 0.52 = 52% от entity височината
}
```

### Пример за ATTACK_2:

```javascript
[ANIMATION_TYPES.ATTACK_2]: {
  spriteSheet: './Knight_1/Attack 2.png',
  frames: 4,
  frameWidth: 120,
  frameHeight: 128,
  frameStarts: [0, 128, 256, 384],
  duration: 0.8,
  frameDurations: [0.15, 0.15, 0.15, 0.35],
  frameData: [
    // Frame 0 - Wind up
    {
      hitBox: { x: 160, y: 0, width: 120, height: 260 },
      attackBox: null
    },
    // Frame 1 - Swing start
    {
      hitBox: { x: 160, y: 0, width: 120, height: 260 },
      attackBox: null
    },
    // Frame 2 - Attack frame
    {
      hitBox: { x: 160, y: 0, width: 120, height: 260 },
      attackBox: {
        x: -218,
        yRatio: 0.5,
        width: 218,
        heightRatio: 0.52
      }
    },
    // Frame 3 - Attack frame
    {
      hitBox: { x: 160, y: 0, width: 120, height: 260 },
      attackBox: {
        x: -218,
        yRatio: 0.5,
        width: 218,
        heightRatio: 0.52
      }
    }
  ],
  loop: false,
  keyframe: 'static-1-frame'
}
```

## Стъпка 2: Добавяне на Анимационна Константа

В `constants.js` или `Animation System/animation_data.js`:

```javascript
const ANIMATION_TYPES = {
  // ... съществуващи
  YOUR_ANIMATION: 'your_animation_name',
};
```

## Стъпка 3: Промени в Animation State Machine (`Animation System/animation_state_machine.js`)

### За Attack Skills:
Добавете нов state class:

```javascript
class YourAttackState extends AnimationState {
  constructor() {
    super('your_attack_state_name');
  }

  enter(entity) {
    super.enter(entity);
    entity.animation.setAnimation(window.ANIMATION_TYPES.YOUR_ANIMATION, true);
    entity.damageDealt = false; // ВАЖНО: Reset damage flag
  }

  update(entity, dt) {
    if (this.justEntered) {
      this.justEntered = false;
      return null;
    }

    if (entity.animation && entity.animation.animationTime >= entity.animation.animationDefinition.duration) {
      if (this.hasMovementInput(entity)) {
        return 'walking';
      } else {
        return 'idle';
      }
    }
  }

  handleAction(entity, actionType) {
    // Prevent interrupting attack
    return null;
  }
}
```

### Регистрирайте state-а:
```javascript
this.addState('your_attack_state_name', YourAttackState);
```

### Добавете към IdleState.handleAction():
```javascript
case 'your_skill_type':
  return 'your_attack_state_name';
```

## Стъпка 4: Промени в Animation System (`Animation System/animation_system.js`)

В `onEntityAction()` метода:

```javascript
case window.SKILL_TYPES?.YOUR_SKILL:
  animationType = window.ANIMATION_TYPES?.YOUR_ANIMATION;
  break;
```

## Стъпка 5: Промени в Entity Animation (`Animation System/entity_animation.js`)

В `updateMovementAnimation()` метода:

```javascript
case window.SKILL_TYPES?.YOUR_SKILL:
  newAnimation = window.ANIMATION_TYPES?.YOUR_ANIMATION;
  break;
```

## Стъпка 6: Промени в Game Input (`game.js`)

### За нов бутон:
В `handleKeyboardInput()`:

```javascript
if (keys[controls.yourButton] && player.stateMachine && !player.stateMachine.isInAttackState()) {
  logAction(0, 'клавиатура', controls.yourButton.toUpperCase(), 'your_skill_type');
  player.stateMachine.handleAction('your_skill_type');
}
```

### За съществуващ бутон:
Променете съществуващия mapping:

```javascript
// Променете от:
player.stateMachine.handleAction('old_skill_type');
// На:
player.stateMachine.handleAction('your_skill_type');
```

## Стъпка 7: Промени в ANIMATION_PRIORITIES (`Animation System/animation_data.js`)

```javascript
const ANIMATION_PRIORITIES = {
  // ... съществуващи
  [ANIMATION_TYPES.YOUR_ANIMATION]: 80, // Same as attacks
};
```

## Стъпка 8: Тестване

### Debug режим:
- Натиснете клавиша за debug mode в играта
- Вижте червените attack boxes
- Проверете дали се появяват на правилните кадри

### Collision тестване:
- Поставете enemy близо до героя
- Изпълнете атаката
- Проверете дали enemy получава damage

## Често Срещани Грешки и Решения

### 1. Attack box не се появява
**Симптоми:** Няма червен outline при атака
**Решение:** Проверете дали `frameData` има `attackBox` на правилните кадри

### 2. Attack box има отрицателна ширина
**Симптоми:** Collision не работи, attack box изглежда странно
**Решение:** Проверете `attackBox.width` да е положително число

### 3. Повторни атаки не работят
**Симптоми:** Първата атака работи, следващите не
**Решение:** Уверете се че FSM state има `entity.damageDealt = false;` в `enter()` метода

### 4. Грешен state transition
**Симптоми:** Героят не се връща в idle/walking след анимация
**Решение:** Проверете `update()` метода на state-а да проверява `animationTime >= duration`

### 5. Wrong button mapping
**Симптоми:** Грешен бутон задейства анимацията
**Решение:** Проверете `game.js` input handling и `controls` mapping

## Полезни Tools и Resources

### Reference HTML
Използвайте `knight_walk_animation.html` за:
- Преброяване на кадри в анимацията
- Определяне на подходящи `duration` и `frameDurations`
- Визуално тестване на анимацията

### Debug Commands
```javascript
// В browser console:
window.animationSystem.toggleDebug(); // Show animation info
// Натиснете D за debug boxes
```

### Animation Calculator
За изчисляване на `frameStarts`:
```javascript
// За 4 кадъра: [0, 128, 256, 384]
// Формула: кадър_номер * 128
```

## Пълна Checklist за Добавяне на Анимация

- [ ] PNG файл в `Knight_1/` папката
- [ ] `ANIMATION_TYPES` константа добавена
- [ ] Анимационна дефиниция в `animation_data.js`
- [ ] FSM State class създаден
- [ ] State регистриран в AnimationStateMachine
- [ ] IdleState.handleAction() обновен
- [ ] Animation System `onEntityAction()` обновен
- [ ] Entity Animation `updateMovementAnimation()` обновен
- [ ] Game.js input handling обновен
- [ ] ANIMATION_PRIORITIES обновен
- [ ] DamageDealt flag reset-нат в FSM state
- [ ] Тестване на анимацията
- [ ] Тестване на collision detection
- [ ] Тестване на повторни атаки

## Примери

### Добавяне на ATTACK_3 анимация към BASIC_ATTACK_MEDIUM:

1. **animation_data.js**: Добавете `ATTACK_3` дефиниция
2. **FSM**: `AttackMediumState` вече съществува и използва `ATTACK_3`
3. **Animation System**: Добавете case за `BASIC_ATTACK_MEDIUM`
4. **Entity Animation**: Добавете case за `BASIC_ATTACK_MEDIUM`
5. **Game.js**: W бутонът вече е map-нат към `attack_medium`

### Добавяне на нова анимация към нов skill:

1. **Skill Data**: Добавете skill в `data/skill-data.js`
2. **Animation Data**: Добавете анимационна дефиниция
3. **FSM**: Създайте нов state class
4. **Всички mapping файлове**: Добавете cases за новия skill
5. **Input**: Добавете бутон mapping

## Заключение

Добавянето на анимация към skill изисква промени в 6+ файла и внимателно конфигуриране на collision data. Следвайте checklist-а и тествайте всяка стъпка. Използвайте ATTACK_2 като reference пример за правилна имплементация.
