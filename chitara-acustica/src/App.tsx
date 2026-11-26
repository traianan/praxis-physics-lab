import { LabStepper } from "./components/LabStepper";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookMarked, BookOpen, CheckCircle2, Compass, Play, RotateCcw, Settings2 } from 'lucide-react';
import { audioEngine } from './audio/AudioEngine';
import { DictionaryView } from './components/DictionaryView';
import { GuideView } from './components/GuideView';
import { OnboardingTour, TOUR_STORAGE_KEY } from './components/OnboardingTour';
import { Module1Notes } from './components/modules/Module1Notes';
import { Module2String } from './components/modules/Module2String';
import { Module3Harmonics } from './components/modules/Module3Harmonics';
import { Module4Temperament } from './components/modules/Module4Temperament';
import { Module5Scales } from './components/modules/Module5Scales';
import { Module6Chords } from './components/modules/Module6Chords';
import { Module7Spectrum } from './components/modules/Module7Spectrum';
import { Module8Sandbox } from './components/modules/Module8Sandbox';
import { LabModuleId, LabPreferences, MissionId, NotationSystem, TopSection, TuningId } from './types/guitar';
import { GUIDED_MISSIONS, buildStringsForTuning } from './utils/musicTheory';

const STORAGE_KEY = 'chitara_acustica_virtuala_prefs_v1';

const DEFAULT_PREFS: LabPreferences = {
  notation: 'anglo',
  volume: 0.8,
  soundEnabled: false,
  boardMode: false,
  tuning: 'standard',
  activeModule: 'string',
  completedMissions: [],
};

const MODULES: Array<{ id: LabModuleId; label: string }> = [
  { id: 'notes', label: 'Note și frecvențe' },
  { id: 'string', label: 'Coarda chitarei' },
  { id: 'harmonics', label: 'Armonice' },
  { id: 'temperament', label: 'Temperament' },
  { id: 'scales', label: 'Game și intervale' },
  { id: 'chords', label: 'Acorduri' },
  { id: 'spectrum', label: 'Spectru' },
  { id: 'sandbox', label: 'Laborator liber' },
];

const QUICK_AUDIO_ACTIONS: Partial<Record<LabModuleId, Array<{ id: string; label: string; shortLabel?: string }>>> = {
  notes: [{ id: 'note', label: 'Redă nota' }],
  string: [{ id: 'string', label: 'Ciupește coarda' }],
  harmonics: [{ id: 'harmonics', label: 'Ascultă sunetul compus' }],
  temperament: [
    { id: 'pure', label: 'Interval pur', shortLabel: 'Pur' },
    { id: 'tempered', label: 'Temperat' },
    { id: 'beats', label: 'Ascultă bătăile', shortLabel: 'Bătăi' },
  ],
  scales: [{ id: 'scale', label: 'Redă gama' }],
  chords: [
    { id: 'arpeggio', label: 'Arpegiat' },
    { id: 'simultaneous', label: 'Simultan' },
    { id: 'strum', label: 'Ciupire toate corzile', shortLabel: 'Ciupire' },
  ],
  spectrum: [{ id: 'spectrum', label: 'Ciupește coarda' }],
  sandbox: [{ id: 'sandbox', label: 'Audiază nota' }],
};

