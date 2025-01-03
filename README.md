# ParrotTalk

A modern web application for voice communication and interaction.

## Project Guidelines

### Code Organization
- **One Class/Module Per File**: Each file should contain a single class or module
- **File Length Limit**: Files must not exceed 200 lines
- **Modularity**: 
  - Follow declarative and functional programming approach
  - Create small, focused modules
  - Use named imports only
  - Avoid circular dependencies

### Naming Conventions
- Follow consistent naming conventions across the project
- Use descriptive and meaningful names
- Names must remain stable unless explicitly instructed to change

### Documentation
- **JSDoc**: Required for all functions and classes
- **Inline Comments**: Used for complex logic explanation
- **TODO Tags**: Mark incomplete features with detailed descriptions
- **Language**: All documentation must be in English

### Code Style
- Follow conventional commit messages
- Use consistent indentation and formatting
- Implement clean code principles

## Project Structure

```
ParrotTalk/
├── scripts/        # JavaScript modules
├── css/           # Stylesheet files
├── images/        # Image assets
├── styles/        # Additional styles
└── index.html     # Main entry point
```

## Development Guidelines

### Code Quality
- Write modular, reusable code
- Implement proper error handling
- Follow functional programming principles where applicable
- Use modern JavaScript features appropriately

### TODO Comments Format
```javascript
// TODO: [Description of the task]
// Priority: [High/Medium/Low]
// Related to: [Feature/Component name]
```

### Import/Export Guidelines
```javascript
// Preferred import style
import { SpecificFunction } from './module';

// Avoid
import * as Module from './module';
```

## Getting Started

[Project setup and running instructions will be added here]

## Contributing

Please follow the project guidelines when contributing to this project. Ensure all code changes:
1. Follow the established naming conventions
2. Include proper documentation
3. Pass all existing tests
4. Include new tests for new functionality

## License

[License information will be added here]
