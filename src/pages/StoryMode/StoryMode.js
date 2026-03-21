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

// Which level completes each kingdom
const KINGDOM_COMPLETION = { 2: 1, 4: 2, 6: 3, 8: 4, 10: 5, 12: 6, 14: 7, 16: 8 };

// Half-year milestones (level 2, 4, 6, 8, 10, 12, 14, 16)
const HALF_YEAR_LEVELS = [2, 4, 6, 8, 10, 12, 14, 16];

// Full year milestones (level 4, 8, 12, 16)
const YEAR_COMPLETION_LEVELS = [4, 8, 12, 16];

// Year names for messages
const YEAR_NAMES = { 1: '1º ano', 2: '2º ano', 3: '3º ano', 4: '4º ano' };

export default function StoryMode() {
  const navigate = useNavigate();
  const { state } = useGame();
  const { progress, settings, player } = state;

  const getKingdomProgress = (kingdomId) => {
    const kingdom = KINGDOMS.find(k => k.id === kingdomId);
    const completed = progress.story.completedLevels[kingdomId]?.length || 0;
    return completed;
  };

  const isKingdomUnlocked = (kingdom) => {
    return progress.story.currentLevel >= kingdom.unlockLevel;
  };

  const handleKingdomSelect = (kingdom) => {
    if (!isKingdomUnlocked(kingdom)) return;
    navigate(`/challenge/${kingdom.id}?mode=story`);
  };

  const handleContinue = () => {
    const currentKingdomId = progress.story.currentKingdom || 'kingdom1';
    navigate(`/challenge/${currentKingdomId}?mode=story`);
  };

  // Get year milestone type for current level
  const getYearMilestone = (level) => {
    if (YEAR_COMPLETION_LEVELS.includes(level)) return 'year_complete';
    if (HALF_YEAR_LEVELS.includes(level)) return 'half_year';
    return null;
  };

  // Current kingdom for display
  const currentKingdomId = progress.story.currentKingdom || 'kingdom1';
  const currentKingdomData = KINGDOMS.find(k => k.id === currentKingdomId) || KINGDOMS[0];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/')}>
          <ArrowLeft size={24} weight="bold" />
        </button>
        <h1 className={styles.title}>Zooterprise</h1>
        <XPBar compact />
      </header>

      <div className={styles.journeyPath}>
        <div className={styles.pathLine} />
        {KINGDOMS.map((kingdom, index) => {
          const unlocked = isKingdomUnlocked(kingdom);
          const completed = getKingdomProgress(kingdom.id) >= kingdom.totalLevels;
          const isActive = unlocked && !completed;
          const isPast = completed;

          return (
            <React.Fragment key={kingdom.id}>
              <div
                className={`${styles.kingdomNode} ${!unlocked ? styles.locked : ''} ${isActive ? styles.active : ''} ${isPast ? styles.completed : ''}`}
                onClick={() => handleKingdomSelect(kingdom)}
              >
                <div className={styles.kingdomIcon}>{unlocked ? kingdom.icon : '🔒'}</div>
                <span className={styles.kingdomName}>{kingdom.name}</span>
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
        <span>CONTINUAR AVENTURA</span>
      </motion.button>

      <BottomNav active="play" />
    </div>
  );
}
