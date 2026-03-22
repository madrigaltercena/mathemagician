import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import XPBar from '../../components/XPBar/XPBar';
import BottomNav from '../../components/BottomNav/BottomNav';
import { motion } from 'framer-motion';
import { ArrowLeft, Lightning } from '@phosphor-icons/react';
import styles from './StoryMode.module.css';

// 8 kingdoms, 2 levels each, 5 questions per level = 80 total questions
const KINGDOMS = [
  { id: 'kingdom1', name: 'Reino dos Números Pequenos', icon: '🟡', operation: 'Somas e Subtrações', color: 'var(--color-kingdom-add)', unlockLevel: 1, totalLevels: 2, year: 1 },
  { id: 'kingdom2', name: 'Reino dos Números Crescidos', icon: '🟠', operation: 'Mais Somas e Tabuadas', color: 'var(--color-kingdom-add)', unlockLevel: 3, totalLevels: 2, year: 1 },
  { id: 'kingdom3', name: 'Reino das Tabuadas', icon: '🔵', operation: 'Tabuadas e Mais', color: 'var(--color-kingdom-sub)', unlockLevel: 5, totalLevels: 2, year: 2 },
  { id: 'kingdom4', name: 'Reino dos Grandes Números', icon: '🔷', operation: 'Somas e Tabuadas Grandes', color: 'var(--color-kingdom-sub)', unlockLevel: 7, totalLevels: 2, year: 2 },
  { id: 'kingdom5', name: 'Reino da Multiplicação', icon: '🔴', operation: 'Multiplicar e Dividir', color: 'var(--color-kingdom-mul)', unlockLevel: 9, totalLevels: 2, year: 3 },
  { id: 'kingdom6', name: 'Reino da Divisão', icon: '🔺', operation: 'Divisão e Multiplicação', color: 'var(--color-kingdom-mul)', unlockLevel: 11, totalLevels: 2, year: 3 },
  { id: 'kingdom7', name: 'Reino dos Desafiões Grandes', icon: '🟢', operation: 'Grandes Desafios', color: 'var(--color-kingdom-div)', unlockLevel: 13, totalLevels: 2, year: 4 },
  { id: 'kingdom8', name: 'Reino dos Mágicos', icon: '💜', operation: 'O Grande Des Finale', color: 'var(--color-kingdom-div)', unlockLevel: 15, totalLevels: 2, year: 4 },
];

export default function StoryMode() {
  const navigate = useNavigate();
  const { state } = useGame();
  const { progress } = state;

  const getKingdomProgress = (kingdomId) => {
    const completed = progress.story.completedLevels[kingdomId]?.length || 0;
    return completed;
  };

  const isKingdomUnlocked = (kingdom) => {
    return progress.story.currentLevel >= kingdom.unlockLevel;
  };

  const handleKingdomSelect = (kingdom) => {
    if (!isKingdomUnlocked(kingdom)) return;
    const completed = getKingdomProgress(kingdom.id) >= kingdom.totalLevels;
    const isCurrent = progress.story.currentKingdom === kingdom.id;

    if (isCurrent) {
      // Currently playing kingdom — normal flow, no review flag
      navigate(`/challenge/${kingdom.id}?mode=story&kingdom=${kingdom.id}`);
    } else if (completed) {
      // Past completed kingdom — review mode, no XP/progress accumulation
      navigate(`/challenge/${kingdom.id}?mode=story&kingdom=${kingdom.id}&review=true`);
    } else {
      navigate(`/challenge/${kingdom.id}?mode=story&kingdom=${kingdom.id}`);
    }
  };

  const handleContinue = () => {
    const currentKingdomId = progress.story.currentKingdom || 'kingdom1';
    navigate(`/challenge/${currentKingdomId}?mode=story&kingdom=${currentKingdomId}`);
  };

  // Current kingdom for display
  const currentKingdomId = progress.story.currentKingdom || 'kingdom1';
  const currentKingdomData = KINGDOMS.find(k => k.id === currentKingdomId) || KINGDOMS[0];

  // BUG #2 FIX: determine button text based on whether user has started this kingdom
  const completedInCurrentKingdom = getKingdomProgress(currentKingdomId);
  const hasStarted = completedInCurrentKingdom > 0 || progress.story.currentLevel > 1;
  const continueButtonText = hasStarted ? 'CONTINUAR AVENTURA' : 'COMEÇAR AVENTURA';

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/')}>
          <ArrowLeft size={24} weight="bold" />
        </button>
        <h1 className={styles.title}>Matemágica</h1>
        <XPBar compact />
      </header>

      <div className={styles.journeyPath}>
        <div className={styles.pathLine} />
        {KINGDOMS.map((kingdom, index) => {
          const unlocked = isKingdomUnlocked(kingdom);
          const completed = getKingdomProgress(kingdom.id) >= kingdom.totalLevels;
          const isActive = unlocked && !completed;
          const isPast = completed;
          const isCurrent = progress.story.currentKingdom === kingdom.id;
          const isReviewable = isPast && !isCurrent;

          return (
            <React.Fragment key={kingdom.id}>
              <div
                className={`${styles.kingdomNode} ${!unlocked ? styles.locked : ''} ${isActive ? styles.active : ''} ${isPast ? styles.completed : ''} ${isReviewable ? styles.reviewMode : ''}`}
                onClick={() => handleKingdomSelect(kingdom)}
              >
                <div className={styles.kingdomIcon}>{unlocked ? kingdom.icon : '🔒'}</div>
                <span className={styles.kingdomName}>{kingdom.name}</span>
                {isReviewable && <span className={styles.reviewBadge}>🔄 Revisão</span>}
              </div>
              {index < KINGDOMS.length - 1 && (
                <div className={`${styles.connector} ${unlocked ? styles.connectorActive : ''}`}>
                  {isPast ? '✅' : '○'}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Current Kingdom Info */}
      <section className={styles.currentKingdom}>
        {(() => {
          const completed = getKingdomProgress(currentKingdomData.id);
          const percentage = Math.round((completed / currentKingdomData.totalLevels) * 100);
          return (
            <div className={styles.kingdomInfo}>
              <div className={styles.kingdomHeader}>
                <span className={styles.kingdomIconLarge}>{currentKingdomData.icon}</span>
                <div>
                  <h2 className={styles.kingdomTitle}>{currentKingdomData.name}</h2>
                  <p className={styles.kingdomOp}>{currentKingdomData.operation}</p>
                </div>
              </div>
              <div className={styles.progressSection}>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${percentage}%`, background: currentKingdomData.color }} />
                </div>
                <span className={styles.progressLabel}>{completed}/{currentKingdomData.totalLevels} ({percentage}%)</span>
              </div>
              <p className={styles.levelInfo}>Nível {progress.story.currentLevel} — {currentKingdomData.name}</p>
            </div>
          );
        })()}
      </section>

      {/* Continue Button */}
      <motion.button className={styles.continueButton} onClick={handleContinue} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Lightning size={24} weight="fill" />
        <span>{continueButtonText}</span>
      </motion.button>

      <BottomNav active="play" />
    </div>
  );
}
