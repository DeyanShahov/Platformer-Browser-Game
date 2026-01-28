### How to Extend the Procedural Generator for Incremental & Reset Enemy Waves  

Below is a concrete proposal that turns the current *single‑type* (blue‑slime) generation into a **progressive wave system**:

| Goal | Current behaviour | Desired behaviour |
|------|------------------|-------------------|
| **Add one more enemy each level** | `enemyCount = ((currentStage‑1) % 3) + 1` (1‑2‑3‑1‑2‑3…) | Keep the same arithmetic but **store a running total** so the next stage always gets +1 from the previous count, **resetting to 1 on every 3rd level**. |
| **Raise enemy level every 3 levels** | `enemyLevel = floor((currentStage‑1)/3) + 1` (stays constant for 3 stages, then +1) | Preserve this logic – it already gives the “+1 level every 3 stages” you want. |
| **Introduce elite & boss variants** | Only `blue_slime` is spawned | Spawn **elite** and **boss** enemies at the appropriate stages while still using the same count logic. |

---

#### 1️⃣  High‑level algorithm (pseudocode)

```js
generateStage(currentStage) {
    // ---- 1. LEVEL METADATA -------------------------------------------------
    const baseInfo = { ...window.ENDLESS_ARENA_TEMPLATE };
    baseInfo.id            = `endless_stage_${currentStage}`;
    baseInfo.name          = `Maximum Progress - Stage ${currentStage}`;
    baseInfo.exitPoints    = [];
    baseInfo.transitionMode= 'automatic';
    baseInfo.nextLevelId   = 'endless_next';

    // ---- 2. ENEMY LEVEL (increases every 3 stages) -----------------------
    const enemyLevel = Math.floor((currentStage - 1) / 3) + 1;

    // ---- 3. ENEMY COUNT (incremental, reset on every 3rd stage) ---------
    // totalEnemies so far = currentStage - 1
    // every 3rd stage we reset the *running* counter to 1,
    // but the *level* already grew, giving the intended difficulty bump.
    const resetEvery = 3;                         // every 3rd stage
    const runningCount = currentStage - 1;        // total enemies spawned up to now
    const enemyCount = (runningCount % resetEvery) === 0 ? 1 : 
                       ((runningCount - 1) % resetEvery) + 1;
    // The formula above yields: 1,2,3,1,2,3,… – exactly the “+1 each level,
    // reset to 1 on every 3rd stage” pattern.

    // ---- 4. SELECT ENEMY TYPE --------------------------------------------
    //   stage 1‑2   → basic blue_slime
    //   stage 3     → elite_slime
    //   stage 4‑5   → blue_slime
    //   stage 6     → boss_slime
    //   stage 7‑8   → blue_slime
    //   stage 9     → elite_slime, etc.
    const typeMap = {
        0: 'blue_slime',      // stage % 3 === 1  (1‑based: stages 1,4,7,…)
        1: 'elite_slime',     // stage % 3 === 2  (stages 2,5,8,…)
        2: 'boss_slime'       // stage % 3 === 0  (stages 3,6,9,…)
    };
    const enemyTypeKey = (currentStage - 1) % 3;          // 0,1,2 repeat
    const enemyType = {0:'blue_slime',1:'elite_slime',2:'boss_slime'}[enemyTypeKey];

    // ---- 5. CREATE ENTITIES -----------------------------------------------
    baseInfo.entities = [];
    for (let i = 0; i < enemyCount; i++) {
        baseInfo.entities.push({
            type: 'enemy',
            enemyType,                     // <-- dynamic type
            level: enemyLevel,
            spawnTrigger: 'immediate',
            randomPosition: true
        });
    }

    // ---- 6. COMPLETION CONDITIONS -----------------------------------------
    baseInfo.completionConditions = [{
        type: 'enemies_defeated',
        targetCount: enemyCount
    }];

    // ---- 7. RETURN ---------------------------------------------------------
    return baseInfo;
}
```

**What changes compared to the original file?**

1. **Dynamic enemy‑type selection** (`enemyType`) based on `stage % 3`.  
2. **Running‑count logic** that automatically increments and resets as described.  
3. **`enemyLevel`** is still calculated exactly as before – it will be one higher than the previous “reset” because it only advances every 3 stages.  
4. The rest of the returned object (`id`, `name`, `exitPoints`, `transitionMode`, etc.) stays untouched, so the existing `LevelManager` continues to work.

