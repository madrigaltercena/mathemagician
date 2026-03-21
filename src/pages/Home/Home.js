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

// 8 kingdoms imported from StoryMode (2 levels each)
const KINGDOMS = [
  { id: 'kingdom1', name: 'Reino dos Números Pequenos', icon: '🟡', totalLevels: 2, unlockLevel: 1 },
  { id: 'kingdom2', name: 'Reino dos Números Crescidos', icon: '🟠', totalLevels: 2, unlockLevel: 3 },
  { id: 'kingdom3', name: 'Reino das Tabuadas', icon: '🔵', totalLevels: 2, unlockLevel: 5 },
  { id: 'kingdom4', name: 'Reino dos Grandes Números', icon: '🔷', totalLevels: 2, unlockLevel: 7 },
  { id: 'kingdom5', name: 'Reino da Multiplicação', icon: '🔴', totalLevels: 2, unlockLevel: 9 },
  { id: 'kingdom6', name: 'Reino da Divisão', icon: '🔺', totalLevels: 2, unlockLevel: 11 },
  { id: 'kingdom7', name: 'Reino dos Desafios Grandes', icon: '🟢', totalLevels: 2, unlockLevel: 13 },
  { id: 'kingdom8', name: 'Reino dos Mágicos', icon: '💜', totalLevels: 2, unlockLevel: 15 },
];

export default function Home() {
  const { state } = useGame();
  const navigate = useNavigate();
  const { player, progress } = state;
  
  const getKingdomProgress = (kingdomId) => {
    const kingdom = KINGDOMS.find(k => k.id === kingdomId);
    if (!kingdom) return { completed: 0, isUnlocked: false, total: kingdom?.totalLevels || 2 };
    const completed = progress.story.completedLevels[kingdomId]?.length || 0;
    const isUnlocked = progress.story.currentLevel >= kingdom.unlockLevel;
    return { completed, isUnlocked, total: kingdom.totalLevels };
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
        <h2 className={styles.sectionTitle}>Os 8 Reinos</h2>
        <div className={styles.kingdomsGrid}>
          {KINGDOMS.map((kingdom, index) => {
            const { completed, isUnlocked, total } = getKingdomProgress(kingdom.id);
            const percentage = Math.round((completed / total) * 100);
            const isCompleted = completed >= total;
            
            return (
              <motion.div
                key={kingdom.id}
                className={`${styles.kingdomCard} ${!isUnlocked ? styles.locked : ''} ${isCompleted ? styles.completed : ''}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => isUnlocked && navigate('/story')}
              >
                <div className={styles.kingdomIcon}>
                  {isUnlocked ? kingdom.icon : '🔒'}
                </div>
                <div className={styles.kingdomInfo}>
                  <span className={styles.kingdomName}>{kingdom.name}</span>
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
