/**
 * useChallengeProgress — persists story-mode challenge state to localStorage.
 *
 * Saves: currentIndex, questions, correctCount, hintsUsed
 * Key: madrigal_challenge_progress
 * TTL: 24 hours (expires if user doesn't resume within a day)
 *
 * IMPORTANT: This hook is transparent to the threshold/kingdom system.
 * It only persists/restores per-challenge session state — it does NOT touch
 * currentKingdom, currentLevel, or any story progress in GameContext.
 * The threshold logic in Challenge.js and GameContext.js (commits 99231d5
 * and 933ea56) must remain untouched.
 */
import { useEffect, useRef } from 'react';

const STORAGE_KEY = 'madrigal_challenge_progress';
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Load persisted challenge progress for a given kingdom+level.
 * Returns null if nothing saved, key mismatch, or TTL expired.
 */
export function loadChallengeProgress(kingdom, level) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.kingdom !== kingdom || data.level !== level) return null;
    if (Date.now() - data.savedAt > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * Clear saved challenge progress (call on level complete or retry).
 */
export function clearChallengeProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Save current challenge progress.
 */
export function saveChallengeProgress({ kingdom, level, questionIndex, questions, correctCount, hintsUsed }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      kingdom,
      level,
      questionIndex,
      questions,
      correctCount,
      hintsUsed,
      savedAt: Date.now(),
    }));
  } catch {
    // ignore (quota exceeded etc.)
  }
}

/**
 * Hook: useChallengeProgress(kingdom, level, isStory, isReview)
 *
 * Returns:
 *   savedProgress   — object from localStorage or null
 *   saveProgress()  — call after each answer to persist state
 *   clearProgress() — call on level complete or retry
 */
export function useChallengeProgress(kingdom, level, isStory, isReview) {
  const isFirstRun = useRef(true);
  const savedProgress = useRef(null);

  // On mount / kingdom+level change: load from localStorage
  useEffect(() => {
    if (!isStory || isReview) {
      savedProgress.current = null;
      return;
    }
    savedProgress.current = loadChallengeProgress(kingdom, level);
  }, [kingdom, level, isStory, isReview]);

  const saveProgress = (data) => {
    if (!isStory || isReview) return;
    saveChallengeProgress({ kingdom, level, ...data });
  };

  const clearProgress = () => {
    if (!isStory || isReview) return;
    clearChallengeProgress();
  };

  return {
    savedProgress: isFirstRun.current ? savedProgress.current : null,
    saveProgress,
    clearProgress,
  };
}
