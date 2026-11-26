import React, { useMemo, useState } from 'react';
import { ArrowRight, BookMarked, Guitar, Music2, Search, Volume2, X } from 'lucide-react';
import { audioEngine } from '../audio/AudioEngine';
import { LabModuleId } from '../types/guitar';
import { formatScientificIndices } from './ScientificNotation';

type DictionaryViewProps = {
  onOpenModule: (id: LabModuleId) => void;
};

type PartId =
  | 'headstock'
  | 'tuners'
  | 'nut'
  | 'fretboard'
  | 'frets'
  | 'neck'
  | 'strings'
  | 'body'
  | 'soundboard'
  | 'bracing'
  | 'soundhole'
  | 'bridge'
  | 'saddle_pins'
  | 'scale_length';

type GuitarPartEntry = {
  id: PartId;
  index: number;
  name: string;
  englishName: string;
  zone: 'Cap și gât' | 'Corp și rezonanță' | 'Corzi și punte';
  hotspot: { x: number; y: number };
  summary: string;
  physicsRole: string;
  materials: string;
  targetModule: LabModuleId;
};

type TermCategory = 'pitch' | 'structures' | 'physics';

type MusicalTermEntry = {
  id: string;
  term: string;
  pluralOrForms: string;
  category: TermCategory;
  categoryLabel: string;
  formula?: string;
  definition: string;
  guitarContext: string;
  audioLabel?: string;
  playAudio?: () => void;
  visualType:
    | 'note'
    | 'octave'
    | 'semitone'
    | 'tone'
    | 'accidentals'
    | 'cent'
    | 'interval'
    | 'scale'
    | 'tonic'
    | 'chord'
    | 'arpeggio'
    | 'consonance'
    | 'frequency'
    | 'harmonics'
    | 'timbre'
    | 'standing_wave'
    | 'equal_temp'
    | 'just_intonation'
    | 'beats'
    | 'resonance'
    | 'adsr'
    | 'transposition';
  targetModule?: LabModuleId;
};

const GUITAR_PARTS: GuitarPartEntry[] = [
  {
    id: 'headstock',
    index: 1,
    name: 'Capul chitarei (Pala)',
    englishName: 'Headstock',
    zone: 'Cap și gât',
    hotspot: { x: 80, y: 122 },
    summary:
      'Extremitatea superioară a gâtului, ușor înclinată spre spate (de regulă 12°–15°) pentru a crea unghiul de apăsare a corzilor peste prăguș.',
    physicsRole:
      'Unghiul capului împiedică alunecarea corzilor din canalele prăgușului și asigură un contact ferm al capătului vibrant superior.',
    materials: 'Mahon, arțar sau cedru spaniol, adesea placat cu palisandru.',
    targetModule: 'string',
  },
  {
    id: 'tuners',
    index: 2,
    name: 'Cheițele de acordaj (Mecanisme)',
    englishName: 'Tuning Pegs / Machine Heads',
    zone: 'Cap și gât',
    hotspot: { x: 82, y: 74 },
    summary:
      'Mecanisme cu roată melcată (raport tipic 14:1 – 18:1) care înfășoară corzile și permit reglajul milimetric al tensiunii.',
    physicsRole:
      'Rotirea cheiței modifică tensiunea T din formula f₁ = (1/2L)·√(T/μ): strângerea crește frecvența (urcă nota), slăbirea o coboară.',
    materials: 'Oțel, alamă nichelată, butoane din metal, abanos sau sidef sintetic.',
    targetModule: 'sandbox',
  },
  {
    id: 'nut',
    index: 3,
    name: 'Prăgușul superior',
    englishName: 'Nut',
    zone: 'Cap și gât',
    hotspot: { x: 162, y: 122 },
    summary:
      'Piesa crestată aflată între cap și tastieră care fixează înălțimea, spațierea și punctul zero de vibrație al corzilor libere.',
    physicsRole:
      'Reprezintă nodul fix superior (x = 0) pentru toate corzile libere; aici se reflectă undele transversale înapoi spre căluș.',
    materials: 'Os natural, os sintetic (GraphTech TUSQ), alamă sau grafit.',
    targetModule: 'string',
  },
  {
    id: 'fretboard',
    index: 4,
    name: 'Tastiera (Limba)',
    englishName: 'Fretboard / Fingerboard',
    zone: 'Cap și gât',
    hotspot: { x: 266, y: 122 },
    summary:
      'Placa lipită pe fața anterioară a gâtului pe care sunt încastrate tastele metalice și marcajele de poziție (freturile 3, 5, 7, 9, 12).',
    physicsRole:
      'Oferă suprafața rigidă de sprijin pentru degetele mâinii stângi atunci când scurtează lungimea activă L_ef a corzii.',
    materials: 'Palisandru indian, abanos dens sau arțar tratat.',
    targetModule: 'scales',
  },
  {
    id: 'frets',
    index: 5,
    name: 'Tastele (Freturile)',
    englishName: 'Frets',
    zone: 'Cap și gât',
    hotspot: { x: 318, y: 122 },
    summary:
      'Bare metalice înguste poziționate exact conform progresiei geometrice a temperamentului egal (un fret = 1 semiton).',
    physicsRole:
      'Distanța până la căluș respectă legea L_ef = L · 2^(−n/12). Fretul 12 se află exact la jumătatea corzii (L/2), dublând frecvența (octava).',
    materials: 'Aliaj nichel-argint (18% nichel) sau oțel inoxidabil.',
    targetModule: 'notes',
  },
  {
    id: 'neck',
    index: 6,
    name: 'Gâtul și tija de reglaj',
    englishName: 'Neck & Truss Rod',
    zone: 'Cap și gât',
    hotspot: { x: 242, y: 148 },
    summary:
      'Structura longitudinală care susține tensiunea cumulată a celor 6 corzi (~65–85 kgf) și integrează o tijă metalică internă pentru controlul curburii.',
    physicsRole:
      'Rigiditatea gâtului stabilizează distanța corzilor față de taste (acțiunea) și previne falsarea notelor cauzată de variații de tensiune.',
    materials: 'Mahon, cedru sau arțar, cu tijă internă din oțel cu dublă acțiune.',
    targetModule: 'string',
  },
  {
    id: 'strings',
    index: 7,
    name: 'Corzile (1–6)',
    englishName: 'Strings (Plain & Wound)',
    zone: 'Corzi și punte',
    hotspot: { x: 425, y: 112 },
    summary:
      'Cele șase elemente vibrante (E4, B3, G3, D3, A2, E2 în acordajul standard), cu diametre și mase liniare crescătoare de la coarda 1 la 6.',
    physicsRole:
      'Densitatea liniară μ (kg/m) determină viteza undei v = √(T/μ). Corzile grave au un miez înfășurat cu sârmă de bronz/cupru pentru a crește μ fără a pierde flexibilitatea.',
    materials: 'Oțel simplu și bronz fosforos (80/20) pe acustică; nylon și cupru argintat pe clasică.',
    targetModule: 'string',
  },
  {
    id: 'body',
    index: 8,
    name: 'Corpul / Cutia de rezonanță',
    englishName: 'Body / Soundbox',
    zone: 'Corp și rezonanță',
    hotspot: { x: 545, y: 66 },
    summary:
      'Incinta acustică în formă de „8” care transformă energia mecanică redusă a corzilor în unde sonore ample radiate în aer.',
    physicsRole:
      'O coardă izolată mișcă foarte puțin aer; cutia acustică realizează adaptarea de impedanță acustică, amplificând sunetul de zeci de ori.',
    materials: 'Forme Dreadnought, Auditorium, Concert sau Jumbo.',
    targetModule: 'sandbox',
  },
  {
    id: 'soundboard',
    index: 9,
    name: 'Fața armonică (Placa superioară)',
    englishName: 'Soundboard / Top Plate',
    zone: 'Corp și rezonanță',
    hotspot: { x: 590, y: 168 },
    summary:
      'Cea mai importantă membrană vibratorie a chitarei (~2,5–3 mm grosime), aleasă din lemn cu raport ridicat rigiditate/masă.',
    physicsRole:
      'Generează modul principal de membrană T₁ (~185–225 Hz) și dictează timbrul instrumentului: molidul oferă atac clar, cedrul oferă căldură rapidă.',
    materials: 'Molid Sitka/Adirondack, Cedru Roșu Canadian sau Mahon.',
    targetModule: 'sandbox',
  },
  {
    id: 'bracing',
    index: 10,
    name: 'Barajul intern (Structura în X)',
    englishName: 'Internal Bracing (X-Bracing)',
    zone: 'Corp și rezonanță',
    hotspot: { x: 560, y: 150 },
    summary:
      'Rețeaua de șipci subțiri de molid lipite pe interiorul feței armonice pentru a suporta tracțiunea corzilor și a modela modurile de vibrație.',
    physicsRole:
      'Controlează distribuția nodurilor și ventrelor pe placa superioară, echilibrând proiecția frecvențelor joase cu claritatea înaltelor.',
    materials: 'Molid european sau Sitka prelucrat manual (scalloped bracing).',
    targetModule: 'sandbox',
  },
  {
    id: 'soundhole',
    index: 11,
    name: 'Gura de rezonanță și rozeta',
    englishName: 'Soundhole & Rosette',
    zone: 'Corp și rezonanță',
    hotspot: { x: 472, y: 122 },
    summary:
      'Deschiderea circulară din fața armonică (decorată cu rozeta) prin care oscilează masa de aer din interiorul cutiei.',
    physicsRole:
      'Împreună cu volumul intern V al corpului formează un rezonator Helmholtz (modul A₀ ≈ 95–110 Hz), responsabil pentru basul profund al chitarei.',
    materials: 'Decupaj ~95–100 mm diametru, ornat cu incrustații de lemn sau abalone.',
    targetModule: 'sandbox',
  },
  {
    id: 'bridge',
    index: 12,
    name: 'Călușul (Cordarul)',
    englishName: 'Bridge',
    zone: 'Corzi și punte',
    hotspot: { x: 584, y: 122 },
    summary:
      'Piesa masivă lipită pe fața armonică care ancorează capătul inferior al corzilor și transmite vibrația acestora în placa de lemn.',
    physicsRole:
      'Acționează ca un traductor mecano-acustic: forța oscilantă verticală și de torsiune de la șa pune în mișcare fața armonică.',
    materials: 'Palisandru sau abanos dens, lipit direct pe lemnul brut al feței.',
    targetModule: 'harmonics',
  },
  {
    id: 'saddle_pins',
    index: 13,
    name: 'Șaua de căluș și pinii de fixare',
    englishName: 'Saddle & Bridge Pins',
    zone: 'Corzi și punte',
    hotspot: { x: 598, y: 122 },
    summary:
      'Lama albă oblică (șaua) peste care trec corzile și cele 6 conuri (pinii) care blochează capetele cu bilă ale corzilor în corp.',
    physicsRole:
      'Șaua delimitează nodul inferior (x = L). Înclinarea ei ușoară (compensarea) corectează creșterea de tensiune la apăsarea corzilor groase pe taste.',
    materials: 'Os, TUSQ sau micarta pentru șa; abanos, os sau polimer pentru pini.',
    targetModule: 'temperament',
  },
  {
    id: 'scale_length',
    index: 14,
    name: 'Diapazonul (Lungimea vibrantă L)',
    englishName: 'Scale Length',
    zone: 'Corzi și punte',
    hotspot: { x: 374, y: 88 },
    summary:
      'Distanța exactă măsurată între prăgușul superior și șaua călușului (de regulă 648–650 mm pe chitara acustică standard).',
    physicsRole:
      'Determină lungimea L din ecuația undei staționare f₁ = (1/2L)·√(T/μ). Un diapazon mai lung cere o tensiune mai mare pentru aceeași notă.',
    materials: 'Parametru geometric fundamental al construcției instrumentului.',
    targetModule: 'string',
  },
];

