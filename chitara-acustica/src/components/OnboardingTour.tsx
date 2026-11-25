import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Compass, Sparkles, X } from 'lucide-react';
import { LabModuleId, TopSection } from '../types/guitar';

export const TOUR_STORAGE_KEY = 'chitara_acustica_virtuala_tour_done_v1';

export type TourStep = {
  id: string;
  targetId: string;
  title: string;
  subtitle: string;
  description: string;
  experimentTip: string;
  switchToModule?: LabModuleId;
  switchToSection?: TopSection;
  padding?: number;
};

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome-strip',
    targetId: 'module-strip',
    title: 'Bun venit în Laboratorul de Fizică a Sunetului',
    subtitle: 'Traseu progresiv · 8 module experimentale',
    description:
      'Aplicația este structurată pas cu pas, de la frecvența unei note până la armonice, temperament, spectru Fourier și simulare 3D.',
    experimentTip:
      'Poți naviga oricând între module din această bară sau poți urma pașii de mai jos pentru a vedea modulele cheie.',
    switchToSection: 'lab',
    switchToModule: 'notes',
    padding: 6,
  },
  {
    id: 'step-notes',
    targetId: 'module-tab-notes',
    title: '1. Nota și frecvența (f₀)',
    subtitle: 'Înălțimea sunetului și scara logaritmică',
    description:
      'Descoperă legătura dintre nota muzicală și frecvența în Herți (de ex. La4 = 440 Hz) și verifică de ce fiecare octavă dublează frecvența.',
    experimentTip:
      'Apasă clapele virtuale sau modifică frecvența de referință pentru a asculta și compara înălțimile.',
    switchToSection: 'lab',
    switchToModule: 'notes',
    padding: 5,
  },
  {
    id: 'step-string',
    targetId: 'module-tab-string',
    title: '2. Coarda chitarei (f₁ = 1/(2L)·√(T/μ))',
    subtitle: 'Lungime, tensiune și densitate liniară',
    description:
      'Experimentează direct pe griful 2D al chitarei cum apăsarea freturilor scurtează lungimea efectivă L și crește frecvența vibrației.',
    experimentTip:
      'Ciupește o coardă pe grif, apoi ajustează tensiunea T sau fretul pentru a vedea modificarea instantanee a frecvenței.',
    switchToSection: 'lab',
    switchToModule: 'string',
    padding: 5,
  },
  {
    id: 'step-harmonics',
    targetId: 'module-tab-harmonics',
    title: '3. Armonicele și timbrul',
    subtitle: 'Unde staționare și poziția ciupirii',
    description:
      'O coardă nu vibrează doar pe fundamentală (f₀), ci și pe multipli întregi (2f₀, 3f₀, 4f₀…). Ponderea lor definește timbrul chitarei.',
    experimentTip:
      'Mută poziția penei (p) sau izolează un singur armonic pentru a observa nodurile și ventrurile undei staționare.',
    switchToSection: 'lab',
    switchToModule: 'harmonics',
    padding: 5,
  },
  {
    id: 'step-spectrum',
    targetId: 'module-tab-spectrum',
    title: '7. Spectrul Fourier (FFT)',
    subtitle: 'Analiză spectrală și export de date',
    description:
      'Descompune sunetul în timp real în componentele sale de frecvență, observă vârfurile armonice și exportă datele în format CSV sau JSON.',
    experimentTip:
      'Ciupește o coardă și urmărește spectrul FFT; apasă Export CSV sau JSON pentru a salva analiza spectrală.',
    switchToSection: 'lab',
    switchToModule: 'spectrum',
    padding: 5,
  },
  {
    id: 'step-sandbox',
    targetId: 'module-tab-sandbox',
    title: '8. Laborator liber & Misiuni',
    subtitle: 'Simulare 3D WebGL, Osciloscop, Acordor & Metronom',
    description:
      'Combină liber acordajele chitarei cu simularea 3D a modurilor de vibrație, osciloscopul comparativ, acordorul polifonic/cromatic și înregistrarea .wav.',
    experimentTip:
      'Începe cu o ciupire pe grif și urmărește simultan osciloscopul, spectrul Fourier și animația 3D a corzii.',
    switchToSection: 'lab',
    switchToModule: 'sandbox',
    padding: 5,
  },
  {
    id: 'step-sound',
    targetId: 'sound-toggle-btn',
    title: 'Activează sunetul și începe experimentele!',
    subtitle: 'Sinteză audio în timp real (Web Audio API)',
    description:
      'Toate modulele generează sunet acustic și tonuri de referință direct în browser. Asigură-te că butonul „Sunet activ” este pornit.',
    experimentTip:
      'După închiderea ghidului, poți relua acest tur oricând din butonul „Tur ghidat” din bara de instrumente.',
    switchToSection: 'lab',
    switchToModule: 'string',
    padding: 6,
  },
];

