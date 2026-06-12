# Contributing to Flappy Bird

First off, thank you for considering contributing to Flappy Bird! It's people like you that make this project better.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit and push
7. Open a pull request

## How to Contribute

### Types of Contributions

We welcome many types of contributions:

- 🐛 **Bug fixes** - Fix issues in the game
- ✨ **New features** - Add new functionality
- 📝 **Documentation** - Improve or add documentation
- 🎨 **Design** - Improve UI/UX or add assets
- 🧪 **Tests** - Add or improve test coverage
- ♻️ **Refactoring** - Improve code quality
- 🔊 **Sounds** - Add or improve sound effects
- 🌐 **Internationalization** - Add language support

## Development Setup

1. **Install Node.js** (version 14 or higher)

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **Lint your code**
   ```bash
   npm run lint
   ```

## Coding Standards

### JavaScript Style Guide

We follow ESLint rules defined in `.eslintrc.json`:

- Use **2 spaces** for indentation
- Use **single quotes** for strings
- Always use **semicolons**
- Use **const** for constants, **let** for variables
- Prefer **arrow functions** where appropriate
- Use **descriptive variable names**

### Code Organization

- Keep functions small and focused (< 50 lines)
- Use meaningful function and variable names
- Add comments for complex logic only
- Organize imports/requires at the top
- Group related functionality together

### Example

```javascript
// Good
const calculateScore = (baseScore, multiplier) => {
  return baseScore * multiplier;
};

// Bad
function calc(s, m) {
  return s * m;
}
```

### File Structure

When adding new features:

1. **Entities** go in `src/entities/`
2. **Managers** go in `src/managers/`
3. **Utilities** go in `src/utils/`
4. **Tests** go in `tests/` with `.test.js` suffix
5. **Assets** go in appropriate `assets/` subdirectory

### Adding Game Elements

- **Skins**: Define the skin colors in `CONFIG.BIRD.SKINS` inside `src/config.js` and add the corresponding `<option>` to the `#skinSelector` element in `index.html`.
- **Power-Ups**: Add the new power-up type and color in `CONFIG.POWERUP.TYPES` and `CONFIG.POWERUP.COLORS` inside `src/config.js`. Extend `PowerUp` drawing or collection logic as needed, and ensure a unit test is added to `tests/powerup.test.js`.

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
feat(bird): add double jump power-up

Add ability for bird to perform double jump when power-up is collected.
Power-up spawns randomly every 10 pipes.

Closes #123

fix(collision): correct hitbox calculation

The bird's hitbox was too large, causing false collisions.
Adjusted hitbox to match visual sprite size.

docs(readme): update installation instructions

Added clearer steps for npm installation and local development setup.
```

### Guidelines

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests in footer

## Pull Request Process

1. **Update documentation** if you're changing functionality
2. **Add tests** for new features or bug fixes
3. **Ensure all tests pass**: `npm test`
4. **Lint your code**: `npm run lint`
5. **Update README.md** if adding features
6. **Create clear commit messages** following guidelines above

### PR Title Format

Use the same format as commit messages:

```
feat(bird): add customizable bird skins
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How did you test this? What should reviewers test?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
```

## Reporting Bugs

### Before Submitting a Bug Report

- Check the existing issues to avoid duplicates
- Try to reproduce the bug in the latest version
- Collect information about your environment

### Bug Report Template

```markdown
## Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Screenshots
If applicable, add screenshots

## Environment
- Browser: [e.g., Chrome 90]
- OS: [e.g., Windows 10]
- Game Version: [e.g., 1.0.0]

## Additional Context
Any other relevant information
```

## Suggesting Enhancements

### Enhancement Suggestion Template

```markdown
## Summary
Brief summary of the enhancement

## Motivation
Why would this enhancement be useful?

## Detailed Description
Detailed description of the proposed feature

## Possible Implementation
How could this be implemented? (optional)

## Alternatives Considered
What alternatives have you considered?

## Additional Context
Any other relevant information, mockups, or examples
```

## Questions?

Feel free to:
- Open an issue for questions
- Join our discussions
- Reach out to maintainers

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing! 🎉