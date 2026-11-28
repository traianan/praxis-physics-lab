export type GroupingTopology = 'basic' | 'series' | 'parallel' | 'mixed';

export type ModuleTabId =
  | 'basic'
  | 'series'
  | 'parallel'
  | 'mixed'
  | 'calculator'
  | 'examples'
  | 'quiz';

export type FlowMode = 'conventional' | 'electrons';

export interface GeneratorUnit {
  id: string;
  label: string;
  emf: number; // Tensiunea electromotoare E (V)
  internalResistance: number; // Rezistenta interna r (Ohm)
  reversed?: boolean; // Legare in opozitie (inversarea polaritatii)
}

export interface MixedBranch {
  id: string;
  generators: GeneratorUnit[];
}

export interface CircuitState {
  topology: GroupingTopology;
  switchClosed: boolean;
  loadResistance: number; // Rezistenta externa R (Ohm)
  flowMode: FlowMode;
  generators: GeneratorUnit[]; // Used in basic, series, parallel
  mixedSeriesCount: number; // n generatoare pe ramura (mixed)
  mixedParallelCount: number; // m ramuri in paralel (mixed)
  mixedBranches: MixedBranch[]; // Permite E si r variabile individual si in mixt
}

export interface BranchResult {
  branchId: string;
  label: string;
  emfBranch: number;
  rBranch: number;
  current: number; // A (pozitiv = debiteaza spre nodul +, negativ = primeste curent / se incarca)
}

export interface CircuitMetrics {
  equivalentEmf: number; // E_e (V) - poate fi negativ daca polaritatea rezultanta e inversata
  equivalentEmfAbs: number; // |E_e| (V)
  equivalentInternalR: number; // r_e (Ohm)
  loadCurrent: number; // I prin R (A, cu semn in raport cu sensul standard)
  loadCurrentAbs: number; // |I| (A)
  terminalVoltage: number; // U la borne (V)
  loadPower: number; // P_R = I^2 * R (W)
  internalPower: number; // P_r total disipat in surse (W)
  totalPower: number; // P_total = P_R + P_r (W)
  efficiency: number; // randamentul eta (%) = P_R / P_total * 100
  shortCircuitCurrent: number; // I_sc = |E_e| / r_e (A)
  maxTransferPower: number; // P_max = E_e^2 / (4 * r_e) (W)
  hasOpposition: boolean;
  hasCirculatingCurrent: boolean;
  branchResults: BranchResult[];
  warnings: Array<{
    level: 'warning' | 'danger' | 'info';
    title: string;
    message: string;
  }>;
}

export interface ExperimentSnapshot {
  id: string;
  timestamp: string;
  topology: GroupingTopology;
  switchClosed: boolean;
  generatorSummary: string;
  loadResistance: number;
  equivalentEmf: number;
  equivalentInternalR: number;
  terminalVoltage: number;
  loadCurrent: number;
  loadPower: number;
  internalPower: number;
  efficiency: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  targetModule: ModuleTabId;
  hint: string;
  checkCompleted: (state: CircuitState, metrics: CircuitMetrics, snapshotsCount: number) => boolean;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  symbol: string;
  unit: string;
  definition: string;
  formula?: string;
  relatedModule: ModuleTabId;
  relatedLabel: string;
}

export interface PracticalPreset {
  id: string;
  title: string;
  category: string;
  summary: string;
  physicsInsight: string;
  topology: GroupingTopology;
  targetModule: ModuleTabId;
  generators?: GeneratorUnit[];
  mixedSeriesCount?: number;
  mixedParallelCount?: number;
  loadResistance: number;
  switchClosed: boolean;
}

export interface QuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  relatedModule: ModuleTabId;
}
