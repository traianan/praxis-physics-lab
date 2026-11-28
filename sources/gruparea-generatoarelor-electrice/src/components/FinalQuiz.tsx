import React, { useState } from 'react';
import { Award, CheckCircle2, Download, ExternalLink, RotateCcw, XCircle } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data/lessonContent';
import { ModuleTabId } from '../types/physics';
import { soundEngine } from '../utils/sound';

interface FinalQuizProps {
  onJumpToModule: (tab: ModuleTabId) => void;
}

export const FinalQuiz: React.FC<FinalQuizProps> = ({ onJumpToModule }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);

  const currentQ = QUIZ_QUESTIONS[currentIdx];
  const selectedOption = answers[currentQ.id];
  const isAnswered = selectedOption !== undefined;
  const isCorrect = isAnswered && selectedOption === currentQ.correctIndex;

  const totalCorrect = QUIZ_QUESTIONS.reduce(
    (sum, q) => sum + (answers[q.id] === q.correctIndex ? 1 : 0),
    0
  );

  const handleSelectOption = (optIndex: number) => {
    if (isAnswered) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optIndex }));
    if (optIndex === currentQ.correctIndex) {
      soundEngine.playSuccess();
    } else {
      soundEngine.playError();
    }
  };

  const handleNext = () => {
    soundEngine.playClick();
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      setFinished(true);
      if (totalCorrect >= 7) {
        soundEngine.playMissionComplete();
      }
    }
  };

  const handleRestart = () => {
    soundEngine.playClick();
    setAnswers({});
    setCurrentIdx(0);
    setFinished(false);
  };

  const handleExportQuizJson = () => {
    soundEngine.playClick();
    const payload = {
      lesson: 'Gruparea generatoarelor electrice — Test final',
      completedAt: new Date().toISOString(),
      score: totalCorrect,
      totalQuestions: QUIZ_QUESTIONS.length,
      percentage: Math.round((totalCorrect / QUIZ_QUESTIONS.length) * 100),
      responses: QUIZ_QUESTIONS.map((q) => ({
        question: q.question,
        topic: q.topic,
        selectedOption: answers[q.id] !== undefined ? q.options[answers[q.id]] : null,
        correctOption: q.options[q.correctIndex],
        isCorrect: answers[q.id] === q.correctIndex,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rezultat-test-generatoare.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (finished) {
    const percent = Math.round((totalCorrect / QUIZ_QUESTIONS.length) * 100);
    return (
      <div className="rounded-2xl border border-[#E4E2D8] bg-white p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EFECE3]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#F4F8F6] border border-[#DCE6E1] flex items-center justify-center text-[#0F4C3A]">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#17231E]">Rezultatul testului final</h2>
              <p className="text-sm text-[#4E5D56]">
                {percent >= 80
                  ? 'Excelent! Stăpânești foarte bine gruparea generatoarelor electrice.'
                  : percent >= 50
                  ? 'Rezultat bun! Poți revedea modulele unde au apărut ezitări.'
                  : 'Recomandăm să parcurgi din nou simulatorul și ghidul de formule.'}
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-3xl font-extrabold font-mono tabular-nums text-[#0F4C3A]">
              {totalCorrect}/{QUIZ_QUESTIONS.length}
            </div>
            <div className="text-xs font-semibold text-[#4E5D56]">{percent}% răspunsuri corecte</div>
          </div>
        </div>

        <div className="space-y-2.5">
          {QUIZ_QUESTIONS.map((q, idx) => {
            const ok = answers[q.id] === q.correctIndex;
            return (
              <div
                key={q.id}
                className={`rounded-xl border p-3.5 flex items-start justify-between gap-3 ${
                  ok ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-700 mt-0.5 shrink-0" />
                  )}
                  <div className="text-sm">
                    <span className="font-semibold text-[#17231E]">
                      {idx + 1}. {q.question}
                    </span>
                    <div className="text-xs text-[#4E5D56] mt-1">
                      Răspuns corect: <strong className="text-[#17231E]">{q.options[q.correctIndex]}</strong>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onJumpToModule(q.relatedModule)}
                  className="shrink-0 text-xs font-semibold text-[#0F4C3A] hover:underline whitespace-nowrap"
                >
                  Revizuiește
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0F4C3A] text-white text-sm font-semibold hover:bg-[#0A382B] transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Reia testul
          </button>
          <button
            onClick={handleExportQuizJson}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl border border-[#D4D9D5] bg-white text-sm font-semibold text-[#17231E] hover:bg-[#F7F6F1] transition-colors"
          >
            <Download className="w-4 h-4" /> Exportă rezultatul (JSON)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E4E2D8] bg-white p-5 sm:p-6 max-w-3xl mx-auto space-y-5">
      {/* Header & Progress */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-[#4E5D56]">
          <span>
            Întrebarea {currentIdx + 1} din {QUIZ_QUESTIONS.length} · {currentQ.topic}
          </span>
          <span className="font-mono tabular-nums text-[#0F4C3A] font-semibold">
            Scor curent: {totalCorrect} corecte
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-[#EAECE6] overflow-hidden">
          <div
            className="h-full bg-[#0F4C3A] transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h2 className="text-lg font-bold text-[#17231E] leading-snug">{currentQ.question}</h2>

      {/* Options */}
      <div className="space-y-2.5">
        {currentQ.options.map((opt, idx) => {
          const isThisSelected = selectedOption === idx;
          const isThisCorrect = idx === currentQ.correctIndex;

          let styleClass =
            'border-[#E4E2D8] bg-[#FCFBF8] text-[#17231E] hover:border-[#0F4C3A]/50 hover:bg-[#F4F8F6]';
          if (isAnswered) {
            if (isThisCorrect) {
              styleClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
            } else if (isThisSelected) {
              styleClass = 'border-red-400 bg-red-50 text-red-950';
            } else {
              styleClass = 'border-[#E4E2D8] bg-white text-[#64748B] opacity-75';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              disabled={isAnswered}
              className={`w-full min-h-[48px] text-left rounded-xl border px-4 py-3 text-sm transition-colors flex items-center justify-between gap-3 ${styleClass}`}
            >
              <span>
                <strong className="font-mono mr-2">{String.fromCharCode(65 + idx)}.</strong>
                {opt}
              </span>
              {isAnswered && isThisCorrect && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              {isAnswered && isThisSelected && !isThisCorrect && (
                <XCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Immediate Feedback + Audio Cue Explanation */}
      {isAnswered && (
        <div
          className={`rounded-xl border p-4 text-sm space-y-2 ${
            isCorrect
              ? 'border-emerald-200 bg-emerald-50/80 text-emerald-950'
              : 'border-amber-200 bg-amber-50/80 text-amber-950'
          }`}
        >
          <div className="font-bold">
            {isCorrect ? 'Răspuns corect!' : 'Răspuns incorect — iată explicația:'}
          </div>
          <p className="leading-relaxed">{currentQ.explanation}</p>
          <button
            onClick={() => {
              soundEngine.playClick();
              onJumpToModule(currentQ.relatedModule);
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F4C3A] hover:underline pt-1"
          >
            Verifică experimental în modulul asociat <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => {
            soundEngine.playClick();
            setCurrentIdx((i) => Math.max(0, i - 1));
          }}
          disabled={currentIdx === 0}
          className="min-h-[44px] px-4 py-2 rounded-xl border border-[#D4D9D5] bg-white text-sm font-semibold text-[#4E5D56] disabled:opacity-40 hover:text-[#17231E]"
        >
          Înapoi
        </button>

        {isAnswered ? (
          <button
            onClick={handleNext}
            className="min-h-[44px] px-6 py-2 rounded-xl bg-[#0F4C3A] text-white text-sm font-semibold hover:bg-[#0A382B] transition-colors"
          >
            {currentIdx < QUIZ_QUESTIONS.length - 1 ? 'Următoarea întrebare' : 'Finalizează testul'}
          </button>
        ) : (
          <span className="text-xs text-[#64748B]">Selectează un răspuns pentru verificare audio instantanee</span>
        )}
      </div>
    </div>
  );
};
