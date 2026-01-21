## Brief overview
This project-specific rule defines guidelines for an AI agent to refactor existing code in the Vanilla JS/HTML/CSS platformer browser game, focusing on reducing complexity, eliminating duplication, and improving maintainability with minimal functional changes.

## Purpose and scope
- Primary goal is to refactor code written in Vanilla JavaScript, HTML, and CSS with minimal or zero functional changes
- Objectives include reducing file size, eliminating duplicated functionality, improving separation of responsibilities, and establishing clear project structure
- AI agent must not change business logic unless explicitly instructed, perform premature optimization, or introduce new dependencies without justification

## Mandatory pre-refactor analysis phase
- Read PROJECT_FILE_GUIDE before making changes
- Inspect the project memory system
- Build internal map of all existing files, their responsibilities, dependencies, and interactions
- Classify each file into categories: Entry/Bootstrap, UI/DOM Manipulation, State/Data Management, Business Logic, Utilities/Helpers, or Styles/Layout
- Identify files without clear conceptual responsibility as refactor candidates

## Minimal functional change principles
- Ensure 1:1 behavior before and after refactoring with same inputs producing same outputs and side effects
- Allowed changes: renaming for clarity, extracting functions, moving code between files
- Disallowed changes: algorithm modifications, event flow changes, introducing hidden or implicit state

## Input parameters and pure functions
- Extracted or moved functionality must not rely on global scope and must receive all dependencies via parameters
- Use dependency injection via function parameters or configuration objects
- Functions should be parameterized to avoid global dependencies

## Rules for calling moved functionality
- Original file becomes an orchestrator, not executor
- New file contains isolated, testable logic
- Use import/export for modular organization

## Decision process: extend or create new file
- Extend existing file if conceptually aligned, file size remains reasonable (~200-300 LOC), and complexity does not increase significantly
- Create new file if functionality is self-contained, used in multiple places, host file is overloaded, or logic has expansion potential

## Complexity control rules
- Each file should have one primary responsibility
- Split files if understanding requires more than two mental contexts or three different logic types

## No duplicate functionality rule
- Detect and extract repeated logic patterns
- Create reusable utilities for shared functionality
- Avoid copy-paste logic with minor variations

## Directory structure guidelines
- Organize files in /src with subdirectories: /core, /features, /ui, /utils, /styles
- Place files based on conceptual responsibility, not convenience

## AI refactor checklist
- Functional behavior is identical before and after
- No global dependencies remain
- No duplicated logic exists
- Every file has a clear role
- Project structure is more readable than before

## Final goal
- Reduce file size and complexity
- Clarify responsibilities
- Prepare project for future growth without changing functionality, only organization
