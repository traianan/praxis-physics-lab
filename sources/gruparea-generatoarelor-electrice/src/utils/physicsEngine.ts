import {
  BranchResult,
  CircuitMetrics,
  CircuitState,
  GeneratorUnit,
  GroupingTopology,
  MixedBranch,
} from '../types/physics';

/**
 * Rezolva exact circuitul de curent continuu pentru orice grupare:
 * - basic: 1 generator real (E, r)
 * - series: n generatoare cu E_i, r_i si polaritate (concordanta / opozitie)
 * - parallel: m generatoare cu E_i, r_i prin Teorema lui Millman (inclusiv curenti de circulatie)
 * - mixed: m ramuri in paralel, fiecare cu n generatoare in serie (E_ij, r_ij individuale)
 */
export function solveCircuit(state: CircuitState): CircuitMetrics {
  const { topology, switchClosed, loadResistance } = state;
  const R = Math.max(0.1, loadResistance);

  let equivalentEmf = 0;
  let equivalentInternalR = 0.1;
  let hasOpposition = false;
  let hasCirculatingCurrent = false;
  const branchResults: BranchResult[] = [];

  if (topology === 'basic') {
    const gen = state.generators[0] ?? {
      id: 'g1',
      label: 'G1',
      emf: 12,
      internalResistance: 2,
      reversed: false,
    };
    const signedE = gen.reversed ? -gen.emf : gen.emf;
    equivalentEmf = signedE;
    equivalentInternalR = Math.max(0.05, gen.internalResistance);
    hasOpposition = Boolean(gen.reversed);
  } else if (topology === 'series') {
    const gens = state.generators.length > 0 ? state.generators : [];
    let sumE = 0;
    let sumR = 0;
    let positiveCount = 0;
    let negativeCount = 0;

    for (const g of gens) {
      const signed = g.reversed ? -g.emf : g.emf;
      if (g.reversed) negativeCount++;
      else positiveCount++;
      sumE += signed;
      sumR += Math.max(0.05, g.internalResistance);
    }

    equivalentEmf = sumE;
    equivalentInternalR = Math.max(0.05, sumR);
    hasOpposition = positiveCount > 0 && negativeCount > 0;
  } else if (topology === 'parallel') {
    const gens = state.generators.length > 0 ? state.generators : [];
    let sumConductance = 0;
    let sumEOverR = 0;

    for (const g of gens) {
      const r = Math.max(0.05, g.internalResistance);
      const signedE = g.reversed ? -g.emf : g.emf;
      sumConductance += 1 / r;
      sumEOverR += signedE / r;
    }

    equivalentInternalR = sumConductance > 0 ? 1 / sumConductance : 0.1;
    equivalentEmf = sumConductance > 0 ? sumEOverR / sumConductance : 0;

    // Detect if EMFs differ across parallel branches
    const firstE = gens[0] ? (gens[0].reversed ? -gens[0].emf : gens[0].emf) : 0;
    hasOpposition = gens.some((g) => Boolean(g.reversed));
    hasCirculatingCurrent = gens.some((g) => {
      const e = g.reversed ? -g.emf : g.emf;
      return Math.abs(e - firstE) > 0.05;
    });
  } else if (topology === 'mixed') {
    const branches = state.mixedBranches;
    let sumConductance = 0;
    let sumEOverR = 0;
    const branchEmfs: number[] = [];

    branches.forEach((branch) => {
      let bE = 0;
      let bR = 0;
      for (const g of branch.generators) {
        const signed = g.reversed ? -g.emf : g.emf;
        bE += signed;
        bR += Math.max(0.05, g.internalResistance);
        if (g.reversed) hasOpposition = true;
      }
      bR = Math.max(0.05, bR);
      sumConductance += 1 / bR;
      sumEOverR += bE / bR;
      branchEmfs.push(bE);
    });

    equivalentInternalR = sumConductance > 0 ? 1 / sumConductance : 0.1;
    equivalentEmf = sumConductance > 0 ? sumEOverR / sumConductance : 0;

    if (branchEmfs.length > 1) {
      hasCirculatingCurrent = branchEmfs.some((e) => Math.abs(e - branchEmfs[0]) > 0.05);
    }
  }

  const equivalentEmfAbs = Math.abs(equivalentEmf);
  const loadCurrent = switchClosed ? equivalentEmf / (R + equivalentInternalR) : 0;
  const loadCurrentAbs = Math.abs(loadCurrent);
  const terminalVoltageSigned = switchClosed ? loadCurrent * R : equivalentEmf;
  const terminalVoltage = Math.abs(terminalVoltageSigned);

  // Branch currents & accurate internal power loss
  let internalPower = 0;
  if (topology === 'basic' || topology === 'series') {
    const gens = state.generators;
    internalPower = gens.reduce(
      (acc, g) => acc + loadCurrent * loadCurrent * Math.max(0.05, g.internalResistance),
      0
    );
    branchResults.push({
      branchId: 'main',
      label: 'Circuit principal',
      emfBranch: equivalentEmf,
      rBranch: equivalentInternalR,
      current: loadCurrent,
    });
  } else if (topology === 'parallel') {
    state.generators.forEach((g, idx) => {
      const r = Math.max(0.05, g.internalResistance);
      const signedE = g.reversed ? -g.emf : g.emf;
      // Current supplied by branch i: I_i = (E_i - U_node) / r_i
      const iBranch = (signedE - terminalVoltageSigned) / r;
      internalPower += iBranch * iBranch * r;
      branchResults.push({
        branchId: g.id,
        label: `Ramura ${idx + 1} (${g.label})`,
        emfBranch: signedE,
        rBranch: r,
        current: iBranch,
      });
    });
  } else if (topology === 'mixed') {
    state.mixedBranches.forEach((branch, idx) => {
      let bE = 0;
      let bR = 0;
      for (const g of branch.generators) {
        bE += g.reversed ? -g.emf : g.emf;
        bR += Math.max(0.05, g.internalResistance);
      }
      bR = Math.max(0.05, bR);
      const iBranch = (bE - terminalVoltageSigned) / bR;
      internalPower += iBranch * iBranch * bR;
      branchResults.push({
        branchId: branch.id,
        label: `Ramura ${idx + 1}`,
        emfBranch: bE,
        rBranch: bR,
        current: iBranch,
      });
    });
  }

  const loadPower = switchClosed ? loadCurrent * loadCurrent * R : 0;
  const totalPower = loadPower + internalPower;
  const efficiency =
    switchClosed && totalPower > 1e-6 ? Math.min(100, Math.max(0, (loadPower / totalPower) * 100)) : 0;
  const shortCircuitCurrent = equivalentInternalR > 0 ? equivalentEmfAbs / equivalentInternalR : 0;
  const maxTransferPower =
    equivalentInternalR > 0 ? (equivalentEmfAbs * equivalentEmfAbs) / (4 * equivalentInternalR) : 0;

  // Warnings
  const warnings: CircuitMetrics['warnings'] = [];

  if (hasOpposition) {
    warnings.push({
      level: 'info',
      title: 'Generatoare legate în opoziție',
      message:
        'Cel puțin o sursă are polaritatea inversată. Tensiunea electromotoare rezultantă scade, iar sursa cu E mai mic poate fi parcursă în sens invers (încărcare / consumator).',
    });
  }

  if (hasCirculatingCurrent) {
    warnings.push({
      level: 'warning',
      title: 'Curent de circulație între ramurile paralele',
      message: switchClosed
        ? 'Sursele din paralel au tensiuni electromotoare diferite! Sursa cu E mai mare debitează curent și prin ramura sursei cu E mai mic.'
        : 'Chiar și cu întrerupătorul K deschis, între sursele cu E diferite circulă un curent intern de echilibrare care disipă căldură!',
    });
  }

  if (switchClosed && R < equivalentInternalR * 0.25) {
    warnings.push({
      level: 'danger',
      title: 'Regim apropiat de scurtcircuit',
      message: `Rezistența externă (${R.toFixed(1)} Ω) este mult mai mică decât r_e (${equivalentInternalR.toFixed(2)} Ω). Majoritatea energiei se pierde intern (η = ${efficiency.toFixed(1)}%).`,
    });
  } else if (switchClosed && loadPower > 15) {
    warnings.push({
      level: 'warning',
      title: 'Putere ridicată pe sarcină',
      message: `Puterea disipată pe rezistorul R este ${loadPower.toFixed(2)} W. Într-un montaj real de laborator, ar necesita un rezistor de putere.`,
    });
  }

  return {
    equivalentEmf,
    equivalentEmfAbs,
    equivalentInternalR,
    loadCurrent,
    loadCurrentAbs,
    terminalVoltage,
    loadPower,
    internalPower,
    totalPower,
    efficiency,
    shortCircuitCurrent,
    maxTransferPower,
    hasOpposition,
    hasCirculatingCurrent,
    branchResults,
    warnings,
  };
}