const MUSICAL_TERMS: MusicalTermEntry[] = [
  {
    id: 'note',
    term: 'Notă muzicală (Notă / Note)',
    pluralOrForms: 'Singular: notă · Plural: note',
    category: 'pitch',
    categoryLabel: 'Înălțime și intervale',
    formula: 'A4 = 440,00 Hz (La din octava 4)',
    definition:
      'Reprezintă un sunet muzical cu o înălțime (frecvență fundamentală) determinată și o durată definită, notat alfabetic (C, D, E, F, G, A, B) sau prin solfegiu (Do, Re, Mi, Fa, Sol, La, Si).',
    guitarContext:
      'Cele 6 corzi libere ale chitarei acordate standard produc notele E2 (82,4 Hz), A2 (110 Hz), D3 (146,8 Hz), G3 (196 Hz), B3 (246,9 Hz) și E4 (329,6 Hz).',
    audioLabel: 'Audiază nota A4 (440 Hz)',
    playAudio: () => audioEngine.playPluckedString(440, { duration: 2.2 }),
    visualType: 'note',
    targetModule: 'notes',
  },
  {
    id: 'octave',
    term: 'Octavă (Octavă / Octave)',
    pluralOrForms: 'Singular: octavă · Plural: octave',
    category: 'pitch',
    categoryLabel: 'Înălțime și intervale',
    formula: 'f_octavă = 2 · f₀   (raport exact 2 : 1 · 1200 sutimi de semiton)',
    definition:
      'Intervalul dintre două note muzicale unde frecvența celei de-a doua este exact dublul frecvenței primei note. Cele două sunete poartă același nume și sună extrem de consonant împreună.',
    guitarContext:
      'Apăsarea fretului 12 înjumătățește lungimea corzii (L/2), dublând frecvența și urcând nota exact cu o octavă (de ex. E2 82,4 Hz → E3 164,8 Hz).',
    audioLabel: 'Audiază octavă (A2 → A3)',
    playAudio: () => {
      audioEngine.playPluckedString(110, { duration: 1.8 });
      window.setTimeout(() => audioEngine.playPluckedString(220, { duration: 2.0 }), 550);
    },
    visualType: 'octave',
    targetModule: 'notes',
  },
  {
    id: 'semitone',
    term: 'Semiton (Semiton / Semitonuri)',
    pluralOrForms: 'Singular: semiton · Plural: semitonuri (½ ton)',
    category: 'pitch',
    categoryLabel: 'Înălțime și intervale',
    formula: 'f₂ = f₁ · 2^(1/12) ≈ 1,05946 · f₁   (100 sutimi de semiton)',
    definition:
      'Cel mai mic interval muzical folosit în sistemul occidental temperat egal; reprezintă a douăsprezecea parte dintr-o octavă.',
    guitarContext:
      'Fiecare tastă (fret) succesivă de pe griful chitarei crește înălțimea sunetului cu exact 1 semiton (de ex. de la coarda 5 liberă A2 la fretul 1 A#2/Sib2).',
    audioLabel: 'Audiază 1 semiton (A2 → A#2)',
    playAudio: () => {
      audioEngine.playPluckedString(110, { duration: 1.4 });
      window.setTimeout(() => audioEngine.playPluckedString(116.54, { duration: 1.6 }), 480);
    },
    visualType: 'semitone',
    targetModule: 'notes',
  },
  {
    id: 'tone',
    term: 'Ton întreg (Ton / Tonuri)',
    pluralOrForms: 'Singular: ton · Plural: tonuri (2 semitonuri)',
    category: 'pitch',
    categoryLabel: 'Înălțime și intervale',
    formula: '1 ton = 2 semitonuri = 200 sutimi de semiton · f₂ = f₁ · 2^(2/12) ≈ 1,12246 · f₁',
    definition:
      'Interval muzical format din suma a două semitonuri consecutive (echivalentul unei secunde mari, de exemplu distanța dintre Do și Re sau între Re și Mi).',
    guitarContext:
      'Pe aceeași coardă a chitarei, un ton corespunde deplasării cu exact două freturi (de ex. de la fretul 3 la fretul 5).',
    audioLabel: 'Audiază 1 ton (A2 → B2)',
    playAudio: () => {
      audioEngine.playPluckedString(110, { duration: 1.4 });
      window.setTimeout(() => audioEngine.playPluckedString(123.47, { duration: 1.6 }), 480);
    },
    visualType: 'tone',
    targetModule: 'scales',
  },
  {
    id: 'accidentals',
    term: 'Alterații: Diez (♯), Bemol (♭), Becar (♮)',
    pluralOrForms: 'Semne de modificare cu ±1 semiton',
    category: 'pitch',
    categoryLabel: 'Înălțime și intervale',
    formula: '♯ = +1 semiton (+100 sutimi) · ♭ = −1 semiton (−100 sutimi)',
    definition:
      'Simboluri muzicale care modifică înălțimea unei note naturale: diezul (♯) o urcă cu un semiton, bemolul (♭) o coboară cu un semiton, iar becarul (♮) o readuce la starea naturală.',
    guitarContext:
      'În temperamentul egal, notele enarmonice precum C♯ (Do♯) și D♭ (Re♭) se cântă pe același fret și au exact aceeași frecvență.',
    visualType: 'accidentals',
    targetModule: 'notes',
  },
  {
    id: 'cent',
    term: 'Sutime de semiton',
    pluralOrForms: 'Singular: sutime de semiton · Plural: sutimi de semiton',
    category: 'pitch',
    categoryLabel: 'Înălțime și intervale',
    formula: 's = 1200 · log₂(f₂ / f₁)   |   1 semiton = 100 sutimi de semiton',
    definition:
      'Unitate logaritmică de măsură fină a intervalelor muzicale. O sutime de semiton este a suta parte dintr-un semiton temperat egal; o octavă cuprinde 1200 de sutimi de semiton.',
    guitarContext:
      'Acordorul cromatic măsoară deviația corzii în sutimi de semiton (±50): sub ±5 sutimi de semiton, urechea percepe coarda ca fiind acordată.',
    visualType: 'cent',
    targetModule: 'temperament',
  },
  {
    id: 'interval',
    term: 'Interval muzical (Interval / Intervale)',
    pluralOrForms: 'Singular: interval · Plural: intervale',
    category: 'pitch',
    categoryLabel: 'Înălțime și intervale',
    formula: 'Cvintă perfectă (5P) = 7 semitonuri ≈ 3 : 2',
    definition:
      'Distanța percepută în înălțime (raportul de frecvențe) între două note redate succesiv (interval melodic) sau simultan (interval armonic).',
    guitarContext:
      'Între corzile adiacente E2–A2–D3–G3–B3–E4 există intervale de cvartă perfectă (5 semitonuri), cu excepția perechii G3–B3 care este o terță mare (4 semitonuri).',
    audioLabel: 'Audiază cvintă perfectă (A2 + E3)',
    playAudio: () => audioEngine.playChord([110, 164.81], 45, { duration: 2.2 }),
    visualType: 'interval',
    targetModule: 'scales',
  },
  {
    id: 'scale',
    term: 'Gamă muzicală (Gamă / Game)',
    pluralOrForms: 'Singular: gamă · Plural: game',
    category: 'structures',
    categoryLabel: 'Structuri muzicale',
    formula: 'Gamă majoră: T – T – ½ – T – T – T – ½',
    definition:
      'O succesiune ordonată ascendent sau descendent de note muzicale cuprinse într-o octavă, definite printr-un tipar fix de tonuri și semitonuri.',
    guitarContext:
      'Gama Do major (C–D–E–F–G–A–B) nu are alterații; pentatonica minoră (5 note) este cea mai folosită gamă de improvizație pe chitară.',
    audioLabel: 'Audiază gama Do major',
    playAudio: () => {
      const notes = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];
      notes.forEach((f, idx) => {
        window.setTimeout(() => audioEngine.playPluckedString(f, { duration: 1.0 }), idx * 240);
      });
    },
    visualType: 'scale',
    targetModule: 'scales',
  },
  {
    id: 'tonic',
    term: 'Tonică (Centru tonal)',
    pluralOrForms: 'Treapta I a unei game',
    category: 'structures',
    categoryLabel: 'Structuri muzicale',
    formula: 'Treapta I (Rădăcina) → stabilitate maximă',
    definition:
      'Nota fundamentală care dă numele gamei sau tonalității și față de care toate celelalte note creează tensiune sau rezolvare.',
    guitarContext:
      'În gama Sol major, nota G (Sol) este tonica; majoritatea frazelor melodice și acordurilor finale se întorc pe acordul de G.',
    visualType: 'tonic',
    targetModule: 'scales',
  },
  {
    id: 'chord',
    term: 'Acord muzical (Acord / Acorduri)',
    pluralOrForms: 'Singular: acord · Plural: acorduri',
    category: 'structures',
    categoryLabel: 'Structuri muzicale',
    formula: 'Triadă majoră: (Tonică, 3M +4 st, 5P +7 st)',
    definition:
      'Emisia simultană a cel puțin trei note diferite construite de regulă prin suprapuneri de terțe (majoră, minoră, diminuată sau acorduri de septimă).',
    guitarContext:
      'Acordul C major pe chitară combină notele C3, E3, G3, C4 și E4 pe corzile 5–1, formând o rezonanță armonică plină.',
    audioLabel: 'Audiază acord Do major',
    playAudio: () => audioEngine.playChord([130.81, 164.81, 196.0, 261.63, 329.63], 42, { duration: 2.6 }),
    visualType: 'chord',
    targetModule: 'chords',
  },
  {
    id: 'arpeggio',
    term: 'Arpegiu (Arpegiu / Arpegii)',
    pluralOrForms: 'Singular: arpegiu · Plural: arpegii',
    category: 'structures',
    categoryLabel: 'Structuri muzicale',
    formula: 'Notele acordului redate succesiv: t₁ < t₂ < t₃…',
    definition:
      'Tehnică interpretativă prin care notele componente ale unui acord sunt ciupite una după alta (în loc de lovirea simultană), lăsându-le să rezoneze împreună.',
    guitarContext:
      'La chitară, ciupirea cu degetele (fingerpicking) sau măturarea lentă cu pana (arpeggio strum) pune în evidență claritatea fiecărei corzi.',
    audioLabel: 'Audiază arpegiu La minor',
    playAudio: () => audioEngine.playChord([110, 164.81, 220, 261.63, 329.63], 185, { duration: 2.4 }),
    visualType: 'arpeggio',
    targetModule: 'chords',
  },
  {
    id: 'consonance',
    term: 'Consonanță și Disonanță',
    pluralOrForms: 'Stabilitate vs. tensiune acustică',
    category: 'structures',
    categoryLabel: 'Structuri muzicale',
    formula: 'Rapoarte simple (2:1, 3:2, 5:4) = consonanță',
    definition:
      'Consonanța descrie sunetele care se îmbină armonios deoarece armonicele lor superioare coincid; disonanța apare când frecvențele apropiate creează bătăi rapide și tensiune muzicală.',
    guitarContext:
      'Un acord de putere (power chord 1–5) are raport 3:2 foarte consonant, pe când o secundă mică (1 semiton) sună tensionat până se rezolvă.',
    visualType: 'consonance',
    targetModule: 'chords',
  },
  {
    id: 'frequency',
    term: 'Frecvență fundamentală (f₀)',
    pluralOrForms: 'Unitate de măsură: Hertz (Hz = cicluri/sec)',
    category: 'physics',
    categoryLabel: 'Fizica sunetului',
    formula: 'f₁ = (1 / 2L) · √(T / μ)   |   f = 1 / T_perioadă',
    definition:
      'Numărul de oscilații complete pe care coarda le efectuează într-o secundă. Determină direct înălțimea percepută a sunetului (grav vs. acut).',
    guitarContext:
      'Spectrul acustic al chitarei acoperă fundamentale de la 82,4 Hz (coarda E2 liberă) până la ~988 Hz (fretul 19 pe coarda E4).',
    visualType: 'frequency',
    targetModule: 'string',
  },
  {
    id: 'harmonics',
    term: 'Armonică / Armonice superioare (nf₀)',
    pluralOrForms: 'Singular: armonică · Plural: armonice',
    category: 'physics',
    categoryLabel: 'Fizica sunetului',
    formula: 'fₙ = n · f₁   (n = 1, 2, 3, 4…)',
    definition:
      'Componente sinusoidale cu frecvențe multipli întregi ai fundamentalei, generate simultan când coarda vibrează pe jumătăți, treimi, pătrimi etc.',
    guitarContext:
      'Atingerea ușoară a corzii exact deasupra fretului 12, 7 sau 5 izolează armonicele naturale pure 2f₁, 3f₁ și 4f₁ cu un timbru cristalin.',
    audioLabel: 'Audiază armonic fret 12 (2f₁)',
    playAudio: () => audioEngine.playPluckedString(220, { technique: 'harmonic_12', duration: 2.3 }),
    visualType: 'harmonics',
    targetModule: 'harmonics',
  },
  {
    id: 'timbre',
    term: 'Timbru (Culoarea sunetului)',
    pluralOrForms: 'Calitatea spectrală distinctivă a sunetului',
    category: 'physics',
    categoryLabel: 'Fizica sunetului',
    formula: 'y(t) = Σ Aₙ · sin(2π n f₁ t + φₙ)',
    definition:
      'Caracteristica acustică ce permite urechii să distingă două instrumente diferite (de ex. chitară vs. flaut) chiar și când cântă exact aceeași notă la același volum.',
    guitarContext:
      'Timbrul chitarei depinde de poziția ciupirii (lângă căluș = tăios; peste rozetă = cald), materialul corzilor și lemnul cutiei (molid vs. cedru).',
    visualType: 'timbre',
    targetModule: 'sandbox',
  },
  {
    id: 'standing_wave',
    term: 'Undă staționară (Moduri proprii)',
    pluralOrForms: 'Noduri fixe și ventre de oscilație',
    category: 'physics',
    categoryLabel: 'Fizica sunetului',
    formula: 'λₙ = 2L / n   (noduri la x = k·L/n)',
    definition:
      'Fenomen rezultat din suprapunerea undelor care călătoresc spre căluș și se reflectă înapoi din prăguș; anumite puncte rămân nemișcate (noduri), iar altele oscilează maxim (ventre).',
    guitarContext:
      'Dacă ciupești coarda exact într-un nod al armonicii n (de ex. la L/5 = fret 5), acel mod propriu de vibrație este complet suprimat din spectru.',
    visualType: 'standing_wave',
    targetModule: 'harmonics',
  },
  {
    id: 'equal_temp',
    term: 'Temperament egal (12-TET)',
    pluralOrForms: 'Sistem de acordaj standard modern',
    category: 'physics',
    categoryLabel: 'Fizica sunetului',
    formula: 'fₙ = 440 · 2^((MIDI − 69) / 12)',
    definition:
      'Sistem matematic de acordaj care împarte octava în 12 semitonuri cu raport geometric identic (2^(1/12)), permițând cântarea în orice tonalitate fără dezacordări majore.',
    guitarContext:
      'Tastele fixe ale chitarei sunt calculate în 12-TET, făcând posibilă folosirea capodastrului și transpunerea acordurilor cu bareu pe întregul grif.',
    visualType: 'equal_temp',
    targetModule: 'temperament',
  },
  {
    id: 'just_intonation',
    term: 'Intonație pură (Acordaj natural)',
    pluralOrForms: 'Rapoarte fracționare exacte',
    category: 'physics',
    categoryLabel: 'Fizica sunetului',
    formula: '5P pură = 3/2 (701,96 sutimi) · 3M pură = 5/4 (386,31 sutimi)',
    definition:
      'Sistem de acordaj în care intervalele folosesc rapoarte de numere întregi mici extrase direct din seria armonică naturală, eliminând complet bătăile acustice pe tonalitatea de bază.',
    guitarContext:
      'Diferența de 1,96 sutimi de semiton la cvintă și 13,69 sutimi de semiton la terța mare față de temperamentul egal explică de ce armonicele naturale sună ușor diferit de notele apăsate pe taste.',
    visualType: 'just_intonation',
    targetModule: 'temperament',
  },
  {
    id: 'beats',
    term: 'Bătăi acustice (Interferență)',
    pluralOrForms: 'Pulsații periodice ale amplitudinii',
    category: 'physics',
    categoryLabel: 'Fizica sunetului',
    formula: 'f_bătăi = |f₂ − f₁|',
    definition:
      'Variație ritmică de volum percepută când două sunete cu frecvențe foarte apropiate interferează alternativ constructiv și distructiv.',
    guitarContext:
      'Chitariștii ascultă bătăile acustice pentru a acorda după ureche: pe măsură ce două corzi se apropie de unison, bătăile încetinesc până dispar complet.',
    audioLabel: 'Audiază bătăi (220 Hz + 223 Hz)',
    playAudio: () => audioEngine.playDualTones(220, 223, 2.5, 0.2),
    visualType: 'beats',
    targetModule: 'temperament',
  },
  {
    id: 'resonance',
    term: 'Rezonanță acustică (Helmholtz și Placă)',
    pluralOrForms: 'Amplificare selectivă a frecvențelor',
    category: 'physics',
    categoryLabel: 'Fizica sunetului',
    formula: 'f_A₀ = (c / 2π) · √(S / (V · L_eff))',
    definition:
      'Răspunsul amplificat al unui sistem mecanic sau cavitate de aer atunci când este excitat la una dintre frecvențele sale proprii de oscilație.',
    guitarContext:
      'Cutia chitarei are două rezonanțe joase principale: rezonanța aerului din gură (Helmholtz A₀ ≈ 100 Hz) și rezonanța feței armonice (T₁ ≈ 200 Hz).',
    visualType: 'resonance',
    targetModule: 'sandbox',
  },
  {
    id: 'adsr',
    term: 'Plic dinamic (Envelope ADSR)',
    pluralOrForms: 'Attack · Decay · Sustain · Release',
    category: 'physics',
    categoryLabel: 'Fizica sunetului',
    formula: 'A (atac) → D (cădere) → S (nivel) → R (stingere)',
    definition:
      'Curba care descrie cum evoluează amplitudinea unui sunet de la momentul declanșării până la dispariția completă.',
    guitarContext:
      'Chitara acustică are un Attack aproape instantaneu (~5–10 ms), urmat de un Decay și un Release exponențial lent; atingerea corzii cu podul palmei (palm-mute) scurtează drastic faza Release.',
    visualType: 'adsr',
    targetModule: 'sandbox',
  },
  {
    id: 'transposition',
    term: 'Transpoziție și Capodastru',
    pluralOrForms: 'Mutarea înălțimii cu k semitonuri',
    category: 'structures',
    categoryLabel: 'Structuri muzicale',
    formula: 'f_nou = f_vechi · 2^(k / 12)',
    definition:
      'Mutarea unei melodii, game sau progresii de acorduri mai sus ori mai jos cu un interval constant, păstrând neschimbate relațiile dintre note.',
    guitarContext:
      'Așezarea unui capodastru pe fretul k scurtează toate cele 6 corzi simultan și transpune automat formele de acorduri deschise cu +k semitonuri.',
    visualType: 'transposition',
    targetModule: 'scales',
  },
];

