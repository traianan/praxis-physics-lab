import { GlossaryTerm, Mission, PracticalPreset, QuizQuestion } from '../types/physics';

export const MISSIONS: Mission[] = [
  {
    id: 'm1',
    title: '1. Generatorul real în sarcină',
    description: 'În Modulul 1 (Concepte de bază), închide circuitul și reglează parametrii astfel încât tensiunea la borne U să fie exact jumătate din E (regim de transfer maxim de putere, R = r).',
    targetModule: 'basic',
    hint: 'Adu rezistența de sarcină R egală cu rezistența internă r (de ex. R = 20 Ω, r = 20 Ω) și închide întrerupătorul K.',
    checkCompleted: (state, metrics) =>
      state.topology === 'basic' &&
      state.switchClosed &&
      metrics.equivalentEmfAbs > 0 &&
      Math.abs(metrics.terminalVoltage - metrics.equivalentEmfAbs / 2) <= 0.25,
  },
  {
    id: 'm2',
    title: '2. Baterie în serie pentru 18 V',
    description: 'În Gruparea în serie, conectează cel puțin 3 generatoare în concordanță astfel încât tensiunea electromotoare echivalentă E_e să fie cel puțin 18 V.',
    targetModule: 'series',
    hint: 'Adaugă 3 generatoare de 6 V (sau 2 de 9 V + 1 de 1.5 V) cu aceeași polaritate.',
    checkCompleted: (state, metrics) =>
      state.topology === 'series' &&
      state.generators.length >= 3 &&
      !metrics.hasOpposition &&
      metrics.equivalentEmfAbs >= 18,
  },
  {
    id: 'm3',
    title: '3. Efectul legării în opoziție',
    description: 'În Gruparea în serie, inversează polaritatea unui generator pentru a observa scăderea tensiunii echivalente E_e, menținând circuitul închis.',
    targetModule: 'series',
    hint: 'Apasă butonul „Inversează polaritatea” (+/−) pe una dintre sursele din serie.',
    checkCompleted: (state, metrics) =>
      state.topology === 'series' &&
      state.switchClosed &&
      state.generators.length >= 2 &&
      metrics.hasOpposition,
  },
  {
    id: 'm4',
    title: '4. Reducerea rezistenței interne în paralel',
    description: 'În Gruparea în paralel, obține o rezistență internă echivalentă r_e ≤ 1 Ω folosind cel puțin 3 generatoare cu r ≥ 2 Ω fiecare.',
    targetModule: 'parallel',
    hint: 'Cu 3 generatoare de r = 3 Ω în paralel, r_e = 3 / 3 = 1 Ω!',
    checkCompleted: (state, metrics) =>
      state.topology === 'parallel' &&
      state.generators.length >= 3 &&
      state.generators.every((g) => g.internalResistance >= 2) &&
      metrics.equivalentInternalR <= 1.05,
  },
  {
    id: 'm5',
    title: '5. Baterie mixtă 2S2P adaptată',
    description: 'În Gruparea mixtă, configurează o matrice de 2 generatoare în serie pe 2 ramuri în paralel (2×2) și obține un curent prin sarcină I ≥ 0.5 A.',
    targetModule: 'mixed',
    hint: 'Setează n = 2 în serie, m = 2 ramuri în paralel, închide K și micșorează R dacă I este sub 0.5 A.',
    checkCompleted: (state, metrics) =>
      state.topology === 'mixed' &&
      state.switchClosed &&
      state.mixedSeriesCount === 2 &&
      state.mixedParallelCount === 2 &&
      metrics.loadCurrentAbs >= 0.5,
  },
  {
    id: 'm6',
    title: '6. Jurnal de laborator și export',
    description: 'Salvează cel puțin 2 măsurători în jurnalul experimentului folosind butonul „Înregistrează măsurătoare”.',
    targetModule: 'basic',
    hint: 'Modifică R sau gruparea și apasă „+ Înregistrează” de 2 ori, apoi poți exporta CSV sau JSON.',
    checkCompleted: (_state, _metrics, snapshotsCount) => snapshotsCount >= 2,
  },
];

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 't1',
    term: 'Tensiune electromotoare (t.e.m.)',
    symbol: 'E',
    unit: 'Volt (V)',
    definition:
      'Lucrul mecanic efectuat de forțele neelectrostatice din interiorul generatorului pentru a transporta unitatea de sarcină pozitivă de la borna minus la borna plus (sau tensiunea la borne în gol, când I = 0).',
    formula: 'E = L_ext / q = U + I · r',
    relatedModule: 'basic',
    relatedLabel: 'Vezi în Concepte de bază',
  },
  {
    id: 't2',
    term: 'Rezistență internă',
    symbol: 'r',
    unit: 'Ohm (Ω)',
    definition:
      'Rezistența electrică proprie a materialelor și electrolitului din interiorul generatorului. Nu este o componentă separată externă, ci o proprietate intrinsecă a sursei, responsabilă de încălzirea ei și de scăderea tensiunii U la borne în sarcină.',
    formula: 'U = E − I · r',
    relatedModule: 'basic',
    relatedLabel: 'Explorează căderea internă',
  },
  {
    id: 't3',
    term: 'Tensiune la borne',
    symbol: 'U',
    unit: 'Volt (V)',
    definition:
      'Diferența de potențial măsurată de voltmetru între bornele (+) și (−) ale sursei sau grupării de surse. În circuit deschis U = E_e, iar în sarcină U = I · R = E_e − I · r_e.',
    formula: 'U = I · R = E_e · R / (R + r_e)',
    relatedModule: 'basic',
    relatedLabel: 'Măsoară cu voltmetrul',
  },
  {
    id: 't4',
    term: 'Grupare în serie (concordanță)',
    symbol: 'E_e, r_e',
    unit: 'V, Ω',
    definition:
      'Conectarea bornei (−) a unui generator la borna (+) a următorului. Tensiunile electromotoare și rezistențele interne se adună. Ideală când consumatorul necesită o tensiune mai mare decât a unei singure celule.',
    formula: 'E_e = Σ E_i = n·E  |  r_e = Σ r_i = n·r',
    relatedModule: 'series',
    relatedLabel: 'Deschide Gruparea în serie',
  },
  {
    id: 't5',
    term: 'Legare în opoziție',
    symbol: 'E_e',
    unit: 'Volt (V)',
    definition:
      'Conectarea în serie a două surse cu bornele de același semn împreună (+ cu + sau − cu −). T.e.m. rezultantă este diferența lor, însă rezistențele interne tot se adună!',
    formula: 'E_e = |E_1 − E_2|  |  r_e = r_1 + r_2',
    relatedModule: 'series',
    relatedLabel: 'Testează opoziția în serie',
  },
  {
    id: 't6',
    term: 'Grupare în paralel',
    symbol: 'E_e, r_e',
    unit: 'V, Ω',
    definition:
      'Conectarea tuturor bornelor (+) la un nod comun și a tuturor bornelor (−) la celălalt nod. Pentru surse identice, t.e.m. rămâne egală cu a unei surse, dar rezistența internă scade de m ori, permițând curenți mari.',
    formula: 'E_e = E  |  r_e = r / m  (surse identice)',
    relatedModule: 'parallel',
    relatedLabel: 'Deschide Gruparea în paralel',
  },
  {
    id: 't7',
    term: 'Teorema lui Millman',
    symbol: 'E_e',
    unit: 'Volt (V)',
    definition:
      'Metoda generală pentru calculul t.e.m. echivalente a surselor diferite legate în paralel. Conductanțele interne se adună, iar fiecare sursă contribuie proporțional cu raportul E_i / r_i.',
    formula: 'E_e = (Σ E_i / r_i) / (Σ 1 / r_i)  |  1/r_e = Σ 1/r_i',
    relatedModule: 'parallel',
    relatedLabel: 'Testează surse diferite în paralel',
  },
  {
    id: 't8',
    term: 'Grupare mixtă (n × m)',
    symbol: 'E_e, r_e',
    unit: 'V, Ω',
    definition:
      'Combinarea a m ramuri identice legate în paralel, fiecare ramură având n generatoare în serie. Permite simultan creșterea tensiunii (prin n) și reducerea rezistenței interne (prin m).',
    formula: 'E_e = n · E  |  r_e = (n · r) / m',
    relatedModule: 'mixed',
    relatedLabel: 'Deschide Gruparea mixtă',
  },
  {
    id: 't9',
    term: 'Curent de scurtcircuit',
    symbol: 'I_sc',
    unit: 'Amper (A)',
    definition:
      'Curentul maxim teoretic obținut când bornele sursei sunt unite printr-un conductor cu rezistență neglijabilă (R → 0). Limitat exclusiv de rezistența internă r_e.',
    formula: 'I_sc = E_e / r_e',
    relatedModule: 'basic',
    relatedLabel: 'Vezi punctul I_sc pe grafic',
  },
  {
    id: 't10',
    term: 'Transfer maxim de putere',
    symbol: 'P_max',
    unit: 'Watt (W)',
    definition:
      'Un generator sau o grupare cedează puterea maximă pe rezistorul extern R atunci când rezistența de sarcină egalează rezistența internă echivalentă (R = r_e). În acest punct, randamentul este 50%.',
    formula: 'P_max = E_e² / (4 · r_e)  pentru R = r_e',
    relatedModule: 'examples',
    relatedLabel: 'Vezi exemplul de adaptare',
  },
];

