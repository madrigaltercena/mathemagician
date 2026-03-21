import React from 'react';
import { motion } from 'framer-motion';
import styles from './NumberPad.module.css';

export default function NumberPad({ onKeyPress, disabled = false }) {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['delete', '0', 'submit'],
  ];

  const handleKey = (key) => {
    if (!disabled) {
      onKeyPress(key);
    }
  };

  const getKeyContent = (key) => {
    if (key === 'delete') return '⌫';
    if (key === 'submit') return '✓';
    return key;
  };

  const isSpecialKey = (key) => key === 'delete' || key === 'submit';

  return (
    <div className={styles.container}>
      {keys.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          {row.map((key) => (
            <motion.button
              key={key}
              className={`${styles.key} ${isSpecialKey(key) ? styles.specialKey : ''} ${key === 'submit' ? styles.submitKey : ''} ${disabled ? styles.disabled : ''}`}
              onClick={() => handleKey(key)}
              whileHover={disabled ? {} : { scale: 1.02 }}
              whileTap={disabled ? {} : { scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              {getKeyContent(key)}
            </motion.button>
          ))}
        </div>
      ))}
    </div>
  );
}