function normalizeRo(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const PartMiniGraphic: React.FC<{ id: PartId }> = ({ id }) => {
  switch (id) {
    case 'headstock':
    case 'tuners':
      return (
        <svg viewBox="0 0 120 48" className="w-full h-12 rounded-md bg-[#fafcfa] border border-[#e3ebe6]">
          <line x1="12" y1="24" x2="72" y2="24" stroke="#0d4a3e" strokeWidth="2.5" />
          <line x1="72" y1="24" x2="108" y2="34" stroke="#b85d2b" strokeWidth="2.5" />
          <path d="M 76 16 A 14 14 0 0 1 88 26" fill="none" stroke="#53665f" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="96" cy="20" r="5" fill="#edf3f0" stroke="#0d4a3e" strokeWidth="1.5" />
          <text x="8" y="14" fontSize="8" fill="#53665f" fontFamily="Consolas, monospace">13°</text>
        </svg>
      );
    case 'nut':
    case 'saddle_pins':
      return (
        <svg viewBox="0 0 120 48" className="w-full h-12 rounded-md bg-[#fafcfa] border border-[#e3ebe6]">
          <rect x="44" y="20" width="8" height="20" rx="2" fill="#0d4a3e" />
          <line x1="10" y1="24" x2="48" y2="20" stroke="#b85d2b" strokeWidth="2" />
          <line x1="48" y1="20" x2="110" y2="20" stroke="#0d4a3e" strokeWidth="2" />
          <circle cx="48" cy="20" r="3" fill="#b85d2b" />
          <text x="58" y="14" fontSize="8" fill="#0d4a3e" fontFamily="Consolas, monospace">nod fix</text>
        </svg>
      );
    case 'fretboard':
    case 'frets':
      return (
        <svg viewBox="0 0 120 48" className="w-full h-12 rounded-md bg-[#fafcfa] border border-[#e3ebe6]">
          <rect x="8" y="12" width="104" height="24" rx="2" fill="#edf3f0" stroke="#bac9c2" />
          {[14, 34, 52, 68, 82, 95, 106].map((x, i) => (
            <line key={i} x1={x} y1="12" x2={x} y2="36" stroke="#0d4a3e" strokeWidth={i === 0 ? 2.5 : 1.3} />
          ))}
          <circle cx="60" cy="24" r="2.2" fill="#b85d2b" />
          <circle cx="88" cy="24" r="2.2" fill="#b85d2b" />
        </svg>
      );
    case 'neck':
    case 'scale_length':
      return (
        <svg viewBox="0 0 120 48" className="w-full h-12 rounded-md bg-[#fafcfa] border border-[#e3ebe6]">
          <line x1="14" y1="18" x2="106" y2="18" stroke="#0d4a3e" strokeWidth="2" />
          <line x1="14" y1="12" x2="14" y2="24" stroke="#b85d2b" strokeWidth="2" />
          <line x1="106" y1="12" x2="106" y2="24" stroke="#b85d2b" strokeWidth="2" />
          <text x="60" y="37" textAnchor="middle" fontSize="9" fill="#0d4a3e" fontFamily="Consolas, monospace">L ≈ 650 mm</text>
        </svg>
      );
    case 'strings':
      return (
        <svg viewBox="0 0 120 48" className="w-full h-12 rounded-md bg-[#fafcfa] border border-[#e3ebe6]">
          {[10, 16, 22, 28, 34, 40].map((y, i) => (
            <line
              key={i}
              x1="10"
              y1={y}
              x2="110"
              y2={y}
              stroke={i >= 3 ? '#b85d2b' : '#0d4a3e'}
              strokeWidth={0.8 + i * 0.4}
            />
          ))}
        </svg>
      );
    case 'soundhole':
      return (
        <svg viewBox="0 0 120 48" className="w-full h-12 rounded-md bg-[#fafcfa] border border-[#e3ebe6]">
          <circle cx="60" cy="24" r="16" fill="#13221d" stroke="#b85d2b" strokeWidth="2.5" />
          <circle cx="60" cy="24" r="19" fill="none" stroke="#0d4a3e" strokeWidth="1" strokeDasharray="3 2" />
          <text x="86" y="27" fontSize="8" fill="#0d4a3e" fontFamily="Consolas, monospace">A₀</text>
        </svg>
      );
    case 'bracing':
      return (
        <svg viewBox="0 0 120 48" className="w-full h-12 rounded-md bg-[#fafcfa] border border-[#e3ebe6]">
          <line x1="25" y1="8" x2="95" y2="40" stroke="#b85d2b" strokeWidth="2.2" />
          <line x1="25" y1="40" x2="95" y2="8" stroke="#b85d2b" strokeWidth="2.2" />
          <line x1="65" y1="24" x2="108" y2="16" stroke="#0d4a3e" strokeWidth="1.4" />
          <line x1="65" y1="24" x2="108" y2="32" stroke="#0d4a3e" strokeWidth="1.4" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 120 48" className="w-full h-12 rounded-md bg-[#fafcfa] border border-[#e3ebe6]">
          <path d="M 16 24 Q 40 6 60 24 T 104 24" fill="none" stroke="#0d4a3e" strokeWidth="2" />
          <path d="M 16 24 Q 40 42 60 24 T 104 24" fill="none" stroke="#b85d2b" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="10" y="13" fontSize="8" fill="#53665f" fontFamily="Consolas, monospace">T₁</text>
        </svg>
      );
  }
};

const TermMiniGraphic: React.FC<{ type: MusicalTermEntry['visualType'] }> = ({ type }) => {
  switch (type) {
    case 'octave':
      return (
        <svg viewBox="0 0 180 56" className="w-full h-14 rounded-md bg-[#fafcfa] border border-[#e3ebe6]">
          <path d="M 10 28 Q 50 4 90 28 T 170 28" fill="none" stroke="#0d4a3e" strokeWidth="2" />
          <path d="M 10 28 Q 30 6 50 28 T 90 28 T 130 28 T 170 28" fill="none" stroke="#b85d2b" strokeWidth="1.8" />
          <text x="12" y="13" fontSize="8" fill="#0d4a3e" fontFamily="Consolas, monospace">f₀ (1 ciclu)</text>
          <text x="116" y="13" fontSize="8" fill="#b85d2b" fontFamily="Consolas, monospace">2f₀ (2 cicluri)</text>
        </svg>
      );
    case 'semitone':
    case 'tone':
      return (
        <svg viewBox="0 0 180 56" className="w-full h-14 rounded-md bg-[#fafcfa] border border-[#e3ebe6]">
          <rect x="14" y="18" width="152" height="24" rx="3" fill="#edf3f0" stroke="#bac9c2" />
          {[14, 52, 90, 128, 166].map((x, idx) => (
            <line key={idx} x1={x} y1="18" x2={x} y2="42" stroke="#53665f" strokeWidth="1.4" />
          ))}
          <circle cx="33" cy="30" r="5" fill="#0d4a3e" />
          <circle cx={type === 'semitone' ? 71 : 109} cy="30" r="5" fill="#b85d2b" />
          <path
            d={type === 'semitone' ? 'M 33 14 Q 52 4 71 14' : 'M 33 14 Q 71 2 109 14'}
            fill="none"
            stroke="#b85d2b"
            strokeWidth="1.6"
          />
          <text x="122" y="13" fontSize="8" fill="#0d4a3e" fontFamily="Consolas, monospace">
            {type === 'semitone' ? '1 fret = ½ ton' : '2 freturi = 1 ton'}
          </text>
        </svg>
      );
    case 'harmonics':
    case 'standing_wave':
      return (
        <svg viewBox="0 0 180 56" className="w-full h-14 rounded-md bg-[#fafcfa] border border-[#e3ebe6]">
          <line x1="12" y1="28" x2="168" y2="28" stroke="#cbd5e1" strokeWidth="1" />
          <path d="M 12 28 Q 38 6 64 28 T 116 28 T 168 28" fill="none" stroke="#0d4a3e" strokeWidth="2" />
          <path d="M 12 28 Q 38 50 64 28 T 116 28 T 168 28" fill="none" stroke="#b85d2b" strokeWidth="1.3" strokeDasharray="3 2" />
          {[12, 64, 116, 168].map((x, i) => (
            <circle key={i} cx={x} cy="28" r="3" fill="#0d4a3e" />
          ))}
          <text x="72" y="12" fontSize="8" fill="#53665f" fontFamily="Consolas, monospace">n = 3 (noduri L/3)</text>
        </svg>
      );
    case 'beats':
      return (
        <svg viewBox="0 0 180 56" className="w-full h-14 rounded-md bg-[#fafcfa] border border-[#e3ebe6]">
          <path d="M 8 28 Q 30 6 52 28 Q 74 50 96 28 Q 118 6 140 28 Q 156 44 172 28" fill="none" stroke="#b85d2b" strokeWidth="1.6" />
          <path d="M 8 28 Q 30 12 52 28 Q 74 12 96 28 Q 118 12 140 28 Q 156 16 172 28" fill="none" stroke="#0d4a3e" strokeWidth="1.4" strokeDasharray="2 2" />
          <text x="12" y="12" fontSize="8" fill="#0d4a3e" fontFamily="Consolas, monospace">Δf = |f₂ − f₁|</text>
        </svg>
      );
    case 'adsr':
      return (
        <svg viewBox="0 0 180 56" className="w-full h-14 rounded-md bg-[#fafcfa] border border-[#e3ebe6]">
          <polyline
            points="12,46 30,10 68,28 118,28 168,46"
            fill="rgba(13,74,62,0.10)"
            stroke="#0d4a3e"
            strokeWidth="2"
          />
          <text x="18" y="20" fontSize="8" fill="#0d4a3e" fontFamily="Consolas, monospace">A</text>
          <text x="47" y="18" fontSize="8" fill="#b85d2b" fontFamily="Consolas, monospace">D</text>
          <text x="89" y="24" fontSize="8" fill="#0d4a3e" fontFamily="Consolas, monospace">S</text>
          <text x="138" y="34" fontSize="8" fill="#b85d2b" fontFamily="Consolas, monospace">R</text>
        </svg>
      );
    case 'chord':
    case 'arpeggio':
    case 'scale':
      return (
        <svg viewBox="0 0 180 56" className="w-full h-14 rounded-md bg-[#fafcfa] border border-[#e3ebe6]">
          {[16, 24, 32, 40, 48].map((y) => (
            <line key={y} x1="12" y1={y} x2="168" y2={y} stroke="#cbd5e1" strokeWidth="1" />
          ))}
          {type === 'chord' ? (
            <>
              <ellipse cx="90" cy="40" rx="6" ry="4" fill="#0d4a3e" />
              <ellipse cx="90" cy="32" rx="6" ry="4" fill="#0d4a3e" />
              <ellipse cx="90" cy="24" rx="6" ry="4" fill="#b85d2b" />
            </>
          ) : (
            [28, 52, 76, 100, 124, 148].map((x, idx) => (
              <ellipse key={idx} cx={x} cy={44 - idx * 4.5} rx="5" ry="3.5" fill={idx === 0 ? '#b85d2b' : '#0d4a3e'} />
            ))
          )}
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 180 56" className="w-full h-14 rounded-md bg-[#fafcfa] border border-[#e3ebe6]">
          <line x1="10" y1="42" x2="170" y2="42" stroke="#cbd5e1" strokeWidth="1" />
          {[1, 0.58, 0.36, 0.24, 0.16, 0.11, 0.08].map((amp, i) => (
            <rect
              key={i}
              x={20 + i * 21}
              y={42 - amp * 30}
              width="12"
              height={amp * 30}
              rx="1.5"
              fill={i === 0 ? '#b85d2b' : '#0d4a3e'}
            />
          ))}
        </svg>
      );
  }
};

export const DictionaryView: React.FC<DictionaryViewProps> = ({ onOpenModule }) => {
  const [sectionTab, setSectionTab] = useState<'both' | 'anatomy' | 'terms'>('both');
  const [selectedPartId, setSelectedPartId] = useState<PartId>('soundboard');
  const [partZoneFilter, setPartZoneFilter] = useState<'all' | GuitarPartEntry['zone']>('all');
  const [termCategoryFilter, setTermCategoryFilter] = useState<'all' | TermCategory>('all');
  const [query, setQuery] = useState<string>('');

  const normQuery = normalizeRo(query.trim());

  const filteredParts = useMemo(() => {
    return GUITAR_PARTS.filter((p) => {
      if (partZoneFilter !== 'all' && p.zone !== partZoneFilter) return false;
      if (!normQuery) return true;
      return normalizeRo(`${p.name} ${p.englishName} ${p.summary} ${p.physicsRole} ${p.materials}`).includes(normQuery);
    });
  }, [partZoneFilter, normQuery]);

  const filteredTerms = useMemo(() => {
    return MUSICAL_TERMS.filter((t) => {
      if (termCategoryFilter !== 'all' && t.category !== termCategoryFilter) return false;
      if (!normQuery) return true;
      return normalizeRo(`${t.term} ${t.pluralOrForms} ${t.definition} ${t.guitarContext} ${t.formula ?? ''}`).includes(
        normQuery
      );
    });
  }, [termCategoryFilter, normQuery]);

  const selectedPart = useMemo(
    () => GUITAR_PARTS.find((p) => p.id === selectedPartId) ?? GUITAR_PARTS[0],
    [selectedPartId]
  );

  return (
    <div className="space-y-5">
      {/* Intro & Global Search + Part Switcher */}
      <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-[#0d4a3e]" />
              <h2 className="text-lg font-bold text-[#13221d]">
                Dicționar ilustrat de luterie, fizică acustică și teorie muzicală
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#53665f]">
              Structurat în două părți complementare: anatomia fizică a chitarei acustice (cu diagramă interactivă) și
              termenii muzicali esențiali (notă/note, octavă/octave, ton/tonuri, semiton/semitonuri, armonice și acustică).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#edf3f0]">
            {(
              [
                { id: 'both', label: 'Ambele părți' },
                { id: 'anatomy', label: 'I. Componentele chitarei' },
                { id: 'terms', label: 'II. Termeni muzicali' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSectionTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  sectionTab === tab.id ? 'bg-[#0d4a3e] text-white' : 'text-[#53665f] hover:text-[#13221d]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input + Quick Counts */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-[#53665f] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Caută componentă sau termen (ex: căluș, prăguș, octavă, semiton, armonică, Helmholtz)..."
              className="w-full rounded-lg border border-[#d8e2dc] bg-[#fafcfa] pl-9 pr-8 py-2 text-xs text-[#13221d] outline-none focus:border-[#0d4a3e]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#53665f] hover:text-[#13221d] cursor-pointer"
                aria-label="Șterge căutarea"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-[#53665f] font-mono tabular-nums">
            {filteredParts.length} componente · {filteredTerms.length} termeni muzicali
          </div>
        </div>
      </div>

      {/* PART I: PHYSICAL GUITAR ANATOMY */}
      {(sectionTab === 'both' || sectionTab === 'anatomy') && (
        <section className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e3ebe6] pb-3.5">
            <div className="flex items-center gap-2">
              <Guitar className="w-4 h-4 text-[#0d4a3e]" />
              <h3 className="text-base font-bold text-[#13221d]">
                Partea I: Componentele fizice ale chitarei acustice
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#edf3f0]">
              {(['all', 'Cap și gât', 'Corp și rezonanță', 'Corzi și punte'] as const).map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setPartZoneFilter(z)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    partZoneFilter === z ? 'bg-[#0d4a3e] text-white' : 'text-[#53665f] hover:text-[#13221d]'
                  }`}
                >
                  {z === 'all' ? 'Toate zonele' : z}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive SVG Blueprint + Selected Component Spotlight */}
          <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-5 items-stretch">
            <div className="rounded-xl border border-[#d8e2dc] bg-[#fafcfa] p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between text-xs text-[#53665f]">
                <span className="font-semibold text-[#13221d]">
                  Diagramă anatomică interactivă (dă clic pe orice reper 1–14)
                </span>
                <span className="font-mono text-[11px]">Vedere completă + secțiune baraj</span>
              </div>

              <svg viewBox="0 0 700 245" className="w-full h-auto block select-none">
                <defs>
                  <linearGradient id="spruceBody" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f5e6cf" />
                    <stop offset="55%" stopColor="#e8cca3" />
                    <stop offset="100%" stopColor="#d8b27c" />
                  </linearGradient>
                  <linearGradient id="neckWood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5a3825" />
                    <stop offset="100%" stopColor="#3c2416" />
                  </linearGradient>
                </defs>

                {/* Acoustic Guitar Body Silhouette */}
                <path
                  d="M 380 78
                     C 402 42, 446 38, 474 62
                     C 492 78, 508 78, 526 52
                     C 564 16, 636 22, 658 76
                     C 672 108, 672 136, 658 168
                     C 636 222, 564 228, 526 192
                     C 508 166, 492 166, 474 182
                     C 446 206, 402 202, 380 166 Z"
                  fill="url(#spruceBody)"
                  stroke={selectedPartId === 'body' || selectedPartId === 'soundboard' ? '#b85d2b' : '#8a5f37'}
                  strokeWidth={selectedPartId === 'body' || selectedPartId === 'soundboard' ? 3 : 2}
                />

                {/* Internal X-Bracing Schematic Overlay (dashed subtle engineering lines) */}
                <g
                  opacity={selectedPartId === 'bracing' ? 0.95 : 0.35}
                  stroke={selectedPartId === 'bracing' ? '#b85d2b' : '#7a5230'}
                  strokeWidth={selectedPartId === 'bracing' ? 2.4 : 1.3}
                  strokeDasharray="4 3"
                >
                  <line x1="510" y1="68" x2="618" y2="178" />
                  <line x1="510" y1="176" x2="618" y2="66" />
                  <line x1="572" y1="122" x2="642" y2="96" />
                  <line x1="572" y1="122" x2="642" y2="148" />
                </g>

                {/* Neck & Heel */}
                <rect
                  x="156"
                  y="102"
                  width="234"
                  height="40"
                  rx="2"
                  fill="url(#neckWood)"
                  stroke={selectedPartId === 'neck' ? '#b85d2b' : '#2f1c11'}
                  strokeWidth={selectedPartId === 'neck' ? 2.4 : 1.2}
                />

                {/* Headstock */}
                <path
                  d="M 156 104 L 128 96 L 44 96 L 36 122 L 44 148 L 128 148 L 156 140 Z"
                  fill="#492c1c"
                  stroke={selectedPartId === 'headstock' ? '#b85d2b' : '#2a180e'}
                  strokeWidth={selectedPartId === 'headstock' ? 2.6 : 1.5}
                />

                {/* Tuning Pegs (3 top + 3 bottom) */}
                {[60, 86, 112].map((px, i) => (
                  <g key={i}>
                    <rect
                      x={px - 6}
                      y="78"
                      width="12"
                      height="15"
                      rx="3"
                      fill="#dce6e1"
                      stroke={selectedPartId === 'tuners' ? '#b85d2b' : '#53665f'}
                      strokeWidth={selectedPartId === 'tuners' ? 2 : 1}
                    />
                    <rect
                      x={px - 6}
                      y="151"
                      width="12"
                      height="15"
                      rx="3"
                      fill="#dce6e1"
                      stroke={selectedPartId === 'tuners' ? '#b85d2b' : '#53665f'}
                      strokeWidth={selectedPartId === 'tuners' ? 2 : 1}
                    />
                  </g>
                ))}

                {/* Fretboard Extension */}
                <rect
                  x="164"
                  y="104"
                  width="266"
                  height="36"
                  fill="#2c2420"
                  stroke={selectedPartId === 'fretboard' ? '#b85d2b' : 'none'}
                  strokeWidth="2"
                />

                {/* Nut */}
                <rect
                  x="158"
                  y="103"
                  width="6"
                  height="38"
                  rx="1"
                  fill="#fdfbf7"
                  stroke={selectedPartId === 'nut' ? '#b85d2b' : '#94a3b8'}
                  strokeWidth={selectedPartId === 'nut' ? 2 : 1}
                />

                {/* Frets 1..18 */}
                {Array.from({ length: 18 }, (_, i) => {
                  const n = i + 1;
                  const scalePx = 434;
                  const fx = 162 + scalePx * (1 - Math.pow(2, -n / 12));
                  return (
                    <line
                      key={n}
                      x1={fx}
                      y1="104"
                      x2={fx}
                      y2="140"
                      stroke={selectedPartId === 'frets' ? '#b85d2b' : '#cbd5e1'}
                      strokeWidth={selectedPartId === 'frets' ? 1.8 : 1.1}
                    />
                  );
                })}

                {/* Soundhole & Rosette */}
                <circle
                  cx="472"
                  cy="122"
                  r="41"
                  fill="none"
                  stroke={selectedPartId === 'soundhole' ? '#b85d2b' : '#0d4a3e'}
                  strokeWidth="4"
                />
                <circle cx="472" cy="122" r="35" fill="#18120e" stroke="#8a5f37" strokeWidth="1.5" />

                {/* Bridge */}
                <rect
                  x="574"
                  y="96"
                  width="30"
                  height="52"
                  rx="4"
                  fill="#3a2316"
                  stroke={selectedPartId === 'bridge' ? '#b85d2b' : '#1f120b'}
                  strokeWidth={selectedPartId === 'bridge' ? 2.4 : 1.2}
                />
                {/* Saddle */}
                <line
                  x1="584"
                  y1="101"
                  x2="582"
                  y2="143"
                  stroke={selectedPartId === 'saddle_pins' ? '#b85d2b' : '#fafcfa'}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* 6 Bridge Pins */}
                {[107, 113, 119, 125, 131, 137].map((py, idx) => (
                  <circle
                    key={idx}
                    cx="596"
                    cy={py}
                    r="2.2"
                    fill={selectedPartId === 'saddle_pins' ? '#b85d2b' : '#e2e8f0'}
                  />
                ))}

                {/* 6 Strings */}
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const yFret = 108 + idx * 5.6;
                  const yBridge = 107 + idx * 6;
                  const pegX = idx < 3 ? 60 + idx * 26 : 60 + (5 - idx) * 26;
                  const pegY = idx < 3 ? 98 : 146;
                  return (
                    <g key={idx}>
                      <line
                        x1={pegX}
                        y1={pegY}
                        x2="160"
                        y2={yFret}
                        stroke={selectedPartId === 'strings' ? '#b85d2b' : '#d6d3d1'}
                        strokeWidth={0.7 + idx * 0.22}
                      />
                      <line
                        x1="160"
                        y1={yFret}
                        x2="584"
                        y2={yBridge}
                        stroke={selectedPartId === 'strings' ? '#b85d2b' : idx >= 3 ? '#c08448' : '#e5e7eb'}
                        strokeWidth={0.8 + idx * 0.24}
                      />
                    </g>
                  );
                })}

                {/* Scale Length Bracket */}
                <g opacity={selectedPartId === 'scale_length' ? 1 : 0.65}>
                  <line x1="161" y1="226" x2="584" y2="226" stroke="#0d4a3e" strokeWidth="1.5" />
                  <line x1="161" y1="220" x2="161" y2="232" stroke="#0d4a3e" strokeWidth="1.5" />
                  <line x1="584" y1="220" x2="584" y2="232" stroke="#0d4a3e" strokeWidth="1.5" />
                  <text
                    x="372"
                    y="239"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill="#0d4a3e"
                    fontFamily="Consolas, monospace"
                  >
                    Diapazon L ≈ 650 mm (prăguș → șa căluș)
                  </text>
                </g>

                {/* Interactive Hotspot Numbered Pins 1..14 */}
                {GUITAR_PARTS.map((part) => {
                  const active = part.id === selectedPartId;
                  return (
                    <g
                      key={part.id}
                      onClick={() => setSelectedPartId(part.id)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={part.hotspot.x}
                        cy={part.hotspot.y}
                        r={active ? 12 : 9.5}
                        fill={active ? '#b85d2b' : '#0d4a3e'}
                        stroke="#ffffff"
                        strokeWidth={active ? 2.4 : 1.5}
                      />
                      <text
                        x={part.hotspot.x}
                        y={part.hotspot.y + 3.5}
                        textAnchor="middle"
                        fontSize="9.5"
                        fontWeight="700"
                        fill="#ffffff"
                        fontFamily="Consolas, monospace"
                      >
                        {part.index}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Selected Part Detail Spotlight */}
            <div className="rounded-xl border border-[#d8e2dc] bg-[#edf3f0]/65 p-5 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs text-[#53665f]">
                  <span className="font-mono font-bold text-[#b85d2b]">
                    REPER #{selectedPart.index} · {selectedPart.zone.toUpperCase()}
                  </span>
                  <span className="font-mono">{selectedPart.englishName}</span>
                </div>

                <h4 className="text-base font-bold text-[#13221d]">{selectedPart.name}</h4>

                <PartMiniGraphic id={selectedPart.id} />

                <p className="text-xs text-[#13221d] leading-relaxed">{selectedPart.summary}</p>

                <div className="rounded-lg bg-white border border-[#dce6e1] p-3 space-y-1.5">
                  <div className="text-[11px] font-semibold text-[#0d4a3e]">Rol fizic și acustic</div>
                  <p className="text-xs text-[#53665f] leading-relaxed">{selectedPart.physicsRole}</p>
                </div>

                <div className="text-xs text-[#53665f]">
                  <span className="font-semibold text-[#13221d]">Materiale uzuale:</span> {selectedPart.materials}
                </div>
              </div>

              <div className="pt-2 border-t border-[#dce6e1] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onOpenModule(selectedPart.targetModule)}
                  className="px-3.5 py-2 rounded-lg bg-[#0d4a3e] hover:bg-[#09382f] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Experimentează în laborator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] text-[#53665f]">Dă clic pe numerele 1–14</span>
              </div>
            </div>
          </div>

          {/* Grid of all filtered Guitar Components */}
          {filteredParts.length === 0 ? (
            <div className="rounded-lg border border-[#e3ebe6] bg-[#fafcfa] p-5 text-center text-xs text-[#53665f]">
              Nicio componentă a chitarei nu corespunde căutării „{query}”.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredParts.map((part) => {
                const isSelected = part.id === selectedPartId;
                return (
                  <article
                    key={part.id}
                    onClick={() => setSelectedPartId(part.id)}
                    className={`rounded-xl border p-4 flex flex-col justify-between gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-[#b85d2b] bg-[#fdfaf7]'
                        : 'border-[#d8e2dc] bg-[#fafcfa] hover:border-[#0d4a3e]/45'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2 text-[11px] text-[#53665f]">
                        <span className="font-mono font-bold text-[#0d4a3e]">
                          #{part.index} · {part.zone}
                        </span>
                        <span className="font-mono truncate">{part.englishName}</span>
                      </div>

                      <h4 className="text-sm font-bold text-[#13221d]">{part.name}</h4>

                      <PartMiniGraphic id={part.id} />

                      <p className="text-xs text-[#53665f] leading-relaxed">{part.summary}</p>
                      <p className="text-[11.5px] text-[#13221d] leading-relaxed">
                        <span className="font-semibold text-[#0d4a3e]">Fizică: </span>
                        {part.physicsRole}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#e3ebe6] flex items-center justify-between text-[11px]">
                      <span className="text-[#53665f] truncate max-w-[180px]">{part.materials}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenModule(part.targetModule);
                        }}
                        className="font-semibold text-[#0d4a3e] hover:text-[#b85d2b] inline-flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <span>Testează</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* PART II: MUSICAL & ACOUSTIC TERMS DICTIONARY */}
      {(sectionTab === 'both' || sectionTab === 'terms') && (
        <section className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e3ebe6] pb-3.5">
            <div className="flex items-center gap-2">
              <Music2 className="w-4 h-4 text-[#0d4a3e]" />
              <h3 className="text-base font-bold text-[#13221d]">
                Partea II: Dicționar de termeni muzicali și acustică fizică
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#edf3f0]">
              {(
                [
                  { id: 'all', label: 'Toți termenii' },
                  { id: 'pitch', label: 'Înălțime și intervale' },
                  { id: 'structures', label: 'Game și acorduri' },
                  { id: 'physics', label: 'Fizica sunetului' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setTermCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    termCategoryFilter === cat.id ? 'bg-[#0d4a3e] text-white' : 'text-[#53665f] hover:text-[#13221d]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {filteredTerms.length === 0 ? (
            <div className="rounded-lg border border-[#e3ebe6] bg-[#fafcfa] p-5 text-center text-xs text-[#53665f]">
              Niciun termen muzical nu corespunde căutării „{query}”.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTerms.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-[#d8e2dc] bg-[#fafcfa] p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-[11px] text-[#53665f]">
                      <span className="font-semibold text-[#0d4a3e]">{item.categoryLabel}</span>
                      <span className="font-mono truncate">{item.pluralOrForms}</span>
                    </div>

                    <h4 className="text-sm font-bold text-[#13221d]">{item.term}</h4>

                    <TermMiniGraphic type={item.visualType} />

                    {item.formula && (
                      <div className="rounded-md bg-[#edf3f0] border border-[#dce6e1] px-2.5 py-1.5 font-mono text-[11px] font-semibold text-[#0d4a3e]">
                        {formatScientificIndices(item.formula)}
                      </div>
                    )}

                    <p className="text-xs text-[#13221d] leading-relaxed">{formatScientificIndices(item.definition)}</p>

                    <p className="text-[11.5px] text-[#53665f] leading-relaxed">
                      <span className="font-semibold text-[#b85d2b]">Pe chitară: </span>
                      {formatScientificIndices(item.guitarContext)}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#e3ebe6] flex flex-wrap items-center justify-between gap-2">
                    {item.playAudio ? (
                      <button
                        type="button"
                        onClick={item.playAudio}
                        className="px-2.5 py-1.5 rounded-md bg-[#0d4a3e] hover:bg-[#09382f] text-white text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{item.audioLabel}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#53665f]">Concept teoretic & acustic</span>
                    )}

                    {item.targetModule && (
                      <button
                        type="button"
                        onClick={() => onOpenModule(item.targetModule!)}
                        className="text-[11px] font-semibold text-[#0d4a3e] hover:text-[#b85d2b] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Deschide modul</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

