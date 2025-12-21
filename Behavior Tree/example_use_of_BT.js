/* =========================
   EXAMPLE USAGE (converted to window globals)
   ========================= */

/* =========================
   HELPER: Създаване на Skeleton контекст
   ========================= */
function createSkeletonContext({ rarity, intelligence }) {
  const ctx = {
    name: `Skeleton_${rarity}_${intelligence}`,
    rarity,
    intelligence,
    self: { hp: 1000, maxHp: 1000 },
    targets: [], // ще се зададат по-късно
    capabilities: { canBlock: true, canEvade: true },
    attackProfile: createAttackProfile(["light", "medium", "heavy"]),
    intelligence: { blockChance: 0.5, evadeChance: 0.3, aggression: 0.5 },
    behaviors: ENEMY_BEHAVIORS[rarity][intelligence],
    phaseSpecialAvailable: true,
    command: null,
  };

  // Ако е бос – добавяме BossPhaseManager
  if (rarity === "boss") {
    ctx.bossPhaseManager = new BossPhaseManager();
  }

  // Създаваме Behavior Tree
  ctx.behaviorTree = createEnemyBehaviorTree();

  return ctx;
}

/* =========================
   Примерни цели (играчи)
   ========================= */
const players = [
  { name: "Player1", distance: 150, hpPercent: 100 },
  { name: "Player2", distance: 250, hpPercent: 80 },
  { name: "Player3", distance: 400, hpPercent: 50 },
  { name: "Player4", distance: 100, hpPercent: 20 },
];

/* =========================
   Създаваме 6 типа скелети
   ========================= */
const enemies = [
  createSkeletonContext({ rarity: "common", intelligence: "basic" }),
  createSkeletonContext({ rarity: "common", intelligence: "normal" }),
  createSkeletonContext({ rarity: "elite", intelligence: "normal" }),
  createSkeletonContext({ rarity: "elite", intelligence: "advanced" }),
  createSkeletonContext({ rarity: "boss", intelligence: "basic" }),
  createSkeletonContext({ rarity: "boss", intelligence: "advanced" }),
];

/* =========================
   Задаваме targets (играчи) на всички врагове
   ========================= */
enemies.forEach(e => {
  e.targets = players;
});

/* =========================
   Tick & командна симулация за всеки враг
   ========================= */
enemies.forEach(enemy => {
  // Ако е бос, обновяваме фазата преди tick
  if (enemy.rarity === "boss" && enemy.bossPhaseManager) {
    enemy.bossPhaseManager.update(enemy);
  }

  const command = tickEnemyAI(enemy.behaviorTree, enemy);
  console.log(`${enemy.name} command:`, command);
});

/* =========================
   Какво се случва:
   - Всеки враг избира цел според soft target selection
   - AI-то проверява дали може да evade/block
   - Атакува ако target е в range
   - Използва special атака ако е налична
   - Движи се (chase/patrol) ако няма target в range
   - Босовете сменят фаза според HP
   ========================= */
