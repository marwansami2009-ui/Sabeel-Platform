import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveWrongAnswer } from '../../services/appwriteService';

// ─── Timer Bar ────────────────────────────────────────────────────────────────
const TimerBar = memo(({ totalSeconds, remaining, paused }) => {
  const pct = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 100;
  const color = pct > 50 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-500' : 'bg-red-500';
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className="glass-panel p-4 flex items-center gap-4">
      <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="flex items-center gap-2">
        {paused && <span className="text-xs text-amber-400 font-bold animate-pulse">⏸ متوقف</span>}
        <span className="font-mono font-bold text-lg text-white min-w-[60px] text-center">
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
});
TimerBar.displayName = 'TimerBar';

// ─── Option Colors ────────────────────────────────────────────────────────────
const optionStyles = {
  a: { bg: 'bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/25', selected: 'bg-sky-500/30 border-sky-500/50', icon: 'أ' },
  b: { bg: 'bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/25', selected: 'bg-violet-500/30 border-violet-500/50', icon: 'ب' },
  c: { bg: 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/25', selected: 'bg-emerald-500/30 border-emerald-500/50', icon: 'ج' },
  d: { bg: 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/25', selected: 'bg-amber-500/30 border-amber-500/50', icon: 'د' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// ███  QUIZ PLAYER
// ═══════════════════════════════════════════════════════════════════════════════
export const QuizPlayer = ({
  quiz,
  questions = [],
  userId,
  onFinish,
  studentPhone = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState({}); // { questionId: 'a'|'b'|'c'|'d' }
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [paused, setPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState((quiz.duration_minutes || 0) * 60);
  const timerRef = useRef(null);

  const hasDuration = (quiz.duration_minutes || 0) > 0;
  const totalSeconds = (quiz.duration_minutes || 0) * 60;
  const canPause = Number(quiz.allow_pause) === 1;
  const showResultImmediate = Number(quiz.show_result) === 1;
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  // ── Timer ──
  useEffect(() => {
    if (!hasDuration || finished || paused) return;
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [hasDuration, finished, paused]);

  const handleSelectAnswer = (key) => {
    if (showResult || finished) return;
    setSelectedAnswer(key);
  };

  const handleConfirmAnswer = useCallback(async () => {
    if (!selectedAnswer || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    const newAnswers = { ...answers, [currentQuestion.id]: selectedAnswer };
    setAnswers(newAnswers);

    if (isCorrect) {
      setScore(s => s + 1);
    } else {
      // Save wrong answer to Appwrite
      saveWrongAnswer({
        user_id: userId,
        quiz_id: quiz.id || quiz.$id,
        question_id: currentQuestion.id,
        question_text: currentQuestion.question_text,
        user_answer: selectedAnswer,
        correct_answer: currentQuestion.correct_answer,
        option_a: currentQuestion.option_a,
        option_b: currentQuestion.option_b,
        option_c: currentQuestion.option_c,
        option_d: currentQuestion.option_d,
      });
    }

    if (showResultImmediate) {
      setShowResult(true);
      setTimeout(() => {
        setShowResult(false);
        setSelectedAnswer(null);
        if (currentIndex < totalQuestions - 1) {
          setCurrentIndex(i => i + 1);
        } else {
          handleFinishQuiz(newAnswers);
        }
      }, 1500);
    } else {
      setSelectedAnswer(null);
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(i => i + 1);
      } else {
        handleFinishQuiz(newAnswers);
      }
    }
  }, [selectedAnswer, currentQuestion, currentIndex, totalQuestions, answers, userId, quiz, showResultImmediate]);

  const handleFinishQuiz = (finalAnswers) => {
    clearInterval(timerRef.current);
    setFinished(true);
    const finalScore = finalAnswers
      ? Object.entries(finalAnswers).filter(([qId, ans]) => {
          const q = questions.find(q => q.id === qId);
          return q && ans === q.correct_answer;
        }).length
      : score;
    setScore(finalScore);
  };

  // ── Finished Screen ──
  if (finished) {
    const pct = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const grade = pct >= 90 ? 'ممتاز 🌟' : pct >= 75 ? 'جيد جداً 👏' : pct >= 60 ? 'جيد 👍' : pct >= 50 ? 'مقبول' : 'حاول مرة أخرى 💪';

    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-8 text-center">
          <div className="text-6xl mb-4">{pct >= 60 ? '🎉' : '📚'}</div>
          <h2 className="text-3xl font-black text-white mb-2">نتيجة الامتحان</h2>
          <p className="text-slate-400 mb-6">{quiz.title}</p>

          <div className="inline-flex items-center gap-3 bg-white/5 px-8 py-4 rounded-2xl mb-6">
            <span className="text-5xl font-black text-white">{score}</span>
            <span className="text-2xl text-slate-400">/</span>
            <span className="text-3xl text-slate-300">{totalQuestions}</span>
          </div>

          <div className="mb-4">
            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden max-w-sm mx-auto">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className={`h-full rounded-full ${pct >= 60 ? 'bg-emerald-500' : 'bg-red-500'}`}
              />
            </div>
            <p className="text-2xl font-bold text-white mt-3">{pct}%</p>
          </div>

          <p className={`text-xl font-bold ${pct >= 60 ? 'text-emerald-400' : 'text-red-400'}`}>{grade}</p>

          <div className="flex gap-4 justify-center mt-8">
            <button
              onClick={() => onFinish?.()}
              className="px-8 py-3 bg-gradient-to-r from-brand-red to-red-600 text-white font-bold rounded-xl transition hover:opacity-90"
            >
              العودة للكورس
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) return <div className="glass-panel p-12 text-center text-white">لا توجد أسئلة في هذا الامتحان</div>;

  const optionKeys = ['a', 'b', 'c', 'd'];

  return (
    <div className="space-y-5" dir="rtl">
      {/* Timer */}
      {hasDuration && (
        <TimerBar totalSeconds={totalSeconds} remaining={timeRemaining} paused={paused} />
      )}

      {/* Progress */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">السؤال {currentIndex + 1} من {totalQuestions}</span>
          <span className="text-sm font-bold text-white">{quiz.title}</span>
          {canPause && hasDuration && (
            <button
              onClick={() => setPaused(p => !p)}
              className={`text-xs px-3 py-1 rounded-lg font-bold transition ${paused ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}
            >
              {paused ? '▶ استكمال' : '⏸ إيقاف مؤقت'}
            </button>
          )}
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-brand-red rounded-full"
            animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="glass-panel p-8"
        >
          <h3 className="text-xl font-bold text-white leading-relaxed mb-8">
            {currentQuestion.question_text}
          </h3>

          <div className="space-y-3">
            {optionKeys.map((key) => {
              const optText = currentQuestion[`option_${key}`];
              if (!optText) return null;

              const style = optionStyles[key];
              const isSelected = selectedAnswer === key;
              const isCorrectAnswer = key === currentQuestion.correct_answer;

              let className = `w-full p-4 rounded-xl border-2 text-right transition-all duration-300 flex items-center gap-4 `;
              if (showResult && isCorrectAnswer) {
                className += 'bg-emerald-500/30 border-emerald-500 text-white';
              } else if (showResult && isSelected && !isCorrectAnswer) {
                className += 'bg-red-500/30 border-red-500 text-white';
              } else if (isSelected) {
                className += style.selected + ' text-white';
              } else {
                className += style.bg + ' text-slate-200';
              }

              return (
                <motion.button
                  key={key}
                  onClick={() => handleSelectAnswer(key)}
                  whileHover={!showResult ? { scale: 1.01 } : {}}
                  whileTap={!showResult ? { scale: 0.99 } : {}}
                  className={className}
                  disabled={showResult || paused}
                >
                  <span className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg shrink-0 ${isSelected ? 'bg-white/20' : 'bg-white/5'}`}>
                    {style.icon}
                  </span>
                  <span className="flex-1 font-bold text-base">{optText}</span>
                  {showResult && isCorrectAnswer && <span className="text-2xl">✓</span>}
                  {showResult && isSelected && !isCorrectAnswer && <span className="text-2xl">✗</span>}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Confirm Button */}
      {!showResult && (
        <motion.button
          onClick={handleConfirmAnswer}
          disabled={!selectedAnswer || paused}
          whileHover={{ scale: selectedAnswer ? 1.02 : 1 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${
            selectedAnswer && !paused
              ? 'bg-gradient-to-r from-brand-red to-red-600 text-white shadow-lg shadow-red-900/40'
              : 'bg-white/5 text-slate-500 cursor-not-allowed'
          }`}
        >
          {currentIndex < totalQuestions - 1 ? 'تأكيد والسؤال التالي ←' : 'تأكيد وإنهاء الامتحان'}
        </motion.button>
      )}
    </div>
  );
};