export function formatCurrent(amps: number): string {
  const abs = Math.abs(amps);
  if (abs === 0) return '0 A';
  if (abs < 1) return `${(amps * 1000).toFixed(0)} mA`;
  return `${amps.toFixed(2)} A`;
}

export function formatPower(watts: number): string {
  const abs = Math.abs(watts);
  if (abs === 0) return '0 W';
  if (abs < 1) return `${(watts * 1000).toFixed(0)} mW`;
  return `${watts.toFixed(2)} W`;
}

export function formatResistance(ohms: number): string {
  if (ohms >= 1000) return `${(ohms / 1000).toFixed(2)} kΩ`;
  if (Number.isInteger(ohms)) return `${ohms} Ω`;
  return `${ohms.toFixed(2)} Ω`;
}

export function buildMixedBranches(
  seriesCount: number,
  parallelCount: number,
  baseE = 4.5,
  baseR = 1.5,
  existing?: MixedBranch[]
): MixedBranch[] {
  const branches: MixedBranch[] = [];
  for (let m = 0; m < parallelCount; m++) {
    const prevBranch = existing?.[m];
    const generators: GeneratorUnit[] = [];
    for (let n = 0; n < seriesCount; n++) {
      const prevGen = prevBranch?.generators?.[n];
      generators.push(
        prevGen ?? {
          id: `m-${m}-n-${n}`,
          label: `G${m + 1}.${n + 1}`,
          emf: baseE,
          internalResistance: baseR,
          reversed: false,
        }
      );
    }
    branches.push({
      id: `branch-${m + 1}`,
      generators,
    });
  }
  return branches;
}

export function describeTopology(topology: GroupingTopology): string {
  switch (topology) {
    case 'basic':
      return 'Generator individual';
    case 'series':
      return 'Grupare în serie';
    case 'parallel':
      return 'Grupare în paralel';
    case 'mixed':
      return 'Grupare mixtă';
  }
}
