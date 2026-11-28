import { CircuitMetrics, CircuitState, ExperimentSnapshot } from '../types/physics';
import { describeTopology } from './physicsEngine';

function triggerDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function buildSnapshot(state: CircuitState, metrics: CircuitMetrics): ExperimentSnapshot {
  let summary = '';
  if (state.topology === 'mixed') {
    summary = `${state.mixedParallelCount} ramuri x ${state.mixedSeriesCount} surse`;
  } else {
    summary = state.generators
      .map((g) => `${g.label}(${g.reversed ? '-' : '+'}${g.emf}V, r=${g.internalResistance}Ω)`)
      .join(' | ');
  }

  return {
    id: `exp-${Date.now()}`,
    timestamp: new Date().toISOString(),
    topology: state.topology,
    switchClosed: state.switchClosed,
    generatorSummary: summary,
    loadResistance: Number(state.loadResistance.toFixed(2)),
    equivalentEmf: Number(metrics.equivalentEmf.toFixed(3)),
    equivalentInternalR: Number(metrics.equivalentInternalR.toFixed(3)),
    terminalVoltage: Number(metrics.terminalVoltage.toFixed(3)),
    loadCurrent: Number(metrics.loadCurrent.toFixed(4)),
    loadPower: Number(metrics.loadPower.toFixed(3)),
    internalPower: Number(metrics.internalPower.toFixed(3)),
    efficiency: Number(metrics.efficiency.toFixed(2)),
  };
}

export function exportSimulationJSON(
  state: CircuitState,
  metrics: CircuitMetrics,
  history: ExperimentSnapshot[]
) {
  const payload = {
    lesson: 'Gruparea generatoarelor electrice',
    exportedAt: new Date().toISOString(),
    currentSimulation: {
      topology: state.topology,
      topologyLabel: describeTopology(state.topology),
      switchClosed: state.switchClosed,
      loadResistanceOhm: state.loadResistance,
      generators:
        state.topology === 'mixed'
          ? state.mixedBranches.map((b, i) => ({
              branch: i + 1,
              generators: b.generators,
            }))
          : state.generators,
      calculatedMetrics: {
        equivalentEmfV: Number(metrics.equivalentEmf.toFixed(4)),
        equivalentInternalResistanceOhm: Number(metrics.equivalentInternalR.toFixed(4)),
        terminalVoltageV: Number(metrics.terminalVoltage.toFixed(4)),
        loadCurrentA: Number(metrics.loadCurrent.toFixed(4)),
        loadPowerW: Number(metrics.loadPower.toFixed(4)),
        internalDissipatedPowerW: Number(metrics.internalPower.toFixed(4)),
        efficiencyPercent: Number(metrics.efficiency.toFixed(2)),
        shortCircuitCurrentA: Number(metrics.shortCircuitCurrent.toFixed(4)),
        maxPowerTransferW: Number(metrics.maxTransferPower.toFixed(4)),
        branchResults: metrics.branchResults,
      },
    },
    recordedMeasurements: history,
  };

  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  triggerDownload(
    `simulare-generatoare-${stamp}.json`,
    JSON.stringify(payload, null, 2),
    'application/json;charset=utf-8'
  );
}

export function exportSimulationCSV(
  state: CircuitState,
  metrics: CircuitMetrics,
  history: ExperimentSnapshot[]
) {
  const rows: ExperimentSnapshot[] =
    history.length > 0 ? history : [buildSnapshot(state, metrics)];

  const headers = [
    'Data_Ora',
    'Tip_Grupare',
    'Intrerupator_K',
    'Configuratie_Surse',
    'Rezistenta_Sarcina_R_Ohm',
    'E_echivalent_V',
    'r_echivalent_Ohm',
    'Tensiune_Borne_U_V',
    'Curent_Sarcina_I_A',
    'Putere_Utila_P_W',
    'Putere_Interna_Pr_W',
    'Randament_eta_procent',
  ];

  const escapeCsv = (val: string | number | boolean) => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      [
        r.timestamp,
        describeTopology(r.topology),
        r.switchClosed ? 'INCHIS' : 'DESCHIS',
        r.generatorSummary,
        r.loadResistance,
        r.equivalentEmf,
        r.equivalentInternalR,
        r.terminalVoltage,
        r.loadCurrent,
        r.loadPower,
        r.internalPower,
        r.efficiency,
      ]
        .map(escapeCsv)
        .join(',')
    ),
  ];

  // UTF-8 BOM for clean Romanian diacritics in Excel
  const bom = '\uFEFF';
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  triggerDownload(
    `date-generatoare-${stamp}.csv`,
    bom + lines.join('\n'),
    'text/csv;charset=utf-8'
  );
}
