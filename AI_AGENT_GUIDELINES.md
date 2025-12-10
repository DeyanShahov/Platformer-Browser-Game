# AI Agent Guidelines for Platformer Browser Game Engine

## 📋 Document Overview

This document provides comprehensive guidelines for AI agents working on the **Platformer Browser Game Engine** project. It establishes coding standards, development principles, and behavioral expectations to ensure consistent, high-quality contributions.

## 🎯 Project Concept & Vision

### Core Concept
**Framework/Engine for Browser Platformer Game** with cooperative multiplayer (up to 4 players) using controllers. The game combines **arcade platformer mechanics** with **RPG progression systems**, inspired by classic arcade games and tabletop RPGs like Dungeons & Dragons and Pathfinder.

### Game Genre
- **Primary:** Arcade Platformer + RPG Elements
- **Style:** Fast-paced cooperative gameplay with character progression
- **Target:** Browser-based multiplayer experience
- **Inspiration:** Classic arcade games + Modern RPG mechanics

### Key Features
- **Multiplayer:** 4-player cooperative mode with controller support
- **Character Progression:** Leveling, skills, equipment, and statistics
- **Combat System:** Arcade-style with RPG elements (stats, abilities)
- **World Design:** Platformer levels with RPG encounters
- **Inventory System:** Equipment management with stat bonuses

---

## 🛠️ Technical Guidelines

### Primary Technologies
**Use Vanilla JavaScript, HTML, and CSS as the foundation:**
- **JavaScript (ES6+):** Core game logic, classes, modules
- **HTML:** Game structure, UI elements, canvas setup
- **CSS:** Styling, animations, responsive design

### Library Usage Policy
**Conservative approach - only when clearly beneficial:**
- **Three.js:** For advanced 3D graphics or special effects
- **P5.js:** For complex procedural generation or artistic effects
- **Phaser.js:** Only if 2D game engine features are essential
- **Other Libraries:** Must demonstrate clear superiority over vanilla implementation

**Always ask before introducing new libraries or frameworks.**

### Code Architecture
- **Modular Structure:** Separate concerns (entities, combat, UI, etc.)
- **Class-Based Design:** Use ES6 classes for game objects
- **Global State Management:** Centralized game state in `game_state.js`
- **Event-Driven:** Use custom events for inter-module communication

---

## 📝 Development Rules

### Git/GitHub Policy
**🚫 NEVER commit or push to GitHub unless explicitly instructed in the current prompt.**

**Exception:** Only push when the user specifically requests it in their message.

**Reasoning:** Prevents accidental overwrites and allows user control over repository state.

### Scope Management
**🎯 STAY WITHIN THE ASSIGNED TASK SCOPE**

**Rules:**
- Only modify files directly related to the current task
- Do not change game mechanics outside the task context
- **If you need to modify unrelated systems:** Ask permission and explain why
- **Document any side effects** of your changes

**Example Scenarios:**
- ✅ Task: "Add health bars" → Modify only rendering and UI systems
- ❌ Task: "Add health bars" → Don't change combat balance or enemy AI
- ❓ If combat changes are needed → Ask: "This will affect combat balance, should I proceed?"

### Communication Requirements
**🤝 ASK BEFORE MAKING SIGNIFICANT CHANGES**

**When to Ask:**
- Changing core game mechanics or balance
- Introducing new systems or features
- Modifying existing player abilities
- Changing UI/UX patterns
- Adding new dependencies

**How to Ask:**
```markdown
This change will [impact description]. Should I proceed?
Alternative: [if applicable]
Reasoning: [why this change is needed]
```

---

## 🎮 Game Design Principles

### Arcade RPG Balance
**Fast-paced platforming + Strategic RPG elements:**

- **Combat:** Quick, arcade-style with RPG stats influencing outcomes
- **Progression:** Character growth through levels, skills, and equipment
- **Difficulty:** Increasing challenge with player power scaling
- **Cooperation:** 4-player synergy mechanics

### Character Systems
**4 Unique Character Classes:**
- Each with unique abilities and playstyles
- Shared progression systems (levels, skills, equipment)
- Controller-optimized controls

### Progression Mechanics
- **Leveling:** Experience-based advancement
- **Skills:** Tree-based ability system with leveling
- **Equipment:** Item slots with stat bonuses and rarities
- **Statistics:** Core attributes (Strength, Speed, Intelligence) + Combat stats

### World & Content
- **Levels:** Platformer stages with RPG encounters
- **Enemies:** Scaling difficulty with player progression
- **Items:** Loot drops, shops, crafting
- **Bosses:** Challenging encounters requiring coordination

