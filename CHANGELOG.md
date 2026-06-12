# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-21

### Added
- Initial release of Flappy Bird game
- Core gameplay mechanics with smooth physics
- 5 difficulty levels (Easy, Medium, Hard, Expert, Insane)
- High score tracking using localStorage
- Game statistics (games played, total score)
- Sound effects using Web Audio API
- Pause/resume functionality (Press P)
- Responsive UI with modern design
- Click and keyboard controls (SPACE to jump)
- Game state management (Start, Playing, Paused, Game Over)
- Collision detection system
- Procedurally generated graphics
- Cloud animations in background
- Ground with striped pattern
- Settings panel for sound and difficulty
- Comprehensive documentation
- Unit test structure
- ESLint configuration
- EditorConfig for consistent formatting
- Contributing guidelines
- MIT License

### Game Features
- Bird entity with realistic physics and rotation
- Pipe generation with randomized gaps
- Score display with shadow effects
- Visual feedback for all game states
- Keyboard shortcuts (SPACE, P, R)
- Mobile-friendly canvas scaling

### Technical Features
- Modular code architecture
- Separated concerns (entities, managers, utils)
- Configuration system via `config.js`
- Storage manager for persistent data
- Sound manager with toggle capability
- Collision manager with precise hitbox detection
- Score manager with statistics tracking
- Clean, documented code with JSDoc-style comments

### Developer Experience
- npm scripts for development
- Live-reload development server
- Test framework setup (Jest)
- Linting with ESLint
- Asset organization structure
- Well-organized project structure
- Comprehensive README with examples

## [1.1.0] - 2026-06-12

### Added
- **Power-Ups System**:
  - Shield (Star) power-up providing 5 seconds of invincibility to bypass pipe collisions.
  - Gem (2X Score) power-up doubling score increments for 5 seconds.
  - Active power-up indicators showing countdown progress bars on the game HUD.
  - Dynamic audio chime synthesized via Web Audio API when picking up a power-up.
- **Customizable Bird Skins**:
  - Dropdown selector in the settings panel to change the bird's skin.
  - Four premium color options: Classic Gold, Ruby Red, Neon Emerald, and Vortex Violet.
  - Saved skin preferences stored in localStorage.
  - Responsive visual shield/double-points aura renderings around the bird entity.
- New unit test coverage for power-ups and active shield collision bypasses in Jest.

## [Unreleased]

### Planned Features
- Mobile touch controls optimization
- Multiplayer mode
- Online leaderboard
- Achievement system
- Day/night theme toggle
- Custom level editor
- Sound effect files (currently using synthesized audio)
- Custom graphics and sprites
- Internationalization (i18n)
- Progressive Web App (PWA) support

### Potential Improvements
- Performance optimizations
- Better mobile responsiveness
- Additional difficulty modes
- Tutorial mode for new players
- Replay system
- Social sharing features
- Analytics integration

---

## Version History

- **1.1.0** (2026-06-12) - Added customizable bird skins and power-ups system
- **1.0.0** (2026-05-21) - Initial release

---

## How to Read This Changelog

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** in case of vulnerabilities

## Links

- [Homepage](https://github.com/yourusername/flappy-bird)
- [Issue Tracker](https://github.com/yourusername/flappy-bird/issues)
- [Contributing](CONTRIBUTING.md)
