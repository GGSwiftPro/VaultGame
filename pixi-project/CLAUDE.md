# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run start` - Run dev server on port 3000
- `npm run build` - Build for production (runs TypeScript compilation then Vite build)
- `npm run preview` - Preview production build on port 8080 (must build first)
- `npm run lint` - Run ESLint with auto-fix

## Project Architecture

This is a minimal 2D game framework built with PixiJS, TypeScript, and Vite. The architecture follows a simple pattern:

### Core Components

- **App.ts** - Main application class extending PIXI.Application, handles initialization and game loop
- **AssetLoader.ts** - Automatic asset loading system using Vite's import.meta.glob to discover assets in `/public/` directory
- **Keyboard.ts** - Singleton keyboard input handler with action mapping (WASD + Space + Shift)
- **SpritesheetAnimation.ts** - Handles spritesheet-based animations

### Scene System

- **Game.ts** - Main game scene (Container) with load/start/update lifecycle
- Scenes receive `SceneUtils` dependency injection containing shared utilities like AssetLoader

### Game Objects (Prefabs)

- **Player.ts** - Animated character with movement, jumping, and dashing using GSAP tweens
- **ParallaxBackground.ts** - Multi-layer scrolling background system

### Asset Organization

Assets are automatically loaded from `/public/` directory structure:
- `/public/images/` - Individual textures
- `/public/sounds/` - Audio files
- `/public/spritesheets/` - JSON + PNG pairs (only JSON files are loaded, PNGs are referenced)

The AssetLoader generates a manifest automatically using regex pattern matching on filenames.

### Key Technologies

- **PixiJS 7.x** - Main rendering engine
- **GSAP** - Animation tweening library
- **@pixi/sound** - Audio system
- **Vite** - Build tool with HMR
- **TypeScript** - Type safety

### Configuration

- **config.ts** - Game configuration including background layer definitions
- **vite.config.ts** - Build configuration with ESNext target and external .skel files

### Game Loop

1. App constructor creates Game scene and AssetLoader
2. `App.begin()` adds scene to stage, calls `Game.load()`, then `Game.start()`
3. Game loop runs `Game.update(delta)` on each frame
4. Window resize events are handled via `Game.onResize()`

The Player object demonstrates keyboard input handling, state management, and GSAP-based animations for movement, jumping, and dashing.