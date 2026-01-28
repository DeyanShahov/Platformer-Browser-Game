# RPG Problem-Solving Protocol: Request Formatting Guidelines

This document establishes a standardized framework for requesting assistance on RPG development tasks. It ensures your requests are processed efficiently while preventing cyclical thinking patterns that can occur during complex problem-solving.

## Core Principles
- **Clarity over Complexity**: Focus on specific, actionable requests rather than vague descriptions.
- **Contextual Precision**: Provide relevant context without overwhelming detail.
- **Progress Tracking**: Use explicit task progress markers to avoid redundant analysis.
- **Minimal Tool Usage**: Combine necessary tool calls into single, efficient operations.

## Request Structure Guidelines

### 1. Problem Statement
Start with a clear, concise problem statement that:
- Identifies the specific issue or feature you need help with
- Specifies the desired outcome
- Includes relevant context (e.g., "In the combat system, when enemies take damage...")

**Example**:  
"Implement a health bar for player characters in the UI system. The health bar should update dynamically during combat and display current HP/Max HP values."

### 2. Required Context
Provide only essential information:
- Mention specific files or systems involved (e.g., "In `player_system.js`")
- Reference relevant data structures (e.g., "Using the `CharacterStats` object")
- Specify constraints (e.g., "Must work with existing animation system")

**Avoid**:  
"Help me fix something in the game. It's not working right."

### 3. Expected Output Format
Specify what you want to see:
- Request specific code snippets or modifications
- Ask for analysis of particular sections
- Define desired behavior (e.g., "The health bar should fade out when HP is below 20%")

**Example**:  
"Show me how to modify `player_system.js` to include a health bar that updates every frame using the existing `render()` function."

## Prevention of Cyclical Thinking

### Task Progress Tracking
Always include a task progress checklist with your request. This prevents redundant analysis by:
- Showing completed steps (marked as `[x]`)
- Indicating pending actions (marked as `[ ]`)
- Providing clear next steps

**Example**:  
```
- [x] Analyzed player_system.js
- [ ] Checked animation_renderer.js for UI integration
- [ ] Verified combat system compatibility
```

### Response Shortening Protocol
When requesting analysis:
1. **Specify the exact file or section to analyze**
2. **Limit your request to one specific problem**
3. **Avoid asking for general explanations**

**Example**:  
"Analyze `enemy_base_data.js` line 45-60 for potential performance issues in enemy spawning."

### Tool Usage Optimization
Combine multiple tool calls into a single, efficient operation:
```xml
<replace_in_file>
<path>player_system.js</path>
<diff>
------- SEARCH
function updateHealth() {
=======
function updateHealth() {
  // New health bar implementation
++++++ REPLACE
</diff>
<task_progress>
- [x] Analyzed player_system.js
- [ ] Implemented health bar UI
</task_progress>
</replace_in_file>
```

### Output Format Requirements
- **Only final results will be shown** - intermediate steps and reasoning are hidden from view
- No token usage or processing logs will appear in responses
- All outputs follow strict minimalism: only actionable information is provided

## Implementation Checklist
- [x] Created a clear problem statement
- [x] Provided necessary context without excess detail
- [x] Included task progress tracking
- [x] Specified expected output format
- [x] Used minimal tool calls where possible

