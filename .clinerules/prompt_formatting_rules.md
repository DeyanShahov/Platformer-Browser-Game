```markdown
# Prompt Formatting Rules for Cline AI Agent

This document defines the automatic formatting behavior for Cline when processing user requests. These rules ensure all requests are transformed into protocol-compliant format before being processed by the AI engine.

## 📌 Core Processing Rules

### 1. Automatic Structure Application
When a raw request is received:
- **Always apply** the RPG Problem-Solving Protocol structure
- **Never require** user confirmation for formatting
- **Process immediately** without intermediate steps

### 2. Context Extraction Logic
Cline must automatically extract these elements from raw prompts:

| Element | Extraction Method | Required Project Knowledge |
|---------|-------------------|----------------------------|
| Problem Statement | Identify core issue + desired outcome | `platformer-game-memory.jsonl` |
| Required Context | Infer files/systems based on project structure | `PROJECT_FILE_GUIDE.md` |
| Expected Output Format | Determine from request type (code, analysis, etc.) | Project architecture knowledge |

### 3. Task Progress Tracking
- **Always generate** a task progress checklist with:
  - Initial step marked as `[x]`
  - Remaining steps marked as `[ ]`
  - Clear next steps indicated

## 🧪 Example Transformation

**Raw User Request:**
```

Искам да анализирам системата за бой в моя проект. В момента е доста елементарна и има нужда от подобрение.

```javascript

**Cline's Internal Processing:**
1. Extracts problem statement from raw text
2. Infers context using project knowledge:
   - `Combat System/combat_calculator.js` (primary focus)
   - `combat_resolver.js` (related system)
   - `enemy_combat.js` (complementary module)
3. Determines expected output format based on request type (analysis)
4. Generates task progress tracking

**Formatted Output:**
```

- [x] Analyzed combat system Искам да анализирам системата за бой в моя проект. В момента е доста елементарна и има нужда от подобрение.

__Problem Statement__: Искам да анализирам системата за бой в моя проект. В момента е доста елементарна и има нужда от подобрение.

__Required Context__:

- In Combat System/combat_calculator.js using combat_attributes object
- Must maintain compatibility with existing damage calculation logic (combat_resolver.js)
- Should not affect player combat mechanics

__Expected Output Format__: "Show me how to improve the combat system's attack resolution and damage calculations. Include code for both the new attack cooldown logic and updated hit probability adjustments."

__Task Progress Tracking__:

- [x] Analyzed combat system
- [ ] Checked damage_display.js integration
- [ ] Verified enemy_combat.js compatibility

```javascript

## ⚙️ Implementation Notes

1. **No user interaction required**: Cline processes requests automatically without prompting the user
2. **Context-aware formatting**:
   - Uses `platformer-game-memory.jsonl` for project knowledge
   - References `PROJECT_FILE_GUIDE.md` for architecture understanding
3. **Strict minimalism**:
   - Only outputs formatted prompt (no additional commentary)
   - Ensures only final results are shown in responses

## 📌 Critical Requirements

- **Never show intermediate steps**: All processing happens internally before output
- **Always maintain protocol structure**: Even if user request is incomplete
- **Preserve original intent**: Formatting should enhance, not alter the user's request
- **Reference existing documentation**: Always use `.clinerules/problem-solving-protocol.md`
```
