import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, ArrowRight, House } from '@phosphor-icons/react';
import styles from './AgeCompletionModal.module.css';

// Half-year milestones: level 2, 4, 6, 8, 10, 12, 14, 16
const HALF_YEAR = {
  2:  { year: 1, title: '🎉 Estás a meio do 1º ano!', subtitle: 'Continua para completares o primeiro ano!', cta: 'Continuar' },
  4:  { year: 1, title: '🎉 Parabéns! Completaste o 1º ano!', subtitle: 'Estás pronto para o 2º ano!', cta: 'Começar 2º ano' },
  6:  { year: 2, title: '🎉 Estás a meio do 2º ano!', subtitle: 'Quase lá! Completa o próximo desafio!', cta: 'Continuar' },
  8:  { year: 2, title: '🎉 Parabéns! Completaste o 2º ano!', subtitle: 'Estás pronto para o 3º ano!', cta: 'Começar 3º ano' },
  10: { year: 3, title: '🎉 Estás a meio do 3º ano!', subtitle: 'Quase a chegar ao último ano!', cta: 'Continuar' },
  12: { year: 3, title: '🎉 Parabéns! Completaste o 3º ano!', subtitle: 'Só falta o 4º ano!', cta: 'Começar 4º ano' },
  14: { year: 4, title: '🎉 Estás a meio do 4º ano!', subtitle: 'O grande finale está a chegar!', cta: 'Continuar' },
  16: { year: 4, title: '🏆 Fantástico! Completaste o 4º ano!', subtitle: 'Tu és um verdadeiro Mago da Matemática!', cta: 'Jogar novamente' },
};

export default function AgeCompletionModal({ isOpen, level, streak = 0, onContinue, onRestart, onHome }) {
  const msg = HALF_YEAR[level];
  if (!msg) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className={styles.overlay}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className={styles.modal}
            initial={{ opacity: 0, scale: 0.7, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}>

            <div className={styles.trophyIcon}>
              {level === 16 ? <Trophy size={64} weight="fill" /> : <Star size={64} weight="fill" />}
            </div>

            <h1 className={styles.title}>{msg.title}</h1>
            <h2 className={styles.subtitle}>{msg.subtitle}</h2>

            <div className={styles.yearBadge}>
              <span className={styles.yearLabel}>Ano:</span>
              <span className={styles.yearValue}>{msg.year}º ano</span>
            </div>

            {streak > 0 && (
              <div className={styles.streakBadge}>
                <span>🔥 Streak: {streak}</span>
              </div>
            )}

            <div className={styles.actions}>
              {level < 16 ? (
                <motion.button className={styles.continueButton} onClick={onContinue}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <span>{msg.cta}</span>
                  <ArrowRight size={22} weight="bold" />
                </motion.button>
              ) : (
                <motion.button className={styles.continueButton} onClick={onRestart}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <span>{msg.cta}</span>
                  <ArrowRight size={22} weight="bold" />
                </motion.button>
              )}

              <motion.button className={styles.homeButton} onClick={onHome}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <House size={20} weight="fill" />
                <span>Menu Principal</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
