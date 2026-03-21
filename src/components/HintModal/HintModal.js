import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './HintModal.module.css';

export default function HintModal({ isOpen, hints = [], currentStep = 0, remaining = 0, onNext, onClose }) {
  if (!hints.length) return null;

  const currentHint = hints[currentStep];
  const isLastStep = currentStep >= hints.length - 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.header}>
              <span className={styles.icon}>💡</span>
              <h3 className={styles.title}>DICA #{currentStep + 1}</h3>
            </div>

            <div className={styles.content}>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={currentStep}
                  className={styles.hintText}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {currentHint}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className={styles.footer}>
              <span className={styles.remaining}>
                💡💡 ({remaining} dicas restantes)
              </span>
              <motion.button
                className={styles.button}
                onClick={isLastStep ? onClose : onNext}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLastStep ? 'ENTENDI!' : 'PRÓXIMA DICA →'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
