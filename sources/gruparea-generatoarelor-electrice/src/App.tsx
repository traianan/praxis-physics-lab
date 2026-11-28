import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  ChevronUp,
  ChevronDown,
  Compass,
  Download,
  FileJson,
  FileSpreadsheet,
  FlaskConical,
  HelpCircle,
  Library,
  Monitor,
  PlusCircle,
  SlidersHorizontal,
  Target,
  Trash2,
  Type,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { MotionConfig, motion, AnimatePresence } from 'motion/react';
import { ChartsPanel } from './components/ChartsPanel';
import { CircuitDiagram } from './components/CircuitDiagram';
import { ControlSidebar } from './components/ControlSidebar';
import { EquivalentCalculator } from './components/EquivalentCalculator';
import { FinalQuiz } from './components/FinalQuiz';
import { ActiveModalType, LabModals } from './components/Modals';
import { PracticalExamples } from './components/PracticalExamples';
import { DictionaryView, FormulasGuideView } from './components/WorkspaceViews';
import { MISSIONS } from './data/lessonContent';
import {
  CircuitState,
  ExperimentSnapshot,
  GroupingTopology,
  ModuleTabId,
} from './types/physics';
import {
  buildSnapshot,
  exportSimulationCSV,
  exportSimulationJSON,
} from './utils/exportData';
import {
  buildMixedBranches,
  describeTopology,
  formatCurrent,
  formatPower,
  formatResistance,
  solveCircuit,
} from './utils/physicsEngine';
import { soundEngine } from './utils/sound';

const MODULE_TABS: Array<{ id: ModuleTabId; label: string }> = [
  { id: 'basic', label: 'Concepte de bază' },
  { id: 'series', label: 'Gruparea în serie' },
  { id: 'parallel', label: 'Gruparea în paralel' },
  { id: 'mixed', label: 'Gruparea mixtă' },
  { id: 'calculator', label: 'Calculator echivalent' },
  { id: 'examples', label: 'Exemple practice' },
  { id: 'quiz', label: 'Test final' },
];

type WorkspaceMode = 'lab' | 'guide' | 'dictionary';
type StageSubTab = 'circuit' | 'charts';

function getDefaultGeneratorsForTopology(topology: GroupingTopology) {
  if (topology === 'basic') {
    return [{ id: 'g1', label: 'G1', emf: 12, internalResistance: 2, reversed: false }];
  }
  if (topology === 'series') {
    return [
      { id: 'g1', label: 'G1', emf: 6, internalResistance: 1.5, reversed: false },
      { id: 'g2', label: 'G2', emf: 6, internalResistance: 1.5, reversed: false },
      { id: 'g3', label: 'G3', emf: 4.5, internalResistance: 1, reversed: false },
    ];
  }
  return [
    { id: 'g1', label: 'G1', emf: 12, internalResistance: 3, reversed: false },
    { id: 'g2', label: 'G2', emf: 12, internalResistance: 3, reversed: false },
    { id: 'g3', label: 'G3', emf: 12, internalResistance: 3, reversed: false },
  ];
}

