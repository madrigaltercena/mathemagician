import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Initial State
const initialPlayer = {
  id: null,
  name: '',
  avatar: null,
  age: 7,
  totalXP: 0,
  mageLevel: 1,
  coins: 0,
  currentStreak: 0,
  lastPlayedDate: null,
  createdAt: null,
};

const initialSettings = {
  soundEnabled: true,
  timerEnabled: true,
  difficultyOverride: 'auto',
  language: 'pt-pt',
};

const initialProgress = {
  story: {
    kingdomsUnlocked: ['kingdom1'],
    currentKingdom: 'kingdom1',
    currentLevel: 1,
    completedLevels: {},
  },
  freeplay: {},
};

const initialInventory = {
  robes: ['purple'],
  wands: ['basic'],
  companions: [],
  activeRobe: 'purple',
  activeCompanion: null,
  activeWand: 'basic',
};

const initialAchievements = [];

// Combined initial state
const initialState = {
  player: initialPlayer,
  settings: initialSettings,
  progress: initialProgress,
  inventory: initialInventory,
  achievements: initialAchievements,
  hasCharacter: false,
};

// Mage Level Thresholds
export const MAGE_LEVELS = [
  { level: 1, title: 'Aprendiz', xpRequired: 0 },
  { level: 2, title: 'Aprendiz II', xpRequired: 200 },
  { level: 3, title: 'Mago Júnior', xpRequired: 500 },
  { level: 4, title: 'Mago', xpRequired: 1000 },
  { level: 5, title: 'Mago Sênior', xpRequired: 2000 },
  { level: 6, title: 'Grão-Mago', xpRequired: 4000 },
  { level: 7, title: 'Mago Supremo', xpRequired: 8000 },
];

// Context
const GameContext = createContext(null);

// Action Types
const ACTIONS = {
  SET_PLAYER: 'SET_PLAYER',
  UPDATE_PLAYER: 'UPDATE_PLAYER',
  ADD_XP: 'ADD_XP',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',
  UPDATE_INVENTORY: 'UPDATE_INVENTORY',
  UNLOCK_ACHIEVEMENT: 'UNLOCK_ACHIEVEMENT',
  SET_CHARACTER: 'SET_CHARACTER',
  RESET_PROGRESS: 'RESET_PROGRESS',
  RESET_GAME: 'RESET_GAME',
  LOAD_SAVED_DATA: 'LOAD_SAVED_DATA',
};

// Reducer
function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_PLAYER:
      return { ...state, player: { ...state.player, ...action.payload } };

    case ACTIONS.UPDATE_PLAYER:
      return { ...state, player: { ...state.player, ...action.payload } };

    case ACTIONS.ADD_XP: {
      const newXP = state.player.totalXP + action.payload;
      let newLevel = state.player.mageLevel;
      
      // Check for level up
      for (let i = MAGE_LEVELS.length - 1; i >= 0; i--) {
        if (newXP >= MAGE_LEVELS[i].xpRequired) {
          newLevel = MAGE_LEVELS[i].level;
          break;
        }
      }
      
      return {
        ...state,
        player: {
          ...state.player,
          totalXP: newXP,
          mageLevel: newLevel,
        },
      };
    }

    case ACTIONS.UPDATE_SETTINGS:
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case ACTIONS.UPDATE_PROGRESS:
      return { ...state, progress: { ...state.progress, ...action.payload } };

    case ACTIONS.UPDATE_INVENTORY:
      return { ...state, inventory: { ...state.inventory, ...action.payload } };

    case ACTIONS.UNLOCK_ACHIEVEMENT: {
      const exists = state.achievements.find(a => a.id === action.payload.id);
      if (exists) return state;
      return { ...state, achievements: [...state.achievements, action.payload] };
    }

    case ACTIONS.SET_CHARACTER:
      return {
        ...state,
        player: {
          ...state.player,
          name: action.payload.name,
          avatar: action.payload.avatar,
          age: action.payload.age,
          id: action.payload.id || Date.now().toString(),
          createdAt: new Date().toISOString(),
        },
        hasCharacter: true,
      };

    case ACTIONS.RESET_GAME:
      return {
        ...initialState,
        hasCharacter: false,
      };

    case ACTIONS.RESET_PROGRESS: {
      return {
        ...state,
        progress: initialState.progress,
      };
    }

    case ACTIONS.LOAD_SAVED_DATA:
      return {
        ...state,
        ...action.payload,
        hasCharacter: action.payload.player?.createdAt ? true : false,
      };

    default:
      return state;
  }
}

