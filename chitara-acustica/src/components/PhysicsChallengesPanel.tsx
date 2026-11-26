import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Award, CheckCircle2, HelpCircle, RotateCcw, Volume2, XCircle } from 'lucide-react';
import { audioEngine } from '../audio/AudioEngine';
import { formatScientificIndices } from './ScientificNotation';

type ChallengeQuestion = {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  formulaHint: string;
  demoAudio?: {
    label: string;
    play: () => void;
  };
};

const STORAGE_ANSWERS_KEY = 'chitara_physics_challenges_v1';

const QUESTIONS: ChallengeQuestion[] = [
  {
    id: 'q1_tension',
    topic: 'Fizica corzii · Tensiune',
    question:
      'Dacă mărești tensiunea T a unei corzi de 4 ori, păstrând lungimea L și densitatea liniară μ constante, cum se modifică frecvența fundamentală f₁?',
    options: [
      'Se dublează (crește de 2 ori — o octavă mai sus)',
      'Crește de 4 ori (două octave mai sus)',
      'Scade la jumătate',
      'Rămâne neschimbată',
    ],
    correctIndex: 0,
    formulaHint: 'f₁ = (1 / 2L) · √(T / μ)',
    explanation:
      'Corect! Frecvența fundamentală este proporțională cu radicalul tensiunii (√T). Dacă T devine 4T, atunci √4 = 2, deci frecvența f₁ se dublează exact cu o octavă.',
    demoAudio: {
      label: 'Ascultă octava (110 Hz → 220 Hz)',
      play: () => {
        audioEngine.stopAll();
        audioEngine.playPluckedString(110, { method: 'karplus', duration: 1.4 });
        window.setTimeout(() => {
          audioEngine.playPluckedString(220, { method: 'karplus', duration: 1.6 });
        }, 700);
      },
    },
  },
  {
    id: 'q2_fret12',
    topic: 'Lungime efectivă · Fret 12',
    question:
      'Ce se întâmplă fizic cu lungimea vibrantă L_ef a unei corzi de chitară atunci când o apeși la fretul 12?',
    options: [
      'Se scurtează la 2/3 din lungime (cvintă perfectă)',
      'Se înjumătățește (L/2), iar frecvența se dublează (octavă)',
      'Scade cu 12%, urcând cu un ton întreg',
      'Se dublează lungimea de undă a fundamentalei',
    ],
    correctIndex: 1,
    formulaHint: 'L_ef = L · 2^(−fret / 12) = L · 2⁻¹ = L / 2',
    explanation:
      'La fretul 12 (12 semitonuri), lungimea efectivă devine exact jumătate din lungimea corzii libere. Deoarece f₁ ∝ 1/L_ef, frecvența se dublează.',
    demoAudio: {
      label: 'Ascultă E2 liber (82,4 Hz) vs Fret 12 (164,8 Hz)',
      play: () => {
        audioEngine.stopAll();
        audioEngine.playPluckedString(82.41, { method: 'karplus', duration: 1.3 });
        window.setTimeout(() => {
          audioEngine.playPluckedString(164.81, { method: 'karplus', duration: 1.5 });
        }, 680);
      },
    },
  },
  {
    id: 'q3_pick_half',
    topic: 'Poziția ciupirii · Noduri',
    question:
      'De ce dispare armonicul 2 (2f₀) din spectrul sunetului dacă ciupești coarda exact la mijlocul ei (p = 0,50 L)?',
    options: [
      'Pentru că la mijloc coarda este prea rigidă pentru a vibra',
      'Pentru că modul n = 2 are un nod fix la L/2 (sin(2·π·0,5) = 0) și nu poate fi excitat acolo',
      'Pentru că frecvența 2f₀ depășește limita de auz umană',
      'Pentru că p = 0,50 L anulează doar fundamentala f₀',
    ],
    correctIndex: 1,
    formulaHint: 'Aₙ ∝ |sin(n · π · p)| / n²',
    explanation:
      'Orice mod de vibrație care are un nod chiar în punctul de ciupire p = k/n nu primește energie. La p = 1/2, toate armonicele pare (n = 2, 4, 6…) sunt suprimate!',
    demoAudio: {
      label: 'Ascultă ciupire la p = 0,50 L (sunet cald, fără 2f₀)',
      play: () => {
        audioEngine.stopAll();
        audioEngine.playPluckedString(146.83, { method: 'harmonics', pickPosition: 0.5, duration: 2.0 });
      },
    },
  },
  {
    id: 'q4_harmonic7',
    topic: 'Armonice naturale',
    question:
      'Dacă atingi ușor coarda deasupra fretului 7 (la 1/3 din lungimea corzii) și o ciupești, ce armonic izolezi?',
    options: [
      'Armonicul 2 (2f₀ · octavă)',
      'Armonicul 3 (3f₀ · octavă + quintă perfectă)',
      'Armonicul 4 (4f₀ · două octave)',
      'Fundamentală pură (f₀)',
    ],
    correctIndex: 1,
    formulaHint: 'Noduri la L/3 și 2L/3 → mod n = 3 → f = 3·f₀',
    explanation:
      'Atingerea la L/3 forțează un nod în acel punct, suprimând fundamentala și armonicul 2. Coarda vibrează în 3 ventruri (mod n = 3), emițând frecvența 3f₀.',
    demoAudio: {
      label: 'Ascultă armonic la fret 7 (3f₀)',
      play: () => {
        audioEngine.stopAll();
        audioEngine.playPluckedString(110, { technique: 'harmonic_7', duration: 2.0 });
      },
    },
  },
  {
    id: 'q5_linear_density',
    topic: 'Densitate liniară μ',
    question:
      'De ce corzile grave ale chitarei (Coarda 5 și Coarda 6) sunt mai groase și înfășurate cu sârmă metalică?',
    options: [
      'Pentru a mări densitatea liniară μ, ceea ce scade viteza undei √(T/μ) și produce note grave la o tensiune confortabilă',
      'Pentru a face coarda cât mai scurtă posibil',
      'Pentru a elimina complet armonicele superioare din spectru',
      'Pentru a dubla frecvența fundamentalei fără a schimba lungimea',
    ],
    correctIndex: 0,
    formulaHint: 'v = √(T / μ) · f₁ = v / (2L)',
    explanation:
      'Dacă toate corzile ar avea aceeași grosime, obținerea notei grave Mi2 (82,4 Hz) ar necesita o tensiune extrem de mică și coarda ar fi instabilă. Creșterea lui μ coboară frecvența natural.',
  },
  {
    id: 'q6_equal_temperament',
    topic: 'Temperament egal (12-TET)',
    question:
      'Care este factorul exact cu care se înmulțește frecvența atunci când urci cu un semiton (1 fret) în sistemul temperat egal?',
    options: [
      '3 / 2 (= 1,500)',
      '2^(1/12) ≈ 1,05946',
      '1 + 1/12 ≈ 1,0833',
      '5 / 4 (= 1,250)',
    ],
    correctIndex: 1,
    formulaHint: 'f(n) = f₀ · 2^(n / 12)',
    explanation:
      'Octava (raport 2:1) este împărțită geometric în 12 trepte egale. Astfel, raportul constant dintre două note alăturate este rădăcina de ordin 12 din 2 (≈ 1,05946, adică +5,95%).',
  },
  {
    id: 'q7_beats',
    topic: 'Interferență · Bătăi acustice',
    question:
      'Atunci când două corzi sună simultan la 440 Hz și 443 Hz (ușor dezacordate), ce fenomen acustic percepem?',
    options: [
      'Un acord major perfect fără oscilații',
      'Bătăi acustice (pulsații de volum) cu frecvența |443 − 440| = 3 bătăi pe secundă',
      'Anularea completă a sunetului (liniște totală)',
      'Creșterea automată a frecvenței la 883 Hz',
    ],
    correctIndex: 1,
    formulaHint: 'f_bătăi = |f₁ − f₂|',
    explanation:
      'Suprapunerea a două unde cu frecvențe apropiate generează interferență constructivă și distructivă alternativă. Acesta este chiar principiul folosit la acordajul „după ureche”!',
    demoAudio: {
      label: 'Ascultă bătăi acustice (440 Hz + 443 Hz)',
      play: () => {
        audioEngine.stopAll();
        audioEngine.playDualTones(440, 443, 2.2, 0.16);
      },
    },
  },
  {
    id: 'q8_timbre_fourier',
    topic: 'Spectru Fourier · Timbru',
    question:
      'Două instrumente (o chitară și un diapazon) emit aceeași notă La4 (f₀ = 440 Hz). Ce diferență apare în Spectrul Fourier?',
    options: [
      'Frecvența fundamentală f₀ este diferită pentru fiecare instrument',
      'Diapazonul are aproape exclusiv f₀, în timp ce chitara prezintă vârfuri intense la armonicele superioare (2f₀, 3f₀, 4f₀…)',
      'Spectrul chitarei nu conține frecvența fundamentală',
      'Forma spectrului este identică, doar volumul total diferă',
    ],
    correctIndex: 1,
    formulaHint: 'Timbru = distribuția amplitudinilor Aₙ la nf₀',
    explanation:
      'Înălțimea percepută este dată de f₀, dar timbrul (culoarea sonoră) este determinat de amprenta armonică: câte armonice superioare sunt prezente și ce amplitudine au.',
  },
  {
    id: 'q9_wood_eq',
    topic: 'Rezonanța corpului · Molid vs. Cedru',
    question:
      'Cum influențează o față de chitară din cedru roșu comparativ cu molidul răspunsul în frecvență al instrumentului?',
    options: [
      'Cedrul are amortizare internă mai mare pe înalte și accentuează rezonanțele joase (timbru cald), iar molidul proiectează mai mult înaltele (timbru clar)',
      'Cedrul schimbă acordajul corzilor cu un semiton mai jos',
      'Molidul elimină complet rezonanța Helmholtz a cutiei',
      'Nu există nicio diferență de răspuns în frecvență între specii de lemn',
    ],
    correctIndex: 0,
    formulaHint: 'Rezonanță aer A₀ (~100 Hz) + Mod placă T₁ (~200 Hz) + Raft înalte',
    explanation:
      'Rigiditatea și amortizarea internă a lemnului modifică curba de transfer (EQ) a cutiei: cedrul rotunjește atacul și încălzește mediile-joase, în timp ce molidul oferă claritate și dinamică.',
  },
  {
    id: 'q10_odd_harmonics',
    topic: 'Comparație Timbre · Spectru',
    question:
      'Care dintre următoarele instrumente are un spectru dominat puternic de armonicele impare (f₀, 3f₀, 5f₀, 7f₀…)?',
    options: [
      'Diapazonul pur',
      'Clarinetul (tub cilindric închis acustic la un capăt)',
      'Coarda de chitară ciupită lângă căluș',
      'Oscilatorul în dinte de fierăstrău',
    ],
    correctIndex: 1,
    formulaHint: 'Tub închis-deschis: fₙ = (2k − 1)·f₀ (armonice impare)',
    explanation:
      'Datorită condițiilor la limită ale tubului cilindric cu ancie (nod de presiune la capătul deschis, ventru la ancie), clarinetul suprimă armonicele pare și accentuează armonicele impare.',
  },
];

