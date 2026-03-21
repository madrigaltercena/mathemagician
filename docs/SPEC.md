# SPEC.md — Mathemagician (Matemágica)

**Project Name:** Mathemagician
**App Name:** Matemágica — O Reino dos Números
**Type:** Educational Gamification Web App (PWA)
**Target:** Children aged 6-10 (Portugal/Brazil)
**Date:** 2026-03-21

---

## 1. Concept & Vision

**Matemágica** is a magical learning world where children aged 6-10 embark on a journey as young apprentice mages, mastering mathematical operations through engaging gameplay. The app combines **story mode** (progressive unlock across 4 magical kingdoms) with **free play mode** (practice any operation at chosen difficulty). The emotional hook: the child's character visually evolves as they progress, creating genuine attachment to their mage avatar.

**Core feeling:** Empowering, magical, rewarding - every correct answer feels like casting a spell.

---

## 2. Design Language

### Aesthetic Direction
Fantasy/ magical academy - inspired by Hogwarts meets Pokémon. Warm, inviting, slightly whimsical but not cartoonish. The world should feel like a place children want to return to.

### Color Palette
| Role | Color | Hex |
|---|---|---|
| Primary (Magic Purple) | Purple | `#7C3AED` |
| Secondary (Gold/XP) | Amber | `#F59E0B` |
| Accent (Success) | Emerald | `#10B981` |
| Background | Soft Cream | `#FEF9EF` |
| Dark Text | Deep Navy | `#1E1B4B` |
| Error/Wrong | Rose | `#F43F5E` |
| Kingdom - Addition | Gold | `#FBBF24` |
| Kingdom - Subtraction | Blue | `#3B82F6` |
| Kingdom - Multiplication | Red | `#EF4444` |
| Kingdom - Division | Green | `#22C55E` |

### Typography
- **Headings:** `Fredoka One` (playful, rounded, highly legible for children)
- **Body:** `Nunito` (friendly, clear, excellent readability)
- **Numbers/Stats:** `Space Grotesk` (modern, clear digit distinction)
- **Minimum font size:** 18px for body, 24px for game numbers

### Spatial System
- Base unit: 8px
- Card padding: 24px
- Section gaps: 32px
- Border radius: 16px (cards), 50% (avatars, badges)
- Shadows: soft, layered - `0 4px 20px rgba(0,0,0,0.08)`

### Motion Philosophy
- **Correct answer:** Green burst + stars particle effect + gentle bounce
- **Wrong answer:** Soft red shake (no harsh sounds), encouraging message
- **XP gain:** Gold coin animation floating up
- **Level up:** Full-screen celebration with confetti
- **Transitions:** 300ms ease-out between screens
- **Hint reveal:** Fade-in with gentle pulse animation
- **No jarring or sudden animations** - everything smooth and child-friendly

### Visual Assets
- **Icons:** Phosphor Icons (duotone style)
- **Illustrations:** Custom SVG characters and kingdoms (simple flat design)
- **No stock photos** - all visuals are cohesive and on-brand

---

## 3. Layout & Structure

### Screen Flow
```
Splash Screen (2s logo animation)
    ↓
[First-time only] Character Creation
    - Name input
    - Avatar picker (6 presets)
    - Age selector (6-10)
    ↓
Home Screen (primary hub)
    ↓
    ├── ⚔️ Story Mode
    ├── 🎯 Free Play Mode
    ├── 👤 My Profile
    ├── 🏆 Achievements
    └── ⚙️ Settings
```

### Responsive Strategy
- Mobile-first (320px minimum)
- Tablet optimized (768px)
- Desktop functional (1024px)
- Game area always centered, max-width 600px
- Large touch targets: minimum 48x48px

### Navigation
- Bottom tab bar on mobile (Home, Play, Profile)
- Sidebar on desktop
- Persistent XP bar at top of all game screens

---

## 4. Features & Interactions

### 4.1 Character Creation (First Launch)
- **Name:** Text input, max 12 characters, no numbers/symbols
- **Avatar:** 6 preset mage characters (3 boys, 3 girls) - full body, not just faces
- **Age:** Slider or tap selector (6, 7, 8, 9, 10)
- **Skip available** (can fill later in settings)
- On completion: celebratory animation → Home screen

### 4.2 Home Screen
- Character avatar with current mage level displayed
- Total XP with progress bar to next level
- Current streak indicator (🔥 number)
- Quick-play button (jumps to last played mode)
- Kingdom map preview (story mode progress)
- Bottom navigation tabs

### 4.3 Story Mode
**4 Kingdoms, each with 25 levels:**

| Kingdom | Operation | Theme | Numbers Range |
|---|---|---|---|
| 🟡 Golden Fields | Addition | Sun Mage | 1-20 (age 6), up to 100 |
| 🔵 Crystal Caves | Subtraction | Moon Mage | 1-20 (age 6), up to 100 |
| 🔴 Fire Forest | Multiplication | Fire Mage | ×2,×3,×4,×5 (age 7), full table |
| 🟢 Emerald Mountains | Division | Forest Mage | ÷2,÷3,÷4,÷5 (age 7), full table |