export const PRACTICAL_PRESETS: PracticalPreset[] = [
  {
    id: 'ex-flashlight',
    title: 'Lanternă LED cu 3 baterii alcaline AA în serie',
    category: 'Electronică portabilă · Serie',
    summary:
      'Trei celule AA de 1.5 V (r = 0.4 Ω fiecare) sunt legate în serie pentru a atinge 4.5 V și a alimenta un modul LED echivalent cu R = 18 Ω.',
    physicsInsight:
      'În serie obținem E_e = 3 × 1.5 V = 4.5 V și r_e = 3 × 0.4 Ω = 1.2 Ω. Tensiunea la borne este 4.22 V, suficientă pentru LED-ul alb.',
    topology: 'series',
    targetModule: 'series',
    generators: [
      { id: 's1', label: 'AA₁', emf: 1.5, internalResistance: 0.4, reversed: false },
      { id: 's2', label: 'AA₂', emf: 1.5, internalResistance: 0.4, reversed: false },
      { id: 's3', label: 'AA₃', emf: 1.5, internalResistance: 0.4, reversed: false },
    ],
    loadResistance: 18,
    switchClosed: true,
  },
  {
    id: 'ex-reversed-cell',
    title: 'Baterie introdusă invers în telecomandă (opoziție)',
    category: 'Diagnostic erori · Serie în opoziție',
    summary:
      'Din 4 baterii de 1.5 V (r = 0.5 Ω), una este montată invers din greșeală! Circuitul are E_e mult redus și rezistența internă rămâne suma tuturor celor 4 celule.',
    physicsInsight:
      'Două celule se anulează reciproc: E_e = 1.5 + 1.5 + 1.5 − 1.5 = 3.0 V în loc de 6.0 V! Între timp, r_e = 4 × 0.5 = 2.0 Ω, iar celula inversată se încălzește inutil.',
    topology: 'series',
    targetModule: 'series',
    generators: [
      { id: 's1', label: 'G1', emf: 1.5, internalResistance: 0.5, reversed: false },
      { id: 's2', label: 'G2', emf: 1.5, internalResistance: 0.5, reversed: false },
      { id: 's3', label: 'G3', emf: 1.5, internalResistance: 0.5, reversed: true },
      { id: 's4', label: 'G4', emf: 1.5, internalResistance: 0.5, reversed: false },
    ],
    loadResistance: 10,
    switchClosed: true,
  },
  {
    id: 'ex-car-jumpstart',
    title: 'Pornire auto cu două baterii de 12 V în paralel',
    category: 'Automotive · Paralel cu surse diferite',
    summary:
      'O baterie auto descărcată (11.2 V, r = 0.8 Ω) este conectată prin cabluri de pornire în paralel cu o baterie sănătoasă (12.8 V, r = 0.2 Ω) pe demaror (R = 1.2 Ω).',
    physicsInsight:
      'Conform Teoremei lui Millman, bateria sănătoasă susține majoritatea curentului spre demaror și simultan trimite un curent de încărcare în bateria descărcată!',
    topology: 'parallel',
    targetModule: 'parallel',
    generators: [
      { id: 'p1', label: 'Baterie nouă', emf: 12.8, internalResistance: 0.2, reversed: false },
      { id: 'p2', label: 'Baterie slabă', emf: 11.2, internalResistance: 0.8, reversed: false },
    ],
    loadResistance: 1.2,
    switchClosed: true,
  },
  {
    id: 'ex-powerbank',
    title: 'Pachet Li-Ion 2S3P pentru trotinetă / powerbank',
    category: 'Stocare energie · Grupare mixtă',
    summary:
      '6 celule Li-Ion de 3.7 V (r = 0.3 Ω) sunt organizate în 3 ramuri paralele cu câte 2 celule în serie pe fiecare ramură (2S3P), alimentând o sarcină de 5 Ω.',
    physicsInsight:
      'Dublăm tensiunea (E_e = 7.4 V) și reducem rezistența internă la r_e = (2 × 0.3)/3 = 0.2 Ω, obținând randament de peste 96% pe sarcină!',
    topology: 'mixed',
    targetModule: 'mixed',
    mixedSeriesCount: 2,
    mixedParallelCount: 3,
    loadResistance: 5,
    switchClosed: true,
  },
  {
    id: 'ex-max-power',
    title: 'Adaptarea sarcinii pentru putere maximă (R = r_e)',
    category: 'Telecomunicații & Audio · Transfer maxim',
    summary:
      'Două generatoare de 12 V (r = 4 Ω fiecare) legate în serie formează E_e = 24 V și r_e = 8 Ω. Când sarcina este R = 8 Ω, puterea transferată atinge maximul posibil.',
    physicsInsight:
      'Pentru R = r_e = 8 Ω, tensiunea la borne este U = 12 V (exact E_e / 2), iar puterea utilă pe sarcină atinge P_max = 24² / (4 × 8) = 18 W.',
    topology: 'series',
    targetModule: 'series',
    generators: [
      { id: 'm1', label: 'G1', emf: 12, internalResistance: 4, reversed: false },
      { id: 'm2', label: 'G2', emf: 12, internalResistance: 4, reversed: false },
    ],
    loadResistance: 8,
    switchClosed: true,
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    topic: 'Concepte de bază',
    question:
      'Ce reprezintă tensiunea măsurată de un voltmetru ideal conectat la bornele unui generator real când întrerupătorul K al circuitului exterior este DESCHIS?',
    options: [
      'Căderea de tensiune internă I · r',
      'Tensiunea electromotoare E a generatorului',
      'Zero volți, deoarece nu trece curent prin circuit',
      'Jumătate din tensiunea electromotoare E / 2',
    ],
    correctIndex: 1,
    explanation:
      'Când întrerupătorul K este deschis, curentul I = 0. Din relația U = E − I · r rezultă imediat U = E.',
    relatedModule: 'basic',
  },
  {
    id: 'q2',
    topic: 'Concepte de bază',
    question:
      'Un generator cu E = 12 V și rezistență internă r = 2 Ω alimentează un rezistor R = 10 Ω. Care este tensiunea la borne U?',
    options: ['12 V', '10 V', '8 V', '2 V'],
    correctIndex: 1,
    explanation:
      'Curentul din circuit este I = E / (R + r) = 12 / (10 + 2) = 1 A. Tensiunea la borne este U = I · R = 1 · 10 = 10 V.',
    relatedModule: 'basic',
  },
  {
    id: 'q3',
    topic: 'Gruparea în serie',
    question:
      'Se leagă în serie (în concordanță) 4 baterii identice, fiecare cu E = 1,5 V și r = 0,5 Ω. Care sunt parametrii sursei echivalente?',
    options: [
      'E_e = 1,5 V și r_e = 2,0 Ω',
      'E_e = 6,0 V și r_e = 0,125 Ω',
      'E_e = 6,0 V și r_e = 2,0 Ω',
      'E_e = 4,5 V și r_e = 0,5 Ω',
    ],
    correctIndex: 2,
    explanation:
      'La gruparea în serie, atât t.e.m., cât și rezistențele interne se adună: E_e = 4 × 1,5 = 6,0 V și r_e = 4 × 0,5 = 2,0 Ω.',
    relatedModule: 'series',
  },
  {
    id: 'q4',
    topic: 'Legarea în opoziție',
    question:
      'Două generatoare cu E₁ = 9 V, r₁ = 1 Ω și E₂ = 3 V, r₂ = 2 Ω sunt legate în serie în opoziție (+ cu +). Ce valori au E_e și r_e?',
    options: [
      'E_e = 6 V și r_e = 3 Ω',
      'E_e = 6 V și r_e = 1 Ω',
      'E_e = 12 V și r_e = 3 Ω',
      'E_e = 3 V și r_e = 0,67 Ω',
    ],
    correctIndex: 0,
    explanation:
      'În opoziție, tensiunile electromotoare se scad: E_e = |9 − 3| = 6 V, dar rezistențele interne se adună întotdeauna: r_e = 1 + 2 = 3 Ω.',
    relatedModule: 'series',
  },
  {
    id: 'q5',
    topic: 'Gruparea în paralel',
    question:
      'De ce se leagă în paralel mai multe generatoare identice (E, r)?',
    options: [
      'Pentru a multiplica tensiunea electromotoare de m ori',
      'Pentru a reduce rezistența internă echivalentă (r_e = r / m) și a obține curenți mai mari',
      'Pentru a mări rezistența internă totală a circuitului',
      'Pentru a elimina complet pierderile pe rezistorul de sarcină R',
    ],
    correctIndex: 1,
    explanation:
      'Gruparea în paralel a m surse identice păstrează E_e = E, dar micșorează rezistența internă de m ori (r_e = r/m), permițând un curent de sarcină și de scurtcircuit mai mare.',
    relatedModule: 'parallel',
  },
  {
    id: 'q6',
    topic: 'Gruparea în paralel',
    question:
      'Trei generatoare identice cu E = 12 V și r = 3 Ω sunt legate în paralel și alimentează o sarcină R = 5 Ω. Ce curent trece prin rezistorul R?',
    options: ['1,0 A', '1,5 A', '2,0 A', '4,0 A'],
    correctIndex: 2,
    explanation:
      'Avem E_e = 12 V și r_e = r / 3 = 3 / 3 = 1 Ω. Curentul prin sarcină este I = E_e / (R + r_e) = 12 / (5 + 1) = 2,0 A.',
    relatedModule: 'parallel',
  },
  {
    id: 'q7',
    topic: 'Surse diferite în paralel',
    question:
      'Ce se întâmplă dacă legăm în paralel două surse cu tensiuni electromotoare diferite (E₁ ≠ E₂) și lăsăm întrerupătorul extern K DESCHIS?',
    options: [
      'Nu circulă niciun curent prin niciuna dintre surse',
      'Circulă un curent intern de echilibrare de la sursa cu E mai mare spre cea cu E mai mic',
      'Voltmetrul de la borne indică suma E₁ + E₂',
      'Rezistența internă echivalentă devine infinită',
    ],
    correctIndex: 1,
    explanation:
      'Deoarece E₁ ≠ E₂, bucla închisă formată de cele două surse are o diferență de t.e.m. nenulă, generând un curent de circulație I_circ = (E₁ − E₂) / (r₁ + r₂).',
    relatedModule: 'parallel',
  },
  {
    id: 'q8',
    topic: 'Gruparea mixtă',
    question:
      'O baterie mixtă are m = 2 ramuri în paralel, fiecare ramură conținând n = 3 celule identice (E = 2 V, r = 1 Ω) în serie. Care sunt E_e și r_e?',
    options: [
      'E_e = 6 V și r_e = 1,5 Ω',
      'E_e = 4 V și r_e = 1,5 Ω',
      'E_e = 6 V și r_e = 6,0 Ω',
      'E_e = 12 V și r_e = 0,67 Ω',
    ],
    correctIndex: 0,
    explanation:
      'Pentru gruparea mixtă: E_e = n · E = 3 × 2 = 6 V și r_e = (n · r) / m = (3 × 1) / 2 = 1,5 Ω.',
    relatedModule: 'mixed',
  },
  {
    id: 'q9',
    topic: 'Putere maximă și randament',
    question:
      'Pentru ce valoare a rezistenței de sarcină R cedează o grupare de generatoare (E_e, r_e) puterea maximă în circuitul exterior?',
    options: [
      'R = 0 Ω (scurtcircuit)',
      'R = r_e / 2',
      'R = r_e (adaptarea sarcinii)',
      'R → ∞ (mers în gol)',
    ],
    correctIndex: 2,
    explanation:
      'Funcția P(R) = E_e² · R / (R + r_e)² are maximul absolut la R = r_e, unde P_max = E_e² / (4 · r_e) și randamentul este 50%.',
    relatedModule: 'examples',
  },
  {
    id: 'q10',
    topic: 'Scurtcircuit',
    question:
      'Cum se modifică curentul de scurtcircuit I_sc al unei grupări de 2 generatoare identice (E, r) dacă trecem de la legarea în serie la legarea în paralel?',
    options: [
      'Rămâne neschimbat',
      'Crește de 2 ori',
      'Scade de 2 ori',
      'Crește de 4 ori',
    ],
    correctIndex: 0,
    explanation:
      'În serie: I_sc,serie = (2E)/(2r) = E/r. În paralel: I_sc,paralel = E / (r/2) = 2E/r! Atenție: raportul crește de 2 ori (de la E/r la 2E/r) — deci răspunsul corect este „Crește de 2 ori”!',
    relatedModule: 'calculator',
  },
];

