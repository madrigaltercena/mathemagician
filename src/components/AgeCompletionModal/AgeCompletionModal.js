import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowRight, House } from '@phosphor-icons/react';
import styles from './AgeCompletionModal.module.css';

const AGE_MESSAGES = {
  4: {
    title: '🎉 Completaste o 1.º Ano!',
    subtitle: 'Já sabes somar e subtrair muito bem!',
    description: 'Estás pronto para aprender as tabuadas e números ainda maiores!',
    cta: 'Começar desafios dos 7 anos',
    year: 6,
  },
  9: {
    title: '🎉 Parabéns! Completaste o 2.º Ano!',
    subtitle: 'As tabuadas já não têm segredos para ti!',
    description: 'Vais aprender a multiplicar e dividir como um verdadeiro mágico!',
    cta: 'Começar desafios dos 8 anos',
    year: 7,
  },
  14: {
    title: '🎉 Incrível! Completaste o 3.º Ano!',
    subtitle: 'Dominaste a multiplicação e divisão!',
    description: 'Os desafios ficam ainda mais emocionantes...',
    cta: 'Começar desafios dos 9 anos',
    year: 8,
  },
  20: {
    title: '🏆 Fantástico! Completaste o 4.º Ano!',
    subtitle: 'És um verdadeiro Mago da Matemática!',
    description: 'Concluiste toda a aventura. Queres jogar novamente com desafios mais difíceis?',
    cta: 'Jogar novamente (modo difícil)',
    year: '9-10',
  },
};

export default function AgeCompletionModal({ 
  isOpen, 
  level, 
  onContinue, 
  onRestart 
}) {
  const message = AGE_MESSAGES[level];
  if (!message) return null;

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
            initial={{ opacity: 0, scale: 0.7, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div className={styles.trophyIcon}>
              <Trophy size={64} weight="fill" />
            </div>
            
            <h1 className={styles.title}>{message.title}</h1>
            <h2 className={styles.subtitle}>{message.subtitle}</h2>
            <p className={styles.description}>{message.description}</p>
            
            <div className={styles.yearBadge}>
              <span className={styles.yearLabel}>Idade recomendada:</span>
              <span className={styles.yearValue}>{message.year} anos</span>
            </div>

            <div className={styles.actions}>
              {level < 20 ? (
                <motion.button 
                  className={styles.continueButton}
                  onClick={onContinue}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span>{message.cta}</span>
                  <ArrowRight size={22} weight="bold" />
                </motion.button>
              ) : (
                <motion.button 
                  className={styles.continueButton}
                  onClick={onRestart}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span>{message.cta}</span>
                  <ArrowRight size={22} weight="bold" />
                </motion.button>
              )}
              
              <motion.button 
                className={styles.homeButton}
                onClick={onRestart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
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