function loadSavedAnswers(): Record<string, number> {
  try {
    const raw = window.localStorage.getItem(STORAGE_ANSWERS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export const PhysicsChallengesPanel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>(loadSavedAnswers);

  const currentQuestion = QUESTIONS[currentIndex] ?? QUESTIONS[0];
  const selectedOption = answers[currentQuestion.id];
  const isAnswered = typeof selectedOption === 'number';
  const isCorrect = isAnswered && selectedOption === currentQuestion.correctIndex;

  const stats = useMemo(() => {
    let answeredCount = 0;
    let correctCount = 0;
    QUESTIONS.forEach((q) => {
      const a = answers[q.id];
      if (typeof a === 'number') {
        answeredCount++;
        if (a === q.correctIndex) correctCount++;
      }
    });
    return {
      answeredCount,
      correctCount,
      total: QUESTIONS.length,
      pct: answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0,
    };
  }, [answers]);

  const handleSelectOption = (optionIndex: number) => {
    if (isAnswered) return; // Lock answer for immediate clean feedback; reset allows retrying
    const next = { ...answers, [currentQuestion.id]: optionIndex };
    setAnswers(next);
    try {
      window.localStorage.setItem(STORAGE_ANSWERS_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage errors
    }
  };

  const handleResetAll = () => {
    setAnswers({});
    setCurrentIndex(0);
    try {
      window.localStorage.removeItem(STORAGE_ANSWERS_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  const allCompleted = stats.answeredCount === stats.total;

  return (
    <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-[#13221d]">
              Provocări de Fizică: Test interactiv de acustică
            </h3>
            <span className="rounded border border-[#c8dad1] bg-[#edf3f0] px-2 py-0.5 text-[11px] font-mono font-medium text-[#0d4a3e]">
              10 întrebări
            </span>
          </div>
          <p className="text-xs text-[#53665f] mt-1">
            Verifică-ți înțelegerea fenomenelor acustice explorate în laborator și primește explicații fizice imediate după fiecare răspuns.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetAll}
          className="px-3 py-1.5 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] text-xs font-medium text-[#53665f] hover:text-[#13221d] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Resetează provocările</span>
        </button>
      </div>

      {/* 4-KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">ÎNTREBARE CURENTĂ</div>
          <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
            {currentIndex + 1} / {stats.total}
          </div>
        </div>
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">RĂSPUNSURI CORECTE</div>
          <div className="text-base font-bold text-[#0d4a3e] mt-0.5 font-mono tabular-nums">
            {stats.correctCount} / {stats.answeredCount || 0}
          </div>
        </div>
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">ACURATEȚE</div>
          <div className="text-base font-bold text-[#b85d2b] mt-0.5 font-mono tabular-nums">
            {stats.answeredCount > 0 ? `${stats.pct}%` : '—'}
          </div>
        </div>
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">PROGRES TOTAL</div>
          <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
            {stats.answeredCount} / {stats.total} rezolvate
          </div>
        </div>
      </div>

      {/* Question Number Stepper */}
      <div className="flex flex-wrap items-center gap-1.5">
        {QUESTIONS.map((q, idx) => {
          const ans = answers[q.id];
          const answered = typeof ans === 'number';
          const correct = answered && ans === q.correctIndex;
          const active = idx === currentIndex;

          let styleClass =
            'bg-[#fafcfa] text-[#53665f] border-[#d8e2dc] hover:bg-[#edf3f0] hover:text-[#13221d]';
          if (answered && correct) {
            styleClass = 'bg-[#edf3f0] text-[#0d4a3e] border-[#0d4a3e]/40 font-semibold';
          } else if (answered && !correct) {
            styleClass = 'bg-[#fdf2ee] text-[#b85d2b] border-[#b85d2b]/40 font-semibold';
          }
          if (active) {
            styleClass += ' ring-2 ring-[#0d4a3e] ring-offset-1';
          }

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`w-8 h-8 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${styleClass}`}
              title={`Întrebarea ${idx + 1}: ${q.topic}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Active Question Card */}
      <div className="rounded-xl border border-[#d8e2dc] bg-[#fafcfa] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#b85d2b]">
            {currentQuestion.topic}
          </span>
          {currentQuestion.demoAudio && (
            <button
              type="button"
              onClick={currentQuestion.demoAudio.play}
              className="px-2.5 py-1 rounded-md border border-[#0d4a3e]/30 bg-white hover:bg-[#edf3f0] text-[11px] font-semibold text-[#0d4a3e] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{currentQuestion.demoAudio.label}</span>
            </button>
          )}
        </div>

        <h4 className="text-sm sm:text-base font-semibold text-[#13221d] leading-snug">
                {formatScientificIndices(currentQuestion.question)}
        </h4>

        {/* Multiple-choice Options */}
        <div className="space-y-2">
          {currentQuestion.options.map((opt, optIdx) => {
            const letter = String.fromCharCode(65 + optIdx);
            const isThisSelected = selectedOption === optIdx;
            const isThisCorrect = optIdx === currentQuestion.correctIndex;

            let btnStyle =
              'border-[#d8e2dc] bg-white hover:border-[#0d4a3e] hover:bg-[#edf3f0]/60 text-[#13221d]';
            let badgeStyle = 'bg-[#edf3f0] text-[#0d4a3e]';

            if (isAnswered) {
              if (isThisCorrect) {
                btnStyle = 'border-[#0d4a3e] bg-[#edf3f0] text-[#0d4a3e] font-semibold';
                badgeStyle = 'bg-[#0d4a3e] text-white';
              } else if (isThisSelected && !isThisCorrect) {
                btnStyle = 'border-[#b85d2b] bg-[#fdf2ee] text-[#9a4619]';
                badgeStyle = 'bg-[#b85d2b] text-white';
              } else {
                btnStyle = 'border-[#e3ebe6] bg-white/70 text-[#70837b]';
                badgeStyle = 'bg-[#edf3f0] text-[#70837b]';
              }
            }

            return (
              <button
                key={opt}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full text-left rounded-lg border px-3.5 py-2.5 text-xs sm:text-sm flex items-center justify-between gap-3 transition-colors ${
                  isAnswered ? 'cursor-default' : 'cursor-pointer'
                } ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center shrink-0 ${badgeStyle}`}
                  >
                    {letter}
                  </span>
                  <span>{formatScientificIndices(opt)}</span>
                </div>

                {isAnswered && isThisCorrect && (
                  <CheckCircle2 className="w-4 h-4 text-[#0d4a3e] shrink-0" />
                )}
                {isAnswered && isThisSelected && !isThisCorrect && (
                  <XCircle className="w-4 h-4 text-[#b85d2b] shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Immediate Feedback Panel */}
        {isAnswered ? (
          <div
            className={`rounded-lg border p-3.5 space-y-1.5 ${
              isCorrect
                ? 'bg-[#edf3f0] border-[#0d4a3e]/35 text-[#13221d]'
                : 'bg-[#fdf2ee] border-[#b85d2b]/35 text-[#13221d]'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#0d4a3e]" />
                    <span className="text-[#0d4a3e]">Răspuns corect!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-[#b85d2b]" />
                    <span className="text-[#b85d2b]">
                      Răspuns incorect — varianta corectă este {String.fromCharCode(65 + currentQuestion.correctIndex)}
                    </span>
                  </>
                )}
              </div>
              <span className="font-mono text-[11px] font-semibold text-[#53665f] bg-white/80 px-2 py-0.5 rounded border border-[#d8e2dc]">
                {formatScientificIndices(currentQuestion.formulaHint)}
              </span>
            </div>
          <p className="text-xs text-[#31453e] leading-relaxed">{formatScientificIndices(currentQuestion.explanation)}</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[11.5px] text-[#53665f]">
            <HelpCircle className="w-3.5 h-3.5 text-[#0d4a3e] shrink-0" />
            <span>Selectează o variantă pentru a primi explicația fizică imediată.</span>
          </div>
        )}
      </div>

      {/* Completion Banner */}
      {allCompleted && (
        <div className="rounded-xl border border-[#0d4a3e]/30 bg-[#edf3f0] p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-[#0d4a3e] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-[#0d4a3e]">
                Ai finalizat toate cele {stats.total} provocări de fizică! Scor: {stats.correctCount}/{stats.total} ({stats.pct}%)
              </div>
              <p className="text-xs text-[#31453e] mt-0.5">
                {stats.pct >= 80
                  ? 'Excelent! Stăpânești foarte bine legile coardei vibrante, armonicele și analiza spectrală Fourier.'
                  : 'Rezultat bun! Poți revizita întrebările marcate cu cupru sau poți experimenta în modulele de mai sus și apoi reseta testul.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAll}
            className="px-3 py-1.5 rounded-lg bg-[#0d4a3e] hover:bg-[#09382f] text-white text-xs font-semibold cursor-pointer"
          >
            Reia testul
          </button>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          className="px-3 py-1.5 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] disabled:opacity-45 text-xs font-medium text-[#13221d] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Întrebarea anterioară</span>
        </button>

        <button
          type="button"
          disabled={currentIndex >= QUESTIONS.length - 1}
          onClick={() => setCurrentIndex((i) => Math.min(QUESTIONS.length - 1, i + 1))}
          className="px-3.5 py-1.5 rounded-lg bg-[#0d4a3e] hover:bg-[#09382f] disabled:opacity-45 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Următoarea întrebare</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
