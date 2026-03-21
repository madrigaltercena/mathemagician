import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import NumberPad from '../../components/NumberPad/NumberPad';
import XPBar from '../../components/XPBar/XPBar';
import HintButton from '../../components/HintButton/HintButton';
import ProgressDots from '../../components/ProgressDots/ProgressDots';
import HintModal from '../../components/HintModal/HintModal';
import ResultModal from '../../components/ResultModal/ResultModal';
import AgeCompletionModal from '../../components/AgeCompletionModal/AgeCompletionModal';
import { generateQuestions, generateHint, calculateStars } from '../../utils/questions';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SpeakerHigh,
  SpeakerSlash,
  ArrowLeft,
} from '@phosphor-icons/react';
import styles from './Challenge.module.css';

const OPERATION_LABELS = {
  kingdom1: 'Somas e Subtrações',
  kingdom2: 'Mais Somas e Tabuadas',
  kingdom3: 'Tabuadas e Mais',
  kingdom4: 'Somas e Tabuadas Grandes',
  kingdom5: 'Multiplicar e Dividir',
  kingdom6: 'Divisão e Multiplicação',
  kingdom7: 'Grandes Desafios',
  kingdom8: 'O Grande Des Finale',
};

const KINGDOM_NAMES = {
  kingdom1: 'Reino dos Números Pequenos',
  kingdom2: 'Reino dos Números Crescidos',
  kingdom3: 'Reino das Tabuadas',
  kingdom4: 'Reino dos Grandes Números',
  kingdom5: 'Reino da Multiplicação',
  kingdom6: 'Reino da Divisão',
  kingdom7: 'Reino dos Desafios Grandes',
  kingdom8: 'Reino dos Mágicos',
};

