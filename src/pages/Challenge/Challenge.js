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
import { useChallengeProgress } from '../../hooks/useChallengeProgress';
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

// Kingdom thresholds — level N belongs to kingdom at index floor((N-1)/2)
// level 1-2 → kingdom1 (index 0, threshold 0), level 3-4 → kingdom2 (index 1, threshold 2), etc.
const KINGDOM_ORDER = ['kingdom1', 'kingdom2', 'kingdom3', 'kingdom4', 'kingdom5', 'kingdom6', 'kingdom7', 'kingdom8'];
const KINGDOM_THRESHOLDS = [0, 2, 4, 6, 8, 10, 12, 14];
const getKingdomForLevel = (level) => {
  for (let i = KINGDOM_ORDER.length - 1; i >= 0; i--) {
    if (level > KINGDOM_THRESHOLDS[i]) return KINGDOM_ORDER[i];
  }
  return 'kingdom1';
};
// Get the starting level for a kingdom (used in review mode)
const getStartingLevel = (kingdom) => {
  const idx = KINGDOM_ORDER.indexOf(kingdom);
  return idx >= 0 ? KINGDOM_THRESHOLDS[idx] + 1 : 1;
};

export default function Challenge({ onBack, onComplete }) {
  const navigate = useNavigate();
  const { state, actions } = useGame();
  const { settings, player } = state;

  // Read URL params
  const { operation: urlOp } = useParams(); // path param: kingdom id (story) or operation (freeplay)
  const [searchParams] = useSearchParams();
  const urlMode = searchParams.get('mode'); // 'story' or 'freeplay'
  const urlOpsParam = searchParams.get('ops'); // comma-separated ops for freeplay
  const urlReview = searchParams.get('review'); // 'true' for review mode
  const urlKingdom = searchParams.get('kingdom'); // kingdom id (story mode via query string)

  const isFreePlay = urlMode === 'freeplay';
  const isReviewMode = urlReview === 'true';

  // BUG #1 FIX: direct navigate handler for freeplay home
  const handleFreeplayHome = () => navigate('/freeplay');

  // Determine kingdom and operation based on mode
  // In freeplay: use URL ops param, generate 10 questions, don't touch story state
  // In story: use URL kingdom or path param, fall back to story state
  const storyKingdom = state.progress.story.currentKingdom || 'kingdom1';
  const storyLevel = state.progress.story.currentLevel;
  // BUG #3 FIX: in review mode, always prefer urlKingdom from URL (not storyKingdom from stale state)
  const currentKingdom = isFreePlay
    ? (urlKingdom || urlOp || 'kingdom1')
    : (urlKingdom || (isReviewMode ? urlOp || 'kingdom1' : storyKingdom));
  // Detect replay: urlKingdom is set and differs from the global story kingdom
  const isKingdomReplay = urlKingdom && urlKingdom !== storyKingdom;
  // BUG #3 FIX: in review mode or replay, use the kingdom's starting level (not stale story state)
  const currentLevel = isReviewMode || isKingdomReplay
    ? getStartingLevel(currentKingdom)
    : storyLevel;
  // In freeplay, parse ops array from URL; in story, use null (level config)
  const currentOpsArray = isFreePlay && urlOpsParam
    ? urlOpsParam.split(',').filter(Boolean)
    : null;
  // Number of questions: 10 for freeplay, 5 for story
  const questionCount = isFreePlay ? 10 : 5;

  // Hook for progress persistence (Problem #3)
  const { savedProgress, saveProgress, clearProgress } = useChallengeProgress(
    currentKingdom, currentLevel, !isFreePlay && !isReviewMode, isReviewMode
  );

  // Restore saved progress on mount — only on very first render (savedProgress is null on re-renders)
  const [questions, setQuestions] = useState(() => {
    if (savedProgress) {
      return savedProgress.questions;
    }
    return generateQuestions(currentKingdom, currentLevel, questionCount, currentOpsArray);
  });
  const [currentIndex, setCurrentIndex] = useState(() => savedProgress ? savedProgress.questionIndex : 0);
  const [userAnswer, setUserAnswer] = useState('');
  const [hintsRemaining, setHintsRemaining] = useState(() => savedProgress ? Math.max(0, 3 - savedProgress.hintsUsed) : 3);
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState([]);
  const [hintStep, setHintStep] = useState(0);
  const [correctCount, setCorrectCount] = useState(() => savedProgress ? savedProgress.correctCount : 0);
  const [showResult, setShowResult] = useState(false);
  const [showAgeCompletion, setShowAgeCompletion] = useState(false);
  const [lastCompletedLevel, setLastCompletedLevel] = useState(null); // BUG #1 fix: pass completed level to milestone modal
  const [answerState, setAnswerState] = useState(null); // 'correct', 'wrong', null
  const [shake, setShake] = useState(false);
  const [hintsUsedPerQuestion, setHintsUsedPerQuestion] = useState({});

  // Auto-save challenge progress on every state change (story mode only)
  useEffect(() => {
    const q = questions[currentIndex];
    if (!isFreePlay && !isReviewMode && q && questions.length > 0) {
      saveProgress({
        questionIndex: currentIndex,
        questions,
        correctCount,
        hintsUsed: Object.values(hintsUsedPerQuestion).reduce((sum, used) => sum + used, 0),
      });
    }
  }, [currentIndex, questions, correctCount, hintsUsedPerQuestion, isFreePlay, isReviewMode, questions.length, saveProgress]);

  // Regenerate questions when kingdom or level changes (only when NOT restoring saved progress)
  useEffect(() => {
    // Skip if we are restoring from saved progress
    if (savedProgress && questions.length > 0) return;
    setQuestions(generateQuestions(currentKingdom, currentLevel, questionCount, currentOpsArray));
    setCurrentIndex(0);
    setUserAnswer('');
    setHintsRemaining(3);
    setHintsUsedPerQuestion({});
    setCorrectCount(0);
    setShowResult(false);
    setAnswerState(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKingdom, currentLevel, questionCount, urlKingdom]);

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

    // BUG #1 FIX: capture completedLevel BEFORE calling completeLevel (which increments it)
    const completedLevel = state.progress.story.currentLevel;

    // Skip XP/progress updates in freeplay or review mode
    const isPassive = isFreePlay || isReviewMode;

    if (!isPassive) {
      actions.completeLevel(currentKingdom, completedLevel, stars, Math.max(0, xpEarned), totalHintsUsed);
      // BUG #4 FIX: also call updateStreak for story mode (completeLevel already calls it, but call again explicitly for safety)
      actions.updateStreak();
    } else {
      // In freeplay/review: just add XP (freeplay) or nothing (review), don't advance story
      if (isFreePlay) {
        actions.addXP(Math.max(0, xpEarned));
        actions.updateStreak();
      }
    }

    // BUG #1 FIX: set lastCompletedLevel so AgeCompletionModal receives the correct level
    setLastCompletedLevel(completedLevel);

    // Show milestone modal at half-year levels (story mode only, not review)
    const HALF_YEAR_LEVELS = [2, 4, 6, 8, 10, 12, 14, 16];
    if (!isPassive && HALF_YEAR_LEVELS.includes(completedLevel)) {
      setShowAgeCompletion(true);
      setShowResult(false);
    } else {
      setShowResult(true);
    }

    // Problem #3: clear saved progress on level complete
    clearProgress();
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
    // Auto-save one last time before navigating away, then go to StoryMode
    if (!isFreePlay && !isReviewMode) {
      saveProgress({
        questionIndex: currentIndex,
        questions,
        correctCount,
        hintsUsed: Object.values(hintsUsedPerQuestion).reduce((sum, used) => sum + used, 0),
      });
    }
    if (onComplete) {
      onComplete();
    } else {
      navigate('/story');
    }
  };

  const handleAgeContinue = () => {
    setShowAgeCompletion(false);
    setShowResult(false);
    // Derive next kingdom from the COMPLETED level, not from state (which is stale due to React batching)
    const nextLevel = (lastCompletedLevel || state.progress.story.currentLevel) + 1;
    const nextKingdom = getKingdomForLevel(nextLevel);
    navigate(`/challenge/${nextKingdom}?mode=story&kingdom=${nextKingdom}`);
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
    // Problem #3: clear saved progress so re-entry starts fresh
    clearProgress();
    // Decrement currentLevel before retry so user replays the same level
    const currentProgress = { ...state.progress };
    if (currentProgress.story.currentLevel > 1) {
      currentProgress.story.currentLevel -= 1;
      actions.updateProgress(currentProgress);
    }
    // Navigate to StoryMode so user re-enters the challenge fresh
    navigate('/story');
  };

  const handleNext = () => {
    // BUG #2 FIX: derive kingdom from next level using thresholds, not from state (which may be stale)
    const nextLevel = state.progress.story.currentLevel;
    const nextKingdom = getKingdomForLevel(nextLevel);
    setQuestions(generateQuestions(nextKingdom, nextLevel, 5, null));
    setCurrentIndex(0);
    setUserAnswer('');
    setHintsRemaining(3);
    setHintsUsedPerQuestion({});
    setCorrectCount(0);
    setShowResult(false);
    setAnswerState(null);
  };

  // BUG #2 FIX: compute kingdom for the LABEL from the CURRENT LEVEL, not from stale state
  const labelKingdom = getKingdomForLevel(currentLevel);
  const kingdomName = KINGDOM_NAMES[labelKingdom] || 'Reino dos Números Pequenos';

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
            ? `🎯 Modo Livre — ${currentOpsArray && currentOpsArray.length > 0 ? currentOpsArray.map(op => op === 'multiplication' ? 'Multiplicação' : op === 'division' ? 'Divisão' : op === 'subtraction' ? 'Subtração' : 'Adição').join(', ') : 'Adição'}`
            : `✨ Nível ${currentLevel} — ${kingdomName}`
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
              ? (currentOpsArray && currentOpsArray.length > 0 ? currentOpsArray.map(op => op === 'multiplication' ? '×' : op === 'division' ? '÷' : op === 'subtraction' ? '−' : '+').join(' ') : '+')
              : OPERATION_LABELS[labelKingdom]
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
      {/* BUG #1 FIX: onHome goes to /freeplay in freeplay mode, otherwise onBack */}
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
        onHome={isFreePlay ? handleFreeplayHome : onBack}
      />

      {/* Age Completion Modal */}
      {!isFreePlay && (
        <AgeCompletionModal
          isOpen={showAgeCompletion}
          level={lastCompletedLevel || state.progress.story.currentLevel}
          streak={player.currentStreak}
          onContinue={handleAgeContinue}
          onRestart={handleAgeRestart}
          onHome={() => navigate('/')}
        />
      )}
    </div>
  );
}
