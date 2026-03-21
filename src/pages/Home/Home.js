import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import MageAvatar from '../../components/MageAvatar/MageAvatar';
import XPBar from '../../components/XPBar/XPBar';
import BottomNav from '../../components/BottomNav/BottomNav';
import { motion } from 'framer-motion';
import {
  Sword,
  Target,
  Gear,
} from '@phosphor-icons/react';
import styles from './Home.module.css';

const KINGDOM_ICONS = {
  addition: '🟡',
  subtraction: '🔵',
  multiplication: '🔴',
  division: '🟢',
};

const KINGDOM_NAMES = {
  addition: 'Reino Dourado',
  subtraction: 'Cavernas de Cristal',
  multiplication: 'Floresta de Fogo',
  division: 'Montanhas Esmeralda',
};

export default function Home() {
  const { state } = useGame();
  const navigate = useNavigate();
  const { player, progress } = state;
  
  const kingdoms = ['addition', 'subtraction', 'multiplication', 'division'];
  
  const getKingdomProgress = (kingdom) => {
    const completed = progress.story.completedLevels[kingdom]?.length || 0;
    const isUnlocked = progress.story.kingdomsUnlocked.includes(kingdom);
    return { completed, isUnlocked, total: 25 };
  };

  const handlePlayStory = () => {
    navigate('/story');
  };

  const handlePlayFree = () => {
    navigate('/freeplay');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <XPBar />
        <div className={styles.streakBadge}>
          🔥 {player.currentStreak}
        </div>
      </header>
      
      {/* Character Card */}
      <motion.div 
        className={styles.characterCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.avatarSection}>
          <MageAvatar avatar={player.avatar} level={player.mageLevel} size="large" />
        </div>
        <div className={styles.greeting}>
          <h1 className={styles.playerName}>Olá, {player.name || 'Mago'}!</h1>
          <p className={styles.mageTitle}>
            {player.mageLevel === 1 ? 'Aprendiz' : 
             player.mageLevel === 2 ? 'Aprendiz II' :
             player.mageLevel === 3 ? 'Mago Júnior' :
             player.mageLevel === 4 ? 'Mago' :
             player.mageLevel === 5 ? 'Mago Sênior' :
             player.mageLevel === 6 ? 'Grão-Mago' : 'Mago Supremo'} ✨
          </p>
        </div>
        <div className={styles.equipment}>
          <span className={styles.equipmentItem}>👕 {state.inventory.activeRobe}</span>
          {state.inventory.activeCompanion && (
            <span className={styles.equipmentItem}>🦊 {state.inventory.activeCompanion}</span>
          )}
        </div>
      </motion.div>
      
      {/* Play Buttons */}
      <div className={styles.playButtons}>
        <motion.button 
          className={styles.playButtonPrimary}
          onClick={handlePlayStory}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Sword size={28} weight="fill" />
          <span>JOGAR AVENTURA</span>
        </motion.button>
        
        <motion.button 
          className={styles.playButtonSecondary}
          onClick={handlePlayFree}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Target size={28} weight="fill" />
          <span>MODO LIVRE</span>
        </motion.button>
      </div>
      
      {/* Kingdom Progress */}
      <section className={styles.kingdomsSection}>
        <h2 className={styles.sectionTitle}>Os 4 Reinos</h2>
        <div className={styles.kingdomsGrid}>
          {kingdoms.map((kingdom, index) => {
            const { completed, isUnlocked, total } = getKingdomProgress(kingdom);
            const percentage = Math.round((completed / total) * 100);
            const isCompleted = completed >= 25;
            
            return (
              <motion.div
                key={kingdom}
                className={`${styles.kingdomCard} ${!isUnlocked ? styles.locked : ''} ${isCompleted ? styles.completed : ''}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => isUnlocked && navigate('/story')}
              >
                <div className={styles.kingdomIcon}>
                  {KINGDOM_ICONS[kingdom]}
                </div>
                <div className={styles.kingdomInfo}>
                  <span className={styles.kingdomName}>{KINGDOM_NAMES[kingdom]}</span>
                  <div className={styles.kingdomProgress}>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className={styles.progressText}>{completed}/{total}</span>
                  </div>
                </div>
                {!isUnlocked && <div className={styles.lockOverlay}>🔒</div>}
                {isCompleted && <div className={styles.completedBadge}>✨</div>}
              </motion.div>
            );
          })}
        </div>
      </section>
      
      {/* Settings */}
      <motion.button 
        className={styles.settingsButton}
        onClick={handleSettings}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Gear size={24} weight="fill" />
        <span>Definições</span>
      </motion.button>
      
      <BottomNav active="home" />
    </div>
  );
}
