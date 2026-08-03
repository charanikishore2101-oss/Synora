# LUMA — The Intelligent Start Page

> **Transforming the browser New Tab into the most beautiful and useful workspace on the internet.**

---

## 🌟 Overview

LUMA is an ultra-premium, production-ready intelligent start page application designed to replace default browser New Tab pages. It combines dynamic glassmorphic UI, an interactive living cursor physics engine, animated shader backgrounds, multi-engine universal search, markdown quick notes, clipboard history timeline, link vault bookmarking, pomodoro focus studio with Web Audio API ambient sounds, global command palette (`Ctrl+K`), and LocalForage offline persistence.

---

## 🚀 Key Features

### 1. 💫 Signature Living Cursor Engine
- **Spring Physics & Elastic Interpolation**: Ultra-smooth follower dot that scales with velocity.
- **Magnetic attraction**: Interactive buttons and action cards pull the cursor naturally (`data-magnetic`).
- **3D Card Perspective Tilt**: Floating UI glass cards tilt in 3D space on hover (`data-tilt`).
- **Canvas Particle Trail & Spotlight**: Particle trails and ambient radial spotlight modes.
- **Ripples**: Hydrodynamic click ripple effects.

### 2. 🌌 Aurora Background & Shader Engine
- **Canvas Mesh Gradient**: Multi-orb animated ambient gradients with mouse spotlight tracking.
- **Noise Texture Overlay**: Subtle SVG turbulence texturing for depth.
- **Performance Optimization**: Automatically pauses animations when tab is hidden or reduced motion is enabled.

### 3. 🔍 Universal Multi-Engine Search
- **8 Search Engines**: Google, YouTube, GitHub, Stack Overflow, Wikipedia, Quick Notes, Clipboard History, and Link Vault.
- **Keyboard Navigation**: Press `/` anywhere to focus search or `Ctrl+K` for global command palette.
- **Instant Search & History**: Live internal match preview chips and saved search query history.

### 4. 📝 Quick Notes (TipTap Editor)
- **Rich Text & Markdown**: Headings, bold/italic, lists, blockquotes, code blocks, and interactive task checklists.
- **Organization**: Category folders, tag filter, search, pin notes, and Markdown file export (`.md`).

### 5. 📋 Clipboard Timeline
- **Auto-Categorization**: Intelligently tags copied items into `Text`, `Link`, `Email`, `Phone`, or `Code`.
- **History Management**: Search clipboard, pin items, copy back to system clipboard, or batch clear.

### 6. 🔖 Link Vault (Bookmark & Reading List)
- **Automatic Metadata**: Generates title, description, domain, favicons, estimated reading time, and custom tags.
- **Views**: Toggle between Grid and List layouts.

### 7. ⏱️ Focus Studio (Pomodoro & Ambient Audio)
- **Pomodoro Timer**: Work, Short Break, and Long Break countdowns with SVG progress gauge.
- **Web Audio API Procedural Synthesizer**: 100% offline ambient sound generators (Rain Storm, Ocean Waves, Forest Wind, White Noise, Cyberpunk Synth).
- **Fullscreen Zen Mode**: Zero-distraction focus state with statistics tracking.

### 8. ⌨️ Global Command Palette (`Ctrl + K` / `Cmd + K`)
- Instant access to switch themes, navigate tabs, create notes, start focus timers, and manage layout.

### 9. 🎨 Theme & Personalization Engine
- **Themes**: Aurora Dark, OLED Midnight, Cyberpunk Glow, Sunset Flare, Minimal Light.
- **Accents**: Electric Violet, Neon Cyan, Emerald Glow, Rose Gold, Sunset Amber.
- **Data Backup & Restore**: Export/Import complete workspace backup JSON files.

### 10. 🎯 Interactive Onboarding Walkthrough
- Built-in multi-step feature tour for new users with replay option.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: React 19 + TypeScript (Strict Mode)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 + Custom Glassmorphism CSS Design System
- **Animations**: Framer Motion, GSAP, HTML5 Canvas 2D Physics
- **State Management**: Zustand
- **Offline Storage**: LocalForage (IndexedDB / WebSQL / localStorage)
- **Rich Text Editor**: TipTap (`@tiptap/react`, `@tiptap/starter-kit`, TaskList, TaskItem)
- **Icons**: Lucide React (`lucide-react`)
- **Date Formatting**: `date-fns`

---

## 📂 Project Structure

```
LUMA/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── background/
│   │   │   ├── AuroraBackground.tsx
│   │   │   └── NoiseOverlay.tsx
│   │   ├── clipboard/
│   │   │   └── ClipboardTimeline.tsx
│   │   ├── command/
│   │   │   └── CommandPalette.tsx
│   │   ├── cursor/
│   │   │   ├── LivingCursor.tsx
│   │   │   └── ParticleTrail.tsx
│   │   ├── dashboard/
│   │   │   ├── HeaderGreeting.tsx
│   │   │   ├── LiveClock.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   ├── TodayGoals.tsx
│   │   │   └── WeatherWidget.tsx
│   │   ├── focus/
│   │   │   └── FocusStudio.tsx
│   │   ├── notes/
│   │   │   ├── NotesModule.tsx
│   │   │   └── TipTapEditor.tsx
│   │   ├── onboarding/
│   │   │   └── OnboardingTour.tsx
│   │   ├── search/
│   │   │   └── UniversalSearch.tsx
│   │   ├── settings/
│   │   │   └── SettingsModal.tsx
│   │   └── vault/
│   │       └── LinkVault.tsx
│   ├── hooks/
│   │   ├── useLivingCursor.ts
│   │   ├── useMagnetic.ts
│   │   └── useTilt3D.ts
│   ├── services/
│   │   └── storage.ts
│   ├── store/
│   │   ├── useClipboardStore.ts
│   │   ├── useFocusStore.ts
│   │   ├── useGoalsStore.ts
│   │   ├── useNotesStore.ts
│   │   ├── useSettingsStore.ts
│   │   └── useVaultStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── audioSynth.ts
│   │   └── cn.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 💻 Installation & Setup

1. **Clone or Download Repository**:
   ```bash
   cd LUMA
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Build Production Bundle**:
   ```bash
   npm run build
   ```

5. **Lint Codebase**:
   ```bash
   npm run lint
   ```

---

## ⚡ Quality & Verification Metrics

- **TypeScript Compilation**: `0 errors`
- **Linter Check (oxlint)**: `0 warnings, 0 errors`
- **Responsive Layout**: Desktop, Tablet, Mobile supported
- **Accessibility**: ARIA labels, Keyboard-first navigation, Reduced-motion support
