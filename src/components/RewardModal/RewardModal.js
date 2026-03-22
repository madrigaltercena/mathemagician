import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, House, Star, Trophy } from '@phosphor-icons/react';
import { REWARD_TYPES } from '../../utils/curriculumMap';
import styles from './RewardModal.module.css';

const LEVEL_COMPLETE_MESSAGES = [
  'Continua assim!',
  'Estás cada vez melhor!',
  'A matemática está no teu sangue!',
  'O teu cérebro está super ativo!',
];

function getRandomMessage() {
  return LEVEL_COMPLETE_MESSAGES[Math.floor(Math.random() * LEVEL_COMPLETE_MESSAGES.length)];
}

export default function RewardModal({
  isOpen,
  rewardType = REWARD_TYPES.LEVEL_COMPLETE,
  item = null,
  realmName = '',
  yearNumber = 1,
  yearName = '',
  streakCount = 0,
  onContinue,
  onHome,
}) {
  if (!isOpen) return null;

  const isGameComplete = rewardType === REWARD_TYPES.GAME_COMPLETE;
  const isYearComplete = rewardType === REWARD_TYPES.YEAR_COMPLETE;
  const isHalfYear = rewardType === REWARD_TYPES.HALF_YEAR;
  const isRealmComplete = rewardType === REWARD_TYPES.REALM_COMPLETE;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={`${styles.modal} ${isGameComplete ? styles.gold : isYearComplete ? styles.purple : isHalfYear ? styles.silver : styles.default}`}
          initial={{ opacity: 0, scale: 0.7, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 30 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          {/* Icon */}
          <div className={styles.iconRow}>
            {isGameComplete ? (
              <Trophy size={64} weight="fill" className={styles.trophyIcon} />
            ) : isYearComplete ? (
              <Star size={64} weight="fill" className={styles.trophyIcon} />
            ) : isHalfYear ? (
              <Star size={56} weight="fill" className={styles.trophyIcon} />
            ) : isRealmComplete && item ? (
              <motion.span
                className={styles.itemEmoji}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              >
                {item.emoji}
              </motion.span>
            ) : (
              <motion.span
                className={styles.checkIcon}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.05 }}
              >
                ✓
              </motion.span>
            )}
          </div>

          {/* Title */}
          <h1 className={styles.title}>
            {isGameComplete
              ? '🏆 GRANDE MATHEMAGICIAN! 🏆'
              : isYearComplete
              ? `⭐ Mestre do ${yearName}! ⭐`
              : isHalfYear
              ? `🎉 Estás a meio do ${yearName}! 🎉`
              : isRealmComplete && item
              ? `${item.emoji} Conquistaste ${realmName}!`
              : '✨ Nível Concluído!'}
          </h1>

          {/* Subtitle */}
          <h2 className={styles.subtitle}>
            {isGameComplete
              ? 'Completaste todos os desafios do Mathemagician! A tua jornada está completa!'
              : isYearComplete
              ? 'O teu poder mágico grew imenso! Estás pronto para o próximo ano!'
              : isHalfYear
              ? 'A tua magia está a ficar mais forte! Completa o próximo desafio!'
              : isRealmComplete && item
              ? `Ganhaste: ${item.name}`
              : getRandomMessage()}
          </h2>

          {/* Streak badge */}
          {streakCount >= 3 && (
            <motion.div
              className={styles.streakBadge}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              🔥 Streak: {streakCount}
            </motion.div>
          )}

          {/* Action buttons */}
          <div className={styles.actions}>
            {!isGameComplete && onContinue && (
              <motion.button
                className={styles.continueButton}
                onClick={onContinue}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span>{isYearComplete ? 'Começar próximo ano' : 'Continuar'}</span>
                <ArrowRight size={22} weight="bold" />
              </motion.button>
            )}

            {isGameComplete && onHome && (
              <motion.button
                className={styles.continueButton}
                onClick={onHome}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span>Menu Principal</span>
                <House size={22} weight="fill" />
              </motion.button>
            )}

            <motion.button
              className={styles.homeButton}
              onClick={onHome}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <House size={20} weight="fill" />
              <span>Menu Principal</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