---

## 🔍 Quality Assurance

### Testing Requirements
**Always test changes thoroughly:**
- **Basic Functionality:** Does the feature work as intended?
- **Edge Cases:** What happens with extreme values or unusual scenarios?
- **Multiplayer:** Test with multiple players/controllers
- **Performance:** Check for frame rate drops or memory leaks
- **UI/UX:** Ensure intuitive controls and clear feedback

### Performance Considerations
**Browser optimization focus:**
- **Frame Rate:** Maintain 60 FPS for smooth gameplay
- **Memory:** Avoid memory leaks in long sessions
- **Asset Loading:** Optimize image/audio loading
- **DOM Manipulation:** Minimize expensive operations

### Error Handling
**Robust error management:**
- **Graceful Degradation:** Game continues if non-critical features fail
- **User Feedback:** Clear error messages for players
- **Logging:** Console logging for debugging (remove in production)
- **Validation:** Input validation and sanity checks

---

## 🔄 Development Workflow

### Task Organization
**Structured approach to complex tasks:**
1. **Analyze Requirements:** Understand the full scope
2. **Plan Implementation:** Break down into manageable steps
3. **Iterative Development:** Implement and test incrementally
4. **Documentation:** Comment code and update docs
5. **Final Testing:** Comprehensive verification

### Code Documentation
**Maintain clean, documented code:**
- **File Headers:** Purpose and dependencies
- **Function Comments:** Parameters, return values, behavior
- **Complex Logic:** Inline comments explaining decisions
- **TODOs:** Mark incomplete or temporary code

### Communication Style
**Clear, technical communication:**
- ✅ "Implemented health bar rendering with dynamic positioning"
- ❌ "Made the health thing work"
- ✅ "This change affects combat balance, should I proceed?"
- ❌ "Is this OK?"

---

## 🎯 Behavioral Expectations

### Initiative vs Caution
**Balance between helpfulness and responsibility:**
- **Proactive:** Suggest improvements within scope
- **Conservative:** Ask before expanding task boundaries
- **Educational:** Explain technical decisions
- **Collaborative:** Work with user preferences

### Problem Solving
**Structured approach:**
1. **Identify Issue:** Clear problem statement
2. **Analyze Options:** Multiple solution approaches
3. **Recommend Best:** Explain reasoning
4. **Implement Carefully:** Test thoroughly
5. **Document Changes:** Update guidelines if needed

### Quality Standards
**Professional code quality:**
- **Readable:** Clear variable/function names
- **Maintainable:** Modular, well-structured code
- **Efficient:** Optimized for browser environment
- **Compatible:** Works across modern browsers
- **Accessible:** Consider different input methods

---

## 📚 Examples & Best Practices

### Code Structure Example
```javascript
// Good: Clear, documented, modular
class PlayerCombat {
  constructor(player) {
    this.player = player;
    this.lastAttackTime = 0;
  }

  canAttack() {
    const now = Date.now();
    const cooldown = 1000; // 1 second
    return (now - this.lastAttackTime) >= cooldown;
  }

  performAttack(target) {
    if (!this.canAttack()) return false;

    // Attack logic here
    this.lastAttackTime = Date.now();
    return true;
  }
}
```

### Communication Example
```
User: "Add a jump ability"
AI: "I'll implement a basic jump mechanic. This will add a new action to the player controls. Should I include double-jump or keep it simple?"

User: "Keep it simple"
AI: "Understood. Implementing single jump with standard physics."
```

### Scope Management Example
```
Task: "Add enemy health bars"
✅ Modify: render.js, enemy_data.js
❓ Ask Before: Changing enemy AI behavior
❌ Don't: Modify player stats or combat balance
```

---

## 🚀 Future Considerations

### Scalability
- **Modular Design:** Easy to add new features
- **Performance Monitoring:** Track bottlenecks as game grows
- **Asset Management:** Organized resource loading

### Maintenance
- **Regular Updates:** Keep dependencies current
- **Documentation:** Update guidelines as project evolves
- **Testing:** Expand test coverage for critical systems

### Community
- **Code Standards:** Consistent style across contributors
- **Knowledge Sharing:** Document complex systems
- **Collaboration:** Clear communication channels

---

## 📞 Contact & Updates

**This document should be updated when:**
- New technologies or libraries are adopted
- Major architectural changes occur
- Development processes evolve
- New team members join

**For questions or clarifications:** Reference specific sections or ask for examples.

---

*Last Updated: December 2025*
*Maintained by: Project Development Team*