**Level progression:**
- Levels 1-5: Easy (single digit, numbers ≤10)
- Levels 6-15: Medium (double digits, numbers ≤50)
- Levels 16-25: Hard (triple digits, numbers ≤100/1000)
- Each level: 5 questions, 3 stars achievable
- Must score ≥60% (3/5) to unlock next level
- Must complete all levels of Kingdom N to unlock Kingdom N+1

### 4.4 Free Play Mode
- Choose operation: ➕ ➖ ✕ ➗
- Choose difficulty: Easy / Medium / Hard / Challenge
- No progression - pure practice
- XP capped at 50% of Story Mode rewards
- Results screen with breakdown

### 4.5 Game Loop (Challenge Screen)
**The core gameplay screen:**

```
┌─────────────────────────────────┐
│  [XP Bar]           [💡 Hint 3] │
│                                 │
│     Question Card (large)       │
│        "7 + 5 = ?"              │
│     [Number input pad]          │
│                                 │
│  [Progress: ●●●○○]              │
└─────────────────────────────────┘
```

**Question Types:**
- Direct calculation: `7 + 5 = ?`
- Visual prompt: Shows 🍎🍎🍎🍎🍎 + 🍎🍎 → `?`
- Word problem (age 8+): *"A Ana tem 7 maçãs e ganha 5 mais. Quantas tem?"*
- Sequence fill: `2, 4, 6, 8, ?` (multiplication pattern)

**Input Methods:**
- Large on-screen number pad (mobile-first)
- Keyboard input (desktop)

**Answer feedback:**
- ✅ Correct: Green burst, encouraging message, +XP animation
- ❌ Wrong: Gentle shake, soft error sound, show correct answer briefly
- ⏱️ Timeout: 30 seconds per question (configurable off in settings)

### 4.6 Hint System
- **💡 Hint button** on every challenge
- **Max 3 per level** (counter shown)
- **Hint levels:**
  1. Verbal clue: *"Tenta pensar nas dezenas..."*
  2. Visual aid: Animated number line or number blocks
  3. Near-answer: *"Está entre 10 e 15..."*
- Using hint: XP reward reduced by 50%
- Hints are **encouraged, never punished** - no negative feedback

### 4.7 XP & Progression System
**XP per correct answer:**
| Difficulty | XP |
|---|---|
| Easy | 10 |
| Medium | 20 |
| Hard | 35 |
| Challenge | 50 |

**XP penalties:** Hint used = 50% of base XP

**Mage Levels:**
| Level | Title | XP Required | Unlocks |
|---|---|---|---|
| 1 | Aprendiz | 0 | Basic robe color |
| 2 | Aprendiz II | 200 | 2nd robe color |
| 3 | Mago Júnior | 500 | Companion animal #1 |
| 4 | Mago | 1000 | 2 more robe colors |
| 5 | Mago Sênior | 2000 | Magical wand upgrade |
| 6 | Grão-Mago | 4000 | 2 more companion animals |
| 7 | Mago Supremo | 8000 | Special arena, title badge |

### 4.8 Achievements System
**Categories:**
- **Progress:** "First Step", "10 Levels Clear", "Kingdom Champion"
- **Streaks:** "3-Day Streak", "7-Day Streak", "30-Day Streak"
- **Skill:** "Division Master", "Speed Demon" (answer <5s)
- **Collection:** "Collector" (unlock 5 companions), "Fashionista" (unlock all robes)

**Display:** Grid of achievement cards, locked ones shown as silhouettes

### 4.9 Inventory & Customization
- **Robe colors:** Unlocked via XP/achievements
- **Companion animals:** Unlocked via achievements (owl, fox, dragon, unicorn, phoenix)
- **Wands:** Unlocked via mage levels
- **Display:** Visible on profile and home screen

### 4.10 Daily Streak
- Login and complete ≥1 challenge per day
- Visual: Calendar heatmap on profile
- Rewards: Bonus XP coins at day 3, 7, 14, 30

### 4.11 Parental/Settings Screen
- **Sound:** Toggle on/off
- **Difficulty override:** Manual override of age-based defaults
- **Age:** Adjustable
- **Timer:** Enable/disable per-question timer
- **Reset progress:** With confirmation PIN (4 digits)
- **Language:** PT-PT (default), PT-BR, EN

---

## 5. Component Inventory

### 5.1 MageAvatar
- States: Default, celebrating (level up), sad (streak broken)
- Shows: Avatar image, mage level badge, name
- Animation: Idle bobbing, celebration burst

### 5.2 XPBar
- Horizontal progress bar
- Shows: Current XP / Next level XP threshold
- Animation: Fills smoothly on XP gain, sparkle at thresholds
- States: Default, animating, level-up (full bar glow)

### 5.3 QuestionCard
- Large, centered card with question
- States: Default, answered-correct (green glow), answered-wrong (red shake)
- Contains: Question text, visual aids (optional), input area

### 5.4 NumberPad
- 0-9 digits, large touch targets (min 64x64px)
- Delete (backspace), Submit (checkmark)
- States: Default, pressed (scale 0.95), disabled

### 5.5 HintButton
- Shows remaining hints: 💡💡💡
- States: Available (glowing), used (grayed), exhausted (hidden)