export default function Challenge({ onBack, onComplete }) {
  const navigate = useNavigate();
  const { state, actions } = useGame();
  const { settings, player } = state;

  // Read URL params
  const { operation: urlOp } = useParams(); // path param: kingdom id (story) or operation (freeplay)
  const [searchParams] = useSearchParams();
  const urlMode = searchParams.get('mode'); // 'story' or 'freeplay'
  const urlOperation = searchParams.get('operation'); // operation override (freeplay)
  const urlKingdom = searchParams.get('kingdom'); // kingdom id (story mode via query string)

  const isFreePlay = urlMode === 'freeplay';

  // Determine kingdom and operation based on mode
  // In freeplay: use URL operation, don't touch story state
  // In story: use URL kingdom or path param, fall back to story state
  const storyKingdom = state.progress.story.currentKingdom || 'kingdom1';
  const storyLevel = state.progress.story.currentLevel;
  const currentKingdom = isFreePlay
    ? (urlKingdom || urlOp || 'kingdom1')
    : (urlKingdom || urlOp || storyKingdom);
  const currentLevel = storyLevel;
  // In freeplay, force a single operation; in story, use level config (null)
  const currentOperation = isFreePlay ? (urlOperation || urlOp || 'addition') : null;

  const [questions, setQuestions] = useState(() =>
    generateQuestions(currentKingdom, currentLevel, 5, currentOperation)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState([]);
  const [hintStep, setHintStep] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showAgeCompletion, setShowAgeCompletion] = useState(false);
  const [answerState, setAnswerState] = useState(null); // 'correct', 'wrong', null
  const [shake, setShake] = useState(false);
  const [hintsUsedPerQuestion, setHintsUsedPerQuestion] = useState({});

  // Regenerate questions when kingdom or level changes
  useEffect(() => {
    setQuestions(generateQuestions(currentKingdom, currentLevel, 5, currentOperation));
    setCurrentIndex(0);
    setUserAnswer('');
    setHintsRemaining(3);
    setHintsUsedPerQuestion({});
    setCorrectCount(0);
    setShowResult(false);
    setAnswerState(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKingdom, currentLevel]);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleKeyPress = (key) => {
    if (key === 'delete') {
      setUserAnswer(prev => prev.slice(0, -1));
    } else if (key === 'submit') {
      checkAnswer();
    } else {
      setUserAnswer(prev => prev + key);
    }
  };

  const checkAnswer = () => {
    if (!userAnswer) return;

    const correct = parseInt(userAnswer, 10) === currentQuestion.answer;

    if (correct) {
      setAnswerState('correct');
      setCorrectCount(prev => prev + 1);
      setTimeout(() => {
        setAnswerState(null);
        nextQuestion();
      }, 1200);
    } else {
      setAnswerState('wrong');
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setAnswerState(null);
        setUserAnswer(''); // Clear for retry
      }, 1500);
    }
  };

  const nextQuestion = () => {
    if (isLastQuestion) {
      finishChallenge();
    } else {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer('');
      setHintStep(0);
    }
  };

  const finishChallenge = () => {
    const stars = calculateStars(correctCount, questions.length);
    const totalHintsUsed = Object.values(hintsUsedPerQuestion).reduce((sum, used) => sum + used, 0);
    const xpEarned = (stars * 10) - (totalHintsUsed * 3);
    const completedLevel = state.progress.story.currentLevel;

    // Only update story progress in story mode, not freeplay
    if (!isFreePlay) {
      actions.completeLevel(currentKingdom, completedLevel, stars, Math.max(0, xpEarned), totalHintsUsed);
    } else {
      // In freeplay: just add XP and update streak, don't advance story
      actions.addXP(Math.max(0, xpEarned));
      actions.updateStreak();
    }

    // Show milestone modal at half-year levels (story mode only)
    const HALF_YEAR_LEVELS = [2, 4, 6, 8, 10, 12, 14, 16];
    if (!isFreePlay && HALF_YEAR_LEVELS.includes(completedLevel)) {
      setShowAgeCompletion(true);
      setShowResult(false);
    } else {
      setShowResult(true);
    }
  };

  const handleUseHint = () => {
    if (hintsRemaining <= 0) return;

    const hint = generateHint(currentQuestion);
    setCurrentHint(hint);
    setHintStep(0);
    setHintsRemaining(prev => prev - 1);
    setHintsUsedPerQuestion(prev => ({
      ...prev,
      [currentIndex]: (prev[currentIndex] || 0) + 1
    }));
    setShowHint(true);
  };

  const handleHintStep = () => {
    if (hintStep < currentHint.length - 1) {
      setHintStep(prev => prev + 1);
    } else {
      setShowHint(false);
      setHintStep(0);
    }
  };

  const handleCloseHint = () => {
    setShowHint(false);
    setHintStep(0);
  };

  const handleResultClose = () => {
    if (onComplete) {
      onComplete();
    } else if (onBack) {
      onBack();
    }
  };

  const handleAgeContinue = () => {
    setShowAgeCompletion(false);
    setShowResult(false);
    if (onComplete) {
      onComplete();
    } else if (onBack) {
      onBack();
    }
  };

  const handleAgeRestart = () => {
    setShowAgeCompletion(false);
    setShowResult(false);
    actions.resetProgress();
    if (onBack) {
      onBack();
    }
  };

  const handleRetry = () => {
    // Decrement currentLevel before retry so user replays the same level
    const currentProgress = { ...state.progress };
    if (currentProgress.story.currentLevel > 1) {
      currentProgress.story.currentLevel -= 1;
      actions.updateProgress(currentProgress);
    }
    // Questions will be regenerated via useEffect when state changes
  };

  const handleNext = () => {
    // Read fresh from state to get the kingdom/level that was just set by completeLevel
    const nextKingdom = state.progress.story.currentKingdom;
    const nextLevel = state.progress.story.currentLevel;
    setQuestions(generateQuestions(nextKingdom, nextLevel, 5, currentOperation));
    setCurrentIndex(0);
    setUserAnswer('');
    setHintsRemaining(3);
    setHintsUsedPerQuestion({});
    setCorrectCount(0);
    setShowResult(false);
    setAnswerState(null);
  };

  // Kingdom name for display — computed fresh on each render from state
  const kingdomName = KINGDOM_NAMES[state.progress.story.currentKingdom] || 'Reino dos Números Pequenos';

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(isFreePlay ? '/freeplay' : '/story')}>
          <ArrowLeft size={24} weight="bold" />
        </button>

        <div className={styles.headerStats}>
          <XPBar compact />
          <div className={styles.headerIcons}>
            <HintButton
              remaining={hintsRemaining}
              onClick={handleUseHint}
              compact
            />
            <button className={styles.iconButton}>
              {settings.soundEnabled ? (
                <SpeakerHigh size={24} weight="fill" />
              ) : (
                <SpeakerSlash size={24} weight="fill" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Level / Operation Info */}
      <div className={styles.levelInfo}>
        <span className={styles.levelLabel}>
          {isFreePlay
            ? `🎯 Modo Livre — ${currentOperation === 'multiplication' ? 'Multiplicação' : currentOperation === 'division' ? 'Divisão' : currentOperation === 'subtraction' ? 'Subtração' : 'Adição'}`
            : `✨ Nível ${state.progress.story.currentLevel} — ${kingdomName}`
          }
        </span>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion?.id}
          className={`${styles.questionCard} ${answerState === 'correct' ? styles.correct : ''} ${answerState === 'wrong' ? styles.wrong : ''} ${shake ? styles.shake : ''}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.questionType}>
            {isFreePlay
              ? (currentOperation === 'multiplication' ? 'Multiplicação' : currentOperation === 'division' ? 'Divisão' : currentOperation === 'subtraction' ? 'Subtração' : 'Adição')
              : OPERATION_LABELS[state.progress.story.currentKingdom]
            }
          </div>

          <div className={styles.questionText}>
            {currentQuestion?.question}
          </div>

          <div className={`${styles.answerDisplay} ${userAnswer ? styles.hasAnswer : ''}`}>
            {userAnswer || '?'}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress */}
      <ProgressDots
        current={currentIndex}
        total={questions.length}
        correct={correctCount}
      />

      {/* Number Pad */}
      <NumberPad
        onKeyPress={handleKeyPress}
        disabled={answerState === 'correct'}
      />

      {/* Feedback Messages */}
      <AnimatePresence>
        {answerState === 'correct' && (
          <motion.div
            className={styles.feedbackCorrect}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            🌟 Correto! +{Math.max(0, (1 * 10) - ((hintsUsedPerQuestion[currentIndex] || 0) * 3))} XP
          </motion.div>
        )}
        {answerState === 'wrong' && (
          <motion.div
            className={styles.feedbackWrong}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            💫 Não muito bem... Tenta outra vez!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint Modal */}
      <HintModal
        isOpen={showHint}
        hints={currentHint}
        currentStep={hintStep}
        remaining={hintsRemaining}
        onNext={handleHintStep}
        onClose={handleCloseHint}
      />

      {/* Result Modal */}
      <ResultModal
        isOpen={showResult && !showAgeCompletion}
        correct={correctCount}
        total={questions.length}
        xpEarned={Math.max(0, (calculateStars(correctCount, questions.length) * 10) - (Object.values(hintsUsedPerQuestion).reduce((sum, used) => sum + used, 0) * 3))}
        hintsUsed={Object.values(hintsUsedPerQuestion).reduce((sum, used) => sum + used, 0)}
        streak={player.currentStreak}
        onClose={handleResultClose}
        onNext={!isFreePlay ? handleNext : undefined}
        onRetry={handleRetry}
        onHome={onBack}
      />

      {/* Age Completion Modal */}
      {!isFreePlay && (
        <AgeCompletionModal
          isOpen={showAgeCompletion}
          level={state.progress.story.currentLevel}
          onContinue={handleAgeContinue}
          onRestart={handleAgeRestart}
          onHome={onBack}
        />
      )}
    </div>
  );
}
