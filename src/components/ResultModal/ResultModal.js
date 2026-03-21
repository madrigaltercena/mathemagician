import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { House, ArrowClockwise, ArrowRight } from '@phosphor-icons/react';
import styles from './ResultModal.module.css';

export default function ResultModal({ 
  isOpen, 
  correct = 0, 
  total = 5, 
  xpEarned = 0, 
  hintsUsed = 0, 
  streak = 0,
  onClose,
  onNext,
  onRetry,
  onHome 
}) {
  const percentage = Math.round((correct / total) * 100);
  const stars = percentage >= 100 ? 3 : percentage >= 80 ? 2 : percentage >= 60 ? 1 : 0;
  
  const getMessage = () => {
    if (percentage >= 100) return 'Perfeito! 🌟';
    if (percentage >= 80) return 'Muito bem! ✨';
    if (percentage >= 60) return 'Bom trabalho! 👍';
    return 'Tenta outra vez! 💪';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>✨ NÍVEL COMPLETO! ✨</h2>
              <p className={styles.message}>{getMessage()}</p>
            </div>

            <div className={styles.stars}>
              {[1, 2, 3].map((star) => (
                <motion.span 
                  key={star}
                  className={`${styles.star} ${star <= stars ? styles.earned : ''}`}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: star * 0.2, type: 'spring', stiffness: 200 }}
                >
                  ⭐
                </motion.span>
              ))}
            </div>

            <div className={styles.stats}>
              <p className={styles.correctText}>
                {correct} em {total} respostas corretas
              </p>
              
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statIcon}>+{xpEarned} XP</span>
                </div>
                {hintsUsed > 0 && (
                  <div className={styles.statItem}>
                    <span className={styles.statIcon}>💡 {hintsUsed} dica{hintsUsed > 1 ? 's' : ''}</span>
                  </div>
                )}
                {streak > 0 && (
                  <div className={styles.statItem}>
                    <span className={styles.statIcon}>🔥 Streak: {streak}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.actions}>
              <motion.button 
                className={styles.retryButton}
                onClick={onRetry}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowClockwise size={20} weight="bold" />
                <span>REPETIR</span>
              </motion.button>
              
              <motion.button 
                className={styles.nextButton}
                onClick={onNext}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>SEGUINTE</span>
                <ArrowRight size={20} weight="bold" />
              </motion.button>
            </div>

            <motion.button 
              className={styles.homeButton}
              onClick={onHome}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <House size={20} weight="fill" />
              <span>CASA</span>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
