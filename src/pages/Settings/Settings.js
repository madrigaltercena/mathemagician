import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav/BottomNav';
import XPBar from '../../components/XPBar/XPBar';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowClockwise,
} from '@phosphor-icons/react';
import styles from './Settings.module.css';

const LANGUAGES = [
  { id: 'pt-pt', label: 'PT-Portugal', flag: '🇵🇹' },
  { id: 'pt-br', label: 'PT-Brasil', flag: '🇧🇷' },
  { id: 'en', label: 'English', flag: '🇬🇧' },
];

const DIFFICULTIES = [
  { id: 'auto', label: 'Automático (por idade)' },
  { id: 'easy', label: 'Fácil' },
  { id: 'medium', label: 'Médio' },
  { id: 'hard', label: 'Difícil' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { state, actions } = useGame();
  const { settings } = state;

  const handleBack = () => {
    navigate(-1);
  };

  const toggleSound = () => {
    actions.updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const toggleTimer = () => {
    actions.updateSettings({ timerEnabled: !settings.timerEnabled });
  };

  const handleDifficultyChange = (difficulty) => {
    actions.updateSettings({ difficultyOverride: difficulty });
  };

  const handleLanguageChange = (language) => {
    actions.updateSettings({ language });
  };

  const handleResetProgress = () => {
    const confirmed = window.confirm(
      '⚠️ CUIDADO! Esta ação vai apagar TODO o teu progresso. Tens a certeza que queres apagar tudo?'
    );
    if (confirmed) {
      actions.resetGame();
      navigate('/');
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          <ArrowLeft size={24} weight="bold" />
        </button>
        <h1 className={styles.title}>⚙️ DEFINIÇÕES</h1>
        <div className={styles.xpBar}>
          <XPBar compact />
        </div>
      </header>

      {/* Settings Sections */}
      <div className={styles.settingsList}>
        {/* Sound */}
        <section className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>🔊 Sons</h3>
          <button className={styles.toggleRow} onClick={toggleSound}>
            <span>Ligar/Desligar</span>
            <div className={`${styles.toggle} ${settings.soundEnabled ? styles.toggleOn : ''}`}>
              <div className={styles.toggleKnob} />
            </div>
          </button>
        </section>

        {/* Timer */}
        <section className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>⏱️ Temporizador</h3>
          <button className={styles.toggleRow} onClick={toggleTimer}>
            <span>30 segundos por pergunta</span>
            <div className={`${styles.toggle} ${settings.timerEnabled ? styles.toggleOn : ''}`}>
              <div className={styles.toggleKnob} />
            </div>
          </button>
        </section>

        {/* Difficulty */}
        <section className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>⚡ Dificuldade manual</h3>
          <div className={styles.radioGroup}>
            {DIFFICULTIES.map((diff) => (
              <label key={diff.id} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="difficulty"
                  value={diff.id}
                  checked={settings.difficultyOverride === diff.id}
                  onChange={() => handleDifficultyChange(diff.id)}
                  className={styles.radioInput}
                />
                <span className={styles.radioText}>{diff.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Language */}
        <section className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>🌐 Idioma</h3>
          <div className={styles.languageList}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                className={`${styles.languageButton} ${settings.language === lang.id ? styles.active : ''}`}
                onClick={() => handleLanguageChange(lang.id)}
              >
                <span className={styles.langFlag}>{lang.flag}</span>
                <span>{lang.label}</span>
                {settings.language === lang.id && (
                  <span className={styles.activeBadge}>★</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Reset */}
        <section className={`${styles.settingSection} ${styles.dangerZone}`}>
          <h3 className={styles.sectionTitle}>🔄 Repor Progresso</h3>
          <div className={styles.dangerContent}>
            <p className={styles.dangerText}>
              Cuidado! Esta ação apaga todo o progresso.
            </p>
            <motion.button
              className={styles.resetButton}
              onClick={handleResetProgress}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowClockwise size={20} weight="bold" />
              <span>REPOR TUDO</span>
            </motion.button>
          </div>
        </section>
      </div>

      <BottomNav active="profile" />
    </div>
  );
}