type RectBox = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type OnboardingTourProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (id: LabModuleId) => void;
  onSelectSection: (section: TopSection) => void;
};

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  onSelectModule,
  onSelectSection,
}) => {
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<RectBox | null>(null);
  const [cardHeight, setCardHeight] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<{ w: number; h: number }>({
    w: typeof window !== 'undefined' ? window.innerWidth : 1280,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  const currentStep = TOUR_STEPS[stepIndex] ?? TOUR_STEPS[0];

  // Reset step to 0 whenever tour opens
  useEffect(() => {
    if (isOpen) {
      setStepIndex(0);
    }
  }, [isOpen]);

  // Switch active section/module when advancing steps so user sees the module context
  useEffect(() => {
    if (!isOpen) return;
    if (currentStep.switchToSection) {
      onSelectSection(currentStep.switchToSection);
    }
    if (currentStep.switchToModule) {
      onSelectModule(currentStep.switchToModule);
    }
  }, [isOpen, currentStep, onSelectModule, onSelectSection]);

  const measureTarget = useCallback(() => {
    if (!isOpen) return;
    setViewport({ w: window.innerWidth, h: window.innerHeight });

    const el = document.querySelector(`[data-tour-id="${currentStep.targetId}"]`) as HTMLElement | null;
    if (!el) {
      setTargetRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    const pad = currentStep.padding ?? 6;
    setTargetRect({
      top: Math.max(4, rect.top - pad),
      left: Math.max(4, rect.left - pad),
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    });
  }, [isOpen, currentStep]);

  // Scroll highlighted element smoothly into view on step change and re-measure
  useLayoutEffect(() => {
    if (!isOpen) return;
    const el = document.querySelector(`[data-tour-id="${currentStep.targetId}"]`) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    measureTarget();
    const t1 = window.setTimeout(measureTarget, 120);
    const t2 = window.setTimeout(measureTarget, 320);

    window.addEventListener('resize', measureTarget);
    window.addEventListener('scroll', measureTarget, true);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('resize', measureTarget);
      window.removeEventListener('scroll', measureTarget, true);
    };
  }, [isOpen, currentStep, measureTarget]);

  useLayoutEffect(() => {
    if (!isOpen || !cardRef.current) return;
    const card = cardRef.current;
    const measure = () => setCardHeight(card.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(card);
    return () => observer.disconnect();
  }, [isOpen, currentStep, viewport.w]);

  const handleFinish = useCallback(() => {
    try {
      window.localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    } catch {
      // Ignore storage error
    }
    onClose();
  }, [onClose]);

  const handleNext = useCallback(() => {
    if (stepIndex < TOUR_STEPS.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      handleFinish();
    }
  }, [stepIndex, handleFinish]);

  const handlePrev = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleFinish();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handleFinish, handleNext, handlePrev]);

  if (!isOpen) return null;

  // Compute clamped floating card coordinates relative to targetRect
  const cardWidth = Math.min(400, viewport.w - 24);
  const estimatedCardHeight = Math.min(cardHeight || 540, viewport.h - 24);
  const cardMaxHeight = Math.max(200, viewport.h - 24);
  const margin = 14;

  let cardTop = Math.max(20, (viewport.h - estimatedCardHeight) / 2);
  let cardLeft = Math.max(12, (viewport.w - cardWidth) / 2);

  if (targetRect) {
    const spaceBelow = viewport.h - (targetRect.top + targetRect.height);
    const spaceAbove = targetRect.top;

    if (spaceBelow >= estimatedCardHeight + margin) {
      cardTop = targetRect.top + targetRect.height + margin;
    } else if (spaceAbove >= estimatedCardHeight + margin) {
      cardTop = targetRect.top - estimatedCardHeight - margin;
    } else {
      cardTop = Math.max(12, Math.min(viewport.h - estimatedCardHeight - 12, targetRect.top + targetRect.height + margin));
    }

    const preferredLeft = targetRect.left + targetRect.width / 2 - cardWidth / 2;
    cardLeft = Math.max(12, Math.min(viewport.w - cardWidth - 12, preferredLeft));
  }

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-tour-title"
    >
      {/* Dimmed backdrop with crisp SVG cutout around the highlighted element */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-auto"
        onClick={handleFinish}
        aria-hidden="true"
      >
        <defs>
          <mask id="onboarding-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left}
                y={targetRect.top}
                width={targetRect.width}
                height={targetRect.height}
                rx={10}
                ry={10}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(13, 34, 29, 0.56)"
          mask="url(#onboarding-spotlight-mask)"
        />
      </svg>

      {/* Crisp spotlight frame around the active target */}
      {targetRect && (
        <div
          className="fixed pointer-events-none rounded-[10px] border-2 border-[#b85d2b] shadow-[0_0_0_2px_rgba(255,255,255,0.9)] transition-all duration-200"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
        />
      )}

      {/* Instruction Popover Card */}
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        className="guitar-tour-card fixed z-10 rounded-xl border border-[#d8e2dc] bg-white shadow-xl p-5 space-y-3.5 transition-all duration-200"
        style={{
          top: cardTop,
          left: cardLeft,
          width: cardWidth,
          maxHeight: cardMaxHeight,
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#edf3f0] text-[#0d4a3e]">
              <Compass className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-mono font-semibold tracking-wide text-[#0d4a3e] tabular-nums">
              GHID PAS CU PAS · {stepIndex + 1} / {TOUR_STEPS.length}
            </span>
          </div>
          <button
            type="button"
            onClick={handleFinish}
            aria-label="Închide ghidul"
            className="p-1 rounded-md text-[#53665f] hover:text-[#13221d] hover:bg-[#edf3f0] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress segments */}
        <div className="guitar-tour-progress grid grid-cols-7 gap-1">
          {TOUR_STEPS.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              data-current={idx === stepIndex ? 'true' : 'false'}
              onClick={() => setStepIndex(idx)}
              aria-label={`Mergi la pasul ${idx + 1}: ${s.title}`}
              className={`h-1.5 rounded-full transition-colors cursor-pointer ${
                idx <= stepIndex ? 'bg-[#0d4a3e]' : 'bg-[#dce6e1] hover:bg-[#b8ccc2]'
              }`}
            ><span aria-hidden="true" /></button>
          ))}
        </div>

        {/* Title & Body */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-medium text-[#b85d2b]">{currentStep.subtitle}</div>
          <h2 id="onboarding-tour-title" className="text-base font-bold text-[#13221d] leading-snug">
            {currentStep.title}
          </h2>
          <p className="text-xs text-[#53665f] leading-relaxed">{currentStep.description}</p>
        </div>

        {/* Actionable Experiment Tip */}
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3 py-2.5 flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#0d4a3e] shrink-0 mt-0.5" />
          <p className="text-[11.5px] text-[#13221d] leading-snug">
            <span className="font-semibold text-[#0d4a3e]">Cum începi: </span>
            {currentStep.experimentTip}
          </p>
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={handleFinish}
            className="text-xs font-medium text-[#53665f] hover:text-[#13221d] underline-offset-4 hover:underline cursor-pointer"
          >
            Sari peste
          </button>

          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] text-xs font-medium text-[#13221d] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Înapoi</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="px-3.5 py-1.5 rounded-lg bg-[#0d4a3e] hover:bg-[#09382f] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>
                {stepIndex < TOUR_STEPS.length - 1 ? 'Pasul următor' : 'Începe experimentele'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
