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
    kingdomsUnlocked: ['addition'],
    currentKingdom: 'addition',
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
    
    // Update streak
    updateStreak: () => {
      const today = new Date().toISOString().split('T')[0];
      const lastPlayed = state.player.lastPlayedDate;
      
      if (!lastPlayed) {
        dispatch({ type: ACTIONS.UPDATE_PLAYER, payload: { currentStreak: 1, lastPlayedDate: today } });
        return;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastPlayed === today) {
        return; // Already played today
      } else if (lastPlayed === yesterdayStr) {
        dispatch({ type: ACTIONS.UPDATE_PLAYER, payload: { currentStreak: state.player.currentStreak + 1, lastPlayedDate: today } });
      } else {
        dispatch({ type: ACTIONS.UPDATE_PLAYER, payload: { currentStreak: 1, lastPlayedDate: today } });
      }
    },

    // Complete a level
    completeLevel: (kingdom, level, stars, xpEarned, hintsUsed) => {
      const progress = { ...state.progress };
      
      // Update completed levels
      if (!progress.story.completedLevels[kingdom]) {
        progress.story.completedLevels[kingdom] = [];
      }
      
      // Only update if better score
      const existingIndex = progress.story.completedLevels[kingdom].indexOf(level);
      if (existingIndex === -1 || stars > existingIndex) {
        progress.story.completedLevels[kingdom][level] = stars;
      }
      
      // Update current level if next
      if (level >= progress.story.currentLevel) {
        progress.story.currentLevel = Math.min(level + 1, 25);
      }
      
      // Unlock next kingdom if all 25 levels complete
      const completedCount = progress.story.completedLevels[kingdom]?.filter(Boolean).length || 0;
      if (completedCount >= 25) {
        const kingdomOrder = ['addition', 'subtraction', 'multiplication', 'division'];
        const currentIndex = kingdomOrder.indexOf(kingdom);
        if (currentIndex < kingdomOrder.length - 1) {
          const nextKingdom = kingdomOrder[currentIndex + 1];
          if (!progress.story.kingdomsUnlocked.includes(nextKingdom)) {
            progress.story.kingdomsUnlocked.push(nextKingdom);
          }
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
