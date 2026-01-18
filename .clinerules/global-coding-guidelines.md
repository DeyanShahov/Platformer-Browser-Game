## Brief overview
This set of guidelines applies globally across all projects and focuses on clean coding practices, efficient development workflows, and maintaining high-quality code architecture.

## Memory system integration
- Always check for and read from any existing memory system in the project before proceeding with tasks
- Utilize memory data to maintain context and avoid redundant information gathering

## Version control practices
- Commit changes to GitHub only when explicitly requested by the user
- Limit commits to the scope of the current command; do not automatically commit subsequent changes
- Require explicit confirmation for each commit operation

## Functionality development approach
- Prioritize extending and improving existing functionality rather than creating new implementations from scratch
- Thoroughly search for existing code before implementing new features
- Only create entirely new functionality when no suitable existing code is found

## Code organization principles
- Create new files for functionalities that don't align with the existing file's purpose
- Ensure each file has a clear, singular ideological focus
- Maintain logical separation of concerns across the codebase

## Coding standards
- Use clean, clear, and modern syntax following latest proven programming practices
- Implement proven design patterns and templates where applicable
- Prioritize the use of established algorithms and suggest their implementation when relevant

## Architectural design
- Ensure all projects follow clean architectural principles
- Maintain modular, testable, and maintainable code structures

## Clean code principles
- DRY (Don't Repeat Yourself): Avoid duplication of logic, data, or configuration
- KISS (Keep It Simple, Stupid): Strive for maximum simplicity without unnecessary abstractions
- YAGNI (You Aren't Gonna Need It): Develop only what is currently needed
- SOLID principles: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion

## Code style and readability
- Use meaningful names for variables, functions, and classes following language conventions
- Maintain consistent formatting with proper indentation and logical spacing
- Write small, focused functions that do one thing well

## Design and architecture guidelines
- Implement modular components with clear interfaces
- Use abstraction and encapsulation to hide implementation details
- Minimize dependencies through Dependency Injection and interface usage

## Development processes
- Encourage code reviews for style and architectural decisions
- Perform regular refactoring to improve code without changing functionality
- Use comments only when code cannot explain itself clearly

## Performance guidelines
- Profile code before optimizing
- Consider algorithmic complexity and choose efficient data structures
- Optimize bottlenecks based on measurement, not assumptions

## Security practices
- Validate all inputs and sanitize data
- Follow secure coding principles (e.g., OWASP guidelines)
- Regularly update dependencies to address vulnerabilities

## Documentation standards
- Maintain comprehensive README files for projects
- Document public APIs and interfaces
- Use tools for automatic documentation generation

## Task Planning and Execution
- Always create a temporary .md file when solving problems or creating new functionality, detailing the entire problem broken down into small executable steps
- Format the file as a checklist with [ ] for incomplete tasks and [x] for completed tasks

## Interaction with AI assistant
- Prefer direct, technical communication style avoiding conversational fluff
- Be concise in responses, focus on actionable information
- Use efficient prompting: gather required information before planning, break complex tasks into steps
- Spend adequate time on architectural planning in PLAN MODE before implementation
