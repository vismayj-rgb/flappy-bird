# 🐦 Flappy Bird Game

A modern, fully-featured implementation of the classic Flappy Bird game built with HTML5 Canvas and vanilla JavaScript. Features include difficulty levels, high score tracking, sound effects, and a responsive UI.

![Game Screenshot](assets/images/screenshot.png)

## 🎮 Features

- **Pure JavaScript** - No frameworks or dependencies
- **Smooth Gameplay** - 60 FPS canvas rendering
- **5 Difficulty Levels** - From Easy to Insane
- **High Score System** - LocalStorage-based score tracking
- **Sound Effects** - Web Audio API synthesized sounds
- **Responsive Design** - Works on desktop and mobile
- **Statistics Tracking** - Games played, total score, averages
- **Pause Functionality** - Press 'P' to pause/resume
- **Modern UI** - Beautiful gradients and animations
- **Well-Organized Code** - Modular architecture with clear separation of concerns

## 🚀 Quick Start

### Option 1: Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flappy-bird
   ```

2. **Open in browser**
   - Simply open `index.html` in your web browser
   - Or use a local server (recommended):
     ```bash
     npm install
     npm start
     ```

3. **Play!**
   - Press SPACE or CLICK to jump
   - Avoid the pipes
   - Beat your high score!

### Option 2: Live Server

```bash
npm run dev
```

This will start a live-reload development server on `http://localhost:8080`

## 🎯 How to Play

1. Click **Start Game** or press **SPACE**
2. Press **SPACE** or **CLICK** to make the bird jump
3. Navigate through the pipes without hitting them
4. Each pipe you pass increases your score
5. Try to beat your high score!

### Controls

- **SPACE** or **CLICK** - Jump
- **P** - Pause/Resume
- **R** - Restart (when game over)

## 📁 Project Structure

```
flappy-bird/
├── index.html              # Main HTML file
├── styles.css              # Game styling
├── package.json            # Project configuration
├── README.md               # This file
├── CONTRIBUTING.md         # Contribution guidelines
├── LICENSE                 # MIT License
├── CHANGELOG.md            # Version history
├── .gitignore              # Git ignore rules
├── .editorconfig           # Editor configuration
├── .eslintrc.json          # ESLint configuration
│
├── src/                    # Source code
│   ├── config.js           # Game configuration constants
│   ├── game.js             # Main game class
│   ├── main.js             # Entry point and event handlers
│   │
│   ├── entities/           # Game entities
│   │   ├── bird.js         # Bird class with physics
│   │   └── pipe.js         # Pipe and PipeManager classes
│   │
│   ├── managers/           # Game managers
│   │   ├── collision.js    # Collision detection
│   │   └── score.js        # Score management
│   │
│   └── utils/              # Utility classes
│       ├── storage.js      # LocalStorage wrapper
│       └── sound.js        # Sound management
│
├── assets/                 # Game assets
│   ├── images/             # Sprites and images
│   ├── sounds/             # Sound effects
│   └── fonts/              # Custom fonts
│
└── tests/                  # Test files
    ├── bird.test.js
    ├── collision.test.js
    └── score.test.js
```

## 🛠️ Development

### Prerequisites

- Node.js 14+ (for development tools)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Install Dependencies

```bash
npm install
```

### Available Scripts

- `npm start` - Start HTTP server
- `npm run dev` - Start development server with live reload
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues
- `npm run build` - Run linter and tests

### Running Tests

```bash
npm test
```

### Code Quality

The project uses:
- **ESLint** for code linting
- **Jest** for unit testing
- **EditorConfig** for consistent code formatting

## ⚙️ Configuration

Game settings can be modified in `src/config.js`:

```javascript
CONFIG = {
  PHYSICS: {
    GRAVITY: 0.5,
    JUMP_FORCE: -8,
    MAX_VELOCITY: 10
  },
  PIPE: {
    SPEED: 3,
    GAP_HEIGHT: 150,
    SPAWN_INTERVAL: 90
  },
  // ... more settings
}
```

## 🎨 Customization

### Adding Custom Graphics

1. Place your images in `assets/images/`
2. Update the drawing methods in `src/entities/bird.js` and `src/entities/pipe.js`
3. Load and draw images using Canvas API

### Adding Custom Sounds

1. Place audio files in `assets/sounds/`
2. Update `src/utils/sound.js` to load and play your sounds
3. Supported formats: MP3, WAV, OGG

### Changing Difficulty

Adjust difficulty parameters in `src/config.js`:

```javascript
DIFFICULTY: {
  EASY: {
    pipeSpeed: 2,
    gapHeight: 180,
    spawnInterval: 110
  },
  // Add more difficulty levels...
}
```

## 🐛 Known Issues

- Sounds may not work on some browsers until user interaction
- Mobile touch controls may feel less responsive than desktop
- Game pauses when browser tab is not visible (by design)

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original Flappy Bird game by Dong Nguyen
- Inspired by various open-source implementations
- Built with modern web technologies

## 📊 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🔮 Future Enhancements

- [ ] Mobile touch controls optimization
- [ ] Multiple bird skins
- [ ] Power-ups and special items
- [ ] Multiplayer mode
- [ ] Leaderboard integration
- [ ] Achievement system
- [ ] Day/night themes
- [ ] Custom level editor

## 📧 Contact

Have questions or suggestions? Open an issue or submit a pull request!

---

Made with ❤️ by the open-source community