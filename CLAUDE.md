# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Development server
npm run dev

# Build the application
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

## Project Architecture

This is a React-based lottery/raffle system built with TypeScript, Vite, and Tailwind CSS. The application manages prizes, participants, and lottery drawings with animations.

### Key Components Structure

- **App.tsx**: Main application state machine with 4 states: 'setup' | 'overview' | 'drawing' | 'results'
- **Types** (`src/types/lottery.ts`): Core interfaces for Prize, Participant, LotterySettings, and LotteryResult
- **Components**:
  - PrizeManager: Manages prize creation and configuration
  - ParticipantManager: Handles participant list management
  - LotterySettings: Controls lottery behavior (repeat draws, title)
  - LotteryOverview: Pre-drawing summary and prize selection
  - LotteryWheel: Main drawing interface with animations
  - LotteryResults: Display winners and results
  - MagicianAnimation: Drawing animation overlay

### State Management

The app uses local React state with a state machine pattern:
1. **setup**: Configure prizes, participants, and settings
2. **overview**: Review configuration and select prize to draw
3. **drawing**: Active lottery wheel with participant selection
4. **results**: Display winners and provide navigation options

### Key Features

- Supports multiple prizes with different draw counts
- Optional repeat drawing (participants can win multiple times)
- Animated lottery wheel interface
- Participant selection tracking (prevents duplicate wins when repeat is disabled)
- Complete results history tracking

### Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS with custom gradients
- **Icons**: Lucide React
- **Linting**: ESLint with TypeScript support

### File Organization

```
src/
├── App.tsx           # Main application component
├── components/       # React components
├── types/           # TypeScript type definitions
├── main.tsx         # React app entry point
└── index.css        # Global styles with Tailwind
```