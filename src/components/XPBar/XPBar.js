import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { motion } from 'framer-motion';
import styles from './XPBar.module.css';

const MAGE_TITLES = {
  1: 'Aprendiz',
  2: 'Aprendiz II',
  3: 'Mago Júnior',
  4: 'Mago',
  5: 'Mago Sênior',
  6: 'Grão-Mago',
  7: 'Mago Supremo',
};

export default function XPBar({ compact = false }) {
  const { state, MAGE_LEVELS } = useGame();
  const { player } = state;
  
  const currentLevelIndex = MAGE_LEVELS.findIndex(l => l.level === player.mageLevel);
  const currentLevel = MAGE_LEVELS[currentLevelIndex];
  const nextLevel = MAGE_LEVELS[currentLevelIndex + 1];
  
  // Calculate progress
  let progress = 0;
  let xpForNextLevel = 0;
  
  if (nextLevel) {
    const xpInCurrentLevel = player.totalXP - currentLevel.xpRequired;
    const xpNeededForNext = nextLevel.xpRequired - currentLevel.xpRequired;
    progress = (xpInCurrentLevel / xpNeededForNext) * 100;
    xpForNextLevel = nextLevel.xpRequired - player.totalXP;
  } else {
    progress = 100; // Max level
  }
  
  const title = MAGE_TITLES[player.mageLevel] || 'Aprendiz';

  if (compact) {
    return (
      <div className={styles.compactContainer}>
        <span className={styles.compactXP}>⭐ {player.totalXP} XP</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.xpText}>⭐ {player.totalXP} XP</span>
        <span className={styles.levelTitle}>{title}</span>
      </div>
      <div className={styles.barContainer}>
        <motion.div 
          className={styles.barFill}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        {progress >= 100 && (
          <motion.div 
            className={styles.sparkle}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>
      {nextLevel && (
        <span className={styles.nextLevelText}>
          Faltam {xpForNextLevel} XP para o próximo nível
        </span>
      )}
    </div>
  );
}
