import React from 'react';
import styles from './ProgressDots.module.css';

export default function ProgressDots({ current = 0, total = 5, correct = 0 }) {
  const dots = Array(total).fill(null).map((_, i) => {
    if (i < correct) return 'correct';
    if (i === current) return 'current';
    return 'pending';
  });

  return (
    <div className={styles.container}>
      <div className={styles.dots}>
        {dots.map((state, i) => (
          <span key={i} className={`${styles.dot} ${styles[state]}`} />
        ))}
      </div>
      <span className={styles.label}>Pergunta {current + 1} de {total}</span>
    </div>
  );
}
