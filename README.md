# Minimal Desktop Wallpaper

> An elegant, distraction-free desktop environment application for crafting, customizing, and running live aesthetic wallpapers with interactive productivity widgets.

Built with **Electron**, **React 19**, **TypeScript**, and **Vite**, Minimal Desktop Wallpaper bridges the gap between static desktop backgrounds and full productivity dashboards. It transforms your screen into a serene, ambient workspace that keeps essential time, tasks, and schedules within reach while preserving visual tranquility.

---

## Table of Contents
1. [Core Features](#core-features)
2. [How It Works (System Architecture & Mechanics)](#how-it-works-system-architecture--mechanics)
3. [Technology Stack](#technology-stack)
4. [Widget Suite](#widget-suite)
5. [Atmospheric Theme Engine](#atmospheric-theme-engine)
6. [Project Structure](#project-structure)
7. [Installation & Getting Started](#installation--getting-started)
8. [Scripts & Build Pipeline](#scripts--build-pipeline)
9. [Design Philosophy & Aesthetics](#design-philosophy--aesthetics)

---

## Core Features

- **Draggable & Resizable Widgets**: Freely position and scale widgets across your canvas with collision avoidance and snap-fit boundaries.
- **Drift-Free High-Precision Timing**: Microsecond-accurate stopwatch (60fps via `requestAnimationFrame`) and wall-clock countdown timer with audio chime notifications.
- **Distraction-Free Immersion**: Widget titles (*"Timer"*, *"Stopwatch"*, *"To-Do List"*) automatically vanish in Full-Screen and Saved modes for an uncluttered presentation.
- **Lockable Widget Stage**: Lock widgets in full-screen mode (`🔒`/`🔓`) to prevent accidental movement while maintaining full interactive control.
- **10 Nature-Inspired Themes**: Curated organic palettes with smooth gradients and borderless circular swatches.
- **Custom Image Upload**: Use your own local photography or artwork as the canvas background.
- **Dynamic Quote Shuffling**: Curated inspirational quotes with an interactive `↻` shuffle button or custom text override.
- **Dual-Tier Persistence**: Instant UI updates via browser `localStorage` backed by disk-persisted **SQLite** via `sql.js`.
- **Sleek Minimalist Controls**: Pill-shaped border radii (`border-radius: 9999px`) applied to all action buttons with subtle micro-interactions.

---

## How It Works (System Architecture & Mechanics)

```
┌─────────────────────────────────────────────────────────────────┐
│                     Electron Main Process                       │
│  - Window Management (BrowserWindow)                            │
│  - IPC Dispatcher (save-wallpaper, toggle-fullscreen)          │
│  - WebAssembly SQLite Engine (sql.js / Node.js fs)              │
└────────────────┬────────────────────────────────────────────────┘
                 │ Inter-Process Communication (IPC)
┌────────────────▼────────────────────────────────────────────────┐
│                   Renderer Process (React 19)                   │
│                                                                 │
│  ┌────────────────────────┐        ┌─────────────────────────┐  │
│  │      Editor View       │        │    Saved Wallpapers     │  │
│  │  - Freeform Canvas     │        │   - Responsive Grid     │  │
│  │  - Theme Picker        │        │   - Proportional Scale  │  │
│  │  - Typography & Styles │        │   - Card Management     │  │
│  └────────────────────────┘        └─────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                 Full-Screen Ambient Display               │  │
│  │  - Aspect-Ratio Fit Stage     - Lock & Edit Controls      │  │
│  │  - Widget Resizing Engine     - Zero-Title Suppression    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1. The Canvas & Stage Scaling Engine
When a wallpaper is designed in the Editor, it records the canvas dimensions (`canvasWidth` and `canvasHeight`, typically 800×600 or the user's window size) and pixel coordinates for each widget.

When launched into **Full-Screen View** on any monitor resolution (e.g., 1080p, 1440p, 4K Ultrawide), the application computes an aspect-fit scale factor:

$$\text{scale} = \min\left(\frac{\text{screenW}}{\text{baseW}}, \frac{\text{screenH}}{\text{baseH}}\right)$$

$$\text{offsetX} = \frac{\text{screenW} - \text{baseW} \times \text{scale}}{2}, \quad \text{offsetY} = \frac{\text{screenH} - \text{baseH} \times \text{scale}}{2}$$

This mathematical projection guarantees that:
- Widgets remain in their exact relative positions regardless of screen resolution.
- Typography and widget proportions scale uniformly without distortion.
- Content is centered with clean, atmospheric letterboxing.

### 2. Proportional Scaling in Saved Wallpaper Previews
In the Saved Wallpapers gallery, each preview card dynamically measures its client container width via a native `ResizeObserver`. The preview stage calculates `scale = Math.min(cardWidth / baseW, cardHeight / baseH)` and centers the wallpaper, ensuring previews **never collapse** and remain true 1:1 representations of the full-screen layout.

### 3. Widget Title Suppression Pipeline
- **Editor Mode**: Widget headers (`<h3>Timer</h3>`, `<h3>To-Do List</h3>`) are displayed so you can easily identify, drag, and configure each widget.
- **View & Saved Modes**: A conditional flag (`shouldHideTitle = hideTitle || readOnly || currentView === 'view'`) strips header elements entirely, delivering a minimalist, distraction-free experience.

### 4. High-Precision Timing Engine
Standard JavaScript `setInterval` timers suffer from cumulative thread drift (up to 200–500ms every minute), especially when backgrounded or throttled by operating systems.

- **Stopwatch**: Uses `performance.now()` wall-clock timestamps combined with `requestAnimationFrame`. When paused, it accumulates exact elapsed milliseconds, rendering at a smooth 60fps with zero drift.
- **Timer**: Computes a target wall-clock deadline (`endTimeRef = Date.now() + timeLeft * 1000`). Each interval tick evaluates `Math.round((endTimeRef - Date.now()) / 1000)`, preventing countdown drift.

### 5. Native Audio Synthesizer (Web Audio API)
When the countdown timer expires, the app triggers a gentle, two-tone bell chime (587.33 Hz [D5] followed by 880 Hz [A5]) synthesized in real-time through the browser's `AudioContext`. It uses smooth gain ramps with zero external `.mp3` or `.wav` dependencies.

### 6. Two-Tier Data Persistence
1. **Tier 1 (Synchronous LocalStorage)**: Instant in-memory and browser caching for zero-latency UI re-rendering.
2. **Tier 2 (SQLite Database File)**: An embedded `sql.js` WebAssembly engine running in the Electron main process exports an encrypted binary database buffer saved to `%APPDATA%/project-wallpaper/wallpapers.sqlite`.

---

## Technology Stack

| Category | Technology | Version | Purpose & Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **React** | `^19.2.8` | High-performance UI rendering, concurrent hooks, and declarative state management. |
| **Language** | **TypeScript** | `~6.0.2` | Strict end-to-end typing for widget models, IPC contracts, and event payloads. |
| **Bundler & Dev Server**| **Vite** | `^8.3.0` | Sub-second Hot Module Replacement (HMR) and optimized Rollup asset bundling. |
| **Desktop Runtime** | **Electron** | `^44.5.1` | Native cross-platform desktop wrapper, OS window management, and filesystem access. |
| **Database Engine** | **sql.js** | `^1.14.2` | Embedded SQLite compiled to WebAssembly; zero native C++ compilation required. |
| **Widget Manipulation** | **react-rnd** | `^10.5.3` | Fluid drag-and-drop coordinate handling and 8-axis widget resizing. |
| **Styling & Design** | **Vanilla CSS3** | Modern | CSS Custom Properties, HSL color tokens, glassmorphism, and responsive utilities. |
| **Audio Synthesis** | **Web Audio API** | Native | Hardware-accelerated sine oscillator sound generation for alerts. |
| **Linter & Tooling** | **oxlint** | `^1.81.0` | High-performance Rust-based linter for static code analysis. |

---

## Widget Suite

### 1. Minimal Clock
- **Minimal Style**: Large, elegant display with thin font weights.
- **Bold & Date Style**: Emphasized time paired with an uppercase date ribbon.
- **Retro Digital**: Contrasting pill container with monospace typography.
- **Auto-Sync**: Accurate minute-by-minute real-time updates.

### 2. Focus Timer
- **Drift-Free Countdown**: Accurate wall-clock target timestamping.
- **Duration Persistence**: Selected countdown minutes persist across restarts in `widget.data.durationMinutes`.
- **Quick Preset Pills**: One-click shortcuts for `5m`, `15m`, and `25m` (Pomodoro).
- **Completion Pulse & Chime**: Gentle visual pulse animation and synthesized chime when time expires.

### 3. Precision Stopwatch
- **60fps Fluid Counter**: Frame-perfect millisecond rendering via `requestAnimationFrame`.
- **Tabular Alignment**: Monospace tabular numerals to prevent layout jitter (`00:00.00`).
- **Pill-Shaped Controls**: Start, Stop, and Reset controls.

### 4. Minimal To-Do List
- **Task Management**: Quick task addition, checkmark completion toggle, and removal.
- **Scroll Optimization**: Clean, hidden minimalist scrollbars for long task lists.
- **Pill Input & Add Button**: Rounded text field and pill-shaped `+` button.

### 5. Interactive Calendar
- **Dynamic Month Grid**: Automatic calculation of leap years, month lengths, and weekday alignments.
- **Date Agenda**: Click any day cell to record and inspect specific scheduled notes or tasks.
- **Pill Save & Back Controls**: Styled buttons for saving daily agendas.

### 6. Mindful Quotes Engine
- **Curated Wisdom**: 20 hand-selected quotes emphasizing clarity, focus, and simplicity.
- **On-Demand Shuffle (`↻`)**: Click the floating circular shuffle button to cycle quotes instantly.
- **Custom Quote Override**: Type custom personal mantras or affirmations in settings.

---

## Atmospheric Theme Engine

Each theme is engineered with calibrated HSL color tokens, harmonious background gradients, and tailored panel contrasts:

| Theme Name | Description & Palette |
| :--- | :--- |
| **Dark (Carbon)** | Deep carbon black (`#121316`) with slate gray borders and crisp white text. |
| **Light (Paper)** | Warm paper white (`#fbfbfa`) with soft gray borders and dark charcoal text. |
| **Ocean (Fjord)** | Nordic fjord midnight gradient (`#0a1118` $\rightarrow$ `#16202c`) with deep teal accents. |
| **Sunset (Terracotta)** | Earthen twilight gradient (`#1f1614` $\rightarrow$ `#3a221c`) with warm terracotta accents. |
| **Gradient (Aurora)** | Soft twilight violet gradient (`#0e131f` $\rightarrow$ `#201d36`) with celestial highlights. |
| **Sonoma** | macOS Sonoma coastal twilight (`#181b29` $\rightarrow$ `#2c2d42` $\rightarrow$ `#c89666`). |
| **Ventura** | macOS Ventura ocean amber (`#131c2b` $\rightarrow$ `#1f334d` $\rightarrow$ `#d9822b`). |
| **Monterey** | macOS Monterey deep purple glow (`#161326` $\rightarrow$ `#291d45` $\rightarrow$ `#9b6bc2`). |
| **Big Sur** | macOS Big Sur coastal pine (`#0c1e24` $\rightarrow$ `#173842` $\rightarrow$ `#3d8b7a`). |
| **Sequoia** | macOS Sequoia woodland mist (`#131a15` $\rightarrow$ `#1d2c22` $\rightarrow$ `#5a7d63`). |
| **Custom Wallpaper** | Ingest any local image via file picker to set a personalized background. |

> **Borderless Swatches**: Swatch circles use `border: none !important;` and `background-clip: border-box !important;` so colors fill 100% of the circle without grey outlines or rectangular clippings.

---

## Project Structure

```
project-wallpaper/
├── electron/
│   ├── main.ts              # Electron process entry, window lifecycle & SQLite IPC
│   └── preload.ts           # Context bridge configuration
├── src/
│   ├── assets/              # Icons and static image assets
│   ├── App.css              # Custom styling, pill utilities, theme swatches
│   ├── App.tsx              # Application controller, state, widgets & views
│   ├── index.css            # Root design tokens, 10 natural palettes, typography
│   └── main.tsx             # React 19 application bootstrap
├── dist/                    # Compiled production web bundle
├── dist-electron/           # Transpiled Electron Node.js backend
├── package.json             # NPM dependencies, scripts, and metadata
├── tsconfig.json            # Base TypeScript configuration
├── tsconfig.app.json        # Frontend TypeScript config
├── tsconfig.electron.json   # Backend Electron TypeScript config
├── vite.config.mts          # Vite build pipeline and plugin setup
└── PROJECT_REPORT.md        # Detailed 6-part technical architecture report
```

---

## Installation & Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/saikiranupparipalli/minimal-desktop-wallpaper.git
cd minimal-desktop-wallpaper
npm install
```

### 2. Launch Development Environment
Runs both Vite dev server and the Electron desktop app concurrently:
```bash
npm run dev
```

---

## Scripts & Build Pipeline

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Vite server at `http://127.0.0.1:5199` and boots Electron in dev mode. |
| `npm run build` | Compiles TypeScript (`tsc -b`), compiles Electron (`tsc -p tsconfig.electron.json`), and builds Vite bundle. |
| `npm run electron:dev` | Transpiles Electron backend and launches the native container. |
| `npm run preview` | Previews the compiled production web bundle locally. |
| `npm run lint` | Runs `oxlint` for high-speed static code verification. |

---

## Design Philosophy & Aesthetics

1. **Quiet Computing**: UI elements exist only when needed. Controls, toolbars, and names fade or hide to keep you focused on your work.
2. **Pill-Shaped Geometry**: Every interactive button utilizes `border-radius: 9999px` to create a soft, friendly, and cohesive visual language.
3. **Harmonious Palettes**: Avoids harsh primary colors in favor of curated HSL tones inspired by natural landscapes, mountains, and twilight skies.
4. **Modern SaaS Typography**: Headings are set in **Plus Jakarta Sans** with geometric tracking (`-0.02em` to `-0.04em`), crisp weights (600–800), and OpenType stylistic alternates (`cv02`, `cv03`, `cv04`, `cv11`) for a state-of-the-art tech aesthetic.
5. **Zero Layout Shift**: Tabular numbers, constrained widget heights, and responsive scaling containers eliminate visual jumping.

---

*Minimal Desktop Wallpaper — Crafted with focus, simplicity, and care.*
