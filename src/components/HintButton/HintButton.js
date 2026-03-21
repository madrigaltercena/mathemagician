import React from 'react';
import { motion } from 'framer-motion';
import styles from './HintButton.module.css';

export default function HintButton({ remaining = 3, onClick, compact = false }) {
  const hints = Array(3).fill(null).map((_, i) => i < remaining);

  const handleClick = () => {
    if (remaining > 0 && onClick) {
      onClick();
    }
  };

  return (
    <motion.button
      className={`${styles.container} ${compact ? styles.compact : ''} ${remaining === 0 ? styles.exhausted : ''}`}
      onClick={handleClick}
      whileHover={remaining > 0 ? { scale: 1.05 } : {}}
      whileTap={remaining > 0 ? { scale: 0.95 } : {}}
      disabled={remaining === 0}
    >
      <span className={styles.icon}>💡</span>
      <div className={styles.hints}>
        {hints.map((available, i) => (
          <span 
            key={i} 
            className={`${styles.dot} ${available ? styles.available : styles.used}`}
          />
        ))}
      </div>
    </motion.button>
  );
}
