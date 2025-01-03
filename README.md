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

## Current TODO List

### High Priority
- [ ] Implement error handling for audio recording failures
- [ ] Add data persistence layer for recorded phrases
- [ ] Implement user feedback system for recording quality
- [ ] Add audio waveform visualization during recording

### Medium Priority
- [ ] Add unit tests for core functionality
- [ ] Implement analytics dashboard features
- [ ] Add export functionality for recorded phrases
- [ ] Implement progress tracking system
- [ ] Add keyboard shortcuts for common actions

### Low Priority
- [ ] Add dark mode theme support
- [ ] Implement offline support
- [ ] Add multi-language interface support
- [ ] Optimize audio processing for better performance
- [ ] Add user preferences storage

### Technical Debt
- [ ] Refactor AudioRecorder.js to reduce file size
- [ ] Implement proper TypeScript types
- [ ] Add error boundary components
- [ ] Improve code documentation coverage
- [ ] Set up automated testing pipeline

## Current Implementation Status and TODOs

### Core Features In Progress

#### Audio Recording
- [ ] Add waveform visualization during recording
- [ ] Implement audio compression for storage optimization
- [ ] Add recording quality validation
- [ ] Support for longer recordings (>5 minutes)

#### Training System
- [ ] Add spaced repetition algorithm
- [ ] Implement progress tracking per phrase
- [ ] Add custom training schedules
- [ ] Support for phrase categories/tags

#### Data Management
- [ ] Implement data export functionality
- [ ] Add backup/restore features
- [ ] Add cloud sync support
- [ ] Implement recording metadata editing

### UI Improvements
- [ ] Add dark mode support
- [ ] Implement responsive design for all screen sizes
- [ ] Add keyboard shortcuts
- [ ] Improve accessibility features
- [ ] Add loading states and transitions

### Technical Debt
- [ ] Split UIController.js into smaller modules
  - Move TrainingSession to separate file
  - Create dedicated analytics module
- [ ] Add comprehensive error handling
- [ ] Implement proper TypeScript types
- [ ] Add unit tests for core functionality
- [ ] Improve IndexedDB error recovery

### Documentation
- [ ] Add JSDoc comments to all classes and methods
- [ ] Create API documentation
- [ ] Add inline comments for complex logic
- [ ] Document database schema
- [ ] Create user guide

### Performance Optimization
- [ ] Optimize IndexedDB queries
- [ ] Implement audio streaming for large files
- [ ] Add caching for frequently accessed data
- [ ] Optimize chart rendering
- [ ] Reduce initial load time

### Analytics Features
- [ ] Implement detailed practice statistics
- [ ] Add progress tracking visualizations
- [ ] Create performance insights
- [ ] Add export of analytics data
- [ ] Implement custom reporting periods

## License

[License information will be added here]
