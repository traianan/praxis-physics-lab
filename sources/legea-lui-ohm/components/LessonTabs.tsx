"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { TheorySection } from "./TheorySection";
import { OhmLab } from "./OhmLab";
import { CircuitLab } from "./CircuitLab";
import { RheostatLab } from "./RheostatLab";
import { MeasureLab } from "./MeasureLab";
import { ProblemsSection } from "./ProblemsSection";
import { Quiz } from "./Quiz";
import { ResourcesSection } from "./ResourcesSection";
import { ConceptMap } from "./ConceptMap";
import { useTheme } from "./ThemeProvider";

const TABS = [
  { id: "teorie", label: "Teorie" },
  { id: "laborator", label: "Laborator U–I" },
  { id: "circuit", label: "Circuit complet" },
  { id: "reostat", label: "Reostat" },
  { id: "masurari", label: "Măsurări" },
  { id: "evaluare", label: "Probleme" },
  { id: "calculatoare", label: "Calculatoare" },
  { id: "verificare", label: "Verificare" },
  { id: "resurse", label: "Resurse" },
  { id: "harta", label: "Harta conceptelor" },
] as const;

export function LessonTabs() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("laborator");
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const { language } = useTheme();

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.slice(1);
      const alias: Record<string, string> = { teorie: "teorie", laborator: "laborator", circuit: "circuit", reostat: "reostat", masurare: "masurari", probleme: "evaluare", verificare: "verificare", resurse: "resurse" };
      const owners: Record<string, string> = { TheorySection: "teorie", OhmLab: "laborator", CircuitLab: "circuit", RheostatLab: "reostat", MeasureLab: "masurari", ResourcesSection: "resurse" };
      const tab = TABS.find((item) => `lesson-tab-${item.id}` === hash || item.id === alias[hash] || item.id === owners[hash.split("-page-tab-")[0]]);
      if (tab) setActive(tab.id);
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const current = TABS.findIndex((tab) => tab.id === active);
    let next = current;
    if (event.key === "ArrowRight") next = (current + 1) % TABS.length;
    else if (event.key === "ArrowLeft") next = (current - 1 + TABS.length) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    else return;
    event.preventDefault();
    setActive(TABS[next].id);
    buttons.current[next]?.focus();
  };

  return (
    <div className="lesson-tabs">
      <div className="lesson-tablist" role="tablist" aria-label="Conținutul lecției" aria-orientation="horizontal">
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            ref={(node) => { buttons.current[index] = node; }}
            id={`lesson-tab-${tab.id}`}
            className={`lesson-tab ${active === tab.id ? "is-active" : ""}`}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            aria-controls="lesson-tab-panel"
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => setActive(tab.id)}
            onKeyDown={handleKeyDown}
          >
            {tab.id === "harta" && language === "en" ? "Concept map" : tab.label}
          </button>
        ))}
      </div>
      <div id="lesson-tab-panel" className="lesson-tab-panel" role="tabpanel" aria-labelledby={`lesson-tab-${active}`} tabIndex={0}>
        {active === "teorie" ? <TheorySection /> : null}
        {active === "laborator" ? <OhmLab /> : null}
        {active === "circuit" ? <CircuitLab /> : null}
        {active === "reostat" ? <RheostatLab /> : null}
        {active === "masurari" ? <MeasureLab /> : null}
        {active === "evaluare" ? <ProblemsSection /> : null}
        {active === "calculatoare" ? <ProblemsSection calculators /> : null}
        {active === "verificare" ? <Quiz /> : null}
        {active === "resurse" ? <ResourcesSection /> : null}
        {active === "harta" ? <ConceptMap onOpenTab={setActive} /> : null}
      </div>
    </div>
  );
}
