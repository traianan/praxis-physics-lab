import React from 'react';
import { ArrowRight } from 'lucide-react';
import { LabModuleId } from '../types/guitar';
import { HARMONIC_DESCRIPTIONS } from '../utils/musicTheory';

type GuideViewProps = {
  onOpenModule: (id: LabModuleId) => void;
};

export const GuideView: React.FC<GuideViewProps> = ({ onOpenModule }) => {
  const sections: Array<{
    moduleId: LabModuleId;
    title: string;
    formula: string;
    summary: string;
  }> = [
    {
      moduleId: 'notes',
      title: '1. Nota muzicală și temperamentul egal',
      formula: 'fₙ = f₀ · 2^(n / 12)   |   A4 = 440 Hz',
      summary:
        'Octava dublează frecvența (raport 2:1) și este împărțită în 12 semitonoane egale, fiecare multiplicând frecvența cu 2^(1/12) ≈ 1,05946.',
    },
    {
      moduleId: 'string',
      title: '2. Fizica corzii fixate la ambele capete',
      formula: 'f₁ = (1 / 2L) · √(T / μ)   |   L_ef = L · 2^(-fret / 12)',
      summary:
        'Frecvența fundamentală crește odată cu tensiunea T și scade cu lungimea L sau cu densitatea lineică μ. Apăsarea unui fret scurtează lungimea vibratoare efectivă.',
    },
    {
      moduleId: 'harmonics',
      title: '3. Seria armonică și poziția ciupirii',
      formula: 'fₙ = n · f₁   |   Aₙ ∝ |sin(nπp)| / n²',
      summary:
        'O coardă vibrează simultan în mai multe moduri proprii. Dacă ciupești la fracția p = 1/5 (deasupra fretului 5), armonica a 5-a are un nod acolo și dispare din timbru.',
    },
    {
      moduleId: 'temperament',
      title: '4. Armonice naturale, sutimi de semiton și bătăi acustice',
      formula: 'sutimi de semiton = 1200 · log₂(f₂ / f₁)   |   f_bătăi = |f₂ − f₁|',
      summary:
        'Quinta pură are raportul exact 3:2 (701,96 sutimi de semiton), în timp ce quinta temperată are 700,00 sutimi de semiton. Diferența de 1,96 sutimi de semiton produce bătăi lente măsurabile.',
    },
    {
      moduleId: 'scales',
      title: '5. Game și intervale pe manșon',
      formula: 'Gamă majoră: T – T – ½ – T – T – T – ½',
      summary:
        'O gamă selectează un set ordonat de intervale față de tonică. Pe chitară, aceeași scară poate fi transpusă translatând tiparul de freturi.',
    },
    {
      moduleId: 'chords',
      title: '6. Acorduri, consonanță și disonanță',
      formula: 'Major: (1, 3M, 5P) · Minor: (1, 3m, 5P) · Septimă: (1, 3M, 5P, 7m)',
      summary:
        'Pentru o triadă majoră în acordaj pur, raportul ideal al frecvențelor este 4:5:6. Pe freturile chitarei, temperamentul egal aproximează acest raport; armonicele nu se suprapun perfect.',
    },
    {
      moduleId: 'spectrum',
      title: '7. Sinteză Karplus–Strong și analiză Fourier (FFT)',
      formula: 'f_bin = k · (f_s / N_FFT)   |   f₀ ≈ f_s / L_buclă',
      summary:
        'Algoritmul Karplus–Strong simulează realist o coardă ciupită printr-un impuls filtrat într-o buclă de întârziere, iar AnalyserNode calculează spectrul pe o axă logaritmică.',
    },
    {
      moduleId: 'sandbox',
      title: '8. Laborator liber și experimente ghidate',
      formula: 'Acordaje multiple · Armonice naturale · Analiză live',
      summary:
        'Combină toate instrumentele laboratorului și rezolvă cele 6 misiuni experimentale de fizică muzicală.',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[#d8e2dc] bg-white p-6 space-y-2">
        <h2 className="text-lg font-bold text-[#13221d]">Ghid teoretic și formule fundamentale</h2>
        <p className="text-sm text-[#53665f] max-w-3xl">
          Sinteza conceptelor de fizică a undelor staționare, acustică muzicală și analiză Fourier aplicate pe chitara acustică virtuală.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((sec) => (
          <div key={sec.moduleId} className="rounded-xl border border-[#d8e2dc] bg-white p-5 flex flex-col justify-between gap-4">
            <div className="space-y-2.5">
              <h3 className="text-base font-semibold text-[#13221d]">{sec.title}</h3>
              <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3 py-2 font-mono text-xs font-semibold text-[#0d4a3e]">
                {sec.formula}
              </div>
              <p className="text-xs text-[#53665f] leading-relaxed">{sec.summary}</p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => onOpenModule(sec.moduleId)}
                className="text-xs font-semibold text-[#0d4a3e] hover:text-[#b85d2b] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Deschide modulul interactiv</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Harmonics reference table */}
      <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-3">
        <h3 className="text-base font-semibold text-[#13221d]">Tabelul primelor 8 armonice ale unei corzi vibrante</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#d8e2dc] text-[#53665f]">
                <th className="py-2 pr-4 font-semibold">Armonic</th>
                <th className="py-2 pr-4 font-semibold">Raport frecvență</th>
                <th className="py-2 pr-4 font-semibold">Interval muzical</th>
                <th className="py-2 font-semibold">Formă de vibrație</th>
              </tr>
            </thead>
            <tbody>
              {HARMONIC_DESCRIPTIONS.map((h) => (
                <tr key={h.n} className="border-b border-[#edf3f0] last:border-b-0">
                  <td className="py-2 pr-4 font-mono font-semibold text-[#13221d] tabular-nums">{h.n}</td>
                  <td className="py-2 pr-4 font-mono text-[#b85d2b] font-semibold">{h.ratio}</td>
                  <td className="py-2 pr-4 text-[#13221d] font-medium">{h.interval}</td>
                  <td className="py-2 text-[#53665f]">{h.shape}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <section className="rounded-xl border border-[#d8e2dc] bg-white p-5 flex flex-wrap items-center justify-between gap-3" data-content-type="resource">
        <div>
          <h3 className="text-base font-semibold text-[#13221d]">Fișa de laborator în format PDF</h3>
          <p className="text-sm text-[#53665f]">Materialul PDF furnizat împreună cu lecția, pentru consultare sau tipărire.</p>
        </div>
        <a className="px-4 py-3 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] text-sm font-semibold text-[#0d4a3e]" href="./assets/aistudio/laboratorul-chitarei_c3c42bc7.pdf" target="_blank" rel="noreferrer" download>
          Descarcă fișa PDF
        </a>
      </section>
    </div>
  );
};