function loadPreferences(): LabPreferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<LabPreferences>;
    return {
      ...DEFAULT_PREFS,
      ...parsed,
      completedMissions: Array.isArray(parsed.completedMissions) ? parsed.completedMissions : [],
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export default function App() {
  const [prefs, setPrefs] = useState<LabPreferences>(() => ({
    ...loadPreferences(),
    soundEnabled: window.PraxisSound?.enabled ?? false,
  }));
  const [topSection, setTopSection] = useState<TopSection>('lab');
  const [showPrefsPopover, setShowPrefsPopover] = useState<boolean>(false);
  const [missionBanner, setMissionBanner] = useState<string | null>(null);
  const [showTour, setShowTour] = useState<boolean>(false);

  const strings = useMemo(() => buildStringsForTuning(prefs.tuning), [prefs.tuning]);

  useEffect(() => {
    try {
      const done = window.localStorage.getItem(TOUR_STORAGE_KEY);
      if (done !== 'true') {
        const timer = window.setTimeout(() => setShowTour(true), 350);
        return () => window.clearTimeout(timer);
      }
    } catch {
      // Ignore storage read errors
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore storage quota errors
    }
  }, [prefs]);

  useEffect(() => {
    audioEngine.setVolume(prefs.volume);
    audioEngine.setMuted(!prefs.soundEnabled);
  }, [prefs.volume, prefs.soundEnabled]);

  useEffect(() => {
    const syncSound = (event: Event) => {
      const detail = (event as CustomEvent<{ enabled: boolean; userGesture?: boolean }>).detail;
      const enabled = Boolean(detail?.enabled);
      audioEngine.setMuted(!enabled);
      if (!enabled) audioEngine.stopAll();
      else if (detail?.userGesture) audioEngine.ensureContext();
      setPrefs((current) => current.soundEnabled === enabled ? current : { ...current, soundEnabled: enabled });
    };
    const syncBoard = () => {
      const enabled = document.documentElement.dataset.praxisWhiteboard === 'true';
      setPrefs((current) => current.boardMode === enabled ? current : { ...current, boardMode: enabled });
    };
    window.addEventListener('praxis-sound-change', syncSound);
    const observer = new MutationObserver(syncBoard);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-praxis-whiteboard'] });
    syncSound(new CustomEvent('praxis-sound-change', { detail: { enabled: window.PraxisSound?.enabled ?? false } }));
    syncBoard();
    return () => {
      window.removeEventListener('praxis-sound-change', syncSound);
      observer.disconnect();
    };
  }, []);

  const setActiveModule = useCallback((id: LabModuleId) => {
    setTopSection('lab');
    setPrefs((prev) => (prev.activeModule === id ? prev : { ...prev, activeModule: id }));
  }, []);

  const handleCompleteMission = (id: MissionId) => {
    setPrefs((prev) => {
      if (prev.completedMissions.includes(id)) return prev;
      const mission = GUIDED_MISSIONS.find((m) => m.id === id);
      if (mission) {
        setMissionBanner(`Misiune realizată: ${mission.title}`);
        window.setTimeout(() => setMissionBanner(null), 4500);
      }
      return {
        ...prev,
        completedMissions: [...prev.completedMissions, id],
      };
    });
  };

  const resetLab = () => {
    audioEngine.stopAll();
    setPrefs(DEFAULT_PREFS);
    setTopSection('lab');
    setShowPrefsPopover(false);
  };

  return (
    <div data-praxis-sound-feedback="off" className={`min-h-screen bg-[#f5f7f5] text-[#13221d] ${prefs.boardMode ? 'board-mode' : ''}`}>
      {/* Main Container */}
      <div id="top" className="guitar-app-main max-w-[1380px] mx-auto px-4 sm:px-6 py-3 space-y-3">

        {/* Workspace Toolbar Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-white border border-[#d8e2dc]">
            <button
              type="button"
              onClick={() => setTopSection('lab')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                topSection === 'lab'
                  ? 'bg-[#0d4a3e] text-white'
                  : 'text-[#53665f] hover:text-[#13221d]'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Laborator interactiv</span>
            </button>
            <button
              type="button"
              onClick={() => setTopSection('guide')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                topSection === 'guide'
                  ? 'bg-[#0d4a3e] text-white'
                  : 'text-[#53665f] hover:text-[#13221d]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ghid și formule</span>
            </button>
            <button
              type="button"
              onClick={() => setTopSection('dictionary')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                topSection === 'dictionary'
                  ? 'bg-[#0d4a3e] text-white'
                  : 'text-[#53665f] hover:text-[#13221d]'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>Dicționar</span>
            </button>
          </div>

          <div className="relative flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-semibold text-[#53665f] tabular-nums px-2">
              Misiuni: {prefs.completedMissions.length}/{GUIDED_MISSIONS.length}
            </span>
            <button
              type="button"
              onClick={() => setShowTour(true)}
              className="px-3 py-1.5 rounded-lg border border-[#d8e2dc] bg-white hover:bg-[#edf3f0] text-xs font-medium text-[#0d4a3e] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Tur ghidat</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPrefsPopover((s) => !s)}
              className="px-3 py-1.5 rounded-lg border border-[#d8e2dc] bg-white hover:bg-[#edf3f0] text-xs font-medium text-[#13221d] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Preferințe laborator
            </button>

            {showPrefsPopover && (
              <div className="absolute right-0 top-10 z-30 w-72 rounded-xl border border-[#d8e2dc] bg-white p-4 shadow-lg space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#13221d]">Preferințe laborator</span>
                  <button
                    type="button"
                    onClick={() => setShowPrefsPopover(false)}
                    className="text-xs text-[#53665f] hover:text-[#13221d] cursor-pointer"
                  >
                    Închide
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#53665f]">Volum general</span>
                    <span className="font-mono font-semibold tabular-nums">{Math.round(prefs.volume * 100)}%</span>
                  </div>
                  <LabStepper
  min={0}
  max={1}
  step={0.05}
  value={prefs.volume}
  label="Volum general"
  onValueChange={(value) => setPrefs((p) => ({ ...p, volume: Number(value) }))}
/>
                </div>

                <div className="space-y-1">
                  <span className="block text-xs text-[#53665f]">Notație muzicală</span>
                  <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#edf3f0]">
                    {(['anglo', 'solfege'] as NotationSystem[]).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPrefs((p) => ({ ...p, notation: n }))}
                        className={`py-1 rounded text-xs font-medium cursor-pointer ${
                          prefs.notation === n ? 'bg-[#0d4a3e] text-white' : 'text-[#53665f]'
                        }`}
                      >
                        {n === 'anglo' ? 'C – D – E' : 'Do – Re – Mi'}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetLab}
                  className="w-full py-2 px-3 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] text-xs font-medium text-[#13221d] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Resetează setările laboratorului</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mission completed notification */}
        {missionBanner && (
          <div className="rounded-xl border border-[#0d4a3e]/30 bg-[#edf3f0] px-4 py-2.5 flex items-center gap-2.5 text-xs font-semibold text-[#0d4a3e]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{missionBanner}</span>
          </div>
        )}

        {topSection === 'lab' ? (
          <>
            {/* 8-Module Navigation Strip */}
            <div
              data-tour-id="module-strip"
              className="guitar-module-tabs rounded-xl border border-[#d8e2dc] bg-white p-1.5"
              role="tablist"
              aria-label="Modulele lecției"
            >
              <div className="guitar-module-tab-grid">
                {MODULES.map((m) => {
                  const active = prefs.activeModule === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="tab"
                      id={`module-tab-${m.id}`}
                      aria-selected={active}
                      aria-controls="module-panel"
                      tabIndex={active ? 0 : -1}
                      data-tour-id={`module-tab-${m.id}`}
                      onClick={() => setActiveModule(m.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-[#0d4a3e] text-white'
                          : 'text-[#53665f] hover:bg-[#edf3f0] hover:text-[#13221d]'
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Module Workspace */}
            <div id="module-panel" role="tabpanel" aria-labelledby={`module-tab-${prefs.activeModule}`} tabIndex={0}>
              <div className="guitar-quick-actions" role="group" aria-label="Redare rapidă">
                <span className="guitar-quick-actions-title">Redare rapidă</span>
                {(QUICK_AUDIO_ACTIONS[prefs.activeModule] ?? []).map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    aria-label={action.label}
                    title={action.label}
                    onClick={() => document.querySelector<HTMLButtonElement>(`#module-panel [data-guitar-quick-action="${action.id}"]`)?.click()}
                    className="guitar-quick-action"
                  >
                    <Play className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{action.shortLabel ?? action.label}</span>
                  </button>
                ))}
              </div>
              {prefs.activeModule === 'notes' && (
                <Module1Notes
                  notation={prefs.notation}
                  onChangeNotation={(n) => setPrefs((p) => ({ ...p, notation: n }))}
                  strings={strings}
                />
              )}
              {prefs.activeModule === 'string' && (
                <Module2String
                  strings={strings}
                  notation={prefs.notation}
                  onCompleteMission={handleCompleteMission}
                />
              )}
              {prefs.activeModule === 'harmonics' && (
                <Module3Harmonics
                  notation={prefs.notation}
                  onCompleteMission={handleCompleteMission}
                />
              )}
              {prefs.activeModule === 'temperament' && (
                <Module4Temperament onCompleteMission={handleCompleteMission} />
              )}
              {prefs.activeModule === 'scales' && (
                <Module5Scales strings={strings} notation={prefs.notation} />
              )}
              {prefs.activeModule === 'chords' && (
                <Module6Chords
                  strings={strings}
                  notation={prefs.notation}
                  onCompleteMission={handleCompleteMission}
                />
              )}
              {prefs.activeModule === 'spectrum' && (
                <Module7Spectrum strings={strings} notation={prefs.notation} />
              )}
              {prefs.activeModule === 'sandbox' && (
                <Module8Sandbox
                  strings={strings}
                  tuning={prefs.tuning}
                  onChangeTuning={(t: TuningId) => setPrefs((p) => ({ ...p, tuning: t }))}
                  notation={prefs.notation}
                  completedMissions={prefs.completedMissions}
                  onCompleteMission={handleCompleteMission}
                  onNavigateModule={setActiveModule}
                />
              )}
            </div>
          </>
        ) : topSection === 'guide' ? (
          <GuideView onOpenModule={setActiveModule} />
        ) : (
          <DictionaryView onOpenModule={setActiveModule} />
        )}
      </div>

      <OnboardingTour
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        onSelectModule={setActiveModule}
        onSelectSection={setTopSection}
      />
    </div>
  );
}