// Fix q10 correctIndex to match explanation ("Crește de 2 ori" is index 1)
QUIZ_QUESTIONS[9].correctIndex = 1;

export const FORMULA_SECTIONS = [
  {
    title: '1. Generatorul electric real',
    items: [
      { label: 'Legea lui Ohm pentru întregul circuit', eq: 'I = E / (R + r)' },
      { label: 'Tensiunea la bornele generatorului', eq: 'U = I · R = E − I · r' },
      { label: 'Curentul de scurtcircuit (R = 0)', eq: 'I_sc = E / r' },
      { label: 'Randamentul circuitului', eq: 'η = U / E = R / (R + r)' },
    ],
  },
  {
    title: '2. Gruparea în serie (n surse)',
    items: [
      { label: 'T.e.m. echivalentă (caz general cu semne)', eq: 'E_e = Σ (± E_i)' },
      { label: 'T.e.m. echivalentă (n surse identice)', eq: 'E_e = n · E' },
      { label: 'Rezistența internă echivalentă', eq: 'r_e = Σ r_i = n · r' },
      { label: 'Curentul în circuit', eq: 'I = E_e / (R + r_e)' },
    ],
  },
  {
    title: '3. Gruparea în paralel (m surse)',
    items: [
      { label: 'Surse identice (t.e.m.)', eq: 'E_e = E' },
      { label: 'Surse identice (rezistență internă)', eq: 'r_e = r / m' },
      { label: 'Surse diferite (Teorema lui Millman)', eq: 'E_e = (Σ E_i/r_i) / (Σ 1/r_i)' },
      { label: 'Rezistența internă generală', eq: '1 / r_e = Σ (1 / r_i)' },
    ],
  },
  {
    title: '4. Gruparea mixtă (n în serie × m ramuri)',
    items: [
      { label: 'T.e.m. echivalentă (simetric)', eq: 'E_e = n · E' },
      { label: 'Rezistența internă echivalentă (simetric)', eq: 'r_e = (n · r) / m' },
      { label: 'Condiția de curent / putere maximă', eq: 'r_e = R  ⇔  n · r = m · R' },
      { label: 'Puterea maximă cedată sarcinii', eq: 'P_max = E_e² / (4 · r_e)' },
    ],
  },
];
