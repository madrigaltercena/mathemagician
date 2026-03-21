import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import XPBar from '../../components/XPBar/XPBar';
import BottomNav from '../../components/BottomNav/BottomNav';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Lightning,
} from '@phosphor-icons/react';
import styles from './StoryMode.module.css';

const KINGDOMS = [
  { 
    id: 'addition', 
    name: 'Reino Dourado', 
    icon: '🟡',
    operation: 'Adição',
    color: 'var(--color-kingdom-add)',
    unlockLevel: 0,
  },
  { 
    id: 'subtraction', 
    name: 'Cavernas de Cristal', 
    icon: '🔵',
    operation: 'Subtração',
    color: 'var(--color-kingdom-sub)',
    unlockLevel: 5,
  },
  { 
    id: 'multiplication', 
    name: 'Floresta de Fogo', 
    icon: '🔴',
    operation: 'Multiplicação',
    color: 'var(--color-kingdom-mul)',
    unlockLevel: 10,
  },
  { 
    id: 'division', 
    name: 'Montanhas Esmeralda', 
    icon: '🟢',
    operation: 'Divisão',
    color: 'var(--color-kingdom-div)',
    unlockLevel: 15,
  },
];

export default function StoryMode() {
  const navigate = useNavigate();
  const { state } = useGame();
  const { progress, settings, player } = state;
  
  const getDifficulty = () => {
    if (settings.difficultyOverride !== 'auto') return settings.difficultyOverride;
    if (player.age <= 6) return 'easy';
    if (player.age <= 8) return 'medium';
    return 'hard';
  };

  const handleKingdomSelect = (kingdom) => {
    const isUnlocked = progress.story.kingdomsUnlocked.includes(kingdom.id);
    if (isUnlocked) {
      navigate(`/challenge/${kingdom.id}?difficulty=${getDifficulty()}&mode=story`);
    }
  };

  const handleContinue = () => {
    const currentKingdom = progress.story.currentKingdom || 'addition';
    navigate(`/challenge/${currentKingdom}?difficulty=${getDifficulty()}&mode=story`);
  };

  const handleBack = () => {
    navigate('/');
  };

  const getKingdomProgress = (kingdomId) => {
    const completed = progress.story.completedLevels[kingdomId]?.length || 0;
    return completed;
  };

  const isKingdomUnlocked = (kingdom) => {
    // Check if kingdom is in unlocked list OR if current level meets threshold
    return progress.story.kingdomsUnlocked.includes(kingdom.id) ||
           progress.story.currentLevel >= kingdom.unlockLevel;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          <ArrowLeft size={24} weight="bold" />
        </button>
        <h1 className={styles.title}>⚔️ MODO HISTÓRIA</h1>
        <div className={styles.xpBar}>
          <XPBar compact />
        </div>
      </header>

      {/* Kingdom Map */}
      <section className={styles.kingdomMap}>
        <div className={styles.castleSection}>
          <div className={styles.castle}>🏰</div>
          <p className={styles.castleLabel}>CASTELO CENTRAL</p>
          <p className={styles.castleSubLabel}>(Você está aqui)</p>
        </div>

        <div className={styles.kingdomPaths}>
          {KINGDOMS.map((kingdom, index) => {
            const completed = getKingdomProgress(kingdom.id);
            const unlocked = isKingdomUnlocked(kingdom);
            const isCompleted = completed >= 25;
            
            return (
              <motion.div
                key={kingdom.id}
                className={`${styles.kingdomNode} ${!unlocked ? styles.locked : ''} ${isCompleted ? styles.completed : ''}`}
                style={{ '--kingdom-color': kingdom.color }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleKingdomSelect(kingdom)}
              >
                <div className={styles.kingdomIcon}>
                  {kingdom.icon}
                </div>
                <span className={styles.kingdomName}>{kingdom.name}</span>
                {!unlocked && <span className={styles.lockIcon}>🔒</span>}
                {isCompleted && <span className={styles.checkIcon}>✅</span>}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Current Kingdom Info - show the kingdom matching currentKingdom from state */}
      <section className={styles.currentKingdom}>
        {(() => {
          const currentKingdomData = KINGDOMS.find(k => k.id === progress.story.currentKingdom) || KINGDOMS[0];
          const completed = getKingdomProgress(currentKingdomData.id);
          const percentage = Math.round((completed / 25) * 100);
          
          return (
            <div key={currentKingdomData.id} className={styles.kingdomInfo}>
              <div className={styles.kingdomHeader}>
                <span className={styles.kingdomIconLarge}>{currentKingdomData.icon}</span>
                <div>
                  <h2 className={styles.kingdomTitle}>{currentKingdomData.name}</h2>
                  <p className={styles.kingdomOp}>{currentKingdomData.operation}</p>
                </div>
              </div>
              
              <div className={styles.progressSection}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${percentage}%`, background: currentKingdomData.color }}
                  />
                </div>
                <span className={styles.progressLabel}>Progresso: {percentage}%</span>
              </div>
              
              <p className={styles.levelInfo}>
                Nível atual: {progress.story.currentLevel} / 25
              </p>
            </div>
          );
        })()}
      </section>

      {/* Continue Button */}
      <motion.button
        className={styles.continueButton}
        onClick={handleContinue}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Lightning size={24} weight="fill" />
        <span>CONTINUAR AVENTURA</span>
      </motion.button>

      <BottomNav active="play" />
    </div>
  );
}
