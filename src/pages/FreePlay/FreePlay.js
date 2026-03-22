import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import XPBar from '../../components/XPBar/XPBar';
import BottomNav from '../../components/BottomNav/BottomNav';
import { motion } from 'framer-motion';
import {
  Plus,
  Minus,
  X,
  Divide,
  ArrowLeft,
  Lightning,
} from '@phosphor-icons/react';
import styles from './FreePlay.module.css';

const OPERATIONS = [
  { id: 'addition', label: 'Adição', icon: Plus, color: 'var(--color-kingdom-add)', unlockCondition: () => true },
  { id: 'subtraction', label: 'Subtração', icon: Minus, color: 'var(--color-kingdom-sub)', unlockCondition: () => true },
  { id: 'multiplication', label: 'Multiplicação', icon: X, color: 'var(--color-kingdom-mul)', unlockCondition: () => true },
  { id: 'division', label: 'Divisão', icon: Divide, color: 'var(--color-kingdom-div)', unlockCondition: () => true },
];

const DIFFICULTIES = [
  { id: 'easy', label: 'Fácil' },
  { id: 'medium', label: 'Médio' },
  { id: 'hard', label: 'Difícil' },
];

export default function FreePlay() {
  const navigate = useNavigate();
  useGame();
  const [selectedOperations, setSelectedOperations] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');

  const isOperationUnlocked = (op) => {
    return op.unlockCondition();
  };

  const handleOperationToggle = (opId) => {
    setSelectedOperations(prev =>
      prev.includes(opId)
        ? prev.filter(id => id !== opId)
        : [...prev, opId]
    );
  };

  const handleStartChallenge = () => {
    if (selectedOperations.length === 0) return;
    const opsParam = selectedOperations.join(',');
    navigate(`/challenge/free?mode=freeplay&ops=${opsParam}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          <ArrowLeft size={24} weight="bold" />
        </button>
        <h1 className={styles.title}>MODO LIVRE</h1>
        <div className={styles.xpBar}>
          <XPBar compact />
        </div>
      </header>

      {/* Operation Selection */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Qual operação queres praticar?</h2>
        <div className={styles.operationGrid}>
          {OPERATIONS.map((op) => {
            const Icon = op.icon;
            const unlocked = isOperationUnlocked(op);
            const isSelected = selectedOperations.includes(op.id);
            return (
              <motion.button
                key={op.id}
                className={`${styles.operationCard} ${isSelected ? styles.selected : ''} ${!unlocked ? styles.locked : ''}`}
                style={{ '--op-color': op.color }}
                onClick={() => unlocked && handleOperationToggle(op.id)}
                whileHover={unlocked ? { scale: 1.02 } : {}}
                whileTap={unlocked ? { scale: 0.98 } : {}}
              >
                <Icon size={40} weight="fill" className={styles.operationIcon} />
                <span className={styles.operationLabel}>{op.label}</span>
                <span className={styles.operationStatus}>
                  {unlocked ? '' : '🔒'}
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Difficulty Selection */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Dificuldade</h2>
        <div className={styles.difficultyGrid}>
          {DIFFICULTIES.map((diff) => (
            <motion.button
              key={diff.id}
              className={`${styles.difficultyButton} ${selectedDifficulty === diff.id ? styles.selected : ''}`}
              onClick={() => setSelectedDifficulty(diff.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {diff.label}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Start Button */}
      <motion.button
        className={styles.startButton}
        onClick={handleStartChallenge}
        disabled={selectedOperations.length === 0}
        whileHover={selectedOperations.length > 0 ? { scale: 1.02 } : {}}
        whileTap={selectedOperations.length > 0 ? { scale: 0.98 } : {}}
      >
        <Lightning size={24} weight="fill" />
        <span>COMEÇAR DESAFIO!</span>
      </motion.button>

      <BottomNav active="play" />
    </div>
  );
}