### 5.6 ProgressStars
- 3 stars per level
- States: Empty, earned-1, earned-2, earned-3
- Animation: Stars pop in sequentially on level complete

### 5.7 KingdomCard
- Used in story mode map
- Shows: Kingdom name, icon, lock/unlock status, completion %
- States: Locked (grayscale), available, in-progress, completed (golden border)

### 5.8 AchievementBadge
- Circular badge with icon
- States: Locked (silhouette + "?"), unlocked (full color + title)

### 5.9 BottomNavBar
- 3 tabs: Home, Play, Profile
- Active tab highlighted with accent color
- Mobile only (sticky bottom)

### 5.10 ResultScreen
- Modal overlay after each level
- Shows: Questions correct/5, XP earned, stars earned, hints used
- Actions: Retry, Next Level, Home

---

## 6. Technical Approach

### Stack
- **Frontend:** React 18 + Create React App
- **Styling:** CSS Modules + CSS Custom Properties (no Tailwind)
- **State:** React Context + useReducer for game state
- **Persistence:** LocalStorage (primary), Firebase (future cloud sync)
- **Icons:** Phosphor React
- **Animations:** CSS transitions + Framer Motion (light usage)
- **PWA:** Service worker, manifest, offline-capable
- **Mobile:** Capacitor for Android/iOS packaging

### Data Model

```typescript
interface Player {
  id: string;
  name: string;
  avatar: string; // preset key
  age: number;
  totalXP: number;
  mageLevel: number;
  coins: number;
  currentStreak: number;
  lastPlayedDate: string; // ISO date
  settings: PlayerSettings;
}

interface PlayerSettings {
  soundEnabled: boolean;
  timerEnabled: boolean;
  difficultyOverride: 'auto' | 'easy' | 'medium' | 'hard';
  language: 'pt-pt' | 'pt-br' | 'en';
}

interface Progress {
  story: {
    kingdomsUnlocked: string[]; // ['addition', 'subtraction']
    currentKingdom: string;
    currentLevel: number;
    completedLevels: Record<string, number[]>; // { addition: [1,2,3] }
  };
  freeplay: Record<string, FreeplayProgress>;
}

interface FreeplayProgress {
  highestDifficulty: string;
  totalAttempts: number;
  bestStreak: number;
}

interface Inventory {
  robes: string[];
  wands: string[];
  companions: string[];
  activeRobe: string;
  activeCompanion: string;
  activeWand: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string; // ISO date if unlocked
}

interface GameState {
  player: Player;
  progress: Progress;
  inventory: Inventory;
  achievements: Achievement[];
  currentQuestion: Question | null;
  sessionStats: SessionStats;
}
```

### LocalStorage Keys
- `madrigal_player` - Player profile
- `madrigal_progress` - All progress data
- `madrigal_inventory` - Unlocked items
- `madrigal_achievements` - Achievement state
- `madrigal_settings` - App settings

### Question Generation
- Pre-generated question banks per operation/difficulty (no AI needed)
- Random shuffle each playthrough
- Seeded by level for reproducibility (optional)

### File Structure
```
madrigal/
├── public/
│   ├── index.html
│   ├── manifest.json
│   ├── icons/           # PWA icons
│   └── sounds/          # UI sounds (correct, wrong, levelup)
├── src/
│   ├── index.js
│   ├── App.js
│   ├── App.css
│   ├── components/      # Reusable UI components
│   │   ├── MageAvatar/
│   │   ├── XPBar/
│   │   ├── QuestionCard/
│   │   ├── NumberPad/
│   │   ├── HintButton/
│   │   ├── BottomNav/
│   │   └── ...
│   ├── pages/
│   │   ├── Home/
│   │   ├── CharacterCreation/
│   │   ├── StoryMode/
│   │   ├── FreePlay/
│   │   ├── Challenge/
│   │   ├── Profile/
│   │   ├── Achievements/
│   │   └── Settings/
│   ├── contexts/
│   │   ├── GameContext.js
│   │   └── ThemeContext.js
│   ├── hooks/
│   │   ├── useLocalStorage.js
│   │   ├── useProgress.js
│   │   └── useQuestion.js
│   ├── data/
│   │   ├── questions/   # Pre-generated question sets
│   │   ├── achievements.js
│   │   ├── kingdoms.js
│   │   └── rewards.js
│   ├── utils/
│   │   ├── xp.js
│   │   └── validation.js
│   └── styles/
│       ├── variables.css
│       └── global.css
├── capacitor.config.json
└── package.json
```

---

## 7. Out of Scope (v1)

- Multiplayer / social features
- Cloud save (Firebase) - LocalStorage only for v1
- Parent dashboard
- In-app purchases
- Leaderboards
- Custom question upload
- Audio (beyond basic UI sounds)
- Analytics

---

## 8. Future Considerations (Post-v1)

- Firebase Auth + Cloud Sync
- Android + iOS apps via Capacitor
- Parental lock PIN
- Weekly challenge leaderboard
- Avatar customization (hair, skin tone)
- Multiple save slots (siblings)
- Language expansion (EN, ES)