export default function App() {
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('lab');
  const [activeTab, setActiveTab] = useState<ModuleTabId>('basic');
  const [stageSubTab, setStageSubTab] = useState<StageSubTab>('circuit');

  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [boardMode, setBoardMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [textScale, setTextScale] = useState<'normal' | 'large'>('normal');
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);

  const [circuitState, setCircuitState] = useState<CircuitState>({
    topology: 'basic',
    switchClosed: true,
    loadResistance: 20,
    flowMode: 'conventional',
    generators: getDefaultGeneratorsForTopology('basic'),
    mixedSeriesCount: 2,
    mixedParallelCount: 2,
    mixedBranches: buildMixedBranches(2, 2, 4.5, 1.5),
  });

  const [snapshots, setSnapshots] = useState<ExperimentSnapshot[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const metrics = useMemo(() => solveCircuit(circuitState), [circuitState]);

  const completedMissionsCount = useMemo(
    () =>
      MISSIONS.filter((m) =>
        m.checkCompleted(circuitState, metrics, snapshots.length)
      ).length,
    [circuitState, metrics, snapshots.length]
  );

  const prevMissionCountRef = useRef(0);
  useEffect(() => {
    if (completedMissionsCount > prevMissionCountRef.current) {
      soundEngine.playMissionComplete();
      setToastMessage(`Misiune îndeplinită! (${completedMissionsCount}/${MISSIONS.length})`);
    }
    prevMissionCountRef.current = completedMissionsCount;
  }, [completedMissionsCount]);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEngine.setEnabled(next);
    if (next) soundEngine.playClick();
  };

  const handleSelectModuleTab = (tabId: ModuleTabId) => {
    soundEngine.playClick();
    setWorkspaceMode('lab');
    setActiveTab(tabId);
    if (tabId === 'basic' || tabId === 'series' || tabId === 'parallel' || tabId === 'mixed') {
      setCircuitState((prev) => {
        if (prev.topology === tabId) return prev;
        return {
          ...prev,
          topology: tabId,
          generators:
            tabId === 'mixed'
              ? prev.generators
              : getDefaultGeneratorsForTopology(tabId),
          loadResistance:
            tabId === 'basic' ? 20 : tabId === 'series' ? 25 : tabId === 'parallel' ? 10 : 12,
        };
      });
    }
  };

  const handleToggleSwitch = () => {
    setCircuitState((prev) => {
      const nextClosed = !prev.switchClosed;
      soundEngine.playSwitch(nextClosed);
      return { ...prev, switchClosed: nextClosed };
    });
  };

  const handleTogglePolarity = (genId: string) => {
    soundEngine.playClick();
    setCircuitState((prev) => ({
      ...prev,
      generators: prev.generators.map((g) =>
        g.id === genId ? { ...g, reversed: !g.reversed } : g
      ),
    }));
  };

  const handleApplyStateAndJump = (
    partialState: Partial<CircuitState>,
    targetTab: ModuleTabId
  ) => {
    setWorkspaceMode('lab');
    setActiveTab(targetTab);
    setStageSubTab('circuit');
    setCircuitState((prev) => ({
      ...prev,
      ...partialState,
    }));
    setToastMessage('Configurație încărcată în simulator.');
  };

  const handleRecordSnapshot = () => {
    soundEngine.playSuccess();
    const snap = buildSnapshot(circuitState, metrics);
    setSnapshots((prev) => [snap, ...prev]);
    setToastMessage('Măsurătoare salvată în jurnalul de laborator.');
  };

  const isSimulatorTab =
    activeTab === 'basic' ||
    activeTab === 'series' ||
    activeTab === 'parallel' ||
    activeTab === 'mixed';

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={`min-h-screen transition-colors ${
          boardMode ? 'board-mode bg-white' : 'bg-[#F7F6F1]'
        } ${textScale === 'large' ? 'text-[16.5px]' : 'text-[15px]'} text-[#17231E]`}
      >
        {/* TOP NAVIGATION BAR (Matching Praxis Science Lab screenshot) */}
        <header className="border-b border-[#E4E2D8] bg-white/95 backdrop-blur-sm">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
            {/* Brand + Collapse Header button */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0F4C3A] text-white font-extrabold text-lg leading-none">
                  p.
                </span>
                <div className="leading-tight hidden sm:block">
                  <div className="text-sm font-extrabold tracking-tight text-[#0F4C3A]">
                    praxis
                  </div>
                  <div className="text-[9px] font-semibold tracking-widest uppercase text-[#4E5D56]">
                    SCIENCE LAB
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setHeaderCollapsed((v) => !v);
                }}
                className="inline-flex items-center gap-1 min-h-[34px] px-2.5 py-1 rounded-full border border-[#D4D9D5] bg-[#FCFBF8] text-xs font-medium text-[#4E5D56] hover:text-[#17231E] whitespace-nowrap"
              >
                {headerCollapsed ? (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" /> Arată antetul
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" /> Ascunde antetul
                  </>
                )}
              </button>
            </div>

            {/* Right Nav Utilities */}
            <nav className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setActiveModal('display');
                }}
                className="hidden md:inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-lg border border-[#E4E2D8] bg-white text-xs font-medium text-[#4E5D56] hover:text-[#17231E] whitespace-nowrap shrink-0"
              >
                <Type className="w-3.5 h-3.5" /> Text / afișare
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setActiveModal('library');
                }}
                className="hidden lg:inline-flex items-center gap-1.5 min-h-[36px] px-2.5 text-xs font-medium text-[#4E5D56] hover:text-[#0F4C3A] whitespace-nowrap shrink-0"
              >
                Bibliotecă
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setActiveModal('library');
                }}
                className="hidden xl:inline-flex items-center gap-1.5 min-h-[36px] px-2.5 text-xs font-medium text-[#4E5D56] hover:text-[#0F4C3A] whitespace-nowrap shrink-0"
              >
                Toate lecțiile
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setActiveModal('howto');
                }}
                className="hidden sm:inline-flex items-center gap-1.5 min-h-[36px] px-2.5 text-xs font-medium text-[#4E5D56] hover:text-[#0F4C3A] whitespace-nowrap shrink-0"
              >
                <HelpCircle className="w-3.5 h-3.5 sm:hidden" />
                Cum folosești laboratorul
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setBoardMode((v) => !v);
                }}
                className={`inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-lg border text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  boardMode
                    ? 'border-[#0F4C3A] bg-[#0F4C3A] text-white'
                    : 'border-[#E4E2D8] bg-white text-[#17231E] hover:bg-[#F7F6F1]'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mod tablă</span>
              </button>
              <button
                type="button"
                onClick={handleToggleSound}
                className={`inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-lg border text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  soundEnabled
                    ? 'border-[#B9D1C7] bg-[#EBF3EF] text-[#0F4C3A]'
                    : 'border-[#E4E2D8] bg-white text-[#64748B]'
                }`}
              >
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5" />
                )}
                <span>{soundEnabled ? 'Sunet activ' : 'Sunet oprit'}</span>
              </button>
              <span className="inline-flex items-center justify-center min-h-[36px] px-2.5 rounded-lg border border-[#E4E2D8] bg-[#FCFBF8] text-xs font-bold text-[#17231E] shrink-0">
                RO
              </span>
            </nav>
          </div>
        </header>

        {/* COLLAPSIBLE BREADCRUMB + HERO BANNER */}
        {!headerCollapsed && (
          <div className="max-w-[1140px] mx-auto px-4 sm:px-6 pt-3 pb-1 space-y-3">
            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#4E5D56]">
              <button
                type="button"
                onClick={() => setActiveModal('library')}
                className="underline decoration-[#D4D9D5] hover:text-[#0F4C3A]"
              >
                Bibliotecă
              </button>
              <span aria-hidden="true">/</span>
              <button
                type="button"
                onClick={() => setActiveModal('library')}
                className="underline decoration-[#D4D9D5] hover:text-[#0F4C3A]"
              >
                Electricitate, magnetism și circuite
              </button>
              <span aria-hidden="true">/</span>
              <span className="font-semibold text-[#17231E]">
                Gruparea generatoarelor electrice
              </span>
            </div>

            {/* Deep Forest Emerald Lesson Banner (Matches screenshot) */}
            <div className="rounded-2xl bg-[#0F4C3A] px-5 sm:px-7 py-4 sm:py-5 text-white shadow-sm flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-balance">
                Gruparea generatoarelor electrice
              </h1>
              <p className="text-xs sm:text-sm text-[#CBE0D8]">
                Legare în serie, paralel, opoziție și mixtă, calculator echivalent, exemple practice și test interactiv — 7 module
              </p>
            </div>
          </div>
        )}

        {/* MAIN WHITE WORKSPACE CARD */}
        <main className="max-w-[1140px] mx-auto px-3 sm:px-6 py-4 pb-12">
          <div className="rounded-3xl border border-[#E4E2D8] bg-white p-4 sm:p-6 shadow-xs space-y-5">
            {/* Workspace Top Row: Mode Switcher + Missions / Tour / Preferences */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-[#EFECE3]">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {(
                  [
                    { id: 'lab', label: 'Laborator interactiv', icon: FlaskConical },
                    { id: 'guide', label: 'Ghid și formule', icon: BookOpen },
                    { id: 'dictionary', label: 'Dicționar', icon: Library },
                  ] as const
                ).map((mode) => {
                  const Icon = mode.icon;
                  const active = workspaceMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setWorkspaceMode(mode.id);
                      }}
                      className={`inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${
                        active
                          ? 'border-[#0F4C3A] bg-[#F4F8F6] text-[#0F4C3A]'
                          : 'border-[#E4E2D8] bg-white text-[#4E5D56] hover:text-[#17231E]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {mode.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveModal('missions');
                  }}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl border border-[#E4E2D8] bg-[#FCFBF8] text-xs font-semibold text-[#17231E] hover:border-[#0F4C3A]/50 whitespace-nowrap shrink-0 tabular-nums"
                >
                  <Target className="w-3.5 h-3.5 text-[#0F4C3A]" />
                  Misiuni: {completedMissionsCount}/{MISSIONS.length}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveModal('tour');
                  }}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl border border-[#E4E2D8] bg-white text-xs font-semibold text-[#4E5D56] hover:text-[#17231E] whitespace-nowrap shrink-0"
                >
                  <Compass className="w-3.5 h-3.5" />
                  Tur ghidat
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveModal('preferences');
                  }}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl border border-[#E4E2D8] bg-white text-xs font-semibold text-[#4E5D56] hover:text-[#17231E] whitespace-nowrap shrink-0"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Preferințe laborator
                </button>
              </div>
            </div>

            {/* WORKSPACE CONTENT */}
            {workspaceMode === 'guide' && (
              <FormulasGuideView onJumpToModule={handleSelectModuleTab} />
            )}

            {workspaceMode === 'dictionary' && (
              <DictionaryView onJumpToModule={handleSelectModuleTab} />
            )}

            {workspaceMode === 'lab' && (
              <div className="space-y-5">
                {/* 7 MODULE TABS (Scrollable on mobile, crisp single-line pills) */}
                <div
                  className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
                  role="tablist"
                  aria-label="Modulele lecției"
                >
                  {MODULE_TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => handleSelectModuleTab(tab.id)}
                        className={`min-h-[42px] px-4 py-2 rounded-xl border text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${
                          isActive
                            ? 'border-[#0F4C3A] bg-[#0F4C3A] text-white shadow-xs'
                            : 'border-[#E4E2D8] bg-white text-[#17231E] hover:bg-[#F7F6F1]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* MODULES 1–4: TWO-COLUMN INTERACTIVE SIMULATOR */}
                <AnimatePresence mode="wait">
                  {isSimulatorTab && (
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.16 }}
                      className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-5 items-start"
                    >
                      {/* LEFT COLUMN: Controls & Parameters */}
                      <ControlSidebar
                        activeTab={activeTab}
                        state={circuitState}
                        metrics={metrics}
                        onUpdateState={setCircuitState}
                        onToggleSwitch={handleToggleSwitch}
                        onTogglePolarity={handleTogglePolarity}
                        onJumpToModule={handleSelectModuleTab}
                      />

                      {/* RIGHT COLUMN: Live Circuit Stage, Telemetry, Graphs & Export */}
                      <div className="space-y-4">
                        {/* Stage Sub-tabs + Export Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                soundEngine.playClick();
                                setStageSubTab('circuit');
                              }}
                              className={`min-h-[40px] px-4 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                                stageSubTab === 'circuit'
                                  ? 'border-[#0F4C3A] bg-[#0F4C3A] text-white'
                                  : 'border-[#E4E2D8] bg-white text-[#17231E] hover:bg-[#F7F6F1]'
                              }`}
                            >
                              Circuit și măsurători
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                soundEngine.playClick();
                                setStageSubTab('charts');
                              }}
                              className={`min-h-[40px] px-4 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                                stageSubTab === 'charts'
                                  ? 'border-[#0F4C3A] bg-[#0F4C3A] text-white'
                                  : 'border-[#E4E2D8] bg-white text-[#17231E] hover:bg-[#F7F6F1]'
                              }`}
                            >
                              Grafice și caracteristica U(I)
                            </button>
                          </div>

                          {/* Record + Export CSV/JSON */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={handleRecordSnapshot}
                              className="inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-xl border border-[#B9D1C7] bg-[#F4F8F6] text-xs font-semibold text-[#0F4C3A] hover:bg-[#E4EFEA] whitespace-nowrap"
                              title="Adaugă măsurătoarea curentă în jurnal"
                            >
                              <PlusCircle className="w-3.5 h-3.5" /> Înregistrează
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                soundEngine.playClick();
                                exportSimulationCSV(circuitState, metrics, snapshots);
                                setToastMessage('Fișier CSV descărcat.');
                              }}
                              className="inline-flex items-center gap-1 min-h-[38px] px-3 rounded-xl border border-[#E4E2D8] bg-white text-xs font-semibold text-[#17231E] hover:bg-[#F7F6F1] whitespace-nowrap"
                              title="Exportă datele simulate în format CSV"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5 text-[#0F4C3A]" /> CSV
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                soundEngine.playClick();
                                exportSimulationJSON(circuitState, metrics, snapshots);
                                setToastMessage('Fișier JSON descărcat.');
                              }}
                              className="inline-flex items-center gap-1 min-h-[38px] px-3 rounded-xl border border-[#E4E2D8] bg-white text-xs font-semibold text-[#17231E] hover:bg-[#F7F6F1] whitespace-nowrap"
                              title="Exportă datele simulate în format JSON"
                            >
                              <FileJson className="w-3.5 h-3.5 text-[#0F4C3A]" /> JSON
                            </button>
                          </div>
                        </div>

                        {/* Main Stage Card */}
                        <div className="rounded-2xl border border-[#E4E2D8] bg-white p-4 sm:p-5 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <h3 className="text-base font-bold text-[#17231E] flex items-center gap-2">
                                <FlaskConical className="w-4 h-4 text-[#0F4C3A]" />
                                Schema circuitului și măsurători în timp real
                              </h3>
                              <p className="text-xs text-[#4E5D56] mt-0.5">
                                Apasă pe întrerupătorul K direct pe schemă sau modifică parametrii surselor din panou.
                              </p>
                            </div>

                            {/* Flow direction switcher */}
                            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F2F1EB] self-start">
                              <button
                                type="button"
                                onClick={() => {
                                  soundEngine.playClick();
                                  setCircuitState((p) => ({ ...p, flowMode: 'conventional' }));
                                }}
                                className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                                  circuitState.flowMode === 'conventional'
                                    ? 'bg-white text-[#0F4C3A] shadow-xs'
                                    : 'text-[#4E5D56]'
                                }`}
                              >
                                Sens convențional (+ → −)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  soundEngine.playClick();
                                  setCircuitState((p) => ({ ...p, flowMode: 'electrons' }));
                                }}
                                className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                                  circuitState.flowMode === 'electrons'
                                    ? 'bg-white text-[#0284C7] shadow-xs'
                                    : 'text-[#4E5D56]'
                                }`}
                              >
                                Flux electroni (− → +)
                              </button>
                            </div>
                          </div>

                          {/* 4 LIVE KPI READOUT BOXES (Matching screenshot) */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="rounded-xl bg-[#F7F6F1] p-3.5">
                              <div className="text-[11px] font-semibold uppercase tracking-wide text-[#4E5D56]">
                                E_e / U la borne
                              </div>
                              <div className="text-lg font-extrabold font-mono tabular-nums text-[#17231E] mt-1">
                                {metrics.equivalentEmf.toFixed(1)} V
                              </div>
                              <div className="text-xs font-mono tabular-nums text-[#0284C7] font-semibold">
                                U = {metrics.terminalVoltage.toFixed(2)} V
                              </div>
                            </div>

                            <div className="rounded-xl bg-[#F7F6F1] p-3.5">
                              <div className="text-[11px] font-semibold uppercase tracking-wide text-[#4E5D56]">
                                Rezistențe (R / r_e)
                              </div>
                              <div className="text-lg font-extrabold font-mono tabular-nums text-[#17231E] mt-1">
                                {formatResistance(circuitState.loadResistance)}
                              </div>
                              <div className="text-xs font-mono tabular-nums text-[#4E5D56]">
                                r_e = {metrics.equivalentInternalR.toFixed(2)} Ω
                              </div>
                            </div>

                            <div className="rounded-xl bg-[#F7F6F1] p-3.5">
                              <div className="text-[11px] font-semibold uppercase tracking-wide text-[#4E5D56]">
                                Curent (I)
                              </div>
                              <div className="text-lg font-extrabold font-mono tabular-nums text-[#C2410C] mt-1">
                                {formatCurrent(metrics.loadCurrentAbs)}
                              </div>
                              <div className="text-xs font-mono tabular-nums text-[#4E5D56]">
                                I_sc = {formatCurrent(metrics.shortCircuitCurrent)}
                              </div>
                            </div>

                            <div className="rounded-xl bg-[#F7F6F1] p-3.5">
                              <div className="text-[11px] font-semibold uppercase tracking-wide text-[#4E5D56]">
                                Putere & Randament
                              </div>
                              <div className="text-lg font-extrabold font-mono tabular-nums text-[#9A3412] mt-1">
                                {formatPower(metrics.loadPower)}
                              </div>
                              <div className="text-xs font-mono tabular-nums text-[#4E5D56]">
                                P_r = {formatPower(metrics.internalPower)} · η = {metrics.efficiency.toFixed(0)}%
                              </div>
                            </div>
                          </div>

                          {/* Diagram OR Charts */}
                          {stageSubTab === 'circuit' ? (
                            <CircuitDiagram
                              state={circuitState}
                              metrics={metrics}
                              onToggleSwitch={handleToggleSwitch}
                              onTogglePolarity={
                                activeTab === 'series' ? handleTogglePolarity : undefined
                              }
                              animationSpeed={animationSpeed}
                            />
                          ) : (
                            <ChartsPanel state={circuitState} metrics={metrics} />
                          )}
                        </div>

                        {/* LAB NOTEBOOK / SNAPSHOTS TABLE FOR CSV/JSON EXPORT */}
                        {snapshots.length > 0 && (
                          <div className="rounded-2xl border border-[#E4E2D8] bg-white p-4 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <h4 className="text-sm font-bold text-[#17231E]">
                                  Jurnal de măsurători ({snapshots.length})
                                </h4>
                                <p className="text-xs text-[#4E5D56]">
                                  Datele salvate pot fi descărcate ca set experimental complet în CSV sau JSON.
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => exportSimulationCSV(circuitState, metrics, snapshots)}
                                  className="inline-flex items-center gap-1 min-h-[34px] px-3 rounded-lg bg-[#0F4C3A] text-white text-xs font-semibold hover:bg-[#0A382B]"
                                >
                                  <Download className="w-3.5 h-3.5" /> Descarcă CSV
                                </button>
                                <button
                                  type="button"
                                  onClick={() => exportSimulationJSON(circuitState, metrics, snapshots)}
                                  className="inline-flex items-center gap-1 min-h-[34px] px-3 rounded-lg border border-[#D4D9D5] bg-white text-xs font-semibold text-[#17231E]"
                                >
                                  <Download className="w-3.5 h-3.5" /> Descarcă JSON
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSnapshots([])}
                                  className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg border border-[#E4E2D8] text-[#64748B] hover:text-red-600"
                                  title="Golește jurnalul"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs font-mono tabular-nums">
                                <thead>
                                  <tr className="border-b border-[#EFECE3] text-[#4E5D56]">
                                    <th className="py-2 pr-3 font-sans font-semibold">Grupare</th>
                                    <th className="py-2 px-2 font-sans font-semibold">E_e</th>
                                    <th className="py-2 px-2 font-sans font-semibold">r_e</th>
                                    <th className="py-2 px-2 font-sans font-semibold">R</th>
                                    <th className="py-2 px-2 font-sans font-semibold">U</th>
                                    <th className="py-2 px-2 font-sans font-semibold">I</th>
                                    <th className="py-2 pl-2 font-sans font-semibold">η</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {snapshots.slice(0, 6).map((row) => (
                                    <tr key={row.id} className="border-b border-[#F7F6F1]">
                                      <td className="py-2 pr-3 font-sans font-medium text-[#17231E]">
                                        {describeTopology(row.topology)}
                                      </td>
                                      <td className="py-2 px-2">{row.equivalentEmf} V</td>
                                      <td className="py-2 px-2">{row.equivalentInternalR} Ω</td>
                                      <td className="py-2 px-2">{row.loadResistance} Ω</td>
                                      <td className="py-2 px-2 text-[#0284C7]">{row.terminalVoltage} V</td>
                                      <td className="py-2 px-2 text-[#C2410C]">{row.loadCurrent} A</td>
                                      <td className="py-2 pl-2">{row.efficiency}%</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'calculator' && (
                    <motion.div
                      key="calculator"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.16 }}
                    >
                      <EquivalentCalculator onApplyToLab={handleApplyStateAndJump} />
                    </motion.div>
                  )}

                  {activeTab === 'examples' && (
                    <motion.div
                      key="examples"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.16 }}
                    >
                      <PracticalExamples onLoadPreset={handleApplyStateAndJump} />
                    </motion.div>
                  )}

                  {activeTab === 'quiz' && (
                    <motion.div
                      key="quiz"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.16 }}
                    >
                      <FinalQuiz onJumpToModule={handleSelectModuleTab} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </main>

        {/* NON-BLOCKING TOAST NOTIFICATION */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="fixed bottom-4 right-4 z-40 rounded-xl bg-[#0F4C3A] text-white px-4 py-2.5 text-sm font-semibold shadow-lg"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* INTERACTIVE MODALS */}
        <LabModals
          activeModal={activeModal}
          onClose={() => setActiveModal(null)}
          circuitState={circuitState}
          metrics={metrics}
          snapshotsCount={snapshots.length}
          onJumpToModule={handleSelectModuleTab}
          animationSpeed={animationSpeed}
          setAnimationSpeed={setAnimationSpeed}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          textScale={textScale}
          setTextScale={setTextScale}
          boardMode={boardMode}
          setBoardMode={setBoardMode}
        />
      </div>
    </MotionConfig>
  );
}
