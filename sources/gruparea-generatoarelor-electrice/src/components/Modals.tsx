import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Compass,
  HelpCircle,
  SlidersHorizontal,
  Target,
  Type,
  X,
} from 'lucide-react';
import { MISSIONS } from '../data/lessonContent';
import { CircuitMetrics, CircuitState, ModuleTabId } from '../types/physics';
import { soundEngine } from '../utils/sound';

export type ActiveModalType =
  | null
  | 'missions'
  | 'tour'
  | 'preferences'
  | 'display'
  | 'howto'
  | 'library';

interface ModalProps {
  activeModal: ActiveModalType;
  onClose: () => void;
  circuitState: CircuitState;
  metrics: CircuitMetrics;
  snapshotsCount: number;
  onJumpToModule: (tab: ModuleTabId) => void;
  animationSpeed: number;
  setAnimationSpeed: (v: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  textScale: 'normal' | 'large';
  setTextScale: (v: 'normal' | 'large') => void;
  boardMode: boolean;
  setBoardMode: (v: boolean) => void;
}

export const LabModals: React.FC<ModalProps> = ({
  activeModal,
  onClose,
  circuitState,
  metrics,
  snapshotsCount,
  onJumpToModule,
  animationSpeed,
  setAnimationSpeed,
  soundEnabled,
  onToggleSound,
  textScale,
  setTextScale,
  boardMode,
  setBoardMode,
}) => {
  const [tourStep, setTourStep] = useState(0);

  if (!activeModal) return null;

  const tourSteps = [
    {
      title: '1. Alege modulul și configurarea surselor',
      body: 'Folosește cele 7 taburi principale pentru a trece progresiv de la un generator real la gruparea în serie (inclusiv opoziție), paralel (inclusiv surse diferite), mixtă, calculator echivalent, exemple practice și testul final.',
    },
    {
      title: '2. Modifică E, r și polaritatea în timp real',
      body: 'Fiecare sursă are tensiune electromotoare E și rezistență internă r variabile. Reține că r este inclusă în interiorul sursei, nu ca o piesă separată externă. În serie poți inversa polaritatea unei surse direct cu un click!',
    },
    {
      title: '3. Urmărește schema animată și graficele U(I)',
      body: 'Apasă pe întrerupătorul K direct pe schemă sau din panou, comută între sens convențional și flux de electroni, apoi deschide sub-tabul „Grafice și caracteristica U(I)” pentru curbele de tensiune, putere și randament.',
    },
    {
      title: '4. Înregistrează și exportă datele (CSV / JSON)',
      body: 'Apasă „+ Înregistrează” ori de câte ori dorești să salvezi o măsurătoare în jurnalul experimental, apoi descarcă setul de date în format CSV (Excel) sau JSON.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border border-[#E4E2D8] bg-white p-5 sm:p-6 shadow-xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MISSIONS MODAL */}
        {activeModal === 'missions' && (
          <>
            <div className="flex items-center justify-between border-b border-[#EFECE3] pb-3">
              <div className="flex items-center gap-2 text-[#0F4C3A]">
                <Target className="w-5 h-5" />
                <h3 className="text-lg font-bold text-[#17231E]">Misiuni experimentale (0–6)</h3>
              </div>
              <button
                onClick={onClose}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F2F1EB]"
                aria-label="Închide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-[#4E5D56]">
              Realizează configurațiile de mai jos direct în simulator. Misiunile se validează automat pe baza calculelor fizice.
            </p>
            <div className="space-y-2.5">
              {MISSIONS.map((m) => {
                const done = m.checkCompleted(circuitState, metrics, snapshotsCount);
                return (
                  <div
                    key={m.id}
                    className={`rounded-xl border p-3.5 space-y-1.5 ${
                      done ? 'border-emerald-300 bg-emerald-50/70' : 'border-[#E4E2D8] bg-[#FCFBF8]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        {done ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#94A3B8] shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="text-sm font-bold text-[#17231E]">{m.title}</div>
                          <p className="text-xs text-[#4E5D56] mt-0.5 leading-relaxed">
                            {m.description}
                          </p>
                          <p className="text-xs text-[#0F4C3A] mt-1 font-medium">
                            Indiciu: {m.hint}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          onJumpToModule(m.targetModule);
                          onClose();
                        }}
                        className="shrink-0 min-h-[36px] px-3 py-1.5 rounded-lg border border-[#D4D9D5] bg-white text-xs font-semibold text-[#0F4C3A] hover:bg-[#F4F8F6] whitespace-nowrap"
                      >
                        Mergi <ArrowRight className="w-3 h-3 inline" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* GUIDED TOUR MODAL */}
        {activeModal === 'tour' && (
          <>
            <div className="flex items-center justify-between border-b border-[#EFECE3] pb-3">
              <div className="flex items-center gap-2 text-[#0F4C3A]">
                <Compass className="w-5 h-5" />
                <h3 className="text-lg font-bold text-[#17231E]">Tur ghidat al laboratorului</h3>
              </div>
              <button
                onClick={onClose}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F2F1EB]"
                aria-label="Închide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-xl border border-[#DCE6E1] bg-[#F4F8F6] p-4 space-y-2">
              <div className="text-xs font-mono text-[#0F4C3A] font-semibold">
                Pasul {tourStep + 1} din {tourSteps.length}
              </div>
              <h4 className="text-base font-bold text-[#17231E]">{tourSteps[tourStep].title}</h4>
              <p className="text-sm text-[#4E5D56] leading-relaxed">{tourSteps[tourStep].body}</p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setTourStep((s) => Math.max(0, s - 1))}
                disabled={tourStep === 0}
                className="min-h-[42px] px-4 rounded-xl border border-[#D4D9D5] text-sm font-semibold text-[#4E5D56] disabled:opacity-40"
              >
                Anterior
              </button>
              {tourStep < tourSteps.length - 1 ? (
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setTourStep((s) => s + 1);
                  }}
                  className="min-h-[42px] px-5 rounded-xl bg-[#0F4C3A] text-white text-sm font-semibold hover:bg-[#0A382B]"
                >
                  Următorul pas
                </button>
              ) : (
                <button
                  onClick={() => {
                    soundEngine.playSuccess();
                    setTourStep(0);
                    onClose();
                  }}
                  className="min-h-[42px] px-5 rounded-xl bg-[#0F4C3A] text-white text-sm font-semibold hover:bg-[#0A382B]"
                >
                  Începe experimentul
                </button>
              )}
            </div>
          </>
        )}

        {/* PREFERENCES & DISPLAY MODAL */}
        {(activeModal === 'preferences' || activeModal === 'display') && (
          <>
            <div className="flex items-center justify-between border-b border-[#EFECE3] pb-3">
              <div className="flex items-center gap-2 text-[#0F4C3A]">
                {activeModal === 'display' ? (
                  <Type className="w-5 h-5" />
                ) : (
                  <SlidersHorizontal className="w-5 h-5" />
                )}
                <h3 className="text-lg font-bold text-[#17231E]">
                  {activeModal === 'display' ? 'Text și afișare' : 'Preferințe laborator'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F2F1EB]"
                aria-label="Închide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-[#E4E2D8] p-3.5">
                <div>
                  <div className="text-sm font-semibold text-[#17231E]">Efecte sonore interactive</div>
                  <div className="text-xs text-[#4E5D56]">Sunet la comutator, misiuni și răspunsuri test</div>
                </div>
                <button
                  onClick={onToggleSound}
                  className={`min-h-[40px] px-4 rounded-lg text-xs font-bold transition-colors ${
                    soundEnabled ? 'bg-[#0F4C3A] text-white' : 'bg-[#F2F1EB] text-[#4E5D56]'
                  }`}
                >
                  {soundEnabled ? 'Activ' : 'Dezactivat'}
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[#E4E2D8] p-3.5">
                <div>
                  <div className="text-sm font-semibold text-[#17231E]">Mod tablă (contrast ridicat)</div>
                  <div className="text-xs text-[#4E5D56]">Fundal alb curat pentru videoproiector și tabletă</div>
                </div>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setBoardMode(!boardMode);
                  }}
                  className={`min-h-[40px] px-4 rounded-lg text-xs font-bold transition-colors ${
                    boardMode ? 'bg-[#0F4C3A] text-white' : 'bg-[#F2F1EB] text-[#4E5D56]'
                  }`}
                >
                  {boardMode ? 'Activat' : 'Standard'}
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[#E4E2D8] p-3.5">
                <div>
                  <div className="text-sm font-semibold text-[#17231E]">Dimensiune text lecție</div>
                  <div className="text-xs text-[#4E5D56]">Mărește lizibilitatea pe mobil sau tablă</div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setTextScale('normal')}
                    className={`min-h-[38px] px-3 rounded-lg text-xs font-semibold ${
                      textScale === 'normal' ? 'bg-[#0F4C3A] text-white' : 'bg-[#F2F1EB] text-[#4E5D56]'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => setTextScale('large')}
                    className={`min-h-[38px] px-3 rounded-lg text-xs font-semibold ${
                      textScale === 'large' ? 'bg-[#0F4C3A] text-white' : 'bg-[#F2F1EB] text-[#4E5D56]'
                    }`}
                  >
                    Mărit
                  </button>
                </div>
              </div>

              <label className="block rounded-xl border border-[#E4E2D8] p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#17231E]">
                    Viteză animație purtători de sarcină
                  </span>
                  <span className="text-xs font-mono font-bold text-[#0F4C3A]">
                    {animationSpeed.toFixed(1)}×
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.5}
                  step={0.5}
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                  className="praxis-slider"
                />
              </label>
            </div>
          </>
        )}

        {/* HOW TO USE MODAL */}
        {activeModal === 'howto' && (
          <>
            <div className="flex items-center justify-between border-b border-[#EFECE3] pb-3">
              <div className="flex items-center gap-2 text-[#0F4C3A]">
                <HelpCircle className="w-5 h-5" />
                <h3 className="text-lg font-bold text-[#17231E]">Cum folosești laboratorul</h3>
              </div>
              <button
                onClick={onClose}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F2F1EB]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-[#4E5D56] leading-relaxed">
              <p>
                <strong className="text-[#17231E]">Flux de învățare optimizat:</strong> Parcurge modulele de la stânga la dreapta: începe cu <em>Concepte de bază</em>, compară apoi <em>Serie</em>, <em>Paralel</em> și <em>Mixtă</em>, verifică calculele în <em>Calculator echivalent</em>, testează <em>Exemplele practice</em> și susține <em>Testul final</em>.
              </p>
              <p>
                <strong className="text-[#17231E]">Interacțiune directă pe schemă:</strong> Pe dispozitive tactile sau desktop, poți apăsa direct pe întrerupătorul K pentru a deschide/închide circuitul și pe sursele din serie pentru a inversa polaritatea.
              </p>
              <p>
                <strong className="text-[#17231E]">Export date experimentale:</strong> Folosește butoanele <em>CSV</em> și <em>JSON</em> pentru a descărca instantaneu configurația curentă sau întregul tabel cu măsurătorile înregistrate.
              </p>
            </div>
          </>
        )}

        {/* LIBRARY / CURRICULUM NAVIGATION MODAL */}
        {activeModal === 'library' && (
          <>
            <div className="flex items-center justify-between border-b border-[#EFECE3] pb-3">
              <h3 className="text-lg font-bold text-[#17231E]">
                Bibliotecă · Electricitate, magnetism și circuite
              </h3>
              <button
                onClick={onClose}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F2F1EB]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="rounded-xl border border-[#DCE6E1] bg-[#F4F8F6] p-3.5">
                <div className="text-xs font-semibold text-[#0F4C3A]">Lecția activă</div>
                <div className="font-bold text-[#17231E] mt-0.5">
                  Gruparea generatoarelor electrice (7 module)
                </div>
                <div className="text-xs text-[#4E5D56] mt-1">
                  Serie, opoziție, paralel (Millman), mixtă, calculator echivalent și test interactiv.
                </div>
              </div>
              <div className="rounded-xl border border-[#E4E2D8] bg-[#FCFBF8] p-3.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#17231E]">Legea lui Ohm & Generatorul real</div>
                  <div className="text-xs text-[#4E5D56]">Integrată în Modulul 1: Concepte de bază</div>
                </div>
                <button
                  onClick={() => {
                    onJumpToModule('basic');
                    onClose();
                  }}
                  className="text-xs font-semibold text-[#0F4C3A] hover:underline"
                >
                  Deschide
                </button>
              </div>
              <div className="rounded-xl border border-[#E4E2D8] bg-[#FCFBF8] p-3.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#17231E]">Adaptarea sarcinii și Puterea maximă</div>
                  <div className="text-xs text-[#4E5D56]">Disponibilă în Grafice U(I) și Exemple practice</div>
                </div>
                <button
                  onClick={() => {
                    onJumpToModule('examples');
                    onClose();
                  }}
                  className="text-xs font-semibold text-[#0F4C3A] hover:underline"
                >
                  Deschide
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
