# SYNORA — Personal Productivity Companion

> *"Everything you need. One shortcut away."*

SYNORA is an ultra-premium, production-ready desktop productivity companion inspired by **Apple Spotlight**, **Raycast**, **Linear**, **Arc Browser**, and **Windows 11 Fluent Design**.

It combines a Spotlight utility popup (`Ctrl + Space`), instant Quick Notes, auto-categorized Smart Clipboard timeline, Link Vault bookmark manager, standard/scientific expression Calculator, Pomodoro Focus Studio with procedural ambient sounds, multi-engine universal search, global command palette (`Ctrl + K`), and offline storage persistence.

---

## ✨ Core Features

1. **Spotlight Companion Popup (`700px × 520px`)**:
   - Ultra-fast launch (<150ms) with soft spring physics (`stiffness: 450, damping: 32`).
   - Integrated live Time, Date, Greeting, Weather, and Profile Avatar.

2. **Unified Single Search List**:
   - Keyboard-navigable single search results combining Google, GitHub, YouTube, Stack Overflow, Wikipedia, Notes, Clipboard, Link Vault, Commands, and Recent Items.

3. **Intelligent Direct Expansion Workspace**:
   - Seamless shared element layout transitions (`layoutId="synora-main-container"`) that morph the Spotlight popup directly into the requested target workspace module (`notes`, `clipboard`, `vault`, `calculator`, `focus`, `settings`, `dashboard`).

4. **Smart Clipboard Timeline (Hero Feature)**:
   - Automatic category classification (`color`, `code`, `link`, `email`, `phone`, `text`).
   - Live color swatch previews (`#hex` / `rgb`), category filtering pills, and 1-click copying.

5. **Integrated Calculator Engine**:
   - Standard and scientific math expression parser (`sin`, `cos`, `tan`, `sqrt`, `log`, `ln`, `^`, `π`, `e`).
   - History log tracking and 1-click answer copying.

6. **Instant Quick Note & URL Vault Capture**:
   - Type in popup and press `Enter` to save a Quick Note instantly.
   - Drag & drop or paste (`Ctrl + V`) a URL to automatically extract metadata (favicon, title, domain, description, category) and save to Link Vault.

7. **Desktop Demo Mode**:
   - Realistic Windows 11 simulated desktop environment with taskbar, system tray clock, vector icons, and smooth launch/exit animations.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens
- **Animations**: Framer Motion (Shared Layout Transitions & Physics) + GSAP
- **Editor**: TipTap Rich Text & Markdown Editor
- **Storage**: LocalForage (IndexedDB / Async Storage)
- **Audio**: Web Audio API Procedural Synthesizer
- **Icons**: Lucide React

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/user/synora.git

# Navigate to project
cd synora

# Install dependencies
npm install

# Run development server
npm run dev

# Build production bundle
npm run build
```

---

## ⌨️ Keyboard Shortcuts

- `Ctrl + Space` / `Cmd + Space`: Toggle SYNORA Spotlight Companion
- `Ctrl + K`: Open Global Command Palette
- `Ctrl + Enter`: Expand popup into target workspace
- `Escape`: Minimize workspace to popup / exit to Desktop Demo scene

---

SYNORA &copy; 2026. All rights reserved.