---

#### 2️⃣  Files that need to be created / edited  

| File | Purpose | Action |
|------|---------|--------|
| `Enemies/EnemyTypes/EliteSlime.js` | Sub‑class of `BlueSlime` with `rarity: 'elite'` and adjusted stats. | **Create** (copy `BlueSlime.js` and modify `config.rarity = 'elite'`, tweak `maxHealth`, `baseAttack`, etc.). |
| `Enemies/EnemyTypes/BossSlime.js` | Sub‑class of `BlueSlime` with `rarity: 'boss'`, higher HP/Attack and boss‑specific behavior flags. | **Create** (similar copy‑and‑modify). |
| `Enemies/EnemyFactory.js` (optional tweak) | Add factory helpers `createEliteSlime` and `createBossSlime`. | **Edit** (add two small wrapper functions). |
| `Level System/procedural_generator.js` | Replace the hard‑coded `enemyType: 'blue_slime'` with the dynamic `enemyType` logic shown above. | **Replace** the `generateStage` method with the new version. |
| `Behavior Tree/enemyAI_BT.js` (already provides universal BT) | No change needed, but we will use the existing `createUniversalEnemyBehaviorTree` function and pass the appropriate `rarity`/`intelligence` values when the AI system instantiates the enemy. | **Consume** – just ensure the enemy objects expose `rarity` and `intelligence` fields (they already do via the `config` we pass). |

---

#### 3️⃣  Verification Checklist  

| ✅ Done | ⬜ Pending |
|--------|-----------|
| Read `procedural_generator.js` – understood current logic. | Implement the new `enemyCount` / `enemyLevel` calculation. |
| Read `BlueSlime.js` – examined stats & AI config usage. | Create `EliteSlime.js` (extend `BlueSlime`). |
| Read `enemy_ai_config.js` – reviewed `ENEMY_BEHAVIORS` for `elite`/`boss`. | Create `BossSlime.js` (extend `BlueSlime`). |
| Read `enemyAI_BT.js` – confirmed universal BT can accept any rarity. | Add factory helpers to `EnemyFactory.js` (optional). |
| Listed `Enemies/EnemyTypes/` – only `BlueSlime.js` exists. | Update `procedural_generator.js` with the new generation logic. |
| Extracted the incremental‑with‑reset pattern. | Test generation for stages 1‑9 and verify enemy counts/types. |
| Drafted a high‑level algorithm. | Verify AI system loads the correct behavior tree for each new enemy type. |
| Prepared a verification checklist. | — |

---

#### 4️⃣  Next Steps (what we need to do)

1. **Create Elite & Boss enemy classes** – copy `BlueSlime.js` and adjust the config (`rarity`, `intelligence`, stats).  
2. **Add factory functions** (`createEliteSlime`, `createBossSlime`) to `EnemyFactory.js` so the generator can instantiate them.  
3. **Modify `procedural_generator.js`** with the algorithm above (dynamic `enemyType`, incremental count, level handling).  
4. **Run a quick sanity test** – generate configs for stages 1‑9 and log them; ensure the enemy count follows `1,2,3,1,2,3,…` and that the level increments every third stage.  
5. **Confirm AI integration** – make sure the AI system can resolve the new `enemyType` values into the appropriate behavior trees (the existing `createUniversalEnemyBehaviorTree` already supports `elite` and `boss` via `ENEMY_BEHAVIORS`).  

---

#### 5️⃣  What I need from you  

- **Do you want me to go ahead and create the `EliteSlime` and `BossSlime` classes now?**  
- **Should I also add the tiny factory helpers to `EnemyFactory.js`, or will you handle that later?**  
- **Any additional constraints** (e.g., specific stat values for elite/boss, or particular script IDs you want them to use)?

Once I have your go‑ahead, I’ll move to **Act mode** and start editing the files step‑by‑step, updating the task progress list after each successful change.

Добави и поясни коя част за какво е и защо е добавена. Какво може да се подобри и всичко друго което може да се допълни!