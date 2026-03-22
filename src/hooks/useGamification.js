/**
 * useGamification — central hook for all gamification logic.
 *
 * Manages: coins, unlockedItems, unlockedCreatures, rewards,
 * question-level streakCount (for combos), daily quest state.
 *
 * Does NOT manage: story progress (kingdom/level) which lives in GameContext.
 */
import { useCallback, useRef } from 'react';
import { REALM_DATA, getRewardTypeForLevel } from '../utils/curriculumMap';

const STORAGE_KEYS = {
  COINS: 'madrigal_coins',
  INVENTORY: 'madrigal_inventory_v2',
  REWARDS: 'madrigal_rewards',
  STREAK_COUNT: 'madrigal_streak_count',
  DAILY: 'madrigal_daily',
};

// ─── Persistence helpers ────────────────────────────────────────────────────────

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// ─── Initial states ────────────────────────────────────────────────────────────

const initialInventory = {
  unlockedItems: [],    // itemIds
  unlockedCreatures: [], // creatureIds
};

const initialRewards = []; // { id, type, kingdomId, unlockedAt, emoji, title, subtitle }

const initialDaily = {
  date: null,           // ISO date string 'YYYY-MM-DD'
  correctToday: 0,      // correct answers today
  questCompleted: false,
  bonusClaimed: false,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGamification() {
  // Refs to avoid stale closures in callbacks that read current state
  const inventoryRef = useRef(loadFromStorage(STORAGE_KEYS.INVENTORY, initialInventory));
  const rewardsRef = useRef(loadFromStorage(STORAGE_KEYS.REWARDS, initialRewards));
  const streakCountRef = useRef(parseInt(loadFromStorage(STORAGE_KEYS.STREAK_COUNT, '0'), 10));
  const dailyRef = useRef(loadFromStorage(STORAGE_KEYS.DAILY, initialDaily));

  // ─── Coins ──────────────────────────────────────────────────────────────────

  const getCoins = useCallback(() => loadFromStorage(STORAGE_KEYS.COINS, 0), []);

  const addCoins = useCallback((amount) => {
    const current = loadFromStorage(STORAGE_KEYS.COINS, 0);
    saveToStorage(STORAGE_KEYS.COINS, current + amount);
  }, []);

  // ─── Inventory ───────────────────────────────────────────────────────────────

  const getInventory = useCallback(() => inventoryRef.current, []);

  const unlockItem = useCallback((itemId) => {
    const inv = inventoryRef.current;
    if (inv.unlockedItems.includes(itemId)) return false;
    const updated = { ...inv, unlockedItems: [...inv.unlockedItems, itemId] };
    inventoryRef.current = updated;
    saveToStorage(STORAGE_KEYS.INVENTORY, updated);
    return true;
  }, []);

  const unlockCreature = useCallback((creatureId) => {
    const inv = inventoryRef.current;
    if (inv.unlockedCreatures.includes(creatureId)) return false;
    const updated = { ...inv, unlockedCreatures: [...inv.unlockedCreatures, creatureId] };
    inventoryRef.current = updated;
    saveToStorage(STORAGE_KEYS.INVENTORY, updated);
    return true;
  }, []);

  const hasItem = useCallback((itemId) => {
    return inventoryRef.current.unlockedItems.includes(itemId);
  }, []);

  const hasCreature = useCallback((creatureId) => {
    return inventoryRef.current.unlockedCreatures.includes(creatureId);
  }, []);

  // ─── Rewards ───────────────────────────────────────────────────────────────

  const getRewards = useCallback(() => rewardsRef.current, []);

  const addReward = useCallback((reward) => {
    const rew = rewardsRef.current;
    // Avoid duplicates by id
    if (rew.find(r => r.id === reward.id)) return false;
    const updated = [...rew, { ...reward, unlockedAt: new Date().toISOString() }];
    rewardsRef.current = updated;
    saveToStorage(STORAGE_KEYS.REWARDS, updated);
    return true;
  }, []);

  // ─── Question streak (combo) ─────────────────────────────────────────────────

  const getStreakCount = useCallback(() => streakCountRef.current, []);

  const incrementStreak = useCallback(() => {
    streakCountRef.current += 1;
    saveToStorage(STORAGE_KEYS.STREAK_COUNT, streakCountRef.current);
    return streakCountRef.current;
  }, []);

  const resetStreak = useCallback(() => {
    streakCountRef.current = 0;
    saveToStorage(STORAGE_KEYS.STREAK_COUNT, 0);
  }, []);

  // ─── Daily quest ─────────────────────────────────────────────────────────────

  const getDaily = useCallback(() => dailyRef.current, []);

  const today = () => new Date().toISOString().split('T')[0];

  const checkAndResetDaily = useCallback(() => {
    const daily = dailyRef.current;
    const now = today();
    if (daily.date !== now) {
      const fresh = { date: now, correctToday: 0, questCompleted: false, bonusClaimed: false };
      dailyRef.current = fresh;
      saveToStorage(STORAGE_KEYS.DAILY, fresh);
    }
  }, []);

  const addDailyCorrect = useCallback((count = 1) => {
    checkAndResetDaily();
    const daily = dailyRef.current;
    const updated = { ...daily, correctToday: daily.correctToday + count };
    // Auto-complete quest at 5 correct
    if (updated.correctToday >= 5 && !updated.questCompleted) {
      updated.questCompleted = true;
    }
    dailyRef.current = updated;
    saveToStorage(STORAGE_KEYS.DAILY, updated);
    return updated;
  }, [checkAndResetDaily]);

  const claimDailyBonus = useCallback(() => {
    checkAndResetDaily();
    const daily = dailyRef.current;
    if (!daily.questCompleted || daily.bonusClaimed) return false;
    const updated = { ...daily, bonusClaimed: true };
    dailyRef.current = updated;
    saveToStorage(STORAGE_KEYS.DAILY, updated);
    return true;
  }, [checkAndResetDaily]);

  // ─── Level completion processor ──────────────────────────────────────────────
  // Called from Challenge.js when a level is finished.
  // Returns: { rewardType, item, creature, reward }
  // Does NOT mutate story progress — that's GameContext's job.

  const processLevelComplete = useCallback((level, kingdomId) => {
    checkAndResetDaily();

    const rewardType = getRewardTypeForLevel(level);

    // Determine if this is the last level of the kingdom (even level: 2,4,6...)
    const isLastLevelInKingdom = level % 2 === 0;

    let item = null;
    let creature = null;
    let reward = null;

    if (isLastLevelInKingdom) {
      const realm = REALM_DATA[kingdomId];
      if (realm) {
        item = realm.item;
        creature = realm.creature;

        // Unlock item & creature
        unlockItem(realm.item.name);
        unlockCreature(realm.creature.name);

        // Build reward record
        reward = {
          id: `kingdom-${kingdomId}-${level}`,
          type: rewardType,
          kingdomId,
          kingdomName: realm.name,
          emoji: realm.item.emoji,
          title: realm.item.name,
          subtitle: REALM_DATA[kingdomId]?.name || kingdomId,
          item,
          creature,
        };
        addReward(reward);
      }
    }

    // Award coins for completing a level
    addCoins(5);

    return { rewardType, item, creature, reward };
  }, [checkAndResetDaily, unlockItem, unlockCreature, addReward, addCoins]);

  return {
    // Coins
    getCoins,
    addCoins,
    // Inventory
    getInventory,
    unlockItem,
    unlockCreature,
    hasItem,
    hasCreature,
    // Rewards
    getRewards,
    addReward,
    // Combo streak
    getStreakCount,
    incrementStreak,
    resetStreak,
    // Daily quest
    getDaily,
    checkAndResetDaily,
    addDailyCorrect,
    claimDailyBonus,
    // Level completion
    processLevelComplete,
  };
}
