import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Lightning,
} from '@phosphor-icons/react';
import styles from './CharacterCreation.module.css';

const AVATARS = [
  { id: 'mage1', emoji: '🧙‍♂️', name: 'Mago Azul', gender: 'boy' },
  { id: 'mage2', emoji: '🧙‍♀️', name: 'Maga Rosa', gender: 'girl' },
  { id: 'mage3', emoji: '🧝‍♂️', name: 'Elfo Verde', gender: 'boy' },
  { id: 'mage4', emoji: '🧝‍♀️', name: 'Elfa Dourada', gender: 'girl' },
  { id: 'mage5', emoji: '🧚', name: 'Fada Mágica', gender: 'girl' },
  { id: 'mage6', emoji: '🧌', name: 'Duende', gender: 'boy' },
];

export default function CharacterCreation() {
  const { actions } = useGame();
  const [name, setName] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [error, setError] = useState('');

  const currentAvatar = AVATARS[avatarIndex];

  const handlePrevAvatar = () => {
    setAvatarIndex(prev => (prev === 0 ? AVATARS.length - 1 : prev - 1));
  };

  const handleNextAvatar = () => {
    setAvatarIndex(prev => (prev === AVATARS.length - 1 ? 0 : prev + 1));
  };

  const validateName = (value) => {
    // Allow only letters and spaces, max 12 chars
    const cleaned = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').slice(0, 12);
    return cleaned;
  };

  const handleNameChange = (e) => {
    const cleaned = validateName(e.target.value);
    setName(cleaned);
    setError('');
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Escreve o teu nome para continuar!');
      return;
    }
    if (name.trim().length < 2) {
      setError('O nome precisa de pelo menos 2 letras!');
      return;
    }

    actions.setCharacter({
      name: name.trim(),
      avatar: currentAvatar.id,
    });
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>✨ CRIAR O TEU MAGO ✨</h1>
      </header>

      {/* Avatar Selection */}
      <section className={styles.avatarSection}>
        <motion.div 
          className={styles.avatarDisplay}
          key={avatarIndex}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <span className={styles.avatarEmoji}>{currentAvatar.emoji}</span>
        </motion.div>
        
        <div className={styles.avatarNav}>
          <button className={styles.navButton} onClick={handlePrevAvatar}>
            <ArrowLeft size={24} weight="bold" />
          </button>
          <div className={styles.avatarDots}>
            {AVATARS.map((_, index) => (
              <span 
                key={index}
                className={`${styles.dot} ${index === avatarIndex ? styles.activeDot : ''}`}
              />
            ))}
          </div>
          <button className={styles.navButton} onClick={handleNextAvatar}>
            <ArrowRight size={24} weight="bold" />
          </button>
        </div>
      </section>

      {/* Name Input */}
      <section className={styles.nameSection}>
        <label className={styles.label}>Qual é o teu nome?</label>
        <input
          type="text"
          className={`${styles.nameInput} ${error ? styles.inputError : ''}`}
          value={name}
          onChange={handleNameChange}
          placeholder="Escreve aqui..."
          maxLength={12}
          autoComplete="off"
        />
        {error && <span className={styles.errorText}>{error}</span>}
      </section>

      {/* Submit Button */}
      <motion.button
        className={styles.submitButton}
        onClick={handleSubmit}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Lightning size={24} weight="fill" />
        <span>COMEÇAR AVENTURA!</span>
      </motion.button>
    </div>
  );
}
