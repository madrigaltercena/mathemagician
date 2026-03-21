import React from 'react';
import { motion } from 'framer-motion';
import styles from './MageAvatar.module.css';

const AVATAR_EMOJIS = {
  mage1: '🧙‍♂️',
  mage2: '🧙‍♀️',
  mage3: '🧝‍♂️',
  mage4: '🧝‍♀️',
  mage5: '🧚',
  mage6: '🧌',
  default: '🧙‍♂️',
};

export default function MageAvatar({ avatar = 'default', level = 1, size = 'medium', showLevel = false, celebrating = false }) {
  const emoji = AVATAR_EMOJIS[avatar] || AVATAR_EMOJIS.default;

  const sizeClasses = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  };

  return (
    <motion.div 
      className={`${styles.container} ${sizeClasses[size]}`}
      animate={celebrating ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
      transition={celebrating ? { duration: 0.5, repeat: 2 } : {}}
    >
      <div className={styles.avatarCircle}>
        <span className={styles.emoji}>{emoji}</span>
      </div>
      {showLevel && (
        <div className={styles.levelBadge}>
          <span className={styles.levelNumber}>{level}</span>
        </div>
      )}
    </motion.div>
  );
}