// Provider
export function GameProvider({ children }) {
  const [savedPlayer, setSavedPlayer] = useLocalStorage('madrigal_player', null);
  const [savedSettings, setSavedSettings] = useLocalStorage('madrigal_settings', initialSettings);
  const [savedProgress, setSavedProgress] = useLocalStorage('madrigal_progress', initialProgress);
  const [savedInventory, setSavedInventory] = useLocalStorage('madrigal_inventory', initialInventory);
  const [savedAchievements, setSavedAchievements] = useLocalStorage('madrigal_achievements', initialAchievements);
  const [savedHasCharacter, setSavedHasCharacter] = useLocalStorage('madrigal_hasCharacter', false);

  const [state, dispatch] = useReducer(gameReducer, {
    ...initialState,
    player: savedPlayer || initialPlayer,
    settings: savedSettings,
    progress: savedProgress,
    inventory: savedInventory,
    achievements: savedAchievements,
    hasCharacter: savedHasCharacter,
  });

  // Save to localStorage when state changes
  useEffect(() => {
    setSavedPlayer(state.player);
  }, [state.player, setSavedPlayer]);

  useEffect(() => {
    setSavedSettings(state.settings);
  }, [state.settings, setSavedSettings]);

  useEffect(() => {
    setSavedProgress(state.progress);
  }, [state.progress, setSavedProgress]);

  useEffect(() => {
    setSavedInventory(state.inventory);
  }, [state.inventory, setSavedInventory]);

  useEffect(() => {
    setSavedAchievements(state.achievements);
  }, [state.achievements, setSavedAchievements]);

  useEffect(() => {
    setSavedHasCharacter(state.hasCharacter);
  }, [state.hasCharacter, setSavedHasCharacter]);

  // Actions
  const actions = {
    setPlayer: (player) => dispatch({ type: ACTIONS.SET_PLAYER, payload: player }),
    updatePlayer: (updates) => dispatch({ type: ACTIONS.UPDATE_PLAYER, payload: updates }),
    addXP: (amount) => dispatch({ type: ACTIONS.ADD_XP, payload: amount }),
    updateSettings: (settings) => dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: settings }),
    updateProgress: (progress) => dispatch({ type: ACTIONS.UPDATE_PROGRESS, payload: progress }),
    updateInventory: (inventory) => dispatch({ type: ACTIONS.UPDATE_INVENTORY, payload: inventory }),
    unlockAchievement: (achievement) => dispatch({ type: ACTIONS.UNLOCK_ACHIEVEMENT, payload: achievement }),
    setCharacter: (data) => dispatch({ type: ACTIONS.SET_CHARACTER, payload: data }),
    resetGame: () => dispatch({ type: ACTIONS.RESET_GAME }),
    resetProgress: () => dispatch({ type: ACTIONS.RESET_PROGRESS }),
    
    // Update streak — use ref to always read latest player state without closure staleness
    updateStreak: () => {
      const today = new Date().toISOString().split('T')[0];
      // Read current player state at call time via getState() inside dispatch to avoid stale closure
      dispatch((currentState) => {
        const { lastPlayedDate, currentStreak } = currentState.player;
        if (!lastPlayedDate) {
          return { type: ACTIONS.UPDATE_PLAYER, payload: { currentStreak: 1, lastPlayedDate: today } };
        }
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        if (lastPlayedDate === today) {
          return null; // Already played today, no-op
        } else if (lastPlayedDate === yesterdayStr) {
          return { type: ACTIONS.UPDATE_PLAYER, payload: { currentStreak: currentStreak + 1, lastPlayedDate: today } };
        } else {
          return { type: ACTIONS.UPDATE_PLAYER, payload: { currentStreak: 1, lastPlayedDate: today } };
        }
      });
    },

    // Complete a level
    completeLevel: (kingdom, level, stars, xpEarned, hintsUsed) => {
      const progress = { ...state.progress };
      const storyProgress = { ...progress.story };
      progress.story = storyProgress;
      
      // Initialize kingdom array if needed
      if (!storyProgress.completedLevels[kingdom]) {
        storyProgress.completedLevels[kingdom] = [];
      }
      
      // Add level to completed array (avoid duplicates)
      const completedLevels = [...storyProgress.completedLevels[kingdom]];
      if (!completedLevels.includes(level)) {
        completedLevels.push(level);
        storyProgress.completedLevels[kingdom] = completedLevels;
      }
      
      // Update current level if next
      if (level >= storyProgress.currentLevel) {
        storyProgress.currentLevel = Math.min(level + 1, 16);
      }
      
      // Advance kingdom based on level thresholds (8 kingdoms)
      // NOTE: KINGDOM_ORDER and KINGDOM_THRESHOLDS must stay in sync with Challenge.js
      // Thresholds use > comparison: nextKingdom is derived from the NEW currentLevel, not the completed level
      const KINGDOM_ORDER = ['kingdom1', 'kingdom2', 'kingdom3', 'kingdom4', 'kingdom5', 'kingdom6', 'kingdom7', 'kingdom8'];
      const KINGDOM_THRESHOLDS = [0, 2, 4, 6, 8, 10, 12, 14];

      // Derive kingdom from the NEW currentLevel (already incremented), not the completed level
      let nextKingdom = storyProgress.currentKingdom;
      for (let i = KINGDOM_ORDER.length - 1; i >= 0; i--) {
        if (storyProgress.currentLevel > KINGDOM_THRESHOLDS[i]) {
          nextKingdom = KINGDOM_ORDER[i];
          break;
        }
      }
      
      // Update currentKingdom and unlock kingdoms as thresholds are reached
      if (nextKingdom !== storyProgress.currentKingdom) {
        storyProgress.currentKingdom = nextKingdom;
        // Unlock the new kingdom if not already unlocked
        if (!storyProgress.kingdomsUnlocked.includes(nextKingdom)) {
          storyProgress.kingdomsUnlocked.push(nextKingdom);
        }
      }
      
      dispatch({ type: ACTIONS.UPDATE_PROGRESS, payload: progress });
      dispatch({ type: ACTIONS.ADD_XP, payload: xpEarned });
      actions.updateStreak();
    },
  };

  return (
    <GameContext.Provider value={{ state, actions, MAGE_LEVELS }}>
      {children}
    </GameContext.Provider>
  );
}

// Hook
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

// Initial State Export
export { initialPlayer, initialSettings, initialProgress, initialInventory, initialAchievements, initialState };
