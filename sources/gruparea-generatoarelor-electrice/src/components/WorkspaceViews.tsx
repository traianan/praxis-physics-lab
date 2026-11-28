import React, { useState } from 'react';
import { ArrowRight, BookOpen, Search } from 'lucide-react';
import { FORMULA_SECTIONS, GLOSSARY_TERMS } from '../data/lessonContent';
import { ModuleTabId } from '../types/physics';
import { soundEngine } from '../utils/sound';

interface FormulasGuideViewProps {
  onJumpToModule: (tab: ModuleTabId) => void;
}

export const FormulasGuideView: React.FC<FormulasGuideViewProps> = ({ onJumpToModule }) => {
  const moduleForSection: ModuleTabId[] = ['basic', 'series', 'parallel', 'mixed'];
  const [activeSection, setActiveSection] = useState(0);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#E4E2D8] bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#17231E]">
            Ghid complet de teorie și formule
          </h2>
          <p className="text-sm text-[#4E5D56]">
            Sinteză structurată pentru pregătirea lecției, rezolvarea problemelor și verificarea în simulator.
          </p>
        </div>
        <button
          onClick={() => {
            soundEngine.playClick();
            onJumpToModule('calculator');
          }}
          className="inline-flex items-center gap-1.5 min-h-[42px] px-4 py-2 rounded-xl bg-[#0F4C3A] text-white text-sm font-semibold hover:bg-[#0A382B] whitespace-nowrap shrink-0"
        >
          Deschide calculatorul echivalent <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1" role="tablist" aria-label="Teme de formule">
        {FORMULA_SECTIONS.map((sec, idx) => (
          <button
            key={sec.title}
            type="button"
            role="tab"
            aria-selected={activeSection === idx}
            onClick={() => setActiveSection(idx)}
            className={`min-h-[48px] px-4 py-2 rounded-xl border text-sm font-semibold whitespace-nowrap shrink-0 ${activeSection === idx ? 'border-[#0F4C3A] bg-[#0F4C3A] text-white' : 'border-[#E4E2D8] bg-white text-[#17231E]'}`}
          >
            {sec.title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4" role="tabpanel">
        {FORMULA_SECTIONS.map((sec, idx) => idx === activeSection && (
          <div
            key={sec.title}
            className="rounded-2xl border border-[#E4E2D8] bg-white p-5 flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#0F4C3A]">{sec.title}</h3>
              <div className="space-y-2.5">
                {sec.items.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-[#EFECE3] bg-[#FCFBF8] px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
                  >
                    <span className="text-xs font-medium text-[#4E5D56]">{item.label}</span>
                    <span className="text-sm font-mono font-bold text-[#17231E] tabular-nums">
                      {item.eq}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#EFECE3] flex justify-end">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onJumpToModule(moduleForSection[idx] ?? 'basic');
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F4C3A] hover:underline"
              >
                Testează în simulator <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pedagogical reminder about internal resistance */}
      <div className="rounded-2xl border border-[#DCE6E1] bg-[#F4F8F6] p-5 text-sm text-[#17231E] space-y-1.5">
        <div className="font-bold text-[#0F4C3A] flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Observație esențială de modelare fizică
        </div>
        <p className="text-[#4E5D56] leading-relaxed">
          Rezistența internă <span className="font-mono font-semibold text-[#17231E]">r</span> nu este o piesă montată separat în exteriorul bateriei, ci reprezintă rezistența internă a materialelor active și a electrolitului din sursă. În schemele noastre, <span className="font-mono font-semibold text-[#17231E]">r</span> este inclusă direct în simbolul generatorului.
        </p>
      </div>
    </div>
  );
};

interface DictionaryViewProps {
  onJumpToModule: (tab: ModuleTabId) => void;
}

export const DictionaryView: React.FC<DictionaryViewProps> = ({ onJumpToModule }) => {
  const [query, setQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState<ModuleTabId | 'all'>('basic');
  const topics: { id: ModuleTabId | 'all'; label: string }[] = [
    { id: 'all', label: 'Toți termenii' },
    { id: 'basic', label: 'De bază' },
    { id: 'series', label: 'Serie' },
    { id: 'parallel', label: 'Paralel' },
    { id: 'mixed', label: 'Mixt' },
    { id: 'examples', label: 'Aplicații' },
  ];

  const filtered = GLOSSARY_TERMS.filter(
    (t) => (activeTopic === 'all' || t.relatedModule === activeTopic) && (
      t.term.toLowerCase().includes(query.toLowerCase()) ||
      t.definition.toLowerCase().includes(query.toLowerCase()) ||
      t.symbol.toLowerCase().includes(query.toLowerCase())
    )
  );

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#E4E2D8] bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#17231E]">Dicționar de termeni și mărimi fizice</h2>
          <p className="text-sm text-[#4E5D56]">
            Caută definiții, simboluri, unități de măsură SI și legături directe cu experimentele.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Caută termen (ex: Millman, opoziție)..."
            className="w-full min-h-[42px] pl-9 pr-3 rounded-xl border border-[#D4D9D5] bg-[#FCFBF8] text-sm text-[#17231E] focus:outline-none focus:border-[#0F4C3A]"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1" role="tablist" aria-label="Teme din dicționar">
        {topics.map((topic) => (
          <button
            key={topic.id}
            type="button"
            role="tab"
            aria-selected={activeTopic === topic.id}
            onClick={() => setActiveTopic(topic.id)}
            className={`min-h-[48px] px-4 py-2 rounded-xl border text-sm font-semibold whitespace-nowrap shrink-0 ${activeTopic === topic.id ? 'border-[#0F4C3A] bg-[#0F4C3A] text-white' : 'border-[#E4E2D8] bg-white text-[#17231E]'}`}
          >
            {topic.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#E4E2D8] bg-white p-8 text-center text-sm text-[#4E5D56]">
          Nu s-a găsit niciun termen pentru „{query}”.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[#E4E2D8] bg-white p-5 flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                <div className="text-xs font-medium text-[#4E5D56]">
                  Simbol: <span className="font-mono font-bold text-[#0F4C3A]">{item.symbol}</span> · Unitate SI: {item.unit}
                </div>
                <h3 className="text-base font-bold text-[#17231E]">{item.term}</h3>
                <p className="text-sm text-[#4E5D56] leading-relaxed">{item.definition}</p>
                {item.formula && (
                  <div className="rounded-lg bg-[#FCFBF8] border border-[#EFECE3] px-3 py-2 text-xs font-mono font-semibold text-[#17231E]">
                    {item.formula}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#EFECE3]">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onJumpToModule(item.relatedModule);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F4C3A] hover:underline"
                >
                  {item.relatedLabel} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
